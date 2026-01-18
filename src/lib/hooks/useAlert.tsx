'use client'

import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react'
import AlertModal, { AlertType } from '@/components/admin/AlertModal'
import ConfirmModal from '@/components/admin/ConfirmModal'

interface AlertState {
  isOpen: boolean
  title?: string
  message: string
  type: AlertType
}

interface ConfirmState {
  isOpen: boolean
  title: string
  message: string
  variant: 'danger' | 'warning' | 'info'
  confirmText: string
  cancelText: string
}

interface AlertContextValue {
  showAlert: (message: string, type?: AlertType, title?: string) => void
  showError: (message: string, title?: string) => void
  showSuccess: (message: string, title?: string) => void
  showWarning: (message: string, title?: string) => void
  showInfo: (message: string, title?: string) => void
  showConfirm: (
    message: string,
    options?: {
      title?: string
      variant?: 'danger' | 'warning' | 'info'
      confirmText?: string
      cancelText?: string
    }
  ) => Promise<boolean>
}

const AlertContext = createContext<AlertContextValue | null>(null)

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertState>({
    isOpen: false,
    message: '',
    type: 'info',
  })

  const [confirm, setConfirm] = useState<ConfirmState>({
    isOpen: false,
    title: '확인',
    message: '',
    variant: 'danger',
    confirmText: '확인',
    cancelText: '취소',
  })

  const confirmResolveRef = useRef<((value: boolean) => void) | null>(null)

  const showAlert = useCallback((message: string, type: AlertType = 'info', title?: string) => {
    setAlert({ isOpen: true, message, type, title })
  }, [])

  const showError = useCallback((message: string, title?: string) => {
    showAlert(message, 'error', title)
  }, [showAlert])

  const showSuccess = useCallback((message: string, title?: string) => {
    showAlert(message, 'success', title)
  }, [showAlert])

  const showWarning = useCallback((message: string, title?: string) => {
    showAlert(message, 'warning', title)
  }, [showAlert])

  const showInfo = useCallback((message: string, title?: string) => {
    showAlert(message, 'info', title)
  }, [showAlert])

  const closeAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const showConfirm = useCallback(
    (
      message: string,
      options?: {
        title?: string
        variant?: 'danger' | 'warning' | 'info'
        confirmText?: string
        cancelText?: string
      }
    ): Promise<boolean> => {
      return new Promise((resolve) => {
        confirmResolveRef.current = resolve
        setConfirm({
          isOpen: true,
          message,
          title: options?.title || '확인',
          variant: options?.variant || 'danger',
          confirmText: options?.confirmText || '삭제',
          cancelText: options?.cancelText || '취소',
        })
      })
    },
    []
  )

  const handleConfirm = useCallback(() => {
    confirmResolveRef.current?.(true)
    confirmResolveRef.current = null
    setConfirm((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const handleCancel = useCallback(() => {
    confirmResolveRef.current?.(false)
    confirmResolveRef.current = null
    setConfirm((prev) => ({ ...prev, isOpen: false }))
  }, [])

  return (
    <AlertContext.Provider
      value={{ showAlert, showError, showSuccess, showWarning, showInfo, showConfirm }}
    >
      {children}
      <AlertModal
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
      <ConfirmModal
        isOpen={confirm.isOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title={confirm.title}
        message={confirm.message}
        variant={confirm.variant}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
      />
    </AlertContext.Provider>
  )
}

export function useAlert() {
  const context = useContext(AlertContext)
  if (!context) {
    // Fallback to native alert/confirm if provider not found
    return {
      showAlert: (message: string) => alert(message),
      showError: (message: string) => alert(message),
      showSuccess: (message: string) => alert(message),
      showWarning: (message: string) => alert(message),
      showInfo: (message: string) => alert(message),
      showConfirm: (message: string) => Promise.resolve(confirm(message)),
    }
  }
  return context
}
