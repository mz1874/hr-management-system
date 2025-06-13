<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getUserRoutes } from '@/api/router.ts';
import logo from '@/assets/logo.png'
const menuTree = ref([]);
const expandedMenus = ref<Record<string, boolean>>({});
const isMobile = ref(false);

const toggleMenu = (name: string) => {
  expandedMenus.value[name] = !expandedMenus.value[name];
};

const closeMobileSidebar = () => {
  if (isMobile.value) {
    // 移动端可以添加一些特殊处理逻辑
  }
};

const updateBodyClass = () => {
  if (typeof document !== 'undefined') {
    const body = document.body;
    const mainContent = document.querySelector('.main-content');
    
    if (!isMobile.value) {
      body.classList.add('has-sidebar');
      if (mainContent) {
        mainContent.style.marginLeft = '250px';
      }
    } else {
      body.classList.remove('has-sidebar');
      if (mainContent) {
        mainContent.style.marginLeft = '0';
      }
    }
  }
};

const checkScreenSize = () => {
  const width = window.innerWidth;
  isMobile.value = width <= 768;
  updateBodyClass();
};

const buildMenuTree = (routes) => {
  return routes.filter(route => !route.hidden).map(route => ({
    name: route.name,
    link: route.path ? '/main/' + route.path : null,
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
  <!-- 移动端遮罩层（可选） -->
  <div 
    v-if="isMobile" 
    class="sidebar-overlay"
    @click="closeMobileSidebar"
  ></div>

  <!-- 侧边栏 - 始终显示 -->
  <nav 
    class="sidebar"
    :class="{
      'mobile': isMobile
    }"
  >
    <!-- Logo区域 -->
    <div class="logo-container">
      <img :src="logo" alt="ROWY Hardware" class="logo-img" />
    </div>

    <!-- 菜单内容 -->
    <div class="menu-content">
      <template v-for="item in menuTree" :key="item.name">
        <!-- 父菜单（有子菜单） -->
        <div v-if="item.children && item.children.length">
          <div class="nav-item parent-item" @click="toggleMenu(item.name)">
            {{ item.name }}
            <span class="arrow-icon">
              {{ expandedMenus[item.name] ? '▲' : '▼' }}
            </span>
          </div>
          <div v-if="expandedMenus[item.name]" class="submenu">
            <router-link
              v-for="sub in item.children"
              :key="sub.name"
              :to="sub.link"
              class="nav-item sub-item"
              @click="closeMobileSidebar"
            >
              {{ sub.name }}
            </router-link>
          </div>
        </div>

        <!-- 普通一级菜单 -->
        <router-link
          v-else
          :to="item.link"
          class="nav-item"
          @click="closeMobileSidebar"
        >
          {{ item.name }}
        </router-link>
      </template>
    </div>
  </nav>
</template>

<style scoped>
/* 侧边栏 - 始终显示 */
.sidebar {
  background-color: #406f8c;
  color: white;
  height: 100vh;
  width: 250px;
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: auto;
  z-index: 1031;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  padding-top: 20px;
}

.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

/* Logo容器 */
.logo-container {
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 20px;
}

.logo-img {
  max-width: 200px;
  height: auto;
  transition: all 0.3s ease;
}

/* 菜单内容 */
.menu-content {
  padding: 0 0 0 0;
  margin-right: 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 12px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 16px;
  min-height: 40px;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #f1f1f1;
}

.parent-item {
  font-weight: bold;
}

.arrow-icon {
  font-size: 12px;
  margin-left: 8px;
}

.submenu {
  background-color: rgba(255, 255, 255, 0.05);
}

.sub-item {
  padding-left: 3rem;
  font-size: 14px;
  min-height: 36px;
}

.sub-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 移动端样式 */
@media (max-width: 768px) {
  .sidebar.mobile {
    z-index: 1040;
    width: 100%;
    padding-top: 20px;
  }
  
  .nav-item {
    font-size: 18px;
    padding: 15px 20px 15px 32px;
    min-height: 44px;
  }
  
  .sub-item {
    font-size: 16px;
    min-height: 40px;
  }
}

/* 遮罩层（移动端可选使用） */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 1030;
}

/* 小屏幕适配 */
@media screen and (max-height: 600px) {
  .sidebar {
    padding-top: 15px;
  }
  
  .logo-container {
    padding: 0.5rem;
    margin-top: 5px;
  }
  
  .logo-img {
    max-width: 120px;
  }
  
  .nav-item {
    font-size: 14px;
    padding: 8px 16px 8px 20px;
    min-height: 36px;
  }
  
  .sub-item {
    font-size: 12px;
    min-height: 32px;
    padding-left: 2rem;
  }
}

@media screen and (max-height: 450px) {
  .sidebar {
    padding-top: 10px;
  }
  
  .logo-container {
    padding: 0.3rem;
    margin-top: 0;
  }
  
  .logo-img {
    max-width: 100px;
  }
  
  .nav-item {
    font-size: 13px;
    padding: 6px 12px 6px 18px;
    min-height: 32px;
  }
  
  .sub-item {
    font-size: 11px;
    min-height: 28px;
    padding-left: 1.8rem;
  }
}
</style>