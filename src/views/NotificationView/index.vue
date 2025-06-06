<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import {Modal} from 'bootstrap';
import { getAnnouncements, bulkMarkAsRead } from '@/api/announcement'
import confetti from 'canvas-confetti'

function triggerConfetti() {
  const duration = 2 * 1000;
  const animationEnd = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  })();
}


const searchQuery = ref('');
const announcements = ref([]);

//pagination
const currentPage = ref(1)
const totalCount = ref(0)
const pageSize = 10

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))

function changePage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchAnnouncements(page)
  }
}



onMounted(() => {
  fetchAnnouncements()
})

function fetchAnnouncements(page = 1) {
  currentPage.value = page

  getAnnouncements(page, searchQuery.value)
    .then(res => {
      announcements.value = res.data.data.results.map(a => ({
        ...a,
        read: a.read  
      }))
      totalCount.value = res.data.data.count
    })
    .catch(err => console.error('Fetch failed:', err))
}

const selectedAnnouncement = ref<any>({});

const isBirthdayAnnouncement = computed(() => {
  return selectedAnnouncement.value?.birthday_person !== undefined && selectedAnnouncement.value?.birthday_person !== null;
});


const viewModal = ref(null);
let modalInstance:any = null;

const filteredAnnouncements = computed(() => {
  return announcements.value.filter(announcement =>
      announcement.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      announcement.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

function viewAnnouncement(announcement) {
  selectedAnnouncement.value = { ...announcement };

  if (announcement.linked_files) {
    selectedAnnouncement.value.attachments = announcement.linked_files.map(link => ({
      id: link.id,
      name: link.filename || 'Unnamed File',
      url: link.url
    }));
  } else {
    selectedAnnouncement.value.attachments = [];
  }

  markAsRead(announcement);
  modalInstance.show();

  if (isBirthdayAnnouncement.value) {
    triggerConfetti();
  }
console.log(
  "🎯 Full birthday image URL:",
  announcement.birthday_person?.picture_url
    ? `http://localhost:8000${announcement.birthday_person.picture_url}`
    : '/img/default-profile.png'
)
const resolvedProfileUrl = computed(() => {
  const path = selectedAnnouncement.value.birthday_person?.picture_url;
  return path ? `http://localhost:8000${path}` : '/img/default-profile.png';
});

}


function markAsRead(announcement) {
  if (!announcement.read) {
    bulkMarkAsRead([announcement.id])
      .then(() => {
        fetchAnnouncements(currentPage.value)  // refresh to get accurate `read` status
      })
      .catch(err => console.error('Mark as read failed:', err))
  }
}


function markAllAsRead() {
  const unreadIds = announcements.value
    .filter(a => !a.read)
    .map(a => a.id)
    
  if (unreadIds.length === 0) {
    console.log("All announcements are already read. Skipping API call.");
    return;
  }

  bulkMarkAsRead(unreadIds)
    .then(() => {
      announcements.value.forEach(a => (a.read = true))
    })
    .catch(err => console.error('Mark all as read failed:', err))
}

const closeViewModal = () => {
  modalInstance.hide();
};



function formatDate(datetime: string | null | undefined, dateOnly = false): string {
  if (!datetime) return 'N/A';
  const date = new Date(datetime);
  if (isNaN(date.getTime())) return 'N/A';

  return dateOnly ? date.toLocaleDateString() : date.toLocaleString();
}


onMounted(() => {
  if (viewModal.value) modalInstance = new Modal(viewModal.value);
});

</script>


<script lang="ts">
  export default {
    name: 'NotificationView',
  }


</script>


<template>
  <div class="main-content">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Current Announcement</h2>
    </div>

    <!-- Search & Mark All as Read -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="search-container">
        <i class="fas fa-search search-icon"></i>
        <input v-model="searchQuery" type="text" class="search-input" placeholder="Search"/>
      </div>
      <button class="mark-all-btn" @click="markAllAsRead">
        ✔ Mark all as read
      </button>
    </div>

    <!-- Announcement List -->
    <div class="announcement-list">
      <div
          v-for="announcement in filteredAnnouncements"
          :key="announcement.id"
          class="announcement-card"
      >
        <!-- Status Indicator (Hidden when read) -->
        <div v-if="!announcement.read" class="status-indicator unread"></div>

        <!-- Announcement Content -->
        <div class="announcement-content" @click="viewAnnouncement(announcement)">
          <strong class="announcement-title">{{ announcement.title }}</strong>
          <p class="announcement-description">
            {{
              announcement.description.length > 50
                  ? announcement.description.substring(0, 50) + '...'
                  : announcement.description
            }}
          </p>
        </div>

        <!-- Date-Time & Mark as Read Button -->
        <div class="announcement-actions">
          <span class="announcement-date">{{ formatDate(announcement.post_time) }}</span>        </div>
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


    <!-- View Announcement Modal -->
    <div class="modal fade" id="viewAnnouncementModal" ref="viewModal">
      <div class="modal-dialog" style="max-width: 800px; border-radius: 20px;">
        <div class="modal-content" style="border-radius: 20px;">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedAnnouncement.title }}</h5>
            <button type="button" class="btn-close" @click="closeViewModal"></button>
          </div>

          <!-- 🎉 Birthday Announcement Layout -->
          <div v-if="isBirthdayAnnouncement" class="modal-body text-center birthday-layout">
            <div class="gift-icon">🎁</div>

             <img
                :src="selectedAnnouncement.birthday_person?.picture_url 
                  ? `http://localhost:8000${selectedAnnouncement.birthday_person.picture_url}` 
                  : '/img/default-profile.png'"
                alt="Profile Picture"
                class="birthday-profile-img"
              />

            <h3 class="birthday-title">
              It's {{ selectedAnnouncement.birthday_person?.staffName }}'s Birthday
            </h3>

            <p class="text-muted small">
              by {{ selectedAnnouncement.author }} at {{ formatDate(selectedAnnouncement.post_time) }}
            </p>

            <h6 class="fw-bold mt-3">Description</h6>

            <div class="birthday-description-box">
              <p>{{ selectedAnnouncement.description }}</p>
              <p>🎂 <strong>Birthday:</strong> {{ formatDate(selectedAnnouncement.birthday_person?.date_of_birth, true) }}</p>
              <p>🏢 <strong>Department:</strong> {{ selectedAnnouncement.birthday_person?.department_name || 'N/A' }}</p>
              <p class="text-end">Best Regards<br>HR Team</p>
            </div>

            <div v-if="selectedAnnouncement.attachments?.length" class="mt-4 px-3">
              <h5 class="fw-bold mb-3">📎 Attachments</h5>
              <div v-for="(file, index) in selectedAnnouncement.attachments" :key="file.id" class="mb-4">
                <p class="mb-2">📄 {{ file.name }}</p>
                <iframe
                  v-if="file.url?.endsWith('.pdf')"
                  :src="file.url"
                  style="width: 100%; height: 400px; border: 1px solid #ddd; border-radius: 6px;"
                ></iframe>
            


                <!-- <p v-else class="text-muted">Unsupported file type</p> -->
              </div>
            </div>
          </div>

          <!-- 📰 Normal Announcement Layout -->
          <div v-else class="modal-body text-center">
            <p><strong>by {{ selectedAnnouncement.author }} {{ formatDate(selectedAnnouncement.post_time) }}</strong></p>
            <h6 class="fw-bold">Description</h6>
            <div class="border p-3 rounded">
              <p>{{ selectedAnnouncement.description }}</p>
              <p class="text-end">Best Regards<br>HR Team</p>
            </div>

            <div v-if="selectedAnnouncement.attachments?.length" class="mt-4 px-3">
              <h5 class="fw-bold mb-3">📎 Attachments</h5>
              <div v-for="(file, index) in selectedAnnouncement.attachments" :key="file.id" class="mb-4">
                <p class="mb-2">📄 {{ file.name }}</p>
                <iframe
                  v-if="file.url?.endsWith('.pdf')"
                  :src="file.url"
                  style="width: 100%; height: 400px; border: 1px solid #ddd; border-radius: 6px;"
                ></iframe>
                <img
                  v-else-if="/\.(jpg|jpeg|png)$/i.test(file.url)"
                  :src="file.url"
                  class="img-fluid border rounded"
                  style="max-height: 300px;"
                />
                <p v-else class="text-muted">Unsupported file type</p>
              </div>
            </div>
          </div>


          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeViewModal">Close</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

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

/* Mark All as Read Button */
.mark-all-btn {
  background: #ccc;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
  border: none;
}

.mark-all-btn:hover {
  background: #b5b5b5;
}

/* Announcement List */
.announcement-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.announcement-card {
  display: flex;
  align-items: center;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  justify-content: space-between;
}

/* Status Indicator (Hidden when read) */
.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.unread {
  background-color: #FF6F61;
  margin-right: 10px;
}

/* Announcement Content */
.announcement-content {
  flex-grow: 1;
  cursor: pointer;
}

.announcement-title {
  font-size: 16px;
  font-weight: bold;
}

.announcement-description {
  font-size: 14px;
  color: #555;
}

/* Date and Mark as Read Button */
.announcement-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.announcement-date {
  font-size: 14px;
  color: #888;
  text-align: right;
}

/* --- Responsive Adjustments --- */

/* On small screens, stack the search bar & button, and let announcement cards wrap more naturally */
@media (max-width: 576px) {
  .d-flex.justify-content-between.align-items-center.mb-3 {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .search-container {
    width: 100%;
  }

  .mark-all-btn {
    width: 100%;
  }

  /* Let each announcement card stack its content for small screens */
  .announcement-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .announcement-actions {
    align-self: flex-end; 
  }
}

.birthday-profile-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid #eee;
  margin-bottom: 12px;
}

.gift-icon {
  font-size: 28px;
  margin-bottom: 12px;
  color: #f67280;
}

.birthday-description-box {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
  background-color: #f9f9f9;
  margin-top: 16px;
  font-family: Georgia, serif;
  line-height: 1.6;
  text-align: left;
}


</style>
