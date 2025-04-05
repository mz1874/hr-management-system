<script lang="ts">
  export default {
    name:'home-view',
  }
</script>


<script setup lang="ts">
import siderbar from "@/components/siderbar/index.vue";
import pageFooter from "@/components/footer/index.vue";
import contentHeader from "@/components/header/index.vue";
import { getCurrentUser } from "@/api/login.ts";
import {onMounted, reactive, ref} from "vue";

let currentUserData = reactive<any>({});

const currentUser = () => {
  getCurrentUser()
      .then((res) => {
        console.log(res.data.data);
        currentUserData = res.data.data;  // 将返回的数据保存到 currentUserData 中
        console.log(currentUserData.username);  // 直接访问 username
      })
      .catch((err) => {
        console.log(err);
      });
};

onMounted(() => {
  currentUser();  // 在组件挂载时调用函数获取数据
});

</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <siderbar></siderbar>
      <div class="col">
        <div v-if="currentUserData?.username">
          <content-header :user-name="currentUserData?.username" />
        </div>
        <div class="main-content">
          <router-view></router-view>
        </div>
      </div>
      <page-footer></page-footer>
    </div>
  </div>
</template>

<style scoped>
.container-fluid {
    font-family: 'Nunito', sans-serif;
}
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
