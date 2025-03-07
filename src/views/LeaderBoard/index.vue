<template>
  <h1>Leaderboard</h1>
  
   <!-- Podium -->
   <div class="podium">
    <!-- Second Place (left) -->
    <div v-if="tableData.length >= 2" class="podium-block rotate-left">
      <i class="fa-solid fa-crown crown-second"></i>
      <div>
        <img :src="tableData[1].image" :alt="tableData[1].username">
      </div>
      <div class="name-size">{{ tableData[1].username }}</div>
      <div class="point-container">
        <div class="icon-container">
          <i class="fa-solid fa-circle border-circle-icon"></i>
          <i class="fa-solid fa-circle circle-icon"></i>
          <i class="fa-solid fa-star star-icon"></i>
        </div>
        <span class="point-size">{{ tableData[1].points }}</span>
      </div>
      <div class="trapezoid-second"></div>
      <div class="rectangle-second">
        <p class="second-size">{{ tableData[1].rank }}</p>
      </div>
    </div>

    <!-- First Place (center) -->
    <div v-if="tableData.length >= 1" class="podium-block">
      <i class="fa-solid fa-crown crown-first"></i>
      <div>
        <img :src="tableData[0].image" :alt="tableData[0].username">
      </div>
      <div class="name-size">{{ tableData[0].username }}</div>
      <div class="point-container">
        <div class="icon-container">
          <i class="fa-solid fa-circle border-circle-icon"></i>
          <i class="fa-solid fa-circle circle-icon"></i>
          <i class="fa-solid fa-star star-icon"></i>
        </div>
        <span class="point-size">{{ tableData[0].points }}</span>
      </div>
      <div class="trapezoid-first"></div>
      <div class="rectangle-first">
        <p class="first-size">{{ tableData[0].rank }}</p>
      </div>
    </div>

    <!-- Third Place (right) -->
    <div v-if="tableData.length >= 3" class="podium-block rotate-right">
      <i class="fa-solid fa-crown crown-third"></i>
      <div>
        <img :src="tableData[2].image" :alt="tableData[2].username">
      </div>
      <div class="name-size">{{ tableData[2].username }}</div>
      <div class="point-container">
        <div class="icon-container">
          <i class="fa-solid fa-circle border-circle-icon"></i>
          <i class="fa-solid fa-circle circle-icon"></i>
          <i class="fa-solid fa-star star-icon"></i>
        </div>
        <span class="point-size">{{ tableData[2].points }}</span>
      </div>
      <div class="trapezoid-third"></div>
      <div class="rectangle-third">
        <p class="third-size">{{ tableData[2].rank }}</p>
      </div>
    </div>
  </div>

  <!-- Leaderboard Section -->
  <div class="container">
    <div class="card">
      <div class="card-body">
        <div class="d-flex justify-content-center">
          <table>
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
              <tr class="leaderboard-item" v-for="(user, index) in tableData.slice(3)" :key="user.rank">
                <td class="rank">{{ user.rank }}</td>
                <td class="username">
                  <div class="d-flex align-items-center">
                    <div class="profile-pic" v-if="index < tableData.length - 5">
                      <img :src="user.image" :alt="user.username">                  
                    </div>
                    <div class="username">
                      {{ index >= tableData.length - 5 ? '********' : user.username }}
                    </div> 
                  </div>
                </td>
                <td class="point">{{ user.points }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>


</template>


<script setup lang="ts">
import { ref } from 'vue'

interface leaderboard {
  rank: number
  image: string
  username: string
  points: number
}

const tableData = ref<leaderboard[]>([
 {rank: 1, image: "/dist/assets/McDonald_Gift_Card.png", username: "Amandass", points: 500},
 {rank: 2, image: "/dist/assets/McDonald_Gift_Card.png", username: "David", points: 400},
 {rank: 3, image: "/dist/assets/McDonald_Gift_Card.png", username: "Ashley", points: 300},
 {rank: 4, image: "/dist/assets/McDonald_Gift_Card.png", username: "Alexander", points: 250},
 {rank: 5, image: "/dist/assets/McDonald_Gift_Card.png", username: "Katy", points: 200},
 {rank: 6, image: "/dist/assets/McDonald_Gift_Card.png", username: "Jester", points: 150},
 {rank: 7, image: "/dist/assets/McDonald_Gift_Card.png", username: "Jackson", points: 100},
 {rank: 8, image: "/dist/assets/McDonald_Gift_Card.png", username: "Katy", points: 200},
 {rank: 9, image: "/dist/assets/McDonald_Gift_Card.png", username: "Jester", points: 150},
 {rank: 10, image: "/dist/assets/McDonald_Gift_Card.png", username: "Jackson", points: 100},

])

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
    z-index: 3; /* Make sure the top podium is always on top */
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
  z-index: 0;
  margin-right: -1px;
  margin-bottom: -4px;
}
.trapezoid-second {
    border-bottom: 20px solid #CDCDCD;
    border-left: 20px solid transparent;
    height: 0;
    width: 250px;
}
.podium .podium-block .rectangle-second {
    background: linear-gradient(to bottom, #969696, #DBDBDB);
    height: 170px;
    width: 250px;
    z-index: 2; /* Ensure the second podium stays below the first */
}
.second-size {
    color: #fff;
    font-weight: bold;
    font-size: 70px;
    padding-top:10px; /* Adjust as needed */
}
  
/* third podium */
.crown-third {
  color: #ECA64F;
}
.podium .rotate-right {
    transform: rotate(2deg);
    z-index: 0; /* Ensure this podium stays behind the middle podium */
    margin-right: -1px;
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
    z-index: 1; /* Make sure the third podium stays at the back */
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

}
.card {
  border: none;
}

.container .card {
  background: linear-gradient(to bottom, #CEE7FF, #F0F9FF);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
  border-radius: 15px;
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