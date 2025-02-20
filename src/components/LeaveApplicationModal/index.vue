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

// Reactive form data
const formData = reactive<ApplicationFormData>({
  name: '',
  department: '',
  reasons: '',
  selectedDates: []
});

// Datepicker state
const selectedDate = ref<Date | null>(null);

// Modal reference
const modalRef = ref<HTMLElement | null>(null);
let modalInstance: Modal | null = null;

// Initialize modal when component is mounted
onMounted(() => {
  if (modalRef.value) {
    modalInstance = new Modal(modalRef.value);
  }
});

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

// Close modal function
const closeModal = () => {
  if (modalInstance) {
    modalInstance.hide();
  }

  // Ensure any leftover backdrop is removed
  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) {
    backdrop.remove();
  }
};

// Reset form data
const resetForm = () => {
  formData.name = '';
  formData.department = '';
  formData.reasons = '';
  formData.selectedDates = [];
};

// Handle form submission
const handleSubmit = () => {
  // Create a new leave application entry
  const newApplication = {
    id: Math.floor(Math.random() * 1000), // Generate a random ID
    name: formData.name,
    leaveType: formData.selectedDates[0]?.leaveType || "AL",
    status: "Pending", // Default status when submitting
    appliedOn: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString(),
    selected: false,
    dates: [...formData.selectedDates], // Copy dates array
    reasons: formData.reasons,
    document: "N/A" // Placeholder for file attachment
  };

  // Emit the data to parent component (leaveManagement.vue)
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
            <!-- Name & Department -->
            <div class="mb-3">
              <label class="form-label">Name</label>
              <input type="text" class="form-control" v-model="formData.name" placeholder="Enter your name" required>
            </div>

            <div class="mb-3">
              <label class="form-label">Department</label>
              <input type="text" class="form-control" v-model="formData.department" placeholder="Enter your department" required>
            </div>

            <!-- Reasons -->
            <div class="mb-3">
              <label class="form-label">Reasons</label>
              <textarea class="form-control" v-model="formData.reasons" rows="3" placeholder="Enter your reasons" required></textarea>
            </div>

            <!-- Date Picker -->
            <div class="mb-3">
              <label class="form-label">Select Date</label>
              <Datepicker v-model="selectedDate" @update:modelValue="handleDateSelect" :enable-time="false" placeholder="Pick a date"/>
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
                  <option value="Emergency">Emergency Leave</option>
                </select>
                <button type="button" class="btn btn-danger btn-sm" @click="formData.selectedDates.splice(index, 1)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="submit" class="btn btn-success" @click="handleSubmit">Submit Application</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Modal Styles */
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

/* Input Fields */
.form-control, .form-select {
  border-radius: 8px;
  padding: 10px;
}

/* Selected Dates Styling */
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

/* Buttons */
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
