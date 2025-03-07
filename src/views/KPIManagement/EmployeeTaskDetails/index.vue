<template>
  <div class="d-flex mb-4">
    <h2>{{ selectedTask.taskName }}</h2>
  </div>

  <div class="line mb-4"></div>

  <!-- Search Section: Full-width search bar -->
  <div class="d-flex gap-3 mb-4 mt-3">
    <div class="input-group w-100">
      <span class="input-group-text"><i class="fas fa-search"></i></span>
      <input
        v-model="searchUsername"
        type="text"
        class="form-control"
        placeholder="Search Username"
      />
    </div>
  </div>

  <!-- Dynamic Status Cards (click to filter) -->
  <div class="row mb-4">
    <!-- Completed Card -->
    <div class="col-md-3">
      <div
        class="card text-center clickable-card"
        :class="{'card-active': selectedStatus === 'Completed'}"
        @click="filterByStatus('Completed')"
      >
        <div class="card-body d-flex align-items-center justify-content-center">
          <div class="circle circle-completed">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-calendar-check"
              viewBox="0 0 16 16"
            >
              <path
                d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0"
              />
              <path
                d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"
              />
            </svg>
          </div>
          <div class="task-overall ms-3">
            <span class="task-text">Completed  </span>
            <span class="task-num">{{ completedCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- On Track Card -->
    <div class="col-md-3">
      <div
        class="card text-center clickable-card"
        :class="{'card-active': selectedStatus === 'On Track'}"
        @click="filterByStatus('On Track')"
      >
        <div class="card-body d-flex align-items-center justify-content-center">
          <div class="circle circle-ongoing">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-pencil-square"
              viewBox="0 0 16 16"
            >
              <path
                d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"
              />
              <path
                fill-rule="evenodd"
                d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
              />
            </svg>
          </div>
          <div class="task-overall ms-3">
            <span class="task-text">On Track  </span>
            <span class="task-num">{{ onTrackCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Off Track Card -->
    <div class="col-md-3">
      <div
        class="card text-center clickable-card"
        :class="{'card-active': selectedStatus === 'Off Track'}"
        @click="filterByStatus('Off Track')"
      >
        <div class="card-body d-flex align-items-center justify-content-center">
          <div class="circle circle-delayed">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-calendar-x"
              viewBox="0 0 16 16"
            >
              <path
                d="M6.146 7.146a.5.5 0 0 1 .708 0L8 8.293l1.146-1.147a.5.5 0 1 1 .708.708L8.707 9l1.147 1.146a.5.5 0 0 1-.708.708L8 9.707l-1.146 1.147a.5.5 0 0 1-.708-.708L7.293 9 6.146 7.854a.5.5 0 0 1 0-.708"
              />
              <path
                d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"
              />
            </svg>
          </div>
          <div class="task-overall ms-3">
            <span class="task-text">Off Track  </span>
            <span class="task-num">{{ offTrackCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- All Employees Card -->
    <div class="col-md-3">
      <div
        class="card text-center clickable-card"
        :class="{'card-active': selectedStatus === ''}"
        @click="filterByStatus('')"
      >
        <div class="card-body d-flex align-items-center justify-content-center">
          <div class="circle circle-all">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-person-lines-fill"
              viewBox="0 0 16 16"
            >
              <path
                d="M5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H5zm0 1h6a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"
              />
            </svg>
          </div>
          <div class="task-overall ms-3">
            <span class="task-text">All Employees  </span>
            <span class="task-num">{{ assignedEmployees.length }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Assigned Employees Table -->
  <div class="card">
    <div class="card-body">
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="employee in filteredEmployees" :key="employee.id">
              <td>{{ employee.username }}</td>
              <td>
                <span
                  :class="['badge',
                    getDynamicStatus(employee) === 'Completed'
                      ? 'bg-success'
                      : getDynamicStatus(employee) === 'On Track'
                      ? 'bg-warning'
                      : 'bg-danger'
                  ]"
                >
                  {{ getDynamicStatus(employee) }}
                </span>
              </td>
              <td>
                <input
                  type="number"
                  v-model="employee.progress"
                  class="form-control"
                  min="0"
                  max="100"
                  @change="updateEmployeeProgress(employee)"
                />
                <span>/100</span>
              </td>
              <td>
                <button @click="showHistory(employee)" class="btn btn-info btn-sm">
                  Show History
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Modal for Showing Progress History with Backdrop -->
  <div v-if="showHistoryModal" class="modal fade show" style="display: block" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Progress History for {{ selectedEmployee.username }}</h5>
          <button type="button" class="btn-close" @click="showHistoryModal = false"></button>
        </div>
        <div class="modal-body">
          <ul>
            <li v-for="(record, index) in selectedEmployee.progressHistory" :key="index">
              {{ record.date }} - Progress: {{ record.progress }}%
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showHistoryModal" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Employee {
  id: number
  username: string
  progress: number
  progressHistory: { date: string; progress: number }[]
}

const selectedTask = ref({
  taskName: 'Review Reports'
})

const assignedEmployees = ref<Employee[]>([
  {
    id: 1,
    username: 'Employee1',
    progress: 50,
    progressHistory: [{ date: '2023-03-01', progress: 50 }],
  },
  {
    id: 2,
    username: 'Employee2',
    progress: 100,
    progressHistory: [{ date: '2023-03-01', progress: 100 }],
  },
  {
    id: 3,
    username: 'Employee3',
    progress: 30,
    progressHistory: [{ date: '2023-03-01', progress: 30 }],
  },
])

const searchUsername = ref('')
const selectedStatus = ref('')
const showHistoryModal = ref(false)
const selectedEmployee = ref<Employee>({
  id: 0,
  username: '',
  progress: 0,
  progressHistory: [],
})

// Helper function to get dynamic status based on progress
const getDynamicStatus = (employee: Employee): string => {
  if (employee.progress === 100) {
    return 'Completed'
  } else if (employee.progress >= 75) {
    return 'On Track'
  } else {
    return 'Off Track'
  }
}

// Computed filtered employees based on search and dynamic status
const filteredEmployees = computed(() => {
  return assignedEmployees.value.filter((employee) => {
    const matchesUsername = employee.username
      .toLowerCase()
      .includes(searchUsername.value.toLowerCase())
    const dynamicStatus = getDynamicStatus(employee)
    const matchesStatus = !selectedStatus.value || dynamicStatus === selectedStatus.value
    return matchesUsername && matchesStatus
  })
})

// Computed statistics for each dynamic status
const completedCount = computed(() =>
  assignedEmployees.value.filter((employee) => employee.progress === 100).length
)
const onTrackCount = computed(() =>
  assignedEmployees.value.filter(
    (employee) => employee.progress >= 75 && employee.progress < 100
  ).length
)
const offTrackCount = computed(() =>
  assignedEmployees.value.filter((employee) => employee.progress < 75).length
)

// Update employee progress and add new record to history
const updateEmployeeProgress = (employee: Employee) => {
  const today = new Date().toLocaleDateString()
  employee.progressHistory.push({ date: today, progress: employee.progress })
}

// Set selectedStatus for filtering when a card is clicked
const filterByStatus = (status: string) => {
  selectedStatus.value = status
}

// Show history modal for the selected employee
const showHistory = (employee: Employee) => {
  selectedEmployee.value = employee
  showHistoryModal.value = true
}
</script>

<style scoped>
.card {
  margin-bottom: 20px;
}

.clickable-card {
  cursor: pointer;
  border: 1px solid #e9e9e9;
  border-radius: 10px;
  transition: transform 0.2s ease;
}

.clickable-card:hover {
  transform: scale(1.05);
}

.card-active {
  background-color: #f0f9ff;
}

.circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.circle-completed {
  background-color: #abe3a5;
}
.circle-ongoing {
  background-color: #f9e394;
}
.circle-delayed {
  background-color: #f3c5c1;
}
.circle-all {
  background-color: #b3cfE6;
}

.table th {
  font-weight: normal;
  color: #666;
}

.line {
  border: 1px solid #e9e9e9;
}

.task-text {
  font-size: 1.2rem;
  font-weight: 600;
}

.task-num {
  font-size: 1.2rem;
  color: #5e5e5e;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
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
