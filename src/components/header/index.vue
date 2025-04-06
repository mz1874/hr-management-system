<script setup lang="ts">
import Swal from 'sweetalert2'
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { logout } from "@/api/login.ts";

const router = useRouter();

const showDropdown = ref(false);

const props = defineProps(['userName']);


const handleLogout = () => {
  Swal.fire({
    position: "top-end",
    icon: "success",
    title: "You successfully logged out!",
    showConfirmButton: false,
    timer: 1500
  });

  logout();
  router.push('/login');
};
</script>


<template>
  <header class="header navbar">
    <div class="ms-auto d-flex align-items-center">
      <div class="dropdown">
        <div class="user-menu" @mouseenter="showDropdown = true" @mouseleave="showDropdown = false">
          <span class="username">{{props.userName }}</span>
          <div class="dropdown-menu" :class="{ show: showDropdown }">
            <router-link to="/home/personal-information" class="dropdown-item">
              <i class="bi bi-person me-2"></i>Personal Information
            </router-link>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item" @click.prevent="handleLogout">
              <i class="bi bi-box-arrow-right me-2"></i>Logout
            </a>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 0.5rem 1rem;
}

.user-menu {
  position: relative;
  cursor: pointer;
  padding: 0.5rem;
}

.username {
  font-weight: 500;
}

.dropdown-menu {
  display: none;
  position: absolute;
  right: 0;
  top: 100%;
  min-width: 200px;
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  color: #333;
  text-decoration: none;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}
</style>
