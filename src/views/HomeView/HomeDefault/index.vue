<template>
  <div class="dashboard-wrapper">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-section">
          <h1 class="dashboard-title">
            <span class="title-icon">🏢</span>
            {{ selectedDepartment.department_name || 'Department' }} KPI Management
          </h1>
          <p class="dashboard-subtitle">Monitor and analyze department performance metrics</p>
        </div>
        
        <!-- Filter Controls -->
        <div class="filter-controls">
          <div class="filter-group">
            <label class="filter-label">
              <span class="label-icon">🏢</span>
              Department
            </label>
            <select 
              v-model="selectedDepartment" 
              class="modern-select"
              @change="handleDepartmentChange"
            >
              <option v-for="dept in departments" :key="dept.id" :value="dept">
                {{ dept.department_name }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">
              <span class="label-icon">📅</span>
              Month
            </label>
            <select v-model="selectedMonth" class="modern-select">
              <option v-for="(month, idx) in months" :key="idx" :value="idx + 1">
                {{ month }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card total-card">
          <div class="card-background"></div>
          <div class="card-icon">📋</div>
          <div class="card-content">
            <div class="card-number">{{ totalTasks }}</div>
            <div class="card-label">Total Tasks</div>
          </div>
          <div class="card-trend">
            <span class="trend-icon">📈</span>
            <span class="trend-value">+12%</span>
          </div>
        </div>

        <div class="stat-card completed-card">
          <div class="card-background"></div>
          <div class="card-icon">✅</div>
          <div class="card-content">
            <div class="card-number">{{ completedTasks }}</div>
            <div class="card-label">Completed</div>
          </div>
          <div class="card-trend">
            <span class="trend-icon">📈</span>
            <span class="trend-value">+23%</span>
          </div>
        </div>

        <div class="stat-card ongoing-card">
          <div class="card-background"></div>
          <div class="card-icon">⏳</div>
          <div class="card-content">
            <div class="card-number">{{ ongoingTasks }}</div>
            <div class="card-label">Ongoing</div>
          </div>
          <div class="card-trend">
            <span class="trend-icon">📊</span>
            <span class="trend-value">+5%</span>
          </div>
        </div>

        <div class="stat-card delayed-card">
          <div class="card-background"></div>
          <div class="card-icon">⚠️</div>
          <div class="card-content">
            <div class="card-number">{{ delayedTasks }}</div>
            <div class="card-label">Delayed</div>
          </div>
          <div class="card-trend delayed-trend">
            <span class="trend-icon">📉</span>
            <span class="trend-value">-8%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart Section -->
    <div class="chart-section">
      <div class="chart-container">
        <div class="chart-header">
          <div class="chart-title">
            <h3>Task Status Distribution</h3>
            <p>Visual breakdown of task completion status in {{ selectedDepartment.department_name }} Department</p>
          </div>
          
          <!-- Legend -->
          <div class="chart-legend">
            <div class="legend-item">
              <div class="legend-color completed-color"></div>
              <span>Completed ({{ completedTasks }})</span>
            </div>
            <div class="legend-item">
              <div class="legend-color ongoing-color"></div>
              <span>Ongoing ({{ ongoingTasks }})</span>
            </div>
            <div class="legend-item">
              <div class="legend-color delayed-color"></div>
              <span>Delayed ({{ delayedTasks }})</span>
            </div>
          </div>
        </div>

        <div class="chart-content">
          <div class="chart-wrapper">
            <canvas ref="chartCanvas"></canvas>
          </div>
          
          <!-- Chart Statistics -->
          <div class="chart-stats">
            <div class="completion-rate">
              <div class="rate-circle">
                <div class="rate-number">{{ Math.round((completedTasks / totalTasks) * 100) || 0 }}%</div>
                <div class="rate-label">Completion Rate</div>
              </div>
            </div>
            
            <div class="stats-breakdown">
              <div class="breakdown-item">
                <div class="breakdown-bar">
                  <div class="bar-fill completed-fill" :style="{ width: (completedTasks / totalTasks * 100) + '%' }"></div>
                </div>
                <div class="breakdown-text">
                  <span class="breakdown-label">Completed</span>
                  <span class="breakdown-value">{{ completedTasks }}/{{ totalTasks }}</span>
                </div>
              </div>
              
              <div class="breakdown-item">
                <div class="breakdown-bar">
                  <div class="bar-fill ongoing-fill" :style="{ width: (ongoingTasks / totalTasks * 100) + '%' }"></div>
                </div>
                <div class="breakdown-text">
                  <span class="breakdown-label">Ongoing</span>
                  <span class="breakdown-value">{{ ongoingTasks }}/{{ totalTasks }}</span>
                </div>
              </div>
              
              <div class="breakdown-item">
                <div class="breakdown-bar">
                  <div class="bar-fill delayed-fill" :style="{ width: (delayedTasks / totalTasks * 100) + '%' }"></div>
                </div>
                <div class="breakdown-text">
                  <span class="breakdown-label">Delayed</span>
                  <span class="breakdown-value">{{ delayedTasks }}/{{ totalTasks }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="actions-section">
      <div class="actions-container">
        <h3 class="actions-title">Quick Actions</h3>
        <div class="actions-grid">
          <button class="action-btn primary-action">
            <span class="action-icon">➕</span>
            <span class="action-text">Add New KPI</span>
          </button>
          
          <button class="action-btn secondary-action">
            <span class="action-icon">📊</span>
            <span class="action-text">Generate Report</span>
          </button>
          
          <button class="action-btn tertiary-action">
            <span class="action-icon">⚙️</span>
            <span class="action-text">Manage Settings</span>
          </button>
          
          <button class="action-btn quaternary-action">
            <span class="action-icon">📤</span>
            <span class="action-text">Export Data</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import { selectAllDepartments } from "@/api/department.ts";
import { selectAllKpis } from "@/api/kpiAdmin.ts";
import { isSuccess } from '@/utils/httpStatus';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const departments = ref<any[]>([]);
const selectedDepartment = ref<any>({});
const selectedMonth = ref<number>(dayjs().month() + 1);
const selectedStatus = ref('');

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const kpiData = ref<any[]>([]);
const totalTasks = computed(() => kpiData.value.length);
const completedTasks = computed(() => kpiData.value.filter(task => task.kpi_status === 'Completed').length);
const ongoingTasks = computed(() => kpiData.value.filter(task => task.kpi_status === 'Ongoing').length);
const delayedTasks = computed(() => kpiData.value.filter(task => task.kpi_status === 'Delayed').length);

function handleDepartmentChange(){

}

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
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Ongoing', 'Delayed'],
        datasets: [
          {
            data: [0, 0, 0],
            backgroundColor: [
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)', 
              'rgba(239, 68, 68, 0.8)'
            ],
            borderColor: [
              'rgba(16, 185, 129, 1)',
              'rgba(245, 158, 11, 1)',
              'rgba(239, 68, 68, 1)'
            ],
            borderWidth: 3,
            cutout: '60%',
            spacing: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 1000
        }
      }
    });
  }

  fetchDepartments();
});

watch([selectedDepartment, selectedMonth, selectedStatus], fetchKpis);
</script>

<style scoped>
/* Global Styles */
.dashboard-wrapper {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1f2937;
}

/* Header Section */
.header-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  margin-bottom: 2rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.title-section {
  flex: 1;
}

.dashboard-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.title-icon {
  font-size: 2.5rem;
}

.dashboard-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin-top: 0.5rem;
  font-weight: 300;
}

.filter-controls {
  display: flex;
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.label-icon {
  font-size: 1rem;
}

.modern-select {
  padding: 0.75rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-weight: 500;
  backdrop-filter: blur(10px);
  min-width: 160px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modern-select:hover {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.15);
}

.modern-select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.modern-select option {
  color: #1f2937;
  background: white;
}

/* Statistics Section */
.stats-section {
  max-width: 1200px;
  margin: 0 auto 3rem;
  padding: 0 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border-left: 5px solid;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

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

.total-card {
  border-left-color: #3b82f6;
}
.total-card .card-background {
  background: #3b82f6;
}

.completed-card {
  border-left-color: #10b981;
}
.completed-card .card-background {
  background: #10b981;
}

.ongoing-card {
  border-left-color: #f59e0b;
}
.ongoing-card .card-background {
  background: #f59e0b;
}

.delayed-card {
  border-left-color: #ef4444;
}
.delayed-card .card-background {
  background: #ef4444;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.card-icon {
  font-size: 3rem;
  opacity: 0.8;
}

.card-content {
  flex: 1;
}

.card-number {
  font-size: 2.5rem;
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

.card-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: rgba(16, 185, 129, 0.1);
  color: #065f46;
}

.delayed-trend {
  background: rgba(239, 68, 68, 0.1);
  color: #991b1b;
}

.trend-icon {
  font-size: 1rem;
}

/* Chart Section */
.chart-section {
  max-width: 1200px;
  margin: 0 auto 3rem;
  padding: 0 2rem;
}

.chart-container {
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem 2rem 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
}

.chart-title h3 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.chart-title p {
  color: #6b7280;
  margin: 0.5rem 0 0;
  font-size: 1rem;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.completed-color {
  background: rgba(16, 185, 129, 0.8);
}

.ongoing-color {
  background: rgba(245, 158, 11, 0.8);
}

.delayed-color {
  background: rgba(239, 68, 68, 0.8);
}

.chart-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  padding: 2rem;
}

.chart-wrapper {
  position: relative;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-stats {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.completion-rate {
  text-align: center;
}

.rate-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.rate-number {
  font-size: 1.5rem;
  font-weight: 700;
}

.rate-label {
  font-size: 0.75rem;
  opacity: 0.9;
}

.stats-breakdown {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.breakdown-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.completed-fill {
  background: linear-gradient(90deg, #10b981, #059669);
}

.ongoing-fill {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.delayed-fill {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.breakdown-text {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.breakdown-label {
  font-weight: 500;
  color: #374151;
}

.breakdown-value {
  font-weight: 600;
  color: #1f2937;
}

/* Actions Section */
.actions-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 2rem;
}

.actions-container {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.actions-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1.5rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.primary-action {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.primary-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

.secondary-action {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.secondary-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.tertiary-action {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.tertiary-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
}

.quaternary-action {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
}

.quaternary-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
}

.action-icon {
  font-size: 1.25rem;
}

.action-text {
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    gap: 2rem;
  }
  
  .filter-controls {
    align-self: stretch;
  }
  
  .chart-content {
    grid-template-columns: 1fr;
  }
  
  .chart-header {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .chart-legend {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .dashboard-wrapper {
    padding: 0;
  }
  
  .header-section {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .dashboard-title {
    font-size: 2rem;
  }
  
  .stats-section,
  .chart-section,
  .actions-section {
    padding: 0 1rem 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .stat-card {
    padding: 1.5rem;
  }
  
  .card-number {
    font-size: 2rem;
  }
  
  .filter-controls {
    flex-direction: column;
    gap: 1rem;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>