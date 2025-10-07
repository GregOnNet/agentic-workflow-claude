import { ref } from 'vue'
import type { BookColumn, BookReadingState } from '../types'
import {
  clearReadingState,
  columnsToReadingState,
  loadReadingState,
  saveReadingState,
} from '../utils/localStorage'
import { useErrorHandler } from './useErrorHandler'

export function useReadingState() {
  const readingState = ref<BookReadingState>({})
  const { safeExecute } = useErrorHandler()

  function loadState() {
    return safeExecute(
      () => {
        console.log('Loading reading state from localStorage...')
        readingState.value = loadReadingState()
        console.log('Loaded reading state:', readingState.value)
        return readingState.value
      },
      'useReadingState.loadState',
      {}, // Fallback to empty state if error
    ) as BookReadingState
  }

  function saveState(columns: BookColumn[]) {
    return safeExecute(
      () => {
        console.log('Saving state for columns:', columns)
        const state = columnsToReadingState(columns)
        saveReadingState(state)
        readingState.value = state
        console.log('Updated reading state:', readingState.value)
        return readingState.value
      },
      'useReadingState.saveState',
      readingState.value, // Fallback to current state if error
    ) as BookReadingState
  }

  function clearState() {
    return safeExecute(
      () => {
        console.log('Clearing reading state...')
        clearReadingState()
        readingState.value = {}
        return readingState.value
      },
      'useReadingState.clearState',
      {},
    ) as BookReadingState
  }

  // Individual book status management
  function getBookStatus(bookId: number): string | undefined {
    return safeExecute(
      () => {
        const state = loadReadingState()
        return state[bookId]?.status
      },
      'useReadingState.getBookStatus',
      undefined,
    ) as string | undefined
  }

  function setBookStatus(bookId: number, status: 'to-read' | 'currently-reading' | 'read') {
    return safeExecute(
      () => {
        const state = loadReadingState()
        const maxOrder =
          Math.max(0, ...Object.values(state).map((item) => item?.order || 0)) + 1
        state[bookId] = { status, order: state[bookId]?.order ?? maxOrder }
        saveReadingState(state)
        readingState.value = state
        console.log(`Set book ${bookId} status to ${status}`)
      },
      'useReadingState.setBookStatus',
    )
  }

  function removeBookStatus(bookId: number) {
    return safeExecute(
      () => {
        const state = loadReadingState()
        delete state[bookId]
        saveReadingState(state)
        readingState.value = state
        console.log(`Removed status for book ${bookId}`)
      },
      'useReadingState.removeBookStatus',
    )
  }

  function getAllStatuses(): BookReadingState {
    return safeExecute(
      () => {
        return loadReadingState()
      },
      'useReadingState.getAllStatuses',
      {},
    ) as BookReadingState
  }

  return {
    readingState,
    loadState,
    saveState,
    clearState,
    getBookStatus,
    setBookStatus,
    removeBookStatus,
    getAllStatuses,
  }
}
