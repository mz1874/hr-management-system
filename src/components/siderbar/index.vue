<script setup lang="ts">

</script>

<script lang="ts">
  export default {
    name: 'side-bar',
  }
</script>

<template>
  <!--  <router-view></router-view>-->
  <nav class="sidebar col-auto" style="border: 1px red solid">
    <div class="logo-container">
      <img src="/logo.png" alt="ROWY Hardware" class="logo-img">
    </div>
    <a href="#" class="nav-item"><i class="fas fa-home me-2"></i> Home</a>
    <a href="admin_notification.html" class="nav-item"><i class="fas fa-bell me-2"></i> Notification Center</a>
    <a href="#" class="nav-item"><i class="fas fa-chart-bar me-2"></i> KPI Management</a>
    <a href="#" class="nav-item"><i class="fas fa-calendar me-2"></i> Leave Application</a>
    <a href="admin_reward_management.html" class="nav-item"><i class="fas fa-gift me-2"></i> Reward Mall</a>
    <a href="leaderboard.html" class="nav-item"><i class="fas fa-trophy me-2"></i> Leaderboard</a>
    <a href="#" class="nav-item"><i class="fas fa-users me-2"></i> Staff Management</a>
    <a href="#" class="nav-item"><i class="fas fa-building me-2"></i> Department Management</a>
    <a href="#" class="nav-item"><i class="fas fa-clipboard me-2"></i> Evaluation Center</a>
    <a href="#" class="nav-item"><i class="fas fa-cogs me-2"></i> System Management</a>
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
</style>
