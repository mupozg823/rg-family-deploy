'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X, Trash2 } from 'lucide-react'
import styles from './CsvUploader.module.css'

interface CsvRow {
  [key: string]: string
}

interface CsvUploaderProps {
  onUpload: (data: CsvRow[]) => Promise<{ success: number; errors: string[] }>
  columns: { key: string; label: string; required?: boolean }[]
  sampleFile?: string
}

export default function CsvUploader({ onUpload, columns, sampleFile }: CsvUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [parsedData, setParsedData] = useState<CsvRow[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ success: number; errors: string[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCSV = useCallback((text: string): CsvRow[] => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    const data: CsvRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      const row: CsvRow = {}
      headers.forEach((header, idx) => {
        row[header] = values[idx] || ''
      })
      data.push(row)
    }

    return data
  }, [])

  const validateData = useCallback((data: CsvRow[]): string[] => {
    const errors: string[] = []
    const requiredColumns = columns.filter(c => c.required).map(c => c.key)

    data.forEach((row, idx) => {
      requiredColumns.forEach(col => {
        if (!row[col] || row[col].trim() === '') {
          errors.push(`Row ${idx + 2}: Missing required field "${col}"`)
        }
      })
    })

    return errors
  }, [columns])

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      setErrors(['CSV 파일만 업로드 가능합니다.'])
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const data = parseCSV(text)
      const validationErrors = validateData(data)

      setParsedData(data)
      setErrors(validationErrors)
      setUploadResult(null)
    }
    reader.readAsText(file)
  }, [parseCSV, validateData])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleUpload = async () => {
    if (parsedData.length === 0 || errors.length > 0) return

    setIsUploading(true)
    try {
      const result = await onUpload(parsedData)
      setUploadResult(result)
      if (result.success > 0 && result.errors.length === 0) {
        setParsedData([])
      }
    } catch (error) {
      setUploadResult({
        success: 0,
        errors: ['업로드 중 오류가 발생했습니다.'],
      })
    }
    setIsUploading(false)
  }

  const handleClear = () => {
    setParsedData([])
    setErrors([])
    setUploadResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={styles.container}>
      {/* Drop Zone */}
      <div
        className={`${styles.dropZone} ${isDragOver ? styles.dragOver : ''} ${parsedData.length > 0 ? styles.hasData : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className={styles.fileInput}
        />

        {parsedData.length === 0 ? (
          <>
            <Upload size={40} className={styles.uploadIcon} />
            <p className={styles.dropText}>
              CSV 파일을 드래그하거나 클릭하여 선택
            </p>
            <p className={styles.dropHint}>
              {columns.map(c => c.label).join(', ')} 컬럼이 포함되어야 합니다
            </p>
            {sampleFile && (
              <a
                href={sampleFile}
                download
                className={styles.sampleLink}
                onClick={(e) => e.stopPropagation()}
              >
                <FileSpreadsheet size={14} />
                샘플 파일 다운로드
              </a>
            )}
          </>
        ) : (
          <div className={styles.fileInfo}>
            <FileSpreadsheet size={32} className={styles.fileIcon} />
            <div>
              <p className={styles.fileCount}>{parsedData.length}개 데이터</p>
              <p className={styles.fileHint}>다시 클릭하여 파일 변경</p>
            </div>
            <button
              className={styles.clearButton}
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Errors */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            className={styles.errorBox}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className={styles.errorHeader}>
              <AlertCircle size={18} />
              <span>검증 오류 ({errors.length}개)</span>
            </div>
            <ul className={styles.errorList}>
              {errors.slice(0, 5).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
              {errors.length > 5 && (
                <li className={styles.moreErrors}>
                  ... 외 {errors.length - 5}개 오류
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Table */}
      {parsedData.length > 0 && errors.length === 0 && (
        <div className={styles.previewSection}>
          <h4 className={styles.previewTitle}>미리보기 (처음 5개)</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.previewTable}>
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col.key}>
                      {col.label}
                      {col.required && <span className={styles.required}>*</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 5).map((row, idx) => (
                  <tr key={idx}>
                    {columns.map(col => (
                      <td key={col.key}>{row[col.key] || '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Result */}
      <AnimatePresence>
        {uploadResult && (
          <motion.div
            className={`${styles.resultBox} ${uploadResult.errors.length === 0 ? styles.success : styles.error}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {uploadResult.errors.length === 0 ? (
              <>
                <CheckCircle size={20} />
                <span>{uploadResult.success}개 데이터가 성공적으로 등록되었습니다.</span>
              </>
            ) : (
              <>
                <AlertCircle size={20} />
                <div>
                  <p>{uploadResult.success}개 성공, {uploadResult.errors.length}개 실패</p>
                  <ul className={styles.resultErrors}>
                    {uploadResult.errors.slice(0, 3).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            <button
              className={styles.closeResult}
              onClick={() => setUploadResult(null)}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Button */}
      {parsedData.length > 0 && (
        <button
          className={styles.uploadButton}
          onClick={handleUpload}
          disabled={isUploading || errors.length > 0}
        >
          {isUploading ? (
            <>
              <div className={styles.spinner} />
              업로드 중...
            </>
          ) : (
            <>
              <Upload size={18} />
              {parsedData.length}개 데이터 업로드
            </>
          )}
        </button>
      )}
    </div>
  )
}
