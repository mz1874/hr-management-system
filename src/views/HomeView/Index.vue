<script setup lang="ts">
import siderbar from "@/components/siderbar/index.vue";
import pageFooter from "@/components/footer/index.vue";
import contentHeader from "@/components/header/index.vue";
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
        <contentHeader></contentHeader>
        <div class="main-content">
          <router-view></router-view>
        </div>
      </div>
      <page-footer></page-footer>
    </div>
  </div>
</template>

<style scoped>
  .home-content{
    background-color: #d4dada;
  }
  .col {
    padding: 0;
  }
  .main-content {
    padding: 2rem;
    flex: 1;
    margin-bottom: 50px;
    transition: margin-left 0.3s ease; /* Smooth transition */
  }
</style>
