<script lang="ts" setup>
import { ref, computed } from 'vue';

// 选中的状态
const selectedStatus = ref<string>('');

// KPI 数据
const kpis = ref([
  { kpi: 'Sales Target', target: 'RM3,000', current: 'RM4,500', dueDate: '2024-10-31', status: 'Done' },
  { kpi: 'Customer Satisfaction', target: 'above 90%', current: '87%', dueDate: '2024-12-01', status: 'Ongoing' },
  { kpi: 'New Clients', target: '15', current: '17', dueDate: '2024-10-10', status: 'Delayed' },
  { kpi: 'Training Hours', target: '40hrs', current: '33hrs', dueDate: '2024-12-31', status: 'Ongoing' }
]);

// 计算不同状态的任务数量
const totalTasks = computed(() => kpis.value.length);
const ongoingCount = computed(() => kpis.value.filter(kpi => kpi.status === 'Ongoing').length);
const doneCount = computed(() => kpis.value.filter(kpi => kpi.status === 'Done').length);
const delayedCount = computed(() => kpis.value.filter(kpi => kpi.status === 'Delayed').length);

// 计算筛选后的 KPI 数据
const filteredKpis = computed(() => {
  return selectedStatus.value ? kpis.value.filter(kpi => kpi.status === selectedStatus.value) : kpis.value;
});
</script>

<template>
  <h1>My KPI DashBoard</h1><br>

  <div class="task-summary">
    <div class="task-card tasks">
      <p>Tasks</p>
      <h1><b>{{ totalTasks }}</b></h1>
    </div>
    <div class="task-card ongoing">
      <p>Ongoing</p>
      <h1><b>{{ ongoingCount }}</b></h1>
    </div>
    <div class="task-card done">
      <p>Done</p>
      <h1><b>{{ doneCount }}</b></h1>
    </div>
    <div class="task-card delayed">
      <p>Delayed</p>
      <h1><b>{{ delayedCount }}</b></h1>
    </div>
  </div>

  <br />

  <div class="kpi-table-container">
    <div class="table-header">
      <!-- 状态筛选 -->
      <select class="status-filter" v-model="selectedStatus">
        <option value="">All</option>
        <option value="Done">Done</option>
        <option value="Ongoing">Ongoing</option>
        <option value="Delayed">Delayed</option>
      </select>
    </div>

    <!-- KPI 数据表 -->
    <table>
      <thead>
        <tr>
          <th>KPI</th>
          <th>Target</th>
          <th>Current</th>
          <th>Due Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="kpi in filteredKpis" :key="kpi.kpi">
          <td>{{ kpi.kpi }}</td>
          <td>{{ kpi.target }}</td>
          <td>{{ kpi.current }}</td>
          <td>{{ kpi.dueDate }}</td>
          <td>
            <span class="status-badge" :class="'status-' + kpi.status.toLowerCase()">
              {{ kpi.status }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
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
.status-done {
  background: #6cc763;
}

.status-ongoing {
  background: #ffc107;
}

.status-delayed {
  background: #f2a9a3;
}
</style>