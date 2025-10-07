import { ref } from 'vue'

export function useSearch(callback: () => void) {
  const searchTerm = ref('')
  const debounceTimeout = ref<number | null>(null)

  function handleSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value
    searchTerm.value = value

    // Clear any existing timeout
    if (debounceTimeout.value) {
      window.clearTimeout(debounceTimeout.value)
    }

    // Set new timeout
    debounceTimeout.value = window.setTimeout(() => {
      callback()
    }, 200)
  }

  return {
    searchTerm,
    handleSearch,
  }
}
