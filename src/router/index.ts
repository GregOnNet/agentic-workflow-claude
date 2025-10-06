import { createRouter, createWebHistory } from 'vue-router'
import BooksView from '../views/BooksView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: BooksView,
    },
    {
      path: '/books',
      name: 'books',
      component: BooksView,
    },
  ],
})

export default router
