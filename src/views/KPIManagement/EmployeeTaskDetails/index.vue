<template>
  <div class="main-content">
  <div class="title-page mb-4">
    <svg @click="goToKPIManagement()" xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-arrow-left-short" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"/>
    </svg>
    <h2>{{ selectedTask.taskName }}</h2>
  </div>

  <div class="line mb-4"></div>

  <!-- Search and filter -->
  <div class="d-flex gap-3 mb-4 mt-3">
    <div class="input-group w-25">
      <span class="input-group-text"><i class="fas fa-search"></i></span>
      <input
        v-model="searchUsername"
        type="text"
        class="form-control"
        placeholder="Search Username"
      />
    </div>
    <select v-model="selectedStatus" class="form-select w-25">
      <option value="">All Status</option>
      <option>Not Yet Started</option>
      <option>Completed</option>
      <option>Ongoing</option>
      <option>Delayed</option>
    </select>
  </div>

  <!-- Statistics Cards -->
  <div class="stats-section">
    <div class="stat-card border-blue">
      <div class="icon-wrapper">👤</div>
      <div class="content">
        <div class="number">{{ totalTasks }}</div>
        <div class="label">Total Employee</div>
      </div>
    </div>
  
    <div class="stat-card border-green">
      <div class="icon-wrapper">✅</div>
      <div class="content">
        <div class="number">{{ completedTasks }}</div>
        <div class="label">Completed</div>
      </div>
    </div>
  
    <div class="stat-card border-yellow">
      <div class="icon-wrapper">⏳</div>
      <div class="content">
        <div class="number">{{ ongoingTasks }}</div>
        <div class="label">Ongoing</div>
      </div>
    </div>
  
    <div class="stat-card border-red">
      <div class="icon-wrapper">⚠️</div>
      <div class="content">
        <div class="number">{{ delayedTasks }}</div>
        <div class="label">Delayed</div>
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
                    employee.status === 'Not Yet Started' ? 'bg-secondary'
                    : employee.status === 'Completed' ? 'bg-success'
                    : employee.status === 'Ongoing' ? 'bg-warning'
                    : employee.status === 'Confirming' ? 'bg-primary' 
                    : 'bg-danger'
                  ]"
                >
                  {{ employee.status }}
                </span>
              </td>
              <td style="display: flex; align-items: center; gap: 5px;">
                <input
                    type="number"
                    v-model="employee.progress"
                    class="form-control"
                    min="0"
                    max="100"
                    @change="updateEmployeeProgress(employee)"
                    style="width: 80px; text-align: center;"
                />
                <span>/{{ employee.targetUnit }}</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="showHistory(employee)" class="btn btn-info btn-sm">
                    Show History
                  </button>
                  <!-- Add margin to separate buttons -->
                  <button 
                    v-if="employee.progress >= employee.targetUnit && (employee.status === 'Ongoing' || employee.status === 'Confirming')" 
                    @click="openApproveModal(employee)" 
                    class="btn btn-success btn-sm ms-3">
                    Mark as Completed
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Show History Modal -->
  <div class="modal fade" v-if="showHistoryModal" :class="{ show: showHistoryModal }" style="display: block" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Progress History for {{ selectedEmployee.username }}</h5>
          <button type="button" class="btn-close" @click="showHistoryModal = false"></button>
        </div>
        <div class="modal-body">
          <ul>
            <li v-for="(record, index) in selectedEmployee.progressHistory" :key="index">
              {{ formatDate(record.date) }} - Progress: {{ record.progress }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showHistoryModal"></div>

  <!-- Approve Modal -->
  <div class="modal fade" v-if="showApproveModal" :class="{ show: showApproveModal }" style="display: block" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Approve Completion for {{ selectedEmployee.username }}</h5>
          <button type="button" class="btn-close" @click="showApproveModal = false"></button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to mark this task as completed?</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showApproveModal = false">Cancel</button>
          <button type="button" class="btn btn-success" @click="approveTaskCompletion(selectedEmployee)">Approve</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showApproveModal"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getKpi } from '@/api/kpiAdmin'
import { getKpiPersonalDetails, updateKpiProgress, markPersonalKpiAsComplete } from '@/api/kpiAdmin'
import type { Employee } from "@/interface/KpiEmployeeInterface.ts"
import Swal from 'sweetalert2'

const router = useRouter()
const route = useRoute()
const kpiId = ref(Number(route.params.id))

// 添加 isSuccess 辅助函数
const isSuccess = (status: number) => {
  return status >= 200 && status < 300
}

// 任务详情
const selectedTask = ref({
  id: 0,
  taskName: '',
  taskDescription: '',
  startDate: '',
  endDate: '',
  status: '',
  department: ''
})

// 员工列表
const assignedEmployees = ref<Employee[]>([])
const searchUsername = ref('')
const selectedStatus = ref('')
const showHistoryModal = ref(false)
const showApproveModal = ref(false)
const selectedEmployee = ref<Employee>({
  id: 0, username: '', progress: 0, progressHistory: [], status: 'Ongoing'
})

// 统计数据
const totalTasks = computed(() => assignedEmployees.value.length)
const completedTasks = computed(() => assignedEmployees.value.filter(e => e.status === 'Completed').length)
const ongoingTasks = computed(() => assignedEmployees.value.filter(e => e.status === 'Ongoing' || e.status === 'Confirming').length)
const delayedTasks = computed(() => assignedEmployees.value.filter(e => e.status === 'Delayed').length)

// 过滤员工列表
const filteredEmployees = computed(() => {
  return assignedEmployees.value.filter(e => {
    const matchUser = e.username.toLowerCase().includes(searchUsername.value.toLowerCase())
    const matchStatus = !selectedStatus.value || e.status === selectedStatus.value || 
                      (selectedStatus.value === 'Ongoing' && e.status === 'Confirming')
    return matchUser && matchStatus
  })
})

// 获取任务详情
const fetchTaskDetails = async () => {
  try {
    const res = await getKpi(kpiId.value)
    if (isSuccess(res.status)) {
      const data = res.data
      selectedTask.value = {
        id: data.id,
        taskName: data.task_title,
        taskDescription: data.task_description,
        startDate: data.task_start_date,
        endDate: data.task_completion_date,
        status: data.kpi_status,
        department: data.department_name
      }
      
      // 获取个人任务详情
      fetchPersonalDetails()
    }
  } catch (error) {
    console.error('Failed to fetch task details:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to fetch task details'
    })
  }
}

// 获取个人任务详情
// 获取个人任务详情
const fetchPersonalDetails = async () => {
  try {
    const res = await getKpiPersonalDetails(kpiId.value)
    if (isSuccess(res.status)) {
      // 添加日志，查看后端返回的数据
      console.log('Personal details response:', res.data)
      
      // 修改这里，正确获取 results 数组
      const personalDetails = res.data.results || res.data.data?.results || []
      
      // 转换数据格式
      assignedEmployees.value = personalDetails.map((detail: any) => {
        // 处理进度历史记录
        const progressHistory = detail.progress_history.map((history: any) => {
          return {
            date: history.update_time,
            progress: history.updated_unit,
            status: history.updated_status_display,
            remarks: history.remarks,
            updatedBy: history.update_by_name
          }
        })
        
        // 状态映射
        let status = detail.current_status;
        if (status === 'N') status = 'Not Yet Started';
        else if (status === 'O') status = 'Ongoing';
        else if (status === 'F') status = 'Confirming';
        else if (status === 'C') status = 'Completed';
        else if (status === 'D') status = 'Delayed';
        
        return {
          id: detail.id,
          username: detail.staff_name,
          progress: detail.completed_unit,
          progressHistory: progressHistory,
          status: status,
          staffId: detail.staff_id,
          targetUnit: detail.target_unit  // 确保这里正确获取了target_unit
        }
      })
    }
  } catch (error) {
    console.error('Failed to fetch personal task details:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to fetch personal task details'
    })
  }
}

const updateEmployeeProgress = async (employee: Employee) => {
  try {
    const response = await updateKpiProgress(employee.id, {
      completed_unit: employee.progress,
      remarks: "Progress updated", 
      update_by: employee.staffId,
      progress_value: employee.progress,
    })
    
    if (isSuccess(response.status)) {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Progress updated successfully',
        showConfirmButton: false,
        timer: 1500
      })
      
      // 根据targetUnit正确设置状态
      if (employee.progress === 0) {
        employee.status = 'Not Yet Started';
      } else if (employee.progress >= employee.targetUnit) {
        employee.status = 'Confirming';
      } else if (employee.progress > 0 && employee.progress < employee.targetUnit) {
        employee.status = 'Ongoing';
      }
      
      // 重新获取最新的进度历史
      fetchPersonalDetails()
    }
  } catch (error) {
    console.error('Failed to update progress:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to update progress'
    })
  }
}

// 显示历史记录
const showHistory = (employee: Employee) => {
  selectedEmployee.value = employee
  showHistoryModal.value = true
}

// 打开确认完成模态框
const openApproveModal = (employee: Employee) => {
  selectedEmployee.value = employee
  showApproveModal.value = true
}

// 确认任务完成
const approveTaskCompletion = async (employee: Employee) => {
  try {
    const response = await markPersonalKpiAsComplete(employee.id)
    
    if (isSuccess(response.status)) {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Task has been marked as completed',
        showConfirmButton: false,
        timer: 1500
      })
      
      employee.status = 'Completed'
      showApproveModal.value = false
      
      // 重新获取最新数据
      fetchPersonalDetails()
    }
  } catch (error) {
    console.error('Failed to mark task as completed:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to mark task as completed'
    })
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 返回 KPI 管理页面
function goToKPIManagement() {
  router.push('/main/kpi-management')
}

// 组件挂载时获取数据
onMounted(() => {
  fetchTaskDetails()
})
</script>


<style scoped>
.title-page {
    display: flex;
    align-items: center;
    gap: 20px; 
}

.title-page svg:hover {
  cursor: pointer;
}

.title-page h2 {
    margin-bottom: 0; 
}

.stats-section {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.stat-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1),0 6px 12px rgba(0, 0, 0, 0.08);
  padding: 15px 20px;
  margin: 2rem; 
  max-width: 280px;
  flex: 1 1 220px;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.border-blue {
  background: linear-gradient(to right,rgba(224, 221, 250, 0.516), #ccd6fef3);
}
.border-green {
  background: linear-gradient(to right, #e6f9f4, #c2f5e7);
}
.border-yellow {
  background: linear-gradient(to right, #fff9e6, #ffeeb8);
}
.border-red {
  background: linear-gradient(to right, #fff2f2, rgb(255, 231, 231));
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  border-radius: 12px 0 0 12px;
}

.border-blue::before {
  background: linear-gradient(to bottom,rgb(148, 123, 202), #60a5fa);
}
.border-green::before {
  background: linear-gradient(to bottom, #10b981, #34d399);
}
.border-yellow::before {
  background: linear-gradient(to bottom, #f59e0b, #fbbf24);
}
.border-red::before {
  background: linear-gradient(to bottom, #ef4444, #f87171);
}

.icon-wrapper {
  font-size: 2rem;
  margin-right: 25px;
  margin-left: 15px;
  color: #3b82f6; 
  flex-shrink: 0;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.number {
  font-size: 1.8rem;
  font-weight: bold;
  color: #1f2937;
}

.label {
  font-size: 1rem;
  color: #6b7280;
}


.table th {
  font-weight: normal;
  color: #666;
}

.task-text {
  font-size: 1.2rem;
  font-weight: 600;
}

.task-num {
  font-size: 1.2rem;
  color: #5e5e5e;
}

.task-overall {
  display: flex;
  flex-direction: column; 
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

.action-buttons {
  display: flex;
  gap: 10px;
}

.ms-3 {
  margin-left: 10px;
}

.badge {
  display: inline-block;
  padding: 0.55rem 1rem;
  font-size: 0.8rem;
  text-align: center;
  text-transform: uppercase;
  border-radius: 30px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  color: white;
  transition: all 0.3s ease;
}

/* 状态色 */
.badge-success {
  background: linear-gradient(to bottom, #44d278, #1b9f4b);
}
.badge-warning {
  background: linear-gradient(to bottom, #facc15, #f59e0b);
}
.badge-danger {
  background: linear-gradient(to bottom, #f87171, #ef4444);
}
.badge-secondary {
  background: linear-gradient(to bottom, #a3a3a3, #6e6e6e);
}

.btn-info {
  background: linear-gradient(to bottom, #189bca, #0e6cc9);
  border-color: #1e90ff;
  color: white;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  box-shadow:
    inset 0 -2px 0 rgba(0, 0, 0, 0.2),
    0 2px 3px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.btn-info:hover {
  background: linear-gradient(to bottom, #083a5c, #187bcd);
}

.btn-success {
  background: linear-gradient(to bottom, #10a948, #0e8a3b);
  color: white;
  border-radius: 30px;
  transition: all 0.3s ease;
}

.btn-success:hover {
  background: linear-gradient(to bottom, #22c55e, #0f642e);
}


</style>
