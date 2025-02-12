<template>
  <!-- 筛选条件 -->
  <div class="row align-items-center nav">
    <div class="col-6">
      <h5>System log</h5>
    </div>

    <div class="col-md-2">
      <input ref="datepickerStart" class="form-control" placeholder="Start Time">
    </div>

    <div class="col-md-2">
      <input ref="datepickerEnd" class="form-control" placeholder="End Time">
    </div>

    <div class="col-md-2">
      <button type="button" class="btn btn-primary" @click="fetchLogs">Search</button>
    </div>
  </div>

  <!-- 日志表格 -->
  <div class="table-responsive mt-4">
    <table class="table table-striped">
      <thead>
      <tr>
        <th>ID</th>
        <th>User Name</th>
        <th>Operation Time</th>
        <th>Action</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="log in paginatedLogs" :key="log.id">
        <td>{{ log.id }}</td>
        <td>{{ log.user }}</td>
        <td>{{ log.time }}</td>
        <td>
          <button class="btn btn-sm btn-info" @click="viewDetails(log)">View</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>

  <!-- 分页 & 总条数 -->
  <div class="d-flex align-items-center mt-3 justify-content-start">
    <!-- 左侧: 总条数 -->
    <span class="me-3">Total Logs: {{ totalLogs }}</span>

    <!-- 右侧: 分页按钮也靠左 -->
    <nav>
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="prevPage">Previous</button>
        </li>
        <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }">
          <button class="page-link" @click="goToPage(page)">{{ page }}</button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="nextPage">Next</button>
        </li>
      </ul>
    </nav>
  </div>

  <!-- 模态框 -->
  <div class="modal fade" id="logDetailsModal" ref="logDetailsModal" tabindex="-1" aria-labelledby="logDetailsModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="logDetailsModalLabel">Log Details</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p><strong>ID:</strong> {{ selectedLog.id }}</p>
          <p><strong>User:</strong> {{ selectedLog.user }}</p>
          <p><strong>Time:</strong> {{ selectedLog.time }}</p>
          <p><strong>Action:</strong> {{ selectedLog.action }}</p>
          <!-- 你可以在这里添加更多的日志详细信息 -->
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>

</template>


<script setup lang="ts">
import contentHeader from "@/components/header/index.vue";
import { onMounted, ref, computed, nextTick } from 'vue';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import {Modal} from "bootstrap";

// 日期选择器
const datepickerStart = ref(null);
const datepickerEnd = ref(null);

onMounted(async () => {
  await nextTick();
  if (datepickerStart.value) {
    flatpickr(datepickerStart.value, { dateFormat: 'Y-m-d', enableTime: false });
  }
  if (datepickerEnd.value) {
    flatpickr(datepickerEnd.value, { dateFormat: 'Y-m-d', enableTime: false });
  }
});

// 日志数据 (模拟 API 返回)
const logs = ref([
  { id: 1, user: "Alice", time: "2024-02-10 10:00", action: "Login" },
  { id: 2, user: "Bob", time: "2024-02-10 10:30", action: "Logout" },
  { id: 3, user: "Charlie", time: "2024-02-10 11:00", action: "Create User" },
  { id: 4, user: "David", time: "2024-02-10 11:30", action: "Delete User" },
  { id: 5, user: "Eve", time: "2024-02-10 12:00", action: "Update Profile" },
  { id: 6, user: "Frank", time: "2024-02-10 12:30", action: "Change Password" },
  { id: 7, user: "Grace", time: "2024-02-10 13:00", action: "Login" },
  { id: 8, user: "Hank", time: "2024-02-10 13:30", action: "Logout" },
  { id: 9, user: "Ivy", time: "2024-02-10 14:00", action: "Create User" },
  { id: 10, user: "Jack", time: "2024-02-10 14:30", action: "Delete User" },
  { id: 11, user: "Kate", time: "2024-02-10 15:00", action: "Update Profile" },
  { id: 12, user: "Leo", time: "2024-02-10 15:30", action: "Change Password" },
  { id: 13, user: "Mona", time: "2024-02-10 16:00", action: "Login" },
  { id: 14, user: "Nick", time: "2024-02-10 16:30", action: "Logout" },
  { id: 15, user: "Olivia", time: "2024-02-10 17:00", action: "Create User" },
]);

// 分页相关
const currentPage = ref(1);
const itemsPerPage = 10; // 每页显示 10 条

const totalLogs = computed(() => logs.value.length);
const totalPages = computed(() => Math.ceil(totalLogs.value / itemsPerPage));

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return logs.value.slice(start, start + itemsPerPage);
});

// 翻页功能
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
const goToPage = (page: number) => {
  currentPage.value = page;
};

// 搜索功能 (模拟 API 调用)
const fetchLogs = () => {
  console.log("Fetching logs for selected date range...");
};

const logDetailsModal = ref();
// 查看详情
const selectedLog = ref({ id: null, user: '', time: '', action: '' });

const viewDetails = (log:any) => {
  selectedLog.value = log;
  const modal = new Modal(logDetailsModal.value);
  modal.show();
};
</script>


<style scoped>

.modal{
  margin-top: 200px;
}
.nav {
  margin-top: 40px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

/* Add background color to the header row */
.table th {
  background-color: #46d2d9; /* Light gray background for header */
  text-align: center;
  padding: 8px;
  font-weight: bold;
}

.table td {
  text-align: center;
  padding: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.pagination .page-item.active .page-link {
  background-color: #b4d382;
  border-color: #007bff;
}

.float-start {
  margin-left: 10px; /* 防止贴边 */
}

.pagination .page-link {
  color: #007bff;
  cursor: pointer;
}
</style>
