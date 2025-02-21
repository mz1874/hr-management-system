<template>
  <div class="p-4">
    <h1>Department KPI Management</h1>

    <!-- Search and filter -->
    <div class="d-flex gap-3 mb-4">
      <div class="input-group w-25">
        <span class="input-group-text"><i class="fas fa-search"></i></span>
        <input 
          v-model="searchUsername"
          type="text" 
          class="form-control" 
          placeholder="Search Username"
        >
      </div>
      <div class="input-group w-25">
        <span class="input-group-text"><i class="fas fa-search"></i></span>
        <input 
          v-model="searchTaskName"
          type="text" 
          class="form-control" 
          placeholder="Search Task Name"
        >
      </div>
      <select v-model="selectedStatus" class="form-select w-25">
        <option>Select Status</option>
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
                <th>Username</th>
                <th>Role</th>
                <th>Task Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="task in paginatedTasks" :key="task.id">
                <td>{{ task.id }}</td>
                <td>{{ task.username }}</td>
                <td>{{ task.role }}</td>
                <td>{{ task.taskName }}</td>
                <td>
                  <span 
                    :class="[
                      'badge',
                      task.status === 'Completed' ? 'bg-success' : 
                      task.status === 'Ongoing' ? 'bg-warning' : 'bg-danger'
                    ]"
                  >
                    {{ task.status }}
                  </span>
                </td>
                <td>
                  <button @click="openViewTaskModal(task)" class="btn btn-primary btn-sm">View</button>
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
              <div class="card-body">
                <h5 class="card-title">Total Tasks</h5>
                <p class="card-text">{{ totalTasks }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-center">
              <div class="card-body">
                <h5 class="card-title">Completed</h5>
                <p class="card-text">{{ completedTasks }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-center">
              <div class="card-body">
                <h5 class="card-title">Ongoing</h5>
                <p class="card-text">{{ ongoingTasks }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-center">
              <div class="card-body">
                <h5 class="card-title">Delayed</h5>
                <p class="card-text">{{ delayedTasks }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="d-flex justify-content-between align-items-center mt-3">
          <div>Total: {{ filteredTasks.length }}</div>
          <nav>
            <ul class="pagination mb-0">
              <li 
                :class="['page-item', { disabled: currentPage === 1 }]"
                @click="changePage(currentPage - 1)"
              >
                <button class="page-link">&laquo;</button>
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
                <button class="page-link">&raquo;</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- Create Task Modal -->
    <div v-if="showCreateTaskModal" class="modal-backdrop">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create New Task</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="showCreateTaskModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <!-- Left Column - Task Details -->
              <div class="col-md-7 border-end">
                <form>
                  <!-- Task Name -->
                  <div class="mb-3">
                    <label for="taskName" class="form-label">Task Name:</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="taskName" 
                      placeholder="Enter task name"
                      v-model="newTask.taskName"
                    >
                  </div>

                  <!-- Task Description -->
                  <div class="mb-3">
                    <label for="taskDescription" class="form-label">Task Description:</label>
                    <textarea 
                      class="form-control" 
                      id="taskDescription" 
                      rows="3" 
                      placeholder="Enter task description"
                      v-model="newTask.taskDescription"
                    ></textarea>
                  </div>

                  <!-- Dates Row -->
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label for="startDate" class="form-label">Start Date:</label>
                      <input 
                        type="date" 
                        class="form-control" 
                        id="startDate"
                        v-model="newTask.startDate"
                      >
                    </div>
                    <div class="col-md-6">
                      <label for="completionDate" class="form-label">Completion Date:</label>
                      <input 
                        type="date" 
                        class="form-control" 
                        id="completionDate"
                        v-model="newTask.completionDate"
                      >
                    </div>
                  </div>

                  <!-- Points Given -->
                  <div class="mb-3">
                    <label for="pointsGiven" class="form-label">Points Given:</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      id="pointsGiven" 
                      placeholder="Enter points"
                      v-model="newTask.pointsGiven"
                    >
                  </div>
                </form>
              </div>

              <!-- Right Column - Assign To -->
              <div class="col-md-5">
                <div class="mb-3">
                  <label for="assignTo" class="form-label">Assign To:</label>
                  <div class="input-group">
                    <input 
                      type="text" 
                      class="form-control" 
                      id="assignTo" 
                      placeholder="Enter username"
                      v-model="newTask.assignedTo"
                    >
                    <button 
                      class="btn" 
                      type="button" 
                      style="background-color: #6CBD6C; color: white;"
                      @click="addAssignedUser"
                    >
                      Add
                    </button>
                  </div>

                  <!-- Assigned Users Tags -->
                  <div class="mt-3">
                    <div class="d-flex flex-wrap gap-2">
                      <span 
                        v-for="(user, index) in newTask.assignedUsers" 
                        :key="index" 
                        class="badge bg-light text-dark border d-flex align-items-center py-2 px-3"
                      >
                        <i class="fas fa-user-circle me-2"></i>
                        {{ user }}
                        <button 
                          type="button" 
                          class="btn-close ms-2" 
                          aria-label="Remove"
                          @click="removeAssignedUser(index)"
                        ></button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="showCreateTaskModal = false"
            >
              Close
            </button>
            <button 
              type="button" 
              class="btn" 
              style="background-color: #6CBD6C; color: white;"
              @click="createTask"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Task Modal -->
    <div v-if="showViewTaskModal" class="modal-backdrop">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">View Task Details</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="showViewTaskModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <form>
              <div class="mb-3">
                <label class="form-label">Task Name:</label>
                <input 
                  type="text" 
                  class="form-control" 
                  :value="selectedTask.taskName" 
                  readonly
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Task Description:</label>
                <textarea 
                  class="form-control" 
                  readonly
                >{{ selectedTask.taskDescription }}</textarea>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Start Date:</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    :value="selectedTask.startDate" 
                    readonly
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Completion Date:</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    :value="selectedTask.completionDate" 
                    readonly
                  >
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Points Given:</label>
                <input 
                  type="number" 
                  class="form-control" 
                  :value="selectedTask.pointsGiven" 
                  readonly
                >
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="showViewTaskModal = false"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Task Modal -->
    <div v-if="showEditTaskModal" class="modal-backdrop">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Task Details</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="showEditTaskModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <form>
              <div class="mb-3">
                <label class="form-label">Task Name:</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="selectedTask.taskName"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Task Description:</label>
                <textarea 
                  class="form-control" 
                  v-model="selectedTask.taskDescription"
                ></textarea>
              </div>
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Start Date:</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    v-model="selectedTask.startDate"
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Completion Date:</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    v-model="selectedTask.completionDate"
                  >
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Points Given:</label>
                <input 
                  type="number" 
                  class="form-control" 
                  v-model="selectedTask.pointsGiven"
                >
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="showEditTaskModal = false"
            >
              Close
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="saveEditedTask"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Task Modal -->
    <div v-if="showDeleteTaskModal" class="modal-backdrop">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Delete Task</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="showDeleteTaskModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this task?</p>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="showDeleteTaskModal = false"
            >
              Cancel
            </button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="confirmDeleteTask"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Task {
  id: number
  username: string
  role: string
  taskName: string
  taskDescription: string
  status: string
  startDate: string
  completionDate: string
  pointsGiven: number
  assignedTo: string
  assignedUsers: string[]
}

// State
const tasks = ref<Task[]>([
  { 
    id: 1, 
    username: 'username1', 
    role: 'Employee', 
    taskName: 'Complete Order', 
    taskDescription: 'Task description', 
    status: 'Completed',
    startDate: '2023-10-01',
    completionDate: '2023-10-10',
    pointsGiven: 50,
    assignedTo: '',
    assignedUsers: []
  },
  { 
    id: 2, 
    username: 'username2', 
    role: 'Manager', 
    taskName: 'Review Reports', 
    taskDescription: 'Task description', 
    status: 'Ongoing',
    startDate: '2023-10-05',
    completionDate: '2023-10-15',
    pointsGiven: 30,
    assignedTo: '',
    assignedUsers: []
  },
  { 
    id: 3, 
    username: 'username3', 
    role: 'Employee', 
    taskName: 'Update Inventory', 
    taskDescription: 'Task description', 
    status: 'Delayed',
    startDate: '2023-10-02',
    completionDate: '2023-10-12',
    pointsGiven: 20,
    assignedTo: '',
    assignedUsers: []
  }
])

const searchUsername = ref('')
const searchTaskName = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    const matchesUsername = task.username.toLowerCase().includes(searchUsername.value.toLowerCase())
    const matchesTaskName = task.taskName.toLowerCase().includes(searchTaskName.value.toLowerCase())
    const matchesStatus = !selectedStatus.value || task.status === selectedStatus.value
    return matchesUsername && matchesTaskName && matchesStatus
  })
})

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTasks.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredTasks.value.length / itemsPerPage))

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Statistics
const totalTasks = computed(() => tasks.value.length)

const completedTasks = computed(() => {
  return tasks.value.filter(task => task.status === 'Completed').length
})

const ongoingTasks = computed(() => {
  return tasks.value.filter(task => task.status === 'Ongoing').length
})

const delayedTasks = computed(() => {
  return tasks.value.filter(task => task.status === 'Delayed').length
})

// Modals
const showCreateTaskModal = ref(false)
const showViewTaskModal = ref(false)
const showEditTaskModal = ref(false)
const showDeleteTaskModal = ref(false)
const selectedTask = ref<Task>({
  id: 0,
  username: '',
  role: '',
  taskName: '',
  taskDescription: '',
  status: '',
  startDate: '',
  completionDate: '',
  pointsGiven: 0,
  assignedTo: '',
  assignedUsers: []
})

const newTask = ref<Task>({
  id: 0,
  username: '',
  role: '',
  taskName: '',
  taskDescription: '',
  status: 'Ongoing',
  startDate: '',
  completionDate: '',
  pointsGiven: 0,
  assignedTo: '',
  assignedUsers: []
})

const openCreateTaskModal = () => {
  newTask.value = {
    id: tasks.value.length + 1,
    username: '',
    role: '',
    taskName: '',
    taskDescription: '',
    status: 'Ongoing',
    startDate: '',
    completionDate: '',
    pointsGiven: 0,
    assignedTo: '',
    assignedUsers: []
  }
  showCreateTaskModal.value = true
}

const openViewTaskModal = (task: Task) => {
  selectedTask.value = { ...task }
  showViewTaskModal.value = true
}

const openEditTaskModal = (task: Task) => {
  selectedTask.value = { ...task }
  showEditTaskModal.value = true
}

const openDeleteTaskModal = (task: Task) => {
  selectedTask.value = task
  showDeleteTaskModal.value = true
}

const saveEditedTask = () => {
  const index = tasks.value.findIndex(task => task.id === selectedTask.value.id)
  if (index !== -1) {
    tasks.value[index] = { ...selectedTask.value }
  }
  showEditTaskModal.value = false
}

const confirmDeleteTask = () => {
  tasks.value = tasks.value.filter(task => task.id !== selectedTask.value.id)
  showDeleteTaskModal.value = false
}

const addAssignedUser = () => {
  if (newTask.value.assignedTo.trim() !== '') {
    newTask.value.assignedUsers.push(newTask.value.assignedTo)
    newTask.value.assignedTo = ''
  }
}

const removeAssignedUser = (index: number) => {
  newTask.value.assignedUsers.splice(index, 1)
}

const createTask = () => {
  const newId = tasks.value.length + 1

  // Use the first assigned user as the username
  const username = newTask.value.assignedUsers.length > 0 ? newTask.value.assignedUsers[0] : 'Unassigned'

  const task: Task = {
    id: newId,
    username: username,
    role: 'Employee',
    taskName: newTask.value.taskName,
    taskDescription: newTask.value.taskDescription,
    status: 'Ongoing',
    startDate: newTask.value.startDate,
    completionDate: newTask.value.completionDate,
    pointsGiven: newTask.value.pointsGiven,
    assignedTo: newTask.value.assignedTo,
    assignedUsers: newTask.value.assignedUsers
  }

  tasks.value.push(task)
  showCreateTaskModal.value = false
}
</script>

<style scoped>
/* Add your custom styles here */
</style>

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
  max-width: 800px;
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

/* styling for modal 
.modal {
    display: none;
}
.modal-content {
    padding: 15px;
}
.form-label {
    font-weight: bold;
}
.form-control {
    border-color: #000000;
}

.modal-footer {
    border-top: none;
}*/
</style>