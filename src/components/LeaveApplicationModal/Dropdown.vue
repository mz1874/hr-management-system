<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)
const selectedFilter = ref('All')

const filters = [
  { value: 'All', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Reject', label: 'Rejected' }
]

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectFilter = (filter: string) => {
  selectedFilter.value = filter
  isOpen.value = false
  emit('filterChange', filter)
}

// Close dropdown when clicking outside
const dropdownRef = ref<HTMLElement | null>(null)
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const emit = defineEmits(['filterChange'])
</script>

<template>
  <div class="custom-dropdown" ref="dropdownRef">
    <button 
      class="filter-btn" 
      @click="toggleDropdown"
    >
      {{ selectedFilter }}
      <i class="bi bi-funnel ms-2"></i>
    </button>
    
    <div v-if="isOpen" class="dropdown-menu show">
      <a 
        v-for="filter in filters" 
        :key="filter.value"
        class="dropdown-item" 
        href="#" 
        @click.prevent="selectFilter(filter.value)"
      >
        {{ filter.label }}
      </a>
    </div>
  </div>
</template>

<style scoped>
.custom-dropdown {
  position: relative;
  display: inline-block;
}

.filter-btn {
  background-color: white;
  color: #789DBC;
  border: 1px solid #dee2e6;
  padding: 8px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.filter-btn:hover {
  background-color: #f8f9fa;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 120px;
  padding: 8px 0;
  margin-top: 4px;
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 1000;
}

.dropdown-item {
  display: block;
  padding: 8px 16px;
  color: #495057;
  text-decoration: none;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #789DBC;
  text-decoration: none;
}

.show {
  display: block;
}
</style>