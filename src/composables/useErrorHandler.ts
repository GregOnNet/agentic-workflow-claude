import { ref } from 'vue'

export interface ErrorLog {
  error: Error
  timestamp: Date
  context?: string
}

export function useErrorHandler() {
  const error = ref<Error | null>(null)
  const errorHistory = ref<ErrorLog[]>([])

  function handleError(err: Error | unknown, context?: string) {
    const errorObj = err instanceof Error ? err : new Error(String(err))
    error.value = errorObj

    errorHistory.value.push({
      error: errorObj,
      timestamp: new Date(),
      context,
    })

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error(`Error in ${context || 'unknown'}:`, errorObj)
    }

    // In production, you would send to error tracking service
    if (import.meta.env.PROD) {
      // Example: trackError(errorObj, { context })
    }
  }

  function clearError() {
    error.value = null
  }

  function clearHistory() {
    errorHistory.value = []
  }

  /**
   * Wraps an async function with error handling
   */
  async function withErrorHandling<T>(
    fn: () => Promise<T>,
    context: string,
    options?: {
      showError?: boolean
      rethrow?: boolean
    },
  ): Promise<T | null> {
    try {
      return await fn()
    } catch (err) {
      handleError(err as Error, context)

      if (options?.rethrow) {
        throw err
      }

      return null
    }
  }

  /**
   * Wraps a synchronous function with error handling
   */
  function safeExecute<T>(fn: () => T, context: string, fallback?: T): T | undefined {
    try {
      return fn()
    } catch (err) {
      handleError(err as Error, context)
      return fallback
    }
  }

  /**
   * Creates a wrapper function that automatically handles errors
   */
  function wrapWithErrorHandler<T extends (...args: any[]) => any>(fn: T, context: string): T {
    return ((...args: any[]) => {
      try {
        const result = fn(...args)

        // Handle async functions
        if (result instanceof Promise) {
          return result.catch((err) => {
            handleError(err, context)
            throw err
          })
        }

        return result
      } catch (err) {
        handleError(err as Error, context)
        throw err
      }
    }) as T
  }

  return {
    error,
    errorHistory,
    handleError,
    clearError,
    clearHistory,
    withErrorHandling,
    safeExecute,
    wrapWithErrorHandler,
  }
}
