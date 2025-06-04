<template>
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Point System</h2>
        <button type="button" class="btn btn-danger" @click="openResetModal()">Reset All User Point</button>
    </div>

    <div class="filter-container ">
        <div class="d-flex gap-3 ">
            <form class="search-container" role="search"> 
                <i class="fas fa-search search-icon"></i>
                <input class="form-control form-control-padding" type="search" placeholder="Search Employee Name" v-model="searchQuery">
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
                            <th scope="col">Department</th>
                            <th scope="col">Total Points</th>
                            <th scope="col">Current Points</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="!staffTableData.results || staffTableData.results.length === 0">
                            <td colspan="7" class="text-center py-4 text-muted">
                                No records found.
                            </td>
                        </tr>
                        <tr v-else v-for="item in staffTableData.results" :key="item.id">
                            <td>{{ item.id }}</td>
                            <td>{{ item.staffName }}</td>
                            <td>{{ item.username }}</td>
                            <td>{{ item.department_name }}</td>
                            <td>{{ item.totalPoints }}</td>
                            <td>{{ item.currentPoints }}</td>
                            <td>
                                <button type="button" class="btn btn-success btn-action" @click="openAdditionModal(item)">Add Points</button>
                                <button type="button" class="btn btn-danger btn-action" @click="openDeductionModal(item)">Deduct Points</button>
                                <button type="button" class="btn btn-primary btn-action" @click="openViewModal(item)">Point Details</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            

            <!-- pagination -->
            <div class="d-flex align-items-center mt-3 justify-content-start">
                <span class="me-3">Total: {{ staffTableData.summary?.total_users || staffTableData.count || 0 }}</span>
                    
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

    <!-- Modal for Point Details -->
    <div class="modal fade" id="changeRewardStatus" :class="{ show: showModal }" style="display: block" v-if="showModal">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <div>
                        <h3>Employee Point Details</h3>
                        <span class="text-muted">{{ currentUserPointDetails?.staffName }} - Point Transactions</span>
                    </div>
                </div>
                <div class="modal-body">
                    <!-- Filter Section -->
                    <div class="filter-container mb-4">
                        <div class="row g-3">
                            <!-- Date Range Filters -->
                            <div class="col-md-5">
                                <input type="date" class="form-control" v-model="modalStartDate" @change="applyModalFilters">
                            </div>
                            <div class="col-md-5">
                                <input type="date" class="form-control" v-model="modalEndDate" @change="applyModalFilters">
                            </div>
                            <div class="col-md-2">
                                <button type="button" class="btn btn-outline-danger" @click="clearDateFilters" :disabled="!modalStartDate && !modalEndDate">
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Loading State -->
                    <div v-if="isLoadingModal" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2">Loading transactions...</p>
                    </div>

                    <!-- No transactions message -->
                    <div v-else-if="combinedPointTransactions.length === 0" class="text-center py-4">
                        <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                        <p class="text-muted">No point transactions found.</p>
                    </div>
                    
                    <!-- Transaction List -->
                    <div v-else>
                        <div class="point-details-item mb-3 p-3 border rounded" 
                            v-for="transaction in combinedPointTransactions" 
                            :key="transaction.id">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div class="flex-grow-1">
                                    <h6 class="mb-1 fw-bold">{{ transaction.title }}</h6>
                                    <small class="text-muted">
                                        <i class="fas fa-tag me-1"></i>
                                        {{ transaction.transaction_type }}
                                    </small>
                                </div>
                                <div class="text-end">
                                    <span :class="['fs-5 fw-bold', formatTransactionDisplay(transaction).pointsClass]">
                                        {{ formatTransactionDisplay(transaction).formattedPoints }} pts
                                    </span>
                                </div>
                            </div>
                            
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">
                                    <i class="fas fa-calendar me-1"></i>
                                    {{ formatTransactionDisplay(transaction).formattedDate }}
                                </small>
                            </div>

                        </div>
                    </div>

                    <!-- Pagination -->
                    <div v-if="modalTotalPages > 1" class="d-flex align-items-center justify-content-between mt-4">
                        <div>
                            <small class="text-muted">
                                Showing {{ combinedPointTransactions.length }} of {{ modalPaginationData.count }} transactions
                            </small>
                        </div>
                        
                        <nav>
                            <ul class="pagination pagination-sm mb-0">
                                <li :class="['page-item', { disabled: modalCurrentPage === 1 }]">
                                    <a class="page-link" href="#" @click.prevent="changeModalPage(modalCurrentPage - 1)">
                                        <i class="fas fa-chevron-left"></i>
                                    </a>
                                </li>

                                <!-- Show page numbers with ellipsis for large page counts -->
                                <template v-if="modalTotalPages <= 7">
                                    <li v-for="page in modalTotalPages" :key="page" 
                                        :class="['page-item', { active: modalCurrentPage === page }]">
                                        <a class="page-link" href="#" @click.prevent="changeModalPage(page)">{{ page }}</a>
                                    </li>
                                </template>
                                <template>
                                    <!-- First page -->
                                    <li :class="['page-item', { active: modalCurrentPage === 1 }]">
                                        <a class="page-link" href="#" @click.prevent="changeModalPage(1)">1</a>
                                    </li>
                                    
                                    <!-- Previous pages around current -->
                                    <li v-if="modalCurrentPage > 3" class="page-item disabled">
                                        <span class="page-link">...</span>
                                    </li>
                                    
                                    <li v-for="page in [modalCurrentPage - 1, modalCurrentPage, modalCurrentPage + 1].filter(p => p > 1 && p < modalTotalPages)" 
                                        :key="page" 
                                        :class="['page-item', { active: modalCurrentPage === page }]">
                                        <a class="page-link" href="#" @click.prevent="changeModalPage(page)">{{ page }}</a>
                                    </li>
                                    
                                    <!-- Next pages -->
                                    <li v-if="modalCurrentPage < modalTotalPages - 2" class="page-item disabled">
                                        <span class="page-link">...</span>
                                    </li>
                                    
                                    <!-- Last page -->
                                    <li :class="['page-item', { active: modalCurrentPage === modalTotalPages }]">
                                        <a class="page-link" href="#" @click.prevent="changeModalPage(modalTotalPages)">{{ modalTotalPages }}</a>
                                    </li>
                                </template>

                                <li :class="['page-item', { disabled: modalCurrentPage === modalTotalPages }]">
                                    <a class="page-link" href="#" @click.prevent="changeModalPage(modalCurrentPage + 1)">
                                        <i class="fas fa-chevron-right"></i>
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="showModal = false">Close</button>
                </div>
            </div>
        </div>
    </div>
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
                            <button v-for="opt in deductionOptions" :key="opt.deductionTypes" class="btn btn-primary" 
                            :disabled="selectedDeductions.some(d => d.deductionTypes === opt.deductionTypes)" @click="addDeduction(opt.deductionTypes)">
                                {{ opt.deductionTypes }}
                            </button>
                        </div>

                        <!-- Form fields for each selected deduction -->
                        <div v-for="(item, index) in selectedDeductions" :key="item.deductionTypes" class="mb-3">
                            <label><b>Deduction Reason:</b> {{ item.deductionTypes }}</label>
                            <div class="input-group">
                                <input type="number" class="form-control" 
                                    :class="{ 'is-invalid': getDeductionValidation(item.deductionTypes) }"
                                    v-model.number="item.pointsDeducted" placeholder="Enter points to deduct" min="0"
                                    @input="clearDeductionValidation(item.deductionTypes)"/>
                                <button class="btn btn-outline-danger" @click="removeDeduction(item.deductionTypes)">Remove</button>
                            </div>
                            <div v-if="getDeductionValidation(item.deductionTypes)" class="invalid-feedback d-block">
                                {{ getDeductionValidation(item.deductionTypes) }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-secondary" @click="showDeductionModal = false">Close</button>
                    <button class="btn btn-danger" :disabled="selectedDeductions.length === 0" @click="confirmDeduction">
                        Confirm Deduction
                    </button>
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
                    <div><b>Employee: </b>{{ currentUserPointDetails.staffName }}</div>
                    
                    <div class="mt-4">
                        <div class="mb-3">
                            <div><b>Addition Reason:</b></div>
                            <select class="search-container form-select" v-model="currentUserPointDetails.additionTypes" disabled>
                                <option value="Star" selected> ⭐ Star </option>
                            </select>
                            
                            <div class="form-group mt-3">
                                <label><b>Points to Add:</b></label>
                                <input type="number" class="form-control" placeholder="Enter points to add" 
                                    :class="{ 'is-invalid': getAdditionValidation() }" v-model.number="currentUserPointDetails.pointsAddition" 
                                    min="1" @input="clearAdditionValidation()"
                                >
                                <div class="invalid-feedback d-block" v-if="getAdditionValidation()">
                                    {{ getAdditionValidation() }}
                                </div>
                            </div>                      
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="showAdditionModal = false">Close</button>
                    <button type="button" class="btn btn-success" :disabled="!currentUserPointDetails.pointsAddition" @click="confirmAddition">
                        Confirm Addition
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showAdditionModal"></div>

    <!-- Modal for reset point confirmation -->
    <div class="modal fade" id="deleteReward" :class="{ show: showResetPointModal }" style="display: block" v-if="showResetPointModal">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
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
import { resetPassword, searchStaff as searchStaffAPI, selectAllStaffs } from '@/api/staff';
import { createDeductionHistory, getCombinedPointTransactions, getPointHistory, getUserRewardRedemption, patchUser, resetUserPoints } from '@/api/reward';
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
        password:"",
        imgUrl: "", 
        totalPoints: item.total_point,
        currentPoints: item.current_point,
        leave_entitlements: item.leave_entitlements,
        leaveBalances: item.leaveBalances,
        email: item.email
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
    getUserRewardRedemption(currentUserPointDetails.value.id).then((res) => {
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

    getPointHistory(currentUserPointDetails.value.id).then((res) => {
        console.log(res.data);
        
        // Map the backend response to match the PointHistoryItem interface
        pointSystemTableData.value = res.data.data.results.map((item: any) => {
            // Create the base item
            const historyItem: PointHistoryItem = {
                id: item.id,
                user: item.user, // Assuming this matches the Staff interface
                pointType: item.point_type,
                pointsReceivedOn: item.points_received_on,
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
    await fetchAllStaffs();
    // Assuming you select the first staff as default
    if (staffTableData.results.length > 0) {
        currentUserPointDetails.value = staffTableData.results[0];
        fetchRewardRedemption();
        fetchPointHistory();
    }    departmentStore.fetchDepartments();
})

// ===================== Reset All User Points =====================
const showResetPointModal = ref(false);

const openResetModal = () => {
    showResetPointModal.value = true;
}

const resetReward = async () => {
    try {
        const response = await resetUserPoints();
        if (isSuccess(response.status)) {
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "All user points reset successfully",
                showConfirmButton: false,
                timer: 1500
            });
            showResetPointModal.value = false;
            fetchAllStaffs(); 
        }
    } catch (error) {
        console.error("Failed to reset points:", error);
        Swal.fire({
            icon: "error",
            title: "Reset Failed",
            text: "Something went wrong while resetting user points.",
        });
        showResetPointModal.value = false;
        fetchAllStaffs(); 
    }
}

// ===================== Validation =====================
const validation = ref({
    pointsDeducted: '',
    pointsAddition: '',
    deductions: {},
});

const validateDeductionPoints = () => {
    // Reset deduction validations
    validation.value.deductions = {};

    let isValid = true;

    selectedDeductions.value.forEach((deduction, index) => {
        const key = deduction.deductionTypes;
        // Check if points are entered
        if (!deduction.pointsDeducted) {
            validation.value.deductions[key] = 'Please enter points to deduct.';
            isValid = false;
        }

        // Check if points are negative
        if (Number(deduction.pointsDeducted) < 0) {
            validation.value.deductions[key] = 'Points cannot be less than 0.';
            isValid = false;
        }
    });

    return isValid;
};

const validateAdditionPoints = () => {
    // Reset addition validation
    validation.value.pointsAddition = '';

    let isValid = true;

    // Check if points are entered
    if (!currentUserPointDetails.value.pointsAddition || currentUserPointDetails.value.pointsAddition === '') {
        validation.value.pointsAddition = 'Please enter points to add.';
        isValid = false;
    }
    // Check if points are negative
    else if (Number(currentUserPointDetails.value.pointsAddition) < 0) {
        validation.value.pointsAddition = 'Points cannot be less than 0.';
        isValid = false;
    }

    return isValid;
};

const resetValidation = () => {
    validation.value = {
        pointsDeducted: '',
        pointsAddition: '',
        deductions: {},
    };
};

// Helper function to get validation message for specific deduction
const getDeductionValidation = (deductionType) => {
    return validation.value.deductions[deductionType] || '';
};

// Helper function to get validation message for specific deduction
const getAdditionValidation = () => {
    return validation.value.pointsAddition || '';
};

// Clear validation for specific deduction when user starts typing
const clearDeductionValidation = (deductionType) => {
    if (validation.value.deductions[deductionType]) {
        delete validation.value.deductions[deductionType];
    }
};

// Clear validation for specific deduction when user starts typing
const clearAdditionValidation = () => {
    if (validation.value.pointsAddition) {
        delete validation.value.pointsAddition;
    }
};

// ===================== Confirm Point deduction =====================
const showDeductionModal = ref(false)
const deductionOptions = [
    { deductionTypes: 'Credit Notice' },
    { deductionTypes: 'Lateness' },
    { deductionTypes: 'Absent Without Notice' }
]

// Selected deductions
const selectedDeductions = ref<{ deductionTypes: string, pointsDeducted: number | null }[]>([])

const openDeductionModal = (staff: Staff) => {
    resetValidation();
    currentUserPointDetails.value = { ...staff }
    selectedDeductions.value = []
    showDeductionModal.value = true
}

// Add a new deduction block if not already selected
const addDeduction = (deductionTypes: string) => {
    if (!selectedDeductions.value.some(d => d.deductionTypes === deductionTypes)) {
        selectedDeductions.value.push({ deductionTypes, pointsDeducted: null })
    }
}

// Remove a deduction row
const removeDeduction = (deductionTypes: string) => {
    selectedDeductions.value = selectedDeductions.value.filter(d => d.deductionTypes !== deductionTypes)
    
    // Clear validation for the removed deduction type
    if (validation.value.deductions[deductionTypes]) {
        delete validation.value.deductions[deductionTypes]
    }
}

//confirm deduction
const confirmDeduction = () => { 
    if (!validateDeductionPoints()) return;

    const totalDeductedPoints = selectedDeductions.value.reduce((sum, item) => sum + (item.pointsDeducted ?? 0), 0)

    const pointHistoryData = {
        user: currentUserPointDetails.value.id,
        point_type: "Deduction",
        points_values: -totalDeductedPoints,
        point_deductions: selectedDeductions.value.map(item => ({
            deduction_types: item.deductionTypes,
            points_deducted: item.pointsDeducted 
        })),
    }    

    showDeductionModal.value = false;

    // First create the deduction history
    createDeductionHistory(pointHistoryData).then((res) => {
        console.log("✅ Deduction history created:", res);
        if (isSuccess(res.status)) {
            // Then update the user's points in the database
            const userData = {
                id: currentUserPointDetails.value.id,
                total_point: currentUserPointDetails.value.totalPoints - totalDeductedPoints,
                current_point: currentUserPointDetails.value.currentPoints - totalDeductedPoints
            }
            
            return patchUser(currentUserPointDetails.value.id, userData);
        }
    }).then((updateRes) => {
        if (updateRes && isSuccess(updateRes.status)) {
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Deduction recorded successfully",
                showConfirmButton: false,
                timer: 1500
            });
            
            // Update local state
            currentUserPointDetails.value.totalPoints -= totalDeductedPoints;
            currentUserPointDetails.value.currentPoints -= totalDeductedPoints;
            
            // Refresh staff data
            fetchAllStaffs();
        }
    }).catch(error => {
        console.error("Error updating points:", error);
        Swal.fire({
            position: "top-end",
            icon: "error",
            title: "Failed to update points",
            showConfirmButton: false,
            timer: 1500
        });
    });
}

// ===================== Confirm Point addition =====================
const showAdditionModal = ref(false)
const openAdditionModal = (staff: Staff) => {
    resetValidation();
    currentUserPointDetails.value = {...staff, additionTypes: "Star" };
    showAdditionModal.value = true
}

const confirmAddition = () => {  
    if (!validateAdditionPoints()) return;

    const pointsToAdd = currentUserPointDetails.value.pointsAddition;
    
    const pointHistoryData = {
        user: currentUserPointDetails.value.id,
        point_type: "Addition",
        points_values: pointsToAdd,
        point_addition: {
            addition_types: currentUserPointDetails.value.additionTypes,
            points_addition: pointsToAdd 
        }
    }   

    showAdditionModal.value = false;

    // First create the addition history
    createDeductionHistory(pointHistoryData).then((res) => {
        console.log("✅ Addition history created:", res);
        if (isSuccess(res.status)) {
            // Then update the user's points in the database
            const userData = {
                id: currentUserPointDetails.value.id,
                total_point: currentUserPointDetails.value.totalPoints + pointsToAdd,
                current_point: currentUserPointDetails.value.currentPoints + pointsToAdd
            }
            
            return patchUser(currentUserPointDetails.value.id, userData);
        }
    }).then((updateRes) => {
        if (updateRes && isSuccess(updateRes.status)) {
            Swal.fire({
                position: "top-end",
                icon: "success", 
                title: "Addition recorded successfully",
                showConfirmButton: false,
                timer: 1500
            });
            
            // Update local state
            currentUserPointDetails.value.totalPoints += pointsToAdd;
            currentUserPointDetails.value.currentPoints += pointsToAdd;
            
            // Refresh staff data
            fetchAllStaffs();
        }
    }).catch(error => {
        console.error("Error updating points:", error);
        Swal.fire({
            position: "top-end",
            icon: "error",
            title: "Failed to update points",
            showConfirmButton: false,
            timer: 1500
        });
    });
}


// ===================== Point Details Modal State =====================
const showModal = ref(false)
const modalCurrentPage = ref(1)
const modalItemsPerPage = 10
const modalStartDate = ref('')
const modalEndDate = ref('')
const isLoadingModal = ref(false)

// Combined point transactions data
const combinedPointTransactions = ref([])
const modalPaginationData = ref({
    count: 0,
    has_next: false,
    has_previous: false,
    total_pages: 1
})

// ===================== Fetch Combined Point Transactions =====================
const fetchCombinedPointTransactions = async (page = 1, startDate = '', endDate = '') => {
    if (!currentUserPointDetails.value?.id) {
        console.warn("Cannot fetch transactions: No user ID available");
        return;
    }

    isLoadingModal.value = true;
    
    try {
        const response = await getCombinedPointTransactions(currentUserPointDetails.value.id, page, startDate, endDate,);
        
        if (isSuccess(response.status)) {
            const data = response.data.data || response.data;
            combinedPointTransactions.value = data.data || [];
            
            // Handle pagination data
            if (data.results.data && Array.isArray(data.results.data)) {
                combinedPointTransactions.value = data.results.data;
            } 

             modalPaginationData.value = {
                count: data.count || 0,
                has_next: !!data.next,
                has_previous: !!data.previous,
                total_pages: Math.ceil((data.count || 0) / modalItemsPerPage)
            };
            
            modalCurrentPage.value = page;
        }
    } catch (error) {
        console.error("Failed to fetch combined point transactions:", error);
        Swal.fire({
            icon: "error",
            title: "Failed to load transactions",
            text: "Please try again later"
        });
    } finally {
        isLoadingModal.value = false;
    }
}

// ===================== Modal Pagination =====================
const modalTotalPages = computed(() => {
    return modalPaginationData.value.total_pages || Math.ceil(modalPaginationData.value.count / modalItemsPerPage)
})

const changeModalPage = (page: number) => {
    if (page < 1 || page > modalTotalPages.value) return;
    
    fetchCombinedPointTransactions(page, modalStartDate.value, modalEndDate.value);
}

// ===================== Modal Filtering =====================
const applyModalFilters = () => {
    modalCurrentPage.value = 1; // Reset to first page when filtering
    fetchCombinedPointTransactions(1, modalStartDate.value, modalEndDate.value);
}

// ===================== Open Point Details Modal =====================
const openViewModal = async (user: Staff) => {
    currentUserPointDetails.value = user;
    
    // Reset modal state
    modalCurrentPage.value = 1;
    modalStartDate.value = '';
    modalEndDate.value = '';
    combinedPointTransactions.value = [];
    
    showModal.value = true;
    
    // Fetch initial data
    await fetchCombinedPointTransactions();
}

// ===================== Clear Date Filters =====================
const clearDateFilters = () => {
    modalStartDate.value = '';
    modalEndDate.value = '';
    applyModalFilters();
}

// ===================== Format Transaction Display =====================
const formatTransactionDisplay = (transaction: any) => {
    // Format points with proper sign and color
    const isAddition = transaction.transaction_type === "Addition" || transaction.transaction_type === "KPI Completed";
    const pointsClass = isAddition ? 'text-success' : 'text-danger';

    const formattedPoints = `${isAddition ? '+' : ''}${transaction.points}`;
    return {
        pointsClass,
        formattedPoints,
        formattedDate: dayjs(transaction.date).format("YYYY-MM-DD, HH:mm")
    };
}

// ===================== Manage background scrolling =====================
watch([showModal, showAdditionModal, showDeductionModal, showResetPointModal], ([modal, additionModal, deductionModal, resetModal]) => {
  if (modal || additionModal || deductionModal || resetModal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

</script>


<style scoped>
.search-container {

    width: 100%; 
    display: flex;
    align-items: center;
    position: relative;
}

.filter-container {
    margin-bottom: 2rem;
}
.search-icon {
    position: absolute;
    left: 10px; 
    top: 50%;
    transform: translateY(-50%);
    color: gray; /* Icon color */
}
.form-control-padding {
    padding-left: 35px; 
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
