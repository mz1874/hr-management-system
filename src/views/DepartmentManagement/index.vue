<script setup lang="ts">
import { computed, ref } from 'vue'

interface Department {
  name: string
  sorting: number
  status: 'NORMAL' | 'ON HOLD'
  creationTime: string
}

const searchQuery = ref('')
const statusFilter = ref('')

const departments = ref<Department[]>([
  {
    name: 'Department 1',
    sorting: 1,
    status: 'NORMAL',
    creationTime: '2024-06-30 11:27:07'
  },
  {
    name: 'Department 2',
    sorting: 2,
    status: 'ON HOLD',
    creationTime: '2024-06-30 11:27:07'
  },
  {
    name: 'Department 3',
    sorting: 1,
    status: 'NORMAL',
    creationTime: '2024-06-30 11:27:07'
  },
  {
    name: 'Department 4',
    sorting: 2,
    status: 'NORMAL',
    creationTime: '2024-06-30 11:27:07'
  }
])

const currentPage = ref(1)
const itemsPerPage = 10
const totalItems = 100

const filteredDepartments = computed(() => {
  return departments.value.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !statusFilter.value || dept.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

const totalPages = computed(() => Math.ceil(totalItems / itemsPerPage))

const addDepartment = () => {
  // Implement add department logic
}

const editDepartment = (department: Department) => {
  // Implement edit department logic
}

const removeDepartment = (department: Department) => {
  // Implement remove department logic
}

const changePage = (page: number) => {
  currentPage.value = page
}
</script>

<template>
  <div class="p-4">
    <h2>Department Management</h2>
    
    <!-- Search and Filter -->
    <div class="d-flex mb-3">
      <input 
        v-model="searchQuery"
        type="text" 
        class="form-control me-2" 
        placeholder="Search Department"
      >
      <select 
        v-model="statusFilter"
        class="form-select"
      >
        <option value="">Select Status</option>
        <option value="NORMAL">Normal</option>
        <option value="ON HOLD">On Hold</option>
      </select>
    </div>

    <!-- Add Department Button -->
    <button 
      @click="addDepartment"
      class="btn btn-success mb-3"
    >
      Add New Department
    </button>

    <!-- Departments Table -->
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>Department Name</th>
          <th>Sorting</th>
          <th>Status</th>
          <th>Creation Time</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="department in filteredDepartments" :key="department.name">
          <td>{{ department.name }}</td>
          <td>{{ department.sorting }}</td>
          <td>
            <span 
              :class="[
                'badge',
                department.status === 'NORMAL' ? 'bg-success' : 'bg-warning text-dark'
              ]"
            >
              {{ department.status }}
            </span>
          </td>
          <td>{{ department.creationTime }}</td>
          <td>
            <button 
              @click="editDepartment(department)"
              class="btn btn-warning btn-sm"
            >
              Edit
            </button>
            <button 
              @click="removeDepartment(department)"
              class="btn btn-danger btn-sm ms-2"
            >
              Remove
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="d-flex justify-content-between">
      <span>Total: {{ totalItems }}</span>
      <nav>
        <ul class="pagination">
          <li 
            :class="['page-item', { disabled: currentPage === 1 }]"
            @click="changePage(currentPage - 1)"
          >
            <a class="page-link" href="#">&laquo;</a>
          </li>
          <li 
            v-for="page in totalPages"
            :key="page"
            :class="['page-item', { active: currentPage === page }]"
            @click="changePage(page)"
          >
            <a class="page-link" href="#">{{ page }}</a>
          </li>
          <li 
            :class="['page-item', { disabled: currentPage === totalPages }]"
            @click="changePage(currentPage + 1)"
          >
            <a class="page-link" href="#">&raquo;</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  margin-bottom: 0;
}

.page-link {
  cursor: pointer;
}

.page-item.disabled .page-link {
  cursor: not-allowed;
}
</style>
