<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {getUserRoutes} from '@/api/router.ts';

const menuTree = ref([]);
const expandedMenus = ref<Record<string, boolean>>({});

const toggleMenu = (name: string) => {
  expandedMenus.value[name] = !expandedMenus.value[name];
};

const buildMenuTree = (routes) => {

  return routes.filter(route => {
    return route.hidden != true;
  }).map(route => ({
    name: route.name,
    code: route.code,
    link: route.path ? '/' + 'home/' + route.path : null,
    children: route.children?.length ? buildMenuTree(route.children) : []
  }));
};

onMounted(async () => {
  try {
    const res = await getUserRoutes();
    const routes = res.data?.data || [];
    menuTree.value = buildMenuTree(routes);
  } catch (err) {
    console.error("获取菜单失败：", err);
  }
});
</script>
<template>
  <nav class="sidebar col-auto">
    <div class="logo-container">
      <img src="/logo.png" alt="ROWY Hardware" class="logo-img"/>
    </div>

    <template v-for="item in menuTree" :key="item.name">
      <!-- 如果有子菜单 -->
      <div v-if="item.children && item.children.length">
        <a href="#" class="nav-item" @click.prevent="toggleMenu(item.name)">
          {{ item.name }}
          <span class="arrow-icon">{{ expandedMenus[item.name] ? '▲' : '▼' }}</span>
        </a>
        <div v-if="expandedMenus[item.name]" class="submenu">
          <router-link
              v-for="sub in item.children"
              :key="sub.name"
              :to="sub.link"
              class="nav-item sub-item"
          >
            {{ sub.name }}
          </router-link>
        </div>
      </div>

      <!-- 普通一级导航 -->
      <router-link
          v-else
          :to="item.link"
          class="nav-item"
      >
        {{ item.name }}
      </router-link>
    </template>
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
  background-color: #406f8c;
  color: white;
  min-height: 100vh;
  height: auto;
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
  position: relative;
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

/* 子目录样式 */
.submenu {
  background-color: rgba(0, 0, 0, 0.1);
}

.arrow-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
}
</style>
