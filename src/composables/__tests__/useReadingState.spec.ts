import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useReadingState } from '../useReadingState'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useReadingState - Individual Book Status', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('should get book status', () => {
    // Setup: Save a status first
    const { setBookStatus, getBookStatus } = useReadingState()
    setBookStatus(1, 'currently-reading')

    // Act
    const status = getBookStatus(1)

    // Assert
    expect(status).toBe('currently-reading')
  })

  it('should return undefined for book without status', () => {
    const { getBookStatus } = useReadingState()

    const status = getBookStatus(999)

    expect(status).toBeUndefined()
  })

  it('should set book status', () => {
    const { setBookStatus, getBookStatus } = useReadingState()

    // Act
    setBookStatus(5, 'read')

    // Assert
    const status = getBookStatus(5)
    expect(status).toBe('read')
  })

  it('should update existing book status', () => {
    const { setBookStatus, getBookStatus } = useReadingState()

    // Set initial status
    setBookStatus(10, 'to-read')
    expect(getBookStatus(10)).toBe('to-read')

    // Update status
    setBookStatus(10, 'read')
    expect(getBookStatus(10)).toBe('read')
  })

  it('should remove book status', () => {
    const { setBookStatus, removeBookStatus, getBookStatus } = useReadingState()

    // Setup: Add a status
    setBookStatus(7, 'currently-reading')
    expect(getBookStatus(7)).toBe('currently-reading')

    // Act: Remove status
    removeBookStatus(7)

    // Assert
    expect(getBookStatus(7)).toBeUndefined()
  })

  it('should get all statuses', () => {
    const { setBookStatus, getAllStatuses } = useReadingState()

    // Setup: Add multiple statuses
    setBookStatus(1, 'to-read')
    setBookStatus(2, 'currently-reading')
    setBookStatus(3, 'read')

    // Act
    const allStatuses = getAllStatuses()

    // Assert
    expect(allStatuses).toEqual({
      1: 'to-read',
      2: 'currently-reading',
      3: 'read',
    })
  })

  it('should persist status across composable instances', () => {
    // First instance
    const { setBookStatus } = useReadingState()
    setBookStatus(42, 'currently-reading')

    // Second instance (simulating component remount)
    const { getBookStatus } = useReadingState()
    const status = getBookStatus(42)

    expect(status).toBe('currently-reading')
  })

  it('should handle setting status for multiple books', () => {
    const { setBookStatus, getBookStatus } = useReadingState()

    setBookStatus(1, 'to-read')
    setBookStatus(2, 'currently-reading')
    setBookStatus(3, 'read')

    expect(getBookStatus(1)).toBe('to-read')
    expect(getBookStatus(2)).toBe('currently-reading')
    expect(getBookStatus(3)).toBe('read')
  })
})

