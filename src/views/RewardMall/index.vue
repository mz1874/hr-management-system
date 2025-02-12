<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Reward Mall</h2>
      <button class="view-history-button">View History</button>
  </div>

  <button type="button" class="iconButton"  @click="goToPointDetails()"> 
      <span class="buttonText">100</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-compact-right" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M6.776 1.553a.5.5 0 0 1 .671.223l3 6a.5.5 0 0 1 0 .448l-3 6a.5.5 0 1 1-.894-.448L9.44 8 6.553 2.224a.5.5 0 0 1 .223-.671"/>
      </svg>
  </button>

  <div class="row row-cols-md-3 g-4" >
    <div class="col" v-for="(item, index) in reward" :key="index">
      <div class="card shadow-sm mt-4" >
        <img src="https://via.placeholder.com/100" alt="Reward Image" class="image">
        <div class="card-body">
            <h4 class="rewardTitle"><b>{{ item.name }}</b></h4>
            <p>{{ item.description }}</p>
            <p><b>Valid Until: </b>{{ item.valid }}</p>
            <p><b>Quantity: </b>{{ item.quantity }}</p>
            <p><b>Terms & Conditions: </b>  
              <button class="TNCButton" @click="openTermsModal(item)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-text" viewBox="0 0 16 16">
                      path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5"/>
                      <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
                  </svg>
              </button>
            </p>
            <button class="rewardButton d-block mx-auto" @click="openSelectedRewardModal(item)">{{ item.rewardPrice }}</button>
        </div>
      </div>
    </div>
  </div>

  <!-- View T&C Modal -->
  <div class="modal fade" id="termsAndConditionsModal" ref="termsAndConditionsModal" tabindex="-1" aria-labelledby="termsAndConditionsModal" aria-hidden="true">
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
          <li v-for="(term, index) in selectedTerms.terms" :key="index">{{ term }}</li>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Selected Reward Confirmation Modal-->
  <div class="modal fade" id="selectRewardModal" ref="selectRewardModal" tabindex="-1" aria-labelledby="selectRewardModal" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title" id="selectRewardModalLabel">Are you sure?</h3>
        </div>
        <div class="modal-body">
          <span class="text-muted">Are you sure you want to redeem <b>{{ selectedReward.name }}</b>? This action cannot be undone.</span>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-success" data-bs-dismiss="modal">Confirm</button>
        </div>
      </div>
    </div>
  </div>



</template>

<script setup lang="ts">
import contentHeader from "@/components/header/index.vue";
import { ref } from 'vue';
import {Modal} from "bootstrap";
import {useRouter} from "vue-router";

const reward = ref([
  {
    name: "Jaya Grocer's Gift Card", 
    description: "RM100 Jaya Grocer's Gift Card. Vouchers received will be valid for a minimum period of 6 months.", 
    valid: "30/06/2024, 23:59", 
    quantity: "20",
    rewardPrice: "50",
    terms: [
            "This gift card is valid for one transaction only and is not redeemable or exchangeable for cash.",
            "This gift card is valid at all Jaya Grocer outlets.",
            "This gift card is valid for 6 months only from the date of card activation.",
            "During the redemption of goods, if the value of the goods is less than the amount on the gift card, no refund will be given for the remaining unused balance.",
            "If the value of goods is more than the amount on the gift card, then the difference should be paid by the bearer."
        ]
  },
  {
    name: "Starbucks Gift Card", 
    description: "RM50 Starbucks Gift Card. Vouchers received will be valid for a minimum period of 4 months.", 
    valid: "31/12/2024, 23:59", 
    quantity: "10",
    rewardPrice: "25",
    terms: [
            "This gift card is valid for one transaction only and is not redeemable or exchangeable for cash.",
            "This gift card is valid at all Jaya Grocer outlets.",
            "This gift card is valid for 6 months only from the date of card activation.",
        ]
  },
]);

//View T&C Modal
const termsAndConditionsModal = ref();
const selectedTerms = ref({ terms: '' });

const openTermsModal = (item:any) => {
  selectedTerms.value = item;
  const modal = new Modal(termsAndConditionsModal.value);
  modal.show();
};

//Selected Reward Confirmation Modal
const selectRewardModal = ref();
const selectedReward = ref({ name: '' });

const openSelectedRewardModal = (item:any) => {
  selectedReward.value = item;
  const modal = new Modal(selectRewardModal.value);
  modal.show();
};

const router = useRouter()
function goToPointDetails()
{
  router.push('/home/reward-mall/point-details');
}
</script>

<style scoped>
.view-history-button {
  background-color: #ABD3AB;
  padding: 8px; /* Add padding for better appearance */
  width: 11%;
  border: none;
  border-radius: 30px; /* Make corners curved */
  cursor: pointer;
}
.view-history-button:hover {
  background-color: #95c395; 
}

.image {
  border-radius: 0.25rem 0.25rem 0px 0px;
  margin-bottom: 0.75rem;
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

.rewardButton{
  background-color: #ABD3AB;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  padding: 8px; 
  width: 70%;
  border: none;
  border-radius: 15px; 
  cursor: pointer;
}
.rewardButton:hover {
  background-color: #95c395; 
}

.iconButton {
  background-color: white;
  margin-top: 1.5rem;
  margin-bottom: 15px;
  padding: 7px;
  width: 10%;
  border-radius: 5px;
  border: 1px solid #707070;
  display: flex;              /* Using flexbox to align the content */
  justify-content: space-between;    /* Centers the text horizontally */
  align-items: center;        /* Vertically aligns the content */
}
.iconButton:hover {
  background-color: rgb(236, 236, 236); 
}

.buttonText {
  text-align: center;         
  flex-grow: 1;  
}

.modal-content {
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