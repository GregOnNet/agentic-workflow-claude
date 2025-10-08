<script setup lang="ts"></script>

<template>
  <header>
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/books">Books</router-link>
      <router-link to="/kanban">Reading Board</router-link>
      <router-link to="/profile">Profile</router-link>
    </nav>
  </header>
  <main>
    <router-view />
  </main>
</template>

<style scoped>
header {
  background-color: #f8f9fa;
  padding: 16px 0;
  border-bottom: 1px solid #e9ecef;
}

nav {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  gap: 20px;
}

nav a {
  color: #495057;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 0;
  position: relative;
}

nav a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #0d6efd;
  transition: width 0.2s;
}

nav a:hover::after,
nav a.router-link-active::after {
  width: 100%;
}

nav a.router-link-active {
  color: #0d6efd;
}

main {
  min-height: calc(100vh - 70px);
}
</style>
