import axios from './axios'

// Create a new announcement
export function createAnnouncement(payload) {
    return axios.post('/api/announcements/', payload)
}

export function getAnnouncements(page = 1, search = '', extraParams = {}) {
  const params = {
    page,
    ...(search ? { search } : {}),
    ...extraParams
  };
  return axios.get('/api/announcements/', { params });
}

// Get announcement detail
export function getAnnouncement(id) {
    return axios.get(`/api/announcements/${id}/`)
}

// Mark announcements as read (bulk)
export function bulkMarkAsRead(announcementIds) {
    return axios.post('/api/read-status/bulk_mark_as_read/', {
        announcement_ids: announcementIds
    })
}

// Get read status for current user
export function getReadStatuses() {
    return axios.get('/api/read-status/')
}

// Update a full announcement (PUT)
export function updateAnnouncement(id, payload) {
    return axios.put(`/api/announcements/${id}/`, payload)
}

// Update part of it (PATCH)
export function patchAnnouncement(id, payload) {
    return axios.patch(`/api/announcements/${id}/`, payload)
}

// src/api/announcement.js
export function deleteAnnouncement(id) {
    return axios.delete(`/api/announcements/${id}/`)
  }
  
