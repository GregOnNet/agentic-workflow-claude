import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useBookDetail } from '../useBookDetail'

describe('useBookDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should fetch book data successfully', async () => {
    const mockBook = {
      id: 1,
      title: 'Test Book',
      author: 'Test Author',
      cover: 'https://example.com/cover.jpg',
      description: 'Test description',
      year: 2024,
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockBook),
      } as Response),
    )

    const bookId = ref(1)
    const { book, isLoading, error } = useBookDetail(bookId)

    // Initially loading
    expect(isLoading.value).toBe(true)

    // Wait for fetch to complete
    await vi.waitFor(() => expect(isLoading.value).toBe(false))

    expect(book.value).toEqual(mockBook)
    expect(error.value).toBeNull()
    expect(global.fetch).toHaveBeenCalledExactlyOnceWith('http://localhost:4730/books/1')
  })

  it('should handle 404 error', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
      } as Response),
    )

    const bookId = ref(999)
    const { book, error, isLoading } = useBookDetail(bookId)

    await vi.waitFor(() => expect(isLoading.value).toBe(false))

    expect(book.value).toBeNull()
    expect(error.value).not.toBeNull()
    expect(error.value?.message).toContain('not found')
  })

  it('should handle server error', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      } as Response),
    )

    const bookId = ref(1)
    const { book, error, isLoading } = useBookDetail(bookId)

    await vi.waitFor(() => expect(isLoading.value).toBe(false))

    expect(book.value).toBeNull()
    expect(error.value).not.toBeNull()
    expect(error.value?.message).toContain('HTTP error')
  })

  it('should handle invalid book ID', async () => {
    const bookId = ref(0)
    const { book, error, isLoading } = useBookDetail(bookId)

    await vi.waitFor(() => expect(isLoading.value).toBe(false))

    expect(book.value).toBeNull()
    expect(error.value).not.toBeNull()
    expect(error.value?.message).toContain('Invalid book ID')
  })

  it('should refetch when bookId changes', async () => {
    const mockBook1 = {
      id: 1,
      title: 'Book 1',
      author: 'Author 1',
    }
    const mockBook2 = {
      id: 2,
      title: 'Book 2',
      author: 'Author 2',
    }

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBook1),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBook2),
      } as Response)

    const bookId = ref(1)
    const { book, isLoading } = useBookDetail(bookId)

    await vi.waitFor(() => expect(isLoading.value).toBe(false))
    expect(book.value).toEqual(mockBook1)

    // Change bookId
    bookId.value = 2

    await vi.waitFor(() => expect(isLoading.value).toBe(false))
    expect(book.value).toEqual(mockBook2)
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('should handle network error', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))

    const bookId = ref(1)
    const { book, error, isLoading } = useBookDetail(bookId)

    await vi.waitFor(() => expect(isLoading.value).toBe(false))

    expect(book.value).toBeNull()
    expect(error.value).not.toBeNull()
    expect(error.value?.message).toContain('Network error')
  })
})

