<script lang="ts">
export default {
  name: "leaveManagement",
  components: {
    LeaveApplicationModal
  }
}
</script>

<script setup lang="ts">
import LeaveApplicationModal from '@/components/LeaveApplicationModal/index.vue'
import dropdownMenu from '@/components/LeaveApplicationModal/Dropdown.vue'
import LeaveApplicationDetailsModal from '@/components/LeaveApplicationModal/LeaveApplicationDetailsModal.vue'
import { Modal, Dropdown } from "bootstrap";
import { ref, onMounted, computed } from 'vue'

interface LeaveApplication {
  id: number;
  name: string;
  department: string;
  leaveType: string;
  status: string;
  appliedOn: string;
  selected: boolean;
  dates: {
    date: string;
    duration: string;
    leaveType: string;
  }[];
  reasons: string;
  document: string;
}

const leaveApplications = ref<LeaveApplication[]>([
  {
    id: 1,
    name: 'Wang Chong',
    department: 'A', 
    leaveType: 'AL',
    status: 'Reject',
    appliedOn: '2024-06-30 11:27:07',
    selected: false,
    dates: [{ date: '21/11/2024', duration: 'whole', leaveType: 'AL' }],
    reasons: 'Personal matters',
    document: 'doc1.pdf'
  },
  {
    id: 2,
    name: 'Wang Chong',
    department: 'A', 
    leaveType: 'AL',
    status: 'Pending',
    appliedOn: '2024-06-30 11:27:07',
    selected: false,
    dates: [{ date: '25/11/2024', duration: 'whole', leaveType: 'AL' }],
    reasons: 'Family event',
    document: 'doc2.pdf'
  }
]);

const summaryStats = ref({
  pending: leaveApplications.value.filter(app => app.status === 'Pending').length,
  medical: 2,
  annual: 2
});

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'Reject':
      return 'badge-reject';
    case 'Pending':
      return 'badge-pending';
    case 'Approved':
      return 'badge-approved';
    case 'Cancelled':
      return 'badge-cancelled';
    default:
      return '';
  }
}

// **Filter Functionality**
const filterStatus = ref('All');

const filteredApplications = computed(() => {
  if (filterStatus.value === 'All') {
    return leaveApplications.value;
  } else if (filterStatus.value === 'Pending') {
    return leaveApplications.value.filter(app => app.status === 'Pending');
  } else if (filterStatus.value === 'Cancelled') {
    return leaveApplications.value.filter(app => app.status === 'Cancelled');
  } else if (filterStatus.value === 'Rejected') {
    return leaveApplications.value.filter(app => app.status === 'Reject');
  } else if (filterStatus.value === 'Approved') {
    return leaveApplications.value.filter(app => app.status === 'Approved');
  }
  return leaveApplications.value;
});

const withdrawModal = ref<HTMLElement | null>(null);

const withdrawApplication = (id: number) => {
  const applicationIndex = leaveApplications.value.findIndex(app => app.id === id);
  
  if (applicationIndex !== -1 && leaveApplications.value[applicationIndex].status === 'Pending') {
    if (withdrawModal.value) {
      const modal = new Modal(withdrawModal.value);
      modal.show();

      // Confirm withdrawal function
      const confirmWithdrawal = () => {
        leaveApplications.value[applicationIndex].status = 'Cancelled'; // Change status
        summaryStats.value.pending--; // Reduce pending count
        modal.hide();
      };

      // Ensure button exists before adding event listener
      const confirmButton = withdrawModal.value.querySelector(".btn-success");
      if (confirmButton) {
        confirmButton.addEventListener("click", confirmWithdrawal, { once: true });
      }
    }
  }
};

const addNewApplication = (newApplication: LeaveApplication) => {
  leaveApplications.value.push(newApplication);
  summaryStats.value.pending++; // Increase pending count
};

// **State for Selected Application**
const selectedApplication = ref<LeaveApplication | null>(null);

// Open Modal for Viewing an Existing Application (Disable Fields)
const openApplicationDetails = (application: LeaveApplication) => {
  selectedApplication.value = application;
};

// Initialize Bootstrap Dropdown on Mounted
onMounted(() => {
  import("bootstrap");
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
      <button class="btn custom-approve" data-bs-toggle="modal" data-bs-target="#leaveApplicationModal">
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
    </div>


    <!-- Applications Table -->
    <div class="table-responsive">
      <table class="table table-bordered">
        <thead>
          <tr>
            <th style="width: 50px"></th>
            <th>ID</th>
            <th>Leave Type</th>
            <th>Status</th>
            <th>Applied On</th>
            <th></th>
            <th style="width: 50px"></th> <!-- Info button column -->
          </tr>
        </thead>
        <tbody>
          <tr v-for="application in filteredApplications" :key="application.id">
            <td>
              <input type="checkbox" v-model="application.selected" class="select-checkbox">
            </td>
            <td>{{ application.id }}</td>
            <td>{{ application.leaveType }}</td>
            <td>
              <span :class="['badge', getStatusBadgeClass(application.status)]">
                {{ application.status }}
              </span>
            </td>
            <td>{{ application.appliedOn }}</td>
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

    <!-- Leave Application Modal -->
    <LeaveApplicationModal @submit="addNewApplication" />

    <!-- Leave Application Details Modal -->
    <LeaveApplicationDetailsModal 
      v-if="selectedApplication" 
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
</style>
