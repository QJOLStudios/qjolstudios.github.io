<template>
  <Layout>
    <template #nav-bar-content-after>
      <NavBarAuth />
    </template>
    <template #layout-bottom>
      <Timer />
    </template>
  </Layout>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
import NavBarAuth from './components/NavBarAuth.vue'
import Timer from './components/Timer.vue'

const { Layout } = DefaultTheme
</script>
