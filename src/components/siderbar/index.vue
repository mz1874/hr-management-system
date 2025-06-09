<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { getUserRoutes } from '@/api/router.ts';
import { useRouter } from 'vue-router';

const router = useRouter();
const menuTree = ref([]);
const expandedMenus = ref<Record<string, boolean>>({});
const sidebarOpen = ref(false);
const isCollapsed = ref(false);
const isMobile = ref(false);

const toggleSidebar = () => {
  if (isMobile.value) {
    sidebarOpen.value = !sidebarOpen.value;
  } else {
    isCollapsed.value = !isCollapsed.value;
    updateBodyClass();
  }
};

const closeMobileSidebar = () => {
  if (isMobile.value) {
    sidebarOpen.value = false;
  }
};

watch(() => router.currentRoute.value.path, () => {
  if (!isMobile.value) {
    isCollapsed.value = true;
    updateBodyClass();
    expandedMenus.value = {};
  }
});

const updateBodyClass = () => {
  if (typeof document !== 'undefined') {
    const body = document.body;
    if (!isMobile.value && isCollapsed.value) {
      body.classList.add('sidebar-collapsed');
    } else {
      body.classList.remove('sidebar-collapsed');
    }
  }
};

const checkScreenSize = () => {
  const width = window.innerWidth;
  isMobile.value = width <= 768;

  if (isMobile.value) {
    sidebarOpen.value = false;
    isCollapsed.value = false;
  } else {
    sidebarOpen.value = true;
  }
  updateBodyClass();
};

const buildMenuTree = (routes) => {
  return routes.filter(route => !route.hidden).map(route => ({
    name: route.name,
    link: route.path ? '/home/' + route.path : null,
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

  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});
</script>

<template>
  <!-- 移动端菜单按钮 -->
  <button 
    class="mobile-menu-toggle" 
    @click="toggleSidebar"
    :class="{ 'show': isMobile }"
  >
    ☰
  </button>

  <!-- 移动端遮罩层 -->
  <div 
    v-if="isMobile && sidebarOpen" 
    class="sidebar-overlay"
    @click="closeMobileSidebar"
  ></div>

  <nav 
    class="sidebar"
    :class="{
      'show': sidebarOpen,
      'collapsed': isCollapsed && !isMobile,
      'mobile': isMobile
    }"
  >
    <!-- 折叠时只显示折叠按钮 -->
    <template v-if="isCollapsed && !isMobile">
      <button 
        class="collapse-toggle-btn" 
        @click="toggleSidebar"
        :title="'展开侧边栏'"
      >
        ☰
      </button>
    </template>

    <!-- 展开时显示Logo和完整菜单 -->
    <template v-else>
      <div class="logo-container">
        <img src="/logo.png" alt="ROWY Hardware" class="logo-img" />
        <button 
          v-if="!isMobile"
          class="collapse-toggle-btn" 
          @click="toggleSidebar"
          :title="'折叠侧边栏'"
        >
          ◄
        </button>
      </div>

      <div class="full-menu">
        <template v-for="item in menuTree" :key="item.name">
          <router-link
            :to="item.link"
            class="nav-item"
            @click="closeMobileSidebar"
          >
            {{ item.name }}
          </router-link>
        </template>
      </div>
    </template>
  </nav>
</template>

<style scoped>
body {
  min-height: 100vh;
  font-family: 'Nunito', sans-serif;
  margin: 0;
  padding: 0;
}

.sidebar {
  background-color: #406f8c;
  color: white;
  min-height: 100vh;
  width: 250px;
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: auto;
  z-index: 1031;
  transition: all 0.3s ease;
}

.sidebar.collapsed {
  width: 60px;
}

@media (max-width: 768px) {
  .sidebar.mobile {
    left: -250px;
    z-index: 1040;
  }
  .sidebar.mobile.show {
    left: 0;
  }
}

.logo-container {
  padding: 1rem;
  text-align: center;
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-img {
  max-width: 200px;
  height: auto;
  transition: all 0.3s ease;
}

.collapse-toggle-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.collapse-toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.full-menu {
  padding: 0;
}

.nav-item {
  display: block;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.mobile-menu-toggle {
  display: none;
  position: fixed;
  top: 15px;
  left: 15px;
  z-index: 1041;
  background-color: #406f8c;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 1.2rem;
}

.mobile-menu-toggle.show {
  display: block;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1039;
}
</style>
