<script lang="ts">
export default {
  name: "leaveApplication",
  components: {
    LeaveApplicationModal,
    LeaveApplicationDetailsModal
  }
}
</script>

<script setup lang="ts">
import LeaveApplicationModal from '@/components/LeaveApplicationModal/index.vue'
import LeaveApplicationDetailsModal from '@/components/LeaveApplicationModal/LeaveApplicationDetailsModal.vue'
import { Modal } from "bootstrap";
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { getLeaveRequests, cancelLeaveRequest,getLeaveBalance } from '@/api/leave'
import { getCurrentUser } from '@/api/login';
import type {LeaveApplication} from '@/interface/leaveApplication' 

const currentYear = new Date().getFullYear();
const selectedYear = ref(currentYear);
const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);
const leaveModalRef = ref();

const currentPage = ref(1);
const totalPages = ref(1);
const totalCount = ref(0);
const leaveApplications = ref<LeaveApplication[]>([]);
const allLeaveStats = ref<{ pending: number }>({ pending: 0 });

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'Pending':
    case 'P':
      return 'badge-pending';
    case 'Approved':
    case 'A':
      return 'badge-approved';
    case 'Cancelled':
    case 'W':
      return 'badge-cancelled';
    case 'R1':
    case 'Rejected by Manager':
      return 'badge-reject';
    case 'R2':
    case 'Rejected by HR':
      return 'badge-reject';
    case 'M':
    case 'Manager Approved':
      return 'badge-manager-approved';
    default:
      return 'badge-secondary';
  }
};

const filterStatus = ref('All');
const withdrawModal = ref<HTMLElement | null>(null);

const withdrawApplication = (id: number) => {
  const applicationIndex = leaveApplications.value.findIndex(app => app.id === id);
  if (applicationIndex !== -1 && leaveApplications.value[applicationIndex].status === 'Pending') {
    if (withdrawModal.value) {
      const modal = new Modal(withdrawModal.value);
      modal.show();
      const confirmWithdrawal = async () => {
        try {
          await cancelLeaveRequest(leaveApplications.value[applicationIndex].id);
          leaveApplications.value[applicationIndex].status = 'Cancelled';
          summaryStats.value.pending--;
          modal.hide();
        } catch (error) {
          console.error('Error cancelling leave request:', error);
          alert('Failed to cancel the request. Please try again.');
        }
      };
      const confirmButton = withdrawModal.value.querySelector(".btn-success");
      if (confirmButton) {
        confirmButton.addEventListener("click", confirmWithdrawal, { once: true });
      }
    }
  }
};

const formatDuration = (code: string) => {
  switch (code) {
    case 'F': return 'Full Day';
    case 'AM': return 'Morning';
    case 'PM': return 'Afternoon';
    default: return code;
  }
};

const addNewApplication = (newApplication: LeaveApplication) => {
  leaveApplications.value.push(newApplication);
  summaryStats.value.pending++;
};

const selectedApplication = ref<LeaveApplication | null>(null);

const openApplicationDetails = (application: LeaveApplication) => {
  selectedApplication.value = null;
   nextTick(() => {
    selectedApplication.value = application;
  });
};

const currentUserId = ref<number | null>(null);
const userLeaveInfo = ref({ annual: 0, medical: 0 });

const onYearChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  selectedYear.value = parseInt(target.value, 10);
  fetchLeaveApplications();  // now it will fetch based on new selected year
};


async function fetchLeaveApplications(page = 1) {
  currentPage.value = page;

  let statusParam = null;
  if (filterStatus.value !== 'All') {
    const statusMap = {
      'Pending': 'P',
      'Approved': 'A',
      'Rejected': 'R',
      'Cancelled': 'W'
    };
    statusParam = statusMap[filterStatus.value];
  }

  try {
    // Get current user
    const meRes = await getCurrentUser();
    const currentUser = meRes.data.data;
    currentUserId.value = currentUser.id;

    // Get  leave balance from backend
    const balanceRes = await getLeaveBalance({ year: selectedYear.value });
    const leaveList = balanceRes.data?.data || [];

    userLeaveInfo.value.annual = 0;
    userLeaveInfo.value.medical = 0;

    for (const leave of leaveList) {
      if (leave.code === 'AL') {
        userLeaveInfo.value.annual = leave.remaining_days ?? 0;
      } else if (leave.code === 'MC') {
        userLeaveInfo.value.medical = leave.remaining_days ?? 0;
      }
    }

    // 4. Get filtered results (for current page and status)
    const res = await getLeaveRequests(page, '', {
      status: statusParam,
      year: selectedYear.value,
      applicationPage: true

    });
    const data = res.data?.data;

    if (!Array.isArray(data?.results)) throw new Error('Invalid API response');

    totalCount.value = data.count;
    totalPages.value = Math.ceil(data.count / 10);
    leaveApplications.value = data.results;
    allLeaveStats.value.pending = data.summary?.pending || 0;

    leaveApplications.value = data.results.map(item => {
      return {
        id: item.id,
        name: currentUser.username,
        department: currentUser.department || '-',
        leaveType: item.leave_dates?.[0]?.leave_type_display?.name || '-',
        status: {
          P: 'Pending',
          A: 'Approved',
          R1: 'Rejected by Manager',
          R2: 'Rejected by HR',
          M: 'Manager Approved',
          W: 'Cancelled'
        }[item.status] || item.status,
        appliedOn: item.created_date,
        selected: false,
        dates: Array.isArray(item.leave_dates)
          ? item.leave_dates.map(d => ({
              date: d.leave_date.split('T')[0],
              duration: d.duration,
              leaveType: d.leave_type_display?.name || 'N/A'
            }))
          : [],
        reasons: item.reason,
        document: item.attachment_url || '',
        reviewComment: item.review_comment || '',
        reviewDate: item.review_date || '',
      };
    });
  } catch (err) {
    console.error('Error fetching leave applications:', err);
  }
}


onMounted(() => {
  fetchLeaveApplications();
});

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    fetchLeaveApplications(page);
  }
};

watch(
  filterStatus,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      currentPage.value = 1;
      fetchLeaveApplications(1);
    }
  }
);


const summaryStats = computed(() => ({
  pending: allLeaveStats.value.pending,
  annual: userLeaveInfo.value.annual,
  medical: userLeaveInfo.value.medical
}));

const filteredApplications = computed(() => leaveApplications.value);

const pageNumbers = computed(() => {
  const pages: (number | string)[] = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1); // Always show first

    if (current > 4) pages.push('...');

    const start = Math.max(2, current - 2);
    const end = Math.min(total - 1, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 3) pages.push('...');
    pages.push(total); // Always show last
  }

  return pages;
});


</script>

<template>
  <div class="container-fluid main-content">
    <!-- Summary Cards -->
    <div class="row my-3">
      <div class="col-12">
        <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
          <!-- Pending Applications Card -->
          <div class="col">
            <div class="card shadow-sm p-2">
              <div class="card-body d-flex align-items-center justify-content-center">
                <div class="circle circle-total-task">
                  <svg xmlns="http://www.w3.org/2000/svg" class="bi bi-file-earmark-text icon-large" viewBox="0 0 16 16">
                    <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5"/>
                    <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
                  </svg>
                </div>
                <div class="task-overall ms-4">
                  <span class="task-text">Pending Application</span>
                  <span class="task-num">{{ summaryStats.pending }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Annual Leave Card -->
          <div class="col">
            <div class="card shadow-sm p-2">
              <div class="card-body d-flex align-items-center justify-content-center">
                <div class="circle circle-completed">
                  <svg xmlns="http://www.w3.org/2000/svg" class="bi bi-check-circle icon-large" viewBox="0 0 16 16">
                    <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zM3.5 7.5a.5.5 0 0 0-.5.5V9a.5.5 0 0 0 .5.5h3.5a.5.5 0 0 0 .5-.5V8a.5.5 0 0 0-.5-.5H3.5zM8 11a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h3.5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5H8z"/>
                  </svg>
                </div>
                <div class="task-overall ms-4">
                  <span class="task-text">Remaining Annual Leave</span>
                  <span class="task-num">{{ summaryStats.annual }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Medical Leave Card -->
          <div class="col">
            <div class="card shadow-sm p-2">
              <div class="card-body d-flex align-items-center justify-content-center">
                <div class="circle circle-ongoing">
                  <svg xmlns="http://www.w3.org/2000/svg" class="bi bi-x-circle icon-large" viewBox="0 0 16 16">
                    <path d="M16 8a8 8 0 1 0-8 8 8 8 0 0 0 8-8zM4.146 4.146a.5.5 0 0 1 .708 0L8 6.293l3.146-3.147a.5.5 0 0 1 .708.708L8.707 7l3.147 3.146a.5.5 0 0 1-.708.708L8 7.707l-3.146 3.147a.5.5 0 0 1-.708-.708L7.293 7 4.146 3.854a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </div>
                <div class="task-overall ms-4">
                  <span class="task-text">Remaining Medical Leave</span>
                  <span class="task-num">{{ summaryStats.medical }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Action Buttons and Filter -->
    <div class="d-flex justify-content-end align-items-center mb-3 gap-2">
      <!-- New Application Button -->
      <button class="btn custom-approve" @click="leaveModalRef?.showModal()">
        New Application
      </button>

      <!-- Filter Dropdown -->
      <select v-model="filterStatus" class="form-select w-auto">
        <option value="All">All</option>
        <option value="Pending">Pending</option>
        <option value="Rejected">Rejected</option>
        <option value="Cancelled">Cancelled</option>
        <option value="Approved">Approved</option>
      </select>

      <select v-model="selectedYear" class="form-select w-auto" @change="onYearChange">
        <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
      </select>

    </div>


    <!-- Applications Table -->
    <div class="table-responsive">
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Status</th>
            <th>Leave Types / Dates </th>
            <th>Reasons</th>
            <th style="width: 50px"></th> <!-- Info button column -->
            <th style="width: 50px"></th>

          </tr>
        </thead>
        <tbody>
          <tr v-for="application in filteredApplications" :key="application.id">
            <td>
              <span :class="['badge', getStatusBadgeClass(application.status)]">
                {{ application.status }}
              </span>
            </td>
            <td>
              <span v-if="Array.isArray(application.dates) && application.dates.length > 0">
                <div v-for="(item, index) in application.dates" :key="index">
                  <strong>{{ item.leaveType }}</strong> – {{ item.date }} <em>({{ formatDuration(item.duration) }})</em>
                </div>
              </span>
              <span v-else>-</span>
            </td>



            <td>
              <span
                :title="application.reasons"
                class="text-truncate d-inline-block"
                style="max-width: 250px;"
              >
                {{ application.reasons }}
              </span>
            </td>
            <td>
              <button class="btn btn-light btn-sm" @click="openApplicationDetails(application)">
                <i class="bi bi-info-circle"></i>
              </button>
            </td>
            <td>
              <template v-if="application.status === 'Pending'">
                <button class="btn btn-withdraw" @click="withdrawApplication(application.id)">
                  <i class="bi bi-x-circle"></i>
                </button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Withdrawal Confirmation Modal -->
    <div class="modal fade" id="withdrawModal" ref="withdrawModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal_small">
          <div class="modal-content d-flex flex-column h-100" style="padding: 2em;">
            <div class="flex-grow-1">
              <h3 class="mb-3">Are you sure?</h3>
              <p class="text-muted">
                This action cannot be undone. This will permanently withdraw your leave application.
              </p>
            </div>
            <div class="modal-buttons d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-success">Confirm Withdrawal</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="d-flex align-items-center gap-3 my-3">
      <div class="text-muted fs-5">
        Total Application: {{ totalCount }}
      </div>

    <nav>
      <ul class="pagination mb-0">
        <!-- Previous Button -->
        <li :class="['page-item', { disabled: currentPage === 1 }]">
          <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Previous</a>
        </li>

        <!-- Numbered Pages & Ellipses -->
        <li
          v-for="(page, index) in pageNumbers"
          :key="index"
          :class="['page-item', { active: currentPage === page, disabled: page === '...' }]"
        >
          <a
            class="page-link"
            href="#"
            v-if="page !== '...'"
            @click.prevent="changePage(page as number)"
          >
            {{ page }}
          </a>
          <span v-else class="page-link disabled">…</span>
        </li>

        <!-- Next Button -->
        <li :class="['page-item', { disabled: currentPage === totalPages }]">
          <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Next</a>
        </li>
      </ul>
    </nav>


    </div>

    <!-- Leave Application Modal -->
    <LeaveApplicationModal ref="leaveModalRef" @submit="addNewApplication" />

    <!-- Leave Application Details Modal -->
    <LeaveApplicationDetailsModal 
      v-show="selectedApplication !== null"
      :selectedApplication="selectedApplication"
    />
    
  </div>
</template>

<style scoped>
.main-content {
  padding: 2rem;
}

/* Existing styles for table, cards, buttons, etc. remain unchanged */
.table {
  table-layout: fixed;
  border-radius: 10px;
  overflow: hidden;
  border-collapse: separate;
  border-spacing: 0;
}

.table th,
.table td {
  text-align: center;
  vertical-align: middle;
  padding: 8px;
}

.table th {
  background-color: #f8f9fa;
}

.table-bordered {
  border: 1px solid #dee2e6;
}

.table-bordered th,
.table-bordered td {
  border: 1px solid #dee2e6;
}

.custom-approve {
  background-color: #82AD82;
  border-color: #82AD82;
  color: white;
}

.custom-reject {
  background-color: #FF6F61;
  border-color: #FF6F61;
  color: white;
}

.custom-reject:hover {
  background-color: #FF8A80;
  border-color: #FF8A80;
}

.custom-approve:hover {
  background-color: #A0CFA0;
  border-color: #A0CFA0;
}

.buttons {
  margin: 3%;
}

.btn-light {
  background-color: transparent !important;
  border: none !important;
  color: #789DBC !important;
}

.btn-light i {
  font-size: 1.2rem;
}

.task-text,
.task-num {
  display: block;
}

.icon-large {
  width: 32px;
  height: 32px;
  fill: #789DBC;
}

.task-text {
  color: #789DBC;
  font-weight: 700;
}

.modal_small .modal-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.modal-content {
  border-radius: 20px;
  border: none;
  padding: 0;
}

.modal-header {
  background-color: #7DA0CA;
  color: white;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 1rem 2rem;
}

.modal-header .close {
  color: white;
  opacity: 1;
}

.modal-body {
  padding: 2rem;
}

.info-box {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.info-label {
  color: #666;
  margin-bottom: 0.5rem;
}

.info-badge {
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.5rem 1rem;
}

.leave-info {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.leave-info i {
  color: #789DBC;
}

.btn-approve {
  background-color: #80B192;
  color: white;
  border: none;
  padding: 0.5rem 2rem;
}

.btn-reject {
  background-color: #FF6B6B;
  color: white;
  border: none;
  padding: 0.5rem 2rem;
}

.duration-select,
.leave-type-select {
  border-radius: 20px;
}

.document-link {
  cursor: pointer;
}

.document-link:hover {
  text-decoration: underline;
}

.date-entry {
  margin-bottom: 10px;
}

.badge {
  display: flex;
  justify-content: center;
  align-items: center;
}

.badge-reject {
  background-color: #FF6F61;
  color: white;
}

.badge-pending {
  background-color: #FFC107;
  color: white;
}

.badge-approved {
  background-color: #82AD82;
  color: white;
}

.badge-cancelled {
  background-color: #6c757d;
  color: white;
}

.filter-btn {
  background-color: white;
  color: #789DBC;
  border: 1px solid #dee2e6;
  padding: 8px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-btn:hover {
  background-color: #f8f9fa;
}

.dropdown-menu {
  min-width: 120px;
  padding: 8px 0;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.dropdown-item {
  padding: 8px 16px;
  color: #495057;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #789DBC;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  .card {
    margin-bottom: 15px;
  }
  .task-text,
  .task-num {
    font-size: 14px;
  }
  .btn {
    font-size: 14px;
    padding: 0.4rem 0.8rem;
  }
  .table th,
  .table td {
    font-size: 12px;
    padding: 6px;
  }
}

.pagination {
  display: flex;
  padding-left: 0;
  list-style: none;
  border-radius: 0.25rem;
}

.badge-pending {
  background-color: #FFC107; /* Yellow */
  color: white;
}

.badge-approved {
  background-color: #82AD82; /* Green */
  color: white;
}

.badge-cancelled {
  background-color: #6c757d; /* Gray */
  color: white;
}

.badge-reject {
  background-color: #FF6F61; /* Red */
  color: white;
}

.badge-manager-approved {
  background-color: #7DA0CA; /* Blue */
  color: white;
}

.badge-secondary {
  background-color: #adb5bd; /* Fallback gray */
  color: white;
}
.table td {
  word-wrap: break-word;
  word-break: break-word;
  white-space: normal;
}

.table td:nth-child(3) {
  max-width: 300px;
}
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.page-link {
  border: 1px solid #cccccc;
  color: #008080; /* Teal base */
}

.page-link:hover {
  background-color: #e0f7f7;
  color: #006666;
}

.page-item.active .page-link {
  background-color: #008080;
  border-color: #008080;
  color: #ffffff;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

</style>