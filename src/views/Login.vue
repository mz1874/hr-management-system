<template>
  <div class="container">
    <div class="left">
      <img :src="logoUrl" alt="Logo" class="logo">
      <div class="box">
        <h2>Welcome back</h2>
        <p class="login">Log In</p>
        <form @submit.prevent="handleSubmit">
          <div class="field">
            <label for="email">E-mail</label>
            <input 
              type="email" 
              id="email" 
              v-model="email"
              placeholder="rowy@gmail.com"
            >
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              v-model="password"
              placeholder="******"
            >
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
    <div class="right"></div>
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
      this.$router.push("/dashboard");
    }
  }
}
</script>

<style>
/* Global reset - remove from scoped to ensure it affects everything */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}

.container {
  display: flex;
  width: 100%;
  height: 100vh;
  position: fixed; /* Add this to ensure full coverage */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.left {
  flex: 1;
  padding: 40px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.right {
  flex: 1;
  background: linear-gradient(to bottom, #3c7dbb, #a1c349);
  min-width: 0; /* Add this to prevent flex item from expanding */
}

.box {
  width: 100%;
  max-width: 300px;
  position: relative;
}

.logo {
  position: absolute;
  top: 40px;
  left: 40px;
  width: 150px;
}

h2 {
  margin-bottom: 10px;
  font-size: 24px;
  color: #333;
}

.login {
  margin-bottom: 20px;
  color: #666;
}

form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  position: relative;
  width: 100%;
}

.field label {
  position: absolute;
  top: -8px;
  left: 15px;
  background: white;
  padding: 0 5px;
  color: #666;
  font-size: 14px;
  z-index: 1;
}

input {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 10px;
}

button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  color: white;
  background-color: #a1c349;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #8faf39;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .left, .right {
    flex: none;
    width: 100%;
    height: 50vh;
  }

  .logo {
    top: 20px;
    left: 20px;
    width: 100px;
  }

  .box {
    padding: 0 20px;
  }
}

@media (max-width: 480px) {
  .box {
    padding: 0 15px;
  }

  .logo {
    width: 80px;
  }
}
</style>