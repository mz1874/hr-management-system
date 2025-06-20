<template>
<div class="main-content">
    <div class="d-flex mb-4">
        <h2>Overview of Reward Redemption</h2>
    </div>

    <div class="filter-container ">
        <div class="d-flex gap-3 ">
            <form class="search-container" role="search"> 
                <i class="fas fa-search search-icon"></i>
                <input class="form-control" type="search" placeholder="Search Employee Name" v-model="userSearch">
            </form>
            <form class="search-container" role="search"> 
                <i class="fas fa-search search-icon"></i>
                <input class="form-control" type="search" placeholder="Search Reward Name" v-model="rewardSearch">
            </form>
            <select class="search-container form-select" v-model="statusSearch">
                <option value="">All Status</option>
                <option value="Received">Received</option>
                <option value="Not Yet Received">Not Yet Received</option>
            </select>
        </div>
        
        <!-- filter -->
        <div class="row align-items-center">
            <div class="col-md-auto">
                <p class="mb-0">Redeemed On Filter:</p>
            </div>
            <div class="col-md-auto">
                <div class="input-group">
                    <input type="date" class="form-control " id="startDate" placeholder="Start Date" v-model="searchStartDate">
                </div>
            </div>
            <div class="col-auto">
                <p class="mb-0"> - </p>
            </div>
            <div class="col-md-auto">
                <div class="input-group">
                    <input type="date" class="form-control" id="endDate" placeholder="End Date" v-model="searchEndDate">
                </div>
            </div>
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
                            <th scope="col">Name</th>
                            <th scope="col">Account</th>
                            <th scope="col">Redeemed On</th>
                            <th scope="col">Reward Name</th>
                            <th scope="col">Status</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="tableData.length === 0">
                            <td colspan="6" class="text-center text-muted py-5">
                                No history found.
                            </td>
                        </tr>
                        <tr v-else v-for="item in tableData" :key="item.id">
                            <th>{{ item.id }}</th>
                            <td>{{ item.user.staffName }}</td>
                            <td>{{ item.user.username }}</td>
                            <td>{{ item.redeemedOn }}</td>
                            <td class="reward-name">{{ item.rewardTitle }}</td>
                            <td class="fw-bold" :class="item.status === 'Not Yet Received' ? 'text-danger' : 'text-success'">{{ item.status }}</td>
                            <td>
                                <button type="button" class="btn-edit" @click="openChangeStatusModel(item)">Change Status</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- Pagination & total count -->
            <div class="d-flex align-items-center mt-3 justify-content-start">
                <!-- Left: Total count -->
                <span class="me-3 mb-3">Total Logs: {{ totalCount }} </span>

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
        </div>
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
                    <div class="form-group mb-2">
                  
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
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="showModal = false">Close</button>
                    <button type="button" class="btn btn-success" :disabled="isSaveDisabled" @click="saveChangedStatus">Save</button>
                </div>
            </div>
        </div>
    </div >
    <div class="modal-backdrop fade show" v-if="showModal"></div>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import type { RewardRedemptionItem } from '@/interface/RewardInterface'
import { getAllRewardRedemption, patchRewardRedemption } from '@/api/reward';
import dayjs from 'dayjs';
import { isSuccess } from '@/utils/httpStatus';
import Swal from 'sweetalert2';

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

// ======================================================
const tableData = ref<RewardRedemptionItem[]>([])
const currentRewardRedemption = ref<any>({});
const showModal = ref(false)
const originalStatus = ref<'Received' | 'Not Yet Received'>('Not Yet Received'); // Holds the selected status value
const changedStatus = ref<'Received' | 'Not Yet Received'>('Not Yet Received');

// ===================== Open Status modal =====================
const openChangeStatusModel = (item: any) => {
    currentRewardRedemption.value = item;
    const status = item.status === 'Received' ? 'Received' : 'Not Yet Received';
    originalStatus.value = status; // store original status
    changedStatus.value = status; // store changed status
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

// ===================== Disabled "Save" button unless the admin selects a different status =====================
const isSaveDisabled = computed(() => {
    return changedStatus.value === originalStatus.value;
});

// ===================== Search and Pagination =====================
const rewardSearch = ref('')
const userSearch = ref('')
const statusSearch = ref('')
const searchStartDate = ref('')
const searchEndDate = ref('')

const currentPage = ref(1)
const pageSize = 10
const totalCount = ref(0)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) fetchRewardRedemption(page)
}

// ===================== Fetch reward redemption information =====================
const fetchRewardRedemption = (page = 1) => {
    currentPage.value = page

  getAllRewardRedemption(
    page, 
    rewardSearch.value.trim(), 
    userSearch.value.trim(), 
    statusSearch.value.trim(),
    searchStartDate.value,
    searchEndDate.value)
    .then((res) => {
        console.log(res.data)
        totalCount.value = res.data.data.count;  
        tableData.value = res.data.data.results.map((item: any) => ({
            id: item.id,
            redeemedOn: dayjs(item.reward_redeemed_on).format("YYYY-MM-DD, HH:mm"),
            rewardTitle: item.reward_title_stored,
            rewardDescription: item.reward_description_stored,
            rewardTerms: item.reward_terms_stored,
            rewardEndDateTime: item.reward_end_date_time_stored,
            rewardImageId: item.reward_image_id_stored,
            rewardImageUrl: item.reward_image_url_stored,
            pointsDeducted: item.points_deducted,
            status: item.reward_redemption_status,
        user: {
            username: item.user.username,
            staffName: item.user.staffName
        },
    }));
  });
};

onMounted(fetchRewardRedemption)
watch([rewardSearch, userSearch, statusSearch, searchStartDate, searchEndDate], () => {
  fetchRewardRedemption(1) // Reset to page 1 on any search input change
})

// ===================== Saved changed redemption status of the reward =====================
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
    border-color: #ababab;
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

.btn-edit {
    border: none;
    color: white;
    padding: 0.375rem 0.75rem;
    border-radius: 0.25rem;
}
.btn-edit {
    background-color: #ffc308;
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
    border: 1px solid #ababab; 
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
