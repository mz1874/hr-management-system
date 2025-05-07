<template>
  <div class="title-page mb-4">
    <svg @click="goToRewardMall()" xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-arrow-left-short" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"/>
    </svg>
    <h2>Point Details</h2>
  </div>

  <div class="filter-container d-flex align-items-center gap-5">
    <!-- Search Bar (Left) -->
    <form class="search-container" role="search">
      <i class="fas fa-search search-icon"></i>
      <input class="form-control" type="search" placeholder="Search Task Name" v-model="searchQuery">
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
          <th scope="col">Received</th>
          <th scope="col">Points</th>
          <th scope="col">Task Name</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="details in paginatedLogs" :key="details.id">
          <td>{{ details.id}}</td>
          <td>{{ details.pointsReceivedOn}}</td>
          <td class="text-success">+ {{ details.pointsValue}}</td>
          <td>{{ details.kpi.taskTitle}}</td>
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

  <!-- View Task Details Modal -->
  <div class="modal fade" id="viewTaskModal" :class="{ show: showModal }" style="display: block" v-if="showModal">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content p-10">
        <div class="modal-header">
          <div class="header-content">
            <h3>Task Details</h3>
          </div>
        </div>
        <div class="modal-body">
          <form>
            <div class="form-group mb-4">
              <label class="form-label">Task Name: </label>
              <input type="text" class="form-control" :value="currentPointEarned.kpi.taskTitle" disabled>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Task Description:</label>
              <textarea class="form-control" disabled>{{ currentPointEarned.kpi.taskDescription }}</textarea>
            </div>

            <div class="form-group mb-4">
              <div class="row">
                <div class="col-md-6 mb-2">
                  <label class="form-label">Start Date:</label>
                  <input type="date" class="form-control" id="startDate" placeholder="Start Date" :value="currentPointEarned.kpi.startDate" disabled>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Completion Date:</label>
                  <input type="date" class="form-control" id="endDate" placeholder="End Date" :value="currentPointEarned.kpi.endDate" disabled>
                </div>
              </div>
            </div>

            <div class="form-group mb-4">
              <label class="form-label">Points Given:</label>
              <input type="number" class="form-control" :value="currentPointEarned.kpi.pointsEarned" disabled>
            </div>
          </form>          
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showModal = false">Close</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showModal"></div>

</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { PointEarnedHistory } from '@/interface/RewardInterface.ts';
import { getPointEarnedHistory } from '@/api/reward';
import type { Point } from 'chart.js';

const currentPointEarned = ref<any>({})

const tableData = ref<PointEarnedHistory[]>([])

const fetchPointEarned = () => {
  getPointEarnedHistory().then((res) => {
    console.log(res.data)

    tableData.value = res.data.data.results.map((item: any) => ({
      id: item.id,
      user: item.user,
      kpi: {
        taskTitle: item.task_title,
        taskDescription: item.task_description,
        startDate: item.task_start_date,
        endDate: item.task_completion_date,
        pointsGiven: item.points_earned,
      },
      pointsReceivedOn: item.points_received_on,
      pointsValues: item.points_values
    }))
  })
}
onMounted(fetchPointEarned);

//View Modal
const showModal = ref(false);

const openViewModal = (item: any) => {
  currentPointEarned.value = item;
  showModal.value = true;
};

//search bar and custom date range
const searchQuery = ref('')
const startDate = ref('')
const endDate = ref('')

const filteredLogs = computed(() => {
  return tableData.value.filter(detail => {
    //search bar for task name
    const matchesSearch = detail.kpi.taskTitle.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    //custom date range for received date
    const taskDate = new Date(detail.pointsReceivedOn); // Convert string date to Date object
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

.table th, .table td {
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


/* styling for modal */
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
.textarea {
  height: auto;
}

input:disabled, textarea:disabled {
  background-color: transparent !important; 
  color: black !important; 
}

</style>
