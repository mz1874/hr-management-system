<script setup lang="ts">
import siderbar from "@/components/siderbar/index.vue";
import pageFooter from "@/components/footer/index.vue"
</script>

<script lang="ts">
  export default {
    name:'home-view',
  }
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <siderbar></siderbar>
      <div class="col">
        <router-view></router-view>
      </div>
      <page-footer></page-footer>
    </div>
  </div>
</template>

<style scoped>
  .home-content{
    background-color: #d4dada;
  }
</style>
