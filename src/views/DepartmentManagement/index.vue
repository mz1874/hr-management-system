<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useDepartmentStore} from '@/stores/department.ts'
import type {Department} from "@/interface/DepartmentInterface.ts";
import Swal from "sweetalert2";

const departmentStore = useDepartmentStore()

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 20


// Modals
const showAddDepartmentModal = ref(false)
const showEditDepartmentModal = ref(false)
const showRemoveDepartmentModal = ref(false)
const newDepartmentName = ref('')
const newDepartmentSorting = ref(1)
const newDepartmentParentId = ref<number | null>(null)
const selectedDepartment = ref<Department | null>(null)

const filteredDepartments = computed(() => {
  const searchTerm = searchQuery.value.toLowerCase()
  return departmentStore.departments.filter(dept => {
    const matchesDept = dept.department_name.toLowerCase().includes(searchTerm)
    const matchesChildren = dept.children?.some(child =>
        child.department_name.toLowerCase().includes(searchTerm)
    ) || false
    return matchesDept || matchesChildren
  })
})

function disableBodyScroll() {
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = '15px';
}

function enableBodyScroll() {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

const totalPages = computed(() => Math.ceil(filteredDepartments.value.length / itemsPerPage))

const paginatedDepartments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  const flattenedDepts = flattenDepartments(filteredDepartments.value)
  return flattenedDepts.slice(start, end)
})

const addDepartment = () => {

  if (newDepartmentName.value.trim() === '') {
    alert('Please enter a department name')
    return
  }

  const newDepartment: Department = {
    id: Date.now(),
    parentId: newDepartmentParentId.value,
    department_name: newDepartmentName.value,
    sorting: newDepartmentSorting.value,
    creationTime: new Date().toISOString()
  }

  showAddDepartmentModal.value = false
  newDepartmentName.value = ''
  newDepartmentSorting.value = 1
  newDepartmentParentId.value = null
  enableBodyScroll();
  departmentStore.departmentAdd(newDepartment);
}

/**
 * 更新部门
 * @param department
 */
const openEditDepartmentModal = (department: Department) => {
  disableBodyScroll();
  selectedDepartment.value = department
  showEditDepartmentModal.value = true
}

/**
 * 保存修改
 */
const saveEditedDepartment = () => {
  enableBodyScroll();
  if(selectedDepartment.value.department_name.trim() === '') {
    Swal.fire({
      position: "top-end",
      icon: "error",
      title: "Department name can not be empty.",
      showConfirmButton: false,
      timer: 1500,
    });
    departmentStore.fetchDepartments()
  }
  if (selectedDepartment.value) {
    showEditDepartmentModal.value = false
    departmentStore.patchDepartment(selectedDepartment.value.id, selectedDepartment.value)
    selectedDepartment.value = null
  }
}

const openRemoveDepartmentModal = (department: Department) => {
  disableBodyScroll();
  selectedDepartment.value = department
  showRemoveDepartmentModal.value = true
}

const confirmRemoveDepartment = () => {
  enableBodyScroll();
  if (selectedDepartment.value) {
    departmentStore.departmentDelete(selectedDepartment.value.id);
  }
  showRemoveDepartmentModal.value = false
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const expandedIds = ref<number[]>([])

const toggleExpand = (id: number) => {
  const index = expandedIds.value.indexOf(id)
  if (index > -1) {
    expandedIds.value.splice(index, 1)
  } else {
    expandedIds.value.push(id)
  }
}

const flattenDepartments = (departments: Department[], level = 0): any[] => {
  return departments.reduce<Department[]>((acc, dept) => {
    const isExpanded = expandedIds.value.includes(dept.id)
    const searchTerm = searchQuery.value.toLowerCase()
    const children = dept.children?.filter(child =>
        searchQuery.value === '' || child.department_name.toLowerCase().includes(searchTerm)
    )
    const childrenNodes = children && isExpanded ? flattenDepartments(children, level + 1) : []
    return [
      ...acc,
      {...dept, level, hasChildren: !!children?.length},
      ...childrenNodes
    ]
  }, [])
}

onMounted(() => {
  departmentStore.fetchDepartments();
});
</script>

<template>
  <div class="p-4">
    <h1 class="mb-4">Department Management</h1>

    <!-- Table section -->
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-end mb-3">
          <button @click="showAddDepartmentModal = true; disableBodyScroll()" class="btn btn-success">Add Department</button>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
            <tr>
              <th style="width: 30px"></th>
              <th>Department Name</th>
              <th>Sorting</th>
              <th>Creation Time</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <template v-for="department in paginatedDepartments" :key="department.id">
              <tr>
                <td>
                  <i v-if="department.hasChildren"
                     class="bi cursor-pointer"
                     :class="expandedIds.includes(department.id) ? 'bi-caret-down-fill' : 'bi-caret-right-fill'"
                     @click="toggleExpand(department.id)"></i>
                </td>
                <td>
                    <span :style="{ 'margin-left': `${department.level * 20}px` }">
                      {{ department.department_name }}
                    </span>
                </td>
                <td>{{ department.sorting }}</td>
                <td>{{department.creationTime }}</td>
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
            </template>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex align-items-center mt-3 justify-content-start">
          <span class="me-3">Total: {{ filteredDepartments.length }}</span>
          <nav aria-label="Page navigation">
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="changePage(currentPage - 1)">Previous</button>
              </li>
              <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }">
                <button class="page-link" @click="changePage(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="changePage(currentPage + 1)">Next</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- 新增部门模态框 -->
    <!-- Add Department Modal -->
    <div v-if="showAddDepartmentModal" class="modal-backdrop">
      <div class="modal-content">
        <form @submit.prevent="addDepartment">
        <div class="modal-header">
          <h5 class="modal-title">Add Department</h5>
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
                required
                placeholder="Enter department name"
            >
          </div>
          <div class="mb-3">
            <label for="departmentSorting" class="form-label">Sorting</label>
            <input
                v-model.number="newDepartmentSorting"
                type="number"
                min="0"
                class="form-control"
                id="departmentSorting"
                placeholder="Enter sorting number"
            >
          </div>
          <div class="mb-3">
            <label for="departmentParent" class="form-label">Parent Department</label>
            <select
                v-model="newDepartmentParentId"
                class="form-select"
                id="departmentParent"
            >
              <option :value="null">None (Main Department)</option>
              <option
                  v-for="dept in departmentStore.flatDepartmentList"
                  :key="dept.id"
                  :value="dept.id"
              >
                {{ dept.department_name }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button
              type="button"
              class="btn btn-secondary"
              @click="showAddDepartmentModal = false; enableBodyScroll()"
          >
            Close
          </button>
          <button
              type="submit"
              class="btn btn-primary"
          >
            Add Department
          </button>
        </div>
        </form>
      </div>
    </div>

    <!-- 编辑部门模态框 -->
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
                v-model="selectedDepartment.department_name"
                type="text"
                required
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
          <div class="mb-3">
            <label for="editDepartmentParent" class="form-label">Parent Department</label>
            <select
                v-model="selectedDepartment.parentId"
                class="form-select"
                id="editDepartmentParent"
            >
              <option :value="null">None (Main Department)</option>
              <option
                  v-for="dept in departmentStore.departments"
                  :key="dept.id"
                  :value="dept.id"
                  :disabled="dept.id === selectedDepartment.id"
              >
                {{ dept.department_name }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button
              type="button"
              class="btn btn-secondary"
              @click="showEditDepartmentModal = false; enableBodyScroll()"
          >
            Cancel
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

    <!-- 删除部门模态框 -->
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
          <p>Are you sure you want to remove the department : <strong>{{ selectedDepartment?.department_name }}</strong>?</p>
          <p class="text-danger">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button
              type="button"
              class="btn btn-secondary"
              @click="showRemoveDepartmentModal = false; enableBodyScroll()"
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
  width: 100%;
  max-width: 500px;
  margin: 0 1rem;
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

.cursor-pointer {
  cursor: pointer;
}

.table tr td:first-child {
  position: relative;
}

/* Search container */
.search-container {
  position: relative;
  width: 100%;
  max-width: 300px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: gray;
}

.search-container .form-control {
  padding-left: 35px;
}

/* Pagination styles */
.page-link {
  border: 1px solid #cccccc;
}

.page-item .page-link {
  color: #008080;
}

.page-item.active .page-link {
  color: #fff;
  background-color: #008080;
  border-color: #008080;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 3px;
}
</style>
