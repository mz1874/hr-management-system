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
          
        </div>

        <div class="stat-card completed-card">
          <div class="card-background"></div>
          <div class="card-icon">✅</div>
          <div class="card-content">
            <div class="card-number">{{ completedTasks }}</div>
            <div class="card-label">Completed</div>
          </div>
        </div>

        <div class="stat-card ongoing-card">
          <div class="card-background"></div>
          <div class="card-icon">⏳</div>
          <div class="card-content">
            <div class="card-number">{{ ongoingTasks }}</div>
            <div class="card-label">Ongoing</div>
          </div>
        </div>

        <div class="stat-card delayed-card">
          <div class="card-background"></div>
          <div class="card-icon">⚠️</div>
          <div class="card-content">
            <div class="card-number">{{ delayedTasks }}</div>
            <div class="card-label">Delayed</div>
          </div>
        </div>

        <!-- Not Yet Started Card -->
        <div class="stat-card not-yet-started-card">
          <div class="card-background"></div>
          <div class="card-icon">🔒</div>
          <div class="card-content">
            <div class="card-number">{{ notYetStartedTasks }}</div>
            <div class="card-label">Not Yet Started</div>
          </div>
        </div>

        <!-- Terminated Card -->
        <div class="stat-card terminated-card">
          <div class="card-background"></div>
          <div class="card-icon">✖️</div>
          <div class="card-content">
            <div class="card-number">{{ terminatedTasks }}</div>
            <div class="card-label">Terminated</div>
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
            <div class="legend-item">
              <div class="legend-color not-yet-started-color"></div>
              <span>Not Yet Started ({{ notYetStartedTasks }})</span>
            </div>
            <div class="legend-item">
              <div class="legend-color terminated-color"></div>
              <span>Terminated ({{ terminatedTasks }})</span>
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
              <canvas ref="completionRateCanvas"></canvas>
            </div>

            <div class="stats-breakdown">
              <div class="breakdown-item">
                <div class="breakdown-bar">
                  <div class="bar-fill completed-fill" :style="{ width: (totalTasks > 0 ? (completedTasks / totalTasks * 100) : 0) + '%' }"></div>
                </div>
                <div class="breakdown-text">
                  <span class="breakdown-label">Completed</span>
                  <span class="breakdown-value">{{ completedTasks }}/{{ totalTasks }}</span>
                </div>
              </div>
              
              <div class="breakdown-item">
                <div class="breakdown-bar">
                  <div class="bar-fill ongoing-fill" :style="{ width: (totalTasks > 0 ? (ongoingTasks / totalTasks * 100) : 0) + '%' }"></div>
                </div>
                <div class="breakdown-text">
                  <span class="breakdown-label">Ongoing</span>
                  <span class="breakdown-value">{{ ongoingTasks }}/{{ totalTasks }}</span>
                </div>
              </div>
              
              <div class="breakdown-item">
                <div class="breakdown-bar">
                  <div class="bar-fill delayed-fill" :style="{ width: (totalTasks > 0 ? (delayedTasks / totalTasks * 100) : 0) + '%' }"></div>
                </div>
                <div class="breakdown-text">
                  <span class="breakdown-label">Delayed</span>
                  <span class="breakdown-value">{{ delayedTasks }}/{{ totalTasks }}</span>
                </div>
              </div>

              <div class="breakdown-item">
                <div class="breakdown-bar">
                  <div class="bar-fill not-yet-started-fill" :style="{ width: (totalTasks > 0 ? (notYetStartedTasks / totalTasks * 100) : 0) + '%' }"></div>
                </div>
                <div class="breakdown-text">
                  <span class="breakdown-label">Not Yet Started</span>
                  <span class="breakdown-value">{{ notYetStartedTasks }}/{{ totalTasks }}</span>
                </div>
              </div>

              <div class="breakdown-item">
                <div class="breakdown-bar">
                  <div class="bar-fill terminated-fill"  :style="{ width: (totalTasks > 0 ? (terminatedTasks / totalTasks * 100) : 0) + '%' }"></div>
                </div>
                <div class="breakdown-text">
                  <span class="breakdown-label">Terminated</span>
                  <span class="breakdown-value">{{ terminatedTasks }}/{{ totalTasks }}</span>
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
          <button class="action-btn primary-action" @click="navigateTo('/home/KPI-Dashboard')">
            <span class="action-icon">👤</span>
            <span class="action-text">Personal KPI Dashboard</span>
          </button>
          
          <button class="action-btn secondary-action" @click="navigateTo('/home/reward-mall')">
            <span class="action-icon">🎁</span>
            <span class="action-text">Reward Mall</span>
          </button>
          
          <button class="action-btn tertiary-action" @click="navigateTo('/home/leave-application')">
            <span class="action-icon">📋</span>
            <span class="action-text">Leave Application</span>
          </button>
          
          <button class="action-btn quaternary-action" @click="navigateTo('/home/leader-board')">
            <span class="action-icon">🏆</span>
            <span class="action-text">Leaderboard</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Chart from 'chart.js/auto';
import { selectAllDepartments } from "@/api/department.ts";
import { selectAllKpis } from "@/api/kpiAdmin.ts";
import { isSuccess } from '@/utils/httpStatus';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

const router = useRouter();
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
const notYetStartedTasks = computed(() => kpiData.value.filter(task => (task.kpi_status || task.status) === 'Not Yet Started').length);
const terminatedTasks = computed(() => kpiData.value.filter(task => (task.kpi_status || task.status) === 'Terminated').length);

function handleDepartmentChange(){
  // Clear previous data when department changes
  kpiData.value = [];
  fetchKpis();
}

function navigateTo(path: string) {
  router.push(path);
}

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

  selectAllKpis(params)
    .then((res) => {
      if (isSuccess(res.status)) {
        kpiData.value = res.data.data.results;

        // Always show alert when no data is found
        if (kpiData.value.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Notice',
            text: 'There are currently no tasks to display for the selected filters',
            showConfirmButton: false,
            timer: 1500
          });
        }

        updateChart();
      }
    })
    .catch((error) => {
      console.error('Error fetching KPIs:', error);
      // Reset data on error
      kpiData.value = [];
      updateChart();
    });
};

const updateChart = () => {

  let filteredData = kpiData.value;
  if (selectedStatus.value) {
    filteredData = filteredData.filter(
      (task: any) => 
        task.kpi_status === selectedStatus.value || 
        task.status === selectedStatus.value
    );
  }

  const statusMapping = (task: any) => task.kpi_status || task.status;
  const doneCount = filteredData.filter(task => statusMapping(task) === 'Completed').length;
  const ongoingCount = filteredData.filter(task => statusMapping(task) === 'Ongoing').length;
  const delayedCount = filteredData.filter(task => statusMapping(task) === 'Delayed').length;
  const notYetStartedCount = filteredData.filter(task => statusMapping(task) === 'Not Yet Started').length;
  const terminatedCount = filteredData.filter(task => statusMapping(task) === 'Terminated').length;

  if (chartInstance) {
    chartInstance.data.datasets[0].data = [
      doneCount,
      ongoingCount,
      delayedCount,
      notYetStartedCount,
      terminatedCount
    ];
    chartInstance.update();
  }
};

const completionRateCanvas = ref<HTMLCanvasElement | null>(null);
let completionRateChart: Chart | null = null;

const renderCompletionRateChart = () => {
  const rate = Math.round((completedTasks.value / (totalTasks.value || 1)) * 100);

  if (completionRateChart) {
    completionRateChart.destroy();
  }

  const centerTextPlugin = {
    id: 'centerTextPlugin',
    afterDraw(chart: any) {
      const { ctx, width, height } = chart;
      ctx.save();
      ctx.font = `${(height / 6).toFixed(1)}px Inter, sans-serif`;
      ctx.fillStyle = '#374151';
      ctx.textBaseline = 'middle';
      const text = `${rate}%`;
      const textX = (width - ctx.measureText(text).width) / 2;
      const textY = height / 1.5;
      ctx.fillText(text, textX, textY);
      ctx.font = `${(height / 12).toFixed(1)}px Inter, sans-serif`;
      const label = 'Completion Rate';
      const labelX = (width - ctx.measureText(label).width) / 2;
      const labelY = height / 1.1;
      ctx.fillText(label, labelX, labelY);
      ctx.restore();
    }
  };

  completionRateChart = new Chart(completionRateCanvas.value!, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [rate, 100 - rate],
        backgroundColor: ['#10b981', '#e5e7eb'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270
      }]
    },
    options: {
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    },
    plugins: [centerTextPlugin]
  });
};

watch([completedTasks, totalTasks], renderCompletionRateChart);

onMounted(() => {
  renderCompletionRateChart();
});


onMounted(() => {
  if (chartCanvas.value) {
    chartInstance = new Chart(chartCanvas.value, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Ongoing', 'Delayed','Not Yet Started', 'Terminated'],
        datasets: [
          {
            data: [0, 0, 0],
            backgroundColor: [
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)', 
              'rgba(239, 68, 68, 0.8)',
              'rgba(59, 130, 246, 0.8)', 
              'rgba(156, 163, 175, 0.8)'
            ],
            borderColor: [
              'rgba(16, 185, 129, 1)',
              'rgba(245, 158, 11, 1)',
              'rgba(239, 68, 68, 1)',
              'rgba(59, 130, 246, 1)',
              'rgba(156, 163, 175, 1)'
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
                const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : '0.0';
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
  background: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1f2937;
}

/* Header Section */
.header-section {
  background: white;
  padding: 2rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
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
  color: #1f2937;
  margin: 0;
}

.title-icon {
  font-size: 2.5rem;
}

.dashboard-subtitle {
  color: #6b7280;
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
  color: #374151;
  font-weight: 600;
  font-size: 0.875rem;
}

.label-icon {
  font-size: 1rem;
  margin-left: 1rem;
}

.modern-select {
  padding: 0.75rem 1rem;
  border: 2px solid #d1d5db;
  border-radius: 12px;
  background: white;
  color: #1f2937;
  font-weight: 500;
  min-width: 160px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modern-select:hover {
  border-color: #9ca3af;
}

.modern-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

.not-yet-started-card {
  border-left-color: #60A5FA;
}
.not-yet-started-card .card-background {
  background: #60A5FA;
}

.terminated-card {
  border-left-color: #9CA3AF;
}
.terminated-card .card-background {
  background: #9CA3AF;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.card-icon {
  font-size: 3rem;
  opacity: 0.8;
  margin-right: -2rem;
  margin-left: 1rem;
}

.card-content {
  flex: 1;
  text-align: center;
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

.not-yet-started-color {
  background: rgba(59, 130, 246, 0.8);
}
.terminated-color {
  background: rgba(156, 163, 175, 0.8);
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

.completion-rate {
  width: 300px;
  height: 180px;
  margin: 0 auto;
  position: relative;
}
.completion-rate canvas {
  display: block;
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

.not-yet-started-fill {
  background: linear-gradient(90deg, #60A5FA, #3B82F6);
}
.terminated-fill {
  background: linear-gradient(90deg, #9CA3AF, #6B7280);
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