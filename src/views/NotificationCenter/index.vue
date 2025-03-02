<template>
  <div class="main-content container-fluid px-3 px-md-4">
    <!-- Main Content Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="h3">Current Announcement</h2>
    </div>

    <!-- Search and New Announcement Button Row -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-3 gap-3">
      <!-- Search Input -->
      <div class="search-container flex-grow-1 me-md-4">
        <i class="fas fa-search search-icon"></i>
        <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Search"
        />
      </div>

      <!-- New Announcement Button -->
      <button class="btn btn-success new-announcement-btn" @click="openNewAnnouncementModal">
        New Announcement
      </button>
    </div>

    <!-- Announcement Cards -->
    <div
        class="announcement-card"
        v-for="announcement in filteredAnnouncements"
        :key="announcement.id"
    >
      <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
        <!-- Status Indicator -->
        <div :class="['status-indicator', announcement.posted ? 'posted' : 'not-posted']"></div>

        <!-- Announcement Content -->
        <div class="flex-grow-1">
          <h5 class="announcement-title">{{ announcement.title }}</h5>
          <p class="announcement-description mb-3 mb-md-0">
            {{ announcement.description.length > 50 
              ? announcement.description.substring(0, 50) + '...' 
              : announcement.description 
            }}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons d-flex gap-2">
          <button class="btn btn-primary btn-action" @click="viewAnnouncement(announcement)">View</button>
          <button class="btn btn-warning btn-action" @click="editAnnouncement(announcement)">Edit</button>
          <button class="btn btn-danger btn-action" @click="confirmDelete(announcement)">Delete</button>
        </div>
      </div>
    </div>

    <!-- New Announcement Modal -->
    <div class="modal fade" id="newAnnouncement" ref="newAnnouncementModal">
      <div class="modal-dialog modal-xl modal-fullscreen-sm-down">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">New Announcement</h5>
            <button type="button" class="btn-close" @click="closeNewAnnouncementModal"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-12 col-md-7 border-end-md">
                <form @submit.prevent="submitNewAnnouncement">
                  <div class="mb-3">
                    <label for="title" class="form-label">Title:</label>
                    <input type="text" class="form-control" id="title" v-model="newAnnouncement.title"
                           placeholder="Enter title">
                  </div>

                  <div class="mb-3">
                    <label for="description" class="form-label">Description:</label>
                    <textarea class="form-control" id="description" rows="3" v-model="newAnnouncement.description"
                              placeholder="Enter description" style="height: 250px;"></textarea>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Attachment:</label>
                    <div class="input-group">
                      <input type="file" class="form-control" accept=".pdf, .jpg" @change="handleFileUpload">
                    </div>
                    <span class="form-text">Support pdf and jpg</span>
                  </div>
                </form>
              </div>

              <div class="col-12 col-md-5">
                <div class="mb-3">
                  <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="schedulePost" v-model="newAnnouncement.isScheduled">
                    <label class="form-check-label" for="schedulePost">Schedule Post</label>
                  </div>
                  <div class="d-flex gap-2 mt-2">
                    <input type="date" class="form-control" v-model="newAnnouncement.scheduleDate"
                           :disabled="!newAnnouncement.isScheduled">
                    <input type="time" class="form-control" v-model="newAnnouncement.scheduleTime"
                           :disabled="!newAnnouncement.isScheduled">
                  </div>
                </div>

                <div class="mb-3">
                  <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="availableFor" v-model="newAnnouncement.hasAvailability">
                    <label class="form-check-label" for="availableFor">Available for</label>
                  </div>
                  <input type="text" class="form-control mt-2" v-model="newAnnouncement.department" placeholder="Department"
                         :disabled="!newAnnouncement.hasAvailability">
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeNewAnnouncementModal">Close</button>
            <button type="button" class="btn btn-success" @click="submitNewAnnouncement">Submit</button>
          </div>
        </div>
      </div>
    </div>

    <!-- View Announcement Modal -->
    <div class="modal fade" id="viewAnnouncementModal" ref="viewModal">
      <div class="modal-dialog modal-lg modal-fullscreen-sm-down">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedAnnouncement.title }}</h5>
            <button type="button" class="btn-close" @click="closeViewModal"></button>
          </div>
          <div class="modal-body text-center">
            <p><strong>by {{ selectedAnnouncement.author }} {{ selectedAnnouncement.datetime }}</strong></p>
            <h6 class="fw-bold">Description</h6>
            <div class="border p-3 rounded">
              <p>{{ selectedAnnouncement.description }}</p>
              <p class="text-end">Best Regards<br>HR Team</p>
            </div>
            <div class="mt-3" v-if="selectedAnnouncement.attachment">
              <iframe :src="selectedAnnouncement.attachment" class="attachment-preview"></iframe>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeViewModal">Close</button>
          </div>
        </div>
      </div>
    </div>


<!-- Delete Confirmation Modal -->
<div class="modal fade" id="deleteConfirmModal" ref="deleteModal">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content" style="border-radius: 16px;">
      <div class="modal-body p-4">
        <div class=" mb-4">
          <h3 class="mb-3" style="font-size: 2rem; font-weight: 500;">Are you sure?</h3>
          <p class="text-muted" style="color: #6B7280;">This action cannot be undone. This will permanently delete the announcement.</p>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="closeDeleteModal"
          >
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-success" 
            @click="deleteAnnouncement"
           >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

    <!-- Edit Announcement Modal -->
    <div class="modal fade" id="editAnnouncementModal" ref="editModal">
      <div class="modal-dialog modal-xl modal-fullscreen-sm-down">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Announcement</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-12 col-md-7 border-end-md">
                <form>
                  <div class="mb-3">
                    <label for="editTitle" class="form-label">Title:</label>
                    <input type="text" class="form-control" id="editTitle" v-model="selectedAnnouncement.title" 
                           placeholder="Enter title">
                  </div>

                  <div class="mb-3">
                    <label for="editDescription" class="form-label">Description:</label>
                    <textarea class="form-control" id="editDescription" v-model="selectedAnnouncement.description"
                              placeholder="Enter description" style="height: 250px;"></textarea>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Attachment:</label>
                    <div class="input-group">
                      <input type="file" class="form-control" accept=".pdf, .jpg" @change="handleFileUpload">
                    </div>
                    <span class="form-text">Support pdf and jpg</span>
                  </div>
                </form>
              </div>

              <div class="col-12 col-md-5">
                <div class="mb-3">
                  <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="editSchedulePost" 
                           v-model="selectedAnnouncement.isScheduled">
                    <label class="form-check-label" for="editSchedulePost">Schedule Post</label>
                  </div>
                  <div class="d-flex gap-2 mt-2">
                    <input type="date" class="form-control" v-model="selectedAnnouncement.scheduleDate"
                           :disabled="!selectedAnnouncement.isScheduled">
                    <input type="time" class="form-control" v-model="selectedAnnouncement.scheduleTime"
                           :disabled="!selectedAnnouncement.isScheduled">
                  </div>
                </div>

                <div class="mb-3">
                  <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="editAvailableFor" 
                           v-model="selectedAnnouncement.hasAvailability">
                    <label class="form-check-label" for="editAvailableFor">Available for</label>
                  </div>
                  <input type="text" class="form-control mt-2" v-model="selectedAnnouncement.department" 
                         placeholder="Department" :disabled="!selectedAnnouncement.hasAvailability">
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
            <button type="button" class="btn btn-success" @click="submitAnnouncement">Submit</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {Modal} from "bootstrap";

const searchQuery = ref('');
const announcements = ref([
  {
    id: 1,
    title: 'Welcome to new website',
    description: "We're excited to launch our new announcement center. Stay tuned for important updates!",
    author: 'HR Chloe',
    datetime: '18/10/2024 12 p.m.',
    attachment: '1701exercise1.pdf',
    posted: true,
    isScheduled: false,
    scheduleDate: '',
    scheduleTime: '',
    hasAvailability: false,
    department: '',
  },
  {
    id: 2,
    title: 'Upcoming Maintenance',
    description: 'Scheduled maintenance will take place this weekend. Expect some downtime.',
    author: 'Admin Team',
    datetime: '20/10/2024 5 p.m.',
    posted: false,
    isScheduled: false,
    scheduleDate: '',
    scheduleTime: '',
    hasAvailability: false,
    department: '',
  },
]);

const newAnnouncement = ref({
  title: '',
  description: '',
  isScheduled: false,
  scheduleDate: '',
  scheduleTime: '',
  hasAvailability: false,
  department: '',
  attachment: null,
});

interface ModalInstances {
  new: Modal;
  view: Modal;
  delete: Modal;
  edit: Modal;
}
const modalInstances: ModalInstances = {} as ModalInstances;


const selectedAnnouncement = ref<any>({});
const newAnnouncementModal = ref(null);
const viewModal = ref(null);
const deleteModal = ref(null);
const editModal = ref(null);

const filteredAnnouncements = computed(() => {
  return announcements.value.filter(
      (announcement) =>
          announcement.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          announcement.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const initializeModals = () => {
  modalInstances.new = new Modal(newAnnouncementModal.value);
  modalInstances.view = new Modal(viewModal.value);
  modalInstances.delete = new Modal(deleteModal.value);
  modalInstances.edit = new Modal(editModal.value);
};

const openNewAnnouncementModal = () => {
  modalInstances.new.show();
};

const closeNewAnnouncementModal = () => {
  modalInstances.new.hide();
  resetNewAnnouncement();
};

const submitNewAnnouncement = () => {
  announcements.value.push({
    id: announcements.value.length + 1,
    ...newAnnouncement.value,
    author: 'Current User',
    datetime: new Date().toLocaleString(),
    posted: false
  });
  closeNewAnnouncementModal();
};

const editAnnouncement = (announcement) => {
  selectedAnnouncement.value = { ...announcement };
  modalInstances.edit.show();
};

const submitAnnouncement = () => {
  const index = announcements.value.findIndex((a) => a.id === selectedAnnouncement.value.id);
  if (index !== -1) {
    announcements.value[index] = { ...selectedAnnouncement.value };
  }
  modalInstances.edit.hide();
};

const closeModal = () => {
  modalInstances.edit.hide();
};

const viewAnnouncement = (announcement) => {
  selectedAnnouncement.value = announcement;
  modalInstances.view.show();
};

const closeViewModal = () => {
  modalInstances.view.hide();
};

const confirmDelete = (announcement) => {
  selectedAnnouncement.value = announcement;
  modalInstances.delete.show();
};

const deleteAnnouncement = () => {
  announcements.value = announcements.value.filter((a) => a.id !== selectedAnnouncement.value.id);
  modalInstances.delete.hide();
};

const closeDeleteModal = () => {
  modalInstances.delete.hide();
};

const resetNewAnnouncement = () => {
  newAnnouncement.value = {
    title: '',
    description: '',
    isScheduled: false,
    scheduleDate: '',
    scheduleTime: '',
    hasAvailability: false,
    department: '',
    attachment: null,
  };
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (selectedAnnouncement.value.id) {
      selectedAnnouncement.value.attachment = file;
    } else {
      newAnnouncement.value.attachment = file;
    }
  }
};

onMounted(() => {
  initializeModals();
});
</script>


<script lang="ts">
export default {
  name : "NotificationCenter",
}
</script>

<style scoped>
.search-container {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 8px 12px;
  width: 100%;
  position: relative;
}

.search-icon {
  font-size: 16px;
  color: #555;
  margin-right: 10px;
  flex-shrink: 0;
}

.search-input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 16px;
}


.new-announcement-btn {
  width: 100%;
  max-width: 200px;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: 0.3s;
}

@media (max-width: 768px) {
  .new-announcement-btn {
    max-width: 100%;
  }
  
  .me-md-4 {
    margin-right: 0 !important;
  }
  
}

.announcement-card {
  border: 1px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  transition: box-shadow 0.3s ease;
}

.announcement-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-indicator {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  flex-shrink: 0;
}

.posted {
  background-color: #28a745;
}

.not-posted {
  background-color: #6c757d;
}

.announcement-title {
  margin-bottom: 0.5rem;
  color: #333;
}

.announcement-description {
  margin-bottom: 0;
  color: #666;
  line-height: 1.4;
}

.action-buttons {
  flex-wrap: wrap;
}

.btn-action {
  padding: 0.25rem 1rem;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.btn-action:hover {
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .action-buttons {
    width: 100%;
    justify-content: flex-start;
  }
  
  .btn-action {
    flex: 1;
  }
}

/* Modal Responsive Styles */
@media (max-width: 576px) {
  .modal-dialog {
    margin: 0;
    max-width: none;
    height: 100vh;
  }

  .modal-content {
    border-radius: 0;
    min-height: 100vh;
  }
}

/* Border utilities */
@media (min-width: 768px) {
  .border-end-md {
    border-right: 1px solid #dee2e6;
  }
}

/* Form Styling */
.form-control {
  border-radius: 4px;
  border: 1px solid #ced4da;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  box-shadow: none;
  border-color: #80bdff;
}

.form-check-input {
  cursor: pointer;
}

.form-check-label {
  cursor: pointer;
  user-select: none;
}

/* Ensure modals are scrollable on mobile */
.modal-body {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

/* Attachment Preview */
.attachment-preview {
  width: 100%;
  height: 400px;
  border: none;
  border-radius: 4px;
  background-color: #f8f9fa;
}

@media (max-width: 768px) {
  .attachment-preview {
    height: 300px;
  }
}

/* Modal Animation */
.modal.fade .modal-dialog {
  transition: transform 0.3s ease-out;
}

.modal.fade.show .modal-dialog {
  transform: none;
}

/* Additional Responsive Utilities */
@media (max-width: 576px) {
  .container-fluid {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .modal-footer {
    padding: 1rem;
  }
  
  .form-control {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}
</style>