<script setup lang="ts">
import {ref, computed, onMounted} from 'vue'
import type {Staff} from "@/interface/UserInterface.ts";
import useStaff from "@/hooks/useStaff.ts";
import {useDepartmentStore} from "@/stores/department.ts";
import Swal from "sweetalert2";
import {resetPassword as resPwd} from "@/api/staff.ts";
import {isSuccess} from "@/utils/httpStatus.ts";
import {pageRoles} from "@/api/role.ts"
import type {RoleItem} from "@/interface/RoleInterface.ts";
import dayjs from "dayjs";
import {getLeaveTypes, getLeaveBalance} from '@/api/leave.ts';
import { uploadFile } from '@/api/file_upload';
import {BASE_URL} from "@/api/axios.ts";

const departmentStore = useDepartmentStore();
const tableData = ref<RoleItem[]>([]);

const leaveTypes = ref<{ id: number, name: string, description: string }[]>([]);
const leaveEntitlements = ref<{ [key: string]: number }>({});

function fetchRoles() {
  pageRoles(1, 1000).then(res => {
    if (isSuccess(res.status)) {
      tableData.value = res.data.data.results.map((item: any) => ({
        id: item.id,
        name: item.name,
        permissions: item.permissions,
        createdOn: dayjs(item.create_time).format("YYYY-MM-DD")
      }));
    }
  }).catch(error => {
    console.error("Error fetch roles:", error);
  })
}

function getRoleNameById(id: number) {
  const role = tableData.value.find(r => r.id === id);
  return role ? role.name : 'Unknown';
}

onMounted(() => {
  departmentStore.fetchDepartments();
  getLeaveTypes().then((res) => {
    leaveTypes.value = res.data.data.results;
  })
  console.log(leaveTypes.value)
  fetchRoles();
})


const {
  staffData,
  search,
  deleteStaff,
  fetchAllStaffs,
  currentPage,
  isSearching,
  searchDepartmentId,
  searchName,
  handlerAddStaff,
  handlerEditStaff
} = useStaff()

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
  username: '',
  password: '123456',
  email: '',
  date_of_birth: '',
  department_name: '',
  staffName: "",
  roles: [],
  department: 0,
  picture : null,
  imgUrl: '',
  status: false,
  employment_time: new Date().toISOString().split('T')[0], // Set default to current date
  leave_entitlements: []
})

const imageUrl = computed(() => {
  const url = selectedStaff.value.imgUrl;
  if (!url) return '';
  return url.startsWith('http') ? url : BASE_URL + url;
})

const totalPages = computed(() => {
  return Math.ceil(staffData.count / itemsPerPage)
})

const searchStaff = (searchData: string) => {
  const departmentId = selectedDepartment.value === 0 ? null : selectedDepartment.value;
  search(searchData, departmentId);
}

function disableBodyScroll() {
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = '15px';
}

function enableBodyScroll() {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

const openAddStaffModal = () => {
  disableBodyScroll();
  selectedStaff.value = {
    id: 1,
    username: '',
    password: '123456',
    date_of_birth: '',
    department_name: '',
    email: '',
    roles: [],
    department: selectedDepartment.value,
    picture : null,
    status: false,
    imgUrl: '',
    employment_time: new Date().toISOString().split('T')[0], // Will be set automatically
    totalPoints: 0,
    leave_entitlements: []
  }
  if (Array.isArray(leaveTypes.value)) {
    leaveEntitlements.value = {};
    leaveTypes.value.forEach(type => {
      leaveEntitlements.value[type.name] = 0;
    });
  } else {
    console.warn("leaveTypes.value is not ready:", leaveTypes.value);
  }
  showAddStaffModal.value = true
}


const openViewStaffModal = async (staff: Staff) => {
  disableBodyScroll();
  selectedStaff.value = {...staff};
  try {
    const res = await getLeaveBalance({userId: staff.id});
    if (res.status === 200) {
      selectedStaff.value.leaveBalances = res.data.data.map((item: any) => ({
        type: item.type,
        code: item.code,
        year: item.year,
        totalDays: item.total_days,
        usedDays: item.used_days,
        remainingDays: item.remaining_days,
      }));
    }
  } catch (err) {
    console.error("Failed to load leave balance", err);
  }
  console.log('Opening View Staff modal for:', staff);
  showViewStaffModal.value = true;
};


const openEditStaffModal = async (staff: Staff) => {
  disableBodyScroll();
  selectedStaff.value = {...staff};
  try {
    const res = await getLeaveBalance({userId: staff.id});
    if (res.status === 200) {
      selectedStaff.value.leaveBalances = res.data.data.map((item: any) => ({
        type: item.type,
        code: item.code,
        year: item.year,
        totalDays: item.total_days,
        usedDays: item.used_days,
        remainingDays: item.remaining_days,
      }));
    }
  } catch (err) {
    console.error("Failed to load leave balances", err);
  }

  showEditStaffModal.value = true;
};


const openDeleteStaffModal = (staff: Staff) => {
  disableBodyScroll();
  selectedStaff.value = staff
  showDeleteStaffModal.value = true
}

const addStaff = () => {
  selectedStaff.value.leave_entitlements = Object.entries(leaveEntitlements.value).map(([code, days]) => ({
    code,
    days
  }));
  handlerAddStaff(selectedStaff.value)
  enableBodyScroll();
  showAddStaffModal.value = false
}

const saveEditedStaff = () => {
  handlerEditStaff(selectedStaff.value)
  showEditStaffModal.value = false
  enableBodyScroll();
}

const confirmDeleteStaff = () => {
  deleteStaff(selectedStaff.value.id)
  showDeleteStaffModal.value = false
  enableBodyScroll();
}

const changePage = (page: number) => {
  if (isSearching.value) {
    search(searchName.value, searchDepartmentId.value, page);
  } else {
    fetchAllStaffs(page);
  }
}

function hasAdminRole(roleIds: number[]): boolean {
  return roleIds.some(roleId => {
    const role = tableData.value.find(r => r.id === roleId);
    return role?.name.toLowerCase() === 'admin';
  });
}

function onImageSelected(event) {
  const file = event.target.files[0];
  if (file) {
    selectedStaff.value.imgUrl = URL.createObjectURL(file);
    uploadFile(file).then(msg=>{
        const res = msg.data.data;
        selectedStaff.value.imgUrl = res.file_url;
        selectedStaff.value.picture = res.id;
        console.log(selectedStaff.value)
    }).catch(err=>{

    })

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
              <th>Account</th>
              <th>Department</th>
              <th>Status</th>
              <th>No of Leaves</th> <!-- Add new column header -->
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="staff in staffData.results" :key="staff.id">
              <td>{{ staff.id }}</td>
              <td>{{ staff.staffName }}</td>
              <td>{{ staff.username }}</td>
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
              <td>{{ staff.medicalLeaves + staff.annualLeaves }}</td>
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
      <form @submit.prevent="addStaff">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add New Staff</h5>
            <button
                type="button"
                class="btn-close"
                @click="showAddStaffModal = false; enableBodyScroll()"
            ></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label for="account" class="form-label">Account</label>
                <input
                    v-model="selectedStaff.username"
                    type="text"
                    class="form-control"
                    id="account"
                    placeholder="Enter account"
                    required
                >
              </div>
              <div class="col-md-6 mb-3">
                <label for="staffName" class="form-label">Staff Name</label>
                <input
                    v-model="selectedStaff.staffName"
                    type="text"
                    class="form-control"
                    id="staffName"
                    placeholder="Enter name"
                    required
                >
              </div>

            </div>


            <div class="row">
              <div class="col-md-12 mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                    v-model="selectedStaff.email"
                    type="email"
                    class="form-control"
                    id="email"
                    placeholder="Enter email"
                    required
                >
              </div>
            </div>

            <div class="row">
              <div
                  class="mb-3"
                  v-for="type in leaveTypes.filter(t => ['AL', 'MC'].includes(t.name))"
                  :key="type.name"
              >
                <label class="form-label">{{ type.description }} Entitlement</label>
                <input
                    v-model.number="leaveEntitlements[type.name]"
                    type="number"
                    min="0"
                    class="form-control"
                    :placeholder="`e.g., 10`"
                >
              </div>
            </div>

            <div class="row">
              <div class="mb-3 col-md-6">
                <label for="staffImage" class="form-label">Profile Image</label>
                <input
                    type="file"
                    class="form-control"
                    id="staffImage"
                    accept="image/*"
                    @change="onImageSelected"
                >
              </div>
              <div v-if="selectedStaff.imgUrl" class="mb-3 col-md-6">
                <img
                    :src="selectedStaff.imgUrl"
                    alt="Profile Preview"
                    class="img-thumbnail"
                    style="max-width: 150px;"
                >
              </div>
            </div>

            <div class="row">
              <div class="mb-3 col-md-6">
                <label for="staffDateOfBirth" class="form-label">Date of Birth</label>
                <input
                    v-model="selectedStaff.date_of_birth"
                    type="date"
                    class="form-control"
                    id="staffDateOfBirth"
                    placeholder="Enter date of birth"
                    required
                >
              </div>

              <div class="mb-3 col-md-6">
                <label for="staffDepartment" class="form-label">Department</label>
                <select
                    v-model="selectedStaff.department"
                    class="form-select"
                    id="staffDepartment"
                    required
                >
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

            <div class="row">
              <div class="mb-3 col-md-6">
                <label for="staffStatus" class="form-label">Status</label>
                <select
                    v-model="selectedStaff.status"
                    class="form-select"
                    id="staffStatus"
                    required
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div class="mb-3 col-md-6">
                <label class="form-label">Employment Date</label>
                <input
                    :value="selectedStaff.employment_time"
                    type="date"
                    class="form-control"
                    required
                >
              </div>
            </div>


            <div class="row">
              <div class="mb-3 col-md-6">
                <label class="form-label">Roles</label>
                <div class="btn-group flex-wrap" role="group">
                  <div
                      v-for="role in tableData"
                      :key="role.id"
                      class="form-check d-inline-block me-2 mb-2"
                  >
                    <input
                        type="checkbox"
                        class="btn-check"
                        :id="'btn-check-' + role.id"
                        :value="role.id"
                        v-model="selectedStaff.roles"
                        autocomplete="off"
                    />
                    <label
                        class="btn btn-outline-primary"
                        :for="'btn-check-' + role.id"
                    >
                      {{ role.name }}
                    </label>
                  </div>
                </div>
              </div>

              <!-- 显示选中的角色 -->
              <div class="mb-3 col-md-6">
                <label class="form-label">Selected Roles:</label>
                <div class="d-flex flex-wrap gap-2">
              <span
                  v-for="roleId in selectedStaff.roles"
                  :key="roleId"
                  class="badge bg-info"
              >
                {{ getRoleNameById(roleId) }}
              </span>
                </div>
              </div>
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
            <button type="submit" class="btn btn-primary">
              Add Staff
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- View Staff Modal -->
    <div v-if="showViewStaffModal" class="modal-backdrop">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">View Staff</h5>
          <button
              type="button"
              class="btn-close"
              @click="showViewStaffModal = false; enableBodyScroll()"
          ></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Account</label>
              <input
                  :value="selectedStaff.username"
                  type="text"
                  class="form-control"
                  disabled
              >
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Staff name</label>
              <input
                  :value="selectedStaff.staffName"
                  type="text"
                  class="form-control"
                  disabled
              >
            </div>

            <div class="row">
              <div class="col-md-12 mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                    v-model="selectedStaff.email"
                    type="email"
                    class="form-control"
                    id="email"
                    disabled
                >
              </div>
            </div>

          </div>

          <div class="row">
            <div class="mb-3 col-md-6">
              <label class="form-label">Profile Image</label>
              <div v-if="selectedStaff.imgUrl">
                <img
                    :src="BASE_URL + selectedStaff.imgUrl"
                    alt="Profile Preview"
                    class="img-thumbnail"
                    style="max-width: 150px;"
                >
              </div>
              <div v-else class="text-muted">No image</div>
            </div>
          </div>

          <div class="row">
            <div class="mb-3 col-md-6">
              <label class="form-label">Date of Birth</label>
              <input
                  :value="selectedStaff.date_of_birth"
                  type="date"
                  class="form-control"
                  disabled
              >
            </div>

            <div class="mb-3 col-md-6">
              <label class="form-label">Department</label>
              <input
                  :value="selectedStaff.department_name"
                  type="text"
                  class="form-control"
                  disabled
              >
            </div>
          </div>

          <div class="row">
            <div class="mb-3 col-md-6">
              <label class="form-label">Status</label>
              <input
                  :value="selectedStaff.status ? 'Active' : 'Inactive'"
                  type="text"
                  class="form-control"
                  disabled
              >
            </div>
            <div class="mb-3 col-md-6">
              <label class="form-label">Employment Date</label>
              <input
                  :value="selectedStaff.employment_time"
                  type="date"
                  class="form-control"
                  disabled
              >
            </div>
          </div>

          <!-- 修改后的角色显示部分 -->
          <div class="row">
            <div class="mb-3 col-md-12">
              <label class="form-label">Roles</label>
              <div class="d-flex flex-wrap gap-2" style="min-height: 40px;">
                <template v-if="selectedStaff.roles && selectedStaff.roles.length > 0">
              <span
                  v-for="roleId in selectedStaff.roles"
                  :key="roleId"
                  class="badge bg-info"
              >
                {{ getRoleNameById(roleId) }}
              </span>
                </template>
                <span v-else class="text-muted">No roles assigned</span>
              </div>
            </div>
          </div>


          <p v-if="selectedStaff.resignationDate">
            <strong>Resignation Date:</strong> {{ selectedStaff.resignationDate }}
          </p>
          <div class="leaves-info" v-if="selectedStaff.leaveBalances && selectedStaff.leaveBalances.length">
            <p><strong>Leave Balances:</strong></p>
            <ul class="ms-3">
              <li v-for="leave in selectedStaff.leaveBalances" :key="leave.code">
                <template v-if="['AL', 'MC'].includes(leave.code)">
                  {{ leave.type }} ({{ leave.code }}): {{ leave.remainingDays }} remaining / {{ leave.totalDays }} total
                </template>
                <template v-else>
                  {{ leave.type }} ({{ leave.code }}): {{ leave.usedDays }} used
                </template>
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button
              type="button"
              class="btn btn-secondary"
              @click="showViewStaffModal = false;enableBodyScroll()"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Staff Modal -->
    <div v-if="showEditStaffModal" class="modal-backdrop">
      <form @submit.prevent="saveEditedStaff">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Edit Staff</h5>
          <button
              type="button"
              class="btn-close"
              @click="showEditStaffModal = false; enableBodyScroll()"
          ></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="editStaffName" class="form-label">Account</label>
              <input
                  v-model="selectedStaff.username"
                  type="text"
                  class="form-control"
                  id="editStaffName"
                  disabled
                  required
                  placeholder="Enter account"
              >
            </div>
            <div class="col-md-6 mb-3">
              <label for="staffName" class="form-label">Staff Name</label>
              <input
                  v-model="selectedStaff.staffName"
                  type="text"
                  class="form-control"
                  id="staffName"
                  required
                  placeholder="Enter staff name"
              >
            </div>

          </div>

          <div class="row">
              <div class="col-md-12 mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                    v-model="selectedStaff.email"
                    type="email"
                    class="form-control"
                    id="email"
                    required
                >
            </div>

          </div>

          <div class="row">
            <div v-if="selectedStaff.imgUrl" class="mb-3 col-md-6">
              <div v-if="imageUrl" class="mb-3 col-md-6">
                <img
                    :src="imageUrl"
                    alt="Profile Preview"
                    class="img-thumbnail"
                    style="max-width: 150px;"
                >
              </div>
            </div>
            <div class="mb-3 col-md-6">
              <label for="editStaffImage" class="form-label">Profile Image</label>
              <input
                  type="file"
                  class="form-control"
                  id="editStaffImage"
                  accept="image/*"
                  @change="onImageSelected"
              >
            </div>
          </div>

          <div class="row">
            <div class="mb-3 col-md-6">
              <label for="editStaffDateOfBirth" class="form-label">Date of Birth</label>
              <input
                  v-model="selectedStaff.date_of_birth"
                  type="date"
                  required
                  class="form-control"
                  id="editStaffDateOfBirth"
                  placeholder="Enter date of birth"
              >
            </div>

            <div class="mb-3 col-md-6">
              <label for="editStaffDepartment" class="form-label">Department</label>
              <select
                  v-model="selectedStaff.department"
                  class="form-select"
                  required
                  id="editStaffDepartment"
                  :disabled="hasAdminRole(selectedStaff.roles)"
              >
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

          <div class="row">
            <div class="mb-3 col-md-6">
              <label for="editStaffStatus" class="form-label">Status</label>
              <select
                  v-model="selectedStaff.status"
                  class="form-select"
                  required
                  id="editStaffStatus"
              >
                <option :value="true">Active</option>
                <option :value="false">Inactive</option>
              </select>
            </div>
            <div class="mb-3 col-md-6">
              <label class="form-label">Employment Date</label>
              <input
                  :value="selectedStaff.employment_time"
                  required
                  type="date"
                  class="form-control"
                  disabled
              >
            </div>
          </div>

          <div class="row">
            <div class="mb-3 col-md-6">
              <label class="form-label">Roles</label>
              <div class="btn-group flex-wrap" role="group">
                <div
                    v-for="role in tableData"
                    :key="role.id"
                    class="form-check d-inline-block me-2 mb-2"
                >
                  <input
                      type="checkbox"
                      class="btn-check"
                      :id="'edit-btn-check-' + role.id"
                      :value="role.id"
                      v-model="selectedStaff.roles"
                      autocomplete="off"
                  />
                  <label
                      class="btn btn-outline-primary"
                      :for="'edit-btn-check-' + role.id"
                  >
                    {{ role.name }}
                  </label>
                </div>
              </div>
            </div>

            <!-- 显示选中的角色 -->
            <div class="mb-3 col-md-6">
              <label class="form-label">Selected Roles:</label>
              <div class="d-flex flex-wrap gap-2">
          <span
              v-for="roleId in selectedStaff.roles"
              :key="roleId"
              class="badge bg-info"
          >
            {{ getRoleNameById(roleId) }}
          </span>
              </div>
            </div>
          </div>
          <div class="row">
            <div
                class="mb-3"
                v-for="leave in selectedStaff.leaveBalances?.filter(l => ['AL', 'MC'].includes(l.code))"
                :key="leave.code"
            >
              <label class="form-label">{{ leave.type }} ({{ leave.code }}) Entitlement</label>
              <input
                  type="number"
                  class="form-control"
                  v-model.number="leave.totalDays"
                  required
                  :min="0"
                  :placeholder="`e.g. 10`"
              />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
              type="button"
              class="btn btn-secondary"
              @click="showEditStaffModal = false; enableBodyScroll()"
          >
            Cancel
          </button>
          <button
              type="submit"
              class="btn btn-primary"
          >
            Save Changes
          </button>
        </div>
      </div>
      </form>

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
          <p>Are you sure you want to delete the staff :"{{ selectedStaff.username }}"?</p>
          <p class="text-danger">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button
              type="button"
              class="btn btn-secondary"
              @click="showDeleteStaffModal = false; enableBodyScroll()"
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

.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
  overflow-y: auto;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 800px;
  max-height: 90vh; /* ✅ 限制最大高度 */
  overflow-y: auto; /* ✅ 内容太多时可滚动 */
  padding: 1rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.2);
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
.no-scroll {
  overflow: hidden;
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
