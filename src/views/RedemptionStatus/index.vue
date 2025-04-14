<template>
    <div class="d-flex mb-4">
        <h2>Overview of Reward Redemption</h2>
    </div>

    <div class="filter-container ">
        <div class="d-flex gap-3 ">
            <form class="search-container" role="search"> 
                <i class="fas fa-search search-icon"></i>
                <input class="form-control" type="search" placeholder="Search Employee Name" v-model="searchName">
                <!-- <button class="btn btn-success" type="submit">Search</button> -->
            </form>
            <form class="search-container" role="search"> 
                <i class="fas fa-search search-icon"></i>
                <input class="form-control" type="search" placeholder="Search Reward Name" v-model="searchReward">
                <!-- <button class="btn btn-success" type="submit">Search</button> -->
            </form>
            <select class="search-container form-select" v-model="searchStatus">
                <option value="">All Status</option>
                <option value="Received">Received</option>
                <option value="Not Yet Received">Not Yet Received</option>
            </select>
        </div>
        
        <!-- filter -->
        <div class="row align-items-center">
            <div class="col-md-auto">
                <p class="mb-0">Custom Date Range:</p>
            </div>
            <div class="col-md-auto">
                <div class="input-group">
                    <input type="date" class="form-control " id="startDate" placeholder="Start Date" v-model="startDate">
                </div>
            </div>
            <div class="col-auto">
                <p class="mb-0"> - </p>
            </div>
            <div class="col-md-auto">
                <div class="input-group">
                    <input type="date" class="form-control" id="endDate" placeholder="End Date" v-model="endDate">
                </div>
            </div>
        </div>
    </div>  
    
    <!-- table -->
    <div class="table-card">
        <table class="table">   
            <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Username</th>
                    <th scope="col">Redeemed On</th>
                    <th scope="col">Reward Name</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in paginatedLogs" :key="item.id">
                    <th>{{ item.id }}</th>
                    <td>{{ item.user.name }}</td>
                    <td>{{ item.redeemedOn }}</td>
                    <td>{{ item.reward.rewardName }}</td>
                    <td :class="item.status === 'Not Yet Received' ? 'text-danger' : 'text-success'">{{ item.status }}</td>
                    <td>
                        <button type="button" class="btn-edit" @click="openChangeStatusModel(item)">Change Status</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- pagination -->
    <div class="d-flex align-items-center mt-3 justify-content-start">
        <span class="me-3">Total: {{ totalLogs }}</span>
        
        <nav aria-label="Page navigation">
            <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <button class="page-link" @click="prevPage">Previous</button>
                </li>
                <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }">
                    <button class="page-link" @click="goToPage(page)">{{ page }}</button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <button class="page-link" @click="nextPage">Next</button>
                </li>
            </ul>
        </nav>
    </div>

    <!-- Modal for Change Status -->
    <div class="modal fade" id="changeRewardStatus" :class="{ show: showModal }" style="display: block" v-if="showModal">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <div>
                        <h3>Change Status</h3>
                        <span class="status-exp">Select a status to update the redemption status for this user.</span>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="radio-group">
                        <div class="radio-box form-check">
                            <input class="form-check-input" type="radio" name="status" id="received" value="Received" v-model="changedStatus">
                            <label class="form-check-label" for="received">Received</label>
                        </div>
                        <div class="radio-box form-check">
                            <input class="form-check-input" type="radio" name="status" id="not-received" value="Not Yet Received" v-model="changedStatus">
                            <label class="form-check-label" for="not-received">Not Yet Received</label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="showModal = false">Close</button>
                    <button type="button" class="btn btn-success" :disabled="isSaveDisabled" @click="saveChangedStatus">Save</button>
                </div>
            </div>
        </div>
    </div >
    <div class="modal-backdrop fade show" v-if="showModal"></div>

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { RewardRedemptionItem } from '@/interface/RewardInterface'
import { getRewardRedemption, patchRewardRedemption } from '@/api/reward';
import dayjs from 'dayjs';
import { isSuccess } from '@/utils/httpStatus';
import Swal from 'sweetalert2';


const tableData = ref<RewardRedemptionItem[]>([])
const currentRewardRedemption = ref<any>({});

// model
const showModal = ref(false)
const originalStatus = ref<'Received' | 'Not Yet Received'>('Not Yet Received'); // Holds the selected status value
const changedStatus = ref<'Received' | 'Not Yet Received'>('Not Yet Received');

// Click on "Change Status" button
const openChangeStatusModel = (item: any) => {
    currentRewardRedemption.value = item;
    const status = item.status === 'Received' ? 'Received' : 'Not Yet Received';
    originalStatus.value = status; // store original status
    changedStatus.value = status; // store changed status
    showModal.value = true;
};

// Disabled "Save" button unless the admin selects a different status
const isSaveDisabled = computed(() => {
    return changedStatus.value === originalStatus.value;
});

//fetch reward redemption information
const fetchRewardRedemption = () => {
    getRewardRedemption().then((res) => {
        tableData.value = res.data.data.results.map((item: any) => ({
            id: item.id,
            redeemedOn: dayjs(item.reward_redeemed_on).format("YYYY-MM-DD, HH:mm"),
            pointsDeducted: item.points_deducted,
            status: item.reward_redemption_status,
            reward: {
                rewardName: item.reward.reward_title,
                description: item.reward.reward_description,
                terms: item.reward.reward_terms_and_conditions,
                points: item.reward.reward_points_required,
                image: item.reward?.file?.file_url ?? '',                
                endDateTime: dayjs(item.reward.reward_end_date_time).format("YYYY-MM-DD, HH:mm"),
                quantity: item.reward.reward_quantity,
                status: item.reward.reward_status,
                createdOn: item.reward?.reward_created_date
            },
            user: {
                name: item.user.username
            }
        }))
    })
}
onMounted(fetchRewardRedemption)

// Saved changed redemption status of the reward
const saveChangedStatus = () => {
    const data = {
        reward_redemption_status: changedStatus.value
    }

    showModal.value = false;

    patchRewardRedemption(currentRewardRedemption.value.id, data).then((res) => {
        if (isSuccess(res.status)) {
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Reward status updated successfully",
                showConfirmButton: false,
                timer: 1500
            });
            fetchRewardRedemption()
        }
    })
}

// filter
const searchReward = ref('')
const searchName = ref('')
const searchStatus = ref('')
const startDate = ref('')
const endDate = ref('')

const filteredLogs = computed(() => {
  return tableData.value.filter(detail => {
    //search bar for reward name
    const matchRewardSearch = detail.reward.rewardName.toLowerCase().includes(searchReward.value.toLowerCase());

    //search bar for username
    const matchNameSearch = detail.user.name.toLowerCase().includes(searchName.value.toLowerCase());

    //search for specific status
    const matchStatusSearch = !searchStatus.value || detail.status === searchStatus.value
    
    //custom date range for received date
    const taskDate = new Date(detail.redeemedOn); // Convert string date to Date object
    const start = startDate.value ? new Date(startDate.value) : null;
    const end = endDate.value ? new Date(endDate.value) : null;

    const matchesDateRange = (!start || taskDate >= start) && (!end || taskDate <= end);

    return matchRewardSearch && matchesDateRange && matchNameSearch && matchStatusSearch;
  });
});

// pagination
const currentPage = ref(1);
const itemsPerPage = 10;

const totalLogs = computed(() => filteredLogs.value.length);
const totalPages = computed(() => Math.ceil(totalLogs.value / itemsPerPage));

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredLogs.value.slice(start, start + itemsPerPage);
});

// 翻页功能
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
const goToPage = (page: number) => {
  currentPage.value = page;
};

</script>

<style scoped>
.search-container {
    margin-bottom: 1rem;
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
.form-control {
    padding-left: 35px; /* Ensure text doesn't overlap the icon */
}

.form-control, .form-select {
    border-color: #000000;
}

.table-card {
    border: 1px solid #707070;
    padding: 2rem;
    margin-bottom: 1rem;
    border-radius: 20px;
}
.table th, .table td {
  padding: 1rem;
  vertical-align: middle;
  border-bottom: 1px solid #707070;
}

.btn-edit {
    border: none;
    color: white;
    padding: 0.375rem 0.75rem;
    border-radius: 0.25rem;
}
.btn-edit {
    background-color: #FFC107;
}
.btn-edit:hover {
    background-color: #e4ac03;
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

.pagination {
    display: flex;
    justify-content: center;
    margin-top: 15px;
}

/* Styling for Modal */
.modal {
    display: none;
}
.modal-content {
    padding: 15px;
    border-radius: 30px;
}
.modal-header, .modal-footer {
    border: none; 
}
.status-exp {
    color: #7F7F7F;
}
.radio-group {
    display: flex;
    flex-wrap: wrap; 
    gap: 20px; 
}
.radio-box {
    border: 1px solid #000000; 
    border-radius: 12px; 
    padding: 10px;
    display: flex; 
    align-items: center;
}
.radio-box .form-check-input {
    margin: 0; 
    margin-right: 20px; 
    vertical-align: middle;
}
.form-check-input {
    border: 1px solid #707070; 
}
</style>
