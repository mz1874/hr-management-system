<template>
  <div class="container">
    <div class="left">
      <img :src="logoUrl" alt="Logo" class="logo" width="150">
      <div class="box">
        <h2>Welcome back</h2>
        <p class="login">Log In</p>
        <form @submit.prevent="handleSubmit">
          <br>
          <div class="field">
            <label for="email">E-mail</label>
            <input 
              type="email" 
              id="email" 
              v-model="email"
              placeholder="rowy@gmail.com"
            >
          </div>
          <br>
          <div class="field">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              v-model="password"
              placeholder="******"
            >
          </div>
          <br>
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
      this.$router.push("/dashboard");  // Redirect on login
      //dummies
    }
  }
}
</script>

<style scoped>
  body, html {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden; /* Prevents scrolling */
}
  
.container {
  display: flex;
  width: 100vw;  /* Full viewport width */
  height: 100vh; /* Full viewport height */
}
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
  }
  



  /* Left Section */
  .left {
    flex: 1;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center; 
    align-items: left; 
    text-align: left;
  }
  
  
  /* Right Section */
  .right {
    flex: 1;
    background: linear-gradient(to bottom, #3c7dbb, #a1c349);
  }
  
  /* Logo */
  .logo {
    position: absolute;
    top: 40px;
    left: 40px;
    width: 200px;
  }
  
  /* Typography */
  h2 {
    margin-bottom: 10px;
    font-size: 24px;
    color: #333;
    font-weight: bold;
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
    width: 150%;
    padding: 12px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 10px;
  }
  
  button {
    padding: 10px;
    width: 150%;
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
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .container {
        flex-direction: column; /* Stack sections vertically */
    }
  
    .left, .right {
        flex: none;
        width: 100%;
        height: 50%; /* Each section takes up half of the height */
    }
  
    .logo {
        top: 20px;
        left: 20px;
        width: 100px;
    }
  }
  
  @media (max-width: 480px) {
    form {
        max-width: 100%; /* Adjust form width for smaller screens */
    }
  
    input, button {
        width: 100%; /* Full-width for form elements */
    }
  
    .logo {
        width: 80px;
    }
  }
  
</style>