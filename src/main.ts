import { createApp } from 'vue'
import App from './App.vue'
import './main.css'
import router from './router'

const app = createApp(App)

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error caught:', err)
  console.error('Component:', instance)
  console.error('Error info:', info)

  // In production, send to error tracking service
  if (import.meta.env.PROD) {
    // Example: sendToErrorTracking(err, { component: instance?.$options.name, info })
  }
}

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)

  // Prevent default browser error handling
  event.preventDefault()

  // In production, send to error tracking service
  if (import.meta.env.PROD) {
    // Example: sendToErrorTracking(event.reason)
  }
})

app.use(router)

app.mount('#app')
