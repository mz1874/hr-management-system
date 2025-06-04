<script setup lang="ts">
import { ref, defineProps, watch, onMounted, nextTick } from 'vue';
import { Modal } from 'bootstrap';
import { BASE_URL } from '@/api/axios'
import type {LeaveApplication } from '@/interface/leaveApplicationInterface';

const props = defineProps<{ selectedApplication: LeaveApplication | null }>();

const modalRef = ref<HTMLElement | null>(null);
let modalInstance: Modal | null = null;

onMounted(() => {
  if (modalRef.value) {
    modalInstance = new Modal(modalRef.value);
  }
});

const showModal = () => {
  modalInstance?.show();
};

const closeModal = () => {
  modalInstance?.hide();
};

watch(() => props.selectedApplication, async (newData) => {
  if (newData) {
    await nextTick(); // ensure DOM is updated
    showModal();
  }
});


const formatDateOnly = (dateStr: string): string => {
  if (!dateStr) return '-';

  // Handle format: "01.06.2025 00:00:00"
  if (dateStr.includes('.') && dateStr.includes(' ')) {
    const [datePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('.');
    if (!day || !month || !year) return '-';
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Handle ISO format: "2025-06-01T19:49:17.417555"
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0];
  }

  // Handle already formatted YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.slice(0, 10);
  }

  // Fallback
  return dateStr;
};

</script>

<template>
  <div class="modal fade" id="leaveDetailsModal" ref="modalRef" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-info-circle me-2"></i> Leave Application Details
          </h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>

        <div class="modal-body" v-if="props.selectedApplication">
          <div class="mb-3">
            <label class="form-label">Name</label>
            <input type="text" class="form-control" :value="props.selectedApplication.name" disabled>
          </div>

          <div class="mb-3">
            <label class="form-label">Department</label>
            <input type="text" class="form-control" :value="props.selectedApplication.department" disabled>
          </div>

          <div class="mb-3">
            <label class="form-label">Applied On</label>
            <input type="text" class="form-control" :value="formatDateOnly(props.selectedApplication.appliedOn)" disabled>
          </div>

          <div class="mb-3">
            <label class="form-label">Status</label>
            <input type="text" class="form-control" :value="props.selectedApplication.status" disabled>
          </div>

          <div class="mb-3">
            <label class="form-label">Reasons</label>
            <textarea class="form-control" :value="props.selectedApplication.reasons" rows="3" disabled></textarea>
          </div>

          <div class="mb-3">
            <h6 class="mb-3">Selected Dates:</h6>
            <div v-for="(date, index) in props.selectedApplication.dates" :key="index" class="date-row">
              <input type="text" class="form-control" :value="date.date" disabled>
              <input type="text" class="form-control" :value="date.duration" disabled>
              <input type="text" class="form-control" :value="date.leaveType" disabled>
            </div>
          </div>

          <!-- Review Comment -->
          <div class="mb-3" v-if="props.selectedApplication.status !== 'Pending' && props.selectedApplication.status !== 'Withdraw'">
            <label class="form-label">Review Comment</label>
            <input type="text" class="form-control" :value="props.selectedApplication.reviewComment || '-'" disabled>
          </div>

          <!-- Review Date -->
          <div class="mb-3" v-if="props.selectedApplication.status !== 'Pending' && props.selectedApplication.status !== 'Withdraw'">
            <label class="form-label">Reviewed On</label>
            <input type="text" class="form-control" :value="props.selectedApplication.reviewDate ? formatDateOnly(props.selectedApplication.reviewDate) : '-'" disabled>
          </div>

          <div v-if="props.selectedApplication.document && props.selectedApplication.document !== 'N/A'">
            <label class="form-label">Attached Document</label>
            <div class="pdf-viewer">
              <embed
                :src="props.selectedApplication.document"
                type="application/pdf"
                width="100%"
                height="400px"
              />
            </div>
          </div>
        </div>

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