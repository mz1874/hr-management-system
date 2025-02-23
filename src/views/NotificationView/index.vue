  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import { Modal } from 'bootstrap';
  
  export default {
    name: 'NotificationView',
    setup() {
      const searchQuery = ref('');
      const announcements = ref([
        { id: 1, title: 'Welcome to new website', description: "We're excited to launch our new announcement center.", author: 'HR Chloe', datetime: '2024-01-19T12:00', attachment: '', read: false },
        { id: 2, title: "Upcoming Maintenance", description: "Scheduled maintenance will take place this weekend.", author: 'Admin Team', datetime: '2024-10-30T08:00', attachment: '', read: false },
      ]);
  
      const selectedAnnouncement = ref({});
      const viewModal = ref(null);
      let modalInstance = null;
  
      const filteredAnnouncements = computed(() => {
        return announcements.value.filter(announcement =>
          announcement.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          announcement.description.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
      });
  
      const viewAnnouncement = (announcement) => {
        // Mark as read when clicked
        announcement.read = true;
        announcements.value = [...announcements.value];
        
        selectedAnnouncement.value = announcement;
        modalInstance.show();
      };
  
      const markAsRead = (announcement) => {
        announcement.read = true;
        announcements.value = [...announcements.value];
      };
  
      const closeViewModal = () => {
        modalInstance.hide();
      };
  
      const markAllAsRead = () => {
        announcements.value.forEach(a => a.read = true);
        announcements.value = [...announcements.value];
      };
  
      const formatDate = (datetime) => {
        const date = new Date(datetime);
        return date.toLocaleDateString();
      };
  
      onMounted(() => {
        if (viewModal.value) modalInstance = new Modal(viewModal.value);
      });
  
      return {
        searchQuery,
        announcements,
        selectedAnnouncement,
        filteredAnnouncements,
        viewModal,
        viewAnnouncement,
        closeViewModal,
        markAsRead,
        markAllAsRead,
        formatDate,
      };
    },
  };
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
        <input v-model="searchQuery" type="text" class="search-input" placeholder="Search" />
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
            {{ announcement.description.length > 50 
              ? announcement.description.substring(0, 50) + '...' 
              : announcement.description 
            }}
          </p>
        </div>

        <!-- Date-Time & Mark as Read Button -->
        <div class="announcement-actions">
          <span class="announcement-date">{{ formatDate(announcement.datetime) }}</span>
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
            <p><strong>by {{ selectedAnnouncement.author }} {{ formatDate(selectedAnnouncement.datetime) }}</strong></p>
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
    align-self: flex-end; /* or flex-start if you prefer */
  }
}
</style>
