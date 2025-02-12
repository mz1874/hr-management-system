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
              <label for="email">E-mail</label>
              <input type="email" id="email" placeholder="rowy@gmail.com">
            </div>
            <br>
            <div class="field">
              <label for="password">Password</label>
              <input type="password" id="password" placeholder="**">
            </div>
            <br>
            <button @click="submitData()">Login</button>
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
import logo from '../../assets/logo.png';
import {reactive, ref} from "vue";
import {useRouter} from "vue-router";

const router = useRouter()

const email = ref("")
const password = ref("")
const logoUrl = ref(logo)

function submitData()
{
  router.push({
    name:'home'
  })
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
}

.right {
  height: 100vh;
  background: linear-gradient(to bottom, #3c7dbb, #a1c349); /* 设置右侧背景渐变 */
}

.logo {
  width: 100px; /* 调整图片大小 */
  margin-bottom: 20px; /* 图片与表单之间的间距 */
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

.logo {
  position: absolute;
  top: 40px;
  left: 40px;
  width: 150px;
}

</style>
