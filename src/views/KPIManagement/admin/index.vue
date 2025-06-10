<template>
  <div class="main-content">
  <div class="d-flex mb-4">
    <h2>KPI Management</h2>
  </div>

  <div class="d-flex gap-3 mb-4 mt-3">
    <!-- search task name -->
    <div class="input-group w-25">
      <span class="input-group-text"><i class="fas fa-search"></i></span>
      <input v-model="searchTaskName" type="text" class="form-control" placeholder="Search Task Name">
    </div>

    <!-- search status -->
    <select v-model="selectedStatus" class="form-select w-25">
      <option value="">🔍 All Status</option>
      <option value="Not Yet Started">🔒 Not Yet Started</option>
      <option value="Completed">✅ Completed</option>
      <option value="Ongoing">⏳ Ongoing</option>
      <option value="Delayed">⚠️ Delayed</option>
      <option value="Terminated">✖️ Terminated</option>
    </select>

    <select class="form-select w-25" v-model="searchDepartment" v-if="!isManager">
      <option v-for="dept in departments" :key="dept.id" :value="dept.id">
        {{ dept.department_name }}
      </option>
    </select>


    <button class="btn btn-primary" @click="searchKPI">Search</button>
    <button class="btn btn-primary" @click="cleanSearchCondition">Clean</button>
  </div>


  <!-- Table section -->
  <div class="card">
    <div class="card-body ">
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
            <th>Department</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="task in kpiData" :key="task.id">
            <td>{{ task.id }}</td>
            <td>{{ task.taskTitle }}</td>
            <td>{{ task.startDate }}</td>
            <td>{{ task.endDate }}</td>
            <td>{{ calculateTotalTarget(task) }} {{ task.individualUnit }}</td>
            <td>{{ calculateTotalProgress(task) }} {{ task.individualUnit }}</td>
            <td>{{ task.department }}</td>
            <td>
                <span
                    :class="[
                    'badge',
                    task.status === 'Not Yet Started' ? 'bg-primary' :
                    task.status === 'Completed' ? 'bg-success' : 
                    task.status === 'Ongoing' ? 'bg-warning' : 
                    task.status === 'Delayed' ? 'bg-danger' : 'bg-secondary'
                  ]">
                  {{ task.status }}
                </span>
            </td>
            <td>
              <template v-if="task.status !== 'Terminated'">
                <button @click="goToEmployeeDetailsPage(task.id)" class="btn btn-primary btn-sm">Employee Details
                </button>
                <button @click="openEditTaskModal(task)" class="btn btn-warning btn-sm">Edit</button>
              </template>
              <button @click="openDeleteModal(task)" class="btn btn-danger btn-sm">Delete</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-section">
        <div class="stats-grid">
          <!-- Total Tasks -->
          <div class="stat-card total-card">
            <div class="card-background"></div>
            <div class="card-icon">📋</div>
            <div class="card-content">
              <div class="card-number">{{ count }}</div>
              <div class="card-label">Total Tasks</div>
            </div>
          </div>

          <!-- Completed Tasks -->
          <div class="stat-card completed-card">
            <div class="card-background"></div>
            <div class="card-icon">✅</div>
            <div class="card-content">
              <div class="card-number">{{ completedTasks }}</div>
              <div class="card-label">Completed</div>
            </div>
          </div>

          <!-- Ongoing Tasks -->
          <div class="stat-card ongoing-card">
            <div class="card-background"></div>
            <div class="card-icon">⏳</div>
            <div class="card-content">
              <div class="card-number">{{ ongoingTasks }}</div>
              <div class="card-label">Ongoing</div>
            </div>
          </div>

          <!-- Delayed Tasks -->
          <div class="stat-card delayed-card">
            <div class="card-background"></div>
            <div class="card-icon">⚠️</div>
            <div class="card-content">
              <div class="card-number">{{ delayedTasks }}</div>
              <div class="card-label">Delayed</div>
            </div>
          </div>
        </div>
      </div>


      <!-- Pagination & total count -->
  <div class="d-flex align-items-center mt-3 justify-content-start">
    <!-- Left: Total count -->
    <span class="me-3">Total KPI Tasks: {{ count }}</span>

    <!-- Right: Pagination -->
    <nav aria-label="Page navigation">
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="prevPage">Previous</button>
        </li>
        <li
            class="page-item"
            v-for="(page, index) in visiblePages"
            :key="index"
            :class="{ active: page === currentPage, disabled: page === '...'}"
        >
          <button
              class="page-link"
              v-if="page !== '...'"
              @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <span v-else class="page-link">…</span>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="nextPage">Next</button>
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
            {{
              modalType === 'edit' ? 'Edit Task' :
                  modalType === 'create' ? 'Create New Task' : ''
            }}
          </h3>
          <!--<button v-if="modalType === 'edit'" type="button" class="btn btn-success" @click="markAsComplete(selectedTask)">Mark as Complete</button>-->
          <button v-if="modalType === 'edit'" @click="openTerminateModal(currentTask)" class="btn btn-danger btn-sm">
            Terminate
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="row">
              <!-- Left Column - Task Details -->
              <div class="col-md-6 border-end">
                <!-- Task Name -->
                <div class="mb-3">
                  <label for="taskName" class="form-label">Task Name:</label>
                  <input type="text" class="form-control" id="taskName" placeholder="Enter task name"
                         required
                         v-model="currentTask.taskTitle">
                </div>

                <!-- Task Description -->
                <div class="mb-3">
                  <label for="taskDescription" class="form-label">Task Description:</label>
                  <textarea class="form-control" id="taskDescription" rows="3" placeholder="Enter task description"
                            required
                            v-model="currentTask.taskDescription" maxlength="250"></textarea>
                </div>

                <!-- Dates Row -->
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label for="startDate" class="form-label">Start Date:</label>
                    <input type="date" class="form-control" id="startDate" required :min="today"
                           v-model="currentTask.startDate">
                  </div>
                  <div class="col-md-6">
                    <label for="completionDate" class="form-label">Completion Date:</label>
                    <input type="date" class="form-control" id="completionDate" required v-model="currentTask.endDate">
                  </div>
                </div>

                <!-- Target -->
                <div class="row mb-3">
                  <label for="target" class="form-label">Target For Each Individual:</label>
                  <div class="col-md-6">
                    <input type="number" class="form-control" id="target" required placeholder="Enter target"
                           min="0"
                           v-model="currentTask.totalTarget">
                  </div>
                  <div class="col-md-6">
                    <input type="text" class="form-control" id="unit" required placeholder="Enter unit"
                           v-model="currentTask.individualUnit">
                  </div>
                </div>


              </div>
              <!-- Right Column - Assignment Type and Assign To -->
              <div class="col-md-6">
                <div class="row mb-3">
                  <label class="form-label">Target reached and point given:</label>
                  <div class="col-md-6 d-flex align-items-center">
                    <label class="form-label mb-0">Target: 75%</label>
                  </div>
                  <div class="col-md-6 d-flex align-items-center">
                    <label for="unit" class="form-label me-2 mb-0">Points:</label>
                    <input type="number" class="form-control" id="unit" min="0" required
                           v-model="currentTask.seventy_percent">
                  </div>
                </div>
                <div class="row mb-3">
                  <div class="col-md-6 d-flex align-items-center">
                    <label class="form-label mb-0">Target: 90%</label>
                  </div>
                  <div class="col-md-6 d-flex align-items-center">
                    <label for="unit" class="form-label me-2 mb-0">Points:</label>
                    <input type="number" class="form-control" id="unit" required min="0"
                           v-model="currentTask.ninety_percent">
                  </div>
                </div>
                <div class="row mb-3">
                  <div class="col-md-6 d-flex align-items-center">
                    <label class="form-label mb-0">Target: 100%</label>
                  </div>
                  <div class="col-md-6 d-flex align-items-center">
                    <label for="unit" class="form-label me-2 mb-0">Points:</label>
                    <input type="number" class="form-control" id="unit" required min="0"
                           v-model="currentTask.hundred_percent">
                  </div>
                </div>
                <div class="row mb-3">
                  <div class="col-md-6 d-flex align-items-center">
                    <label class="form-label mb-0">Target: 120%</label>
                  </div>
                  <div class="col-md-6 d-flex align-items-center">
                    <label for="unit" class="form-label me-2 mb-0">Points:</label>
                    <input type="number" class="form-control" id="unit" min="0" required
                           v-model="currentTask.hundred_twenty_percent">
                  </div>
                </div>

                <div v-if="!isManager">
                  <!-- Assignment Type Toggle -->
                  <div class="mb-3">
                    <label class="form-label">Assign task to:</label>
                    <div>
                      <input type="radio" id="assignUser" value="user" @change="revertAllUsers" v-model="assignType">
                      <label for="assignUser">Employee</label>
                      <input type="radio" id="assignDept" value="department" @change="cancelAllUsers"
                             v-model="assignType" class="ms-3">
                      <label for="assignDept">Whole department</label>
                    </div>
                  </div>

                  <div class="gap-3 mb-3" v-show="assignType === 'department'">
                    <select class="form-select" v-model="selectedDepartment" @change="handleDepartmentChange">
                      <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                        {{ dept.department_name }}
                      </option>
                    </select>
                  </div>

                  <!-- Conditionally show the assign input for Employee -->
                  <div v-if="assignType === 'user'" class="mb-3">
                    <label for="assignTo" class="form-label">Assign to employees:</label>
                    <div class="input-group mb-2">
                      <input
                          type="text"
                          class="form-control"
                          placeholder="Search employees..."
                          v-model="staffSearchKeyword"
                      />
                      <button class="btn btn-outline-secondary" type="button" @click="searchStaffMembers">
                        <i class="fas fa-search"></i>
                      </button>
                    </div>

                    <!-- 搜索结果下拉列表 -->
                    <div v-if="staffSearchResults && staffSearchResults.length > 0"
                         class="search-results border rounded p-2 mb-2" style="max-height: 200px; overflow-y: auto;">
                      <div
                          v-for="staff in staffSearchResults"
                          :key="staff.id"
                          class="search-result-item p-2 hover-bg-light cursor-pointer"
                          @click="selectStaffMember(staff)"
                      >
                        {{ staff.username }} ({{ staff.department_name }})
                      </div>
                    </div>

                    <!-- 已选择的员工标签 -->
                    <div class="mt-2">
                      <div class="d-flex flex-wrap gap-2">
                    <span v-for="(user, index) in (currentTask.assignedUsers || [])" :key="index"
                          class="badge bg-light text-dark border d-flex align-items-center py-2 px-3">
                      <i class="fas fa-user-circle me-2"></i>
                      {{ user.username }}
                      <button type="button" class="btn-close ms-2" aria-label="Remove"
                              @click="removeAssignedUser(index)"></button>
                    </span>
                      </div>
                    </div>
                  </div>

                  <!-- 部门分配选项 -->
                  <div v-if="assignType === 'department'" class="mb-3">
                    <!--                  <p>Assign to all employees in the <strong>{{ selectedDepartment.department_name }}</strong>-->
                    <!--                    department.-->
                    <!--                  </p>-->

                    <div class="form-check mt-2">
                      <input class="form-check-input" type="checkbox" v-model="assignToAllMembers"
                             id="assignToAllMembers">
                      <label class="form-check-label" for="assignToAllMembers">
                        Confirm assignment to all members
                      </label>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showModal = false">Close</button>
              <button
                  v-if="modalType === 'create'"
                  type="submit"
                  class="btn"
                  style="background-color: #6CBD6C; color: white;"
              >
                Create
              </button>
              <button
                  v-if="modalType === 'edit'"
                  type="submit"
                  class="btn"
                  style="background-color: #6CBD6C; color: white;"
              >
                Save
              </button>
            </div>
          </form>
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
          <p>Are you sure you want to terminate this task, <b>{{ currentTask.taskTitle }}</b>?</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="handleCancelTerminate()">Cancel</button>
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
</div>
</template>

<script setup lang="ts">
import router from '@/router'
import {ref, computed, onMounted, reactive} from 'vue'
import type {Task} from "@/interface/KpiInterface.ts";
import {searchStaff, assignKpiToDepartment} from "@/api/staff.ts";
import {isSuccess} from '@/utils/httpStatus';
import Swal from 'sweetalert2';
import useKPI from "@/hooks/useKPI.ts";
import {setKpiDepartment, removeKpiDepartment} from "@/api/kpiAdmin.ts";
import {
  updateKpi,
  createKpi,
  deleteKpi,
  terminateKpi,
  assignKpiToStaff,
  removeKpiFromStaff
} from "@/api/kpiAdmin.ts";
import {selectAllDepartments} from "@/api/department.ts";
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const assignedCopy = ref<any[]>([])


const {
  kpiData,
  currentPage,
  handlerFetchKpis,
  count,
} = useKPI();

let currentUserDepartment = ref("")
let currentUserDepartmentId = ref(0)
let currentRoles = reactive([])
let currentKPIDepartmentID = ref(0)
let isManager = computed(() => {
  return currentRoles.includes('manager');
})

// 员工搜索相关
const staffSearchKeyword = ref('');
// 搜索员工的结果
const staffSearchResults = ref<any[]>([]);

const assignToAllMembers = ref(false);

const today = ref(new Date())

const cancelAllUsers = () => {
  assignedCopy.value = JSON.parse(JSON.stringify(currentTask.value.assignedUsers));
  currentTask.value.assignedUsers = [];
  console.log(assignedCopy.value);
}

const revertAllUsers = () => {
  //证明是从部门更新到员工
  if (currentTask.value.department) {
    currentTask.value.assignedUsers = []
  } else {
    currentTask.value.assignedUsers = JSON.parse(JSON.stringify(assignedCopy.value));
    assignedCopy.value = [];
    console.log(currentTask.value.assignedUsers);
  }

}

const searchStaffMembers = () => {
  if (staffSearchKeyword.value.trim().length < 2) {
    staffSearchResults.value = [];
    return;
  }
  searchStaff(staffSearchKeyword.value).then((res) => {
    if (isSuccess(res.status) && res.data.code === 200) {
      staffSearchResults.value = res.data.data.results;
    } else {
      console.error('Failed to search employees:', res);
    }
  }).catch((error) => {
    console.error('Error searching employees:', error);
  });
};
// ~搜索员工结束

const selectStaffMember = (staff: any) => {
  // 确保 currentTask.value 存在
  if (!currentTask.value) {
    currentTask.value = {};
  }

  // 确保 assignedUsers 数组已初始化
  if (!currentTask.value.assignedUsers) {
    currentTask.value.assignedUsers = [];
  }

  // 检查是否已经添加过该员工
  const isDuplicate = currentTask.value.assignedUsers.some(
      user => user.id === staff.id
  );

  if (!isDuplicate) {
    currentTask.value.assignedUsers.push({
      id: staff.id,
      username: staff.username,
      department_id: staff.department
    });

    staffSearchKeyword.value = ''; // 清空搜索框
    staffSearchResults.value = []; // 清空搜索结果
  } else {
    Swal.fire({
      icon: "warning",
      title: "Duplicate Entry",
      text: "This employee has already been added to the task"
    });
  }
};

// 当前任务对象
const currentTask = ref<any>({
  tempAssignedUser: []
})

const departments = ref<any[]>([]);

const fetchDepartments = () => {
  selectAllDepartments().then((res) => {

    if (isSuccess(res.status) && res.data.code === 200) {
      const fetchedDepartments = res.data.data.results;
      // 默认选择第一个部门
      const allDepartmentsOption = {id: 'all', department_name: 'All Departments'};
      departments.value = [allDepartmentsOption, ...fetchedDepartments];

      // 默认选择“全部部门”
      selectedDepartment.value = 'all';
    } else {
      console.error('Failed to fetch department list:', res);
    }
  }).catch((error) => {
    console.error('Error fetching department list:', error);
  });
};


onMounted(() => {
  fetchDepartments();
  const currentUserInStorage = localStorage.getItem("currentUser");
  if (currentUserInStorage != null) {
    let jsonObj = JSON.parse(currentUserInStorage);
    console.log(jsonObj);
    currentUserDepartment.value = jsonObj.department;
    currentRoles.splice(0, currentRoles.length, ...jsonObj.roles);
    currentUserDepartmentId.value = jsonObj.department_id;
  }

  // 包含manager的情况下按照manager处理
  if (isManager.value) {
    const queryParams = {
      page: 1,
      department_id: currentUserDepartmentId.value,
    };
    handlerFetchKpis(queryParams);
  } else {
    handlerFetchKpis({page: 1});
  }

});

// 移除用户的函数
const removeAssignedUser = (index: number) => {
  currentTask.value.assignedUsers.splice(index, 1);
}

const itemsPerPage = 10;
const totalPages = computed(() => Math.ceil(count.value / itemsPerPage));

const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 4) pages.push('...');

    const start = Math.max(2, current - 2);
    const end = Math.min(total - 1, current + 2);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 3) pages.push('...');
    pages.push(total);
  }

  return pages;
});

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    handlerFetchKpis({ page: currentPage.value });
  }
};


const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    handlerFetchKpis({ page: currentPage.value });
  }
}

const goToPage = (page: number) => {
  if (page !== currentPage.value) {
    currentPage.value = page;
    handlerFetchKpis({ page: currentPage.value }); 
  }
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

  if (dayjs(currentDate).isAfter(dayjs(startDate))) {
    Swal.fire({
      icon: "error",
      title: "Invalid Date",
      text: "Current day can not ahead of startDate "
    });
    return;
  }

  if (dayjs(startDate).isAfter(dayjs(endDate))) {
    Swal.fire({
      icon: "error",
      title: "Invalid Date",
      text: "End date can not early then start day"
    });
    return;
  }

  if (dayjs(currentDate).isAfter(dayjs(endDate))) {
    Swal.fire({
      icon: "error",
      title: "Invalid Date",
      text: "End date can not early then current day"
    });
    return;
  }

  // 日期状态检查
  if (dayjs(currentDate).isBefore(dayjs(startDate))) {
    taskStatus = 'Not Yet Started';  // 当前日期早于任务开始日期
  } else if (dayjs(currentDate).isBetween(dayjs(startDate), dayjs(endDate), null, '[]')) {
    taskStatus = 'Ongoing';  // 当前日期在开始日期和结束日期之间
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
    // assigned_users: currentTask.value.assignedUsers || [],  // 正确处理已分配用户
    department: selectedDepartment.value,
    seventy_percent: currentTask.value.seventy_percent,
    ninety_percent: currentTask.value.ninety_percent,
    hundred_percent: currentTask.value.hundred_percent,
    hundred_twenty_percent: currentTask.value.hundred_twenty_percent,
  };

  // 关闭模态框
  showModal.value = false;

  // 调用API创建任务
  createKpi(payload).then((res) => {
    if (isSuccess(res.status)) {
      const kpiId = res.data.data.id;
      if (isManager){
        assignType.value = "department";
        assignToAllMembers.value = true;
      }
      // 根据分配类型处理任务分配
      if (assignType.value === 'user' && currentTask.value.assignedUsers?.length > 0) {
        // 分配给选定的员工
        const assignPromises = currentTask.value.assignedUsers.map((user: any) => {
          return assignKpiToStaff(kpiId, user.id, user.department_id || selectedDepartment.value, currentTask.value.totalTarget);
        });

        Promise.all(assignPromises)
            .then(() => {
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Task created and assigned successfully",
                showConfirmButton: false,
                timer: 1500,
              });

            })
            .catch((error) => {
              console.error("Failed to assign task:", error);
              Swal.fire({
                icon: "warning",
                title: "Warning",
                text: "Task has been created, but there was an issue assigning to employees"
              });
              if (isManager.value) {
                const queryParams = {
                  page: 1,
                  department_id: currentUserDepartmentId.value,
                };
                handlerFetchKpis(queryParams);
              } else {
                handlerFetchKpis({page: 1});
              }
            });
      } else if (assignType.value === 'department' && assignToAllMembers.value) {
        // 分配给部门所有成员
        assignKpiToDepartment(kpiId, selectedDepartment.value, currentTask.value.totalTarget)
            .then(() => {
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Task created and successfully assigned to all department members",
                showConfirmButton: false,
                timer: 1500,
              });
              if (isManager.value) {
                const queryParams = {
                  page: 1,
                  department_id: currentUserDepartmentId.value,
                };
                handlerFetchKpis(queryParams);
              } else {
                handlerFetchKpis({page: 1});
              }
            })
            .catch((error) => {
              console.error("Failed to assign task to department:", error);
              Swal.fire({
                icon: "warning",
                title: "Warning",
                text: "Task has been created, but there was an issue assigning to department members"
              });
              if (isManager.value) {
                const queryParams = {
                  page: 1,
                  department_id: currentUserDepartmentId.value,
                };
                handlerFetchKpis(queryParams);
              } else {
                handlerFetchKpis({page: 1});
              }
            });
      } else {
        // 仅创建任务，不分配
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Task created successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        if (isManager.value) {
          const queryParams = {
            page: 1,
            department_id: currentUserDepartmentId.value,
          };
          handlerFetchKpis(queryParams);
        } else {
          handlerFetchKpis({page: 1});
        }
      }
    }
  }).catch((error) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while creating the task",
    });
  });
};


//Edit function
const showModal = ref(false)
const modalType = ref<'create' | 'edit'>('create')


const openEditTaskModal = (task: Task) => {
  // 创建一个深拷贝，确保所有属性都被正确复制
  currentTask.value = {...task};
  selectedDepartment.value = currentTask.value.department_id;
  // 处理已分配用户数据
  // 从 personal_details 中提取用户信息
  if (task.personal_details && Array.isArray(task.personal_details) && task.personal_details.length > 0) {
    currentTask.value.assignedUsers = task.personal_details.map((detail: any) => {
      return {
        id: detail.staff_id,
        username: detail.staff_name,
        department_id: detail.department_id,
        detailId: detail.id,
      };
    });
    console.log("Users extracted from personal_details:", currentTask.value.assignedUsers);
    assignedCopy.value = JSON.parse(JSON.stringify(currentTask.value.assignedUsers))
  } else if (!currentTask.value.assignedUsers) {
    currentTask.value.assignedUsers = [];
  }

  modalType.value = 'edit'
  showModal.value = true

  // 根据已分配用户设置分配类型
  if (currentTask.value.department) {
    assignType.value = 'department';
  } else {
    assignType.value = 'user';
  }

  // 调试信息
  console.log("Editing task:", currentTask.value);
  console.log("Assigned users:", currentTask.value.assignedUsers);
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

    if (dayjs(startDate).isAfter(dayjs(endDate))) {
      Swal.fire({
        icon: "error",
        title: "Invalid Date",
        text: "End date can not early then start day"
      });
      return;
    }

    if (dayjs(currentDate).isAfter(dayjs(endDate))) {
      Swal.fire({
        icon: "error",
        title: "Invalid Date",
        text: "End date can not early then current day"
      });
      return;
    }

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
    seventy_percent: currentTask.value.seventy_percent,
    ninety_percent: currentTask.value.ninety_percent,
    hundred_percent: currentTask.value.hundred_percent,
    hundred_twenty_percent: currentTask.value.hundred_twenty_percent,
  };

  showModal.value = false;

  updateKpi(currentTask.value.id, payload).then((res) => {
    if (isSuccess(res.status)) {
      const kpiId = currentTask.value.id;

      // 根据分配类型处理任务分配
      if (assignType.value === 'user') {
        // 获取当前已分配的用户详情
        const existingDetails = currentTask.value.personal_details || [];

        // 创建映射：员工ID -> 个人详情ID
        const existingStaffMap = new Map();
        existingDetails.forEach((detail: any) => {
          existingStaffMap.set(detail.staff_id, detail.id);
        });

        if (currentTask.value.department) {
          removeKpiDepartment(currentTask.value.id);
        }

        // 获取新的用户ID列表
        const newUserIds = currentTask.value.assignedUsers.map((user: any) => user.id);

        // 找出需要添加的用户（在新列表中但不在旧列表中）
        const usersToAdd = newUserIds.filter((userId: number) => !existingStaffMap.has(userId));

        // 找出需要删除的用户详情（在旧列表中但不在新列表中）
        const detailsToRemove = existingDetails
            .filter((detail: any) => !newUserIds.includes(detail.staff_id))
            .map((detail: any) => detail.id);

        console.log("Users to add:", usersToAdd);
        console.log("Details of users to remove:", detailsToRemove);

        // 创建所有操作的Promise数组
        const promises: Promise<any>[] = [];

        // 添加新用户的Promise
        usersToAdd.forEach((userId: number) => {
          const user = currentTask.value.assignedUsers.find((u: any) => u.id === userId);
          const departmentId = user?.department_id || selectedDepartment.value;
          promises.push(assignKpiToStaff(kpiId, userId, departmentId, currentTask.value.totalTarget));
        });

        // 删除旧用户的Promise
        detailsToRemove.forEach((detailId: number) => {
          promises.push(removeKpiFromStaff(detailId));
        });

        // 如果有需要执行的操作
        if (promises.length > 0) {
          Promise.all(promises)
              .then(() => {
                Swal.fire({
                  position: "top-end",
                  icon: "success",
                  title: "Task updated and reassigned successfully",
                  showConfirmButton: false,
                  timer: 1500,
                });
                if (isManager.value) {
                  const queryParams = {
                    page: 1,
                    department_id: currentUserDepartmentId.value,
                  };
                  handlerFetchKpis(queryParams);
                } else {
                  handlerFetchKpis({page: 1});
                }
              })
              .catch((error) => {
                console.error("Failed to reassign task:", error);
                Swal.fire({
                  icon: "warning",
                  title: "Warning",
                  text: "Task has been updated, but there was an issue reassigning to staff"
                });
                if (isManager.value) {
                  const queryParams = {
                    page: 1,
                    department_id: currentUserDepartmentId.value,
                  };
                  handlerFetchKpis(queryParams);
                } else {
                  handlerFetchKpis({page: 1});
                }
              });
        } else {
          // 如果没有新的分配操作，直接显示成功
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Task updated successfully",
            showConfirmButton: false,
            timer: 1500,
          });
          if (isManager.value) {
            const queryParams = {
              page: 1,
              department_id: currentUserDepartmentId.value,
            };
            handlerFetchKpis(queryParams);
          } else {
            handlerFetchKpis({page: 1});
          }
        }
      } else if (assignType.value === 'department' && assignToAllMembers.value) {


        assignKpiToDepartment(kpiId, selectedDepartment.value, currentTask.value.totalTarget)
            .then(() => {
              setKpiDepartment(kpiId, selectedDepartment.value);
              Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Task updated and successfully assigned to all department members",
                showConfirmButton: false,
                timer: 1500,
              });
              setTimeout(() => {
                if (isManager.value) {
                  const queryParams = {
                    page: 1,
                    department_id: currentUserDepartmentId.value,
                  };
                  handlerFetchKpis(queryParams);
                } else {
                  handlerFetchKpis({page: 1});
                }
              }, 300); // 200~500ms 通常足够
            })
            .catch((error) => {
              console.error("Failed to assign task to department:", error);
              Swal.fire({
                icon: "warning",
                title: "Warning",
                text: "Task updated, but there was an issue assigning to department members"
              });
              if (isManager.value) {
                const queryParams = {
                  page: 1,
                  department_id: currentUserDepartmentId.value,
                };
                handlerFetchKpis(queryParams);
              } else {
                handlerFetchKpis({page: 1});
              }
            });
      } else {
        // 仅更新任务，不重新分配
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Task updated successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        if (isManager.value) {
          const queryParams = {
            page: 1,
            department_id: currentUserDepartmentId.value,
          };
          handlerFetchKpis(queryParams);
        } else {
          handlerFetchKpis({page: 1});
        }
      }
    }
  }).catch((error) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while updating the task"
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
    handlerFetchKpis({page: 1})
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
  showModal.value = false;
  currentTask.value = task;
  showTerminateModal.value = true; // Show Terminate confirmation modal
}
const handleCancelTerminate = () => {
  showTerminateModal.value = false;
  showModal.value = true; // 重新打开 Edit Modal
};

// Function to confirm Terminate and close both modals
const confirmTerminate = () => {
  // Here you update the task status to Terminated
  const payload = {kpi_status: 'Terminated'};

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
    handlerFetchKpis({page: 1})  // Fetch updated tasks
  }).catch((error) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "There was an error terminating the task."
    });
  });
}

/**
 * 判断当前的表单提交类型
 */
const handleSubmit = () => {
  if (modalType.value === 'create') {
    createTask();
  } else if (modalType.value === 'edit') {
    saveEditedTask();
  }
};

// New total target calculation based on assigned users count
const calculateTotalTarget = (task: any): number => {
  const total = task.totalTarget;
  const users = task.personal_details.length;
  return total * users;
}

// filter
const searchTaskName = ref('')
const selectedStatus = ref('')
const searchDepartment = ref('all')

const selectedDepartment = ref(0)

const completedTasks = computed(() => {
  return kpiData.value.filter((task: any) => task.status === 'Completed').length;
});

const ongoingTasks = computed(() => {
  return kpiData.value.filter((task: any) => task.status === 'Ongoing').length;
});

const delayedTasks = computed(() => {
  return kpiData.value.filter((task: any) => task.status === 'Delayed').length;
});


/**
 * 根据状态或者KPI的名称查询KPI信息
 */
function searchKPI() {
  let searchDepartmentValue = 0;
  if (isManager.value) {
    searchDepartmentValue = currentUserDepartmentId.value;
  } else {
    searchDepartmentValue = searchDepartment.value === 'all' ? undefined : searchDepartment.value;
  }
  const queryParams = {
    page: 1,
    task_title: searchTaskName.value || undefined,
    status: selectedStatus.value || undefined,
    department_id: searchDepartmentValue,
  };
  handlerFetchKpis(queryParams);
}


function cleanSearchCondition() {
  selectedStatus.value = '';
  searchDepartment.value = '';
  searchTaskName.value = '';
}


const handleDepartmentChange = () => {

};


// New reactive variable for assignment type
const assignType = ref('user')  // default assignment type is 'user'

const openCreateTaskModal = () => {

  currentTask.value = {
    id: 0,
    taskTitle: '',
    taskDescription: '',
    status: '',
    startDate: '',
    endDate: '',
    pointsGiven: 0,
    totalTarget: 0,
    individualUnit: '',
    assignedUsers: [], // 确保这个数组被初始化
    department: selectedDepartment.value?.department_name || ''
  }
  if (isManager) {
    currentTask.value.departments = currentUserDepartmentId.value;
    selectedDepartment.value = currentUserDepartmentId.value;
  }
  modalType.value = 'create'
  assignType.value = 'user' // reset assignment type to default
  showModal.value = true
}


const calculateTotalProgress = (task: any) => {
  // 检查是否有personal_details数据
  if (!task.personal_details || !Array.isArray(task.personal_details)) {
    return 0;
  }

  // 计算所有员工的completed_unit总和
  return task.personal_details.reduce((total: number, detail: any) => {
    // 确保completed_unit是数字
    const completedUnit = Number(detail.completed_unit) || 0;
    return total + completedUnit;
  }, 0);
};

const goToEmployeeDetailsPage = (taskId: string | number) => {
  router.push(`/home/employee-task-details/${taskId}`);
};

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

.btn {
  display: inline-block;
  padding: 0.4rem 0.9rem;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 14.5px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  text-decoration: none;
}

.btn:hover {
  transform: translateY(-1px);
  /* 减少悬停位移 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, #035eb3c7 0%, #0042ac 100%);
  color: white;
  border-color: rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(90deg, #115da0, #00326f);
}

.btn-warning {
  background: linear-gradient(90deg, #ffbb00, #ff9100);
  color: white;
}

.btn-warning:hover {
  background: linear-gradient(90deg, #ffd102, #ff8c00);
}

.btn-danger {
  background: linear-gradient(90deg, #f96060, #ef4444);
  color: white;
}

.btn-danger:hover {
  background: linear-gradient(90deg, #e53e3e, #c53030);
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
}

.btn-success {
  margin-top: 0.7rem;
  margin-right: 0.5rem;
  background: linear-gradient(90deg, #327942, #2a900c);
  color: white;
}

.btn-success:hover {
  background: linear-gradient(90deg, #10602d, #11813a);
}

.badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 550;
  text-align: center;
  white-space: nowrap;
  text-transform: uppercase;
  vertical-align: middle;
  border-radius: 999px;
  cursor: default;
  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.2),
  0 1px 3px rgba(0, 0, 0, 0.2);
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.rounded-circle {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
}

.table th {
  font-weight: normal;

}

.table thead th {
  background-color: #ffffff !important;
  color: #333;
  font-weight: 600;
  padding: 0.75rem;
  border-bottom: 1px solid #f9fafb;

}

.table tbody td {
  background-color: #ffffff !important;
}

.line {
  border: 1px solid #e9e9e9;

}

.stats-section {
  max-width: 1900px;
  margin: 1rem auto 3rem;
  padding: 0 2rem;
}

.stats-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.stat-card {
  border-radius: 20px;
  padding: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border-left: 5px solid;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

/* 卡片背景圆圈 */
.card-background {
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  opacity: 0.05;
  transform: translate(40px, -40px);
}

/* 颜色配置 */
.total-card {
  border-left-color: #3b82f6;
  background: #4b8ffe1b;
}

.total-card .card-background {
  background: #3b82f6;
}

.completed-card {
  border-left-color: #10b981;
  background: #10b9811b;
}

.completed-card .card-background {
  background: #10b981;
}

.ongoing-card {
  border-left-color: #f59e0b;
  background: #f59f0b1e;
}

.ongoing-card .card-background {
  background: #f59e0b;
}

.delayed-card {
  border-left-color: #ef4444;
  background: #ef444419;
}

.delayed-card .card-background {
  background: #ef4444;
}

.card-icon {
  font-size: 2.8rem;
  opacity: 0.8;
  margin-right: -2rem;
  margin-left: 1rem;
}

.card-content {
  flex: 1;
  text-align: center;
}

.card-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.card-label {
  font-size: 1rem;
  color: #6b7280;
  margin-top: 0.5rem;
  font-weight: 500;
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
  background: rgb(255, 255, 255);
  border-radius: 8px;
  width: 100%;
  margin: 0 1rem;
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #f9fafb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 0.5rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #f9fafb;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.search-result-item:hover {
  background-color: #f8f9fa;
  cursor: pointer;
}

.cursor-pointer {
  cursor: pointer;
}

.pagination .page-link { border-radius:8px; margin:0 5px; border:1px solid #ddd; padding:8px 14px; }
.page-item.active .page-link { background:linear-gradient(90deg,#9ba1a7,#acb7c6); color:white; }
.page-item.disabled .page-link { background:#f5f5f5; color:#999; cursor:not-allowed; }
</style>
