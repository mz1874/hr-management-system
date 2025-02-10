<script setup lang="ts">

</script>

<script lang="ts">
export default {
  name: 'content-header',
}
</script>

<template>
  <header class="header">
    <div class="align-items-center me-3">
      <span>username</span>
    </div>
  </header>
</template>

<style scoped>
.header {
  padding: 0;
  margin: 0;
  background-color: #DFE9DE;
  height: 60px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>