<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import siderbar from "@/components/siderbar/index.vue";
import pageFooter from "@/components/footer/index.vue"
</script>

<template>
  <router-view class="col"></router-view>
<!--  <div class="container-fluid">-->
<!--    <div class="row">-->
<!--      <siderbar></siderbar>-->
<!--      <router-view class="col"></router-view>-->
<!--      <page-footer></page-footer>-->
<!--    </div>-->
<!--  </div>-->
</template>

<style scoped>


</style>
