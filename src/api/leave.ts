import axios from './axios'

// leave request

// Submit a new leave request (User)
export function submitLeaveRequest(payload) {
  return axios.post('/api/leave-requests/', payload)
}

// Get leave requests (User sees own, HR sees all)
export function getLeaveRequests(page = 1, search = '') {
  const params = new URLSearchParams({ page: String(page), search })
  return axios.get(`/api/leave-requests/?${params}`)
}

// Cancel a leave request (User only if status is 'Pending')
export function cancelLeaveRequest(id) {
  return axios.post(`/api/leave-requests/${id}/cancel/`)
}

// Approve or reject a leave request (HR)
export function reviewLeaveRequest(id, payload) {
  return axios.patch(`/api/leave-requests/${id}/`, payload)
}

// Bulk approve or reject requests (HR utility)
export function bulkReviewLeaveRequests(ids = [], status, comment = '') {
  return Promise.all(ids.map(id =>
    reviewLeaveRequest(id, { status, review_comment: comment })
  ))
}

//leave type

// Get all leave types (for dropdown use)
export function getLeaveTypes() {
  return axios.get('/api/leave-types/')
}

// Create a new leave type (Only HR)
export function createLeaveType(payload) {
  return axios.post('/api/leave-types/', payload)
}
