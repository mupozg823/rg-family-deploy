/**
 * 개발 서버 메모리 모니터링 및 자동 재시작 스크립트
 *
 * 메모리 임계치를 초과하면 자동으로 개발 서버를 재시작한다.
 * - 임계치: 1.5GB (환경변수로 조정 가능)
 * - 체크 간격: 30초
 */

import { spawn, ChildProcess } from 'child_process'
import { platform } from 'os'

// 설정
const MEMORY_THRESHOLD_MB = parseInt(process.env.DEV_MEMORY_THRESHOLD_MB || '1500', 10)
const CHECK_INTERVAL_MS = parseInt(process.env.DEV_MEMORY_CHECK_INTERVAL_MS || '30000', 10)
const NODE_MAX_OLD_SPACE_MB = parseInt(process.env.NODE_MAX_OLD_SPACE_MB || '2048', 10)

let devProcess: ChildProcess | null = null
let isRestarting = false

function formatMemory(mb: number): string {
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)}GB`
  }
  return `${mb}MB`
}

function getTimestamp(): string {
  return new Date().toLocaleTimeString('ko-KR', { hour12: false })
}

function log(message: string, type: 'info' | 'warn' | 'error' = 'info'): void {
  const prefix = {
    info: '\x1b[36m[Monitor]\x1b[0m',
    warn: '\x1b[33m[Monitor]\x1b[0m',
    error: '\x1b[31m[Monitor]\x1b[0m',
  }
  console.log(`${prefix[type]} ${getTimestamp()} ${message}`)
}

async function getProcessMemoryMB(pid: number): Promise<number> {
  return new Promise((resolve) => {
    const isWindows = platform() === 'win32'
    const cmd = isWindows ? 'tasklist' : 'ps'
    const args = isWindows ? ['/FI', `PID eq ${pid}`, '/FO', 'CSV', '/NH'] : ['-o', 'rss=', '-p', String(pid)]

    const proc = spawn(cmd, args)
    let output = ''

    proc.stdout.on('data', (data) => {
      output += data.toString()
    })

    proc.on('close', () => {
      try {
        if (isWindows) {
          // Windows: "node.exe","12345","Console","1","123,456 K"
          const match = output.match(/"([0-9,]+)\s*K"/)
          if (match) {
            const kb = parseInt(match[1].replace(/,/g, ''), 10)
            resolve(Math.round(kb / 1024))
            return
          }
        } else {
          // Unix: RSS in KB
          const rss = parseInt(output.trim(), 10)
          if (!isNaN(rss)) {
            resolve(Math.round(rss / 1024))
            return
          }
        }
      } catch {
        // 파싱 실패
      }
      resolve(0)
    })
  })
}

function startDevServer(): void {
  log(`Starting Next.js dev server (max-old-space: ${NODE_MAX_OLD_SPACE_MB}MB)...`)

  const nodeOptions = `--max-old-space-size=${NODE_MAX_OLD_SPACE_MB}`
  const existingNodeOptions = process.env.NODE_OPTIONS || ''
  const combinedNodeOptions = existingNodeOptions
    ? `${existingNodeOptions} ${nodeOptions}`
    : nodeOptions

  devProcess = spawn('npx', ['next', 'dev'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_OPTIONS: combinedNodeOptions,
    },
  })

  devProcess.on('exit', (code, signal) => {
    if (!isRestarting) {
      log(`Dev server exited (code: ${code}, signal: ${signal})`, code === 0 ? 'info' : 'warn')
      process.exit(code || 0)
    }
  })

  devProcess.on('error', (err) => {
    log(`Dev server error: ${err.message}`, 'error')
  })
}

async function restartDevServer(): Promise<void> {
  if (isRestarting) return
  isRestarting = true

  log('Memory threshold exceeded. Restarting server...', 'warn')

  if (devProcess) {
    devProcess.kill('SIGTERM')

    // 프로세스 종료 대기 (최대 5초)
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        if (devProcess && !devProcess.killed) {
          devProcess.kill('SIGKILL')
        }
        resolve()
      }, 5000)

      devProcess?.on('exit', () => {
        clearTimeout(timeout)
        resolve()
      })
    })
  }

  // 잠시 대기 후 재시작
  await new Promise((r) => setTimeout(r, 1000))

  isRestarting = false
  startDevServer()
}

async function checkMemory(): Promise<void> {
  if (!devProcess?.pid || isRestarting) return

  const memoryMB = await getProcessMemoryMB(devProcess.pid)

  if (memoryMB > 0) {
    const usage = formatMemory(memoryMB)
    const threshold = formatMemory(MEMORY_THRESHOLD_MB)
    const percent = Math.round((memoryMB / MEMORY_THRESHOLD_MB) * 100)

    if (memoryMB > MEMORY_THRESHOLD_MB) {
      log(`Memory: ${usage} / ${threshold} (${percent}%) - EXCEEDED`, 'warn')
      await restartDevServer()
    } else if (percent >= 80) {
      log(`Memory: ${usage} / ${threshold} (${percent}%) - HIGH`, 'warn')
    } else {
      log(`Memory: ${usage} / ${threshold} (${percent}%)`)
    }
  }
}

// 시그널 핸들링
process.on('SIGINT', () => {
  log('Received SIGINT. Shutting down...')
  if (devProcess) {
    devProcess.kill('SIGTERM')
  }
  process.exit(0)
})

process.on('SIGTERM', () => {
  log('Received SIGTERM. Shutting down...')
  if (devProcess) {
    devProcess.kill('SIGTERM')
  }
  process.exit(0)
})

// 메인 실행
console.log('')
log('='.repeat(50))
log('RG Family Dev Server Monitor')
log(`Memory threshold: ${formatMemory(MEMORY_THRESHOLD_MB)}`)
log(`Check interval: ${CHECK_INTERVAL_MS / 1000}s`)
log(`Node max-old-space: ${formatMemory(NODE_MAX_OLD_SPACE_MB)}`)
log('='.repeat(50))
console.log('')

startDevServer()

// 메모리 체크 루프 시작 (첫 체크는 30초 후)
setTimeout(() => {
  void checkMemory()
  setInterval(() => void checkMemory(), CHECK_INTERVAL_MS)
}, CHECK_INTERVAL_MS)
