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

  return {
    readingState,
    loadState,
    saveState,
    clearState,
  }
}
