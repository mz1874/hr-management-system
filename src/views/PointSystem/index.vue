<template>
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Point System</h2>
        <button type="button" class="btn btn-danger" @click="">Reset All User Point</button>
    </div>

    <div class="filter-container ">
        <div class="d-flex gap-3 ">
            <form class="search-container" role="search"> 
                <i class="fas fa-search search-icon"></i>
                <input class="form-control form-control-padding" type="search" placeholder="Search Employee Name" v-model="searchQuery">
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
                    <th scope="col">Current Points</th>
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
                    <td>{{ item.currentPoints }}</td>
                    <td>
                        <button type="button" class="btn btn-success btn-action" @click="openAdditionModal(item)">+ Add Points</button>
                        <button type="button" class="btn btn-danger btn-action" @click="openDeductionModal(item)">- Deduct Points</button>
                        <button type="button" class="btn btn-primary btn-action" @click="openViewModal(item)">Point Details</button>
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

    <!-- Modal for POint Details -->
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
                    <!-- No transactions message -->
                    <div v-if="currentUserPointDetails.length === 0" class="text-center">
                        <p>No point transactions found.</p>
                    </div>
                    
                    <!-- Transaction List -->
                    <div class="point-details-item" v-for="(point, index) in currentUserPointDetails" :key="index">
                        <div class="d-flex justify-content-between mb-1">
                            <span>{{ point.title }}</span>
                            <span>{{ point.points }} points</span>
                        </div>
                        <div class="d-flex justify-content-between">
                            <span style= "color: gray">{{ point.type }}</span>
                            <span style= "color: gray">{{ point.date }}</span>
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

    <!-- Show Deduction Modal -->
    <div v-if="showDeductionModal" class="modal fade show" style="display: block;">
    <div class="modal-dialog modal-dialog-centered modal-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <div>
                    <h3>Point Deduction</h3>
                    <span class="text-muted">Deduct points for employee</span>
                </div>            
            </div>

            <div class="modal-body">
                <div><b>Employee:</b> {{ currentUserPointDetails.staffName }}</div>
                    <div class="mt-4 mb-4">
                        <h5>Select Deduction Type</h5>
                        <div class="d-flex flex-wrap gap-2 mb-4">
                            <button v-for="opt in deductionOptions" :key="opt.type" class="btn btn-primary" 
                            :disabled="selectedDeductions.some(d => d.type === opt.type)" @click="addDeduction(opt.type, opt.defaultPoints)">
                                {{ opt.type }} | {{ opt.defaultPoints }} pts
                            </button>
                        </div>

                        <!-- Form fields for each selected deduction -->
                        <div v-for="(item, index) in selectedDeductions" :key="item.type" class="mb-3">
                            <label><b>Deduction Reason:</b> {{ item.type }}</label>
                            <div class="input-group">
                                <input type="number" class="form-control" v-model.number="item.points"placeholder="Enter points to deduct"/>
                                <button class="btn btn-outline-danger" @click="removeDeduction(item.type)">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-secondary" @click="showDeductionModal = false">Close</button>
                    <button class="btn btn-danger" @click="confirmDeduction">Confirm</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showDeductionModal"></div>


    <!-- Modal for Addition -->
    <div class="modal fade" id="deleteReward" :class="{ show: showAdditionModal }" style="display: block" v-if="showAdditionModal">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <div>
                        <h3>Point Addition</h3>
                        <span class="text-muted">Add points for employee</span>
                    </div>
                </div>

                <div class="modal-body">
                    <div>
                        <b>Employee: </b>{{ currentUserPointDetails.staffName }}
                    </div>
                    
                    <div class="mt-4">
                        <div class="mb-3">
                            <div><b>Addition Reason:</b></div>
                            <select class="search-container form-select" v-model="additionReason" disabled>
                                <option value="star" selected> ⭐ Star | +50 points</option>
                            </select>
                            <form>
                                <div class="form-group">
                                    <label ><b>Points to Add:</b></label>
                                    <input type="number" class="form-control" placeholder="Enter points to add">
                                </div>
                            </form>                        
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="showAdditionModal = false">Close</button>
                    <button type="button" class="btn btn-success" @click="confirmDeduction">Confirm</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showAdditionModal"></div>


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
import type { RewardRedemptionItem, PointHistoryItem, PointItem } from '@/interface/RewardInterface'
import type { Staff } from '@/interface/UserInterface'
import { searchStaff as searchStaffAPI, selectAllStaffs } from '@/api/staff';
import { createDeductionHistory, getPointHistory, getRewardRedemption, patchUser } from '@/api/reward';
import dayjs from 'dayjs';
import type { Department } from '@/interface/DepartmentInterface';
import { selectAllDepartments } from '@/api/department';
import { isSuccess } from '@/utils/httpStatus';
import { useDepartmentStore } from '@/stores/department';
import type {StaffPagination} from "@/interface/StaffPaginationInterface.ts";
import Swal from 'sweetalert2';

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
        currentPoints: item.current_point,
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

// ===================== Fetch Point History =====================
const pointSystemTableData = ref<PointHistoryItem[]>([])
const fetchPointHistory = () => {
    if (!currentUserPointDetails.value || !currentUserPointDetails.value.id) {
        console.warn("Cannot fetch point history: No user ID available");
        return; // Exit early if no valid user ID
    }

    getPointHistory().then((res) => {
        console.log(res.data)
        pointSystemTableData.value = res.data.data.results.map((item:any) => ({
            pointsReceivedOn: item.points_received_on,
            pointsValue: item.points_values,
            isDeduction: item.is_deduction,
            reasonType: item.reason_types,
            description: item.description,
            user: {
                id: item.user.id
            }
        }))
    })
}

onMounted(() => {
    fetchAllStaffs();
    fetchRewardRedemption();
    fetchPointHistory(),
    departmentStore.fetchDepartments();
})

// ===================== Reset All User Points =====================
const showResetPointModal = ref(false);
const resetReward = () => {
    // patchUser().then((res) => {
        
    // })
}

// ===================== Confirm Point deduction =====================

const showDeductionModal = ref(false)
const deductionOptions = [
  { type: 'Credit Note', defaultPoints: -200 },
  { type: 'Lateness', defaultPoints: -100 },
  { type: 'Absent Without Notice', defaultPoints: -50 }
]

// Selected deductions: { type: string, points: number }
const selectedDeductions = ref<{ type: string, points: number | null }[]>([])

const openDeductionModal = (staff: Staff) => {
  currentUserPointDetails.value = { ...staff }
  selectedDeductions.value = []
  showDeductionModal.value = true
}

// Add a new deduction block if not already selected
const addDeduction = (type: string, defaultPoints: number) => {
  if (!selectedDeductions.value.some(d => d.type === type)) {
    selectedDeductions.value.push({ type, points: null })
  }
}

// Remove a deduction row (optional)
const removeDeduction = (type: string) => {
  selectedDeductions.value = selectedDeductions.value.filter(d => d.type !== type)
}

const confirmDeduction = async () => {    
    // Calculate points value based on reason
    // let pointsValue = 0;
    // switch(deductionReason.value) {
    //     case "Credit Notice":
    //         pointsValue = 200;
    //         break;
    //     case "Lateness":
    //         pointsValue = 100;
    //         break;
    //     case "Leave Without Notice":
    //         pointsValue = 50;
    //         break;
    //     default:
    //         pointsValue = 0;
    // }
    
    // try {
    //     const data = {
    //         user: currentUserPointDetails.value.id,
    //         points_values: pointsValue,
    //         is_deduction: true,
    //         reason_types: deductionReason.value,
    //         description: deductionReason.value
    //     };
        
    //     const deductionRes = await createDeductionHistory(data);

    //    if (isSuccess(deductionRes.status)) {
    //         Swal.fire({
    //             position: "top-end",
    //             icon: "success",
    //             title: "Points deducted successfully",
    //             showConfirmButton: false,
    //             timer: 1500
    //         });
            
    //         // Update the staff's points in the local data before refresh
    //         const updatedPointsData = {
    //             total_point: currentUserPointDetails.value.totalPoints -= pointsValue,
    //             current_point: currentUserPointDetails.value.currentPoints -= pointsValue
    //         };
    //         const updateRes = await patchUser(currentUserPointDetails.value.id, updatedPointsData);
    //         if (!isSuccess(updateRes.status)) {
    //             throw new Error('Failed to deduct points');
    //         }
            
    //         showDeductionModal.value = false;
    //         fetchAllStaffs(currentPage.value); // Refresh data
    //     }

    // } catch (error) {
    //     console.error("Failed to create deduction:", error);
    //     Swal.fire({
    //         icon: "error",
    //         title: "Failed to deduct points",
    //         text: "Please try again later"
    //     });
    // }
}

// ===================== Confirm Point addition =====================
const additionReason = ref("star")
const showAdditionModal = ref(false)
const openAdditionModal = (staff: Staff) => {
    currentUserPointDetails.value = {...staff};
    showAdditionModal.value = true
}


// ===================== Open Point Details modal =====================
const showModal = ref(false)

const openViewModal = async (user: Staff) => {
    currentUserPointDetails.value = user; // Store the user data first
    
    try {
        const [rewardRes, pointHistoryRes] = await Promise.all([
            getRewardRedemption(undefined, undefined, user.username), // Pass username to filter
            getPointHistory()
        ]);

        // Check if we have proper data structures
        const rewardData = rewardRes.data.data?.results || [];
        const pointHistoryData = pointHistoryRes.data.data?.results || [];
        
        // Map rewards to the expected format
        const rewards = rewardData.map((reward: any) => ({
            title: reward.reward_title_stored,
            points: '- ' + reward.points_deducted, // Negative for redemptions
            type: 'Reward Redemption',
            date: dayjs(reward.reward_redeemed_on).format("YYYY-MM-DD")
        }));
        
        // Map point history to the expected format
        const histories = pointHistoryData.map((history: any) => ({
            title: history.description || history.reason_types,
            points: history.is_deduction ? '- ' + history.points_values : '+ ' + history.points_values, // Handle deductions
            type: history.is_deduction ? 'Deduction' : 'KPI Completion',
            date: dayjs(history.points_received_on).format("YYYY-MM-DD")
        }));
        
        // Combine and sort by date (newest first)
        currentUserPointDetails.value = [...rewards, ...histories].sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        
        showModal.value = true;
    } catch (error) {
        console.error("Failed to fetch point details:", error);
        Swal.fire({
            icon: "error",
            title: "Failed to load point details",
            text: "Please try again later"
        });
    }
};

// ===================== Fetch department name for filter =====================
// const departmentTableData = ref<Department[]>([])
// const fetchDepartment = () => {
//     selectAllDepartments().then((res) => {
//         departmentTableData.value = res.data.data.results.map((item:any) => ({
//             id: item.id,
//             department_name: item.department_name
//         }))
//     })
// }

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
.form-control-padding {
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
.status-exp {
    color: #7F7F7F;
}
.point-details-item {
    padding: 10px 0px;
    border-bottom: solid 1px #d7d7d7;
    /* border-top: solid 1px #d7d7d7; */
}
</style>
