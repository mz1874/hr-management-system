<script setup lang="ts">
import { Modal } from "bootstrap";
import { ref, computed, onMounted, watch } from 'vue';
import {
  getLeaveRequests,
  reviewLeaveRequest,
  getLeaveTypes,
  getLeaveBalance
} from '@/api/leave'
import type { LeaveApplication } from '@/interface/leaveApplicationManagement'
import { getCurrentUser } from '@/api/login'
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import Swal from "sweetalert2";
dayjs.extend(customParseFormat);

const leaveTypeOptions = ref<{ id: number; name: string; description: string }[]>([]);
const leaveApplications = ref<LeaveApplication[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const totalCount = ref(0);
const filterStatus = ref('All');
const selectedLeave = ref<LeaveApplication | null>(null);
const summaryStats = ref({ all: 0, pending: 0, approved: 0, rejected: 0 });

const currentUser = ref({
  id: 0,
  roles: [] as string[],  
  department_id: null as number | null
});
const isHR = computed(() => Array.isArray(currentUser.value?.roles) && currentUser.value.roles.includes('hr'));
const isManager = computed(() => Array.isArray(currentUser.value?.roles) && currentUser.value.roles.includes('manager'));


const canManagerApprove = computed(() => selectedLeave.value?.status === 'Pending' && isManager.value);
const canHRApprove = computed(() => selectedLeave.value?.status === 'Manager Approved' && isHR.value);

function toastSuccess(message: string) {
  Swal.fire({
    icon: 'success',
    title: 'Success',
    text: message,
    timer: 2000,
    showConfirmButton: false
  });
}

const fetchLeaveTypes = async () => {
  try {
    const res = await getLeaveTypes();
    leaveTypeOptions.value = res.data.data.results;
  } catch (e) {
    console.error('Failed to fetch leave types:', e);
  }
};

function getStatusCodeForRole(label: string): string {
  if (label === 'All') return '';

  if (isHR.value) {
    return {
      'Pending': 'M',
      'Approved': 'A',
      'Rejected': 'R2'
    }[label] || '';
  }

  if (isManager.value) {
    return {
      'Pending': 'P',
      'Approved': 'M',
      'Rejected': 'R1'
    }[label] || '';
  }

  // Default for staff
  return {
    'Pending': 'P',
    'Approved': 'A',
    'Rejected': 'R1'  // or handle both R1 & R2 if needed
  }[label] || '';
}


const fetchLeaveApplications = async () => {
  try {
    await fetchLeaveTypes();

    const params: Record<string, any> = {
      page: currentPage.value,
    };

    const statusParam = getStatusCodeForRole(filterStatus.value);
    if (statusParam) params.status = statusParam;
    console.log('Selected:', filterStatus.value)

    if (isHR.value) {
      params.hrPage = true;
    } else if (isManager.value) {
      params.departmentId = currentUser.value.department_id;
    }

    const filteredRes = await getLeaveRequests(currentPage.value, '', params);
    const rawResults = filteredRes.data?.data?.results || [];
    totalPages.value = Math.ceil(filteredRes.data?.data?.count / 10);
    totalCount.value = filteredRes.data?.data?.count;

    const summaryRes = await getLeaveRequests(1, '', { hrPage: isHR.value });
    summaryStats.value = {
      all: summaryRes.data?.data?.count || 0,
      pending: summaryRes.data?.data?.summary?.pending || 0,
      approved: summaryRes.data?.data?.summary?.approved || 0,
      rejected: (summaryRes.data?.data?.summary?.rejected || 0) + (summaryRes.data?.data?.summary?.hr_rejected || 0),
    };

    leaveApplications.value = rawResults.map(item => {
      const parsedCreated = dayjs(item.created_date, 'DD.MM.YYYY HH:mm:ss');
      const balance = item.leave_balance || {};
      const annual = balance['AL']?.remaining_days || 0;
      const medical = balance['MC']?.remaining_days || 0;

      return {
        id: item.id,
        employeeName: item.username || '-',
        department: item.department_name || '-',
        leaveType: Array.from(new Set(item.leave_dates?.map(d => d.leave_type_display?.name))).join(', '),
        status: mapStatus(item.status),
        appliedOn: parsedCreated.isValid() ? parsedCreated.format('YYYY-MM-DD') : 'Invalid Date',
        reasons: item.reason || '-',
        document: item.attachment_url || '',
        remainingAnnualLeave: annual,
        remainingMedicalLeave: medical,
        remarks: item.review_comment || '',
        dates: item.leave_dates?.map(d => {
          const parsedDate = dayjs(d.leave_date);
          return {
            id: d.id,
            date: parsedDate.isValid() ? parsedDate.format('YYYY-MM-DD') : '-',
            duration: d.duration,
            originalDuration: d.duration,
            leaveType: d.leave_type_display?.name || '-',
            originalLeaveType: d.leave_type_display?.name || '-'
          };
        }) || [],
        selected: false
      };
    });
  } catch (err) {
    console.error('Error during fetch:', err);
  }
};


watch([filterStatus, currentPage], fetchLeaveApplications);

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

function mapStatus(code: string): string {
  const map = {
    P: 'Pending',
    M: 'Manager Approved',
    R1: 'Rejected by Manager',
    A: 'Approved',
    R2: 'Rejected by HR',
    W: 'Withdraw'
  };
  return map[code] || code;
}

const reverseStatusMap = {
  'Pending': 'P',
  'Manager Approved': 'M',
  'Rejected by Manager': 'R1',
  'Approved': 'A',
  'Rejected by HR': 'R2',
  'Withdraw': 'W'
};

const saveChanges = async (newStatus?: string, closeModal = false) => {
  if (!selectedLeave.value) return;

  const leaveTypeIdMap = leaveTypeOptions.value.reduce((map, type) => {
    map[type.name] = type.id;
    return map;
  }, {} as Record<string, number>);

  const updated = {
    id: selectedLeave.value.id,
    review_comment: selectedLeave.value.remarks,
    status: reverseStatusMap[newStatus || selectedLeave.value.status],
    leave_dates: selectedLeave.value.dates.map(d => ({
      id: d.id,
      leave_date: new Date(d.date).toISOString(),
      duration: d.duration,
      leave_type: leaveTypeIdMap[d.leaveType] || null
    }))
  };

  try {
    await reviewLeaveRequest(selectedLeave.value.id, updated);
    toastSuccess("Leave request updated successfully!");
    await fetchLeaveApplications();

    if (closeModal && leaveDetailsModal.value) {
      const modalInstance = Modal.getInstance(leaveDetailsModal.value);
      modalInstance?.hide();
    }
  } catch (e: any) {
    const msg = e?.response?.data?.[0] || "Failed to update leave request.";
    console.error('Failed to update leave request:', msg);
    Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: msg,
    });
  }
};

const approveSingle = async () => {
  if (!selectedLeave.value) return;

  if (canManagerApprove.value) {
    selectedLeave.value.remarks ||= "Approved by Manager";
    await saveChanges('Manager Approved', true);
  } else if (canHRApprove.value) {
    selectedLeave.value.remarks ||= "Approved by HR";
    await saveChanges('Approved', true);  
  }
};

const rejectSingle = async () => {
  if (!selectedLeave.value) return;

  if (canManagerApprove.value) {
    selectedLeave.value.remarks ||= "Rejected by Manager";
    await saveChanges('Rejected by Manager', true); 
  } else if (canHRApprove.value) {
    selectedLeave.value.remarks ||= "Rejected by HR";
    await saveChanges('Rejected by HR', true);  
  }
};


const bulkApprove = async () => {
  for (const app of leaveApplications.value) {
    const rawStatus = reverseStatusMap[app.status];

    const isManagerAction = rawStatus === 'P' && isManager.value;
    const isHRAction = rawStatus === 'M' && isHR.value;

    if (app.selected && (isManagerAction || isHRAction)) {
      app.remarks = isManagerAction ? "Approved by Manager" : "Approved by HR";
      selectedLeave.value = app;

      const newStatus = isManagerAction ? 'Manager Approved' : 'Approved';  // ✅ Correct mapping
      await saveChanges(newStatus);
    }

    app.selected = false;
  }
};


const bulkReject = async () => {
  for (const app of leaveApplications.value) {
    const rawStatus = reverseStatusMap[app.status];

    const isManagerAction = rawStatus === 'P' && isManager.value;
    const isHRAction = rawStatus === 'M' && isHR.value;

    if (app.selected && (isManagerAction || isHRAction)) {
      app.remarks = isManagerAction ? "Rejected by Manager" : "Rejected by HR";
      selectedLeave.value = app;

      const newStatus = isManagerAction ? 'Rejected by Manager' : 'Rejected by HR';
      await saveChanges(newStatus);  // ✅ Will correctly map to R1 or R2
    }

    app.selected = false;
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

const leaveDetailsModal = ref<HTMLElement | null>(null);

const openDocument = () => {
  if (selectedLeave.value) {
    const documentPath = `localhost8000/${selectedLeave.value.document}`;
    const fileExtension = selectedLeave.value.document.split('.').pop().toLowerCase();
    if (fileExtension === 'pdf') {
      window.open(documentPath, '_blank');
    } else if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
      const imgElement = document.createElement('img');
      imgElement.src = documentPath;
      imgElement.style.width = '100%';
      imgElement.style.height = 'auto';
      const imgWindow = window.open('', '_blank');
      imgWindow.document.body.appendChild(imgElement);
    } else {
      alert('Unsupported file type');
    }
  }
};

const showLeaveDetails = (application: LeaveApplication) => {
  selectedLeave.value = application;
  if (leaveDetailsModal.value) {
    const modal = new Modal(leaveDetailsModal.value);
    modal.show();
  }
};

const isModalReadOnly = computed(() => {
  if (!selectedLeave.value) return true;

  const rawStatus = reverseStatusMap[selectedLeave.value.status];

  // Manager can only edit if it's still pending
  if (isManager.value && rawStatus !== 'P') return true;

  // HR can edit if status is 'M'
  if (isHR.value && rawStatus === 'M') return false;

  return false;
});


onMounted(async () => {
  const res = await getCurrentUser();

  const userData = res.data.data; 
  currentUser.value.id = userData.id;
  currentUser.value.roles = userData.roles || [];
  currentUser.value.department_id = userData.department_id;

  await fetchLeaveApplications();
});

</script>


<template>
  <div class="main-content">
    <!-- Summary Cards with Equal Height & Filter Behavior -->
    <div class="d-flex justify-content-between mb-3">
      <div class="row row-cols-1 row-cols-md-4 g-4 w-100 align-items-stretch">
        <!-- All Applications Card -->
        <div class="col" @click="filterStatus = 'All'">
          <div class="card summary-card shadow-sm p-2" :class="{ 'border-primary': filterStatus === 'All' }">
            <div class="card-body d-flex align-items-center justify-content-center">
              <div class="circle">
                <svg xmlns="http://www.w3.org/2000/svg" class="bi bi-card-checklist icon-large" viewBox="0 0 16 16">
                  <path d="M10.854 6.146a.5.5 0 1 0-.708.708L11.293 8l-1.147 1.146a.5.5 0 0 0 .708.708l1.5-1.5a.5.5 0 0 0 0-.708l-1.5-1.5z"/>
                  <path d="M5.5 4.5a.5.5 0 0 1 .5-.5H9a.5.5 0 0 1 0 1H6v1h3a.5.5 0 0 1 0 1H6v1h3a.5.5 0 0 1 0 1H6v1h3a.5.5 0 0 1 0 1H6v.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-8A.5.5 0 0 1 4.5 4h1z"/>
                </svg>
              </div>
              <div class="task-overall ms-4">
                <span class="task-text">All Applications</span>
                <span class="task-num">{{ summaryStats.all }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pending Applications Card -->
        <div class="col" @click="filterStatus = 'Pending'">
          <div class="card summary-card shadow-sm p-2" :class="{ 'border-primary': filterStatus === 'Pending' }">
            <div class="card-body d-flex align-items-center justify-content-center">
              <div class="circle">
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

        <!-- Approved Applications Card -->
        <div class="col" @click="filterStatus = 'Approved'">
          <div class="card summary-card shadow-sm p-2" :class="{ 'border-primary': filterStatus === 'Approved' }">
            <div class="card-body d-flex align-items-center justify-content-center">
              <div class="circle">
                <svg xmlns="http://www.w3.org/2000/svg" class="bi bi-check-circle icon-large" viewBox="0 0 16 16">
                  <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zM3.5 7.5a.5.5 0 0 0-.5.5V9a.5.5 0 0 0 .5.5h3.5a.5.5 0 0 0 .5-.5V8a.5.5 0 0 0-.5-.5H3.5zM8 11a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h3.5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5H8z"/>
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
        <div class="col" @click="filterStatus = 'Rejected'">
          <div class="card summary-card shadow-sm p-2" :class="{ 'border-primary': filterStatus === 'Rejected' }">
            <div class="card-body d-flex align-items-center justify-content-center">
              <div class="circle">
                <svg xmlns="http://www.w3.org/2000/svg" class="bi bi-x-circle icon-large" viewBox="0 0 16 16">
                  <path d="M16 8a8 8 0 1 0-8 8 8 8 0 0 0 8-8zM4.146 4.146a.5.5 0 0 1 .708 0L8          6.293l3.146-3.147a.5.5 0 0 1 .708.708L8.707 7l3.147 3.146a.5.5 0 0 1-.708.708L8 7.707l-3.146 3.147a.5.5 0 0 1-.708-.708L7.293 7 4.146 3.854a.5.5 0 0 1 0-.708z"/>
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

    <!-- Bulk Action Buttons -->
    <div class="d-flex justify-content-end mt-3 buttons">
      <button class="btn custom-approve me-2" @click="bulkApprove">Approve</button>
      <button class="btn custom-reject" @click="bulkReject">Reject</button>
      <!-- <button class="btn btn-danger">Delete</button> -->
    </div>

    

    <!-- Applications Table -->
    <table class="table table-bordered">
      <thead>
        <tr>
          <th style="width: 50px"></th>
          <th>Employee Name</th>
          <th>Leave Type</th>
          <th>Status</th>
          <th>Applied On</th>
          <th style="width: 50px">Info</th>
          <!-- <th style="width: 50px">Actions</th> -->
        </tr>
      </thead>
      <tbody>
        <tr v-for="application in leaveApplications" :key="application.id">
          <td>
            <input type="checkbox" v-model="application.selected" class="select-checkbox">
          </td>
          <td>{{ application.employeeName }}</td>
          <td>
            <div v-if="application.dates.length">
              <div
                v-for="(item, index) in application.dates"
                :key="index"
                class="mb-1"
              >
                <strong>{{ item.leaveType }}</strong> – {{ item.date }}
                <em>({{ formatDuration(item.duration) }})</em>
              </div>
            </div>
            <span v-else>-</span>
          </td>
          <td>
            <span :class="[
              'badge',
              {
                'badge-pending': application.status === 'Pending',
                'badge-manager-approved': application.status === 'Manager Approved',
                'badge-approved': application.status === 'Approved',
                'badge-reject': application.status === 'Rejected by Manager' || application.status === 'Rejected by HR',
                'badge-withdraw': application.status === 'Withdraw'
              }
            ]">
              {{ application.status }}
            </span>
          </td>

          <td>{{ application.appliedOn }}</td>
          <td>
            <button class="btn btn-light btn-sm" @click="showLeaveDetails(application)">
              <i class="bi bi-info-circle"></i>
            </button>
          </td>
          <!-- <td>
            <button class="btn btn-sm btn-danger">
              <i class="bi bi-trash"></i>
            </button>
          </td> -->
        </tr>
      </tbody>
    </table>
    <div class="d-flex align-items-center gap-3 my-3">
      <div class="text-muted fs-5">
        Total Applications: {{ totalCount }}
      </div>

      <nav>
        <ul class="pagination mb-0">
          <li :class="['page-item', { disabled: currentPage === 1 }]">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Previous</a>
          </li>

          <li
            v-for="page in totalPages"
            :key="page"
            :class="['page-item', { active: currentPage === page }]"
          >
            <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
          </li>

          <li :class="['page-item', { disabled: currentPage === totalPages }]">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Next</a>
          </li>
        </ul>
      </nav>
    </div>


    <!-- Leave Details Modal for Individual Application -->
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
          <div class="modal-body" v-if="selectedLeave">
            <div class="row mb-4">
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="info-label">Name:</label>
                  <div class="info-badge">{{ selectedLeave.employeeName }}</div>
                </div>
                <div class="mb-3">
                  <label class="info-label">Department:</label>
                  <div class="info-badge">{{ selectedLeave.department }}</div>
                </div>
                <div class="mb-3">
                  <label class="info-label">Reasons:</label>
                  <div class="info-badge">{{ selectedLeave.reasons }}</div>
                </div>
                <div class="mb-3" v-if="selectedLeave.document">
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

            <!-- Editable Dates Section -->
            <div class="dates-section mb-4">
              <h6 class="mb-3">Dates Selected:</h6>
              <div v-for="(date, index) in selectedLeave.dates" :key="index" class="date-entry mb-2">
                <div class="info-badge d-flex align-items-center justify-content-between">
                  <template v-if="['Pending', 'Manager Approved'].includes(selectedLeave.status)">
                    <span>{{ date.date }}</span>
                    <select v-model="date.duration" class="form-select form-select-sm ms-2 duration-select" :disabled="isModalReadOnly">
                      <option value="F">Full Day</option>
                      <option value="AM">Morning</option>
                      <option value="PM">Afternoon</option>
                    </select>
                    <select v-model="date.leaveType" class="form-select form-select-sm ms-2 leave-type-select" :disabled="isModalReadOnly">
                      <option v-for="type in leaveTypeOptions" :key="type.id" :value="type.name">
                        {{ type.name }}
                      </option>
                    </select>
                  </template>
                  <template v-else>
                    <strong>{{ date.leaveType }}</strong> – {{ date.date }} 
                    <em>({{ formatDuration(date.duration) }})</em>
                  </template>
                </div>
              </div>
            </div>

            <!-- Remarks Section -->
            <div class="mb-4">
              <h6 class="mb-3">Remarks</h6>
              <textarea 
                v-model="selectedLeave.remarks" 
                class="form-control" 
                rows="4" 
                :readonly="isModalReadOnly"
                ></textarea>
            </div>

            <!-- Action Buttons for Approve / Reject -->
            <div v-if="!isModalReadOnly" class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-approve" @click="approveSingle">Approve</button>
              <button type="button" class="btn btn-reject" @click="rejectSingle">Reject</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<style scoped>
.summary-card {
  height: 150px;
}

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

.badge-manager-approved {
  background-color: #7DA0CA; /* Light blue for manager-approved */
  color: white;
}

.badge-withdraw {
  background-color: #6c757d; /* Gray for withdrawn */
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


</style>