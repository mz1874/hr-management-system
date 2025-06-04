<template>
    <div class="d-flex mb-4">
        <h2>Reward Management</h2>
    </div>

    <div class="filter-container">
        <div class="d-flex gap-3">
            <form class="search-container" role="search"> 
                <i class="fas fa-search search-icon"></i>
                <input class="form-control" type="search" placeholder="Search Reward Name" v-model="rewardSearch">
            </form>
            <form class="search-container" role="search"> 
                <i class="fas fa-search search-icon"></i>
                <input class="form-control" type="number" placeholder="Search Points" v-model="pointSearch">
            </form>
            <select class="search-container form-select" v-model="statusSearch">
                <option value="">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
            </select>
        </div>
        
        <!-- filter -->
        <div class="row align-items-center">
            <div class="col-md-auto">
                <p class="mb-0">End Date Filter:</p>
            </div>
            <div class="col-md-auto">
                <div class="input-group">
                    <input type="date" class="form-control " id="startDate" placeholder="Start Date" v-model="startDateSearch">
                </div>
            </div>
            <div class="col-auto">
                <span class="mb-0">-</span>
            </div>
            <div class="col-md-auto">
                <div class="input-group">
                    <input type="date" class="form-control" id="endDate" placeholder="End Date" v-model="endDateSearch">
                </div>
            </div>
        </div>
    </div>  

    <!-- table -->
    <div class="card">
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <div></div>
                <button type="button" class="btn btn-success" @click="openCreateModal">Create A New Reward</button>
            </div>
            <div class="table-responsive">
                <table class="table">   
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Reward Name</th>
                            <th scope="col">Points</th>
                            <th scope="col">Created On</th>
                            <th scope="col">End Date</th>
                            <th scope="col">Status</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in tableData" :key="item.id">
                            <td>{{ item.id}}</td>
                            <td class="reward-name">{{ item.rewardName}}</td>
                            <td>{{ item.rewardPoints}}</td>
                            <td>{{ item.createdOn}}</td>
                            <td>{{ item.endDateTime}}</td>
                            <td class="fw-bold" :class="{
                                'text-success': item.status === 'Active',
                                'text-danger': item.status === 'Expired',
                                'text-primary': item.status === 'Draft'}">
                                {{ item.status }}
                            </td>
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
        </div>
    </div>


    <!-- Reward Modal -->
    <div class="modal fade" id="showModal" :class="{ show: showModal }" style="display: block" v-if="showModal">
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
                                    <!-- VIEW MODAL -->
                                    <div v-if="modalType === 'view'">
                                        <!-- If image exists -->
                                            <div v-if="currentReward.fileDetails">
                                                <label for="input-file" id="drop-area" class="me-2 flex-grow-1">
                                                    <div id="img-view" v-if="currentReward.fileDetails">
                                                        <img :src="currentReward.fileDetails.file_url" :alt="currentReward.fileDetails.filename" class="img-fluid">
                                                    </div>        
                                                </label>
                                            </div>
                                            <!-- If no image -->
                                            <div v-else>
                                                <span class="text-muted">None</span>
                                            </div>
                                    </div>

                                    <!-- EDIT / CREATE MODAL -->
                                    <div v-else>
                                        <div class="d-flex align-items-center mb-2" v-if="currentReward.fileDetails">
                                            <span>{{ currentReward.fileDetails.filename }}</span>
                                            <button type="button" class="btn btn-sm btn-outline-danger ms-2" @click="removeImage">🗑️</button>
                                        </div>
                                        <div class="d-flex align-items-center">
                                            <label for="input-file" id="drop-area" class="me-2 flex-grow-1">
                                                <input type="file" accept="image/*" id="input-file" @change="handleFileChange" hidden>
                                                <!-- If image exists -->
                                                <div id="img-view" v-if="currentReward.fileDetails">
                                                    <img :src="currentReward.fileDetails.file_url" :alt="currentReward.fileDetails.filename" class="img-fluid">
                                                </div>
                                                <!-- If no image exists -->
                                                <div id="img-view" v-else>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-card-image" viewBox="0 0 16 16">
                                                    <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                                                    <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54L1 12.5v-9a.5.5 0 0 1 .5-.5z"/>
                                                </svg>
                                                    <span id="img-name">Click to select image</span>                                                    
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group mb-4">
                                    <label class="form-label">Reward Name:</label>
                                    <input type="text" class="form-control" placeholder="Enter reward name" v-model="currentReward.rewardName" :disabled="modalType === 'view'">
                                    <div class="invalid-feedback d-block" v-if="validation.rewardName">
                                        {{ validation.rewardName }}
                                    </div>
                                </div>
                                <div class="form-group mb-4">
                                    <label class="form-label">Points:</label>
                                    <input type="number" class="form-control" placeholder="Enter points" v-model="currentReward.rewardPoints" :disabled="modalType === 'view'" min="0">
                                    <div class="invalid-feedback d-block" v-if="validation.rewardPoints">
                                        {{ validation.rewardPoints }}
                                    </div>
                                </div>
                                <div class="form-group mb-4">
                                    <label class="form-label">Quantity Available:</label>
                                    <input type="number" class="form-control" placeholder="Enter quantity of the reward" v-model="currentReward.quantity" :disabled="modalType === 'view'" min="0">
                                    <div class="invalid-feedback d-block" v-if="validation.quantity">
                                        {{ validation.quantity }}
                                    </div>                                
                                </div>
                                <div class="form-group mb-4">
                                    <label class="form-label">End Date & Time:</label>
                                    <Datepicker class="custom-datepicker" v-model="currentReward.endDateTime" :is-24="false" :min-date="new Date()" :disabled="modalType === 'view'" ></Datepicker>
                                    <div class="invalid-feedback d-block" v-if="validation.endDateTime">
                                        {{ validation.endDateTime }}
                                    </div>                                
                                </div>
                            </form>
                        </div>

                        <!-- Right Side -->
                        <div class="col-md-6">
                            <div class="form-group mb-4">
                                <label class="form-label">Reward Description:</label>
                                <textarea class="form-control" 
                                    :placeholder="modalType === 'view' && !currentReward.description?.trim() ? 'None' : 'Enter reward description'" 
                                    rows="6" 
                                    v-model="currentReward.description" 
                                    :disabled="modalType === 'view'">
                                </textarea>
                                <div class="invalid-feedback d-block" v-if="validation.description">
                                    {{ validation.description }}
                                </div>  
                            </div>
                            
                            <div class="form-group mb-4">
                                <label class="form-label">Terms & Conditions:</label>
                                <textarea class="form-control" 
                                    :placeholder="modalType === 'view' && !currentReward.terms?.trim() ? 'None' : 'Enter terms & conditions'" 
                                    rows="15" 
                                    v-model="currentReward.terms" 
                                    :disabled="modalType === 'view'">
                                </textarea>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="showModal = false">Close</button>
                    
                    <template v-if="modalType === 'create' || (modalType === 'edit' && currentReward.status === 'Draft')">
                        <button type="button" class="btn btn-primary" @click="saveAsDraft">Save as Draft</button>
                        <button type="button" class="btn btn-success" @click="publishReward">Publish</button>
                    </template>

                    <template v-if="modalType === 'edit' && (currentReward.status === 'Active' || currentReward.status === 'Expired')">
                        <button type="button" class="btn btn-primary" @click="saveEditedReward">Save</button>
                    </template>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showModal"></div>

    <!-- Modal for delete confirmation -->
    <div class="modal fade" id="deleteReward" :class="{ show: showRemoveModal }" style="display: block" v-if="showRemoveModal">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title" id="deleteRewardLabel">Are you sure?</h3>
                </div>
                <div class="modal-body">
                    <span class="text-muted">This action cannot be undone. This will permanently delete the reward, <b>{{currentReward.rewardName}}</b>.</span>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="showRemoveModal = false">Close</button>
                    <button type="button" class="btn btn-danger" @click="confirmDelete">Confirm</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showRemoveModal"></div>

</template>


<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getAllRewards, updateReward, createReward, deleteReward } from "@/api/reward.ts";
import type {RewardItem} from '@/interface/RewardInterface.ts';
import { uploadFile } from '@/api/file_upload'
import { isSuccess, isCreated, isNoContent } from "@/utils/httpStatus.ts"
import Swal from "sweetalert2";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';  

// ===================== Open modal =====================
const tableData = ref<RewardItem[]>([])

const currentReward = ref<any>({})

const showModal = ref(false)
const showRemoveModal = ref(false)
const modalType = ref<'create' | 'edit' | 'view'>('create')

const openCreateModal = () => { 
    resetValidation();
    currentReward.value = {
        rewardName: '',
        rewardPoints: '', 
        image: "",
        quantity:'',
        endDateTime: "",
        description: "",
        terms: "",
        status: 'Draft',
    }
    modalType.value = 'create';
    showModal.value = true;
}
const openViewModal = (reward: any) => { 
    resetValidation();
    currentReward.value = reward; 
    modalType.value = 'view';
    showModal.value = true;
}
const openEditModal = (reward: RewardItem) => {
    resetValidation(); 
    currentReward.value = { ...reward };
        // Ensure endDateTime is properly handled
    if (!reward.endDateTime || reward.endDateTime === 'N/A') {
        currentReward.value.endDateTime = null;
    }
    modalType.value = 'edit';
    showModal.value = true
}
const openDeleteModal = (reward: RewardItem) => { 
    currentReward.value = reward;
    showRemoveModal.value = true
}

// ===================== Manage background scrolling =====================
watch([showModal, showRemoveModal], ([modal, removeModal]) => {
  if (modal || removeModal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

// ===================== Fetch Rewards =====================
const rewardSearch = ref('')
const pointSearch = ref('')
const statusSearch = ref('')
const startDateSearch = ref('')
const endDateSearch = ref('')

const currentPage = ref(1)
const pageSize = 10
const totalCount = ref(0)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) fetchRewards(page)
}
const fetchRewards = (page = 1) => {
    currentPage.value = page

    getAllRewards(
    page, 
    rewardSearch.value.trim(), 
    pointSearch.value, 
    statusSearch.value.trim(),
    startDateSearch.value,
    endDateSearch.value)
    .then((res) => {
        console.log(res.data); 
        
        totalCount.value = res.data.data.count;  
        tableData.value = res.data.data.results.map((item: any) => ({
            id: item.id,
            rewardName: item.reward_title,
            rewardPoints: item.reward_points_required,
            createdOn: dayjs(item.reward_created_date).format("YYYY-MM-DD, HH:mm"),
            quantity: item.reward_quantity, 
            endDateTime: item.reward_end_date_time ? dayjs(item.reward_end_date_time).format("YYYY-MM-DD, HH:mm") : "N/A",
            description: item.reward_description,
            terms: item.reward_terms_and_conditions,
            status: item.reward_status,
            // fileId: item.file,
            fileDetails: item.file || null,
        }));

        
    });
};
onMounted(fetchRewards);
watch([rewardSearch, pointSearch, statusSearch, startDateSearch, endDateSearch], () => {
    fetchRewards(1); // Reset to page 1 on any search input change
});


// ===================== Validation =====================
const validation = ref({
  rewardName: '',
  rewardPoints: '',
  quantity: '',
  endDateTime: '',
  description: '',
});

const validateReward = (mode = 'full') => {
    // Reset all validations
    Object.keys(validation.value).forEach(key => {
        validation.value[key] = '';
    });

    let isValid = true;

    // Validate reward name (both mode needed)
    if (!currentReward.value.rewardName?.trim()) {
        validation.value.rewardName = 'Reward name is required.';
        isValid = false;
    }

    if (mode === 'full') {
        // Validate points
        if (!currentReward.value.rewardPoints && currentReward.value.rewardPoints !== 0) {
            validation.value.rewardPoints = 'Points field is required.';
            isValid = false;
        } else if (Number(currentReward.value.rewardPoints) < 0) {
            validation.value.rewardPoints = 'Points cannot be less than 0.';
            isValid = false;
        }

        // Validate quantity
        if (!currentReward.value.quantity && currentReward.value.quantity !== 0) {
            validation.value.quantity = 'Quantity field is required.';
            isValid = false;
        } else if (Number(currentReward.value.quantity) < 0) {
            validation.value.quantity = 'Quantity cannot be less than 0.';
            isValid = false;
        }

        // Validate end date
        if (!currentReward.value.endDateTime) {
            validation.value.endDateTime = 'End date & time is required.';
            isValid = false;
        } else {
            // Check if end date is in the future
            const endDate = new Date(currentReward.value.endDateTime);
            const now = new Date();
            if (endDate < now) {
                validation.value.endDateTime = 'End date & time must be in the future.';
                isValid = false;
            }
        }

        // Validate description (optional field with character limit)
        if (currentReward.value.description && currentReward.value.description.length > 255) {
            validation.value.description = `Description cannot exceed 255 characters. Current: ${currentReward.value.description.length}/255`;
            isValid = false;
        }
    }

    if (mode === 'draft') {
        if (!currentReward.value.rewardPoints) {
            if (Number(currentReward.value.rewardPoints) < 0) {
                validation.value.rewardPoints = 'Points cannot be less than 0.';
                isValid = false;
            }
        }
        if (!currentReward.value.quantity) {
            if (Number(currentReward.value.quantity) < 0) {
                validation.value.quantity = 'Quantity cannot be less than 0.';
                isValid = false;
            }
        }
    }

    return isValid;
};

const resetValidation = () => {
    validation.value = {
        rewardName: '',
        rewardPoints: '',
        quantity: '',
        endDateTime: '',
        description: '',
    };
};

// ===================== Publish Reward =====================
const publishReward = async () => {
    if (!validateReward('full')) return;

    try {
        //   upload the file if one is selected
        let fileId = null;
        
        if (selectedFile.value) {
            try {
                const uploadResponse = await uploadFile(selectedFile.value);
                if (isSuccess(uploadResponse.status)) {
                    // Just store the file ID or reference instead of the entire file data
                    fileId = uploadResponse.data.data.id; // Adjust based on your API response structure
                    console.log("File uploaded successfully, ID:", fileId);
                }
            } catch (uploadError) {
                console.error("File upload error:", uploadError);
                    Swal.fire({
                    icon: "error",
                    title: "File upload failed",
                    text: "Please try again",
                });
                return; // Stop if file upload fails
            }
        } else if (currentReward.value.fileDetails && currentReward.value.fileDetails.id) {
            // Use existing file ID if available
            fileId = currentReward.value.fileDetails.id;
        }
        
        // Prepare data based on whether we're creating or editing
        const data = {
            reward_title: currentReward.value.rewardName || "",
            reward_points_required: currentReward.value.rewardPoints || 0,
            reward_quantity: currentReward.value.quantity || 0,
            reward_end_date_time: dayjs(currentReward.value.endDateTime).format("YYYY-MM-DD HH:mm:ss") || "",
            reward_description: currentReward.value.description || "",
            reward_terms_and_conditions: currentReward.value.terms || "",
            reward_status: "Active",
            // Only send the file ID instead of the whole file object
            file_id: fileId
        };

        console.log("Creating/updating reward with data:", data);
        showModal.value = false;

        let res;
        if (modalType.value === 'create') {
            res = await createReward(data);
        } else if (modalType.value === 'edit') {
            res = await updateReward(currentReward.value.id, data);
        }

        if (isSuccess(res.status)) {
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Reward published successfully",
                showConfirmButton: false,
                timer: 1500
            });
            selectedFile.value = null;
            fetchRewards();
        }
    } catch (error) {
        console.error("Error with reward:", error.response?.data || error);
        showModal.value = false;
        Swal.fire({
            icon: "error",
            title: "Error publishing reward",
            text: "Please check your form and try again",
        });
    }
};

// ===================== Save as Draft =====================
const saveAsDraft = async() => {
    if (!validateReward('draft')) return;

    try {
        let fileId = null;

        if (selectedFile.value) {
            try {
                const uploadResponse = await uploadFile(selectedFile.value)
                if (isSuccess(uploadResponse.status)) {
                    fileId = uploadResponse.data.data.id;
                    console.log("File uploaded successfully, ID:", fileId);
                    currentReward.value.fileDetails = uploadResponse.data.data;
                }

            } catch (uploadError) {
                console.error("File upload error:", uploadError);
                Swal.fire({
                    icon: "error",
                    title: "File upload failed",
                    text: "Please try again",
                });
                return;
            }
        } else if (currentReward.value.fileDetails && currentReward.value.fileDetails.id) {
            fileId = currentReward.value.fileDetails.id;
        }

        const data: any = {
            reward_title: currentReward.value.rewardName || "",
            reward_points_required: currentReward.value.rewardPoints || 0,
            reward_quantity: currentReward.value.quantity || 0,
            reward_description: currentReward.value.description || "",
            reward_terms_and_conditions: currentReward.value.terms || "",
            reward_status: "Draft",
            file_id: fileId
        }

        if (currentReward.value.endDateTime) {
            data.reward_end_date_time = dayjs(currentReward.value.endDateTime).format("YYYY-MM-DD HH:mm:ss");
        }

        console.log("Update reward payload:", data);
        showModal.value = false;

        let res;
        if (modalType.value === 'create') {
            res = await createReward(data);
        } else if (modalType.value === 'edit') {
            res = await updateReward(currentReward.value.id, data);
        }

        if (isSuccess(res.status)) {
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Reward saved as draft successfully",
                showConfirmButton: false,
                timer: 1500
            });
            selectedFile.value = null;
            fetchRewards();
        }
    } 

    catch (error) {
        console.error("Error with reward:", error.response?.data || error);
        showModal.value = false;
        Swal.fire({
            icon: "error",
            title: "Error saving as draft",
            text: "Please check your form and try again",
        });
    }
};


// ===================== Save Reward =====================
const saveEditedReward = async () => {
    if (!validateReward('full')) return;

    try {
        // First step: If a new file is selected, upload it first
        let fileId = null;
        
        if (selectedFile.value) {
            try {
                const uploadResponse = await uploadFile(selectedFile.value);
                if (isSuccess(uploadResponse.status)) {
                    // Get the file ID from the upload response
                    fileId = uploadResponse.data.data.id;
                    console.log("File uploaded successfully, ID:", fileId);
                    
                    // Update the current reward's file details with the new file data for UI display
                    currentReward.value.fileDetails = uploadResponse.data.data;
                }
            } catch (uploadError) {
                console.error("File upload error:", uploadError);
                Swal.fire({
                    icon: "error",
                    title: "File upload failed",
                    text: "Please try again",
                });
                return;
            }
        } else if (currentReward.value.fileDetails && currentReward.value.fileDetails.id) {
            // Use existing file ID if no new file was selected
            fileId = currentReward.value.fileDetails.id;
        }
        
        // Calculate the correct status based on the new end date
        const endDateTime = dayjs(currentReward.value.endDateTime);
        const now = dayjs();
        const calculatedStatus = endDateTime.isAfter(now) ? 'Active' : 'Expired';
        
        // Second step: Update the reward with the file ID reference 
        const data = {
            reward_title: currentReward.value.rewardName,
            reward_points_required: currentReward.value.rewardPoints,
            reward_quantity: currentReward.value.quantity,
            reward_end_date_time: endDateTime.format("YYYY-MM-DD HH:mm:ss"),
            reward_description: currentReward.value.description,
            reward_terms_and_conditions: currentReward.value.terms,
            reward_status: calculatedStatus, // Use calculated status instead of current status
            // Send the file ID in the file_id field instead of the file object
            file_id: fileId
        };

        console.log("Update reward payload:", data);
        
        showModal.value = false;

        const res = await updateReward(currentReward.value.id, data);
        if (isSuccess(res.status)) {
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Reward updated successfully",
                showConfirmButton: false,
                timer: 1500
            });
            selectedFile.value = null;
            
            fetchRewards();
        }
    } catch (error) {
        console.error("Error updating reward:", error.response?.data || error);
        Swal.fire({
            icon: "error",
            title: "Error updating reward",
            text: "Please check your form and try again",
        });
    }
};

// ===================== Delete Reward =====================
const confirmDelete = () => {
    showRemoveModal.value = false;

    deleteReward(currentReward.value.id).then((res) => {
        if (isSuccess(res.status)) {
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Reward deleted successfully",
                showConfirmButton: false,
                timer: 1500
            })
            fetchRewards()
        }
    })
}

// ===================== Handle image =====================
const selectedFile = ref(null);

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0];
  
  if (selectedFile.value) {
    // Create a preview for the UI
    const reader = new FileReader();
    reader.onload = (e) => {
      currentReward.value.fileDetails = {
        file_url: e.target.result,
        filename: selectedFile.value.name
      };
    };
    reader.readAsDataURL(selectedFile.value);
  }
};

// ===================== Remove Image =====================
const removeImage = () => {
    // Clear the file from UI
    currentReward.value.fileDetails = null;
    // Clear any selected file that might be pending upload
    selectedFile.value = null;
    // Clear the file input value to allow selecting the same file again
    const fileInput = document.getElementById('input-file') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
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
.search-container  .form-control {
    padding-left: 35px; /* Ensure text doesn't overlap the icon */
}

.table-card {
    border: 1px solid #707070;
    padding: 2rem;
    margin-bottom: 1rem;
    border-radius: 20px;
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
  max-width: 200px; /* or adjust based on your table layout */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
    border-color: #ababab;
}
.row {
    display: flex;
    align-items: stretch; /* Ensures columns and dividing line stretch to match tallest content */
}
.col-md-6:not(:last-child) {
    border-right: 1px solid #ababab; /* Vertical line between columns */
    padding-right: 30px;
}
.col-md-6:last-child {
    padding-left: 30px;
}

#drop-area {
    min-height: 300px;
    max-height: 400px; /* Add maximum height constraint */
    background: white;
    border-radius: 16px;
    padding: 15px;
    border: 1px solid #ababab;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    cursor: pointer;
}

#img-view {
    width: 100%; 
    height: 100%;
    max-height: 300px; /* Constrain the image container height */
    border-radius: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    overflow: hidden;
}

/* Key fix: Constrain the actual image size */
#img-view img {
    max-width: 100%;
    max-height: 250px; /* Maximum height for images */
    width: auto;
    height: auto;
    object-fit: contain; /* Maintain aspect ratio and fit within bounds */
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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

.custom-datepicker :deep(.dp__input) {
  border-color: #ababab !important;
  border-radius: 0.375rem !important;
}

.custom-datepicker :deep(.dp__main) {
  border-color: #ababab !important;
}

.custom-datepicker :deep(.dp__input:disabled) {
  background-color: transparent !important;
  border-color: #ababab !important;
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
