<script lang="ts">
export default {
  name: "leaveApplication"
}
</script>


<script setup lang="ts">
import {Modal} from "bootstrap";
import {ref, onMounted} from 'vue'

const leaveDetailsModal = ref();

const leaveApplications = ref([
  {
    id: 1,
    employeeName: 'Jack',
    leaveType: 'AL',
    status: 'Reject',
    appliedOn: '2024-06-30 11:27:07',
    selected: false
  },
  {
    id: 2,
    employeeName: 'Wang Chong',
    leaveType: 'AL',
    status: 'Pending',
    appliedOn: '2024-06-30 11:27:07',
    selected: false
  }
])

const summaryStats = ref({
  pending: 2,
  approved: 2,
  rejected: 2
})

const selectedLeave = ref({
  name: 'Wang Chong',
  department: 'Department A',
  reasons: 'Travel',
  document: 'Prove.pdf',
  remainingAnnualLeave: 5,
  remainingMedicalLeave: 5,
  dates: [
    {
      date: '21/11/2024',
      duration: 'whole',
      leaveType: 'AL'
    },
    {
      date: '22/11/2024',
      duration: 'whole',
      leaveType: 'AL'
    }
  ],
  remarks: ''
})

const openDocument = () => {
  window.open('path/to/your/document.pdf', '_blank')
}


const showLeaveDetails = (application: any) => {
  selectedLeave.value = {
    name: application.employeeName,
    department: 'Department A',
    reasons: 'Travel',
    document: 'Prove.pdf',
    remainingAnnualLeave: 5,
    remainingMedicalLeave: 5,
    dates: [
      {
        date: '21/11/2024',
        duration: 'whole',
        leaveType: 'AL'
      },
      {
        date: '22/11/2024',
        duration: 'whole',
        leaveType: 'AL'
      }
    ],
    remarks: ''
  }
  //TODO 修改成REF的方式
  const modal = new Modal(leaveDetailsModal.value)
  modal.show()
}

onMounted(() => {
  import('bootstrap')
})
</script>


<template>
  <div class="main-content">
    <!-- Summary Cards -->
    <div class="d-flex justify-content-between mb-3">
      <div class="row row-cols-1 row-cols-md-3 g-4 w-100">
        <!-- Pending Applications Card -->
        <div class="col">
          <div class="card shadow-sm mt-5 p-2">
            <div class="card-body d-flex align-items-center justify-content-center">
              <div class="circle circle-total-task">
                <svg xmlns="http://www.w3.org/2000/svg" class="bi bi-file-earmark-text icon-large" viewBox="0 0 16 16">
                  <path
                      d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5"/>
                  <path
                      d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
                </svg>
              </div>
              <div class="task-overall ms-4">
                <span class="task-text">Pending Application</span>
                <span class="task-num">{{ summaryStats.pending }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Approved Applications Card -->
        <div class="col">
          <div class="card shadow-sm mt-5 p-2">
            <div class="card-body d-flex align-items-center justify-content-center">
              <div class="circle circle-completed">
                <svg xmlns="http://www.w3.org/2000/svg" class="bi bi-check-circle icon-large" viewBox="0 0 16 16">
                  <path
                      d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zM3.5 7.5a.5.5 0 0 0-.5.5V9a.5.5 0 0 0 .5.5h3.5a.5.5 0 0 0 .5-.5V8a.5.5 0 0 0-.5-.5H3.5zM8 11a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h3.5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5H8z"/>
                </svg>
              </div>
              <div class="task-overall ms-4">
                <span class="task-text">Approved Application</span>
                <span class="task-num">{{ summaryStats.approved }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Rejected Applications Card -->
        <div class="col">
          <div class="card shadow-sm mt-5 p-2">
            <div class="card-body d-flex align-items-center justify-content-center">
              <div class="circle circle-ongoing">
                <svg xmlns="http://www.w3.org/2000/svg" class="bi bi-x-circle icon-large" viewBox="0 0 16 16">
                  <path
                      d="M16 8a8 8 0 1 0-8 8 8 8 0 0 0 8-8zM4.146 4.146a.5.5 0 0 1 .708 0L8 6.293l3.146-3.147a.5.5 0 0 1 .708.708L8.707 7l3.147 3.146a.5.5 0 0 1-.708.708L8 7.707l-3.146 3.147a.5.5 0 0 1-.708-.708L7.293 7 4.146 3.854a.5.5 0 0 1 0-.708z"/>
                </svg>
              </div>
              <div class="task-overall ms-4">
                <span class="task-text">Rejected Application</span>
                <span class="task-num">{{ summaryStats.rejected }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="d-flex justify-content-end mt-3 buttons">
      <button class="btn custom-approve me-2" data-bs-toggle="modal" data-bs-target="#approveModal">Approve</button>
      <button class="btn custom-reject" data-bs-toggle="modal" data-bs-target="#rejectModal">Reject</button>
    </div>

    <!-- Applications Table -->
    <table class="table table-bordered">
      <thead>
      <tr>
        <th style="width: 50px"></th>
        <th>ID</th>
        <th>Employee Name</th>
        <th>Leave Type</th>
        <th>Status</th>
        <th>Applied On</th>
        <th style="width: 50px"></th> <!-- Added header for info button column -->
      </tr>
      </thead>
      <tbody>
      <tr v-for="application in leaveApplications" :key="application.id">
        <td><input type="checkbox" v-model="application.selected" class="select-checkbox"></td>
        <td>{{ application.id }}</td>
        <td>{{ application.employeeName }}</td>
        <td>{{ application.leaveType }}</td>
        <td>
          <span :class="['badge', {
            'custom-reject': application.status === 'Reject',
            'bg-warning': application.status === 'Pending'
          }]">{{ application.status }}</span>
        </td>
        <td>{{ application.appliedOn }}</td>
        <td>
          <button
              class="btn btn-light btn-sm"
              data-bs-toggle="modal" data-bs-target="#leaveDetailsModal"
          >
            <i class="bi bi-info-circle"></i>
          </button>
        </td>
      </tr>
      </tbody>
    </table>


    <!-- Approve Modal -->
    <div class="modal fade" id="approveModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal_small">
          <div class="modal-content d-flex flex-column h-100" style="padding: 2em;">
            <div class="flex-grow-1">
              <h3 class="mb-3">Are you sure?</h3>
              <p class="text-muted">This action cannot be undone. This will permanently approve the leave
                application.</p>
            </div>
            <div class="modal-buttons d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-success">Confirm Approval</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div class="modal fade" id="rejectModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal_small">
          <div class="modal-content d-flex flex-column h-100" style="padding: 2em;">
            <div class="flex-grow-1">
              <h3 class="mb-3">Are you sure?</h3>
              <p class="text-muted">This action cannot be undone. This will permanently withdraw your leave
                application.</p>
            </div>
            <div class="modal-buttons d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-success">Confirm Withdrawal</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Leave Details Modal -->
    <div class="modal fade" ref="leaveDetailsModal" id="leaveDetailsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header d-flex align-items-center">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-file-earmark-text"></i>
              <h5 class="modal-title mb-0">Leave Application Details</h5>
            </div>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-4">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="info-label">Name:</label>
                  <div class="info-badge">{{ selectedLeave.name }}</div>
                </div>
                <div class="mb-3">
                  <label class="info-label">Department:</label>
                  <div class="info-badge">{{ selectedLeave.department }}</div>
                </div>
                <div class="mb-3">
                  <label class="info-label">Reasons:</label>
                  <div class="info-badge">{{ selectedLeave.reasons }}</div>
                </div>
                <div class="mb-3">
                  <label class="info-label">Attach Document:</label>
                  <div class="info-badge document-link" @click="openDocument">
                    <i class="fas fa-file-pdf me-2"></i>
                    <a href="#" class="text-decoration-none">{{ selectedLeave.document }}</a>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="leave-info">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <i class="bi bi-info-circle"></i>
                    <span>Remaining Annual Leave</span>
                  </div>
                  <h5 class="mb-0">{{ selectedLeave.remainingAnnualLeave }} days</h5>
                </div>
                <div class="leave-info">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <i class="bi bi-info-circle"></i>
                    <span>Remaining Medical Leave</span>
                  </div>
                  <h5 class="mb-0">{{ selectedLeave.remainingMedicalLeave }} days</h5>
                </div>
              </div>
            </div>

            <div class="dates-section mb-4">
              <h6 class="mb-3">Dates Selected:</h6>
              <div v-for="(date, index) in selectedLeave.dates" :key="index" class="date-entry mb-2">
                <div class="info-badge d-flex align-items-center justify-content-between">
                  <span>{{ date.date }}</span>
                  <select v-model="date.duration" class="form-select form-select-sm ms-2 duration-select">
                    <option value="whole">Whole Day Leave</option>
                    <option value="am">Half Day (AM)</option>
                    <option value="pm">Half Day (PM)</option>
                  </select>
                  <select v-model="date.leaveType" class="form-select form-select-sm ms-2 leave-type-select">
                    <option value="AL">Annual Leave</option>
                    <option value="MC">MC Leave</option>
                    <option value="ML">Marriage Leave</option>
                    <option value="CL">Compassionate Leave</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="mb-4">
              <h6 class="mb-3">Remarks</h6>
              <textarea v-model="selectedLeave.remarks" class="form-control" rows="4" readonly></textarea>
            </div>

            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-approve">Approved</button>
              <button type="button" class="btn btn-reject">Reject</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>

.table {
  border-radius: 10px; /* Rounded corners */
  overflow: hidden; /* Ensures the rounded corners are applied properly */
  border-collapse: separate; /* Ensures border-spacing works with rounded corners */
  border-spacing: 0; /* Removes any space between table cells */
}

.table th, .table td {
  text-align: center; /* Center text horizontally */
  vertical-align: middle; /* Center text vertically */
  padding: 8px; /* Optional: Add some padding for better spacing */
}

.table th {
  background-color: #f8f9fa; /* Slightly shaded header background */
  text-align: center; /* Center align header content */
}

.table-bordered {
  border: 1px solid #dee2e6; /* Adds a border around the table */
}

.table-bordered th, .table-bordered td {
  border: 1px solid #dee2e6; /* Adds borders to cells */
}

.custom-approve {
  background-color: #82AD82; /* Green */
  border-color: #82AD82;
  color: white;
}

.custom-reject {
  background-color: #FF6F61; /* Red */
  border-color: #FF6F61;
  color: white;
}

.custom-reject:hover {
  background-color: #FF8A80; /* Lighter red */
  border-color: #FF8A80;
}

.custom-approve:hover {
  background-color: #A0CFA0;
  border-color: #A0CFA0;
}

.buttons {
  margin: 3%;
}

.badge {
  display: flex;
  justify-content: center;
  align-items: center;
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
  display: block; /* Forces each span to be on a new line */
}

/* Apply styling to  icons */
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


.duration-select, .leave-type-select {
  border-radius: 20x;
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


</style>
