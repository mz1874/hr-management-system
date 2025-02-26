<template>
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Reward Management</h2>
        <button type="button" class="btn btn-danger" @click="openResetModal">Reset All User Point</button>
    </div>

    <div class="filter-container">
        <div class="d-flex gap-3">
            <form class="search-container" role="search"> 
                <i class="fas fa-search search-icon"></i>
                <input class="form-control" type="search" placeholder="Search Reward Name" v-model="searchReward">
                <!-- <button class="btn btn-success" type="submit">Search</button> -->
            </form>
            <form class="search-container" role="search"> 
                <i class="fas fa-search search-icon"></i>
                <input class="form-control" type="number" placeholder="Search Points" v-model="searchPoint">
                <!-- <button class="btn btn-success" type="submit">Search</button> -->
            </form>
            <select class="search-container form-select" v-model="searchStatus">
                <option value="">All Status</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Expired">Expired</option>
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
        <div class="d-flex justify-content-between align-items-center mb-1">
            <div></div>
            <button type="button" class="btn btn-success" @click="openRewardModal">Create A New Reward</button>
        </div>
        <table class="table">   
            <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Reward Name</th>
                    <th scope="col">Points</th>
                    <th scope="col">Created On</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in paginatedLogs" index="item.id">
                    <td>{{ item.id}}</td>
                    <td>{{ item.rewardName}}</td>
                    <td>{{ item.points}}</td>
                    <td>{{ item.createdOn}}</td>
                    <td :class="item.status === 'Ongoing' ? 'text-success' : 'text-danger'">{{ item.status}}</td>
                    <td>
                        <button type="button" class="btn btn-primary btn-action" @click="openViewModal(item)">View</button>
                        <button type="button" class="btn btn-warning btn-action" @click="openEditModal(item)">Edit</button>
                        <button type="button" class="btn btn-danger btn-action" @click="openDeleteModal(item)">Delete</button>                    
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

    <!-- Create Reward Modal -->
    <div class="modal fade" id="createReward" :class="{ show: showModal }" style="display: block" v-if="showModal">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="header-content">
                        <h3>
                            {{ modalType === 'edit' ? 'Edit Reward':
                            modalType === 'create' ? 'Create New Reward' :
                            modalType === 'view' ? 'View Reward' : ''}}
                        </h3>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <!-- Left Side -->
                        <div class="col-md-6">
                            <form>
                                <div class="form-group mb-4">
                                    <label class="form-label">Reward Image:</label>
                                    <label for="input-file" id="drop-area">
                                        <input type="file" accept="image/*" id="input-file" hidden @change="handleImageChange" :disabled="modalType === 'view'">
                                        <div id="img-view" v-if="currentReward.image">
                                            <img :src="getImagePath(currentReward.image)" alt="Reward Image" class="img-fluid">
                                        </div>
                                        <div id="img-view" v-else>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-card-image" viewBox="0 0 16 16">
                                                <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                                                <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54L1 12.5v-9a.5.5 0 0 1 .5-.5z"/>
                                            </svg>
                                            <span id="img-name">Click to select image</span>                                                    
                                        </div>
                                    </label>
                                </div>
                                <div class="form-group mb-4">
                                    <label class="form-label">Reward Name:</label>
                                    <input type="text" class="form-control" placeholder="Enter reward name" v-model="currentReward.rewardName" :disabled="modalType === 'view'">
                                </div>
                                <div class="form-group mb-4">
                                    <label class="form-label">Points:</label>
                                    <input type="number" class="form-control" placeholder="Enter points" v-model="currentReward.points" :disabled="modalType === 'view'">
                                </div>
                                <div class="form-group mb-4">
                                    <label class="form-label">Quantity Available:</label>
                                    <input type="number" class="form-control" placeholder="Enter quantity of the reward" v-model="currentReward.quantity" :disabled="modalType === 'view'">
                                </div>
                                <div class="form-group mb-4">
                                    <label class="form-label">End Date & Time:</label>
                                    <div class="row g-2">
                                        <div class="col-md-6">
                                            <!-- @change="validateEndDate" -->
                                            <input type="date" class="form-control" placeholder="Select end date" v-model="currentReward.endDate" :disabled="modalType === 'view'">
                                        </div>
                                        <div class="col-md-6">
                                            <input type="time" class="form-control" placeholder="Select end time" v-model="currentReward.endTime" :disabled="modalType === 'view'">
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <!-- Right Side -->
                        <div class="col-md-6">
                            <form>
                                <div class="form-group mb-4">
                                    <label class="form-label">Reward Description:</label>
                                    <textarea class="form-control auto-resize" placeholder="Enter reward description" rows="6" v-model="currentReward.description" :disabled="modalType === 'view'"></textarea>
                                </div>
                                <div class="form-group mb-4">
                                    <label class="form-label">Terms & Conditions:</label>
                                    <textarea class="form-control auto-resize" placeholder="Enter terms & conditions" rows="15" v-model="currentReward.terms" :disabled="modalType === 'view'"></textarea>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="showModal = false">Close</button>

                    <!-- Create Button (when creating a new reward) -->
                    <button v-if="modalType === 'create'" type="button" class="btn btn-success" @click="addReward">Create</button>
                    <!-- Save Button (when editing an existing reward) -->
                    <button v-if="modalType === 'edit'" type="button" class="btn btn-primary" @click="saveEditedReward">Save</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showModal"></div>

    <!-- Modal for delete and reset point confirmation -->
    <div class="modal fade" id="deleteReward" :class="{ show: showRemoveModal }" style="display: block" v-if="showRemoveModal">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title" id="deleteRewardLabel">Are you sure?</h3>
                </div>
                <div class="modal-body">
                    <span class="text-muted" v-if="modalRemoveType === 'delete'">This action cannot be undone. This will permanently delete the reward, <b>{{currentReward.rewardName}}</b>.</span>
                    <span class="text-muted" v-if="modalRemoveType === 'reset'">This action cannot be undone. All users' points will be reset.</span>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="showRemoveModal = false">Close</button>
                    <button v-if="modalRemoveType === 'delete'" type="button" class="btn btn-danger" @click="deleteReward">Confirm</button>
                    <button v-if="modalRemoveType === 'reset'" type="button" class="btn btn-danger" @click="resetReward">Reset</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showRemoveModal"></div>

</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface RewardItem {
    id: number
    rewardName: string
    points: number
    createdOn: string
    image: string
    quantity: number
    endDate: string
    endTime: string
    description: string
    terms: string
    status: string
}

const tableData = ref<RewardItem[]>([
    {
        id: 1, 
        rewardName: 'Jaya Grocer Gift Card', 
        points: 50, 
        createdOn: '2024-06-30 11:27:07', 
        image: "/dist/assets/Jaya_Grocer_Gift_Card.png",
        quantity: 20,  
        endDate: "2025-02-26", 
        endTime: "23:59", 
        status: "",
        description: "RM100 Jaya Grocer's Gift Card. Vouchers received will be valid for a minimum period of 6 months.",
        terms: `1. This gift card is valid for one transaction only and is not redeemable or exchangeable for cash.

2. This gift card is valid at all Jaya Grocer outlets.

3. This gift card is valid for 6 months only from the date of card activation.

4. During the redemption of goods, if the value of the goods is less than the amount on the gift card, no refund will be given for the remaining unused balance.

5. If the value of goods is more than the amount on the gift card, then the difference should be paid by the bearer. `
    },
    {
        id: 2, 
        rewardName: 'McDonald Coupon', 
        points: 100, 
        createdOn: '2024-06-30 11:27:07', 
        image: "/dist/assets/McDonald_Gift_Card.png",
        quantity: 20, 
        endDate: "2025-02-05", 
        endTime: "23:59",
        status: "",
        description: "Exclusive Sweet Chili Fish Wrap Drive Thru Combo Promo for only RM11.50. ", 
        terms: `1. This gift card is valid for one transaction only and is not redeemable or exchangeable for cash.

2. This gift card is valid at all Starbuck outlets.

3. This gift card is valid for 6 months only from the date of card activation.

4. During the redemption of goods, if the value of the goods is less than the amount on the gift card, no refund will be given for the remaining unused balance. `
    }, 
])

const updateRewardStatus = (reward: RewardItem) => {
    const currentDate = new Date();
    const endDateTime = new Date(`${reward.endDate} ${reward.endTime}`);

    reward.status = currentDate < endDateTime ? 'Ongoing' : 'Expired';
};

// Update statuses on mount
onMounted(() => {
    tableData.value.forEach(updateRewardStatus);
});

const showModal = ref(false)
const currentReward = ref<Partial<RewardItem>>({});

const modalType = ref<'create' | 'edit' | 'view'>('create')

const openRewardModal = () => {
    currentReward.value = {
        id: tableData.value.length + 1, // Generate unique ID
        rewardName: '',
        points: 0, // Set default points
        createdOn: new Date().toISOString().slice(0, 19).replace("T", " "), // Current timestamp
        image: "",
        quantity: 0,
        endDate: "",
        endTime: "",
        description: "",
        terms: "",
    }
    modalType.value = 'create'  
    showModal.value = true
}

const openViewModal = (reward: RewardItem) => {
    currentReward.value = { ...reward }
    modalType.value = 'view'
    showModal.value = true
}

const openEditModal = (reward: RewardItem) => {
    currentReward.value = { ...reward }
    modalType.value = 'edit'
    showModal.value = true
}

const showRemoveModal = ref(false)
const modalRemoveType = ref<'delete' | 'reset'>('delete')
const openDeleteModal = (reward: RewardItem) => {
    currentReward.value = reward
    modalRemoveType.value = 'delete'
    showRemoveModal.value = true
}
const openResetModal = () => {
    modalRemoveType.value = 'reset'
    showRemoveModal.value = true
}

const saveEditedReward = () => {
    const index = tableData.value.findIndex(item => item.id === currentReward.value.id)
    if (index !== -1) {
        tableData.value[index] = { ...(currentReward.value as RewardItem) }
        updateRewardStatus(tableData.value[index]); 
    }
    showModal.value = false
}

// const currentDate = new Date().toISOString().split("T")[0];
// const validateEndDate = () => {
//     if (currentReward.value.endDate && currentReward.value.endDate < currentDate) {
//         alert("End date cannot be earlier than today.");
//     }
// };

const addReward = () => {
    tableData.value.push({
        id: tableData.value.length + 1,
        rewardName: currentReward.value.rewardName || "Untitled Reward",
        points: currentReward.value.points || 0,
        createdOn: new Date().toISOString().slice(0, 19).replace("T", " "),
        image: currentReward.value.image || "",
        quantity: currentReward.value.quantity || 0,
        endDate: currentReward.value.endDate || "",
        endTime: currentReward.value.endTime || "",
        description: currentReward.value.description || "",
        terms: currentReward.value.terms || "",
        status: "Ongoing"
    })
    showModal.value = false
}

const deleteReward = () => {
    tableData.value = tableData.value.filter(item => item.id !== currentReward.value.id)
    showRemoveModal.value = false
}

const resetReward = () => {
    showRemoveModal.value = false
}

const getImagePath = (image?: string) => {
    return currentReward.value.image || image;
};
const handleImageChange = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                currentReward.value.image = e.target.result as string;
            }
        };
        reader.readAsDataURL(file);
    }
};

// filter
const searchReward = ref('')
const searchPoint = ref('')
const searchStatus = ref('')
const startDate = ref('')
const endDate = ref('')

const filteredLogs = computed(() => {
  return tableData.value.filter(detail => {
    //search bar for reward name
    const matchRewardSearch = detail.rewardName.toLowerCase().includes(searchReward.value.toLowerCase());

    //search bar for points
    const matchPointSearch = searchPoint.value === '' || detail.points.toString().includes(searchPoint.value);

     //search for specific status
     const matchStatusSearch = !searchStatus.value || detail.status === searchStatus.value
    
    //custom date range for received date
    const taskDate = new Date(detail.createdOn); // Convert string date to Date object
    const start = startDate.value ? new Date(startDate.value) : null;
    const end = endDate.value ? new Date(endDate.value) : null;

    const matchesDateRange = (!start || taskDate >= start) && (!end || taskDate <= end);

    return matchRewardSearch && matchesDateRange && matchPointSearch && matchStatusSearch;
  });
});

// pagination
const currentPage = ref(1);
const itemsPerPage = 5;

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
.search-container  .form-control {
    padding-left: 35px; /* Ensure text doesn't overlap the icon */
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

.btn-action {
    padding: 0.25rem 1rem;
    margin-left: 0.5rem;
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
.form-control, .form-select {
    border-color: #000000;
}
.row {
    display: flex;
    align-items: stretch; /* Ensures columns and dividing line stretch to match tallest content */
}
.col-md-6:not(:last-child) {
    border-right: 1px solid #707070; /* Vertical line between columns */
    padding-right: 30px;
}
.col-md-6:last-child {
    padding-left: 30px;
}
.auto-resize {
    resize: none; /* Prevent manual resizing */
    overflow: hidden; /* Hide overflow content */
}

#drop-area {
    width: 100%;  
    max-width: 500px;
    height: 300px;
    text-align: center;
    border-radius: 20px;
    border: 2px dashed #000000;
    position: relative;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}
#img-view {
    width: 100%; 
    height: 100%;
    border-radius: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    overflow: hidden;
}
#img-view svg {
    width: 40px;
    height: 40px;
    margin-bottom: 10px;
    color: #7F7F7F;
}
#img-name {
    font-size: 16px;
    color: #bbb;
    text-align: center;
}

input:disabled, textarea:disabled {
  background-color: transparent !important; 
  color: black !important; 
}

/* For image preview */
#resetPoint .modal-header, #resetPoint .modal-footer {
    border: none;
}
#deleteReward .modal-header, #deleteReward .modal-footer {
    border: none;
}

</style>
