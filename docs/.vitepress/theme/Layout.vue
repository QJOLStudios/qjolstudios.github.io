<template>
  <Layout>
    <template #nav-bar-content-after>
      <NavBarAuth />
    </template>
  </Layout>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
import NavBarAuth from './components/NavBarAuth.vue'

const { Layout } = DefaultTheme
</script>