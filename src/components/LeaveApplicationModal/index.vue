<script setup lang="ts">
import { ref, reactive, defineEmits, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

// Define interfaces
interface LeaveDate {
  date: string;
  duration: string;
  leaveType: string;
}

interface ApplicationFormData {
  name: string;
  department: string;
  reasons: string;
  selectedDates: LeaveDate[];
}

// Emit event for submitting data
const emit = defineEmits(['submit']);

// Reactive form data; pre-fill name and department from the logged-in user
const formData = reactive<ApplicationFormData>({
  name: 'Wang Chong',       // Pre-filled logged-in user name
  department: 'A',           // Pre-filled logged-in user department
  reasons: '',
  selectedDates: []
});

// Datepicker state
const selectedDate = ref<Date | null>(null);

// Reactive variable for primary document upload
const primaryDocument = ref<File | null>(null);

// Create a ref for the primary document input element
const primaryDocumentInput = ref<HTMLInputElement | null>(null);

// Modal reference
const modalRef = ref<HTMLElement | null>(null);
let modalInstance: Modal | null = null;

// Initialize modal when component is mounted
onMounted(() => {
  if (modalRef.value) {
    modalInstance = new Modal(modalRef.value);
  }
});

// Filter function to disable past dates and weekends
const filterDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return false;
  const day = date.getDay();
  return day !== 0 && day !== 6; // disable Sunday (0) and Saturday (6)
};

// Handle date selection
const handleDateSelect = () => {
  if (!selectedDate.value) return;
  const dateStr = selectedDate.value.toLocaleDateString('en-GB');
  if (!formData.selectedDates.some(d => d.date === dateStr)) {
    formData.selectedDates.push({
      date: dateStr,
      duration: 'whole',
      leaveType: 'AL'
    });
  }
  selectedDate.value = null;
};

// Handle primary document upload
const handlePrimaryDocumentUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    primaryDocument.value = target.files[0];
  }
};

// Close modal function
const closeModal = () => {
  if (modalInstance) {
    modalInstance.hide();
  }
  // Remove any leftover backdrop
  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) {
    backdrop.remove();
  }
};

// Reset form data (except name and department) and clear file input
const resetForm = () => {
  formData.reasons = '';
  formData.selectedDates = [];
  primaryDocument.value = null;
  // Clear the file input element's value
  if (primaryDocumentInput.value) {
    primaryDocumentInput.value.value = '';
  }
};

// Handle form submission
const handleSubmit = () => {
  if (!formData.reasons) {
    alert('Please provide a reason for your leave application.');
    return;
  }
  if (formData.selectedDates.length === 0) {
    alert('Please select at least one date.');
    return;
  }

  // Check if Medical Leave is selected and enforce document upload requirement
  const isMedicalLeave = formData.selectedDates.some(d => d.leaveType === 'MC');
  if (isMedicalLeave && !primaryDocument.value) {
    alert('Please upload a primary document for Medical Leave.');
    return;
  }

  // Create an object URL for the uploaded primary document if exists
  const primaryDocumentURL = primaryDocument.value ? URL.createObjectURL(primaryDocument.value) : null;

  // Create a new leave application entry including department
  const newApplication = {
    id: Math.floor(Math.random() * 1000),
    name: formData.name,
    department: formData.department,
    leaveType: formData.selectedDates[0]?.leaveType || "AL",
    status: "Pending",
    appliedOn: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString(),
    selected: false,
    dates: [...formData.selectedDates],
    reasons: formData.reasons,
    document: primaryDocumentURL
  };

  // Emit the data to the parent component
  emit('submit', newApplication);

  // Close modal, reset form, and remove backdrop
  closeModal();
  resetForm();
};
</script>

<template>
  <div class="modal fade" id="leaveApplicationModal" ref="modalRef" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-file-text me-2"></i> Leave Application Form
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <!-- Employee Information (read-only) -->
            <div class="mb-3">
              <label class="form-label">Name</label>
              <input type="text" class="form-control" v-model="formData.name" readonly>
            </div>
            <div class="mb-3">
              <label class="form-label">Department</label>
              <input type="text" class="form-control" v-model="formData.department" readonly>
            </div>

            <!-- Reasons (required) -->
            <div class="mb-3">
              <label class="form-label">Reasons <span class="text-danger">*</span></label>
              <textarea class="form-control" v-model="formData.reasons" rows="3" placeholder="Enter your reasons" required></textarea>
            </div>

            <!-- Date Picker with filter -->
            <div class="mb-3">
              <label class="form-label">Select Date</label>
              <Datepicker 
                v-model="selectedDate" 
                :filter="filterDate" 
                @update:modelValue="handleDateSelect" 
                :enable-time="false" 
                placeholder="Pick a date"
              />
            </div>

            <!-- Selected Dates -->
            <div class="mb-3">
              <h6 class="mb-3">Selected Dates:</h6>
              <div v-for="(date, index) in formData.selectedDates" :key="index" class="date-row">
                <input type="text" class="form-control" :value="date.date" readonly>
                <select class="form-select" v-model="date.duration">
                  <option value="whole">Full Day</option>
                  <option value="AM">Half Day (AM)</option>
                  <option value="PM">Half Day (PM)</option>
                </select>
                <select class="form-select" v-model="date.leaveType">
                  <option value="AL">Annual Leave</option>
                  <option value="MC">Medical Leave</option>
                  <option value="UL">Unpaid Leave</option>
                  <option value="MR L">Marriage Leave</option>
                  <option value="HL">Hospitalization Leave</option>
                  <option value="ML">Maternity Leave</option>
                  <option value="PL">Paternity Leave</option>
                </select>
                <button type="button" class="btn btn-danger btn-sm" @click="formData.selectedDates.splice(index, 1)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>

            
            <!-- Primary Document Upload (required for MC only) -->
            <div class="mb-3" v-if="formData.selectedDates.some(date => date.leaveType === 'MC')">
              <label class="form-label">Upload Document (PDF only)</label>
              <input type="file" class="form-control" ref="primaryDocumentInput" @change="handlePrimaryDocumentUpload" accept="application/pdf" required>
              <small class="form-text text-muted">Please upload a PDF file only.</small>
            </div>


          </form>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Close
          </button>
          <button type="submit" class="btn btn-success" @click="handleSubmit">
            Submit Application
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-header {
  background-color: #7DA0CA;
  color: white;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}
.modal-content {
  border-radius: 12px;
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1);
}
.form-control, .form-select {
  border-radius: 8px;
  padding: 10px;
}
.date-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}
.date-row .form-control {
  flex: 2;
}
.date-row .form-select {
  flex: 1;
}
.date-row .btn {
  flex-shrink: 0;
}
.btn-success {
  background-color: #004d3b;
  border-radius: 8px;
  font-weight: bold;
}
.btn-success:hover {
  background-color: #003328;
}
.btn-danger {
  border-radius: 8px;
}
@media (max-width: 768px) {
  .date-row {
    flex-direction: column;
  }
}
</style>