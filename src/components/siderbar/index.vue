<script setup lang="ts">
import { reactive } from "vue";

const navItems = reactive([
  { name: "Home", link: "/home" },
  { name: "KPI Dashboard", link: "/home/KPI-Dashboard" }, 
  { name: "Notification Center", link: "/home/notification-center" },
  { name: "Notification View", link: "/home/notification-view" },
  { name: "KPI Management", link: "/home/KPI-management" },
  { name: "Leave Management", link: "/home/leave-management" },
  { name: "Leave Application", link: "/home/leave-application" },
  { name: "Reward Mall", link: "/home/reward-mall" },
  { name: "Leaderboard", link: "/home/leader-board" },
  { name: "Evaluation Center", link: "/home/survey-management" },
  { name: "Personal KPI Management", link: "/home/personal-KPI-Management" },
]);

const rewardSubmenu = reactive([
  { name: "Reward Management", link: "/home/reward-management" },
  { name: "Redemption Status", link: "/home/redemption-status" },
]);

const systemSubmenu = reactive([
  { name: "User management", link: "/home/user-management" },
  { name: "Department management", link: "/home/department-management" },
  { name: "System Logs", link: "/home/system-log" },
  { name: "Authorization Management", link: "/home/authorization-management" },
  { name: "Router Management", link: "/home/router-management" },
]);

</script>

<template>
  <nav class="sidebar col-auto">
    <div class="logo-container">
      <img src="/logo.png" alt="ROWY Hardware" class="logo-img">
    </div>

    <router-link v-for="item in navItems" :key="item.name" :to="item.link" class="nav-item">
      {{ item.name }}
    </router-link>

    <a href="#" class="nav-item" data-bs-toggle="collapse" data-bs-target="#reward-submenu">
      Reward Administration
    </a>
    <div class="collapse" id="reward-submenu">
      <router-link v-for="sub in rewardSubmenu" :key="sub.name" :to="sub.link" class="nav-item sub-item">
        {{ sub.name }}
      </router-link>
    </div>

    <a href="#" class="nav-item" data-bs-toggle="collapse" data-bs-target="#system-submenu">
      System Management
    </a>
    <div class="collapse" id="system-submenu">
      <router-link v-for="sub in systemSubmenu" :key="sub.name" :to="sub.link" class="nav-item sub-item">
        {{ sub.name }}
      </router-link>
    </div>
  </nav>
</template>

<style scoped>

/* General Layout */
body {
  min-height: 100vh;
  font-family: 'Nunito', sans-serif;
  margin: 0;
  padding: 0;
}

.header {
  background-color: #DFE9DE;
  padding: 0.5rem;
  height: 60px;
  justify-content: flex-end;
  align-items: center;
  transition: margin-left 0.3s ease; /* Smooth transition */
}

.sidebar {
  background-color: #004d40;
  color: white;
  height: 100vh;
  top: 0;
  left: 0;
  padding: 0;
  overflow-y: auto;
  z-index: 1031; /* Higher than header */
  transition: left 0.3s ease;
}

.sidebar.show {
  left: 0;
}

.logo-container {
  padding: 1rem;
  text-align: center;
}

.logo-img {
  max-width: 200px;
  height: auto;
}

.main-content {
  margin-left: 250px;
  padding: 2rem;
  flex: 1;
  margin-bottom: 50px;
  transition: margin-left 0.3s ease; /* Smooth transition */
}

.nav-item {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
  display: block;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.footer {
  background-color: #666;
  color: white;
  padding: 1rem;
  height: 50px;
  text-align: left;
  margin-left: 250px;
  flex-shrink: 0;
}

/* Search box style */
.search-container {
  position: relative;
  margin-bottom: 2rem;
}

.search-container input {
  padding-left: 40px;
}

.search-container i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
}

/* Announcement Card */
.announcement-card {
  border: 1px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
}

/* Button Action */
.btn-action {
  padding: 0.25rem 1rem;
  margin-left: 0.5rem;
}

/* Pagination */
.pagination {
  justify-content: center;
  margin-top: 2rem;
}

/* Footer Links */
.footer-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.footer-links a {
  color: white;
  text-decoration: none;
  font-size: 0.9rem;
}

/* Content Wrapper */
.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Media Queries for responsiveness */
@media (max-width: 768px) {
  .sidebar {
    width: 250px;
    position: fixed;
    top: 0;
    left: -250px;
    height: 100vh;
    z-index: 1040;
  }

  .sidebar.show {
    left: 0;
  }


}

@media (min-width: 769px) {
  .mobile-menu-toggle {
    display: none;
  }

  .sidebar {
    left: 0;
  }

}

.sub-item {
  padding-left: 2rem; /* 增加缩进以区分子项 */
  font-size: 0.9rem;
  background-color: rgba(255, 255, 255, 0.05);
}

.sub-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

</style>
