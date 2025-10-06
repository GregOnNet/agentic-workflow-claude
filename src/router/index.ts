import { createRouter, createWebHistory } from 'vue-router'
import BooksView from '../views/BooksView.vue'
import KanbanView from '../views/KanbanView.vue'

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
    {
      path: '/kanban',
      name: 'kanban',
      component: KanbanView,
    },
  ],
})

export default router
