<script lang="ts" setup>
import {ref, computed} from 'vue';

import useKPIDashboard from "@/hooks/useKPIDashboard.ts";

const {
  tableData,
  ongoing,
  done,
  delayed,
  notYetStarted,
  terminated,
  count,
  fetchPersonalKPI
} = useKPIDashboard();

const showTermsModal = ref(false);
const description = ref("");
const seventy_percent = ref("");
const ninety_percent = ref("");
const hundred_percent = ref("");
const hundred_twenty_percent = ref("");

const openTermsModal = (desc: any) => {
  description.value = desc.kpi.task_description
  seventy_percent.value = desc.kpi.seventy_percent
  ninety_percent.value = desc.kpi.ninety_percent
  hundred_percent.value = desc.kpi.hundred_percent
  hundred_twenty_percent.value = desc.kpi.hundred_twenty_percent
  showTermsModal.value = true;
};


// 当前页码
let currentPage = ref<number>(1);

// 当前选中的状态（O: Ongoing, C: Done, D: Delayed）
const selectedStatus = ref<string>('');

/**
 * 总页数（注意：这个取决于后端返回的总数量，应该基于 totalCount 而不是 tableData.length）
 */
let pages = computed(() => {
  return Math.ceil(count.value / 10); // ✅ 建议改为总数除以10（如 count.value）
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
  <div class="dashboard-wrapper">
    <!-- Header Section -->
    <div class="header-section">
      <h1 class="dashboard-title">
        <span class="title-icon">📊</span>
        My KPI Dashboard
      </h1>
      <p class="dashboard-subtitle">Track your key performance indicators and achieve your goals</p>
    </div>

    <!-- KPI Summary Cards -->
    <div class="kpi-summary">
      <div class="kpi-card tasks-card">
        <div class="card-icon">📋</div>
        <div class="card-content">
          <div class="card-number">{{ tableData.length }}</div>
          <div class="card-label">Total Tasks</div>
        </div>
      </div>

      <div class="kpi-card ongoing-card">
        <div class="card-icon">⏳</div>
        <div class="card-content">
          <div class="card-number">{{ ongoing }}</div>
          <div class="card-label">Ongoing</div>
        </div>
      </div>

      <div class="kpi-card done-card">
        <div class="card-icon">✅</div>
        <div class="card-content">
          <div class="card-number">{{ done }}</div>
          <div class="card-label">Completed</div>
        </div>
      </div>

      <div class="kpi-card delayed-card">
        <div class="card-icon">⚠️</div>
        <div class="card-content">
          <div class="card-number">{{ delayed }}</div>
          <div class="card-label">Delayed</div>
        </div>
      </div>

      <div class="kpi-card not-yet-started-card">
        <div class="card-background"></div>
          <div class="card-icon">🔒</div>
          <div class="card-content">
            <div class="card-number">{{ notYetStarted }}</div>
            <div class="card-label">Not Yet Started</div>
          </div>
      </div>

      <div class="kpi-card terminated-card">
        <div class="card-background"></div>
          <div class="card-icon">✖️</div>
          <div class="card-content">
            <div class="card-number">{{ terminated }}</div>
            <div class="card-label">Terminated</div>
          </div>
      </div>

    </div>

    <!-- Main Table Section -->
    <div class="table-section">
      <div class="table-header">
        <div class="table-title">
          <h2>KPI Performance Table</h2>
          <p>Detailed view of all your key performance indicators</p>
        </div>
        
        <div class="table-controls">
          <div class="filter-group">
            <label for="status-filter">Filter by Status:</label>
            <select 
              id="status-filter" 
              class="status-filter" 
              v-model="selectedStatus" 
              @change="handleStatusChange"
            >
              <option value="">🔍 All Status</option>
              <option value="C">✅ Completed</option>
              <option value="O">⏳ Ongoing</option>
              <option value="D">⚠️ Delayed</option>
              <option value="N">🔒 Not Yet Started</option>
              <option value="D">✖️ Terminated</option>
              <option value="F">📝 Confirming</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Enhanced Table -->
      <div class="table-container">
        <table class="kpi-table">
          <thead>
            <tr>
              <th>
                <div class="th-content">
                  <span>ID</span>
                  <span class="sort-icon">↕️</span>
                </div>
              </th>
              <th>
                <div class="th-content">
                  <span>KPI Name</span>
                  <span class="sort-icon">↕️</span>
                </div>
              </th>
              <th>
                <div class="th-content">
                  <span>Progress</span>
                </div>
              </th>
              <th>
                <div class="th-content">
                  <span>Current</span>
                </div>
              </th>
              <th>
                <div class="th-content">
                  <span>Target</span>
                </div>
              </th>
              <th>
                <div class="th-content">
                  <span>Start Date</span>
                  <span class="sort-icon">↕️</span>
                </div>
              </th>
              <th>
                <div class="th-content">
                  <span>Due Date</span>
                  <span class="sort-icon">↕️</span>
                </div>
              </th>
              <th>
                <div class="th-content">
                  <span>Unit</span>
                </div>
              </th>
              <th>
                <div class="th-content">
                  <span>Status</span>
                </div>
              </th>
              <th>
                <div class="th-content">
                  <span>Description</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="kpi in tableData" :key="kpi.id" class="table-row">
              <td class="id-cell">{{ kpi.id }}</td>
              <td class="name-cell">
                <div class="kpi-name">{{ kpi.kpi_title }}</div>
              </td>
              <td class="progress-cell">
                <div class="progress-container">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: Math.min((kpi.completed_unit / kpi.target_unit) * 100, 100) + '%' }"
                      :class="{
                        'progress-success': (kpi.completed_unit / kpi.target_unit) >= 1,
                        'progress-warning': (kpi.completed_unit / kpi.target_unit) >= 0.5 && (kpi.completed_unit / kpi.target_unit) < 1,
                        'progress-danger': (kpi.completed_unit / kpi.target_unit) < 0.5
                      }"
                    ></div>
                  </div>
                  <span class="progress-text">{{ Math.round((kpi.completed_unit / kpi.target_unit) * 100) }}%</span>
                </div>
              </td>
              <td class="current-cell">
                <span class="number-value">{{ kpi.completed_unit }}</span>
              </td>
              <td class="target-cell">
                <span class="number-value">{{ kpi.target_unit }}</span>
              </td>
              <td class="date-cell">{{ kpi.task_start_date }}</td>
              <td class="date-cell">{{ kpi.task_completion_date }}</td>
              <td class="unit-cell">
                <span class="unit-badge">{{ kpi.individual_unit }}</span>
              </td>
              <td class="status-cell">
                <span class="status-badge" :class="'status-' + kpi.current_status.replace(/\s+/g, '-')">
                <span class="status-dot"></span>
                {{ kpi.current_status }}
              </span>
              </td>
              <td class="status-cell">
                <button class="terms-button text-muted" @click="openTermsModal(kpi)">
                  <i class="bi bi-eye"></i>
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="modal fade" id="termsAndConditionsModal" :class="{ show: showTermsModal }" style="display: block" v-if="showTermsModal">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <div class="header-content">
                <i class="bi bi-file-text" style="font-size: 30px;"></i>
                <h3>Detailed KPI description</h3>
              </div>
            </div>
            <div class="modal-body">
              <div class="terms-text mb-3">{{ description }}</div>
              <div class="points-section">
                <h5>KPI Completion Score Levels</h5>
                <ul class="list-group">
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    70% Completion
                    <span class="badge bg-secondary rounded-pill">Get {{seventy_percent}} points</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    90% Completion
                    <span class="badge bg-info rounded-pill">Get {{ninety_percent}} points</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    100% Completion
                    <span class="badge bg-success rounded-pill">Get {{hundred_percent}}  points</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    120% Completion
                    <span class="badge bg-warning text-dark rounded-pill">Get {{hundred_twenty_percent}} points</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary"  @click="showTermsModal = false">Close</button>
            </div>
          </div>
        </div>
      </div>


      <div class="modal-backdrop fade show" v-if="showTermsModal"></div>

      <!-- Enhanced Pagination -->
      <div class="pagination-section">
        <div class="pagination-info">
          Showing {{ (currentPage - 1) * 10 + 1 }} to {{ Math.min(currentPage * 10, tableData.length) }} of {{ tableData.length }} entries
        </div>
        
        <nav class="pagination-nav" aria-label="Page navigation">
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link prev-next" @click="goToPage(currentPage - 1)">
                <span>←</span>
                Previous
              </button>
            </li>
            <li 
              class="page-item" 
              v-for="page in pages" 
              :key="page" 
              :class="{ active: page === currentPage }"
            >
              <button class="page-link page-number" @click="goToPage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === pages }">
              <button class="page-link prev-next" @click="goToPage(currentPage + 1)">
                Next
                <span>→</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Global Dashboard Styles */
.dashboard-wrapper {
  min-height: 100vh;
  background: #ffffff;
  padding: 2rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header Section */
.header-section {
  text-align: center;
  margin-bottom: 3rem;
}

.dashboard-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 3rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
  text-shadow: none;
}

.terms-button {
  background: #B8D8F1;
  border: none;
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  gap: 0.25rem;
}

.terms-button:hover {
  background-color: #adcce6;
  box-shadow: 0 4px 12px rgba(168, 237, 234, 0.3);
}
.title-icon {
  font-size: 3rem;
  filter: none;
}

.dashboard-subtitle {
  color: #6B7280;
  font-size: 1.2rem;
  margin-top: 0.5rem;
  font-weight: 300;
}


/* KPI Summary Cards */
.kpi-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;
}

.kpi-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border-left: 5px solid;
}

.kpi-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  opacity: 0.1;
  border-radius: 50%;
  transform: translate(30px, -30px);
}

.tasks-card {
  border-left-color: #3B82F6;
}
.tasks-card::before {
  background: #3B82F6;
}

.ongoing-card {
  border-left-color: #F59E0B;
}
.ongoing-card::before {
  background: #F59E0B;
}

.done-card {
  border-left-color: #10B981;
}
.done-card::before {
  background: #10B981;
}

.delayed-card {
  border-left-color: #EF4444;
}
.delayed-card::before {
  background: #EF4444;
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
  color: #1F2937;
  line-height: 1;
}

.card-label {
  font-size: 1rem;
  color: #6B7280;
  margin-top: 0.5rem;
  font-weight: 500;
}

.card-trend {
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  background: #F3F4F6;
  color: #10B981;
}

/* Table Section */
.table-section {
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem 2rem 1rem;
  background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
  border-bottom: 1px solid #E2E8F0;
}

.table-title h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
}

.table-title p {
  color: #6B7280;
  margin: 0.5rem 0 0;
  font-size: 1rem;
}

.table-controls {
  display: flex;
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.status-filter {
  padding: 0.75rem 1rem;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  background: white;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 180px;
}

.status-filter:hover {
  border-color: #3B82F6;
}

.status-filter:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Enhanced Table */
.table-container {
  overflow-x: auto;
}

.kpi-table {
  width: 100%;
  border-collapse: collapse;
}

.kpi-table thead {
  background: #F8FAFC;
}

.kpi-table th {
  padding: 1.5rem 1rem;
  text-align: left;
  border-bottom: 2px solid #E2E8F0;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-icon {
  opacity: 0.5;
  cursor: pointer;
  transition: opacity 0.2s;
}

.sort-icon:hover {
  opacity: 1;
}

.table-row {
  transition: all 0.2s ease;
  border-bottom: 1px solid #F1F5F9;
}

.table-row:hover {
  background: #F8FAFC;
}

.kpi-table td {
  padding: 1.25rem 1rem;
  vertical-align: middle;
}

.id-cell {
  font-weight: 600;
  color: #6B7280;
}

.kpi-name {
  font-weight: 600;
  color: #1F2937;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-success {
  background: linear-gradient(90deg, #10B981, #059669);
}

.progress-warning {
  background: linear-gradient(90deg, #F59E0B, #D97706);
}

.progress-danger {
  background: linear-gradient(90deg, #EF4444, #DC2626);
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 600;
  min-width: 40px;
  color: #374151;
}

.number-value {
  font-weight: 600;
  color: #1F2937;
}

.date-cell {
  color: #6B7280;
  font-size: 0.875rem;
}

.unit-badge {
  background: #F3F4F6;
  color: #374151;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-Completed {
  background: rgba(16, 185, 129, 0.1);
  color: #065F46;
}

.status-Completed .status-dot {
  background: #10B981;
}

/* Ongoing */
.status-Ongoing {
  background-color: #fff7ed;
  color: #92400e;
}
.status-Ongoing .status-dot {
  background-color: #f59e0b;
}

/* Delayed */
.status-Delayed {
  background-color: #fef2f2;
  color: #991b1b;
}
.status-Delayed .status-dot {
  background-color: #ef4444;
}

/* Not Yet Started */
.status-Not-Yet-Started {
  background-color: #eff6ff;
  color: #1e40af;
}
.status-Not-Yet-Started .status-dot {
  background-color: #3b82f6;
}

/* Terminated */
.status-Terminated {
  background-color: #f9fafb;
  color: #374151;
}
.status-Terminated .status-dot {
  background-color: #9ca3af;
}

/* Confirming */
.status-Confirming {
  background-color: #fefce8; 
  color: #92400e;    
}
.status-Confirming .status-dot {
  background-color: #f59e0b; /* 橙色点 */
}

/* Enhanced Pagination */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: #F8FAFC;
  border-top: 1px solid #E2E8F0;
}

.pagination-info {
  color: #6B7280;
  font-size: 0.875rem;
}

.pagination {
  display: flex;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.page-item {
  display: flex;
}

.page-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px solid #E5E7EB;
  background: white;
  color: #374151;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-link:hover:not(:disabled) {
  border-color: #3B82F6;
  color: #3B82F6;
}

.page-item.active .page-link {
  background: #3B82F6;
  border-color: #3B82F6;
  color: white;
}

.page-item.disabled .page-link {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-number {
  min-width: 44px;
  justify-content: center;
}

.prev-next {
  font-size: 0.875rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-wrapper {
    padding: 1rem;
  }
  
  .kpi-summary {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .table-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .pagination-section {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .dashboard-title {
    font-size: 2rem;
  }
  
  .kpi-summary {
    grid-template-columns: 1fr;
  }
  
  .kpi-card {
    padding: 1.5rem;
  }
  
  .table-section {
    margin: 0 -1rem;
    border-radius: 0;
  }
  
  .kpi-table th,
  .kpi-table td {
    padding: 1rem 0.5rem;
    font-size: 0.875rem;
  }
}
</style>