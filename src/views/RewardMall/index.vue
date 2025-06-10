<template>
<div class="main-content">
  <div class="d-flex justify-content-between align-items-center mb-2">
    <h1>Reward Mall</h1>
    <button class="view-history-button" @click="goToRewardHistory()">
      <span>Reward History</span>
      <i class="bi bi-chevron-right"></i>
    </button>
  </div>

  <!-- Points Section -->
  <div class="point-container"> 
    <div class="points-content">
      <div class="icon-container" style="margin-right: -30px; transform: scale(0.9);">
        <i class="fa-solid fa-circle border-circle-icon"></i>
        <i class="fa-solid fa-circle circle-icon"></i>
        <i class="fa-solid fa-star star-icon"></i>
      </div>
      <div class="points-info">
        <button type="button" class="points-button" @click="goToPointDetails()"> 
          <div class="row ">
            <span class="points-label text-muted">Your Current Points</span>
            <span class="points-value">{{ currentUserData.current_point }}</span>
          </div>
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>

  <!-- Reward Item -->
  <div class="rewards-section mt-5">
    <div v-if="tableData.length === 0" class="text-center text-muted my-5">
        No rewards found.
      </div>
    <div v-else class="rewards-grid">
      <div class="reward-card" v-for="item in tableData" :key="item.id">
        <!-- Image Section -->
        <div class="reward-image-container">
          <template v-if="item.fileDetails?.file">
            <img :src="item.fileDetails.file" :alt="item.fileDetails.filename" class="reward-image">
          </template>
          <template v-else>
            <div class="no-image-placeholder">
              <i class="bi bi-image"></i>
              <span>No Image</span>
            </div>
          </template>
        </div>
        
        <!-- Content Section -->
        <div class="reward-content">
          <!-- Updated reward title with read more functionality -->
          <div class="reward-title-container">
            <h4 
              :ref="(el: any) => titleRefs[item.id] = el"
              :class="['reward-title', { 'expanded': expandedTitles[item.id] }]" 
              @click="toggleTitle(item.id)"
            >
              {{ item.rewardName }}
            </h4>
            <button v-if="shouldShowTitleToggle[item.id]" class="expand-button" @click="toggleTitle(item.id)">
              <span v-if="!expandedTitles[item.id]">Read more</span>
              <span v-else>Read less</span>
              <i class="bi bi-chevron-down" v-if="!expandedTitles[item.id]"></i>
              <i class="bi bi-chevron-up" v-else></i>
            </button>
          </div>
          
          <!-- Description -->
          <div class="reward-description">
            <div 
              :ref="(el: any) => descriptionRefs[item.id] = el"
              :class="['description-text', { 'expanded': expandedRewards[item.id] }]" 
              @click="toggleDescription(item.id)"
            >
              {{ item.description }}
            </div>

            <button v-if="shouldShowToggle[item.id]" class="expand-button" @click="toggleDescription(item.id)">
              <span v-if="!expandedRewards[item.id]">Read more</span>
              <span v-else>Read less</span>
              <i class="bi bi-chevron-down" v-if="!expandedRewards[item.id]"></i>
              <i class="bi bi-chevron-up" v-else></i>
            </button>
          </div>
          
          <!-- Details -->
          <div class="reward-details">
            <div class="detail-item">
              <i class="bi bi-calendar-event"></i>
              <span class="detail-label">Valid Until:</span>
              <span class="detail-value">{{ item.endDateTime }}</span>
            </div>
            <div class="detail-item">
              <i class="bi bi-box"></i>
              <span class="detail-label">Available:</span>
              <span class="detail-value">{{ item.quantity }}</span>
            </div>
            <div class="detail-item terms-item">
              <i class="bi bi-file-text"></i>
              <span class="detail-label">Terms & Conditions:</span>
              <button class="terms-button text-muted" @click="openTermsModal(item)">
                <i class="bi bi-eye"></i>
                View
              </button>
            </div>
          </div>
          
          <!-- Redeem Button -->
          <button class="redeem-button" @click="openSelectedRewardModal(item)" :disabled="hasUserRedeemed(item.id)" :class="{ 'redeemed': hasUserRedeemed(item.id) }">
            <div class="redeem-icon-container" v-if="!hasUserRedeemed(item.id)">
              <i class="fa-solid fa-circle border-circle-icon"></i>
              <i class="fa-solid fa-circle circle-icon"></i>
              <i class="fa-solid fa-star star-icon"></i>
            </div>
            
            <i class="bi bi-check-circle-fill redeemed-icon" v-else></i>
            <span class="redeemed-text">
              {{ hasUserRedeemed(item.id) ? 'Redeemed' : `${item.rewardPoints} Points` }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Pagination & total count -->
  <div class="d-flex align-items-center mt-3 justify-content-start">
      <!-- Left: Total count -->
      <span class="me-3 mb-3">Total Logs: {{ totalCount }}</span>

      <!-- Right: Pagination -->
      <nav aria-label="Page navigation">
          <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="prevPage">Previous</button>
              </li>
              <li class="page-item" v-for="(page, index) in visiblePages" :key="index":class="{ active: page === currentPage, disabled: page === '...'}">
                  <button class="page-link" v-if="page !== '...'"@click="goToPage(page)">
                      {{ page }}
                  </button>
                  <span v-else class="page-link">…</span>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="nextPage">Next</button>
              </li>
          </ul>
      </nav>
  </div>

  <!-- View T&C Modal -->
  <div class="modal fade" id="termsAndConditionsModal" :class="{ show: showTermsModal }" style="display: block" v-if="showTermsModal">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <div class="header-content">
            <i class="bi bi-file-text" style="font-size: 30px;"></i>
            <h3>Terms & Conditions</h3>
          </div>
        </div>
        <div class="modal-body">
          <div class="modal-body" v-if="currentReward.terms">
            <div class="terms-text">{{ currentReward.terms }}</div>
          </div>
          <div v-else class="text-muted text-center py-4">
            <div>No Terms And Conditions.</div>
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
</div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, nextTick, watch } from 'vue';
import { useRouter } from "vue-router";
import { createRedemption, getAllRewards, getUserRewardRedemption, patchReward, updateReward } from "@/api/reward.ts";
import { getCurrentUser } from '@/api/login';
import { isSuccess, isCreated, isNoContent } from "@/utils/httpStatus.ts"
import Swal from "sweetalert2";
import dayjs from 'dayjs';
import type { RewardItem} from '@/interface/RewardInterface.ts';

const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 4) pages.push('...');

    const start = Math.max(2, current - 2);
    const end = Math.min(total - 1, current + 2);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 3) pages.push('...');
    pages.push(total);
  }

  return pages;
});

// Pagination functions
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const goToPage = (page: any) => {
  currentPage.value = page;
};

// ===================== Toggle Reward Title =====================
// reactive references
const expandedTitles = ref<Record<number, boolean>>({})
const titleRefs = ref<Record<number, Element | null>>({})
const shouldShowTitleToggle = ref<Record<number, boolean>>({})

// Check if title overflows beyond 2 lines
const checkTitleOverflow = (id: number) => {
  nextTick(() => {
    const element = titleRefs.value[id] as HTMLElement
    if (!element) return
    
    // Get the computed line height and element height
    const lineHeight = parseInt(window.getComputedStyle(element).lineHeight)
    const elementHeight = element.scrollHeight
    
    // Calculate how many lines the text actually takes
    const numberOfLines = Math.ceil(elementHeight / lineHeight)
    
    // Show toggle if text takes more than 2 lines
    shouldShowTitleToggle.value[id] = numberOfLines > 2
  })
}

// Toggling title
const toggleTitle = (id: number) => {
  expandedTitles.value[id] = !expandedTitles.value[id]
}

// ===================== Toggle Description =====================
const expandedRewards = ref<Record<number, boolean>>({})
const descriptionRefs = ref<Record<number, Element | null>>({})
const shouldShowToggle = ref<Record<number, boolean>>({})

// Check if description overflows beyond 2 lines
const checkDescriptionOverflow = (id: number) => {
  nextTick(() => {
    const element = descriptionRefs.value[id] as HTMLElement
    if (!element) return
    
    // Get the computed line height and element height
    const lineHeight = parseInt(window.getComputedStyle(element).lineHeight)
    const elementHeight = element.scrollHeight
    
    // Calculate how many lines the text actually takes
    const numberOfLines = Math.ceil(elementHeight / lineHeight)
    
    // Show toggle if text takes more than 2 lines
    shouldShowToggle.value[id] = numberOfLines > 2
  })
}

// Toggle open/close
const toggleDescription = (id: number) => {
  expandedRewards.value[id] = !expandedRewards.value[id]
}

// ===================== Pagination =====================
const currentPage = ref(1)
const itemsPerPage = 10
const totalCount = ref(0)
const totalPages = computed(() => Math.ceil(totalCount.value / itemsPerPage))

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) fetchRewards(page)
}

// ==============================================
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

// ===================== Manage background scrolling =====================
watch([showTermsModal, showSelectedRewardModal], ([terms, reward]) => {
  if (terms || reward) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

// ===================== Fetch Reward =====================
const fetchRewards = (page = 1) => {
  currentPage.value = page

  getAllRewards(page, '', '', 'Active').then((res) => {   
    console.log(res.data)
    totalCount.value = res.data.data.count;  
    tableData.value = res.data.data.results.map((item:any) => ({
      id: item.id,
      rewardName: item.reward_title,
      rewardPoints: item.reward_points_required,
      quantity: item.reward_quantity,
      endDateTime: dayjs(item.reward_end_date_time).format("YYYY-MM-DD, HH:mm"),
      description: item.reward_description,
      terms: item.reward_terms_and_conditions,
      status: item.reward_status,
      fileDetails: {
        file: item.file?.file_url || ''
      }
    }));
    nextTick(() => {
      tableData.value.forEach(item => {
        checkTitleOverflow(item.id)
        checkDescriptionOverflow(item.id)
      })
    })
  });
};

// ===================== Fetch Current User Points =====================
let currentUserData = reactive<any>({});

const fetchPoints = async () => {
  try {
    const res = await getCurrentUser();
    Object.assign(currentUserData, res.data.data);
  } catch (err) {
    console.error("Error fetching user:", err);
  }
};

// ===================== Fetch Reward Redemption =====================
let userRedemptions = ref<any[]>([]);

const fetchRewardRedemption = () => {
  getUserRewardRedemption(currentUserData.id).then((res) => {
    console.log("User Redemptions:", userRedemptions.value); // DEBUG
    userRedemptions.value = res.data.data.results;
  })
  .catch((err) => {
    console.error(err);
  });
};

onMounted(async () => {
  fetchRewards();
  await fetchPoints();
  fetchRewardRedemption();
});

window.addEventListener('resize', () => {
  tableData.value.forEach(item => {
    checkTitleOverflow(item.id)
    checkDescriptionOverflow(item.id)
  })
})


// ===================== Check if the user has redeemed the reward =====================
const hasUserRedeemed = (rewardId: any) => {
  // Check if any redemption record matches the current user and the given reward ID
  return userRedemptions.value.some(
    redemption => redemption.user.id === currentUserData.id && redemption.reward_id_stored === rewardId
  );
};

// ===================== Action for Clicking confirm reward button =====================
const confirmedReward = async () => {
  // check whether has redeemed this reward
  const alreadyRedeemed = userRedemptions.value.some(
    redemption => redemption.user === currentUserData.id && redemption.reward_id_stored === currentReward.value.id
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
    // Check if reward quantity is available
    if (currentReward.value.quantity <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Out of Stock',
        text: 'This reward is currently out of stock and cannot be redeemed.',
      });
      showSelectedRewardModal.value = false;
      return;
    }
    
    // Check if the user has enough point
    if (currentUserData.current_point < currentReward.value.rewardPoints) {
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
        reward_id: currentReward.value.id, 
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
        timer: 1500,
        showConfirmButton: false
      });

      // Update user point
      currentUserData.current_point -= currentReward.value.rewardPoints;

      fetchRewards();
      fetchPoints();
      fetchRewardRedemption();

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
/* view history button */
.view-history-button {
  background-color: #ABD3AB;
  padding: 10px 16px;
  width: auto;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.view-history-button:hover {
  background-color: #95c395; 
}

/* Points Section */
.point-container {
  display: flex;
  align-items: center;
  margin-top: 1.6rem;
  margin-bottom: 2.5rem;
}

.points-content {
  display: flex;
  align-items: center;
  filter: drop-shadow(0 4px 8px rgba(218, 218, 218, 0.3));
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
  font-size: 4.6em;
  color: #FFDE59;
  position: absolute;
  filter: drop-shadow(0 4px 8px rgba(255, 222, 89, 0.3));
}

.circle-icon {
  font-size: 3.6em;
  color: #FDC14B;
  position: absolute;
}

.star-icon {
  font-size: 2em;
  color: white;
  position: absolute;
}

.points-button {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(79, 76, 76, 0.3);
  border-radius: 15px;
  padding: 3px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s ease;
}

.points-button:hover {
  background-color: rgb(242, 242, 242);
} 

.points-label {
  margin-left: 0.5rem;
}

.points-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #8b4513;
  margin-bottom: 0;
  margin-left: 0.5rem;
}

/* Rewards Grid */
.rewards-section {
  margin-bottom: 3rem;
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* Reduced from 300px */
  gap: 1.5rem; /* Reduced from 2rem */
}

.reward-card {
  background: #ffffff;
  border-radius: 15px; /* Reduced from 20px */
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08); /* Slightly smaller shadow */
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* Make image container smaller */
.reward-image-container {
  height: 260px; /* Reduced from 250px */
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.reward-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.no-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #9ca3af;
  font-size: 0.9rem;
}

.no-image-placeholder i {
  font-size: 2.5rem;
}

.reward-content {
  padding: 1rem;
}

.reward-title-container {
  margin-bottom: 1rem;
}

.reward-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0;
  word-wrap: break-word;
  cursor: pointer;
  position: relative;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
}

.reward-title.expanded {
  -webkit-line-clamp: unset;
  overflow: visible;
}

.reward-description {
  margin-bottom: 1rem;
}

.description-text {
  color: #6b7280;
  cursor: pointer;
  position: relative;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
}

.description-text.expanded {
  -webkit-line-clamp: unset;
  overflow: visible;
}

.expand-button {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
}

.expand-button:hover {
  color: #5a67d8;
}

.reward-details {
  margin-bottom: 2rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.detail-item i {
  color: #6b7280;
  width: 16px;
  flex-shrink: 0;
}

.detail-label {
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  color: #1a1a1a;
  font-weight: 600;
}

.terms-button {
  background: #B8D8F1;
  border: none;
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  gap: 0.25rem;
}

.terms-button:hover {
  background-color: #adcce6;  
  box-shadow: 0 4px 12px rgba(168, 237, 234, 0.3);
}

/* Redeem Button */
.redeem-button {
  width: 100%;
  background: #ABD3AB;
  border: none;
  border-radius: 15px;
  padding: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(168, 230, 207, 0.3);
}

.redeem-button:hover:not(:disabled) {
  background-color: #a5cda5;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(168, 230, 207, 0.4);
}

.redeem-button:disabled, .redeem-button.redeemed {
  cursor: not-allowed;
  box-shadow: none;
}

.redeem-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 30px;
  height: 30px;
}

.redeem-icon-container .border-circle-icon {
  font-size: 2em;
  filter: drop-shadow(0 2px 4px rgba(255, 222, 89, 0.3));
}

.redeem-icon-container .circle-icon {
  font-size: 1.5em;
}

.redeem-icon-container .star-icon {
  font-size: 0.8em;
}

.redeemed-icon {
  font-size: 1.8em;
  color: #10b981;
  display: flex;
}

/* Pagination */
.page-link {
    border: 1px solid #cccccc;
}
.page-item .page-link {
    color: #008080;
}
.page-item.active .page-link {
    color: #fff;
    background-color: #008080;
    border-color: #008080;
}

/* modal TNC */
.terms-text {
  white-space: pre-line;
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