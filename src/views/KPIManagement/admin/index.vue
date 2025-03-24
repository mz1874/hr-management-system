<template>
  <div class="d-flex mb-4">
    <h2>Department KPI Management</h2>
  </div>

  <!-- department filter -->
  <div class="gap-3 mb-4">
    <select class="form-select w-25" v-model="selectedDepartment">
      <option>Sales Department</option>
      <option>Marketing Department</option>
      <option>Account Department</option>
      <option>HR Department</option>
      <option>Warehouse Department</option>
      <option>Logistics Department</option>
      <option>Supply Chain Department</option>
    </select>
  </div>

  <div class="line mb-4"></div>

  <!-- Search and filter -->
  <div class="d-flex gap-3 mb-4 mt-3">
    <!-- search task name -->
    <div class="input-group w-25">
      <span class="input-group-text"><i class="fas fa-search"></i></span>
      <input v-model="searchTaskName" type="text" class="form-control" placeholder="Search Task Name">
    </div>
    <!-- search status -->
    <select v-model="selectedStatus" class="form-select w-25">
      <option value="">All Status</option>
      <option>Not Yet Started</option>
      <option>Completed</option>
      <option>Ongoing</option>
      <option>Delayed</option>
    </select>
  </div>

  <!-- Table section -->
  <div class="card">
    <div class="card-body">
      <div class="d-flex justify-content-end mb-3">
        <button @click="openCreateTaskModal" class="btn btn-success">Create A New Task</button>
      </div>

      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Task Name</th>
              <th>Start Date</th>
              <th>Due Date</th>
              <th>Total Target</th>
              <th>Current</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in paginatedTasks" :key="task.id">
              <td>{{ task.id }}</td>
              <td>{{ task.taskName }}</td>
              <td>{{ task.startDate }}</td>
              <td>{{ task.completionDate }}</td>
              <td>{{ getTotalTarget(task) }} {{ task.target.unit }}</td>
              <td>180</td>
              <td>
                <span :class="['badge',
                    task.status === 'Completed' ? 'bg-success' : 
                    task.status === 'Ongoing' ? 'bg-warning' : 
                    task.status === 'Delayed' ? 'bg-danger' : 'bg-primary'
                  ]">
                  {{ task.status }}
                </span>
              </td>
              <td>
                <!-- <button @click="openViewTaskModal(task)" class="btn btn-primary btn-sm">View</button> -->
                <button @click="goToEmployeeDetailsPage()" class="btn btn-primary btn-sm">Employee Details</button>
                <button @click="openEditTaskModal(task)" class="btn btn-warning btn-sm">Edit</button>
                <button @click="openDeleteTaskModal(task)" class="btn btn-danger btn-sm">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Statistics Cards -->
      <div class="row mt-4">
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body d-flex align-items-center justify-content-center">
              <div class="circle circle-total-task">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-text" viewBox="0 0 16 16">
                  <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
                  <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
                </svg>
              </div>
              <div class="task-overall ms-3">
                <span class="task-text">Total Tasks</span>
                <span class="task-num">{{ totalTasks }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body d-flex align-items-center justify-content-center">
              <div class="circle circle-completed">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar-check" viewBox="0 0 16 16">
                  <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0" />
                  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                </svg>
              </div>
              <div class="task-overall ms-3">
                <span class="task-text">Completed</span>
                <span class="task-num">{{ completedTasks }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body d-flex align-items-center justify-content-center">
              <div class="circle circle-ongoing">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                </svg>
              </div>
              <div class="task-overall ms-3">
                <span class="task-text">Ongoing</span>
                <span class="task-num">{{ ongoingTasks }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body d-flex align-items-center justify-content-center">
              <div class="circle circle-delayed">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar-x" viewBox="0 0 16 16">
                  <path d="M6.146 7.146a.5.5 0 0 1 .708 0L8 8.293l1.146-1.147a.5.5 0 1 1 .708.708L8.707 9l1.147 1.146a.5.5 0 0 1-.708.708L8 9.707l-1.146 1.147a.5.5 0 0 1-.708-.708L7.293 9 6.146 7.854a.5.5 0 0 1 0-.708" />
                  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                </svg>
              </div>
              <div class="task-overall ms-3">
                <span class="task-text">Delayed</span>
                <span class="task-num">{{ delayedTasks }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-between align-items-center mt-3">
        <div>Total: {{ filteredTasks.length }}</div>
        <nav>
          <ul class="pagination mb-0">
            <li :class="['page-item', { disabled: currentPage === 1 }]" @click="changePage(currentPage - 1)">
              <button class="page-link">&laquo;</button>
            </li>
            <li v-for="page in totalPages" :key="page" :class="['page-item', { active: currentPage === page }]" @click="changePage(page)">
              <button class="page-link">{{ page }}</button>
            </li>
            <li :class="['page-item', { disabled: currentPage === totalPages }]" @click="changePage(currentPage + 1)">
              <button class="page-link">&raquo;</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>

  <!-- Modals -->
  <!-- Create Task Modal -->
  <div class="modal fade" :class="{ show: showModal }" style="display: block" v-if="showModal">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">
            {{ modalType === 'edit' ? 'Edit Task':
              modalType === 'create' ? 'Create New Task' : ''}}
          </h3>
          <button v-if="modalType === 'edit'" type="button" class="btn btn-success" @click="markAsComplete(selectedTask)">Mark as Complete</button>
        </div>
        <div class="modal-body">
          <div class="row">
            <!-- Left Column - Task Details -->
            <div class="col-md-6 border-end">
              <form>
                <!-- Task Name -->
                <div class="mb-3">
                  <label for="taskName" class="form-label">Task Name:</label>
                  <input type="text" class="form-control" id="taskName" placeholder="Enter task name" v-model="selectedTask.taskName">
                </div>

                <!-- Task Description -->
                <div class="mb-3">
                  <label for="taskDescription" class="form-label">Task Description:</label>
                  <textarea class="form-control" id="taskDescription" rows="3" placeholder="Enter task description" v-model="selectedTask.taskDescription"></textarea>
                </div>

                <!-- Dates Row -->
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label for="startDate" class="form-label">Start Date:</label>
                    <input type="date" class="form-control" id="startDate" v-model="selectedTask.startDate">
                  </div>
                  <div class="col-md-6">
                    <label for="completionDate" class="form-label">Completion Date:</label>
                    <input type="date" class="form-control" id="completionDate" v-model="selectedTask.completionDate">
                  </div>
                </div>

                <!-- Points Given -->
                <div class="mb-3">
                  <label for="pointsGiven" class="form-label">Points Given For Each Individual:</label>
                  <input type="number" class="form-control" id="pointsGiven" placeholder="Enter points" v-model="selectedTask.pointsGiven">
                </div>

                <!-- Target -->
                <div class="row mb-3">
                  <label for="target" class="form-label">Target For Each Individual:</label>
                  <div class="col-md-6">
                    <input type="number" class="form-control" id="target" placeholder="Enter target" v-model="selectedTask.target.value">
                  </div>
                  <div class="col-md-6">
                    <input type="text" class="form-control" id="unit" placeholder="Enter unit" v-model="selectedTask.target.unit">
                  </div>
                </div>
              </form>
            </div>

            <!-- Right Column - Assignment Type and Assign To -->
            <div class="col-md-6">
              <!-- Assignment Type Toggle -->
              <div class="mb-3">
                <label class="form-label">Assign Task To:</label>
                <div>
                  <input type="radio" id="assignUser" value="user" v-model="assignType">
                  <label for="assignUser">Employee</label>
                  <input type="radio" id="assignDept" value="department" v-model="assignType" class="ms-3">
                  <label for="assignDept">Whole Department</label>
                </div>
              </div>

              <!-- Conditionally show the assign input for Employee -->
              <div v-if="assignType === 'user'" class="mb-3">
                <label for="assignTo" class="form-label">Assign To:</label>
                <div class="input-group">
                  <input type="text" class="form-control" id="assignTo" placeholder="Enter username" v-model="selectedTask.assignedTo">
                  <button class="btn" type="button" style="background-color: #6CBD6C; color: white;" @click="addAssignedUser">Add</button>
                </div>
                <!-- Assigned Users Tags -->
                <div class="mt-3">
                  <div class="d-flex flex-wrap gap-2">
                    <span v-for="(user, index) in selectedTask.assignedUsers" :key="index" class="badge bg-light text-dark border d-flex align-items-center py-2 px-3">
                      <i class="fas fa-user-circle me-2"></i>
                      {{ user.username }}
                      <button type="button" class="btn-close ms-2" aria-label="Remove" @click="removeAssignedUser(index)"></button>
                    </span>
                  </div>
                </div>
              </div>

              <!-- For department assignment, show a message -->
              <div v-if="assignType === 'department'" class="mb-3">
                <p>This task will be directly assigned to the <strong>{{ selectedDepartment }}</strong>.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showModal = false">Close</button>
          <button v-if="modalType === 'create'" type="button" class="btn" style="background-color: #6CBD6C; color: white;" @click="createTask">Create</button>
          <button v-if="modalType === 'edit'" type="button" class="btn" style="background-color: #6CBD6C; color: white;" @click="saveEditedTask">Save</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showModal"></div>

  <!-- Delete Task Modal -->
  <div class="modal fade" :class="{ show: showDeleteTaskModal }" style="display: block" v-if="showDeleteTaskModal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Delete Task</h5>
          <button type="button" class="btn-close" @click="showDeleteTaskModal = false"></button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this task, <b>{{selectedTask.taskName}}</b>?</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showDeleteTaskModal = false">Cancel</button>
          <button type="button" class="btn btn-danger" @click="confirmDeleteTask">Delete</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showDeleteTaskModal"></div>
</template>

<script setup lang="ts">
import router from '@/router'
import { ref, computed, onMounted } from 'vue'

interface Task {
  id: number
  taskName: string
  taskDescription: string
  startDate: string
  completionDate: string
  status: string
  pointsGiven: number
  target: { value: number; unit: string; };
  assignedTo: string,
  assignedUsers: EmployeeTask[];
  department: string
}

interface EmployeeTask {
  username: string;
}

// State
const tasks = ref<Task[]>([
  { 
    id: 1, 
    taskName: 'Complete Order', 
    taskDescription: 'Send order to customer', 
    status: '',
    startDate: '2025-03-01',
    completionDate: '2025-03-12',
    pointsGiven: 50,
    target: { value: 100, unit: "pcs" },
    assignedTo: '',
    assignedUsers: [{username: 'Alice'}, {username: 'Jester'}, {username: 'Amanda'}],
    department: "Sales Department"
  },
])

//get total target
const getTotalTarget = (task: Task) => {
  return task.target.value * task.assignedUsers.length;
};

// filter
const searchTaskName = ref('')
const selectedStatus = ref('')
const selectedDepartment = ref('Sales Department')
const currentPage = ref(1)
const itemsPerPage = 10

const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    const matchesTaskName = task.taskName.toLowerCase().includes(searchTaskName.value.toLowerCase())
    const matchesStatus = !selectedStatus.value || task.status === selectedStatus.value
    const matchesDepartment = !selectedDepartment.value || task.department === selectedDepartment.value
    return matchesTaskName && matchesStatus && matchesDepartment
  })
})

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTasks.value.slice(start, end)
})

// pagination
const totalPages = computed(() => Math.ceil(filteredTasks.value.length / itemsPerPage))

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Statistics
const totalTasks = computed(() => tasks.value.length)
const completedTasks = computed(() => tasks.value.filter(task => task.status === 'Completed').length)
const ongoingTasks = computed(() => tasks.value.filter(task => task.status === 'Ongoing').length)
const delayedTasks = computed(() => tasks.value.filter(task => task.status === 'Delayed').length)

onMounted(() => {
    tasks.value.forEach(updateTaskStatus);
});

const updateTaskStatus = (task: Task) => {

  const currentDate = new Date();
  const startDate = new Date(`${task.startDate}`);
  const endDate = new Date(`${task.completionDate}`); 

  if (currentDate < startDate) {
    task.status = 'Not Yet Started';
  } else if (currentDate >= startDate && currentDate <= endDate) {
    task.status = 'Ongoing';
  } else {
    task.status = 'Delayed';
  }};

// Modals
const showModal = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const showDeleteTaskModal = ref(false)
const selectedTask = ref<Task>({
  id: 0,
  taskName: '',
  taskDescription: '',
  status: '',
  startDate: '',
  completionDate: '',
  pointsGiven: 0,
  target: { value: 0, unit: "" },
  assignedTo: '',
  assignedUsers: [],
  department: selectedDepartment.value
})

// New reactive variable for assignment type
const assignType = ref('user')  // default assignment type is 'user'

const openCreateTaskModal = () => {
  selectedTask.value = {
    id: 0,
    taskName: '',
    taskDescription: '',
    status: '',
    startDate: '',
    completionDate: '',
    pointsGiven: 0,
    target: { value: 0, unit: "" },
    assignedTo: '',
    assignedUsers: [],
    department: selectedDepartment.value
  }
  modalType.value = 'create'
  assignType.value = 'user' // reset assignment type to default
  showModal.value = true
}

const openEditTaskModal = (task: Task) => {
  selectedTask.value = { ...task }
  modalType.value = 'edit'
  showModal.value = true
}

const openDeleteTaskModal = (task: Task) => {
  selectedTask.value = task
  showDeleteTaskModal.value = true
}

const saveEditedTask = () => {
  const index = tasks.value.findIndex(task => task.id === selectedTask.value.id)
  if (index !== -1) {
    tasks.value[index] = { ...selectedTask.value }
    updateTaskStatus(tasks.value[index]);  
  }
  showModal.value = false
}

const markAsComplete = (task: Task) => {
  const index = tasks.value.findIndex(t => t.id === task.id);
  if (index !== -1) {
    tasks.value[index] = { ...tasks.value[index], status: 'Completed' };
  }
  showModal.value = false
};

const confirmDeleteTask = () => {
  tasks.value = tasks.value.filter(task => task.id !== selectedTask.value.id)
  showDeleteTaskModal.value = false
}

const addAssignedUser = () => {
  if (selectedTask.value.assignedTo.trim()) {
    selectedTask.value.assignedUsers.push({ username: selectedTask.value.assignedTo });
    selectedTask.value.assignedTo = ''; // Clear input after adding
  }
};

const removeAssignedUser = (index: number) => {
  selectedTask.value.assignedUsers.splice(index, 1)
}

const createTask = () => {
  const newId = tasks.value.length + 1

  // Determine assignment based on assignType
  const isUserAssignment = assignType.value === 'user'
  const username = isUserAssignment && selectedTask.value.assignedUsers.length > 0 
    ? selectedTask.value.assignedUsers[0] 
    : selectedDepartment.value

  const role = isUserAssignment ? 'Employee' : 'Department'

  const task: Task = {
    id: newId,
    taskName: selectedTask.value.taskName,
    taskDescription: selectedTask.value.taskDescription,
    status: '',
    startDate: selectedTask.value.startDate,
    completionDate: selectedTask.value.completionDate,
    target: { value: selectedTask.value.target.value, unit: selectedTask.value.target.unit },
    pointsGiven: selectedTask.value.pointsGiven,
    assignedTo: isUserAssignment ? selectedTask.value.assignedTo : '',
    assignedUsers: isUserAssignment ? selectedTask.value.assignedUsers : [],
    department: selectedDepartment.value
  }
  updateTaskStatus(task);
  tasks.value.push(task)
  showModal.value = false
}

//go to employee details page
function goToEmployeeDetailsPage()
{
  router.push('/home/KPI-management/employee-task-details');
}
</script>

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

.line {
  border: 1px solid #e9e9e9;   
}

/* statistic card */
.card {
  border-radius: 10px;
  border: 1px solid #e9e9e9;
}

.circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.circle-total-task {
  background-color: #B3CFE6;
}
.circle-completed {
  background-color: #ABE3A5;
}
.circle-ongoing {
  background-color: #F9E394;
}
.circle-delayed {
  background-color: #F3C5C1;
}

.circle svg {
  width: 30px; 
  height: 30px;
}

.task-overall {
  display: flex;
  flex-direction: column; 
}

.task-text {
  font-size: 1.2rem;
  font-weight: 600;
}
.task-num {
  font-size: 1.2rem;
  color: #5e5e5e;
}

.pagination {
  margin-bottom: 0;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 100%;
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
</style>
