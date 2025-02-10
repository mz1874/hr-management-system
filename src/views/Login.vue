<template>
  <div class="container-fluid h-100">
    <div class="row h-100">
      <!-- 左侧部分 -->
      <div class="col-md-6 left d-flex align-items-center justify-content-center">
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
            <button type="submit">Login</button>
          </form>
        </div>
      </div>

      <!-- 右侧部分 -->
      <div class="col-md-6 right">
      </div>
    </div>
  </div>
</template>


<script>
import logo from '../assets/logo.png';


export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      logoUrl: logo
    };
  },
  methods: {
    handleSubmit() {
      console.log("Logging in:", this.email);
      this.$router.push("/dashboard");  // Redirect on login
      //dummies
    }
  }
}
</script>

<style scoped>
<
style scoped >
  /* 确保根元素扩展到全高 */
html, body {
  height: 100%;
  margin: 0;
}

•⁠ ⁠ {
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
  margin-top: -80px;
}

.right {
  height: 100vh;
  background: linear-gradient(to bottom, #3c7dbb, #a1c349); /* 设置右侧背景渐变 */
}

.box {
  width: 100%; /* 确保表单宽度适应父容器 */
  max-width: 400px; /* 设置表单的最大宽度 */
  padding: 20px;
  background-color: white; /* 设置表单背景颜色 */
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
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

</style>