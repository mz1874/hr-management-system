<template>
  <div class="d-flex justify-content-between align-items-center mb-2">
      <h2>Reward Mall</h2>
      <button class="view-history-button" @click="goToRewardHistory()">View History</button>
  </div>

<!-- point -->
  <div class="point-container mb-3"> 
    <div class="icon-container" style="margin-top: 10px; margin-right: -20px; transform: scale(0.9);">
      <i class="fa-solid fa-circle border-circle-icon"></i>
      <i class="fa-solid fa-circle circle-icon"></i>
      <i class="fa-solid fa-star star-icon"></i>
    </div>
    <button type="button" class="iconButton"  @click="goToPointDetails()"> 
      <span class="buttonText">{{ currentUserData.total_point }}</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-chevron-compact-right" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M6.776 1.553a.5.5 0 0 1 .671.223l3 6a.5.5 0 0 1 0 .448l-3 6a.5.5 0 1 1-.894-.448L9.44 8 6.553 2.224a.5.5 0 0 1 .223-.671"/>
      </svg>
    </button>
  </div>

  <!-- reward item -->
  <div class="container">
    <div class="row row-cols-md-3 g-4" >
    <div class="col" v-for="item in tableData" :key="item.id">
      <div class="card shadow-sm mt-4" >
        <img :src="item.image" alt="Reward Image" class="image">
        <div class="card-body">
            <h4 class="rewardTitle"><b>{{ item.rewardName }}</b></h4>
            <p>{{ item.description }}</p>
            <p><b>Valid Until: </b>{{ item.endDateTime }}</p>
            <p><b>Quantity: </b>{{ item.quantity }}</p>
            <p><b>Terms & Conditions: </b>  
              <button class="TNCButton" @click="openTermsModal(item)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-text" viewBox="0 0 16 16">
                  <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5"/>
                  <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
                </svg>
              </button>
            </p>
            <button class="rewardButton mx-auto" @click="openSelectedRewardModal(item)" :disabled="hasUserRedeemed(item.id)">
              <div class="icon-container">
                <i class="fa-solid fa-circle border-circle-icon"></i>
                <i class="fa-solid fa-circle circle-icon"></i>
                <i class="fa-solid fa-star star-icon"></i>
              </div>
              <span class="rewardText">{{ hasUserRedeemed(item.id) ? 'Redeemed' : item.rewardPoints }}</span>
            </button>
          </div>
      </div>
    </div>
  </div>
  </div>

  <!-- View T&C Modal -->
  <div class="modal fade" id="termsAndConditionsModal" :class="{ show: showTermsModal }" style="display: block" v-if="showTermsModal">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <div class="header-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-file-earmark-text" viewBox="0 0 16 16">
                <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5"/>
                <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
            </svg>
            <h3>Terms & Conditions</h3>
          </div>
        </div>
        <div class="modal-body">
          <div class="modal-body">
            <div class="terms-text">{{ currentReward.terms }}</div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary"  @click="showTermsModal = false">Close</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showTermsModal"></div>

  <!-- Selected Reward Confirmation Modal-->
  <div class="modal fade" id="selectRewardModal" :class="{ show: showSelectedRewardModal }" style="display: block" v-if="showSelectedRewardModal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title" id="selectRewardModalLabel">Are you sure?</h3>
        </div>
        <div class="modal-body">
          <span class="text-muted">Are you sure you want to redeem <b>{{ currentReward.rewardName }}</b>? This action cannot be undone.</span>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary"  @click="showSelectedRewardModal = false">Close</button>
          <button type="button" class="btn btn-success" @click="confirmedReward">Confirm</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showSelectedRewardModal"></div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from "vue-router";
import { createRedemption, getAllRewards, getRewardRedemption, getCurrentUser, patchReward, updateReward } from "@/api/reward.ts";
import { isSuccess, isCreated, isNoContent } from "@/utils/httpStatus.ts"
import Swal from "sweetalert2";
import dayjs from 'dayjs';
import type { RewardItem} from '@/interface/RewardInterface.ts'

const tableData = ref<RewardItem[]>([]);
const currentReward = ref<any>({});

// ===================== Open T&C modal =====================
const showTermsModal = ref(false);

const openTermsModal = (reward: RewardItem) => {
  currentReward.value = reward;
  showTermsModal.value = true;
};

// ===================== Open Confirmation Reward Button modal =====================
const showSelectedRewardModal = ref(false);

const openSelectedRewardModal = (reward: RewardItem) => {
  currentReward.value = reward;
  showSelectedRewardModal.value = true;
};

// ===================== Fetch Reward =====================
const fetchRewards = () => {
  getAllRewards().then((res) => {   
    tableData.value = res.data.data.results.filter((item: any) => item.reward_status === 'Active').map((item:any) => ({
      id: item.id,
      rewardName: item.reward_title,
      rewardPoints: item.reward_points_required,
      quantity: item.reward_quantity,
      endDateTime: dayjs(item.reward_end_date_time).format("YYYY-DD-MM, HH:mm"),
      description: item.reward_description,
      terms: item.reward_terms_and_conditions,
      status: item.reward_status,
      image: item.file
    }));    
  });
};

// ===================== Fetch Current User =====================
let currentUserData = reactive<any>({});

const fetchPoints = () => {
  getCurrentUser().then((res) => {
    console.log("Current User:", currentUserData);
    Object.assign(currentUserData, res.data.data);
  })
  .catch((err) => {
    console.error(err);
  });
};

let userRedemptions = ref<any[]>([]);

// ===================== Fetch Reward Redemption =====================
const fetchRewardRedemption = () => {
  getRewardRedemption().then((res) => {
    console.log("User Redemptions:", userRedemptions.value); // DEBUG
    userRedemptions.value = res.data.data.results;
  })
  .catch((err) => {
    console.error(err);
  });
};

onMounted(() => {
  fetchRewards();
  fetchPoints();
  fetchRewardRedemption();
});

// ===================== Check if the user has redeemed the reward =====================
const hasUserRedeemed = (rewardId: any) => {
  // Check if any redemption record matches the current user and the given reward ID
  return userRedemptions.value.some(
    redemption => redemption.user.id === currentUserData.id && redemption.reward.id === rewardId
  );
};

// ===================== Action for Clicking confirm reward button =====================
const confirmedReward = async () => {
  // check whether has redeemed this reward
  const alreadyRedeemed = userRedemptions.value.some(
    redemption => redemption.user === currentUserData.id && redemption.reward === currentReward.value.id
  );

  // Check if the user has redeemed the reward
  if (alreadyRedeemed) {
    Swal.fire({
      icon: 'error',
      title: 'Already Redeemed',
      text: 'You have already redeemed this reward.',
    });
    showSelectedRewardModal.value = false;
    return;
  } 
  else {
    // Check if the user has enough point
    if (currentUserData.total_point < currentReward.value.rewardPoints) {
      Swal.fire({
        icon: 'error',
        title: 'Not enough points',
        text: 'You do not have sufficient points to redeem this reward.',
      });
      showSelectedRewardModal.value = false;
      return;
    }
    
    try {
      // Create User reward redemption record
      const redemptionData = {
        reward: currentReward.value.id,
        user: currentUserData.id,
        points_deducted: currentReward.value.rewardPoints,
        reward_redeemed_on: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        reward_redemption_status: 'Not Yet Received'
      };

      const redemptionRes = await createRedemption(redemptionData);
      if (!isCreated(redemptionRes.status)) {
        throw new Error('Failed to create redemption record.');
      }

      // Update reward quantity
      const updatedRewardData = {
        reward_quantity: currentReward.value.quantity - 1
      };
      const updateRes = await patchReward(currentReward.value.id, updatedRewardData);
      if (!isSuccess(updateRes.status)) {
        throw new Error('Failed to update reward quantity.');
      }

      // Close modal
      showSelectedRewardModal.value = false;

      // Display success message
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `You have successfully redeemed ${currentReward.value.rewardName}.`,
        showConfirmButton: false
      });

      // Update user point
      currentUserData.total_point -= currentReward.value.rewardPoints;

      fetchRewards();
      fetchPoints();

    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Redemption failed',
        text: err.message || 'An error occurred during redemption.',
      });
    }
  } 
};

//go to point details page
const router = useRouter()
function goToPointDetails() {
  router.push('/home/reward-mall/point-details');
}

//go to reward history page
function goToRewardHistory() {
  router.push('/home/reward-mall/reward-history');
}

</script>

<style scoped>
/* point icon */
.point-container {
  display: flex;
  align-items: center;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 50px;
  height: 50px;
}

.border-circle-icon {
  font-size: 4em;
  color: #FFDE59;
  position: absolute;
  text-shadow: 0px 2px 5px rgba(176, 176, 176, 0.5);
}

.circle-icon {
  font-size: 3em;
  color: #FDC14B;
  position: absolute;
}

.star-icon {
  font-size: 1.6em;
  color: white;
  position: absolute;
}

.iconButton {
  background-color: white;
  margin-top: 1.5rem;
  margin-bottom: 15px;
  padding: 7px;
  width: auto;
  border-radius: 5px;
  border: 1px solid #707070;
  display: flex;             
  justify-content: space-between;   
  align-items: center;        
}
.iconButton:hover {
  background-color: rgb(236, 236, 236); 
}

.buttonText {
  font-size: 18px;      
  margin-left: 2rem;
  margin-right: 1rem;
}

/* view history button */
.view-history-button {
  background-color: #ABD3AB;
  padding: 8px; 
  width: 11%;
  border: none;
  border-radius: 30px; 
  cursor: pointer;
}
.view-history-button:hover {
  background-color: #95c395; 
}

/* Card sytling*/
.image {
  width: 100%;  
  /* height: 400px; 
  object-fit: cover;  */
  margin-bottom: 0.75rem;
  overflow: hidden;
}

.rewardTitle {
  margin-bottom: 0.75rem;
}

.card-body p {
  font-size: 1em;
  color: #666;
  line-height: 1.6;
}

.TNCButton {
  background-color: #B8D8F1;
  border: none;
  border-radius: 5px;
  padding: 5px; 
  cursor: pointer;
  display: inline-flex; /* Inline-flex for better SVG alignment */
}
.TNCButton:hover {
  background-color: #adcce6; 
}

/* modal TNC */
.terms-text {
  white-space: pre-line;
}

/* Confirmation button in card */
.rewardButton{
  background-color: #ABD3AB;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  width: 70%;
  border: none;
  border-radius: 15px; 
  display: flex;
  align-items: center; 
  justify-content: center;
  text-align: center;
  height: 45px; /* Adjust the height as needed */
}

.rewardButton:hover {
  background-color: #95c395; 
}

.rewardButton .icon-container {
  width: 40px;
  height: 40px;
  transform: scale(0.5);
  text-shadow: none;
}

/* modal styling */
.modal-content, .modal-body {
  padding: 10px;
}

.header-content {
  display: flex;
  align-items: center; 
  gap: 10px; 
}
.header-content h3 {
  margin: 0; 
}

#selectRewardModal .modal-header, #selectRewardModal .modal-footer {
  border: none;
}

</style>