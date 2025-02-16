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
const showAddDepartmentModal = ref(false)
const showEditDepartmentModal = ref(false)
const showRemoveDepartmentModal = ref(false)
const newDepartmentName = ref('')
const newDepartmentSorting = ref(1)
const selectedDepartment = ref<Department | null>(null)

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
const itemsPerPage = 4
const totalItems = 40

const filteredDepartments = computed(() => {
  return departments.value.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !statusFilter.value || dept.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

const totalPages = computed(() => Math.ceil(totalItems / itemsPerPage))

const addDepartment = () => {
  if (newDepartmentName.value.trim() === '') {
    alert('Please enter a department name')
    return
  }

  const newDepartment: Department = {
    name: newDepartmentName.value,
    sorting: newDepartmentSorting.value,
    status: 'NORMAL',
    creationTime: new Date().toISOString()
  }

  departments.value.push(newDepartment)
  showAddDepartmentModal.value = false
  newDepartmentName.value = ''
  newDepartmentSorting.value = 1
}

const openEditDepartmentModal = (department: Department) => {
  selectedDepartment.value = department
  showEditDepartmentModal.value = true
}

const saveEditedDepartment = () => {
  if (selectedDepartment.value) {
    const index = departments.value.findIndex(dept => dept.name === selectedDepartment.value?.name)
    if (index !== -1) {
      departments.value[index] = { ...selectedDepartment.value }
    }
    showEditDepartmentModal.value = false
    selectedDepartment.value = null
  }
}

const openRemoveDepartmentModal = (department: Department) => {
  selectedDepartment.value = department
  showRemoveDepartmentModal.value = true
}

const confirmRemoveDepartment = () => {
  if (selectedDepartment.value) {
    departments.value = departments.value.filter(dept => dept.name !== selectedDepartment.value?.name)
    showRemoveDepartmentModal.value = false
    selectedDepartment.value = null
  }
}

const changePage = (page: number) => {
  currentPage.value = page
}
</script>

<template>
  <div class="p-4">
    <h2>Department Management</h2>

    <!-- Search and Filter -->
    <div class="d-flex gap-3 mb-4">
      <!-- Search Bar -->
      <div class="input-group w-50">
        <span class="input-group-text"><i class="fas fa-search"></i></span>
        <input 
          v-model="searchQuery"
          type="text" 
          class="form-control" 
          placeholder="Search Department"
        >
      </div>

      <!-- Status Filter -->
      <select 
        v-model="statusFilter"
        class="form-select w-25"
      >
        <option value="">Select Status</option>
        <option value="NORMAL">Normal</option>
        <option value="ON HOLD">On Hold</option>
      </select>
    </div>

    <!-- Add Department Button -->
    <div class="d-flex justify-content-end mb-3">
      <button 
        @click="showAddDepartmentModal = true"
        class="btn btn-success"
      >
        <i class="fas fa-plus me-2"></i>Add New Department
      </button>
    </div>

    <!-- Add Department Modal -->
    <div v-if="showAddDepartmentModal" class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Add New Department</h5>
          <button 
            type="button" 
            class="btn-close" 
            @click="showAddDepartmentModal = false"
          ></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="departmentName" class="form-label">Department Name</label>
            <input 
              v-model="newDepartmentName"
              type="text" 
              class="form-control" 
              id="departmentName" 
              placeholder="Enter department name"
            >
          </div>
          <div class="mb-3">
            <label for="departmentSorting" class="form-label">Sorting</label>
            <input 
              v-model.number="newDepartmentSorting"
              type="number" 
              class="form-control" 
              id="departmentSorting" 
              placeholder="Enter sorting number"
            >
          </div>
        </div>
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="showAddDepartmentModal = false"
          >
            Close
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="addDepartment"
          >
            Add Department
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Department Modal -->
    <div v-if="showEditDepartmentModal" class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Edit Department</h5>
          <button 
            type="button" 
            class="btn-close" 
            @click="showEditDepartmentModal = false"
          ></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="editDepartmentName" class="form-label">Department Name</label>
            <input 
              v-model="selectedDepartment.name"
              type="text" 
              class="form-control" 
              id="editDepartmentName" 
              placeholder="Enter department name"
            >
          </div>
          <div class="mb-3">
            <label for="editDepartmentSorting" class="form-label">Sorting</label>
            <input 
              v-model.number="selectedDepartment.sorting"
              type="number" 
              class="form-control" 
              id="editDepartmentSorting" 
              placeholder="Enter sorting number"
            >
          </div>
        </div>
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="showEditDepartmentModal = false"
          >
            Close
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="saveEditedDepartment"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- Remove Department Modal -->
    <div v-if="showRemoveDepartmentModal" class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Remove Department</h5>
          <button 
            type="button" 
            class="btn-close" 
            @click="showRemoveDepartmentModal = false"
          ></button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to remove <strong>{{ selectedDepartment?.name }}</strong>?</p>
        </div>
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="showRemoveDepartmentModal = false"
          >
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-danger" 
            @click="confirmRemoveDepartment"
          >
            Remove
          </button>
        </div>
      </div>
    </div>

    <!-- Departments Table -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
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
                    @click="openEditDepartmentModal(department)"
                    class="btn btn-warning btn-sm"
                  >
                    Edit
                  </button>
                  <button 
                    @click="openRemoveDepartmentModal(department)"
                    class="btn btn-danger btn-sm ms-2"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

         <!-- Pagination -->
<div class="d-flex justify-content-between align-items-center mt-3">
  <div>Total: {{ totalItems }}</div>
  <nav>
    <ul class="pagination mb-0">
      <li 
        :class="['page-item', { disabled: currentPage === 1 }]"
        @click="changePage(currentPage - 1)"
      >
        <button class="page-link">
          &laquo; <!-- Left chevron -->
        </button>
      </li>
      <li 
        v-for="page in totalPages"
        :key="page"
        :class="['page-item', { active: currentPage === page }]"
        @click="changePage(page)"
      >
        <button class="page-link">{{ page }}</button>
      </li>
      <li 
        :class="['page-item', { disabled: currentPage === totalPages }]"
        @click="changePage(currentPage + 1)"
      >
        <button class="page-link">
          &raquo; <!-- Right chevron -->
        </button>
      </li>
    </ul>
  </nav>
</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #ddd;
  padding-top: 10px;
  margin-top: 15px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
}

.btn-close:hover {
  color: #000;
}

.search-container .input-group-text {
  background: white;
  border-right: none;
}

.search-container .form-control {
  border-left: none;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  margin: 0 0.2rem;
}

.badge {
  padding: 0.5rem 1rem;
}

.rounded-circle {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table th {
  font-weight: normal;
  color: #666;
}

.pagination {
  margin-bottom: 0;
}

.card {
  border-radius: 10px;
  border: 1px solid #eee;
}
</style>
