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
      <span class="buttonText">{{ points }}</span>
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
        <img :src="getImagePath(item.img)" alt="Reward Image" class="image">
        <div class="card-body">
            <h4 class="rewardTitle"><b>{{ item.name }}</b></h4>
            <p>{{ item.description }}</p>
            <p><b>Valid Until: </b>{{ item.valid }}</p>
            <p><b>Quantity: </b>{{ item.quantity }}</p>
            <p><b>Terms & Conditions: </b>  
              <button class="TNCButton" @click="openTermsModal(item)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-text" viewBox="0 0 16 16">
                  <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5"/>
                  <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
                </svg>
              </button>
            </p>
            <button class="rewardButton mx-auto" @click="openSelectedRewardModal(item)" :disabled="item.redeemed">
              <div class="icon-container" v-if="!item.redeemed">
                <i class="fa-solid fa-circle border-circle-icon"></i>
                <i class="fa-solid fa-circle circle-icon"></i>
                <i class="fa-solid fa-star star-icon"></i>
              </div>
              <span class="rewardText">{{ item.redeemed ? "Redeemed" : item.rewardPrice }}</span>
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
            <div class="terms-text">{{ selectedReward.terms }}</div>
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
          <span class="text-muted">Are you sure you want to redeem <b>{{ selectedReward.name }}</b>? This action cannot be undone.</span>
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
import { ref } from 'vue';
import {useRouter} from "vue-router";

const getImagePath = (img: any) => {
  return new URL(`/dist/assets/${img}`, import.meta.url).href;
};

const points = ref(100)

interface RewardItem {
    id: number
    img: string
    name: string
    description: string
    valid: string
    quantity: number
    rewardPrice: number
    terms: string
    redeemed: boolean
}

const tableData = ref([
  {
    id: 1,
    img: "Jaya_Grocer_Gift_Card.png",
    name: "Jaya Grocer's Gift Card", 
    description: "RM100 Jaya Grocer's Gift Card. Vouchers received will be valid for a minimum period of 6 months.", 
    valid: "30/06/2024, 23:59", 
    quantity: 20,
    rewardPrice: 50,
    redeemed: false,
    terms: `1. This gift card is valid for one transaction only and is not redeemable or exchangeable for cash.

    2. This gift card is valid at all Jaya Grocer outlets.

    3. This gift card is valid for 6 months only from the date of card activation.

    4. During the redemption of goods, if the value of the goods is less than the amount on the gift card, no refund will be given for the remaining unused balance.

    5. If the value of goods is more than the amount on the gift card, then the difference should be paid by the bearer.
    `,
  },
  {
    id: 2,
    img: "McDonald_Gift_Card.png",
    name: "McDonald Coupon", 
    description: "Exclusive Sweet Chili Fish Wrap Drive Thru Combo Promo for only RM11.50. ", 
    valid: "31/12/2024, 23:59", 
    quantity: 10,
    rewardPrice: 25,
    redeemed: false,
    terms: `1. This gift card is valid for one transaction only and is not redeemable or exchangeable for cash.

    2. This gift card is valid at all Starbuck outlets.

    3. This gift card is valid for 6 months only from the date of card activation.

    4. During the redemption of goods, if the value of the goods is less than the amount on the gift card, no refund will be given for the remaining unused balance.
    `
  },
]);

//View T&C Modal
const showTermsModal = ref(false);
const selectedReward = ref<RewardItem>({
  id: 0,
  name: '',
  quantity: 0,
  redeemed: false
} as RewardItem);

const openTermsModal = (reward: RewardItem) => {
  selectedReward.value = reward;
  showTermsModal.value = true;
};

const showSelectedRewardModal = ref(false);

const openSelectedRewardModal = (reward: RewardItem) => {
  selectedReward.value = reward;
  showSelectedRewardModal.value = true;
};

const confirmedReward = () => {
  if (selectedReward.value) {
    const reward = tableData.value.find(r => r.id === selectedReward.value.id);
    if (reward) {
      reward.redeemed = true;
    }

    if (points.value >= selectedReward.value.rewardPrice) {
      points.value -= selectedReward.value.rewardPrice;
      selectedReward.value.quantity = selectedReward.value.quantity - 1
    } else {
      alert ("Not enough points")
    }
  }

  showSelectedRewardModal.value = false;
};

//go to point details page
const router = useRouter()
function goToPointDetails()
{
  router.push('/home/reward-mall/point-details');
}

//go to reward history page
function goToRewardHistory()
{
  router.push('/home/reward-mall/reward-history');
}
</script>

<style scoped>
/* point icon */
.point-container {
  display: flex;
  align-items: center;
}

/* Point Icon Container */
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