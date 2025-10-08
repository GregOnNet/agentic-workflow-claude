import { ref, computed } from 'vue'
import type { User, ValidationError } from '../types'

const STORAGE_KEY = 'user_profile'

// Simulated user state (in a real app, this would come from auth service)
const currentUser = ref<User>({
  name: 'John Doe',
  email: 'john.doe@example.com',
})

// Load user from localStorage on initialization
const storedUser = localStorage.getItem(STORAGE_KEY)
if (storedUser) {
  try {
    currentUser.value = JSON.parse(storedUser)
  } catch (e) {
    console.error('Failed to load user profile from storage', e)
  }
}

export function useUserProfile() {
  const user = computed(() => currentUser.value)
  const hasUnsavedChanges = ref(false)

  function validateEmail(email: string): string | null {
    if (!email) {
      return 'Email is required'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address'
    }
    return null
  }

  function validateName(name: string): string | null {
    if (!name) {
      return 'Name is required'
    }
    if (name.length < 2) {
      return 'Name must be at least 2 characters long'
    }
    if (name.length > 50) {
      return 'Name must be less than 50 characters'
    }
    return null
  }

  function validateUser(userData: User): ValidationError[] {
    const errors: ValidationError[] = []

    const nameError = validateName(userData.name)
    if (nameError) {
      errors.push({ field: 'name', message: nameError })
    }

    const emailError = validateEmail(userData.email)
    if (emailError) {
      errors.push({ field: 'email', message: emailError })
    }

    return errors
  }

  async function updateProfile(userData: User): Promise<{ success: boolean; errors?: ValidationError[] }> {
    // Validate input
    const validationErrors = validateUser(userData)
    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors }
    }

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // In a real application, this would send data to an API
      // For email changes, the API would send a verification email
      // For now, we'll just update the local state

      currentUser.value = { ...userData }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser.value))
      hasUnsavedChanges.value = false

      return { success: true }
    } catch (error) {
      console.error('Failed to update profile:', error)
      return {
        success: false,
        errors: [{ field: 'general', message: 'Failed to update profile. Please try again.' }],
      }
    }
  }

  function setUnsavedChanges(value: boolean) {
    hasUnsavedChanges.value = value
  }

  return {
    user,
    hasUnsavedChanges,
    updateProfile,
    setUnsavedChanges,
    validateName,
    validateEmail,
  }
}
