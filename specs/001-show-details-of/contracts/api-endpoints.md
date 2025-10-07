# API Contracts: Book Details View

**Feature**: Book Details View
**Date**: 2025-10-07
**Base URL**: `http://localhost:4730`
**Status**: Complete

## Overview

This document defines the HTTP API contracts required for the Book Details View feature. The API follows RESTful conventions and returns JSON responses. All endpoints use standard HTTP status codes and error formats.

## Endpoints

### Get Book By ID

Retrieve detailed information for a single book.

**Endpoint**: `GET /books/:id`

**URL Parameters**:

- `id` (number, required): Unique book identifier

**Request Example**:

```http
GET /books/1 HTTP/1.1
Host: localhost:4730
Accept: application/json
```

**Success Response**:

**Status Code**: `200 OK`

**Response Body**:

```json
{
  "id": 1,
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "cover": "https://example.com/covers/gatsby.jpg",
  "description": "A classic American novel set in the Jazz Age...",
  "year": 1925
}
```

**Response Schema**:

```typescript
interface BookResponse {
  id: number // Unique identifier
  title: string // Book title
  author: string // Author name
  cover?: string // Optional URL to cover image
  description?: string // Optional full description
  year?: number // Optional publication year
}
```

**Field Specifications**:

- `id`: Positive integer, unique across all books
- `title`: Non-empty string, max 500 characters
- `author`: Non-empty string, max 200 characters
- `cover`: Valid HTTP(S) URL if present, null/undefined if not available
- `description`: Text content, can be empty string, null, or undefined
- `year`: 4-digit integer (1000-9999) if present, null/undefined if not available

---

### Error Responses

#### Book Not Found

**Status Code**: `404 Not Found`

**Response Body**:

```json
{
  "error": "Not Found",
  "message": "Book with ID 999 not found",
  "statusCode": 404
}
```

**When It Occurs**:

- Requested book ID doesn't exist in the database
- Book was deleted
- Invalid ID format (handled by server)

**Client Handling**:

```typescript
if (response.status === 404) {
  error.value = new Error('Book not found')
  // Display error UI with "Return to List" button
}
```

---

#### Server Error

**Status Code**: `500 Internal Server Error`

**Response Body**:

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "statusCode": 500
}
```

**When It Occurs**:

- Database connection failure
- Unexpected server error
- Data corruption issues

**Client Handling**:

```typescript
if (response.status >= 500) {
  error.value = new Error('Server error - please try again later')
  // Display error UI with "Retry" button
}
```

---

#### Bad Request

**Status Code**: `400 Bad Request`

**Response Body**:

```json
{
  "error": "Bad Request",
  "message": "Invalid book ID format",
  "statusCode": 400
}
```

**When It Occurs**:

- Non-numeric ID parameter
- Negative ID value
- ID exceeds maximum safe integer

**Client Handling**:

```typescript
if (response.status === 400) {
  error.value = new Error('Invalid book ID')
  // Redirect to book list or show error
}
```

---

## Request/Response Examples

### Example 1: Successful Fetch (Complete Book)

**Request**:

```bash
curl -X GET http://localhost:4730/books/1 \
  -H "Accept: application/json"
```

**Response**:

```json
{
  "id": 1,
  "title": "1984",
  "author": "George Orwell",
  "cover": "https://covers.example.com/1984.jpg",
  "description": "A dystopian social science fiction novel and cautionary tale...",
  "year": 1949
}
```

---

### Example 2: Successful Fetch (Minimal Book)

**Request**:

```bash
curl -X GET http://localhost:4730/books/42 \
  -H "Accept: application/json"
```

**Response**:

```json
{
  "id": 42,
  "title": "Unknown Title",
  "author": "Unknown Author"
}
```

**Note**: Optional fields (`cover`, `description`, `year`) are omitted when not available

---

### Example 3: Book Not Found

**Request**:

```bash
curl -X GET http://localhost:4730/books/9999 \
  -H "Accept: application/json"
```

**Response**:

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "error": "Not Found",
  "message": "Book with ID 9999 not found",
  "statusCode": 404
}
```

---

### Example 4: Invalid ID

**Request**:

```bash
curl -X GET http://localhost:4730/books/abc \
  -H "Accept: application/json"
```

**Response**:

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Bad Request",
  "message": "Invalid book ID format",
  "statusCode": 400
}
```

---

## Client Implementation

### Fetch Function

```typescript
// src/data/books.ts
export async function getBookById(id: number): Promise<Book | null> {
  try {
    const response = await fetch(`http://localhost:4730/books/${id}`)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Book not found')
      }
      throw new Error(`HTTP error: ${response.status}`)
    }

    const book: Book = await response.json()
    return book
  } catch (error) {
    console.error(`Failed to fetch book ${id}:`, error)
    return null
  }
}
```

### Composable Implementation

```typescript
// src/composables/useBookDetail.ts
import { ref, type Ref } from 'vue'
import { getBookById } from '@/data/books'
import type { Book } from '@/types'

export function useBookDetail(bookId: Ref<number>) {
  const book = ref<Book | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchBook() {
    isLoading.value = true
    error.value = null
    book.value = null

    try {
      const data = await getBookById(bookId.value)

      if (data === null) {
        throw new Error('Book not found')
      }

      book.value = data
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
      book.value = null
    } finally {
      isLoading.value = false
    }
  }

  return {
    book,
    isLoading,
    error,
    fetchBook,
    refetch: fetchBook,
  }
}
```

---

## HTTP Headers

### Request Headers

**Required**:

- `Accept: application/json` - Specifies expected response format

**Optional**:

- `Cache-Control: no-cache` - Force fresh data if caching is a concern
- `If-None-Match: <etag>` - For conditional requests (if server supports)

### Response Headers

**Common Headers**:

- `Content-Type: application/json; charset=utf-8`
- `Content-Length: <size>`
- `Date: <timestamp>`

**Caching Headers** (if supported by API):

- `Cache-Control: public, max-age=3600`
- `ETag: "<hash>"`
- `Last-Modified: <timestamp>`

---

## Performance Considerations

### Response Time

**Expected Performance**:

- Average response time: <500ms
- 95th percentile: <1000ms
- Timeout setting: 5000ms

**Client Timeout Configuration**:

```typescript
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 5000)

try {
  const response = await fetch(url, { signal: controller.signal })
  // Process response
} catch (error) {
  if (error.name === 'AbortError') {
    throw new Error('Request timeout')
  }
  throw error
} finally {
  clearTimeout(timeoutId)
}
```

### Response Size

**Typical Sizes**:

- Minimal book (no optionals): ~150 bytes
- Complete book (all fields): ~1-5KB
- Maximum expected: <50KB (for very long descriptions)

**Optimization**: No special handling needed for these sizes

---

## Error Handling Strategy

### Client-Side Error Handling Flow

```typescript
async function fetchBookWithErrorHandling(id: number): Promise<Book | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/books/${id}`)

    // Handle HTTP errors
    if (!response.ok) {
      switch (response.status) {
        case 404:
          throw new NotFoundError('Book not found')
        case 400:
          throw new ValidationError('Invalid book ID')
        case 500:
        case 502:
        case 503:
          throw new ServerError('Server temporarily unavailable')
        default:
          throw new APIError(`Unexpected error: ${response.status}`)
      }
    }

    // Handle JSON parsing errors
    let data: Book
    try {
      data = await response.json()
    } catch {
      throw new ParseError('Invalid response format')
    }

    // Validate response data
    if (!data.id || !data.title || !data.author) {
      throw new ValidationError('Invalid book data received')
    }

    return data
  } catch (error) {
    // Network errors (no response)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new NetworkError('Unable to connect to server')
    }

    // Re-throw known errors
    throw error
  }
}
```

### Error Classes

```typescript
class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

class ServerError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ServerError'
  }
}
```

---

## Testing

### Mock API Responses

```typescript
// test/mocks/api.ts
export const mockApiResponses = {
  success: {
    status: 200,
    data: {
      id: 1,
      title: 'Test Book',
      author: 'Test Author',
      cover: 'https://example.com/cover.jpg',
      description: 'Test description',
      year: 2024,
    },
  },

  notFound: {
    status: 404,
    data: {
      error: 'Not Found',
      message: 'Book with ID 999 not found',
      statusCode: 404,
    },
  },

  serverError: {
    status: 500,
    data: {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      statusCode: 500,
    },
  },
}

// Usage in tests
global.fetch = vi.fn((url) => {
  if (url.includes('/999')) {
    return Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.resolve(mockApiResponses.notFound.data),
    })
  }

  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(mockApiResponses.success.data),
  })
})
```

---

## API Contract Validation

### TypeScript Type Guards

```typescript
function isValidBook(data: any): data is Book {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'number' &&
    data.id > 0 &&
    typeof data.title === 'string' &&
    data.title.length > 0 &&
    typeof data.author === 'string' &&
    data.author.length > 0 &&
    (data.cover === undefined || typeof data.cover === 'string') &&
    (data.description === undefined || typeof data.description === 'string') &&
    (data.year === undefined || typeof data.year === 'number')
  )
}

// Usage
const data = await response.json()
if (!isValidBook(data)) {
  throw new ValidationError('Invalid book data format')
}
```

---

## Summary

**Endpoints Required**: 1

- `GET /books/:id` - Fetch single book details

**Status Codes Used**:

- `200 OK` - Successful fetch
- `400 Bad Request` - Invalid ID format
- `404 Not Found` - Book doesn't exist
- `500 Internal Server Error` - Server error

**Response Format**: JSON
**Authentication**: None required (public API)
**Rate Limiting**: None specified (assumed reasonable use)

**Error Handling**: Comprehensive client-side error handling for all scenarios

**Testing**: Mock responses provided for unit tests, real API used for integration tests

**Performance**: Fast responses (<1s), small payloads (<5KB), no special optimization needed

All API contracts align with existing patterns and support the feature requirements specified in [spec.md](../spec.md).
