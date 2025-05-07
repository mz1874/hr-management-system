<template>
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Point System</h2>
        <button type="button" class="btn btn-danger" @click="">Reset All User Point</button>
    </div>

    <div class="filter-container ">
        <div class="d-flex gap-3 ">
            <form class="search-container" role="search"> 
                <i class="fas fa-search search-icon"></i>
                <input class="form-control" type="search" placeholder="Search Employee Name" v-model="searchQuery">
                <!-- <button class="btn btn-success" type="submit">Search</button> -->
            </form>
            <select v-model.number="selectedDepartment" class="form-select search-container">
                <option value="0" selected>All departments</option>
                <option v-for="dept in departmentStore.flatDepartmentList" :key="dept.id":value="dept.id">
                {{ dept.department_name }}
                </option>
            </select>
            <button @click="searchStaff(searchQuery)" class="btn btn-primary">Search</button>
        </div>
    </div>  
    
    <!-- table -->
    <div class="table-card">
        <table class="table">   
            <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Staff Name</th>
                    <th scope="col">Username</th>
                    <th scope="col">Department</th>
                    <th scope="col">Total Points</th>
                    <th scope="col">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in staffTableData.results" :key="item.id">
                    <th>{{ item.id }}</th>
                    <td>{{ item.staffName }}</td>
                    <td>{{ item.username }}</td>
                    <td>{{ item.department_name }}</td>
                    <td>{{ item.totalPoints }}</td>
                    <td>
                        <button type="button" class="btn btn-primary btn-action" @click="openViewModal(item)">Point Details</button>
                        <button type="button" class="btn btn-danger btn-action" @click="openDeductionModal(item)">Deduction</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- pagination -->
    <div class="d-flex align-items-center mt-3 justify-content-start">
            <!-- <span class="me-3">Total: {{ totalCount }}</span> -->
            
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
                            <span>{{ point.rewardTitle }}</span>
                            <span>{{ point.pointsDeducted > 0 ? '+ ' : '- ' }}{{ point.pointsDeducted }} points</span>
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

    <!-- Modal for Deduction -->
    <div class="modal fade" id="deleteReward" :class="{ show: showDeductionModal }" style="display: block" v-if="showDeductionModal">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title" id="deleteRewardLabel">Points Deduction</h3>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <div class="mb-0.5"><b>Employee:</b></div>
                        <div>{{ currentUserPointDetails.staffName }}</div>
                    </div>

                    <div class="mb-3">
                        <div class="mb-0.5"><b>Deduction Reason:</b></div>
                        <select class="search-container form-select">
                            <option value="">Select One Reason</option>
                            <option value="Credit Notice">Credit Notice | -200 points</option>
                            <option value="Lateness">Lateness | -100 points</option>
                            <option value="Leave Without Notice">Leave Without Notice | -50 points</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="showDeductionModal = false">Close</button>
                    <button type="button" class="btn btn-danger" @click="confirmDeduction">Confirm</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showDeductionModal"></div>

    <!-- Modal for reset point confirmation -->
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
import { ref, computed, onMounted, watch, reactive } from 'vue'
import type { RewardRedemptionItem } from '@/interface/RewardInterface'
import type { Staff } from '@/interface/UserInterface'
import { searchStaff as searchStaffAPI, selectAllStaffs } from '@/api/staff';
import { getRewardRedemption, patchUser } from '@/api/reward';
import dayjs from 'dayjs';
import type { Department } from '@/interface/DepartmentInterface';
import { selectAllDepartments } from '@/api/department';
import { isSuccess } from '@/utils/httpStatus';
import { useDepartmentStore } from '@/stores/department';
import type {StaffPagination} from "@/interface/StaffPaginationInterface.ts";

// ===================== Pagination =====================
const departmentStore = useDepartmentStore();
const searchDepartmentId = ref<number | null>(null);
const selectedDepartment = ref(0)

const itemsPerPage = 10;
const searchQuery = ref('')
const currentPage = ref(1);

function mapStaffData(item: any): Staff {
    return {
        id: item.id,
        username: item.username,
        staffName: item.staffName,
        date_of_birth: dayjs(item.date_of_birth).format("YYYY-MM-DD"),
        roles: item.roles,
        department: item.department,
        department_name: item.department_name,
        status: item.status,
        employment_time: dayjs(item.employment_time).format("YYYY-MM-DD"),
        resignationDate: undefined,
        numberOfLeaves: item.number_of_leave,
        medicalLeaves: item.medical_leave,
        annualLeaves: item.annual_leave,
        password:"",
        imgUrl: "",
        totalPoints: item.total_point,
        leave_entitlements: item.leave_entitlements,
    };
}

const changePage = (page: number) => {
    if (isSearching.value) {
        search(searchName.value, searchDepartmentId.value, page);
    } else {
        fetchAllStaffs(page);
    }
};

function updateStaffData(res: any): void {
    staffTableData.count = res.count;
    staffTableData.next = res.next;
    staffTableData.previous = res.previous;
    staffTableData.summary = res.summary;
    staffTableData.results = res.results.map(mapStaffData);
}

const totalPages = computed(() => {
  return Math.ceil(staffTableData.count / itemsPerPage)
})

const searchStaff = (searchData: string) => {
    const departmentId = selectedDepartment.value === 0 ? null : selectedDepartment.value;
    search(searchData, departmentId, 1); // always reset to page 1
};

const searchName = ref("");
const isSearching = ref(false);

async function search(name: string, departmentId: number | null = null, page = 1) {
    searchName.value = name;
    searchDepartmentId.value = departmentId;
    isSearching.value = true;

    try {
        const response = await searchStaffAPI(name, departmentId ?? undefined, page);
        if (isSuccess(response.status)) {
            updateStaffData(response.data.data); // your method to update the staff list
            currentPage.value = page;
        }
    } catch (err) {
        console.error('Search failed:', err);
    }
}

// ===================== Fetch Staffs =====================
const currentUserPointDetails = ref<any>(null);

const staffTableData = reactive<StaffPagination>({
    count: 0,
    next: null,
    previous: null,
    results: [],
    summary: {
        total_users: 0,
        inactive_users: 0,
        active_users: 0,
    },
});
    
async function fetchAllStaffs(page = 1): Promise<void> {
    isSearching.value = false;
    try {
        const response = await selectAllStaffs(page);
        if (isSuccess(response.status)) {
            updateStaffData(response.data.data);
            currentPage.value = page;
        }
    } catch (error) {
        console.error("Failed to fetch staff:", error);
    }
}

// ===================== Fetch Reward Redemption =====================
const rewardRedemptionTableData = ref<RewardRedemptionItem[]>([])
const fetchRewardRedemption = () => {
    getRewardRedemption().then((res) => {
        console.log(res.data)
        rewardRedemptionTableData.value = res.data.data.results.map((item:any) => ({
            redeemedOn: dayjs(item.reward_redeemed_on).format("YYYY-MM-DD HH:mm:ss"),
            pointsDeducted: item.points_deducted,
            rewardTitle: item.reward_title_stored,
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
    fetchAllStaffs();
    fetchRewardRedemption();
    departmentStore.fetchDepartments();
})

// ===================== Reset All User Points =====================
const showResetPointModal = ref(false);
const resetReward = () => {
    patchUser().then((res) => {
        
    })
}

// ===================== Confirm Point deduction =====================
const showDeductionModal = ref(false)
const openDeductionModal = (staff: Staff) => {
    currentUserPointDetails.value = {...staff};
    showDeductionModal.value = true
}
const confirmDeduction = () => {
    
}

// ===================== Open Point Details modal =====================
const showModal = ref(false)
const openViewModal = (staff: Staff) => {
    console.log("Reward Redemption Data:", currentUserPointDetails.value);
    // console.log("Staff ID Clicked:", staff.id)
    // console.log("User IDs in Reward Data:", rewardRedemptionTableData.value.map(item => item.user.id))

    const rewardHistory = rewardRedemptionTableData.value.filter(item => item.user.id === staff.id).map(item => ({
        type: "Reward",
        rewardTitle: item.rewardTitle,
        pointsDeducted: item.pointsDeducted,
        redeemedOn: item.redeemedOn
    }))

    currentUserPointDetails.value = [...rewardHistory /*, ...kpiHistory*/]
        .sort((a, b) => new Date(b.redeemedOn).getTime() - new Date(a.redeemedOn).getTime());

    showModal.value = true;
};



// ===================== Filter =====================
// const searchName = ref('')
// const selectedDepartment = ref(0)

// const filteredLogs = computed(() => {
//     return staffTableData.value.filter(detail => {
//         //search bar for username
//         const matchNameSearch = detail.username.toLowerCase().includes(searchName.value.toLowerCase()); 

//         //search for department
//         const matchDepartmentSearch = !selectedDepartment.value || detail.department === selectedDepartment.value

//         return matchNameSearch && matchDepartmentSearch;
//     })
// })

</script>


<style scoped>
.search-container {
    margin-bottom: 1rem;
    width: 100%; /* Ensure form controls take up available width */
    /* Set a fixed maximum width */
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
