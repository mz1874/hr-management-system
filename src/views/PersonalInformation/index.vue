<template>
  <div class="container py-4">
    <div class="page-header mb-4">
      <h2 class="mb-1">Personal Information</h2>
      <p class="text-muted">Manage your personal information</p>
    </div>
    
    <div class="card">
      <div class="card-body">
        <form @submit.prevent="saveChanges">
          <div class="section-title">Basic Information</div>
          <div class="row g-4">
            <div class="col-md-4">
              <div class="form-floating">
                <input type="text" class="form-control" v-model="userInfo.username" required id="username">
                <label for="username">Username</label>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-floating">
                <input type="email" class="form-control" v-model="userInfo.email" required id="email">
                <label for="email">Email</label>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-floating">
                <input type="tel" class="form-control" v-model="userInfo.phone" id="phone">
                <label for="phone">Phone Number</label>
              </div>
            </div>
          </div>

          <div class="section-title mt-5">Work Information</div>
          <div class="row g-4">
            <div class="col-md-4">
              <div class="form-floating">
                <input type="text" class="form-control" v-model="userInfo.department" readonly id="department">
                <label for="department">Department</label>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-floating">
                <input type="text" class="form-control" v-model="userInfo.position" readonly id="position">
                <label for="position">Position</label>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-floating">
                <input type="text" class="form-control" v-model="userInfo.employeeId" readonly id="employeeId">
                <label for="employeeId">Employee ID</label>
              </div>
            </div>
          </div>

          <div class="section-title mt-5">Change Password</div>
          <div class="row g-4 password-section">
            <div class="col-md-4">
              <div class="form-floating">
                <input type="password" class="form-control" v-model="passwords.current" id="currentPassword">
                <label for="currentPassword">Current Password</label>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-floating">
                <input type="password" class="form-control" v-model="passwords.new" id="newPassword">
                <label for="newPassword">New Password</label>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-floating">
                <input type="password" class="form-control" v-model="passwords.confirm" id="confirmPassword">
                <label for="confirmPassword">Confirm Password</label>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end mt-5">
            <button type="button" class="btn btn-outline-secondary me-2">Cancel</button>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save me-2"></i>Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const userInfo = ref({
  username: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  department: 'IT Department',
  position: 'Software Engineer',
  employeeId: 'EMP001',
  avatar: ''
});

const passwords = ref({
  current: '',
  new: '',
  confirm: ''
});

const saveChanges = () => {
  if (passwords.value.new !== passwords.value.confirm) {
    alert('New passwords do not match!');
    return;
  }
  // Here you would typically make an API call to update the user information
  alert('Changes saved successfully!');
};
</script>

<style scoped>
.card {
  box-shadow: 0 0 20px rgba(0,0,0,0.05);
  border: none;
  border-radius: 12px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #344767;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #eee;
}

.form-floating {
  margin-bottom: 0.5rem;
}

.form-control {
  border: 1px solid #e9ecef;
  padding: 0.75rem;
}

.form-control:focus {
  border-color: #5e72e4;
  box-shadow: 0 0 0 0.2rem rgba(94,114,228,0.15);
}

.avatar-upload {
  position: relative;
  max-width: 200px;
  margin: 0 auto;
}

.avatar-preview {
  width: 150px;
  height: 150px;
  position: relative;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0,0,0,0.05);
  margin-bottom: 1rem;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.password-section {
  background-color: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  margin: 0;
}

.page-header p {
  font-size: 0.9rem;
}

.btn-primary {
  background-color: #5e72e4;
  border-color: #5e72e4;
}

.btn-primary:hover {
  background-color: #4860db;
  border-color: #4860db;
}
</style>
