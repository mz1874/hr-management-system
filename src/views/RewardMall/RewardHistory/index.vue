
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
            <input class="form-control" type="search" placeholder="Search Reward Name" v-model="searchQuery">
        </form>

        <!-- Custom Date Range (Right) -->
        <div class="d-flex align-items-center gap-3">
            <input type="date" class="form-control" id="startDate" placeholder="Start Date" v-model="startDate">
            <span> - </span>
            <input type="date" class="form-control" id="endDate" placeholder="End Date" v-model="endDate">
        </div>
  </div>

  <div class="table-card">
    <table class="table">
        <thead>
            <tr>
                <th scope="col">ID</th>
                <th scope="col">Redeemed On</th>
                <th scope="col">Points</th>
                <th scope="col">Reward Name</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="details in paginatedLogs" :key="details.id">
                <td>{{ details.id}}</td>
                <td>{{ details.redeemed}}</td>
                <td>- {{ details.points}}</td>
                <td>{{ details.rewardName}}</td>
                <td :class="details.status === 'Not Received' ? 'text-danger' : 'text-success'">
                    {{ details.status }}
                </td>
                <td><button type="button" class="btn btn-primary" @click="openViewModal(details)">View Details</button></td>
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

  <!-- View Reward Details Modal -->
  <div class="modal fade" id="viewRewardModal" ref="viewRewardModal">
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
                                <div id="drop-area">
                                    <img :src="selectedDetails.img" alt="Reward Image" class="image" disabled>
                                </div>
                            </div>
                            <div class="form-group mb-4">
                                <label class="form-label">Reward Name:</label>
                                <input type="text" class="form-control" :value=" selectedDetails.rewardName " disabled>
                            </div>
                            <div class="form-group mb-4">
                                <label class="form-label">Points:</label>
                                <input type="text" class="form-control" :value="selectedDetails.points" disabled>
                            </div>
                            <div class="form-group mb-4">
                                <label class="form-label">End Date & Time:</label>
                                <div class="row g-2">
                                    <div class="col-md-6">
                                        <input type="date" class="form-control" :value="selectedDetails.endDate" disabled>
                                    </div>
                                    <div class="col-md-6">
                                        <input type="time" class="form-control" :value="selectedDetails.endTime" disabled>
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
                                <textarea class="form-control auto-resize" rows="6" oninput="resizeTextarea(this)" disabled>{{ selectedDetails.rewardDescription }}</textarea>
                            </div>
                            <div class="form-group mb-4">
                                <label class="form-label">Terms & Conditions:</label>
                                <textarea class="form-control auto-resize" rows="15" oninput="resizeTextarea(this)" disabled>{{ selectedDetails.terms }}</textarea>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
 </div>


</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Modal } from "bootstrap";
import { useRouter } from 'vue-router';

const getImagePath = (img: any) => {
  return new URL(`/dist/assets/${img}`, import.meta.url).href;
};

const rewardDetails = ref([
  {
    id: 1, 
    img: new URL('@/assets/Jaya_Grocer_Gift_Card.png', import.meta.url).href,
    redeemed: "2024-06-30 11:27:07", 
    points: "50", 
    rewardName: "Jaya Grocer's Gift Card", 
    status: "Not Received", 
    endDate: "2025-02-05", 
    endTime: "23:59",
    rewardDescription: "RM100 Jaya Grocer's Gift Card. Vouchers received will be valid for a minimum period of 6 months.",
    terms: `1. This gift card is valid for one transaction only and is not redeemable or exchangeable for cash.

2. This gift card is valid at all Jaya Grocer outlets.

3. This gift card is valid for 6 months only from the date of card activation.

4. During the redemption of goods, if the value of the goods is less than the amount on the gift card, no refund will be given for the remaining unused balance.

5. If the value of goods is more than the amount on the gift card, then the difference should be paid by the bearer.
    `
  }
]);

//search bar and custom date range
const searchQuery = ref('')
const startDate = ref('')
const endDate = ref('')

const filteredLogs = computed(() => {
  return rewardDetails.value.filter(detail => {
    //search bar for task name
    const matchesSearch = detail.rewardName.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    //custom date range for received date
    const taskDate = new Date(detail.redeemed); // Convert string date to Date object
    const start = startDate.value ? new Date(startDate.value) : null;
    const end = endDate.value ? new Date(endDate.value) : null;

    const matchesDateRange = (!start || taskDate >= start) && (!end || taskDate <= end);

    return matchesSearch && matchesDateRange;
  });
});

// 分页相关
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

//View Modal
const viewRewardModal = ref();
const selectedDetails = ref({ img: '',rewardName: '', points: '', endDate: '', endTime: '', rewardDescription: '', terms: '' });

const openViewModal = (item:any) => {
  selectedDetails.value = item;
  const modal = new Modal(viewRewardModal.value);
  modal.show();
};

//navigate back to reward mall page
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

.table th,
.table td {
  padding: 1rem;
  vertical-align: middle;
  border-bottom: 1px solid #707070;
}

.btn-primary {
    border: none;
    background-color: #4EA5EF;
    color: white;
}
.btn-primary:hover {
    background-color: #3d95e2;
    color: white;
    border: none;
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
.form-control {
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
/* .auto-resize {
    resize: none; 
    overflow: hidden; 
} */
input:disabled, textarea:disabled {
  background-color: transparent !important; 
  color: black !important; 
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

/* For image preview */
#drop-area img {
    width: 100%; 
    height: 100%;
    border-radius: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    overflow: hidden;
}

</style>
