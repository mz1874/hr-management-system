
<template>
    <div class="title-page mb-4">
        <svg @click="goToRewardMall()" xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-arrow-left-short" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"/>
        </svg>
        <h2>Reward History</h2>
    </div>

    <div class="filter-container d-flex align-items-center gap-5">
        <!-- Search Bar (Left) -->
        <form class="search-container" role="search">
            <i class="fas fa-search search-icon"></i>
            <input class="form-control" type="search" placeholder="Search Reward Name" v-model="rewardSearch">
        </form>

        <!-- Custom Date Range (Right) -->
        <div class="d-flex align-items-center gap-3">
            <input type="date" class="form-control" id="startDate" placeholder="Start Date" v-model="searchStartDate">
            <span> - </span>
            <input type="date" class="form-control" id="endDate" placeholder="End Date" v-model="searchEndDate">
        </div>
    </div>

    <div class="card">
        <div class="card-body">
            <!-- table -->
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Reward Name</th>
                            <th scope="col">Redeemed On</th>
                            <th scope="col">Points</th>
                            <th scope="col">Status</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in tableData" :key="item.id">
                            <td>{{ item.id }}</td>
                            <td class="reward-name">{{ item.rewardTitle }}</td>
                            <td>{{ item.redeemedOn }}</td>
                            <td>- {{ item.pointsDeducted }}</td>
                            <td class="fw-bold" :class="item.status === 'Not Yet Received' ? 'text-danger' : 'text-success'">
                                {{ item.status }}
                            </td>
                            <td><button type="button" class="btn btn-primary" @click="openViewModal(item)">View Details</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- pagination -->
            <div class="d-flex align-items-center mt-3 justify-content-start">
                <span class="me-3">Total: {{ totalCount }}</span>
                <nav>
                    <ul class="pagination mb-0">
                        <li :class="['page-item', { disabled: currentPage === 1 }]">
                            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Previous</a>
                        </li>

                        <li v-for="page in totalPages" :key="page" :class="['page-item', { active: currentPage === page }]">
                            <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                        </li>

                        <li :class="['page-item', { disabled: currentPage === totalPages }]">
                            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Next</a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>

    <!-- View Reward Details Modal -->
    <div class="modal fade overflow-hidden" id="viewRewardModal" ref="viewRewardModal" :class="{ show: showModal }" style="display: block" v-if="showModal">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="header-content">
                        <h3>Reward Details</h3>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <!-- Left Side -->
                        <div class="col-md-6">
                            <form>
                                <div class="form-group mb-4">
                                    <label class="form-label">Reward Image:</label>                                                                                
                                    <div v-if="currentReward.rewardImageUrl">
                                        <label for="input-file" id="drop-area" class="me-2 flex-grow-1">
                                            <div id="img-view" v-if="currentReward.rewardImageUrl">
                                                <img :src="currentReward.rewardImageUrl" :alt="currentReward.rewardImageUrl" class="img-fluid" disabled>
                                            </div>        
                                        </label>
                                    </div>
                                    <!-- If no image -->
                                    <div v-else>
                                        <span class="text-muted">None</span>
                                    </div>
                                </div>  
                                <div class="form-group mb-4">
                                    <label class="form-label">Reward Name:</label>
                                    <input type="text" class="form-control" v-model="currentReward.rewardTitle" disabled>
                                </div>
                                <div class="form-group mb-4">
                                    <label class="form-label">Points:</label>
                                    <input type="text" class="form-control" v-model="currentReward.pointsDeducted" disabled>
                                </div>
                                <div class="form-group mb-4">
                                    <label class="form-label">End Date & Time:</label>
                                    <input type="text" class="form-control" v-model="currentReward.rewardEndDateTime" disabled>
                                </div>
                            </form>
                        </div>

                        <!-- Right Side -->
                        <div class="col-md-6">
                            <form>
                                <div class="form-group mb-4">
                                    <label class="form-label">Reward Description:</label>
                                    <textarea class="form-control auto-resize" rows="6" oninput="resizeTextarea(this)" disabled>{{ currentReward.rewardDescription }}</textarea>
                                </div>
                                <div class="form-group mb-4">
                                    <label class="form-label">Terms & Conditions:</label>
                                    <textarea class="form-control auto-resize" rows="15" oninput="resizeTextarea(this)" disabled>{{ currentReward.rewardTerms }}</textarea>
                                </div>
                                
                            </form>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="showModal=false">Close</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showModal"></div>



</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getReward, getUserRewardRedemption } from '@/api/reward';
import type { RewardRedemptionItem} from '@/interface/RewardInterface.ts'
import dayjs from 'dayjs';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';  
import { getCurrentUser } from '@/api/login';

// ===================== Fetch User =====================
let currentUserData = reactive<any>({});

const fetchUserId = async () => {
  try {
    const res = await getCurrentUser();
    Object.assign(currentUserData, res.data.data);
  } catch (err) {
    console.error("Error fetching user:", err);
  }
};

// ===================== Fetch Reward Redemption =====================
const tableData = ref<RewardRedemptionItem[]>([]);

const rewardSearch = ref('')
const searchStartDate = ref('')
const searchEndDate = ref('')

const currentPage = ref(1)
const pageSize = 10
const totalCount = ref(0)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) fetchRewardRedemption(page)
}

const fetchRewardRedemption = (page = 1) => {
    currentPage.value = page

    getUserRewardRedemption(
    currentUserData.id,
    page, 
    rewardSearch.value.trim(), 
    searchStartDate.value,
    searchEndDate.value)
    .then((res) => {
        console.log(res.data)

        totalCount.value = res.data.data.count;  
        tableData.value = res.data.data.results.map((item: any) => {            
            return {
                id: item.id,
                redeemedOn: dayjs(item.reward_redeemed_on).format("YYYY-MM-DD, HH:mm"),
                rewardTitle: item.reward_title_stored,
                rewardDescription: item.reward_description_stored,
                rewardTerms: item.reward_terms_stored,
                rewardEndDateTime: dayjs(item.reward_end_date_time_stored).format("YYYY-MM-DD, HH:mm"),
                rewardImageId: item.reward_image_id_stored,
                rewardImageUrl: item.reward_image_url_stored,
                pointsDeducted: item.points_deducted,
                status: item.reward_redemption_status,         
            };
        });
    })
}
onMounted(async () => { 
    await fetchUserId();    
    fetchRewardRedemption();
})
watch([rewardSearch, searchStartDate, searchEndDate], () => {
  fetchRewardRedemption(1) // Reset to page 1 on any search input change
})


// ===================== Open modal =====================
const currentReward = ref<any>({})

const showModal = ref(false);

const openViewModal = (item:any) => {
    console.log("Opening modal with data:", item);
    console.log("File details:", item.rewardImageUrl);
    currentReward.value = item;
    showModal.value = true;
    
};

// ===================== Manage background scrolling =====================
watch(showModal, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

// ===================== Navigate back to reward mall page =====================
const router = useRouter()
function goToRewardMall()
{
  router.push('/home/reward-mall');
}


</script>



<style scoped>
.title-page {
    display: flex;
    align-items: center;
    gap: 20px; /* Adjust spacing between the icon and the text */
}

.title-page svg:hover {
    cursor: pointer;
}

.title-page h2 {
    margin-bottom: 0; 
}

.search-container {
  width: 100%; /* Ensure form controls take up available width */
    max-width: 350px; /* Set a fixed maximum width */
    display: flex;
    align-items: center;
    position: relative;
}
.filter-container {
    margin-bottom: 2rem;
}
.search-icon {
    position: absolute;
    left: 10px;  /* Adjust left padding */
    top: 50%;
    transform: translateY(-50%);
    color: gray; /* Icon color */
}
.filter-container .form-control {
    padding-left: 35px; /* Ensure text doesn't overlap the icon */
}

.table-card {
    border: 1px solid #707070;
    padding: 2rem;
    margin-bottom: 1rem;
    border-radius: 20px;
}
.table th {
    font-weight: normal;
    color: #666;
}

.table th, .table td {
    vertical-align: middle;
}

.reward-name {
  max-width: 200px; 
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

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

/* Styling for modal */
.modal {
    display: none;
}
.modal-content {
    padding: 15px;
}
.form-label {
    font-weight: bold;
}
.form-control {
    border-color: #ababab;
}
.row {
    display: flex;
    align-items: stretch; /* Ensures columns and dividing line stretch to match tallest content */
}
.col-md-6:not(:last-child) {
    border-right: 1px solid #ababab; /* Vertical line between columns */
    padding-right: 30px;
}
.col-md-6:last-child {
    padding-left: 30px;
}

input:disabled, textarea:disabled {
  background-color: transparent !important; 
  color: black !important; 
}

#drop-area {
    min-height: 300px;
    max-height: 400px; /* Add maximum height constraint */
    background: white;
    border-radius: 16px;
    padding: 15px;
    border: 1px solid #ababab;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    cursor: pointer;
}

#img-view {
    width: 100%; 
    height: 100%;
    max-height: 300px; /* Constrain the image container height */
    border-radius: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    overflow: hidden;
}

#img-view img {
    max-width: 100%;
    max-height: 250px; /* Maximum height for images */
    width: auto;
    height: auto;
    object-fit: contain; /* Maintain aspect ratio and fit within bounds */
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

</style>
