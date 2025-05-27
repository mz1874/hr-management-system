<script setup lang="ts">
import { ref, reactive, defineEmits, onMounted, computed } from 'vue';
import { Modal } from 'bootstrap';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { getLeaveTypes, submitLeaveRequest } from '@/api/leave';
import { getCurrentUser } from '@/api/login';
import { uploadFile } from '@/api/file_upload';
import type {ApplicationFormData, LeaveType } from '@/interface/leaveApplicationModal';
import Swal from 'sweetalert2';

const emit = defineEmits(['submit']);

const formData = reactive<ApplicationFormData>({
  reasons: '',
  selectedDates: [],
  department: null
});

const leaveTypes = ref<LeaveType[]>([]);
const selectedDate = ref<Date | null>(null);
const primaryDocument = ref<File | null>(null);
const primaryDocumentInput = ref<HTMLInputElement | null>(null);
const modalRef = ref<HTMLElement | null>(null);
let modalInstance: Modal | null = null;
const isSubmitting = ref(false);

const userName = ref('');
const userDeptName = ref('');

const medicalLeaveId = computed(() => {
  return leaveTypes.value.find(t => t.name.toLowerCase() === 'mc')?.id;
});

onMounted(async () => {
  if (modalRef.value) {
    modalInstance = new Modal(modalRef.value);
    
    // Handle proper modal cleanup when hidden
    modalRef.value.addEventListener('hidden.bs.modal', () => {
      // Clean up any leftover backdrops
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      
      // Restore body scrolling properly
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      // Reset form data
      resetForm();
    });
  }

  try {
    const res = await getCurrentUser();
    const data = res.data.data;

    userName.value = data.staffName?.trim() || data.username || 'User';
    formData.department = data.department_id || null;
    userDeptName.value = data.department || '-';
  } catch (e) {
    console.error('Failed to fetch current user:', e);
  }



  try {
    const typeRes = await getLeaveTypes();
    leaveTypes.value = typeRes.data.data.results || [];
  } catch (e) {
    console.error('Failed to fetch leave types');
  }
});

const disabledDates = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  return isWeekend;
};



const handleDateSelect = () => {
  if (!selectedDate.value) return;
  const isoDate = selectedDate.value.toISOString().split('T')[0];
  if (!formData.selectedDates.some(d => d.leave_date === isoDate)) {
    const defaultLeaveType = leaveTypes.value[0]?.id || 1;
    formData.selectedDates.push({
      leave_date: isoDate,
      duration: 'F',
      leave_type: defaultLeaveType
    });
  }
  selectedDate.value = null;
};

const handlePrimaryDocumentUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    primaryDocument.value = target.files[0];
  }
};

const scrollModalTop = () => {
  const modalBody = modalRef.value?.querySelector('.modal-body');
  modalBody?.scrollTo({ top: 0, behavior: 'smooth' });
};

const resetForm = () => {
  formData.reasons = '';
  formData.selectedDates = [];
  formData.department = null;
  primaryDocument.value = null;
  if (primaryDocumentInput.value) primaryDocumentInput.value.value = '';

  scrollModalTop(); // scroll to top
};

// Fixed closeModal function that properly handles Bootstrap modals
const closeModal = () => {
  if (modalInstance) {
    // Only hide the modal and let the hidden.bs.modal event handle cleanup
    modalInstance.hide();
  }
};

const getLeaveTypeById = (id: number | undefined) => {
  return leaveTypes.value.find(t => t.id === id);
};

const handleSubmit = async (event?: Event) => {
  if (event) event.preventDefault();
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    if (!formData.reasons) throw new Error('Please provide a reason.');
    if (formData.selectedDates.length === 0) throw new Error('Please select at least one date.');

    // Validate: Annual Leave must be requested 3 days in advance
    for (const d of formData.selectedDates) {
      const leaveTypeObj = getLeaveTypeById(d.leave_type);
      const isAnnual = leaveTypeObj?.description?.toLowerCase().includes('annual');

      if (isAnnual) {
        const selectedDate = new Date(d.leave_date);
        selectedDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const minValidDate = new Date(today);
        minValidDate.setDate(today.getDate() + 3);

        if (selectedDate < minValidDate) {
          throw new Error(`Annual leave on ${d.leave_date} must be applied at least 3 days in advance.`);
        }
      }
    }

    // Medical leave file requirement
    const isMedicalLeave = formData.selectedDates.some(
      d => d.leave_type === medicalLeaveId.value
    );
    if (isMedicalLeave && !primaryDocument.value) {
      throw new Error('Upload document for Medical Leave.');
    }

    let uploadedFileId: number | null = null;
    if (primaryDocument.value) {
      const uploadRes = await uploadFile(primaryDocument.value);
      uploadedFileId = uploadRes?.data?.data?.id ?? null;
      if (!uploadedFileId) throw new Error('Upload succeeded but no file ID returned.');
    }

    const payload = {
      reason: formData.reasons,
      department: formData.department,
      leave_dates: formData.selectedDates,
      ...(uploadedFileId ? { attachment: uploadedFileId } : {})
    };

    const res = await submitLeaveRequest(payload);
    const leave = res?.data?.data;
    const httpStatus = res?.status;
    const message = res?.data?.message;

    if (!leave?.id) throw new Error('Missing leave ID in response.');
    if (httpStatus !== 201 || message !== 'success') {
      throw new Error(`Unexpected response:\n${JSON.stringify(res?.data, null, 2)}`);
    }

    const mapped = {
      id: leave.id,
      name: userName.value,
      department: userDeptName.value,
      leaveType: leave.leave_dates?.[0]?.leave_type_display?.name || '-',
      status: 'Pending',
      appliedOn: leave.created_date,
      selected: false,
      reasons: formData.reasons,
      document: leave.attachment_url || '',
      dates: leave.leave_dates.map((d: any) => ({
        date: d.leave_date.split('T')[0],
        duration: d.duration,
        leaveType: d.leave_type_display?.name || 'N/A'
      }))
    };

    emit('submit', mapped);
    closeModal();

    Swal.fire({
      icon: 'success',
      title: 'Submitted!',
      text: 'Your leave request has been submitted successfully.',
      timer: 2000,
      showConfirmButton: false
    });

  } catch (e: any) {
    console.error('Submit error:', e);
    Swal.fire({
      icon: 'error',
      title: 'Submission Failed',
      text: e?.message || 'Submission failed.',
      confirmButtonText: 'OK',
    });
  } finally {
    isSubmitting.value = false;
  }
};


</script>

<template>
  <div class="modal fade" id="leaveApplicationModal" ref="modalRef" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-file-text me-2"></i> Leave Application Form
          </h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Name</label>
              <input type="text" class="form-control" :value="userName" readonly>
            </div>

            <div class="mb-3">
              <label class="form-label">Department</label>
              <input type="text" class="form-control" :value="userDeptName" readonly>
            </div>

            <div class="mb-3">
              <label class="form-label">Reason <span class="text-danger">*</span></label>
              <textarea class="form-control" v-model="formData.reasons" rows="3" required></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label">Select Date</label>
              <Datepicker
                v-model="selectedDate"
                :disabled-dates="disabledDates"
                @update:modelValue="handleDateSelect"
                :enable-time="false"
                placeholder="Pick a date"
              />


            </div>

            <div class="mb-3">
              <h6 class="mb-2">Selected Dates:</h6>
              <div v-for="(date, index) in formData.selectedDates" :key="index" class="d-flex gap-2 align-items-center mb-2">
                <input type="text" class="form-control" :value="date.leave_date" readonly>
                <select class="form-select" v-model="date.duration">
                  <option value="F">Full Day</option>
                  <option value="AM">Half Day (AM)</option>
                  <option value="PM">Half Day (PM)</option>
                </select>
                <select class="form-select" v-model="date.leave_type">
                  <option v-for="type in leaveTypes" :key="type.id" :value="type.id">
                    {{ type.description }}
                  </option>
                </select>
                <button type="button" class="btn btn-danger btn-sm" @click="formData.selectedDates.splice(index, 1)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>

            <div class="mb-3" v-if="formData.selectedDates.some(d => d.leave_type === medicalLeaveId)">
              <label class="form-label">Upload Medical Document (PDF)</label>
              <input type="file" class="form-control" ref="primaryDocumentInput" @change="handlePrimaryDocumentUpload" accept="application/pdf">
              <small class="text-muted">Required for Medical Leave</small>
            </div>

            <div class="d-flex justify-content-end">
              <button
                type="submit"
                class="btn btn-success"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Submit Application
              </button>
            </div>
          </form>
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