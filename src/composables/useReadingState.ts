import { ref } from 'vue'
import type { BookColumn, BookReadingState } from '../types'
import {
  clearReadingState,
  columnsToReadingState,
  loadReadingState,
  saveReadingState,
} from '../utils/localStorage'

export function useReadingState() {
  const readingState = ref<BookReadingState>({})

  function loadState() {
    console.log('Loading reading state from localStorage...')
    readingState.value = loadReadingState()
    console.log('Loaded reading state:', readingState.value)
    return readingState.value
  }

  function saveState(columns: BookColumn[]) {
    console.log('Saving state for columns:', columns)
    const state = columnsToReadingState(columns)
    saveReadingState(state)
    readingState.value = state
    console.log('Updated reading state:', readingState.value)
    return readingState.value
  }

  function clearState() {
    console.log('Clearing reading state...')
    clearReadingState()
    readingState.value = {}
    return readingState.value
  }

  return {
    readingState,
    loadState,
    saveState,
    clearState,
  }
}
