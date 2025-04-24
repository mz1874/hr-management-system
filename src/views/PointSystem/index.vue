<template>
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Point System</h2>
        <button type="button" class="btn btn-danger" @click="">Reset All User Point</button>
    </div>

    <div class="filter-container ">
        <div class="d-flex gap-3 ">
            <form class="search-container" role="search"> 
                <i class="fas fa-search search-icon"></i>
                <input class="form-control" type="search" placeholder="Search Employee Name" v-model="searchName">
                <!-- <button class="btn btn-success" type="submit">Search</button> -->
            </form>
            <select class="search-container form-select" v-model="selectedDepartment">
                <option :value="0">All Departments</option>
                <option v-for="dept in departmentTableData" :key="dept.id" :value="dept.department_name">
                    {{ dept.department_name }}
                </option>
            </select>
        </div>
    </div>  
    
    <!-- table -->
    <div class="table-card">
        <table class="table">   
            <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Username</th>
                    <th scope="col">Department</th>
                    <th scope="col">Total Points</th>
                    <th scope="col">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in paginatedLogs" :key="item.id">
                    <th>{{ item.id }}</th>
                    <td>{{ item.name }}</td>
                    <td>{{ item.department }}</td>
                    <td>{{ item.totalPoints }}</td>
                    <td>
                        <button type="button" class="btn btn-primary" @click="openViewModal(item)">Point Details</button>
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
        <div class="modal-dialog modal-dialog-centered modal-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <div>
                        <h3>Employee Point Details</h3>
                        <span class="text-muted">View employee points from KPIs and Rewards</span>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="point-details-item" v-for="(point, index) in currentUserPointDetails" :key="index">
                        <div class="d-flex justify-content-between mb-1">
                            <span>{{ point.rewardName }}</span>
                            <span>{{ point.pointsDeducted > 0 ? '+' : '' }}{{ point.pointsDeducted }} points</span>
                        </div>
                        <div class="d-flex justify-content-between">
                            <span style= "color: gray">{{ point.type }}</span>
                            <span style= "color: gray">{{ point.redeemedOn }}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="showModal = false">Close</button>
                </div>
            </div>
        </div>
    </div >
    <div class="modal-backdrop fade show" v-if="showModal"></div>

    <!-- Modal for delete and reset point confirmation -->
    <div class="modal fade" id="deleteReward" :class="{ show: showResetPointModal }" style="display: block" v-if="showResetPointModal">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title" id="deleteRewardLabel">Are you sure?</h3>
                </div>
                <div class="modal-body">
                    <span class="text-muted">This action cannot be undone. All users' points will be reset.</span>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="showResetPointModal = false">Close</button>
                    <button type="button" class="btn btn-danger" @click="resetReward">Reset</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showResetPointModal"></div>

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { PointItem, RewardRedemptionItem } from '@/interface/RewardInterface'
import type { Staff } from '@/interface/UserInterface'
import { selectAllStaffs } from '@/api/staff';
import { getRewardRedemption, patchUser } from '@/api/reward';
import dayjs from 'dayjs';
import type { Department } from '@/interface/DepartmentInterface';
import { selectAllDepartments } from '@/api/department';

const currentUserPointDetails = ref<any[]>([]);

// ===================== Fetch Staffs =====================
const staffTableData = ref<Staff[]>([])
const getAllStaffs = () => {
    selectAllStaffs().then((res) => {
        console.log(res.data)
        staffTableData.value = res.data.data.results.map((item:any) => ({
            id: item.id,
            name: item.username,
            department: item.department_name,
            totalPoints: item.total_point
        }))
    }) 
}

// ===================== Fetch Reward Redemption =====================
const rewardRedemptionTableData = ref<RewardRedemptionItem[]>([])
const fetchRewardRedemption = () => {
    getRewardRedemption().then((res) => {
        console.log(res.data)
        rewardRedemptionTableData.value = res.data.data.results.map((item:any) => ({
            redeemedOn: dayjs(item.reward_redeemed_on).format("YYYY-MM-DD HH:mm:ss"),
            pointsDeducted: item.points_deducted,
            reward: {
                rewardName: item.reward.reward_title
            },
            user: {
                id: item.user.id
            }
        }))
    })
}

// ===================== Fetch department name for filter =====================
const departmentTableData = ref<Department[]>([])
const fetchDepartment = () => {
    selectAllDepartments().then((res) => {
        departmentTableData.value = res.data.data.results.map((item:any) => ({
            id: item.id,
            department_name: item.department_name
        }))
    })
}

onMounted(() => {
    getAllStaffs();
    fetchRewardRedemption();
    fetchDepartment();
})

// ===================== Reset All User Points =====================
const showResetPointModal = ref(false);
const resetReward = () => {
    patchUser().then((res) => {
        
    })
}


// ===================== Open modal =====================
const showModal = ref(false)
const openViewModal = (staff: Staff) => {
    // console.log("Reward Redemption Data:", currentUserPointDetails.value);
    // console.log("Staff ID Clicked:", staff.id)
    // console.log("User IDs in Reward Data:", rewardRedemptionTableData.value.map(item => item.user.id))

    const rewardHistory = rewardRedemptionTableData.value.filter(item => item.user.id === staff.id).map(item => ({
        type: "Reward",
        rewardName: item.reward.rewardName,
        pointsDeducted: item.pointsDeducted,
        redeemedOn: item.redeemedOn
    }))

    currentUserPointDetails.value = [...rewardHistory /*, ...kpiHistory*/]
        .sort((a, b) => new Date(b.redeemedOn).getTime() - new Date(a.redeemedOn).getTime());
 
    showModal.value = true;
};

// ===================== Filter =====================
const searchName = ref('')
const selectedDepartment = ref(0)

const filteredLogs = computed(() => {
    return staffTableData.value.filter(detail => {
        //search bar for username
      // @ts-ignore
        const matchNameSearch = detail.name.toLowerCase().includes(searchName.value.toLowerCase()); 

        //search for department
        const matchDepartmentSearch = !selectedDepartment.value || detail.department === selectedDepartment.value

        return matchNameSearch && matchDepartmentSearch;
    })
})

// ===================== Pagination =====================
const currentPage = ref(1);
const itemsPerPage = 10;

const totalLogs = computed(() => filteredLogs.value.length);
const totalPages = computed(() => Math.ceil(filteredLogs.value.length / itemsPerPage));

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage
  return filteredLogs.value.slice(start, end);
});

// ===================== Page turning =====================
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
.point-details-item {
    padding: 10px 0px;
    border-bottom: solid 1px #d7d7d7;
    /* border-top: solid 1px #d7d7d7; */
}
</style>
