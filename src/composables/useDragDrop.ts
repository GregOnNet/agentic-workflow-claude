import type { BookColumn } from '../types'

export interface DragEndEvent {
  from: HTMLElement
  to: HTMLElement
  item: HTMLElement
  newIndex: number
  oldIndex: number
}

export function useDragDrop(
  columns: BookColumn[],
  onStatusChange: (bookId: number, status: 'to-read' | 'currently-reading' | 'read') => void,
  saveColumnsState: () => void,
) {
  function handleDragEnd(event: DragEndEvent) {
    console.log('Drag end event:', event)
    const { from, to, item, newIndex, oldIndex } = event

    if (!from || !to || !item) {
      console.log('Missing required elements:', { from: !!from, to: !!to, item: !!item })
      return
    }

    const sourceColumnId = from.getAttribute('data-column-id')
    const targetColumnId = to.getAttribute('data-column-id')
    const bookIdStr = item.getAttribute('data-book-id')
    const bookId = bookIdStr ? parseInt(bookIdStr) : 0

    console.log('Drag details:', { sourceColumnId, targetColumnId, bookId, newIndex, oldIndex })

    if (!sourceColumnId || !targetColumnId || !bookId) {
      console.log('Missing required attributes:', { sourceColumnId, targetColumnId, bookId })
      return
    }

    // Find the book and update its status if moved to different column
    if (sourceColumnId !== targetColumnId) {
      const targetColumn = columns.find((col) => col.id === targetColumnId)
      if (targetColumn) {
        const book = targetColumn.books.find((b) => b.id === bookId)
        if (book) {
          book.readingStatus = targetColumnId as 'to-read' | 'currently-reading' | 'read'
          console.log(`Updated book ${bookId} status to ${targetColumnId}`)
        }
      }
    }

    // Update order for all books in both columns
    columns.forEach((column) => {
      column.books.forEach((book, index) => {
        book.order = index
      })
    })

    // Save state
    saveColumnsState()

    // Emit status change if column changed
    if (sourceColumnId !== targetColumnId) {
      onStatusChange(bookId, targetColumnId as 'to-read' | 'currently-reading' | 'read')
    }
  }

  return {
    handleDragEnd,
  }
}
