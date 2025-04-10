<template>
  <div class="main-content container-fluid px-3 px-md-4">
    <!-- Main Content Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="h3">Current Announcement</h2>
    </div>

    <!-- Search and New Announcement Button Row -->
    <div class="announcement-toolbar d-flex flex-wrap align-items-center gap-3 mb-4">
      <!-- Search Input -->
      <div class="search-container flex-grow-1">
        <i class="fas fa-search search-icon"></i>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search"
        />
      </div>

      <!-- Buttons -->
      <div class="d-flex gap-2">
        <button
          class="btn new-announcement-btn"
          @click="openNewAnnouncementModal"
        >
          New Announcement
        </button>
        <button
          class="btn bulk-delete-btn"
          :disabled="selectedIds.length === 0"
          @click="bulkDeleteAnnouncements"
        >
          Delete<br />Selected ({{ selectedIds.length }})
        </button>
      </div>
    </div>


    <!-- Announcement Cards -->
    <div
      class="announcement-card"
      v-for="announcement in filteredAnnouncements"
      :key="announcement.id"
    >
      <div
        class="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3"
      >

      <input
        type="checkbox"
        v-model="selectedIds"
        :value="announcement.id"
      />
        <!-- Status Indicator -->
        <div
          :class="[
            'status-indicator',
            new Date(announcement.post_time) <= new Date() ? 'posted' : 'not-posted'
          ]"

        ></div>

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
          <button
            class="btn btn-primary btn-action"
            @click="viewAnnouncement(announcement)"
          >
            View
          </button>
          <button
            class="btn btn-warning btn-action"
            @click="editAnnouncement(announcement)"
          >
            Edit
          </button>
          <button
            class="btn btn-danger btn-action"
            @click="confirmDelete(announcement)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>



    <div class="d-flex align-items-center gap-3 my-3">
      <div class="text-muted fs-5">
        Total Announcements: {{ totalCount }}
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


    <!-- New Announcement Modal -->
    <div class="modal fade" id="newAnnouncement" ref="newAnnouncementModal">
      <div class="modal-dialog modal-xl modal-fullscreen-sm-down">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">New Announcement</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeNewAnnouncementModal"
            ></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-12 col-md-7 border-end-md">
                <form @submit.prevent="submitNewAnnouncement">
                  <div class="mb-3">
                    <label for="title" class="form-label">Title:</label>
                    <input
                      type="text"
                      class="form-control"
                      id="title"
                      v-model="newAnnouncement.title"
                      placeholder="Enter title"
                    />
                  </div>

                  <div class="mb-3">
                    <label for="description" class="form-label"
                      >Description:</label
                    >
                    <textarea
                      class="form-control"
                      id="description"
                      rows="3"
                      v-model="newAnnouncement.description"
                      placeholder="Enter description"
                      style="height: 250px;"
                    ></textarea>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Attachment:</label>
                    <div class="input-group">
                      <!-- We add a ref to reset the file input later -->
                      <input
                        ref="newFileInput"
                        type="file"
                        class="form-control"
                        accept=".pdf, .jpg"
                        multiple
                        @change="handleFileUpload"
                      />

                    </div>
                    <span class="form-text">Support pdf and jpg</span>
                  </div>
                </form>
              </div>

              <div class="col-12 col-md-5">
                <div class="mb-3">
                  <div class="form-check">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      id="schedulePost"
                      v-model="newAnnouncement.isScheduled"
                    />
                    <label class="form-check-label" for="schedulePost"
                      >Schedule Post</label
                    >
                  </div>
                  <div class="d-flex gap-2 mt-2">
                    <input
                      type="date"
                      class="form-control"
                      v-model="newAnnouncement.scheduleDate"
                      :disabled="!newAnnouncement.isScheduled"
                    />
                    <input
                      type="time"
                      class="form-control"
                      v-model="newAnnouncement.scheduleTime"
                      :disabled="!newAnnouncement.isScheduled"
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <div class="form-check">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      id="availableFor"
                      v-model="newAnnouncement.hasAvailability"
                    />
                    <label class="form-check-label" for="availableFor"
                      >Available for</label
                    >
                  </div>
                  <input
                    type="text"
                    class="form-control mt-2"
                    v-model="newAnnouncement.department"
                    placeholder="Department"
                    :disabled="!newAnnouncement.hasAvailability"
                  />

                  <div v-if="newAnnouncement.attachment" class="mt-3">
                    <h6>PDF Preview (Unsubmitted):</h6>
                    <iframe
                      :src="newAnnouncement.attachment"
                      style="width:100%; height:300px;"
                      frameborder="0"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeNewAnnouncementModal"
            >
              Close
            </button>
            <button
              type="button"
              class="btn btn-success"
              @click="submitNewAnnouncement"
            >
              Submit
            </button>
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
            <p>
              <strong>
                by {{ selectedAnnouncement.author }}  {{ formattedDateTime }}
              </strong>
            </p>
            <h6 class="fw-bold">Description</h6>
            <div class="border p-3 rounded">
              <p>{{ selectedAnnouncement.description }}</p>
              <p class="text-end">Best Regards<br />HR Team</p>
            </div>

            <!-- Show PDF or image if there is an attachment -->
            <div class="mt-3" v-if="selectedAnnouncement.attachment">
              <!-- Option 1: IFRAME for PDF -->
              <iframe
                :src="selectedAnnouncement.attachment"
                class="attachment-preview"
                frameborder="0"
              >
              </iframe>

            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeViewModal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteConfirmModal" ref="deleteModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border-radius: 16px;">
          <div class="modal-body p-4">
            <div class="mb-4">
              <h3 class="mb-3" style="font-size: 2rem; font-weight: 500;">
                Are you sure?
              </h3>
              <p class="text-muted" style="color: #6B7280;">
                This action cannot be undone. This will permanently delete the
                announcement.
              </p>
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
                    <input
                      type="text"
                      class="form-control"
                      id="editTitle"
                      v-model="selectedAnnouncement.title"
                      placeholder="Enter title"
                    />
                  </div>

                  <div class="mb-3">
                    <label for="editDescription" class="form-label"
                      >Description:</label
                    >
                    <textarea
                      class="form-control"
                      id="editDescription"
                      v-model="selectedAnnouncement.description"
                      placeholder="Enter description"
                      style="height: 250px;"
                    ></textarea>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Attachment:</label>
                    <div class="input-group">
                      <input
                        type="file"
                        class="form-control"
                        accept=".pdf, .jpg"
                        @change="handleFileUpload"
                      />
                    </div>
                    <span class="form-text">Support pdf and jpg</span>
                  </div>
                </form>
              </div>

              <div class="col-12 col-md-5">
                <div class="mb-3">
                  <div class="form-check">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      id="editSchedulePost"
                      v-model="selectedAnnouncement.isScheduled"
                    />
                    <label class="form-check-label" for="editSchedulePost"
                      >Schedule Post</label
                    >
                  </div>
                  <div class="d-flex gap-2 mt-2">
                    <input
                      type="date"
                      class="form-control"
                      v-model="selectedAnnouncement.scheduleDate"
                      :disabled="!selectedAnnouncement.isScheduled"
                    />
                    <input
                      type="time"
                      class="form-control"
                      v-model="selectedAnnouncement.scheduleTime"
                      :disabled="!selectedAnnouncement.isScheduled"
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <div class="form-check">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      id="editAvailableFor"
                      v-model="selectedAnnouncement.hasAvailability"
                    />
                    <label class="form-check-label" for="editAvailableFor"
                      >Available for</label
                    >
                  </div>
                  <input
                    type="text"
                    class="form-control mt-2"
                    v-model="selectedAnnouncement.department"
                    placeholder="Department"
                    :disabled="!selectedAnnouncement.hasAvailability"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              Close
            </button>
            <button
              type="button"
              class="btn btn-success"
              @click="submitAnnouncement"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

  <script setup lang="ts"> 
  import { ref, computed, onMounted } from 'vue'
  import { Modal } from 'bootstrap'
  import {
    createAnnouncement,
    getAnnouncements,
    updateAnnouncement,
    deleteAnnouncement as deleteAnnouncementAPI
  } from '@/api/announcement'
  import { uploadFile } from '@/api/file_upload'

  // ===================== State: Modal Elements =====================
  const newAnnouncementModal = ref(null)
  const viewModal = ref(null)
  const deleteModal = ref(null)
  const editModal = ref(null)

  // Modal instances (Bootstrap)
  const modalInstances = {} as {
    new: Modal; view: Modal; delete: Modal; edit: Modal;
  }

  onMounted(() => {
    modalInstances.new = new Modal(newAnnouncementModal.value as HTMLElement)
    modalInstances.view = new Modal(viewModal.value as HTMLElement)
    modalInstances.delete = new Modal(deleteModal.value as HTMLElement)
    modalInstances.edit = new Modal(editModal.value as HTMLElement)
  })

  // ===================== State: Announcements =====================
  const announcements = ref<any[]>([])
  const selectedIds = ref<number[]>([])
  const selectedAnnouncement = ref<any>({})
  const uploadedFileId = ref<number | null>(null)
  const searchQuery = ref('')

  // ===================== State: Pagination =====================
  const currentPage = ref(1)
  const pageSize = 10
  const totalCount = ref(0)
  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))

  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) fetchAnnouncements(page)
  }

  // ===================== Fetch Announcements =====================
  function fetchAnnouncements(page = 1) {
    currentPage.value = page
    getAnnouncements(page, searchQuery.value)
      .then(res => {
        const now = new Date()
        announcements.value = res.data.data.results.map(a => ({
          ...a,
          posted: new Date(a.post_time) <= now
        }))
        totalCount.value = res.data.data.count
      })
      .catch(err => console.error('Failed to fetch announcements:', err))
  }
  onMounted(fetchAnnouncements)

  // ===================== Computed =====================
  const filteredAnnouncements = computed(() => {
    return announcements.value.filter(a =>
      [a.title, a.description].join(' ').toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })

  const formattedDateTime = computed(() => {
    const postTime = selectedAnnouncement.value?.post_time
    return postTime ? new Date(postTime).toLocaleString() : ''
  })

  // ===================== Date Conversion =====================
  function combineLocalDateTimeToUTC(date: string, time: string): string {
    const [year, month, day] = date.split('-').map(Number)
    const [hour, minute] = time.split(':').map(Number)
    const localDate = new Date(year, month - 1, day, hour, minute)
    return new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000).toISOString()
  }

  // ===================== New Announcement =====================
  const newFileInput = ref<HTMLInputElement | null>(null)
  const newAnnouncement = ref({
    title: '',
    description: '',
    isScheduled: false,
    scheduleDate: '',
    scheduleTime: '',
    hasAvailability: false,
    department: '',
    attachment: null,
  })

  const resetNewAnnouncement = () => {
    newAnnouncement.value = {
      title: '', description: '', isScheduled: false,
      scheduleDate: '', scheduleTime: '',
      hasAvailability: false, department: '', attachment: null
    }
    if (newFileInput.value) newFileInput.value.value = ''
  }

  const submitNewAnnouncement = () => {
    const isScheduled = newAnnouncement.value.isScheduled;

    if (isScheduled) {
      const scheduleDateTime = new Date(`${newAnnouncement.value.scheduleDate}T${newAnnouncement.value.scheduleTime}`);
      const now = new Date();

      if (scheduleDateTime < now) {
        alert('⚠️ Scheduled post time cannot be in the past.');
        return;
      }
    }

    const payload = {
      title: newAnnouncement.value.title,
      description: newAnnouncement.value.description,
      file_ids: uploadedFileId.value ? [uploadedFileId.value] : [],
      ...(isScheduled
        ? {
            schedule_post_time: combineLocalDateTimeToUTC(newAnnouncement.value.scheduleDate, newAnnouncement.value.scheduleTime),
            post_time: combineLocalDateTimeToUTC(newAnnouncement.value.scheduleDate, newAnnouncement.value.scheduleTime)
          }
        : {
            post_time: new Date().toISOString()
          })
    };

    createAnnouncement(payload)
      .then(() => {
        fetchAnnouncements();
        closeNewAnnouncementModal();
      })
      .catch(err => {
        console.error('Failed to create announcement:', err.response?.data || err.message);
      });
  };

  // ===================== File Upload =====================
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const res = await uploadFile(file)
      uploadedFileId.value = res.data.id
      const fileUrl = URL.createObjectURL(file)
      if (selectedAnnouncement.value?.id) {
        selectedAnnouncement.value.attachment = fileUrl
      } else {
        newAnnouncement.value.attachment = fileUrl
      }
    } catch (err) {
      console.error('File upload failed:', err.response?.data || err.message)
    }
  }

  // ===================== Modal Controls =====================
  const openNewAnnouncementModal = () => modalInstances.new.show()
  const closeNewAnnouncementModal = () => { modalInstances.new.hide(); resetNewAnnouncement() }
  const viewAnnouncement = (announcement: any) => { selectedAnnouncement.value = announcement; modalInstances.view.show() }
  const closeViewModal = () => modalInstances.view.hide()
  const confirmDelete = (announcement: any) => { selectedAnnouncement.value = announcement; modalInstances.delete.show() }
  const closeDeleteModal = () => modalInstances.delete.hide()
  const editAnnouncement = (announcement) => {
    selectedAnnouncement.value = { ...announcement }
    if (announcement.schedule_post_time) {
      const dt = new Date(announcement.schedule_post_time)
      selectedAnnouncement.value.isScheduled = true
      selectedAnnouncement.value.scheduleDate = dt.toISOString().split('T')[0]
      selectedAnnouncement.value.scheduleTime = dt.toTimeString().slice(0, 5)
    } else {
      selectedAnnouncement.value.isScheduled = false
      selectedAnnouncement.value.scheduleDate = ''
      selectedAnnouncement.value.scheduleTime = ''
    }
    modalInstances.edit.show()
  }
  const closeModal = () => { modalInstances.edit.hide(); selectedAnnouncement.value = {} }

  // ===================== Edit Announcement =====================
  const submitAnnouncement = () => {
    const isScheduled = selectedAnnouncement.value.isScheduled;

    if (isScheduled) {
      const scheduleDateTime = new Date(`${selectedAnnouncement.value.scheduleDate}T${selectedAnnouncement.value.scheduleTime}`);
      const now = new Date();

      if (scheduleDateTime < now) {
        alert('⚠️ Scheduled post time cannot be in the past.');
        return;
      }
    }

    const payload = {
      title: selectedAnnouncement.value.title,
      description: selectedAnnouncement.value.description,
      ...(isScheduled
        ? {
            schedule_post_time: combineLocalDateTimeToUTC(selectedAnnouncement.value.scheduleDate, selectedAnnouncement.value.scheduleTime),
            post_time: combineLocalDateTimeToUTC(selectedAnnouncement.value.scheduleDate, selectedAnnouncement.value.scheduleTime)
          }
        : {
            schedule_post_time: null,
            post_time: new Date().toISOString()
          }),
      file_ids: [] // extend if needed
    };

    updateAnnouncement(selectedAnnouncement.value.id, payload)
      .then(() => {
        fetchAnnouncements();
        closeModal();
      })
      .catch(err => {
        console.error('Failed to update announcement:', err.response?.data || err.message);
      });
  };


  // ===================== Delete Logic =====================
  const deleteAnnouncement = () => {
    deleteAnnouncementAPI(selectedAnnouncement.value.id)
      .then(() => {
        fetchAnnouncements()
        closeDeleteModal()
      })
      .catch(err => console.error('Failed to delete announcement:', err.response?.data || err.message))
  }

  function bulkDeleteAnnouncements() {
    if (!confirm(`Delete ${selectedIds.value.length} announcements?`)) return
    Promise.all(selectedIds.value.map(id => deleteAnnouncementAPI(id)))
      .then(() => {
        selectedIds.value = []
        fetchAnnouncements()
      })
      .catch(err => console.error('Failed to delete some announcements:', err))
  }


</script>

<script lang="ts">
export default {
  name: 'NotificationCenter',
};
</script>

<style scoped>
/* Search Container */
.announcement-toolbar {
  display: flex;
  align-items: stretch;
  gap: 1rem;
}

.search-container {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 250px;
  height: 52px;
  flex-grow: 1;
}

.search-icon {
  font-size: 18px;
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

/* Make button height match search bar */
.new-announcement-btn,
.bulk-delete-btn {
  height: 52px;         /* Match height */
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border-radius: 8px;
  white-space: nowrap;
  font-weight: 500;
}

.new-announcement-btn {
  background-color: #68b866;
  color: white;
}

.bulk-delete-btn {
  background-color: #d66b6b;
  color: white;
}

.bulk-delete-btn:disabled {
  background-color: #ccc;
  color: white;
  cursor: not-allowed;
}



@media (max-width: 768px) {
  .new-announcement-btn {
    max-width: 100%;
  }
  
  .me-md-4 {
    margin-right: 0 !important;
  }
}

/* Announcement Cards */
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

/* Search and New Announcement Button Row */
.d-flex.flex-column.flex-md-row.justify-content-between.align-items-stretch.align-items-md-center.mb-3.gap-3 {
  flex-wrap: wrap;
  gap: 0.75rem;
}

.new-announcement-btn {
  background-color: #4CAF50;
  font-weight: 500;
}

.bulk-delete-btn {
  background-color: #D66B6B;
  font-weight: 500;
  white-space: nowrap;
}

/* Match height & padding for buttons */
.new-announcement-btn,
.bulk-delete-btn {
  padding: 10px 20px;
  font-size: 15px;
  border-radius: 8px;
  min-width: 160px;
}

@media (max-width: 768px) {
  .new-announcement-btn,
  .bulk-delete-btn {
    width: 100%;
    max-width: none;
  }
}

.pagination {
  display: flex;
  padding-left: 0;
  list-style: none;
  border-radius: 0.25rem;
}

.page-item {
  margin: 0 0.15rem;
}

.page-item .page-link {
  position: relative;
  display: block;
  padding: 0.5rem 0.75rem;
  color: #0d6efd;
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  text-decoration: none;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
}

.page-item.active .page-link {
  z-index: 1;
  color: #fff;
  background-color: #198754;
  border-color: #198754;
}


</style>