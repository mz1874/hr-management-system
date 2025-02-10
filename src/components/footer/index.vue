<script setup lang="ts">

</script>

<script lang="ts">
export default {
  name: 'page-footer',
}
</script>

<template>
  <footer class="footer">
    <div class="footer-links">
      <a href="#">About</a>
      <a href="#">Press</a>
      <a href="#">Developers</a>
      <a href="#">Channels</a>
      <a href="#">Sport</a>
      <a href="#">Culture</a>
      <a href="#">Privacy</a>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: #a1a0a0;
  color: #070707;
  padding: 1rem;
  height: 50px;
  text-align: left;
  flex-shrink: 0;
}


/* Footer Links */
.footer-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.footer-links a {
  color: #ffffff;
  text-decoration: none;
  font-size: 0.9rem;
}

</style>
