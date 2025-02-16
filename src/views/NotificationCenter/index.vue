
<template>
  <div class="main-content">
    <!-- Main Content Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Current Announcement</h2>
      <button class="btn btn-success" @click="openNewAnnouncementModal">New Announcement</button>
    </div>

    <!-- Search Bar -->
    <div class="search-container">
      <i class="fas fa-search"></i>
      <input type="text" class="form-control" placeholder="Search" v-model="searchQuery">
    </div>

    <!-- Announcement Cards -->
    <div class="announcement-card" v-for="announcement in filteredAnnouncements" :key="announcement.id">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h5>{{ announcement.title }}</h5>
          <p class="mb-0">{{ announcement.description }}</p>
        </div>
        <div>
          <button class="btn btn-primary btn-action" @click="viewAnnouncement(announcement)">View</button>
          <button class="btn btn-warning btn-action" @click="editAnnouncement(announcement)">Edit</button>
          <button class="btn btn-danger btn-action" @click="confirmDelete(announcement)">Delete</button>
        </div>
      </div>
    </div>

    <!-- New Announcement Modal -->
    <div class="modal fade" id="newAnnouncement" ref="newAnnouncementModal">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">New Announcement</h5>
            <button type="button" class="btn-close" @click="closeNewAnnouncementModal"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-7 border-end">
                <form @submit.prevent="submitNewAnnouncement">
                  <div class="mb-3">
                    <label for="title" class="form-label">Title:</label>
                    <input type="text" class="form-control" id="title" v-model="newAnnouncement.title" placeholder="Enter title">
                  </div>

                  <div class="mb-3">
                    <label for="description" class="form-label">Description:</label>
                    <textarea class="form-control" id="description" rows="3" v-model="newAnnouncement.description" placeholder="Enter description" style="height: 250px;"></textarea>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Attachment:</label>
                    <div class="input-group">
                      <input type="file" class="form-control" accept=".pdf, .jpg" @change="handleFileUpload">
                    </div>
                    <span>Support pdf and jpg</span>
                  </div>
                </form>
              </div>

              <div class="col-md-5">
                <div class="mb-3">
                  <input type="checkbox" id="schedulePost" v-model="newAnnouncement.isScheduled">
                  <label for="schedulePost" class="form-label">Schedule Post</label>
                  <div class="d-flex gap-2">
                    <input type="date" class="form-control" v-model="newAnnouncement.scheduleDate" :disabled="!newAnnouncement.isScheduled">
                    <input type="time" class="form-control" v-model="newAnnouncement.scheduleTime" :disabled="!newAnnouncement.isScheduled">
                  </div>
                </div>

                <div class="mb-3">
                  <input type="checkbox" id="availableFor" v-model="newAnnouncement.hasAvailability">
                  <label for="availableFor" class="form-label">Available for</label>
                  <input type="text" class="form-control" v-model="newAnnouncement.department" placeholder="Department" :disabled="!newAnnouncement.hasAvailability">
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
      <div class="modal-dialog" style="max-width: 800px; border-radius: 20px;">
        <div class="modal-content" style="border-radius: 20px;">
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
              <iframe :src="selectedAnnouncement.attachment" width="100%" height="400px" style="border: none;"></iframe>
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
        <div class="modal_small">
          <div class="modal-content d-flex flex-column h-100" style="padding: 2em;">
            <div class="flex-grow-1">
              <h3 class="mb-3">Are you sure?</h3>
              <p class="text-muted">This action cannot be undone. This will permanently delete the announcement.</p>
            </div>
            <div class="modal-buttons d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary" @click="closeDeleteModal">Cancel</button>
              <button type="button" class="btn btn-success" @click="deleteAnnouncement">Confirm Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  
</template>

<script>
import { ref, computed } from 'vue'
import { Modal } from 'bootstrap'

export default {
  name: 'notification-center',
  setup() {
    const searchQuery = ref('')
    const announcements = ref([
      {
        id: 1,
        title: 'Welcome to new website',
        description: "We're excited to launch our new announcement center. Stay tuned for important updates!",
        author: 'HR Chloe',
        datetime: '18/10/2024 12 p.m.',
        attachment: '1701exercise1.pdf'
      }
    ])

    const newAnnouncement = ref({
      title: '',
      description: '',
      isScheduled: false,
      scheduleDate: '',
      scheduleTime: '',
      hasAvailability: false,
      department: '',
      attachment: null
    })

    const selectedAnnouncement = ref({})
    const newAnnouncementModal = ref(null)
    const viewModal = ref(null)
    const deleteModal = ref(null)
    let modalInstances = {}

    const filteredAnnouncements = computed(() => {
      return announcements.value.filter(announcement => 
        announcement.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        announcement.description.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })

    const initializeModals = () => {
      modalInstances.new = new Modal(newAnnouncementModal.value)
      modalInstances.view = new Modal(viewModal.value)
      modalInstances.delete = new Modal(deleteModal.value)
    }

    const openNewAnnouncementModal = () => {
      modalInstances.new.show()
    }

    const closeNewAnnouncementModal = () => {
      modalInstances.new.hide()
      resetNewAnnouncement()
    }

    const submitNewAnnouncement = () => {
      announcements.value.push({
        id: announcements.value.length + 1,
        ...newAnnouncement.value,
        author: 'Current User',
        datetime: new Date().toLocaleString()
      })
      closeNewAnnouncementModal()
    }

    const viewAnnouncement = (announcement) => {
      selectedAnnouncement.value = announcement
      modalInstances.view.show()
    }

    const closeViewModal = () => {
      modalInstances.view.hide()
    }

    const confirmDelete = (announcement) => {
      selectedAnnouncement.value = announcement
      modalInstances.delete.show()
    }

    const deleteAnnouncement = () => {
      announcements.value = announcements.value.filter(a => a.id !== selectedAnnouncement.value.id)
      modalInstances.delete.hide()
    }

    const closeDeleteModal = () => {
      modalInstances.delete.hide()
    }

    const resetNewAnnouncement = () => {
      newAnnouncement.value = {
        title: '',
        description: '',
        isScheduled: false,
        scheduleDate: '',
        scheduleTime: '',
        hasAvailability: false,
        department: '',
        attachment: null
      }
    }

    const handleFileUpload = (event) => {
      newAnnouncement.value.attachment = event.target.files[0]
    }

    return {
      searchQuery,
      announcements,
      newAnnouncement,
      selectedAnnouncement,
      filteredAnnouncements,
      newAnnouncementModal,
      viewModal,
      deleteModal,
      openNewAnnouncementModal,
      closeNewAnnouncementModal,
      submitNewAnnouncement,
      viewAnnouncement,
      closeViewModal,
      confirmDelete,
      deleteAnnouncement,
      closeDeleteModal,
      handleFileUpload,
      initializeModals
    }
  },
  mounted() {
    this.initializeModals()
  }
}
</script>

<style scoped>
.search-container {
    position: relative;
    margin-bottom: 2rem;
}

.search-container input {
    padding-left: 40px;
}

.search-container i {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
}

.announcement-card {
    border: 1px solid #ddd;
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 4px;
}

.form-container {
    display: flex;
    gap: 30px;
}

.btn-action {
    padding: 0.25rem 1rem;
    margin-left: 0.5rem;
}

.pagination {
    justify-content: center;
    margin-top: 2rem;
}

.footer-links {
    display: flex;
    gap: 1rem;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.footer-links a {
    color: white;
    text-decoration: none;
    font-size: 0.9rem;
}

.content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    color: #666;
}



/* Specifically target the announcement modal */
#viewAnnouncementModal .modal-dialog {
    max-width: 800px !important;
    margin: 1.75rem auto;
}

#viewAnnouncementModal .modal-content {
    border-radius: 20px !important;
    border: none;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

/* Modal Header Styles */
#viewAnnouncementModal .modal-header {
    border-bottom: 1px solid #dee2e6;
    padding: 1rem 1.5rem;
    background-color: #fff;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
}

#viewAnnouncementModal .modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #000;
}

#viewAnnouncementModal .btn-close {
    padding: 1rem;
}

/* Modal Body Styles */
#viewAnnouncementModal .modal-body {
    padding: 1.5rem;
    background-color: #fff;
}

#viewAnnouncementModal .modal-body p {
    margin-bottom: 1rem;
    color: #333;
}

#viewAnnouncementModal .modal-body h6 {
    margin: 1.5rem 0;
    font-size: 1rem;
}

/* Description Box Styles */
#viewAnnouncementModal .border.p-3.rounded {
    background-color: #f8f9fa !important;
    border: 1px solid #dee2e6 !important;
    margin: 1rem 0;
    padding: 1.5rem !important;
}

/* PDF Viewer Container */
#viewAnnouncementModal .mt-3 {
    margin-top: 2rem !important;
    background-color: #e9ecef;
    padding: 1rem;
    border-radius: 8px;
}

#viewAnnouncementModal iframe {
    width: 100%;
    height: 400px;
    border: none;
    background-color: #fff;
    border-radius: 4px;
}

/* Modal Footer Styles */
#viewAnnouncementModal .modal-footer {
    border-top: 1px solid #dee2e6;
    padding: 1rem 1.5rem;
    background-color: #fff;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
}

/* Text Styles specific to announcement modal */
#viewAnnouncementModal .text-center {
    text-align: center !important;
}

#viewAnnouncementModal .text-end {
    text-align: right !important;
}

#viewAnnouncementModal .fw-bold {
    font-weight: 600 !important;
}
</style>