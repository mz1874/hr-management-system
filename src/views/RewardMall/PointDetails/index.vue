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
      <input class="form-control" type="search" placeholder="Search Remarks" v-model="remarksSearch">
    </form>

    <!-- Custom Date Range (Right) -->
    <div class="d-flex align-items-center gap-3">
      <input type="date" class="form-control" id="startDate" placeholder="Start Date" v-model="searchStartDate">
      <span> - </span>
      <input type="date" class="form-control" id="endDate" placeholder="End Date" v-model="searchEndDate">
    </div>
  </div>

  <div class="table-card">
    <table class="table">
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Received On</th>
          <th scope="col">Points</th>
          <th scope="col">Type</th>
          <th scope="col">Remarks</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="details in tableData" :key="details.id">
          <td>{{ details.id}}</td>

          <td>{{ details.pointsReceivedOn}}</td>

          <td :class="details.pointsValues <= 0 ? 'text-danger' : 'text-success'"> 
            {{ details.pointsValues > 0 ? '+' + details.pointsValues : details.pointsValues }}
          </td>

          <td>{{ details.pointType }}</td>

          <td>
            <template v-if="details.pointType === 'Deduction'">
              {{ details.pointsDeduction?.map((d: any) => d.deductionTypes).join(', ') }}
            </template>
            <template v-else-if="details.pointType === 'Addition'">
              {{ details.pointsAddition?.additionTypes }}
            </template>
            <template v-else-if="details.pointType === 'KPI Completed'">
              {{ details.kpiCompleted?.taskTitleStored }}
            </template>
          </td>

          <td>
            <template v-if="details.pointType === 'Deduction' || details.pointType === 'Addition'"></template>
            <template v-else-if="details.pointType === 'KPI Completed'">
              <button type="button" class="btn btn-primary" @click="openViewModal(details)">View Details</button>
            </template>
          </td>
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
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { PointHistoryItem } from '@/interface/RewardInterface.ts';
import { getPointHistory } from '@/api/reward';
import { getCurrentUser } from '@/api/login';
import dayjs from 'dayjs';

const currentPointEarned = ref<any>({})

const tableData = ref<PointHistoryItem[]>([])

const remarksSearch = ref('')
const searchStartDate = ref('')
const searchEndDate = ref('')

const currentPage = ref(1)
const pageSize = 10
const totalCount = ref(0)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) fetchPointHistory(page)
}

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

// ===================== Fetch Point History =====================
const fetchPointHistory = (page: number) => {
  currentPage.value = page

  getPointHistory(currentUserData.id, page, remarksSearch.value.trim(), searchStartDate.value, searchEndDate.value).then((res) => {
    console.log(res.data);
    totalCount.value = res.data.data.count;  
    
    // Map the backend response to match the PointHistoryItem interface
    tableData.value = res.data.data.results.map((item: any) => {
        // Create the base item
        const historyItem: PointHistoryItem = {
          id: item.id,
          user: item.user,
          pointType: item.point_type,
          pointsReceivedOn: dayjs(item.points_received_on).format("YYYY-MM-DD HH:mm:ss"),
          pointsValues: item.points_values
        };
        
        // Add point_deductions if they exist
        if (item.point_deductions && item.point_deductions.length > 0) {
            historyItem.pointsDeduction = item.point_deductions.map((deduction: any) => ({
                id: deduction.id,
                deductionTypes: deduction.deduction_types,
                pointsDeducted: deduction.points_deducted
            }));
        }
        
        // Add point_addition if it exists
        if (item.point_addition) {
            historyItem.pointsAddition = {
                id: item.point_addition.id,
                additionTypes: item.point_addition.addition_types,
                pointsAddition: item.point_addition.points_addition
            };
        }
        
        // Add kpi_completed if it exists
        if (item.kpi_completed) {
            historyItem.kpiCompleted = {
                id: item.kpi_completed.id,
                kpiCompletedTypes: item.kpi_completed.kpi_completed_types,
                taskTitleStored: item.kpi_completed.task_title_stored,
                taskDescriptionStored: item.kpi_completed.task_description_stored,
                taskStartDateStored: item.kpi_completed.task_start_date_stored,
                taskCompletionDateStored: item.kpi_completed.task_completion_date_stored,
                pointsEarnedStored: item.kpi_completed.points_earned_stored,
                targetUnitStored: item.kpi_completed.target_unit_stored,
                individualUnitStored: item.kpi_completed.individual_unit
            };
        }
        return historyItem;
    });
  }).catch(error => {
      console.error("Error fetching point history:", error);
  });
}

onMounted(async () => {
  await fetchUserId();
  fetchPointHistory(1);
});

watch([remarksSearch, searchStartDate, searchEndDate], () => {
  fetchPointHistory(1);
});

// ===================== View Modal =====================
const showModal = ref(false);

const openViewModal = (item: any) => {
  currentPointEarned.value = item;
  showModal.value = true;
};

// ===================== Navigate back to reward mall =====================
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
