import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import BookDetailView from '../BookDetailView.vue'

// Mock the composables
vi.mock('@/composables/useBookDetail', () => ({
  useBookDetail: vi.fn(() => ({
    book: { value: null },
    isLoading: { value: true },
    error: { value: null },
    fetchBook: vi.fn(),
    refetch: vi.fn(),
  })),
}))

vi.mock('@/composables/useReadingState', () => ({
  useReadingState: vi.fn(() => ({
    getBookStatus: vi.fn(() => undefined),
    setBookStatus: vi.fn(),
    removeBookStatus: vi.fn(),
    getAllStatuses: vi.fn(() => ({})),
  })),
}))

vi.mock('@/composables/useErrorHandler', () => ({
  useErrorHandler: vi.fn(() => ({
    error: { value: null },
    handleError: vi.fn(),
    clearError: vi.fn(),
  })),
}))

describe('BookDetailView', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(async () => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/books/:id',
          name: 'book-detail',
          component: BookDetailView,
        },
      ],
    })

    await router.push('/books/1')
    await router.isReady()
  })

  it('should render loading state', () => {
    const wrapper = mount(BookDetailView, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Loading book details')
  })

  it('should render book details when loaded', async () => {
    const { useBookDetail } = await import('@/composables/useBookDetail')
    const { ref } = await import('vue')
    vi.mocked(useBookDetail).mockReturnValueOnce({
      book: ref({
        id: 1,
        title: 'Test Book',
        author: 'Test Author',
        year: 2024,
        description: 'Test description',
        cover: 'https://example.com/cover.jpg',
      }),
      isLoading: ref(false),
      error: ref(null),
      fetchBook: vi.fn(),
      refetch: vi.fn(),
    })

    const wrapper = mount(BookDetailView, {
      global: {
        plugins: [router],
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Test Book')
    expect(wrapper.text()).toContain('Test Author')
    expect(wrapper.text()).toContain('2024')
  })

  it('should render error state', async () => {
    const { useBookDetail } = await import('@/composables/useBookDetail')
    const { ref } = await import('vue')
    vi.mocked(useBookDetail).mockReturnValueOnce({
      book: ref(null),
      isLoading: ref(false),
      error: ref(new Error('Book not found')),
      fetchBook: vi.fn(),
      refetch: vi.fn(),
    })

    const wrapper = mount(BookDetailView, {
      global: {
        plugins: [router],
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Error')
    expect(wrapper.text()).toContain('Book not found')
  })

  it('should handle back button click', async () => {
    const { useBookDetail } = await import('@/composables/useBookDetail')
    const { ref } = await import('vue')
    vi.mocked(useBookDetail).mockReturnValueOnce({
      book: ref({
        id: 1,
        title: 'Test Book',
        author: 'Test Author',
      }),
      isLoading: ref(false),
      error: ref(null),
      fetchBook: vi.fn(),
      refetch: vi.fn(),
    })

    const wrapper = mount(BookDetailView, {
      global: {
        plugins: [router],
      },
    })

    await flushPromises()

    const backButton = wrapper.find('button[aria-label="Back to book list"]')
    expect(backButton.exists()).toBe(true)

    const routerBackSpy = vi.spyOn(router, 'back')
    await backButton.trigger('click')

    expect(routerBackSpy).toHaveBeenCalled()
  })

  it('should display reading status selector', async () => {
    const { useBookDetail } = await import('@/composables/useBookDetail')
    const { ref } = await import('vue')
    vi.mocked(useBookDetail).mockReturnValueOnce({
      book: ref({
        id: 1,
        title: 'Test Book',
        author: 'Test Author',
      }),
      isLoading: ref(false),
      error: ref(null),
      fetchBook: vi.fn(),
      refetch: vi.fn(),
    })

    const wrapper = mount(BookDetailView, {
      global: {
        plugins: [router],
      },
    })

    await flushPromises()

    const statusSelect = wrapper.find('select#reading-status')
    expect(statusSelect.exists()).toBe(true)
    expect(statusSelect.element.tagName).toBe('SELECT')
  })

  it('should handle missing optional fields gracefully', async () => {
    const { useBookDetail } = await import('@/composables/useBookDetail')
    const { ref } = await import('vue')
    vi.mocked(useBookDetail).mockReturnValueOnce({
      book: ref({
        id: 1,
        title: 'Minimal Book',
        author: 'Minimal Author',
        // No year, description, or cover
      }),
      isLoading: ref(false),
      error: ref(null),
      fetchBook: vi.fn(),
      refetch: vi.fn(),
    })

    const wrapper = mount(BookDetailView, {
      global: {
        plugins: [router],
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Minimal Book')
    expect(wrapper.text()).toContain('Minimal Author')
    expect(wrapper.text()).toContain('No description available')
  })
})
