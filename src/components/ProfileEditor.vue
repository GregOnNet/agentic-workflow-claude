<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useUserProfile } from '../composables/useUserProfile'
import type { User, ValidationError } from '../types'

const { user, hasUnsavedChanges, updateProfile, setUnsavedChanges, validateName, validateEmail } =
  useUserProfile()

const formData = ref<User>({
  name: user.value.name,
  email: user.value.email,
})

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const successMessage = ref('')
const showSuccessMessage = ref(false)

// Watch for changes in form data
watch(
  formData,
  () => {
    setUnsavedChanges(
      formData.value.name !== user.value.name || formData.value.email !== user.value.email,
    )
    // Clear success message when user starts editing again
    if (showSuccessMessage.value) {
      showSuccessMessage.value = false
    }
  },
  { deep: true },
)

// Validate field on blur
function validateField(field: keyof User) {
  if (field === 'name') {
    const error = validateName(formData.value.name)
    if (error) {
      errors.value.name = error
    } else {
      delete errors.value.name
    }
  } else if (field === 'email') {
    const error = validateEmail(formData.value.email)
    if (error) {
      errors.value.email = error
    } else {
      delete errors.value.email
    }
  }
}

async function handleSubmit() {
  // Clear previous errors and messages
  errors.value = {}
  showSuccessMessage.value = false

  isSubmitting.value = true

  const result = await updateProfile(formData.value)

  isSubmitting.value = false

  if (result.success) {
    successMessage.value = 'Profile updated successfully!'
    showSuccessMessage.value = true

    // Hide success message after 5 seconds
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 5000)
  } else if (result.errors) {
    // Map validation errors to form fields
    result.errors.forEach((error: ValidationError) => {
      errors.value[error.field] = error.message
    })
  }
}

// Handle browser navigation with unsaved changes
function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (hasUnsavedChanges.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Edit Profile</h1>

    <!-- Success Message -->
    <div
      v-if="showSuccessMessage"
      class="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg"
      role="alert"
      data-testid="success-message"
    >
      {{ successMessage }}
    </div>

    <!-- General Error Message -->
    <div
      v-if="errors.general"
      class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
      role="alert"
      data-testid="error-message"
    >
      {{ errors.general }}
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Name Field -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
          Name <span class="text-red-500">*</span>
        </label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          required
          data-testid="name-input"
          @blur="validateField('name')"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :class="{ 'border-red-500': errors.name }"
        />
        <p
          v-if="errors.name"
          class="mt-1 text-sm text-red-600"
          data-testid="name-error"
          role="alert"
        >
          {{ errors.name }}
        </p>
      </div>

      <!-- Email Field -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
          Email Address <span class="text-red-500">*</span>
        </label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          required
          data-testid="email-input"
          @blur="validateField('email')"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :class="{ 'border-red-500': errors.email }"
        />
        <p
          v-if="errors.email"
          class="mt-1 text-sm text-red-600"
          data-testid="email-error"
          role="alert"
        >
          {{ errors.email }}
        </p>
        <p class="mt-1 text-sm text-gray-500">
          Note: A verification email will be sent to the new address before the change takes effect.
        </p>
      </div>

      <!-- Unsaved Changes Warning -->
      <div
        v-if="hasUnsavedChanges"
        class="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg"
        data-testid="unsaved-changes-warning"
      >
        You have unsaved changes. Please save your changes before leaving this page.
      </div>

      <!-- Submit Button -->
      <div class="flex gap-4">
        <button
          type="submit"
          :disabled="isSubmitting || Object.keys(errors).length > 0"
          data-testid="save-button"
          class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
        </button>

        <button
          type="button"
          @click="
            formData = { name: user.name, email: user.email };
            errors = {};
            showSuccessMessage = false;
          "
          :disabled="isSubmitting"
          data-testid="cancel-button"
          class="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>
