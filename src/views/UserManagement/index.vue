<script setup lang="ts">
import { ref, computed } from 'vue'

interface Staff {
  id: number
  name: string
  dateOfBirth: string
  role: string
  department: string
  status: 'Active' | 'Inactive'
}

// State
const selectedDepartment = ref('Sales Department')
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const totalItems = 100

const staffList = ref<Staff[]>([
  {
    id: 1,
    name: 'John Smith',
    dateOfBirth: '1990-03-15',
    role: 'Sales Manager',
    department: 'Sales Department',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    dateOfBirth: '1992-07-22',
    role: 'Sales Representative',
    department: 'Sales Department',
    status: 'Active'
  },
  {
    id: 3,
    name: 'Michael Chen',
    dateOfBirth: '1988-11-30',
    role: 'Marketing Specialist',
    department: 'Marketing Department',
    status: 'Active'
  },
  {
    id: 4,
    name: 'Emily Davis',
    dateOfBirth: '1995-04-18',
    role: 'HR Manager',
    department: 'Human Resources',
    status: 'Active'
  },
  {
    id: 5,
    name: 'David Wilson',
    dateOfBirth: '1991-09-25',
    role: 'Accountant',
    department: 'Finance Department',
    status: 'Inactive'
  },
  {
    id: 6,
    name: 'Lisa Anderson',
    dateOfBirth: '1993-12-08',
    role: 'Sales Representative',
    department: 'Sales Department',
    status: 'Active'
  },
  {
    id: 7,
    name: 'James Taylor',
    dateOfBirth: '1987-06-14',
    role: 'IT Specialist',
    department: 'IT Department',
    status: 'Active'
  },
  {
    id: 8,
    name: 'Maria Garcia',
    dateOfBirth: '1994-02-28',
    role: 'Customer Service',
    department: 'Sales Department',
    status: 'Inactive'
  },
  {
    id: 9,
    name: 'Robert Brown',
    dateOfBirth: '1989-08-11',
    role: 'Operations Manager',
    department: 'Operations',
    status: 'Active'
  },
  {
    id: 10,
    name: 'Jennifer Lee',
    dateOfBirth: '1992-01-19',
    role: 'Marketing Coordinator',
    department: 'Marketing Department',
    status: 'Active'
  },
  {
    id: 11,
    name: 'William Martinez',
    dateOfBirth: '1990-05-07',
    role: 'Sales Representative',
    department: 'Sales Department',
    status: 'Active'
  },
  {
    id: 12,
    name: 'Emma Thompson',
    dateOfBirth: '1993-10-23',
    role: 'HR Specialist',
    department: 'Human Resources',
    status: 'Inactive'
  }
])

// Statistics
const statistics = computed(() => ({
  total: staffList.value.length,
  active: staffList.value.filter(staff => staff.status === 'Active').length,
  inactive: staffList.value.filter(staff => staff.status === 'Inactive').length
}))

// Computed
const filteredStaff = computed(() => {
  return staffList.value.filter(staff => {
    const matchesDepartment = !selectedDepartment.value || staff.department === selectedDepartment.value
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesDepartment && matchesSearch
  })
})

const totalPages = computed(() => Math.ceil(totalItems / itemsPerPage))

// Methods
const searchStaff = () => {
  // Implement search logic
  currentPage.value = 1
}

const addStaff = () => {
  // Implement add staff logic
}

const viewStaff = (staff: Staff) => {
  // Implement view staff logic
}

const editStaff = (staff: Staff) => {
  // Implement edit staff logic
}

const deleteStaff = (staff: Staff) => {
  // Implement delete staff logic
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}
</script>

<!-- Rest of the template and style sections remain unchanged -->
<template>
  <div class="p-4">
    <h1>Staff Management</h1>

    <!-- Department filter -->
    <div class="d-flex gap-3 mb-4">
      <select v-model="selectedDepartment" class="form-select w-25">
        <option>Sales Department</option>
        <option>Marketing Department</option>
        <option>Human Resources</option>
        <option>Finance Department</option>
        <option>IT Department</option>
        <option>Operations</option>
      </select>
      <button @click="searchStaff" class="btn btn-success">Search</button>
    </div>

    <!-- Name search -->
    <div class="search-container mb-4">
      <div class="input-group w-25">
        <span class="input-group-text"><i class="fas fa-search"></i></span>
        <input 
          v-model="searchQuery"
          type="text" 
          class="form-control" 
          placeholder="Search Full Name"
        >
      </div>
    </div>

    <!-- Table section -->
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-end mb-3">
          <button @click="addStaff" class="btn btn-success">Add New Staff</button>
        </div>

        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Date of birth</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="staff in filteredStaff" :key="staff.id">
                <td>{{ staff.id }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <i class="fas fa-user-circle me-2"></i>
                    {{ staff.name }}
                  </div>
                </td>
                <td>{{ staff.dateOfBirth }}</td>
                <td>{{ staff.role }}</td>
                <td>{{ staff.department }}</td>
                <td>
                  <span 
                    :class="[
                      'badge',
                      staff.status === 'Active' ? 'bg-success' : 'bg-warning'
                    ]"
                  >
                    {{ staff.status }}
                  </span>
                </td>
                <td>
                  <button @click="viewStaff(staff)" class="btn btn-primary btn-sm">View</button>
                  <button @click="editStaff(staff)" class="btn btn-warning btn-sm">Edit</button>
                  <button @click="deleteStaff(staff)" class="btn btn-danger btn-sm">Delete</button>
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
                <a class="page-link" href="#"><i class="fas fa-chevron-left"></i></a>
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
                <a class="page-link" href="#"><i class="fas fa-chevron-right"></i></a>
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
                <h3 class="mb-0">{{ statistics.total }}</h3>
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
                <h3 class="mb-0">{{ statistics.active }}</h3>
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
                <h3 class="mb-0">{{ statistics.inactive }}</h3>
                <span class="text-muted">Inactive</span>
              </div>
            </div>
          </div>
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
</style>
