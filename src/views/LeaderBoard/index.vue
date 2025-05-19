<template>
  <h1 class="mb-5">Leaderboard for {{ currentUserData.department }}</h1>
  
  <!-- Podium -->
  <div class="podium">
    <!-- Second Place -->
    <div class="podium-block rotate-left">
      <div v-if="tableData[1]">
        <i class="fa-solid fa-crown crown-second"></i>
        <div><img :src="tableData[1].imgUrl" :alt="tableData[1].staffName" /></div>
        <div class="name-size">{{ tableData[1].staffName }}</div>
        <div class="point-container">
          <div class="icon-container">
            <i class="fa-solid fa-circle border-circle-icon"></i>
            <i class="fa-solid fa-circle circle-icon"></i>
            <i class="fa-solid fa-star star-icon"></i>
          </div>
          <span class="point-size">{{ tableData[1].totalPoints }}</span>
        </div>
      </div>
      <div class="trapezoid-second"></div>
      <div class="rectangle-second">
        <p class="second-size">2</p>
      </div>
    </div>

    <!-- First Place (center) -->
    <div class="podium-block">
      <div v-if="tableData[0]">
        <i class="fa-solid fa-crown crown-first"></i>
        <div><img :src="tableData[0].imgUrl" :alt="tableData[0].staffName" /></div>
        <div class="name-size">{{ tableData[0].staffName }}</div>
        <div class="point-container">
          <div class="icon-container">
            <i class="fa-solid fa-circle border-circle-icon"></i>
            <i class="fa-solid fa-circle circle-icon"></i>
            <i class="fa-solid fa-star star-icon"></i>
          </div>
          <span class="point-size">{{ tableData[0].totalPoints }}</span>
        </div>
      </div>
      <div class="trapezoid-first"></div>
      <div class="rectangle-first">
        <p class="first-size">1</p>
      </div>
    </div>

    <!-- Third Place -->
    <div class="podium-block rotate-right">
      <div v-if="tableData[2]">
        <i class="fa-solid fa-crown crown-third"></i>
        <div><img :src="tableData[2].imgUrl" :alt="tableData[2].staffName" /></div>
        <div class="name-size">{{ tableData[2].staffName }}</div>
        <div class="point-container">
          <div class="icon-container">
            <i class="fa-solid fa-circle border-circle-icon"></i>
            <i class="fa-solid fa-circle circle-icon"></i>
            <i class="fa-solid fa-star star-icon"></i>
          </div>
          <span class="point-size">{{ tableData[2].totalPoints }}</span>
        </div>
      </div>
      <div class="trapezoid-third"></div>
      <div class="rectangle-third">
        <p class="third-size">3</p>
      </div>
    </div>
  </div>
  
  <!-- Leaderboard Section -->
  <div class="container">
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-center">
          <table v-if="tableData.length >= 4">
            <!-- Table Head -->
            <thead>
              <tr class="title-row"> 
                <th class="rank-title col-sm-2">Rank</th>
                <th class="username-title profile-pic col-md-4">Username</th>
                <th class="point-title col-md-2">
                  <div class="d-flex align-items-center">
                    <div class="icon-container" style="transform: scale(0.45); margin-right: 24px;">
                      <i class="fa-solid fa-circle border-circle-icon"></i>
                      <i class="fa-solid fa-circle circle-icon"></i>
                      <i class="fa-solid fa-star star-icon"></i>
                    </div>
                    Points
                  </div>
                </th>
              </tr>
            </thead>
            
            <!-- Table Body -->
            <tbody>
              <tr class="leaderboard-item" v-for="(user, index) in tableData.slice(3)" :key="user.id">
                <td class="rank">{{ user.id }}</td>
                <td class="username">
                  <div class="d-flex align-items-center">
                    <div class="profile-pic" v-if="index < tableData.length - 5">
                      <img :src="user.imgUrl" alt="Pic">                  
                    </div>
                    <div class="username">
                      {{ index >= tableData.length - 5 ? '********' : user.staffName }}
                    </div> 
                  </div>
                </td>
                <td class="point">{{ user.totalPoints }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

</template>


<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import type {Staff} from "@/interface/UserInterface.ts";
import { selectAllStaffs } from '@/api/staff';
import { getCurrentUser } from '@/api/reward';

const tableData = ref<Staff[]>([])

const fetchAllStaffs = () => {
  selectAllStaffs().then((res) => {
    console.log(res.data)
    tableData.value = res.data.data.results
    .sort((a: any, b: any) => b.total_point - a.total_point)
    .filter((staff: { department: any; }) => currentUserData.department_id === staff.department)
    .map((item:any, index: number) => ({
      id: index + 1,
      staffName: item.staffName,
      totalPoints: item.total_point,
      imgUrl: item.picture_url,
      department: item.department,
      department_name: item.department_name
    }))
  })
}

let currentUserData = reactive<any>({});

const fetchCurrentUser = () => {
  getCurrentUser().then((res) => {
    console.log("Current User:", currentUserData);
    Object.assign(currentUserData, res.data.data);
  })
  .catch((err) => {
    console.error(err);
  });
};

onMounted(() => {
  fetchAllStaffs();
  fetchCurrentUser();
})

</script>

<style scoped>
/* point icon */
.point-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  gap: 25px;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transform: scale(0.6);
}

.border-circle-icon {
  font-size: 4em !important;
  color: #FFDE59;
  position: absolute;
  text-shadow: 0px 2px 5px rgba(176, 176, 176, 0.5);
}

.circle-icon {
  font-size: 3em !important;
  color: #FDC14B;
  position: absolute;
}

.star-icon {
  font-size: 1.6em !important;
  color: white;
  position: absolute;
}

.podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
  
.podium .podium-block {
  text-align: center;
  position: relative;
}

.podium .podium-block:nth-child(2) {
  z-index: 3; /* First place - highest priority */
}

.podium .podium-block:nth-child(1) {
  z-index: 2; /* Second place */
}

.podium .podium-block:nth-child(3) {
  z-index: 1; /* Third place */
}

/* top 3 crown, profile pic, name, point */
.crown-second, .crown-first, .crown-third {
  font-size: 3em;
  margin-bottom: none;
  transform: translateY(18%);
}
.podium .podium-block img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
}
.name-size {
  font-size: 24px;
}
.point-size {
  font-size: 35px;
  font-weight: bold;
}
  
/* first podium */
.crown-first {
  color: #FFDC5E;
}
.trapezoid-first {
  border-bottom: 30px solid #FFDF6E;
  border-right: 30px solid transparent;
  border-left: 30px solid transparent;
  height: 0;
  width: 250px;
}
.podium .podium-block .rectangle-first {
  background: linear-gradient(to bottom, #FFBD30, #FFE074);
  height: 270px;
  width: 250px;
} 
.first-size {
  color: #fff;
  font-weight: bold;
  font-size: 80px;
  padding-top: 10px; /* Adjust as needed */
}

/* second podium */
.crown-second {
  color: #c9c5c5;
}
.podium .rotate-left {
  transform: rotate(-2deg);
  margin-right: -3px;
  margin-bottom: -4px;
}
.trapezoid-second {
  border-bottom: 20px solid #CDCDCD;
  border-left: 30px solid transparent;
  height: 0;
  width: 250px;
}
.podium .podium-block .rectangle-second {
  background: linear-gradient(to bottom, #969696, #DBDBDB);
  height: 170px;
  width: 250px;
}
.second-size {
  color: #fff;
  font-weight: bold;
  font-size: 70px;
  padding-top: 10px; 
}
  
/* third podium */
.crown-third {
  color: #ECA64F;
}
.podium .rotate-right {
  transform: rotate(2deg);
  margin-left: -3px;
  margin-bottom: -4px;
}
.trapezoid-third {
  border-bottom: 20px solid #ECA64F;
  border-right: 30px solid transparent;
  height: 0;
  width: 250px;
}
.podium .podium-block .rectangle-third {
  background: linear-gradient(to bottom, #D18F3C, #F5BE7A);
  height: 120px;
  width: 250px;
}
.third-size {
  color: #fff;
  font-weight: bold;
  font-size: 60px;
  padding-top: 10px; 
}

/* leaderboard */
.container .card {
  background: linear-gradient(to bottom, #CEE7FF, #F0F9FF);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
  border-radius:  15px;
}
.container {
  width: 80%;
  z-index: 4;
  position: relative;
}
.card {
  border: none;
}

table {
  width: 90%;
  background-color: transparent;
  border-collapse: separate;
  border-spacing: 0px 15px; /* More spacing between rows */
}

th, td {
  text-align: left;
  padding: 10px;
}

.leaderboard-item {
  background: white !important;
  border-radius: 15px;
  transition: transform 0.2s ease-in-out;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Apply hover effect to the entire row */
.leaderboard-item:hover {
  transform: scale(1.05);
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
}

td:first-child, th:first-child {
  border-radius: 15px 0 0 15px;
  padding-left: 50px;
}

td:last-child {
  border-radius: 0 15px 15px 0;
}

.rank-title, .username-title, .point-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #004177;
}

.rank, .username, .point {
  font-size: 1.2rem; 
}

.rank {
  font-weight: bold;
}

.profile-pic img{
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
}
</style>