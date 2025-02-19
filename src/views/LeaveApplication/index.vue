<script lang="ts">
export default {
  name: "leaveManagement"
}
</script>


<script setup lang="ts">
import {Modal,Dropdown} from "bootstrap";
import {ref, onMounted, computed} from 'vue'




const leaveDetailsModal = ref();

const leaveApplications = ref([
  {
    id: 1,
    name: 'WangChong',
    // department ='A',
    leaveType: 'AL',
    status: 'Reject',
    appliedOn: '2024-06-30 11:27:07',
    selected: false,
    dates: [
      {
        date: '21/11/2024',
        duration: 'whole',
        leaveType: 'AL'
      }
    ],
    reasons: 'Personal matters',
    document: 'doc1.pdf'
  },
  {
    id: 2,
    leaveType: 'AL',
    status: 'Pending',
    appliedOn: '2024-06-30 11:27:07',
    selected: false,
    dates: [
      {
        date: '25/11/2024',
        duration: 'whole',
        leaveType: 'AL'
      }
    ],
    reasons: 'Family event',
    document: 'doc2.pdf'
  },
  {
    id: 3,
    leaveType: 'MC',
    status: 'Approved',
    appliedOn: '2024-06-30 11:27:07',
    selected: false,
    dates: [
      {
        date: '28/11/2024',
        duration: 'whole',
        leaveType: 'MC'
      }
    ],
    reasons: 'Medical appointment',
    document: 'mc1.pdf'
  },
  {
    id: 4,
    leaveType: 'MC',
    status: 'Cancelled',
    appliedOn: '2024-06-30 11:27:07',
    selected: false,
    dates: [
      {
        date: '29/11/2024',
        duration: 'whole',
        leaveType: 'MC'
      }
    ],
    reasons: 'Dental checkup',
    document: 'mc2.pdf'
  }
])

const summaryStats = ref({
  pending: 2,
  medical: 2,
  annual: 2
})


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



const withdrawModal = ref<HTMLElement | null>(null)

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
        // { once: true } ensures the event runs only once per modal open
      }
    }
  }
};

// Reactive state for selected filter
const selectedFilter = ref("All");

// Dropdown reference
const filterDropdown = ref<HTMLElement | null>(null);

// Function to update the filter selection
const filterLeaves = (status: string) => {
  selectedFilter.value = status;
  console.log("Selected Filter:", selectedFilter.value); // Debugging log to confirm selection
};


// Initialize Bootstrap Dropdown on Mounted
onMounted(() => {
  import("bootstrap").then(() => {
    if (filterDropdown.value) {
      new Dropdown(filterDropdown.value);
    }
  });
});

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

        <!-- Annual Leave  Card -->
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
                <span class="task-text">Remaining Annual Leave</span>
                <span class="task-num">{{ summaryStats.annual }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Medical Leave Card -->
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
                <span class="task-text">Remaining Medical Leave</span>
                <span class="task-num">{{ summaryStats.medical }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="d-flex justify-content-end mt-3 buttons">
      <!-- New Application Button -->
      <button class="btn custom-approve me-2" data-bs-toggle="modal" data-bs-target="#newApplication">
        New Application
      </button>

      <!-- Filter Button with Icon -->
      <div class="dropdown">
        <button class="btn filter-btn p-2" type="button" id="filterDropdown" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-funnel"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="filterDropdown">
          <li><button class="dropdown-item" @click="filterLeaves('All')">All</button></li>
          <li><button class="dropdown-item" @click="filterLeaves('Pending')">Pending</button></li>
          <li><button class="dropdown-item" @click="filterLeaves('Approved')">Approved</button></li>
          <li><button class="dropdown-item" @click="filterLeaves('Cancelled')">Cancelled</button></li>
          <li><button class="dropdown-item" @click="filterLeaves('Reject')">Rejected</button></li>
        </ul>
      </div>
    </div>


    <!-- Applications Table -->
    <table class="table table-bordered">
      <thead>
      <tr>
        <th style="width: 50px"></th>
        <th>ID</th>
        <th>Leave Type</th>
        <th>Status</th>
        <th>Applied On</th>
        <th></th>
        <th style="width: 50px"></th> <!-- Added header for info button column -->
      </tr>
      </thead>
      <tbody>
      <tr v-for="application in leaveApplications" :key="application.id">
        <td><input type="checkbox" v-model="application.selected" class="select-checkbox"></td>
        <td>{{ application.id }}</td>
        <td>{{ application.leaveType }}</td>
        <td>
          <span :class="['badge', getStatusBadgeClass(application.status)]">
          {{ application.status }}
        </span>
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
        <td>
        <template v-if="application.status === 'Pending'">
          <button class="btn btn-withdraw"
                  @click="withdrawApplication(application.id)">
            <i class="bi bi-x-circle"></i>
          </button>
        </template>
      </td>
      </tr>
      </tbody>
    </table>




    
    <!-- Withdrawal Confirmation Modal -->
    <div class="modal fade" id="withdrawModal" ref="withdrawModal" tabindex="-1" aria-hidden="true">
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
  color: #C9E9D2; /* Light green like the image */
  fill:#C9E9D2;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease-in-out;
}

.filter-btn:hover {
  color: #b7e4c7; /* Slightly darker green on hover */
}

.filter-btn i {
  font-size: 20px;
  color: #6b9e75; /* Match the filter icon color */
}


</style>
