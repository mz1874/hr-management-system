<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import type {Staff} from "@/interface/UserInterface.ts";
import useStaff from "@/hooks/useStaff.ts";
import {useDepartmentStore} from "@/stores/department.ts";
import Swal from "sweetalert2";
import {resetPassword as resPwd} from "@/api/staff.ts";
import {isSuccess} from "@/utils/httpStatus.ts";

const departmentStore = useDepartmentStore();

onMounted(() => {
  departmentStore.fetchDepartments();
})


const {
  staffData,
  search,
  deleteStaff,
  fetchAllStaffs,
  currentPage,
  isSearching,
  searchDepartmentId,
  searchName} = useStaff()

// State
const selectedDepartment = ref(0)

const searchQuery = ref('')

const itemsPerPage = 10


// Modals
const showAddStaffModal = ref(false)
const showViewStaffModal = ref(false)
const showEditStaffModal = ref(false)
const showDeleteStaffModal = ref(false)

const selectedStaff = ref<Staff>({
  id: 0,
  name: '',
  dateOfBirth: '',
  department_name: '',
  role: '',
  department: 0,
  imgUrl:'',
  status: false,
  employmentDate: new Date().toISOString().split('T')[0], // Set default to current date
  numberOfLeaves: 0,
  medicalLeaves: 0,
  annualLeaves: 0,
  totalPoints: 0
})


const totalPages = computed(() => {
  return Math.ceil(staffData.count / itemsPerPage)
})

const searchStaff = (searchData: string) => {
  const departmentId = selectedDepartment.value === 0 ? null : selectedDepartment.value;
  search(searchData, departmentId);
}


const openAddStaffModal = () => {
  selectedStaff.value = {
    id: 1,
    name: '',
    dateOfBirth: '',
    department_name: '',
    role: '',
    department: selectedDepartment.value,
    status: false,
    imgUrl:'',
    employmentDate: new Date().toISOString().split('T')[0], // Will be set automatically
    numberOfLeaves: 0,
    medicalLeaves: 0,
    annualLeaves: 0,
    totalPoints: 0
  }
  showAddStaffModal.value = true
}

const openViewStaffModal = (staff: Staff) => {
  selectedStaff.value = {...staff}
  showViewStaffModal.value = true
}

const openEditStaffModal = (staff: Staff) => {
  selectedStaff.value = {...staff}
  showEditStaffModal.value = true
}

const openDeleteStaffModal = (staff: Staff) => {
  selectedStaff.value = staff

  showDeleteStaffModal.value = true
}

const addStaff = () => {
  staffData.results.push({...selectedStaff.value})
  showAddStaffModal.value = false
}

const saveEditedStaff = () => {
  const index = staffData.results.findIndex(staff => staff.id === selectedStaff.value.id)
  if (index !== -1) {
    staffData.results[index] = {...selectedStaff.value}
  }
  showEditStaffModal.value = false
}

const confirmDeleteStaff = () => {
  deleteStaff(selectedStaff.value.id)
  showDeleteStaffModal.value = false
}

const changePage = (page: number) => {
  if (isSearching.value) {
    search(searchName.value, searchDepartmentId.value, page);
  } else {
    fetchAllStaffs(page);
  }
}

function onImageSelected(event) {
  const file = event.target.files[0];
  if (file) {
    // selectedStaff.imgFile = file;
    selectedStaff.value.imgUrl = URL.createObjectURL(file);
  }
}


function resetPassword(staff: Staff) {
  Swal.fire({
    title: "Confirmation of reset password?",
    text: "The current password will be reset!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, reset it!"
  }).then((result) => {
    if (result.isConfirmed) {
      resPwd(staff.id).then((res) => {
        if (isSuccess(res.status)) {
          Swal.fire({
            title: "Reset password successfully!",
            text: "The password was reset successfully!.",
            icon: "success"
          });
        }
      })
    }
  });
}
</script>

<template>
  <div class="p-4">
    <h1 class="mb-4">Staff Management</h1> <!-- Added margin-bottom -->

    <div class="d-flex gap-3 mb-4 align-items-center">
      <select v-model.number="selectedDepartment" class="form-select">
        <option value="0" selected>All departments</option>
        <option
            v-for="dept in departmentStore.flatDepartmentList"
            :key="dept.id"
            :value="dept.id"
        >
          {{ dept.department_name }}
        </option>
      </select>

      <form class="search-container" role="search">
        <i class="fas fa-search search-icon"></i>
        <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="Search Name"
        >
      </form>
      <button @click="searchStaff(searchQuery)" class="btn btn-primary">Search</button>
    </div>

    <!-- Table section -->
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-end mb-3">
          <button @click="openAddStaffModal" class="btn btn-success">Add New Staff</button>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Date of birth</th>
              <th>Department</th>
              <th>Status</th>
              <th>Employment Date</th>
              <th>No of Leaves</th> <!-- Add new column header -->
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="staff in staffData.results" :key="staff.id">
              <td>{{ staff.id }}</td>
              <td>{{ staff.name }}</td> <!-- Remove the icon div wrapper -->
              <td>{{ staff.dateOfBirth }}</td>
              <td>{{ staff.department_name }}</td>
              <td>
                  <span
                      :class="[
                      'badge',
                      staff.status ? 'bg-success' : 'bg-warning'
                    ]"
                  >
                    {{ staff.status ? "Active" : "Inactive" }}
                  </span>
              </td>
              <td>{{ staff.employmentDate }}</td>
              <td>{{ staff.numberOfLeaves }}</td> <!-- Add new column -->
              <td>
                <button @click="openViewStaffModal(staff)" class="btn btn-primary btn-sm">View</button>
                <button @click="resetPassword(staff)" class="btn btn-secondary btn-sm">reset</button>
                <button @click="openEditStaffModal(staff)" class="btn btn-warning btn-sm">Edit</button>
                <button @click="openDeleteStaffModal(staff)" class="btn btn-danger btn-sm">Delete</button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="d-flex align-items-center mt-3 justify-content-start">
          <nav aria-label="Page navigation">
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="changePage(currentPage - 1)">Previous</button>
              </li>
              <li
                  class="page-item"
                  v-for="page in totalPages"
                  :key="page"
                  :class="{ active: page === currentPage }"
              >
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

    <!-- Statistics Cards -->
    <div class="row mt-4">
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="rounded-circle bg-primary p-3 me-3">
                <i class="fas fa-users text-white"></i>
              </div>
              <div>
                <h3 class="mb-0">{{ staffData.summary.total_users }}</h3>
                <span class="text-muted">Total Staff</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="rounded-circle bg-success p-3 me-3">
                <i class="fas fa-user-check text-white"></i>
              </div>
              <div>
                <h3 class="mb-0">{{ staffData.summary.active_users }}</h3>
                <span class="text-muted">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="rounded-circle bg-warning p-3 me-3">
                <i class="fas fa-user-clock text-white"></i>
              </div>
              <div>
                <h3 class="mb-0">{{ staffData.summary.inactive_users }}</h3>
                <span class="text-muted">Inactive</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Staff Modal -->
    <div v-if="showAddStaffModal" class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Add New Staff</h5>
          <button
              type="button"
              class="btn-close"
              @click="showAddStaffModal = false"
          ></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="staffName" class="form-label">Name</label>
            <input
                v-model="selectedStaff.name"
                type="text"
                class="form-control"
                id="staffName"
                placeholder="Enter name"
            >
          </div>

          <div class="mb-3">
            <label for="staffImage" class="form-label">Profile Image</label>
            <input
                type="file"
                class="form-control"
                id="staffImage"
                accept="image/*"
                @change="onImageSelected"
            >
          </div>

          <div v-if="selectedStaff.imgUrl" class="mb-3">
            <img
                :src="selectedStaff.imgUrl"
                alt="Profile Preview"
                class="img-thumbnail"
                style="max-width: 150px;"
            >
          </div>


          <div class="mb-3">
            <label for="staffDateOfBirth" class="form-label">Date of Birth</label>
            <input
                v-model="selectedStaff.dateOfBirth"
                type="date"
                class="form-control"
                id="staffDateOfBirth"
                placeholder="Enter date of birth"
            >
          </div>
          <div class="mb-3">
            <label for="staffRole" class="form-label">Role</label>
            <input
                v-model="selectedStaff.role"
                type="text"
                class="form-control"
                id="staffRole"
                placeholder="Enter role"
            >
          </div>
          <div class="mb-3">
            <label for="staffDepartment" class="form-label">Department</label>
            <select
                v-model="selectedStaff.department"
                class="form-select"
                id="staffDepartment"
            >
              <option>Sales Department</option>
              <option>Marketing Department</option>
              <option>Human Resources</option>
              <option>Finance Department</option>
              <option>IT Department</option>
              <option>Operations</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="staffStatus" class="form-label">Status</label>
            <select
                v-model="selectedStaff.status"
                class="form-select"
                id="staffStatus"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Employment Date</label>
            <input
                :value="selectedStaff.employmentDate"
                type="date"
                class="form-control"
            >
          </div>
        </div>
        <div class="modal-footer">
          <button
              type="button"
              class="btn btn-secondary"
              @click="showAddStaffModal = false"
          >
            Close
          </button>
          <button
              type="button"
              class="btn btn-primary"
              @click="addStaff"
          >
            Add Staff
          </button>
        </div>
      </div>
    </div>

    <!-- View Staff Modal -->
    <div v-if="showViewStaffModal" class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">View Staff</h5>
          <button
              type="button"
              class="btn-close"
              @click="showViewStaffModal = false"
          ></button>
        </div>
        <div class="modal-body">
          <p><strong>Name:</strong> {{ selectedStaff.name }}</p>
          <div class="mb-3">
            <label class="form-label">Profile Picture</label>
            <img
                v-if="selectedStaff.imgUrl"
                :src="selectedStaff.imgUrl"
                alt="Profile"
                class="img-thumbnail"
                style="max-height: 150px;"
            >
          </div>
          <p><strong>Date of Birth:</strong> {{ selectedStaff.dateOfBirth }}</p>
          <p><strong>Role:</strong> {{ selectedStaff.role }}</p>
          <p><strong>Department:</strong> {{ selectedStaff.department }}</p>
          <p><strong>Status:</strong> {{ selectedStaff.status }}</p>
          <p><strong>Employment Date:</strong> {{ selectedStaff.employmentDate }}</p>
          <p v-if="selectedStaff.resignationDate">
            <strong>Resignation Date:</strong> {{ selectedStaff.resignationDate }}
          </p>
          <div class="leaves-info">
            <p><strong>Total Leaves:</strong> {{ selectedStaff.numberOfLeaves }}</p>
            <p class="ms-3"><strong>Medical Leaves:</strong> {{ selectedStaff.medicalLeaves }}</p>
            <p class="ms-3"><strong>Annual Leaves:</strong> {{ selectedStaff.annualLeaves }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button
              type="button"
              class="btn btn-secondary"
              @click="showViewStaffModal = false"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Staff Modal -->
    <div v-if="showEditStaffModal" class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Edit Staff</h5>
          <button
              type="button"
              class="btn-close"
              @click="showEditStaffModal = false"
          ></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="editStaffName" class="form-label">Name</label>
            <input
                v-model="selectedStaff.name"
                type="text"
                class="form-control"
                id="editStaffName"
                placeholder="Enter name"
            >
          </div>
          <div class="mb-3">
            <label class="form-label">Profile Picture</label>
            <input
                type="file"
                accept="image/*"
                @change="onImageSelected"
                class="form-control"
            >
            <img
                v-if="selectedStaff.imgUrl"
                :src="selectedStaff.imgUrl"
                alt="Profile"
                class="img-thumbnail mt-2"
                style="max-height: 150px;"
            >
          </div>
          <div class="mb-3">
            <label for="editStaffDateOfBirth" class="form-label">Date of Birth</label>
            <input
                v-model="selectedStaff.dateOfBirth"
                type="date"
                class="form-control"
                id="editStaffDateOfBirth"
                placeholder="Enter date of birth"
            >
          </div>
          <div class="mb-3">
            <label for="editStaffRole" class="form-label">Role</label>
            <input
                v-model="selectedStaff.role"
                type="text"
                class="form-control"
                id="editStaffRole"
                placeholder="Enter role"
            >
          </div>
          <div class="mb-3">
            <label for="editStaffDepartment" class="form-label">Department</label>
            <select v-model="selectedStaff.department" class="form-select" id="editStaffDepartment">
              <option :value="selectedStaff.department">{{ selectedStaff.department_name }}</option>
              <option
                  v-for="item in departmentStore.flatDepartmentList.filter(dept => dept.department_name !== selectedStaff.department_name)"
                  :key="item.id"
                  :value="item.id"
              >
                {{ item.department_name }}
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label for="editStaffStatus" class="form-label">Status</label>
            <select
                v-model="selectedStaff.status"
                class="form-select"
                id="editStaffStatus"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Employment Date</label>
            <input
                :value="selectedStaff.employmentDate"
                type="date"
                class="form-control"
                disabled
            >
          </div>
        </div>
        <div class="modal-footer">
          <button
              type="button"
              class="btn btn-secondary"
              @click="showEditStaffModal = false"
          >
            Cancel
          </button>
          <button
              type="button"
              class="btn btn-primary"
              @click="saveEditedStaff"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Staff Modal -->
    <div v-if="showDeleteStaffModal" class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Delete Staff</h5>
          <button
              type="button"
              class="btn-close"
              @click="showDeleteStaffModal = false"
          ></button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete the staff :"{{ selectedStaff.name }}"?</p>
          <p>This will set their resignation date to today.</p>
          <p class="text-danger">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button
              type="button"
              class="btn btn-secondary"
              @click="showDeleteStaffModal = false"
          >
            Cancel
          </button>
          <button
              type="button"
              class="btn btn-danger"
              @click="confirmDeleteStaff"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  margin: 0 1rem;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
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

.leaves-info p {
  margin-bottom: 0.5rem;
}
</style>
