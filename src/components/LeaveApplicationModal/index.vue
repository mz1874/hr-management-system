<script setup lang="ts">
import { ref, reactive, defineEmits, onMounted, computed } from 'vue';
import { Modal } from 'bootstrap';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { getLeaveTypes, submitLeaveRequest } from '@/api/leave';
import { getCurrentUser } from '@/api/login';
import { uploadFile } from '@/api/file_upload';

interface LeaveDate {
  leave_date: string;
  duration: 'F' | 'AM' | 'PM';
  leave_type: number;
}

interface ApplicationFormData {
  reasons: string;
  selectedDates: LeaveDate[];
  department: number | null;
}

interface LeaveType {
  id: number;
  name: string;
  description: string;
}

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

const userName = ref('');
const userDeptName = ref('');

const medicalLeaveId = computed(() => {
  return leaveTypes.value.find(t => t.name.toLowerCase() === 'mc')?.id;
});

onMounted(async () => {
  if (modalRef.value) {
    modalInstance = new Modal(modalRef.value);

    modalRef.value.addEventListener('hidden.bs.modal', () => {
      resetForm();
    });
  }

  try {
    const res = await getCurrentUser();
    console.log('Fetched user data:', res);
    userName.value = res.data.data.first_name || res.data.data.username || 'User';
    formData.department = res.data.data.department?.id || null;
    userDeptName.value = res.data.data.department || '-';
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

const filterDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = date.getDay();
  return date >= today && day !== 0 && day !== 6;
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
  if (target.files && target.files[0]) primaryDocument.value = target.files[0];
};

const closeModal = () => {
  if (modalInstance) modalInstance.hide();
  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) backdrop.remove();
};

const resetForm = () => {
  formData.reasons = '';
  formData.selectedDates = [];
  formData.department = null;
  primaryDocument.value = null;
  if (primaryDocumentInput.value) primaryDocumentInput.value.value = '';
};

const handleSubmit = async () => {
  if (!formData.reasons) return alert('Please provide a reason.');
  if (formData.selectedDates.length === 0) return alert('Please select at least one date.');

  const isMedicalLeave = formData.selectedDates.some(d => d.leave_type === medicalLeaveId.value);
  if (isMedicalLeave && !primaryDocument.value) return alert('Upload document for Medical Leave.');

  let uploadedFileId: number | null = null;

  if (primaryDocument.value) {
    try {
      const uploadRes = await uploadFile(primaryDocument.value);
      uploadedFileId = uploadRes.data?.data?.id;
      if (!uploadedFileId) throw new Error('Missing file ID after upload');
    } catch (error: any) {
      console.error('File upload error:', error);
      alert(JSON.stringify(error.response?.data || 'Failed to upload file.'));
      return;
    }
  }

  const payload = {
    reason: formData.reasons,
    department: formData.department,
    leave_dates: formData.selectedDates,
    ...(uploadedFileId ? { attachment: uploadedFileId } : {})
  };

  try {
    await submitLeaveRequest(payload);
    emit('submit');
    closeModal();
    resetForm();
    if (modalRef.value) {
      modalInstance = new Modal(modalRef.value);
    }
  } catch (e: any) {
    console.error('Submit error:', e);
    const msg = e.response?.data || 'Unknown error';
    alert(JSON.stringify(msg));
  }
};
</script>

<template>
  <div class="modal fade" id="leaveApplicationModal" ref="modalRef" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-file-text me-2"></i> Leave Application Form
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

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
                :filter="filterDate"
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
          </form>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="submit" class="btn btn-success" @click="handleSubmit">Submit Application</button>
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