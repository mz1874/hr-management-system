<script setup lang="ts">
import { ref, defineProps, watch, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import { BASE_URL } from '@/api/axios'
import type { LeaveDate, LeaveApplication } from '@/interface/leaveApplicationInterface';


// Props to receive selected leave application data
const props = defineProps<{ selectedApplication: LeaveApplication | null }>();

const modalRef = ref<HTMLElement | null>(null);
let modalInstance: Modal | null = null;

// Initialize modal when component is mounted
onMounted(() => {
  if (modalRef.value) {
    modalInstance = new Modal(modalRef.value);
  }
});

// Open Modal Function
const showModal = () => {
  modalInstance?.show();
};

// Close Modal Function
const closeModal = () => {
  modalInstance?.hide();
};

// Open modal automatically when new data is passed in
watch(() => props.selectedApplication, (newData) => {
  if (newData) {
    console.log('Selected Application:', newData);
    showModal();
  }
});


const formatDateOnly = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toISOString().slice(0, 10); // returns 'YYYY-MM-DD'
};

</script>

<template>
  <div class="modal fade" id="leaveDetailsModal" ref="modalRef" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-info-circle me-2"></i> Leave Application Details
          </h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body" v-if="props.selectedApplication">
          <!-- Name -->
          <div class="mb-3">
            <label class="form-label">Name</label>
            <input type="text" class="form-control" :value="props.selectedApplication.name" disabled>
          </div>

          <!-- Department -->
          <div class="mb-3">
            <label class="form-label">Department</label>
            <input type="text" class="form-control" :value="props.selectedApplication.department" disabled>
          </div>

          <!-- Applied On -->
          <div class="mb-3">
            <label class="form-label">Applied On</label>
            <input type="text" class="form-control" :value="formatDateOnly(props.selectedApplication.appliedOn)" disabled>
          </div>

          <!-- Leave Type -->
          <div class="mb-3">
            <label class="form-label">Leave Type</label>
            <input type="text" class="form-control" :value="props.selectedApplication.leaveType" disabled>
          </div>

          <!-- Status -->
          <div class="mb-3">
            <label class="form-label">Status</label>
            <input type="text" class="form-control" :value="props.selectedApplication.status" disabled>
          </div>

          <!-- Reasons -->
          <div class="mb-3">
            <label class="form-label">Reasons</label>
            <textarea class="form-control" :value="props.selectedApplication.reasons" rows="3" disabled></textarea>
          </div>

          <!-- Selected Dates -->
          <div class="mb-3">
            <h6 class="mb-3">Selected Dates:</h6>
            <div v-for="(date, index) in props.selectedApplication.dates" :key="index" class="date-row">
              <input type="text" class="form-control" :value="date.date" disabled>
              <input type="text" class="form-control" :value="date.duration" disabled>
              <input type="text" class="form-control" :value="date.leaveType" disabled>
            </div>
          </div>

          <!-- Document (if available) -->
          <div v-if="props.selectedApplication.document && props.selectedApplication.document !== 'N/A'">
            <label class="form-label">Attached Document</label>
            <div class="pdf-viewer">
              <embed
                :src="BASE_URL + props.selectedApplication.document"
                type="application/pdf"
                width="100%"
                height="400px"
              />
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
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

.form-control {
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
  flex: 1;
}

.pdf-viewer {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .date-row {
    flex-direction: column;
  }
}
</style>