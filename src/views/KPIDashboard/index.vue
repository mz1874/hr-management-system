<script lang="ts" setup>
import { ref, computed } from 'vue';

import useKPIDashboard from "@/hooks/useKPIDashboard.ts";

const {
  tableData,
  ongoing,
  done,
  delayed,
  fetchPersonalKPI
} = useKPIDashboard();

// 当前页码
let currentPage = ref<number>(1);

// 当前选中的状态（O: Ongoing, C: Done, D: Delayed）
const selectedStatus = ref<string>('');

/**
 * 总页数（注意：这个取决于后端返回的总数量，应该基于 totalCount 而不是 tableData.length）
 */
let pages = computed(() => {
  return Math.ceil(tableData.length / 10); // ✅ 建议改为总数除以10（如 count.value）
});

/**
 * 分页跳转逻辑
 */
function goToPage(page: number) {
  if (page < 1) return;

  currentPage.value = page;
  fetchPersonalKPI(page, selectedStatus.value);
}

/**
 * 处理状态筛选变更
 */
function handleStatusChange() {
  currentPage.value = 1;
  fetchPersonalKPI(1, selectedStatus.value);
}

</script>

<template>
  <h1>My KPI DashBoard</h1><br>

  <div class="task-summary">
    <div class="task-card tasks">
      <p>Tasks</p>
      <h1><b>{{ tableData.length }}</b></h1>
    </div>
    <div class="task-card ongoing">
      <p>Ongoing</p>
      <h1><b>{{ ongoing }}</b></h1>
    </div>
    <div class="task-card done">
      <p>Done</p>
      <h1><b>{{ done }}</b></h1>
    </div>
    <div class="task-card delayed">
      <p>Delayed</p>
      <h1><b>{{ delayed }}</b></h1>
    </div>
  </div>

  <br />

  <div class="kpi-table-container">
    <div class="table-header">
      <!-- 状态筛选 -->
      <select class="status-filter" v-model="selectedStatus" @change="handleStatusChange">
        <option value="">All</option>
        <option value="C">Done</option>
        <option value="O">Ongoing</option>
        <option value="D">Delayed</option>
      </select>
    </div>

    <!-- KPI 数据表 -->
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>KPI Name</th>
          <th>Current</th>
          <th>Target</th>
          <th>Start Date</th>
          <th>Due Date</th>
          <th>Unit</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="kpi in tableData" :key="kpi.id">
          <td>{{ kpi.id }}</td>
          <td>{{ kpi.kpi_title }}</td>
          <td>{{ kpi.completed_unit }}</td>
          <td>{{ kpi.target_unit }}</td>
          <td>{{ kpi.task_start_date }}</td>
          <td>{{ kpi.task_completion_date }}</td>
          <td>{{ kpi.individual_unit }}</td>
          <td>
            <span class="status-badge" :class="'status-' + kpi.current_status">
              {{ kpi.current_status }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="d-flex align-items-center mt-3 justify-content-start">
      <!-- 右侧: 分页按钮也靠左 -->
      <nav aria-label="Page navigation">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="goToPage(currentPage - 1)">Previous</button>
          </li>
          <li class="page-item" v-for="page in pages" :key="page" :class="{ active: page === currentPage }">
            <button class="page-link" @click="goToPage(page)">{{ page }}</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === pages }">
            <button class="page-link" @click="goToPage(currentPage + 1)">Next</button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<style scoped>
/* 任务统计格子 */
.task-summary {
  display: flex;
  gap: 20px;
  justify-content: left;
  margin-bottom: 20px;
}

.task-card {
  width: 120px;
  height: 100px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.task-card p {
  margin: 0;
  font-size: 14px;
}

.task-card h2 {
  margin: 5px 0 0;
  font-size: 24px;
}

/* 颜色设置 */
.tasks { 
  background: #5D9FD6; 
  border: 5px solid #B3CFE6;
  border-radius: 25px;
  padding:80px 60px;
} 
  .tasks p {
    font-size: 27px;
    padding-bottom: 15px;
  }

.ongoing { 
  background: #FFC107; 
  border: 5px solid #FDD853;
  border-radius: 25px;
  padding:80px 60px;
} 
  .ongoing p{
    font-size: 27px;
    padding-bottom: 15px;
  }

.done { 
  background: #6CC763; 
  border: 5px solid #ABE3A5;
  border-radius: 25px;
  padding:80px 60px;
} 
  .done p{
    font-size: 27px;
    padding-bottom: 15px;
  }

.delayed { 
  background: #F2A9A3; 
  border: 5px solid #F3C5C1;
  border-radius: 25px;
  padding:80px 60px;
} 
  .delayed p{
    font-size: 27px;
    padding-bottom: 15px;
  }

/* KPI Table */
.kpi-table-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin: 0 17px;
}

.table-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
}

.status-filter {
  padding: 10px 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 15px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 13px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.status-badge {
  padding: 5px 15px;
  border-radius: 15px;
  color: white;
  display: inline-block;
}

/* 状态颜色 */
.status-Completed {
  background: #6cc763;
}

.status-Ongoing {
  background: #ffc107;
}

.status-Delayed {
  background: #f2a9a3;
}
</style>