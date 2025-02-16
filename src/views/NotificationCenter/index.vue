<template>
  <div class="main-content">
    <!-- Main Content Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Current Announcement</h2>
      <!-- <button class="btn btn-success" @click="openNewAnnouncementModal">New Announcement</button> -->
    </div>

    <!-- Search and New Announcement Button Row -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <!-- Search Input -->
      <div class="search-container">
        <i class="fas fa-search search-icon"></i>
        <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Search"
        >
      </div>

      <!-- New Announcement Button -->
      <button class="btn btn-success new-announcement-btn" @click="openNewAnnouncementModal">
        New Announcement
      </button>
    </div>


    <!-- Announcement Cards -->
    <div class="announcement-card d-flex align-items-center" v-for="announcement in filteredAnnouncements"
         :key="announcement.id">
      <!-- Status Indicator -->
      <div :class="['status-indicator', announcement.posted ? 'posted' : 'not-posted']"></div>

      <!-- Announcement Content -->
      <div class="flex-grow-1">
        <h5>{{ announcement.title }}</h5>
        <p class="mb-0">{{ announcement.description }}</p>
      </div>

      <!-- Action Buttons -->
      <div>
        <button class="btn btn-primary btn-action" @click="viewAnnouncement(announcement)">View</button>
        <button class="btn btn-warning btn-action" @click="editAnnouncement(announcement)">Edit</button>
        <button class="btn btn-danger btn-action" @click="confirmDelete(announcement)">Delete</button>
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
                    <span>Support pdf and jpg</span>
                  </div>
                </form>
              </div>

              <div class="col-md-5">
                <div class="mb-3">
                  <input type="checkbox" id="schedulePost" v-model="newAnnouncement.isScheduled">
                  <label for="schedulePost" class="form-label">Schedule Post</label>
                  <div class="d-flex gap-2">
                    <input type="date" class="form-control" v-model="newAnnouncement.scheduleDate"
                           :disabled="!newAnnouncement.isScheduled">
                    <input type="time" class="form-control" v-model="newAnnouncement.scheduleTime"
                           :disabled="!newAnnouncement.isScheduled">
                  </div>
                </div>

                <div class="mb-3">
                  <input type="checkbox" id="availableFor" v-model="newAnnouncement.hasAvailability">
                  <label for="availableFor" class="form-label">Available for</label>
                  <input type="text" class="form-control" v-model="newAnnouncement.department" placeholder="Department"
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

    <!-- todo add edit announcement modal -->
    <div class="modal fade" id="editAnnouncementModal" :ref="editAnnouncementModal" tabindex="-1"
         aria-labelledby="editAnnouncementModal" aria-hidden="true" v-if="showModal">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editAnnouncement">Edit Announcement</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                    @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <!-- Left Column - Announcement Details -->
              <div class="col-md-7 border-end">
                <form>
                  <!-- Title -->
                  <div class="mb-3">
                    <label for="editTitle" class="form-label">Title:</label>
                    <input type="text" class="form-control" v-model="announcement.title" placeholder="Enter title">
                  </div>

                  <!-- Description -->
                  <div class="mb-3">
                    <label for="editDescription" class="form-label">Description:</label>
                    <textarea class="form-control" v-model="announcement.description" rows="3"
                              placeholder="Enter description" style="height: 250px;"></textarea>
                  </div>

                  <!-- Attachment -->
                  <div class="mb-3">
                    <label class="form-label">Attachment:</label>
                    <div class="input-group">
                      <input type="file" class="form-control" accept=".pdf, .jpg" @change="handleFileUpload">
                    </div>
                    <span>Support pdf and jpg</span>
                  </div>
                </form>
              </div>

              <!-- Right Column - Schedule and Availability -->
              <div class="col-md-5">
                <!-- Schedule Post -->
                <div class="mb-3">
                  <input type="checkbox" id="editSchedulePost" v-model="schedulePost" :disabled="true">
                  <label for="editSchedulePost" class="form-label">Schedule Post</label>
                  <div class="d-flex gap-2">
                    <input type="date" class="form-control" v-model="postDate" :disabled="!schedulePost">
                    <input type="time" class="form-control" v-model="postTime" :disabled="!schedulePost">
                  </div>
                </div>

                <!-- Available For -->
                <div class="mb-3">
                  <input type="checkbox" id="editAvailableFor" v-model="availableFor">
                  <label for="editAvailableFor" class="form-label">Available for</label>
                  <input type="text" class="form-control" v-model="department" placeholder="Department"
                         :disabled="!availableFor">
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="closeModal">Close</button>
            <button type="button" class="btn btn-success" @click="submitAnnouncement">Submit</button>
          </div>
        </div>
      </div>
    </div>

  </div>


</template>

<script>
// todo add script for edit announcement
import {ref, computed} from 'vue'
import {Modal} from 'bootstrap'

export default {
  name: 'notification-center',
  setup() {

    const editAnnouncementModal = ref();
    const showModal = ref(false);

    const searchQuery = ref('')
    const announcements = ref([
      {
        id: 1,
        title: 'Welcome to new website',
        description: "We're excited to launch our new announcement center. Stay tuned for important updates!",
        author: 'HR Chloe',
        datetime: '18/10/2024 12 p.m.',
        attachment: '1701exercise1.pdf',
        posted: true  // This announcement is posted
      },
      {
        id: 2,
        title: 'Upcoming Maintenance',
        description: "Scheduled maintenance will take place this weekend. Expect some downtime.",
        author: 'Admin Team',
        datetime: '20/10/2024 5 p.m.',
        posted: false  // This one is NOT posted
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

    const togglePostedStatus = (announcement) => {
      announcement.isPosted = !announcement.isPosted;
    };

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

    function editAnnouncement() {
      modalInstances.view.show()
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
      togglePostedStatus,
      selectedAnnouncement,
      filteredAnnouncements,
      newAnnouncementModal,
      viewModal,
      deleteModal,
      showModal,
      openNewAnnouncementModal,
      closeNewAnnouncementModal,
      submitNewAnnouncement,
      viewAnnouncement,
      editAnnouncement,
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
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 8px 12px;
  width: 80%;
  position: relative;
}

.search-icon {
  font-size: 16px;
  color: #555;
  margin-right: 10px;
}

.search-input {
  border: none;
  outline: none;
  flex-grow: 1;
  font-size: 16px;
}

.new-announcement-btn {
  width: 15%;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: 0.3s;
}

.new-announcement-btn:hover {
  background-color: #799c7b;
}


.announcement-card {
  border: 1px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.status-indicator {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  margin-right: 20px;
}

.posted {
  background-color: green;
}

.not-posted {
  background-color: gray;
}


.form-container {
  display: flex;
  gap: 30px;
}

.btn-action {
  padding: 0.25rem 1rem;
  margin-left: 0.5rem;
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

/* Center align the modal header title */
#viewAnnouncementModal .modal-header {
  text-align: center;
  display: flex;
  justify-content: center;
}

#viewAnnouncementModal .modal-title {
  margin: 0 auto;
  text-align: center;
  flex-grow: 1;
}


#viewAnnouncementModal .modal-content {
  border-radius: 20px !important;
  border: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

#viewAnnouncementModal .modal-dialog {
  max-width: 800px !important;
  margin: 1.75rem auto;
}

#viewAnnouncementModal .modal-content {
  border-radius: 20px !important;
  border: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

#viewAnnouncementModal .modal-header {
  border-radius: 20px !important;
  border: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* Make the modal body scrollable */
#viewAnnouncementModal .modal-body {
  max-height: 800px; /* Adjust height as needed */
  overflow-y: auto;
  padding: 1.5rem;
  background-color: #fff;
}

/* Optional: Make the attachment viewer fixed */
#viewAnnouncementModal .mt-3 {
  background-color: #e9ecef;
  padding: 1rem;
  border-radius: 8px;
}

/* Ensure the iframe doesn't take too much space */
#viewAnnouncementModal iframe {
  width: 100%;
  height: 300px;
  border: none;
  background-color: #fff;
  border-radius: 4px;
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
