<template>
  <div class="d-flex mb-4">
    <h2>{{ selectedDepartment.department_name || 'Department' }} KPI Management</h2>
  </div>

  <!-- department filter -->
  <div class="gap-3 mb-4">
    <select class="form-select w-25" v-model="selectedDepartment" @change="handleDepartmentChange">
      <option v-for="dept in departments" :key="dept.id" :value="dept">
        {{ dept.department_name }}
      </option>
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
      <option>Terminated</option>
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
            <tr v-for="task in filteredKpiData" :key="task.id">
              <td>{{ task.id }}</td>
              <td>{{ task.taskTitle }}</td>
              <td>{{ task.startDate }}</td>
              <td>{{ task.endDate }}</td>
              <td>{{ task.totalTarget }} {{ task.individualUnit }}</td>
              <td>180</td>
              <td>
                <span 
                :class="['badge',
                    task.status === 'Not Yet Started' ? 'bg-primary' :
                    task.status === 'Completed' ? 'bg-success' : 
                    task.status === 'Ongoing' ? 'bg-warning' : 
                    task.status === 'Delayed' ? 'bg-danger' : 'bg-secondary'
                  ]">
                  {{ task.status }}
                </span>
              </td>
              <td>
                <button @click="goToEmployeeDetailsPage()" class="btn btn-primary btn-sm">Employee Details</button>
                <button @click="openEditTaskModal(task)" class="btn btn-warning btn-sm">Edit</button>
                <button @click="openDeleteModal(task)" class="btn btn-danger btn-sm">Delete</button>
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
        <div>Total: {{ filteredKpiData.length }}</div>
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
          <!--<button v-if="modalType === 'edit'" type="button" class="btn btn-success" @click="markAsComplete(selectedTask)">Mark as Complete</button>-->
          <button v-if="modalType === 'edit'" @click="openTerminateModal(currentTask)" class="btn btn-danger btn-sm">Terminate</button>
        </div>
        <div class="modal-body">
          <div class="row">
            <!-- Left Column - Task Details -->
            <div class="col-md-6 border-end">
              <form>
                <!-- Task Name -->
                <div class="mb-3">
                  <label for="taskName" class="form-label">Task Name:</label>
                  <input type="text" class="form-control" id="taskName" placeholder="Enter task name" v-model="currentTask.taskTitle">
                </div>

                <!-- Task Description -->
                <div class="mb-3">
                  <label for="taskDescription" class="form-label">Task Description:</label>
                  <textarea class="form-control" id="taskDescription" rows="3" placeholder="Enter task description" v-model="currentTask.taskDescription"></textarea>
                </div>

                <!-- Dates Row -->
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label for="startDate" class="form-label">Start Date:</label>
                    <input type="date" class="form-control" id="startDate" v-model="currentTask.startDate">
                  </div>
                  <div class="col-md-6">
                    <label for="completionDate" class="form-label">Completion Date:</label>
                    <input type="date" class="form-control" id="completionDate" v-model="currentTask.endDate">
                  </div>
                </div>

                <!-- Points Given -->
                <div class="mb-3">
                  <label for="pointsGiven" class="form-label">Points Given For Each Individual:</label>
                  <input type="number" class="form-control" id="pointsGiven" placeholder="Enter points" v-model="currentTask.pointsGiven">
                </div>

                <!-- Target -->
                <div class="row mb-3">
                  <label for="target" class="form-label">Target For Each Individual:</label>
                  <div class="col-md-6">
                    <input type="number" class="form-control" id="target" placeholder="Enter target" v-model="currentTask.totalTarget">
                  </div>
                  <div class="col-md-6">
                    <input type="text" class="form-control" id="unit" placeholder="Enter unit" v-model="currentTask.individualUnit">
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
                <label for="assignTo" class="form-label">Assign to:</label>
                <div class="input-group">
                  <select class="form-select" id="assignTo" v-model="currentTask.assignedTo">
                    <option value="">Select Staff </option>
                    <option v-for="staff in departmentStaff" :key="staff.id" :value="staff.username">
                      {{ staff.username }}
                    </option>
                  </select>
                  <button class="btn" type="button" style="background-color: #6CBD6C; color: white;" @click="addAssignedUser">Add</button>
                </div>
                <!-- Assigned Users Tags -->
                <div class="mt-3">
                  <div class="d-flex flex-wrap gap-2">
                    <span v-for="(user, index) in currentTask.assignedUsers" :key="index" class="badge bg-light text-dark border d-flex align-items-center py-2 px-3">
                      <i class="fas fa-user-circle me-2"></i>
                      {{ user.username }}
                      <button type="button" class="btn-close ms-2" aria-label="Remove" @click="removeAssignedUser(index)"></button>
                    </span>
                  </div>
                </div>
              </div>

              <!-- For department assignment, show a message -->
              <div v-if="assignType === 'department'" class="mb-3">
                <p>Assigning To <strong>{{ selectedDepartment.department_name }}</strong> 's All ({{ departmentStaff.length }}) Staff。</p>
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

  <!-- Terminate Task Modal -->
  <div class="modal fade" :class="{ show: showTerminateModal }" style="display: block" v-if="showTerminateModal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Terminate Task</h5>
          <button type="button" class="btn-close" @click="showTerminateModal = false"></button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to terminate this task, <b>{{currentTask.taskTitle}}</b>?</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showTerminateModal = false">Cancel</button>
          <button type="button" class="btn btn-danger" @click="confirmTerminate()">Terminate</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showTerminateModal"></div>

  <!-- Delete Task Modal -->
<div class="modal fade" :class="{ show: showDeleteModal }" style="display: block" v-if="showDeleteModal">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Delete Task</h5>
        <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to delete this task, <b>{{ currentTask.taskTitle }}</b>?</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
        <button type="button" class="btn btn-danger" @click="confirmDeleteTask(currentTask)">Delete</button>
      </div>
    </div>
  </div>
</div>
<div class="modal-backdrop fade show" v-if="showDeleteModal"></div>

</template>

<script setup lang="ts">
import router from '@/router'
import { ref, computed, onMounted } from 'vue'
import type {Task} from  "@/interface/KpiInterface.ts";
import {selectAllKpis, updateKpi, createKpi, deleteKpi, terminateKpi} from "@/api/kpiAdmin.ts";
import { selectAllDepartments } from "@/api/department.ts";
import {selectAllStaffs} from "@/api/staff.ts";
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import { isSuccess } from '@/utils/httpStatus';
import Swal from 'sweetalert2';


const tasks = ref<Task[]>([])
//fetch function
const kpiData = ref<any[]>([]);  // 用于存储KPI数据
const currentTask = ref<any>({});

const departments = ref<any[]>([]);

// 添加员工列表
const allStaff = ref<any[]>([]);
const departmentStaff = computed(() => {
  // 根据当前选中的部门ID过滤员工
  return allStaff.value.filter(staff => 
    staff.department === selectedDepartment.value?.id
  );
});

const fetchAllStaff = () => {
  selectAllStaffs().then((res) => {
    if (isSuccess(res.status) && res.data.code === 200) {
      allStaff.value = res.data.data.results;
      console.log('获取员工数据成功:', allStaff.value);
    } else {
      console.error('获取员工列表失败:', res);
    }
  }).catch((error) => {
    console.error('获取员工列表出错:', error);
  });
};


const fetchDepartments = () => {
  selectAllDepartments().then((res) => {
    if (isSuccess(res.status) && res.data.code === 200) {
      departments.value = res.data.data.results;
      // 默认选择第一个部门
      if (departments.value.length > 0) {
        selectedDepartment.value = departments.value[0];
        fetchKpis(); // 获取第一个部门的KPI数据
      }
    } else {
      console.error('Failed to fetch department list:', res);
    }
  }).catch((error) => {
    console.error('Error fetching department list:', error);
  });
};

const fetchKpis = () => {
    // 不再传递department_id参数，获取所有KPI数据
    selectAllKpis().then((res) => {
      console.log(res.data)
      const rawResults = res.data.data.results;
      kpiData.value = rawResults.map((item: any) => {
        // 修改：使用自定义格式解析日期
        let startDate = '';
        let endDate = '';
        
        try {
          // 使用自定义格式解析 DD.MM.YYYY HH:MM:SS 格式的日期
          const [first, second] = item.task_start_date.split(" ");
          const [day, month, year] = first.split(".");
          startDate = `${year}-${month}-${day}`;
          const [first2, second2] = item.task_completion_date.split(" ");
          const [day2, month2, year2] = first2.split(".");
          endDate = `${year2}-${month2}-${day2}`;
          // 检查解析后的日期是否有效
          if (startDate === "Invalid Date") {
            console.warn("Invalid start date format:", item.task_start_date);
            startDate = dayjs().format("YYYY-MM-DD"); // 使用当前日期作为后备
          }
          
          if (endDate === "Invalid Date") {
            console.warn("Invalid end date format:", item.task_completion_date);
            endDate = dayjs().add(7, 'day').format("YYYY-MM-DD"); // 使用当前日期+7天作为后备
          }
        } catch (e) {
          console.error("Error parsing dates:", e);
          startDate = dayjs().format("YYYY-MM-DD");
          endDate = dayjs().add(7, 'day').format("YYYY-MM-DD");
        }
        
        return {
          id: item.id,
          taskTitle: item.task_title,
          taskDescription: item.task_description,
          startDate: startDate,
          endDate: endDate,
          pointsGiven: item.points_earned,
          status: item.kpi_status,  // KPI状态
          totalTarget: item.target_unit,
          individualUnit: item.individual_unit,
          createdOn: dayjs(item.create_time, "DD.MM.YYYY HH:mm:ss").format("YYYY-MM-DD"),
          assignedUsers: item.assignedUsers || [],
          department: item.department_name, // 直接使用API返回的部门名称
          department_id: item.department
        };
      });
    }).catch((error) => {
        console.error("Error fetching KPIs:", error);
    });
  };

onMounted(() =>
{
  fetchDepartments();
  fetchKpis();
  fetchAllStaff();
});  // 组件挂载时自动调用 fetchKpis 获取数据

// 添加用户的函数
const addAssignedUser = () => {
  if (!currentTask.value.assignedTo) return;
  
  // 检查是否已经添加过该用户
  const isDuplicate = currentTask.value.assignedUsers?.some(
    user => user.username === currentTask.value.assignedTo
  );
  
  if (!isDuplicate) {
    if (!currentTask.value.assignedUsers) {
      currentTask.value.assignedUsers = [];
    }
    
    currentTask.value.assignedUsers.push({
      username: currentTask.value.assignedTo
    });
    
    currentTask.value.assignedTo = ''; // 清空输入框
  } else {
    Swal.fire({
      icon: "warning",
      title: "Duplicate User",
      text: "This user has already been added to the task"
    });
  }
}

// 移除用户的函数
const removeAssignedUser = (index: number) => {
  currentTask.value.assignedUsers.splice(index, 1);
}


//Create function
const createTask = () => {
  const currentDate = dayjs().format("YYYY-MM-DD");

  // 修改：加强日期验证和处理
  if (!currentTask.value.startDate || !currentTask.value.endDate) {
    Swal.fire({
      icon: "error",
      title: "Missing Date",
      text: "Please enter both start and end dates."
    });
    return;
  }

  // 修改：确保日期格式符合 yyyy-MM-dd
  let startDate;
  let endDate;
  
  try {
    // 尝试解析日期并确保格式正确
    startDate = dayjs(currentTask.value.startDate);
    if (!startDate.isValid()) {
      throw new Error("Invalid start date");
    }
    startDate = startDate.format("YYYY-MM-DD");
    
    endDate = dayjs(currentTask.value.endDate);
    if (!endDate.isValid()) {
      throw new Error("Invalid end date");
    }
    endDate = endDate.format("YYYY-MM-DD");
  } catch (e) {
    Swal.fire({
      icon: "error",
      title: "Invalid Date Format",
      text: "Please enter dates in YYYY-MM-DD format."
    });
    return;
  }

  let taskStatus = 'Not Yet Started';  // 默认状态

  // 日期状态检查
  if (dayjs(currentDate).isBefore(dayjs(startDate))) {
    taskStatus = 'Not Yet Started';  // 当前日期早于任务开始日期
  } else if (dayjs(currentDate).isBetween(dayjs(startDate), dayjs(endDate), null, '[]')) {
    taskStatus = 'Ongoing';  // 当前日期在开始日期和结束日期之间
  } else if (dayjs(currentDate).isAfter(dayjs(endDate))) {
    taskStatus = 'Delayed';  // 当前日期晚于任务结束日期
  }

  // 确保任务数据正确设置，使用处理过的日期
  const payload = {
    task_title: currentTask.value.taskTitle,
    task_description: currentTask.value.taskDescription,
    task_start_date: startDate, // 使用格式化后的日期
    task_completion_date: endDate, // 使用格式化后的日期
    kpi_status: taskStatus, // 默认状态
    target_unit: currentTask.value.totalTarget,
    individual_unit: currentTask.value.individualUnit,
    points_earned: currentTask.value.pointsGiven || 0,
    update_by: 'admin',  // 默认值
    assigned_users: currentTask.value.assignedUsers || [],  // 正确处理已分配用户
    department: selectedDepartment.value.id,
  };

  // 关闭模态框
  showModal.value = false;

  // 调用 API 创建任务
  createKpi(payload).then((res) => {
    if (isSuccess(res.status)) {
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Task created successfully",
        showConfirmButton: false,
        timer: 1500,
      });
      fetchKpis(); // 更新任务列表
    }
  }).catch((error) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "There was an error creating the task.",
    });
  });
};


//Edit function
const showModal = ref(false)
const modalType = ref<'create' | 'edit'>('create')

const openEditTaskModal = (task: Task) => {
  currentTask.value = task
  modalType.value = 'edit'
  showModal.value = true
  if (task.assignedUsers && task.assignedUsers.length > 0) {
    assignType.value = 'user';
  } else {
    assignType.value = 'department';
  }
}

const saveEditedTask = () => {
  const currentDate = dayjs().format("YYYY-MM-DD");

  let taskStatus = currentTask.value.status;  // 保留当前的状态

  // 修改：加强日期验证和处理
  if (!currentTask.value.startDate || !currentTask.value.endDate) {
    Swal.fire({
      icon: "error",
      title: "Missing Date",
      text: "Please enter both start and end dates."
    });
    return;
  }

  // 修改：确保日期格式符合 yyyy-MM-dd
  let startDate;
  let endDate;
  
  try {
    // 尝试解析日期并确保格式正确
    startDate = dayjs(currentTask.value.startDate);
    if (!startDate.isValid()) {
      throw new Error("Invalid start date");
    }
    startDate = startDate.format("YYYY-MM-DD");
    
    endDate = dayjs(currentTask.value.endDate);
    if (!endDate.isValid()) {
      throw new Error("Invalid end date");
    }
    endDate = endDate.format("YYYY-MM-DD");
  } catch (e) {
    Swal.fire({
      icon: "error",
      title: "Invalid Date Format",
      text: "Please enter dates in YYYY-MM-DD format."
    });
    return;
  }

  // 日期状态检查
  if (dayjs(currentDate).isBefore(startDate)) {
    taskStatus = 'Not Yet Started';
  } else if (dayjs(currentDate).isBetween(startDate, endDate, null, '[]')) {
    taskStatus = 'Ongoing';
  } else if (dayjs(currentDate).isAfter(endDate)) {
    taskStatus = 'Delayed';
  }

  const payload = {
    task_title: currentTask.value.taskTitle,
    task_description: currentTask.value.taskDescription,
    task_start_date: startDate, // 使用处理后的日期
    task_completion_date: endDate, // 使用处理后的日期
    kpi_status: taskStatus,  // 保持更新的状态
    target_unit: currentTask.value.totalTarget,
    individual_unit: currentTask.value.individualUnit,
    points_earned: currentTask.value.pointsGiven || 0,  // 处理积分
    update_by: 'admin',  // 直接使用字符串而不是数组
    assignedUsers: currentTask.value.assignedUsers || [],  // 确保分配的用户正确
    department: currentTask.value.department_id, // 使用部门ID
  };

  showModal.value = false;

  updateKpi(currentTask.value.id, payload).then((res) => {
    if (isSuccess(res.status)) {
      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Task edited successfully",
        showConfirmButton: false,
        timer: 1500
      });
      fetchKpis();
    }
  }).catch((error) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "There was an error updating the task."
    });
  });
};



//Delete function
const showDeleteModal = ref(false);

// Open the delete task modal
const openDeleteModal = (task: any) => {
  currentTask.value = task; // Set the task to be deleted
  showDeleteModal.value = true; // Show the delete confirmation modal
};

// Confirm delete and send request to delete the task
const confirmDeleteTask = (task: any) => {
  deleteKpi(task.id).then(() => {
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Task deleted successfully',
      showConfirmButton: false,
      timer: 1500,
    });
    fetchKpis(); // Refresh the task list after deletion
    showDeleteModal.value = false; // Close the modal
  }).catch((error) => {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'There was an error deleting the task.',
    });
  });
};


//Terminate function
const showTerminateModal = ref(false)

// Function to open Terminate Task modal
const openTerminateModal = (task: any) => {
  console.log("Opening terminate modal for task:", task);  
  currentTask.value = task;
  showTerminateModal.value = true; // Show Terminate confirmation modal
}

// Function to confirm Terminate and close both modals
const confirmTerminate = () => {
  // Here you update the task status to Terminated
  const payload = { kpi_status: 'Terminated' };

  terminateKpi(currentTask.value.id, payload).then((res) => {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Task terminated successfully",
      showConfirmButton: false,
      timer: 1500
    });
    showModal.value = false  // Close Edit modal
    showTerminateModal.value = false  // Close Terminate confirmation modal
    fetchKpis()  // Fetch updated tasks
  }).catch((error) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "There was an error terminating the task."
    });
  });
}


// get total target
// const getTotalTarget = (task: Task) => {
//   return task.target.value * task.assignedUsers.length;
// };

// filter
const searchTaskName = ref('')
const selectedStatus = ref('')
const selectedDepartment = ref('Sales Department')
const currentPage = ref(1)
const itemsPerPage = 10

// 添加KPI数据过滤计算属性
const filteredKpiData = computed(() => {
  return kpiData.value.filter(task => {
    // 部门筛选
    const matchesDepartment = !selectedDepartment.value?.id || 
      task.department_id === selectedDepartment.value.id;
    
    // 任务名称搜索
    const matchesTaskName = !searchTaskName.value || 
      task.taskTitle.toLowerCase().includes(searchTaskName.value.toLowerCase());
    
    // 状态筛选
    const matchesStatus = !selectedStatus.value || task.status === selectedStatus.value;
    
    return matchesDepartment && matchesTaskName && matchesStatus;
  });
});


const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredKpiData.value.slice(start, end)
})

// pagination
const totalPages = computed(() => Math.ceil(filteredKpiData.value.length / itemsPerPage))

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Statistics
const totalTasks = computed(() => filteredKpiData.value.length);
const completedTasks = computed(() => filteredKpiData.value.filter(task => task.status === 'Completed').length);
const ongoingTasks = computed(() => filteredKpiData.value.filter(task => task.status === 'Ongoing').length);
const delayedTasks = computed(() => filteredKpiData.value.filter(task => task.status === 'Delayed').length);

onMounted(() => {
    tasks.value.forEach(updateTaskStatus);
});

const handleDepartmentChange = () => {
  console.log(`Department changed to: ${selectedDepartment.value.department_name}`);
  // 重置分页到第一页
  currentPage.value = 1;
  fetchKpis(); // 重新获取数据
};

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
// const showModal = ref(false)
// const modalType = ref<'create' | 'edit'>('create')
const showTerminatedModal = ref(false)
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
    endDate: '',
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
// const openEditTaskModal = (task: Task) => {
//   currentTask.value = task
//   modalType.value = 'edit'
//   showModal.value = true
// }

// const openTerminatedModal = (task: Task) => {
//   selectedTask.value = task
//   showTerminatedModal.value = true
// }

// const saveEditedTask = () => {
//   const index = tasks.value.findIndex(task => task.id === selectedTask.value.id)
//   if (index !== -1) {
//     tasks.value[index] = { ...selectedTask.value }
//     updateTaskStatus(tasks.value[index]);  
//   }
//   showModal.value = false
// }

const markAsComplete = (task: Task) => {
  const index = tasks.value.findIndex(t => t.id === task.id);
  if (index !== -1) {
    tasks.value[index] = { ...tasks.value[index], status: 'Completed' };
  }
  showModal.value = false
};


/*const addAssignedUser = () => {
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
*/
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
