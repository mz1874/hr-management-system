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
          <div class="row g-4 align-items-start">
            <!-- 左侧：头像 -->
            <div class="col-md-3 text-center">
              <img
                  :src="previewImage || userInfo.avatarUrl || 'https://via.placeholder.com/150'"
                  alt="Image"
                  class="img-thumbnail mb-2"
                  style="width: 150px; height: 150px; object-fit: cover;"
              >
              <input
                  type="file"
                  accept="image/*"
                  @change="onAvatarChange"
                  class="form-control"
              >
              <p class="text-muted mt-2">Image</p>
            </div>

            <!-- 右侧：基本信息表单 -->
            <div class="col-md-9">
              <div class="row g-4">
                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="text" class="form-control" v-model="userInfo.username" disabled id="username">
                    <label for="username">Username</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="email" class="form-control" v-model="userInfo.email" required id="email">
                    <label for="email">Email</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="date" class="form-control" v-model="userInfo.dateOfBirthday" id="dateOfBirth" required>
                    <label for="dateOfBirth">Date of Birthday</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="text" class="form-control" v-model="userInfo.department" readonly id="department">
                    <label for="department">Department</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="text" class="form-control" v-model="userInfo.account" readonly id="account">
                    <label for="account">account</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="text" class="form-control" v-model="userInfo.totalPoint" readonly id="totalPoint">
                    <label for="totalPoint">totalPoint</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row g-4">
            <div class="col-12 d-flex justify-content-end">
              <button type="submit" class="btn btn-primary">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref,reactive, onMounted} from 'vue';

interface currentUserInfo {
  id: number;
  username: string;
  staffName: string;
  email: string;
  department: string;
  account: string;
  position: string | null;
  dateOfBirthday: string;
}

const userInfo = reactive<currentUserInfo>({
  id: 0,
  username: '',
  staffName: '',
  email: '',
  department: '',
  account: '',
  position: '',
  dateOfBirthday: ''
});


onMounted(()=>{
  //When user access to this page , check if currentUser is existed
 const storage =  localStorage.getItem("currentUser");
  if(storage != null)
  {
    let jsonObj = JSON.parse(storage);
    userInfo.id = jsonObj.id;
    userInfo.username = jsonObj.id;
    userInfo.email = jsonObj.email;
    userInfo.department = jsonObj.department;
    userInfo.account = jsonObj.username;
    userInfo.position = jsonObj.position || ''
    userInfo.dateOfBirthday = jsonObj.date_of_birth
  }
})


const previewImage = ref(null)

function onAvatarChange(event) {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    previewImage.value = null
  }
}

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
