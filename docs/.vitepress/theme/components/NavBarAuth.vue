<template>
  <div class="nav-bar-auth">
    <UserAuth />
  </div>
</template>

<script setup>
import UserAuth from './UserAuth.vue'
</script>

<style scoped>
.nav-bar-auth {
  display: flex;
  align-items: center;
  margin-left: 12px;
}
</style>
