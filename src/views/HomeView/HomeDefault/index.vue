<template>
  <main class="main-content">
    <!-- Task Statistics Section -->
    <div class="row row-center text-center my-4">
      <div class="col-md-3">
        <div class="p-4 bg-primary text-white">
          <h3>Tasks</h3>
          <p><b>{{ totalTasks }}</b></p>
        </div>
      </div>
      <div class="col-md-3">
        <div class="p-4 bg-success text-white">
          <h3>Done</h3>
          <p><b>{{ completedTasks }}</b></p>
        </div>
      </div>
    </div>

    <div class="row row-center text-center my-4">
      <div class="col-md-3">
        <div class="p-4 bg-warning text-white">
          <h3>Ongoing</h3>
          <p><b>{{ ongoingTasks }}</b></p>
        </div>
      </div>
      <div class="col-md-3">
        <div class="p-4 bg-danger text-white">
          <h3>Delayed</h3>
          <p><b>{{ delayedTasks }}</b></p>
        </div>
      </div>
    </div>

    <!-- Department & Month Filters -->
    <h2>{{ selectedDepartment.department_name || 'Department' }} KPI Management</h2>
    <div class="chart-section my-4">
      <h4 class="text-center">Number of finished jobs in {{ selectedDepartment.department_name }} department</h4>

      <!-- Department Filter -->
      <div class="d-flex justify-content-center my-3">
        <select v-model="selectedDepartment" class="form-select mx-2" style="width: 150px;"
          @change="handleDepartmentChange">
          <option v-for="dept in departments" :key="dept.id" :value="dept">
            {{ dept.department_name }}
          </option>
        </select>
        <!-- Month Filter -->
        <select v-model="selectedMonth" class="form-select mx-2" style="width: 150px;">
          <option v-for="(month, idx) in months" :key="idx" :value="idx + 1">
            {{ month }}
          </option>
        </select>

      </div>

      <!-- Chart Section -->
      <div class="text-center">
        <canvas ref="chartCanvas" style="max-width: 600px; margin: auto;"></canvas>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import { selectAllDepartments } from "@/api/department.ts";
import { selectAllKpis } from "@/api/kpiAdmin.ts";
import { isSuccess } from '@/utils/httpStatus';
import Swal from 'sweetalert2';

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const departments = ref<any[]>([]);
const selectedDepartment = ref<any>({});
const selectedMonth = ref<number>(1);
const selectedStatus = ref('');

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const kpiData = ref<any[]>([]);
const totalTasks = computed(() => kpiData.value.length);
const completedTasks = computed(() => kpiData.value.filter(task => task.kpi_status === 'Completed').length);
const ongoingTasks = computed(() => kpiData.value.filter(task => task.kpi_status === 'Ongoing').length);
const delayedTasks = computed(() => kpiData.value.filter(task => task.kpi_status === 'Delayed').length);

// Set to track which filter combos have shown an empty alert
const emptyAlertedFilters = ref<Set<string>>(new Set());

const fetchDepartments = () => {
  selectAllDepartments().then((res) => {
    if (isSuccess(res.status)) {
      departments.value = res.data.data.results;
      if (departments.value.length > 0) {
        selectedDepartment.value = departments.value[0];
        fetchKpis();
      }
    }
  }).catch((error) => console.error('Error fetching departments:', error));
};

const fetchKpis = () => {
  const params: any = {
    department_id: selectedDepartment.value.id,
    status:        selectedStatus.value,
    month:         selectedMonth.value,
  };

  // Create a unique key for this filter set
  const filterKey = `${params.department_id}-${params.status}-${params.month}`;

  selectAllKpis(params)
    .then((res) => {
      if (isSuccess(res.status)) {
        kpiData.value = res.data.data.results;

        // Only show the alert once per unique filterKey
        if (kpiData.value.length === 0 && !emptyAlertedFilters.value.has(filterKey)) {
          emptyAlertedFilters.value.add(filterKey);
          Swal.fire({
            icon: 'info',
            title: 'Notice',
            text: 'There are currently no tasks to display',
            showConfirmButton: false,
            timer: 1500
          });
        }

        updateChart();
      }
    })
    .catch((error) => {
      console.error('Error fetching KPIs:', error);
    });
};

const updateChart = () => {
  const doneCount = kpiData.value.filter((task: any) => task.kpi_status === 'Completed').length;
  const ongoingCount = kpiData.value.filter((task: any) => task.kpi_status === 'Ongoing').length;
  const delayedCount = kpiData.value.filter((task: any) => task.kpi_status === 'Delayed').length;

  console.log("Chart Data:", [doneCount, ongoingCount, delayedCount]);

  if (chartInstance) {
    chartInstance.data.datasets[0].data = [doneCount, ongoingCount, delayedCount];
    chartInstance.update();
  }
};

onMounted(() => {
  if (chartCanvas.value) {
    chartInstance = new Chart(chartCanvas.value, {
      type: 'pie',
      data: {
        labels: ['Done', 'Ongoing', 'Delayed'],
        datasets: [
          {
            data: [0, 0, 0],
            backgroundColor: ['#6CC763', '#FFC107', '#F2A9A3'],
            borderColor: ['#ABE3A5', '#FDD853', '#F3C5C1'],
            borderWidth: 3
          }
        ]
      }
    });
  }

  fetchDepartments();
});

watch([selectedDepartment, selectedMonth, selectedStatus], fetchKpis);
</script>

<style scoped>
body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Nunito', sans-serif;
}

.header {
  background-color: #DFE9DE;
  padding: 0.5rem;
  height: 60px;
  margin-left: 250px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.sidebar {
  background-color: #004d40;
  color: white;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  padding: 0;
  overflow-y: auto;
  z-index: 1031;
}

.logo-container {
  padding: 1rem;
  text-align: center;
}

.logo-img {
  max-width: 200px;
  height: auto;
}

.main-content {
  margin-left: 20px;
  padding: 2rem;
  flex: 1;
}

.row-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.nav-item {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
  display: block;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.footer {
  background-color: #666;
  color: white;
  padding: 1rem;
  height: 50px;
  text-align: left;
  margin-left: 250px;
}

.search-container {
  position: relative;
  margin-bottom: 2rem;
}

.search-container input {
  padding-left: 40px;
}

.search-container i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
}

.chart-section {
  border: 1px solid #DDDFE1;
  background-color: #F5F8FA !important;
  padding: 25px;
  border-radius: 4px;
  margin: 80px;
}

.bg-primary {
  background-color: #5D9FD6 !important;
  border: 5px solid #B3CFE6;
  border-radius: 35px;
}

.bg-primary h3 {
  text-align: left;
  margin: 0;
}

.bg-primary p {
  text-align: right;
  font-size: 55px;
  margin: -5px;
}

.bg-success {
  background-color: #6CC763 !important;
  border: 5px solid #ABE3A5;
  border-radius: 35px;
}

.bg-success h3 {
  text-align: left;
  margin: 0;
}

.bg-success p {
  text-align: right;
  font-size: 55px;
  margin: -5px;
}

.bg-warning {
  background-color: #FFC107 !important;
  border: 5px solid #FDD853;
  border-radius: 35px;
}

.bg-warning h3 {
  text-align: left;
  margin: 0;
}

.bg-warning p {
  text-align: right;
  font-size: 55px;
  margin: -5px;
}

.bg-danger {
  background-color: #F2A9A3 !important;
  border: 5px solid #F3C5C1;
  border-radius: 35px;
}

.bg-danger h3 {
  text-align: left;
  margin: 0;
}

.bg-danger p {
  text-align: right;
  font-size: 55px;
  margin: -5px;
}

.pagination {
  justify-content: center;
  margin-top: 2rem;
}

.footer-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.footer-links a {
  color: white;
  text-decoration: none;
  font-size: 0.9rem;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>