<template>
  <div class="container-fluid h-100">
    <div class="row h-100">
      <!-- 左侧部分 -->
      <div class="col-md-6 left d-flex flex-column align-items-center justify-content-center">
        <img :src="logoUrl" alt="Logo" class="logo">
        <div class="box">
          <h2>Welcome back</h2>
          <p class="login">Log In</p>
          <form>
            <div class="field">
              <label for="username">UserName</label>
              <input type="text" id="email" v-model="username" placeholder="UserName">
            </div>
            <br>
            <div class="field password-field">
              <label for="password">Password</label>
              <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password" placeholder="**">
              <div class="eye-icon" @click="togglePasswordVisibility">
                <!-- Custom SVG eye icon that doesn't require external libraries -->
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </div>
            </div>
            <br>
            <button @click.prevent="submitData()">Login</button>
          </form>
        </div>
      </div>

      <!-- 右侧部分 -->
      <div class="col-md-6 right">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Login',
}
</script>

<script setup lang="ts">
import Swal from 'sweetalert2'
import logo from '../../assets/logo.png';
import {computed, reactive, ref} from "vue";
import {useRouter} from "vue-router";
import {getCurrentUser, login, logout} from "@/api/login.ts";
import {getUserRoutes} from "@/api/router.ts";
import {mapBackendRoutes} from "@/router/asyncRoutes.ts";
import type {Staff} from "@/interface/UserInterface.ts"; // 上面我们写的路由映射函数


const router = useRouter()

const username = ref("")
const password = ref("")
const logoUrl = ref(logo)
const showPassword = ref(false)
let currentRoles = reactive([])
let dynamicRouteNames: string[] = [];

let isSupervisor = computed(() => {
  const supervisorRoles = ['admin', 'hr', 'ADMIN', 'HR', 'administrator', 'ADMINISTRATOR'];
  return supervisorRoles.some(role => currentRoles.includes(role));
});


function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}
const currentUser = ref<Staff | null>(null);

const fetchCurrentUser = async () => {
  try {
    const response = await getCurrentUser();
    if (response.data && response.data.data) {
      currentUser.value = response.data.data;
      currentRoles.splice(0, currentRoles.length, ...currentUser.value.roles);
      localStorage.setItem("currentUser", JSON.stringify(currentUser.value));
      console.log(currentRoles, "roles");
    } else {
      Swal.fire('Error', 'Could not load your user details. Please try again.', 'error');
    }
  } catch (error) {
    console.error("Failed to fetch current user:", error);
    Swal.fire('Error', 'Could not load your user details. Please try again.', 'error');
  }
};

function resetDynamicRoutes() {
  dynamicRouteNames.forEach(name => {
    if (router.hasRoute(name)) {
      router.removeRoute(name);
    }
  });
  dynamicRouteNames = [];
}

async function submitData() {
  resetDynamicRoutes();
  if (!username.value.trim()) {
    Swal.fire("Username is required");
    return;
  }

  if (!password.value.trim()) {
    Swal.fire("Password is required");
    return;
  }

  try {
    const res = await login(username.value, password.value);
    const tokens = res.data?.data;
    if (tokens?.access && tokens?.refresh) {
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      await fetchCurrentUser();
      const routeRes = await getUserRoutes();
      console.log(routeRes);
      const backendRoutes = routeRes.data?.data;
      const dynamicRoutes = mapBackendRoutes(backendRoutes);
      const homeRoute = router.getRoutes().find(r => r.name === 'main');
      if (homeRoute) {
        dynamicRoutes.forEach(r => {
          router.addRoute('main', r); // 正确注册
          if (r.name) {
            dynamicRouteNames.push(r.name);
          }
        });
      }
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Login success",
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        try {
          router.replace({ name: isSupervisor.value ? 'home' : 'kpi-dashboard' });
        }catch (error) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Current user may don‘t have permission.",
          });
        }
      });
    } else {
      throw new Error("Invalid token structure");
    }
  } catch (err) {
    console.log(err);
    if (err.response?.status === 401) {
      const jsonErrorCode = JSON.parse(err.request.response)
      Swal.fire({
        title: "Login failed!",
        text: jsonErrorCode.message,
        icon: "error"
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "The network connection failed.",
      });
    }
  }
}

</script>

<style scoped>
/* 确保根元素扩展到全高 */
html, body {
  height: 100%;
  margin: 0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}

.container-fluid {
  height: 100vh; /* 使用视口单位确保填满整个屏幕高度 */
}

.row {
  height: 100%; /* 确保行占据整个容器的高度 */
}

.left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
}

.right {
  height: 100vh;
  background: linear-gradient(to bottom, #3c7dbb, #a1c349); /* 设置右侧背景渐变 */
}

.logo {
  width: 55%; /* 增大logo尺寸到左侧区域的一半 */
  max-width: 300px;
  margin-bottom: 30px; /* 图片与表单之间的间距 */
  position: relative;
  top: auto;
  left: auto;
}

.box {
  width: 100%; /* 确保表单宽度适应父容器 */
  max-width: 400px; /* 设置表单的最大宽度 */
  padding: 20px;
  background-color: white; /* 设置表单背景颜色 */
  border-radius: 8px;
  text-align: left;
}

/* Typography */
h2 {
  margin-bottom: 10px;
  font-size: 24px;
  color: #333;
}

p {
  margin-bottom: 20px;
  color: #666;
}

/* Form Styling */
form {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 300px;
}

.field {
  margin-bottom: 20px;
  position: relative;
}

.password-field {
  position: relative;
}

.eye-icon {
  position: absolute;
  right: 12px;
  top: 12px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: transparent;
  border-radius: 4px;
}

.eye-icon:hover {
  background-color: #f5f5f5;
}

.field label {
  position: absolute;
  top: -8px;
  left: 15px;
  background: white;
  padding: 0 5px;
  color: #666;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 10px;
}

button {
  padding: 10px;
  width: 100%;
  font-size: 16px;
  color: white;
  background-color: #a1c349;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #8faf39;
}
</style>