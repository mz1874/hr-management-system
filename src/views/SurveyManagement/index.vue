<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router'; // Import useRouter and useRoute
import Swal from 'sweetalert2'; // Import SweetAlert2
import {
  getAllEvaluationForms,
  createEvaluationForm,
  deleteEvaluationForm,
  publishEvaluationForm,
  updateEvaluationForm,
  getEvaluationInstances, // Import function to get results list
  getEvaluationInstanceById // Import function to get single instance details
} from '@/api/survey'
import { selectAllDepartments } from '@/api/department'
import type { EvaluationForm, EvaluationQuestion, RowyQuestionOption, EvaluationInstance, EvaluationAnswerView } from '@/api/survey' // Import EvaluationInstance & EvaluationAnswerView types

// Interface for the evaluation form list items (matches backend EvaluationForm structure)
interface EvaluationItem extends Omit<EvaluationForm, 'questions'> {
    questions: QuestionItem[]; // Use local QuestionItem interface for UI state
    submission_count?: number; // Add optional submission count
}

// Interface for questions within the UI state (includes options as RowyQuestionOption)
interface QuestionItem extends Omit<EvaluationQuestion, 'options'> {
    options?: RowyQuestionOptionItem[]; // Use local RowyQuestionOptionItem interface for UI state
}

// Interface for question options within the UI state
interface RowyQuestionOptionItem extends RowyQuestionOption {}


// TODO: Fetch departments from API
interface Department {
  id: number;
  department_name: string; // Updated to match likely API response
}

const allDepartments = ref<Department[]>([]); // Initialize as empty

const departmentMap = computed(() => {
  return allDepartments.value.reduce((map, dept) => {
    map[dept.id] = dept.department_name; // Updated to match likely API response
    return map;
  }, {} as Record<number, string>);
});

// Evaluation data from API
const rawTableData = ref<EvaluationItem[]>([]) // Store raw data from API
const totalSurveys = ref(0) // For pagination

// Computed property for filtered data (date filtering removed, relying on backend name filter)
const tableData = computed(() => {
  // Backend handles name filtering, no further filtering needed here
  return rawTableData.value;
});

// Modal state
const showModal = ref(false)
const currentEvaluation = ref<Partial<EvaluationItem> & { questions: QuestionItem[] }>({ questions: [] })
const modalType = ref<'create' | 'edit' | 'view'>('create')
const showPublishModal = ref(false)
const selectedDepartmentsForPublish = ref<number[]>([]) // Use numbers for department IDs

// Delete confirmation modal state
const showDeleteConfirmModal = ref(false)
const evaluationToDelete = ref<EvaluationItem | null>(null)

// Filtering state
const searchName = ref('')
// Define possible statuses for the dropdown
const surveyStatusesForDropdown = ['DRAFT', 'PUBLISHED', 'SUBMITTED'];
// State for the selected status filter. Use string | null to accommodate 'SUBMITTED'.
const selectedStatus = ref<string | null>(null);
// Removed startDate and endDate as filtering is backend-handled

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(10) // Set items per page to 10

// Router instance
const router = useRouter(); 
const route = useRoute(); // Add useRoute

// --- State for Results View ---
const isViewingResults = ref(false);
const resultsFormId = ref<number | null>(null);
const resultsFormName = ref<string>('');
const currentResultsData = ref<EvaluationInstance[]>([]);
const resultsLoading = ref(false);
const resultsError = ref<string | null>(null);

// --- State for Detailed Results Modal ---
const showDetailsModal = ref(false);
const selectedInstanceForDetails = ref<EvaluationInstance | null>(null);
// Use EvaluationAnswerView[] for detailed answers, assuming API returns this structure within the instance
const detailedAnswersData = ref<EvaluationAnswerView[]>([]);
const detailsLoading = ref(false);
const detailsError = ref<string | null>(null);


// --- Fetching Data ---
const fetchSurveys = async () => {
  try {
    // Pass backend-supported search parameters. Status can now be string | null.
    const params: { search?: string; status?: string; page_size?: number } = {}; // Use string for status
    if (searchName.value) {
        params.search = searchName.value;
    }
    if (selectedStatus.value) { // Add status to params if selected
        params.status = selectedStatus.value;
    }

// Fetch data for the current page using backend pagination and filtering
    // Add page_size parameter
    const response = await getAllEvaluationForms(currentPage.value, { ...params, page_size: itemsPerPage.value })

    // Add checks for response.data and nested data structure
    if (response.data && response.data.data && Array.isArray(response.data.data.results)) {
        // Map the backend response to the local EvaluationItem interface
        // Corrected: Access results and count from response.data.data
        rawTableData.value = response.data.data.results.map(form => ({
            id: form.id,
            name: form.name,
            description: form.description, // Include description
            publish_time: form.publish_time, // Use backend field name
            status: form.status,
            submission_count: form.submission_count || 0, // Map submission count (default to 0 if not provided)
            // Map department_details (objects) to an array of department IDs
            departments: Array.isArray(form.department_details) ? form.department_details.map(dept => dept.id) : [],
            department_details: form.department_details, // Keep original details if needed elsewhere
            created_at: form.created_at, // Include created_at
            questions: form.questions.map(q => ({
                id: q.id,
                text: q.text,
                question_type: q.question_type,
                order: q.order,
                // Map backend options (RowyQuestionOption[]) to local options (RowyQuestionOptionItem[])
                options: q.question_type === 'OPTIONS' && Array.isArray(q.options) ? q.options.map(opt => ({
                    id: opt.id,
                    option_text: opt.option_text,
                    order: opt.order
                })) : undefined // Ensure undefined if not OPTIONS or no options
            }))
        }));
        totalSurveys.value = response.data.data.count; // Total count from backend
        console.log("Fetched surveys:", rawTableData.value);
    } else {
        console.error("Failed to fetch surveys: Unexpected response format", response);
        rawTableData.value = [];
        totalSurveys.value = 0;
        // TODO: Show a user-friendly error message
    }
  } catch (error) {
    console.error("Failed to fetch surveys:", error);
    // TODO: Show error message to user
    rawTableData.value = [] // Clear data on error
    totalSurveys.value = 0
  }
}

// Fetch initial data on component mount
onMounted(async () => {
  await fetchSurveys();
  // Fetch departments dynamically
  try {
    const response = await selectAllDepartments();
    if (response.data && response.data.code === 200 && Array.isArray(response.data.data.results)) {
      allDepartments.value = response.data.data.results;
      console.log("Departments fetched successfully:", allDepartments.value);
    } else {
      console.error("Failed to fetch department list: Unexpected response format or code", response);
      allDepartments.value = [];
      // TODO: Show a user-friendly error message
    }
  } catch (error) {
    console.error("Error fetching departments:", error);
    allDepartments.value = []; // Set to empty on error
    // TODO: Show error message to user
  }

  // Check for query params to auto-view results after redirect
  const formIdToView = route.query.viewResultsFormId;
  const formNameParam = route.query.formName;
  if (formIdToView && typeof formIdToView === 'string') {
    const formToView: EvaluationItem = { 
        id: parseInt(formIdToView, 10), 
        name: typeof formNameParam === 'string' ? formNameParam : `Form ID ${formIdToView}`,
        questions: [], // Dummy data, as viewResults primarily uses id and name
        status: 'PUBLISHED', // Dummy status
        departments: [], // Dummy
        // Add other minimal required fields for EvaluationItem if viewResults depends on them
    };
    viewResults(formToView); 
  }
});

// Watch for changes in the search term
watch(searchName, () => {
  // Reset to the first page when the search term changes
  currentPage.value = 1;
  fetchSurveys(); // Fetch data with the new search term and current status filter
});

// Watch for changes in the status filter
watch(selectedStatus, () => {
  currentPage.value = 1; // Reset to the first page
  fetchSurveys(); // Fetch data with the new status filter
});

// Watch for changes in the current page
watch(currentPage, () => {
  // Fetch data for the new page
  fetchSurveys();
});

// Removed handleSearch as fetching is now handled by the watchers
// const handleSearch = () => {
//   currentPage.value = 1; // Reset to first page on new search
//   fetchSurveys();
// }

// --- Modal Actions ---

// 打开创建模态框
const openEvaluationModal = () => {
  currentEvaluation.value = {
    name: '',
    description: '', // Initialize description
    publish_time: null, // Use backend field name
    status: 'DRAFT',
    departments: [],
    questions: []
  }
  modalType.value = 'create'
  showModal.value = true
}

// 打开发布模态框
const openPublishModal = (evaluation: EvaluationItem) => {
  currentEvaluation.value = JSON.parse(JSON.stringify(evaluation)); // Use deep copy
  selectedDepartmentsForPublish.value = evaluation.departments || []; // Initialize checkboxes
  showPublishModal.value = true
}

// 发布Evaluation - API Call
const handlePublishEvaluation = async () => {
  if (!currentEvaluation.value || !currentEvaluation.value.id) return;
  try {
    // Send selected departments with the publish request
    await publishEvaluationForm(currentEvaluation.value.id, { departments: selectedDepartmentsForPublish.value });
    // Refresh data or update local state
    await fetchSurveys()
    showPublishModal.value = false
    selectedDepartmentsForPublish.value = [] // Reset selection
    Swal.fire('Success', 'Evaluation published successfully!', 'success'); // Show success notification
  } catch (error) {
    console.error("Failed to publish survey:", error);
    Swal.fire('Error', 'Failed to publish evaluation.', 'error'); // Show error notification
    // TODO: Show error message
  }
}

// Open delete confirmation modal
const handleDeleteEvaluation = (evaluation: EvaluationItem) => {
  evaluationToDelete.value = evaluation;
  showDeleteConfirmModal.value = true;
}

// Confirm and delete Evaluation - API Call
const confirmDeleteEvaluation = async () => {
  if (!evaluationToDelete.value || !evaluationToDelete.value.id) return;
  try {
    await deleteEvaluationForm(evaluationToDelete.value.id)
    // Refresh data
    await fetchSurveys()
    showDeleteConfirmModal.value = false;
    evaluationToDelete.value = null; // Clear the item
    Swal.fire('Success', 'Evaluation deleted successfully!', 'success'); // Show success notification
  } catch (error) {
    console.error("Failed to delete survey:", error);
    Swal.fire('Error', 'Failed to delete evaluation.', 'error'); // Show error notification
  }
}

// 添加问题
const addQuestion = (type: 'grade' | 'option' | 'text_input') => { // Add 'text_input' type
  if (!currentEvaluation.value.questions) currentEvaluation.value.questions = []
  let backendType: 'RATING' | 'OPTIONS' | 'TEXT_INPUT'; // Update type definition
  let options = undefined;
  if (type === 'grade') {
    backendType = 'RATING';
  } else if (type === 'option') {
    backendType = 'OPTIONS';
    options = [{ option_text: '', order: 0 }]; // Initialize with one empty option for OPTIONS
  } else { // Handle 'text_input'
    backendType = 'TEXT_INPUT';
  }
  // Corrected object literal: assign options only once
  const newQuestion: QuestionItem = {
    question_type: backendType,
    text: '',
    options: options, // Assign options based on type (will be undefined for RATING and TEXT_INPUT)
    order: currentEvaluation.value.questions.length // Example: set order based on array index
  }
  currentEvaluation.value.questions.push(newQuestion)
}

// 删除问题 (local only before save)
const removeQuestion = (questionIndex: number) => { // Use index since ID might not exist yet
  if (currentEvaluation.value.questions) {
    currentEvaluation.value.questions.splice(questionIndex, 1);
  }
}

// 添加选项 (local only before save)
const addOption = (questionIndex: number) => {
  const question = currentEvaluation.value.questions[questionIndex];
  // Only add options for 'OPTIONS' type questions
  if (question && question.question_type === 'OPTIONS') {
    if (!question.options) question.options = [];
    // Add a new empty option object
    question.options.push({ option_text: '', order: question.options.length }); // Example: set order
  }
}

// 删除选项 (local only before save)
const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = currentEvaluation.value.questions[questionIndex];
    // Only remove options for 'OPTIONS' type questions
    if (question && question.question_type === 'OPTIONS' && question.options) {
        question.options.splice(optionIndex, 1);
        // Optional: re-order remaining options
        question.options.forEach((opt, index) => opt.order = index);
    }
}

// 创建Evaluation - API Call
const handleAddEvaluation = async () => {
  // Basic validation
  if (!currentEvaluation.value.name || !currentEvaluation.value.questions || currentEvaluation.value.questions.length === 0) {
      console.error("Validation failed: Name and at least one question required.");
      // TODO: Add user feedback for validation error
      return;
  }

  try {
    // Prepare payload and explicitly map questions to match EvaluationQuestion
    const mappedQuestions: EvaluationQuestion[] = currentEvaluation.value.questions.map((q, index) => {
        const mappedQuestion: EvaluationQuestion = { // Use backend type
            question_type: q.question_type,
            text: q.text,
            order: q.order !== undefined ? q.order : index, // Preserve or set order
            // Include options if they exist and question type is 'OPTIONS'
            options: q.question_type === 'OPTIONS' ? q.options?.filter(opt => opt.option_text && opt.option_text.trim() !== '') : undefined // Filter out empty options
        };
        return mappedQuestion;
    }).filter(q => q.text && q.text.trim() !== ''); // Ensure text is not empty

    if (mappedQuestions.length === 0) {
        console.error("Validation failed: At least one valid question required.");
        // TODO: Add user feedback
        return;
    }

    // Construct the final payload with the correct type (Omit irrelevant fields for creation)
    // Reverted payload to original structure
    const payload: Omit<EvaluationForm, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'status' | 'publish_time' | 'department_details'> = {
        name: currentEvaluation.value.name!,
        description: currentEvaluation.value.description || '', // Include description
        questions: mappedQuestions,
        departments: currentEvaluation.value.departments || [] // Ensure this is an array of IDs
    };

    await createEvaluationForm(payload) // Use correct API function and payload
    await fetchSurveys() // Refresh data
    showModal.value = false
    Swal.fire('Success', 'Evaluation created successfully!', 'success'); // Show success notification
  } catch (error) {
    console.error("Failed to create survey:", error);
    Swal.fire('Error', 'Failed to create evaluation.', 'error'); // Show error notification
  }
}

// --- Edit Functionality ---
const openEditModal = (evaluation: EvaluationItem) => {
  // Ensure the evaluation object copied matches the expected structure, especially status
  currentEvaluation.value = JSON.parse(JSON.stringify(evaluation)); // Deep copy

  // Map questions from EvaluationForm structure back to QuestionItem for UI state
  currentEvaluation.value.questions = evaluation.questions.map(q => ({
      id: q.id,
      text: q.text,
      question_type: q.question_type,
      order: q.order,
      // Map backend options (RowyQuestionOption[]) to local options (RowyQuestionOptionItem[])
      options: q.options?.map(opt => ({
          id: opt.id,
          option_text: opt.option_text,
          order: opt.order
      })) || undefined // Ensure undefined if no options
  }));
  modalType.value = 'edit';
  showModal.value = true;
}

const handleSaveEditedEvaluation = async () => {
  if (!currentEvaluation.value || !currentEvaluation.value.id) return;

  // Basic validation
  if (!currentEvaluation.value.name || !currentEvaluation.value.questions || currentEvaluation.value.questions.length === 0) {
    console.error("Validation failed: Name and at least one question required.");
    // TODO: Add user feedback
    return;
  }

  // Prepare payload, ensuring correct mapping - similar to create
  const mappedQuestions: EvaluationQuestion[] = currentEvaluation.value.questions.map((q, index) => {
        const mappedQuestion: EvaluationQuestion = { // Use backend type, include id for update
            id: q.id, // Include id for updates
            question_type: q.question_type,
            text: q.text,
            order: q.order !== undefined ? q.order : index, // Preserve or set order
            // Include options if they exist and question type is 'OPTIONS'
            options: q.question_type === 'OPTIONS' ? q.options?.filter(opt => opt.option_text && opt.option_text.trim() !== '') : undefined // Filter out empty options
        };
        return mappedQuestion;
    }).filter(q => q.text && q.text.trim() !== ''); // Ensure text is not empty

   if (mappedQuestions.length === 0) {
        console.error("Validation failed: At least one valid question required.");
        // TODO: Add user feedback
        return;
    }

    // Construct the base payload for update
    // Reverted payload to original structure
    const payload: Partial<Omit<EvaluationForm, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'status' | 'publish_time' | 'department_details'>> & { departments?: number[] } = {
        name: currentEvaluation.value.name,
        description: currentEvaluation.value.description || '', // Include description
        questions: mappedQuestions,
    };

    // Conditionally add departments if the evaluation is PUBLISHED (Original logic)
    if (currentEvaluation.value.status === 'PUBLISHED') {
        payload.departments = currentEvaluation.value.departments || [];
    }


  try {
    await updateEvaluationForm(currentEvaluation.value.id!, payload); // Use correct API function and payload
    await fetchSurveys(); // Refresh data
    showModal.value = false;
    Swal.fire('Success', 'Evaluation updated successfully!', 'success'); // Show success notification
  } catch (error) {
    console.error("Failed to update survey:", error);
    Swal.fire('Error', 'Failed to update evaluation.', 'error'); // Show error notification
  }
}

// --- Computed Properties for Pagination ---

const totalPages = computed(() => {
    // Pagination should ideally be based on the filtered data count if filtering is active,
    // but API provides total count before frontend filtering. Sticking to API total for now.
    // This means pagination might show more pages than actually contain data when filters are applied.
    return Math.ceil(totalSurveys.value / itemsPerPage.value)
})

// Use the computed tableData for display
const paginatedLogs = computed(() => tableData.value)

// --- Pagination Navigation ---
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Helper function for date formatting
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'NOT PUBLISHED';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date'; // Handle invalid date strings
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Date Error';
  }
};

// Helper function for date formatting (including time) - potentially needed for results
const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Date Error';
  }
};


// --- View Results Functionality ---
const fetchAndShowResults = async (evaluation: EvaluationItem) => {
  if (!evaluation.id) {
    Swal.fire('Error', 'Cannot view results as the Evaluation ID is missing.', 'error');
    return;
  }

  resultsFormId.value = evaluation.id;
  resultsFormName.value = evaluation.name;
  isViewingResults.value = true;
  resultsLoading.value = true;
  resultsError.value = null;
  currentResultsData.value = [];

  try {
    // Assuming getEvaluationInstances fetches all results for a formId for now
    // Add pagination to getEvaluationInstances if needed later
    const response = await getEvaluationInstances(1, { formId: resultsFormId.value });

    // Adjust to handle the nested structure for results from getEvaluationInstances
    if (response.data && response.data.data && response.data.data.results && Array.isArray(response.data.data.results.results)) {
      currentResultsData.value = response.data.data.results.results; // Access the nested array
      console.log("Fetched evaluation instances:", currentResultsData.value);
      if (currentResultsData.value.length === 0) {
         // Optionally update form name if fetched data has it and is more accurate
         // formName.value = currentResultsData.value[0]?.form?.name || `Form ID ${resultsFormId.value}`;
      }
    } else {
      console.error("Failed to fetch evaluation results: Unexpected response format", response);
      resultsError.value = "Failed to fetch results due to unexpected response format.";
    }
  } catch (err: any) {
    console.error("Failed to fetch evaluation results:", err);
    resultsError.value = err.response?.data?.detail || err.message || "An unknown error occurred.";
  } finally {
    resultsLoading.value = false;
  }
};

const closeResultsView = () => {
  isViewingResults.value = false;
  resultsFormId.value = null;
  resultsFormName.value = '';
  currentResultsData.value = [];
  resultsError.value = null;
};

// Modified viewResults to call the fetch function
const viewResults = (evaluation: EvaluationItem) => {
  console.log("View Results clicked for:", evaluation);
  fetchAndShowResults(evaluation);
};

// --- Fetch and Show Detailed Instance Results ---
const fetchAndShowInstanceDetails = async (instance: EvaluationInstance) => {
  if (!instance || !instance.id) {
    Swal.fire('Error', 'Cannot view details as the Instance ID is missing.', 'error');
    return;
  }

  selectedInstanceForDetails.value = instance; // Store the selected instance
  showDetailsModal.value = true; // Show the modal immediately
  detailsLoading.value = true;
  detailsError.value = null;
  detailedAnswersData.value = []; // Clear previous data

  try {
    // Fetch the full instance details using the existing API function
    const response = await getEvaluationInstanceById(instance.id);

    // Check response structure - API wraps the instance data under response.data.data
    if (response.data && response.data.data && Array.isArray(response.data.data.answers)) {
      detailedAnswersData.value = response.data.data.answers; // Access nested answers
      console.log("Fetched detailed answers:", detailedAnswersData.value);
    } else {
      console.error("Failed to fetch instance details: Unexpected response format", response);
      detailsError.value = "Failed to fetch details due to unexpected response format.";
      detailedAnswersData.value = []; // Ensure it's empty on error
    }
  } catch (err: any) {
    console.error("Failed to fetch instance details:", err);
    detailsError.value = err.response?.data?.detail || err.message || "An unknown error occurred.";
    detailedAnswersData.value = []; // Ensure it's empty on error
  } finally {
    detailsLoading.value = false;
  }
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedInstanceForDetails.value = null;
  detailedAnswersData.value = [];
  detailsError.value = null;
  detailsLoading.value = false; // Reset loading state
};


</script>

<template>
  <!-- Survey List View -->
  <template v-if="!isViewingResults">
    <div class="main-content container-fluid px-3 px-md-4">
      <!-- Main Content Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="h3">Evaluation Center</h2>
      </div>

      <!-- Filter and Search Row -->
      <div class="filter-container announcement-toolbar d-flex flex-wrap align-items-center gap-3 mb-4">
        <!-- Search Input -->
        <div class="search-container flex-grow-1">
          <i class="fas fa-search search-icon"></i>
          <input
            v-model="searchName"
            type="text"
            class="search-input"
            placeholder="Search Evaluation Name"
          />
        </div>

        <!-- Status Filter Dropdown -->
        <div class="status-filter-container">
          <select v-model="selectedStatus" class="form-select status-filter-select">
            <option :value="null">All Status</option> <!-- Changed text slightly -->
            <!-- Iterate over statuses defined for the dropdown -->
            <option v-for="status in surveyStatusesForDropdown" :key="status" :value="status">
              {{ status }}
            </option>
          </select>
        </div>

        <!-- Create Button -->
        <div class="d-flex gap-2">
          <button type="button" class="btn new-announcement-btn" @click="openEvaluationModal">Create A New Evaluation</button>
        </div>
      </div>

      <!-- Table -->
      <div class="table-card">
        <table class="table">
          <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Name</th>
            <th scope="col">Created Date</th>
            <th scope="col">Published Date</th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
          </thead>
          <tbody v-if="paginatedLogs.length > 0">
            <tr v-for="item in paginatedLogs" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <!-- Use formatDate helper -->
              <td>{{ formatDate(item.created_at) }}</td>
              <td>{{ formatDate(item.publish_time) }}</td>
              <!-- Display SUBMITTED if results exist, otherwise the original status -->
              <td>{{ item.submission_count && item.submission_count > 0 ? 'SUBMITTED' : item.status }}</td>
              <td>
                <!-- Hide Edit button if derived status is SUBMITTED -->
                <button v-if="!(item.submission_count && item.submission_count > 0)" type="button" class="btn btn-warning btn-action" @click="openEditModal(item)">Edit</button>
                <!-- Only show Publish for DRAFT status -->
                <button v-if="item.status === 'DRAFT'" type="button" class="btn btn-primary btn-action" @click="openPublishModal(item)">Publish</button>
                <!-- Add View Results button for PUBLISHED status AND if submissions exist -->
                <button v-if="item.status === 'PUBLISHED' && item.submission_count && item.submission_count > 0" type="button" class="btn btn-info btn-action" @click="viewResults(item)">View Results</button>
                <button type="button" class="btn btn-danger btn-action" @click="handleDeleteEvaluation(item)">Delete</button>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="7" class="text-center">No evaluations found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="d-flex align-items-center gap-3 my-3" v-if="totalSurveys > 0">
        <div class="text-muted fs-5">
          Total: {{ totalSurveys }}
        </div>

        <nav aria-label="Page navigation">
          <ul class="pagination mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="prevPage" :disabled="currentPage === 1">Previous</button>
            </li>
            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }">
              <button class="page-link" @click="goToPage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="nextPage" :disabled="currentPage === totalPages">Next</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </template>

  <!-- Results View -->
  <template v-else>
    <div class="main-content container-fluid px-3 px-md-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="h3">Evaluation Results: {{ resultsFormName || 'Loading...' }}</h2>
        <button @click="closeResultsView" class="btn btn-secondary">Back to List</button>
      </div>

      <!-- Loading State -->
      <div v-if="resultsLoading" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading results...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="resultsError" class="alert alert-danger" role="alert">
        Error loading results: {{ resultsError }}
      </div>

      <!-- Results Table -->
      <div v-else-if="currentResultsData.length > 0" class="table-card">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th scope="col">Instance ID</th>
              <th scope="col">Employee</th>
              <th scope="col">Submitted At</th>
              <th scope="col">Status</th>
              <th scope="col">Avg. Rating</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="instance in currentResultsData" :key="instance.id">
              <td>{{ instance.id }}</td>
              <td>{{ instance.employee?.username || 'N/A' }}</td>
              <td>{{ formatDateTime(instance.submitted_at) }}</td> <!-- Use formatDateTime -->
              <td>
                <span :class="['badge', instance.status === 'SUBMITTED' ? 'bg-success' : instance.status === 'PENDING' ? 'bg-warning text-dark' : 'bg-secondary']">
                  {{ instance.status }}
                </span>
              </td>
              <td>{{ (typeof instance.overall_rating_avg === 'string' && !isNaN(parseFloat(instance.overall_rating_avg))) ? parseFloat(instance.overall_rating_avg).toFixed(2) : (typeof instance.overall_rating_avg === 'number' ? instance.overall_rating_avg.toFixed(2) : 'N/A') }}</td>
              <td>
                <!-- Enable button and link to fetchAndShowInstanceDetails -->
                <button class="btn btn-sm btn-outline-primary" @click="fetchAndShowInstanceDetails(instance)">View Details</button>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- TODO: Add pagination controls for results if needed -->
      </div>

      <!-- No Results State -->
      <div v-else class="alert alert-info" role="alert">
        No submitted results found for this evaluation form yet.
      </div>
    </div>
  </template>

  <!-- Modals remain outside the conditional templates -->
  <!-- 创建/编辑Evaluation模态框 -->
  <div class="modal fade" id="createEvaluation" :class="{ show: showModal }" style="display: block" v-if="showModal">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <div class="header-content">
            <h3>
              {{ modalType === 'edit' ? 'Edit Evaluation':
                modalType === 'create' ? 'Create New Evaluation' :
                    modalType === 'view' ? 'View Evaluation' : ''}}
            </h3>
          </div>
          <button type="button" class="btn-close" @click="showModal = false" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <!-- Main Row for two-column layout -->
          <div class="row">
            <!-- Left Column -->
            <div class="col-md-6 border-end">
              <!-- Evaluation Name -->
              <div class="form-group mb-3">
                <label class="form-label">Evaluation Name:</label>
                <input type="text" class="form-control" placeholder="Enter evaluation name" v-model="currentEvaluation.name" :disabled="modalType === 'view'">
              </div>
              <!-- Department Selection (Edit Modal) - Only show for PUBLISHED status -->
              <div class="form-group mb-3" v-if="modalType === 'edit' && currentEvaluation.status === 'PUBLISHED'">
                <label class="form-label">Assigned Departments:</label>
                <div v-if="allDepartments && allDepartments.length > 0" class="border p-3 rounded bg-light" style="max-height: 150px; overflow-y: auto;">
                  <div v-for="dept in allDepartments" :key="'edit-dept-' + dept.id" class="form-check mb-2">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :value="dept.id"
                      v-model="currentEvaluation.departments"
                    >
                    <label class="form-check-label">
                      {{ dept.department_name }}
                    </label>
                  </div>
                </div>
                <div v-else class="text-muted mt-2">
                  No departments available or assigned.
                </div>
              </div>
              <!-- Evaluation Description (Optional, can be uncommented if needed) -->
              <!-- <div class="form-group mb-3">
                <label class="form-label">Description:</label>
                <textarea class="form-control" rows="3" placeholder="Enter description" v-model="currentEvaluation.description" :disabled="modalType === 'view'"></textarea>
              </div> -->
            </div>

            <!-- Right Column -->
            <div class="col-md-6">
              <!-- 问题管理 (Questions Section) -->
              <label class="form-label">Questions:</label>
              <div v-if="currentEvaluation.questions && currentEvaluation.questions.length > 0"> <!-- Check if questions array exists and has items -->
                <div v-for="(question, questionIndex) in currentEvaluation.questions" :key="questionIndex" class="mb-3 border-bottom pb-3"> <!-- Modified class for individual question -->
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6>{{ question.question_type === 'RATING' ? 'Rating Question' : question.question_type === 'OPTIONS' ? 'Option Question' : question.question_type === 'TEXT_INPUT' ? 'Text Input Question' : 'Text Question' }} #{{ questionIndex + 1 }}</h6>
                    <button type="button" class="btn btn-danger btn-sm" @click="removeQuestion(questionIndex)" :disabled="modalType === 'view'">Remove Question</button>
                  </div>
                  <input type="text" class="form-control mb-2" placeholder="Enter question text" v-model="question.text" :disabled="modalType === 'view'">

                  <!-- Option input section for OPTIONS type questions -->
                  <div v-if="question.question_type === 'OPTIONS'" class="option-container ms-3 mt-2">
                     <label class="option-label mb-1">Options:</label>
                     <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="mb-2 d-flex align-items-center">
                       <input type="text" class="form-control me-2" placeholder="Enter option text" v-model="option.option_text" :disabled="modalType === 'view'">
                       <button type="button" class="btn btn-outline-danger btn-sm" @click="removeOption(questionIndex, optionIndex)" :disabled="modalType === 'view' || (question.options?.length <= 1)">X</button>
                     </div>
                     <button type="button" class="btn btn-success btn-sm" @click="addOption(questionIndex)" :disabled="modalType === 'view'">Add Option</button>
                  </div>
                </div>
                <!-- Add Question Buttons (shown when there are questions) -->
                <div class="mt-3">
                  <button type="button" class="btn btn-primary me-2 mb-2" @click="addQuestion('grade')" :disabled="modalType === 'view'">Add Rating Question</button>
                  <button type="button" class="btn btn-primary me-2 mb-2" @click="addQuestion('option')" :disabled="modalType === 'view'">Add Option Question</button>
                  <button type="button" class="btn btn-primary mb-2" @click="addQuestion('text_input')" :disabled="modalType === 'view'">Add Question</button> 
                </div>
              </div>
               <!-- Fallback if currentEvaluation.questions is null/undefined or empty -->
              <div v-else class="text-muted mb-3">
                No questions added yet. Click buttons below to add.
                 <div class="mt-3">
                  <button type="button" class="btn btn-primary me-2 mb-2" @click="addQuestion('grade')" :disabled="modalType === 'view'">Add Rating Question</button>
                  <button type="button" class="btn btn-primary me-2 mb-2" @click="addQuestion('option')" :disabled="modalType === 'view'">Add Option Question</button>
                  <button type="button" class="btn btn-primary mb-2" @click="addQuestion('text_input')" :disabled="modalType === 'view'">Add Question</button> 
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showModal = false">Close</button> <!-- Matches grey "Close" button -->
          <button v-if="modalType === 'create'" type="button" class="btn btn-success" @click="handleAddEvaluation">Create</button> <!-- Matches green "Create" button -->
          <button v-if="modalType === 'edit'" type="button" class="btn btn-success" @click="handleSaveEditedEvaluation">Save Changes</button> <!-- Changed to green for consistency, or could be btn-primary -->
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showModal"></div>

  <!-- 发布Evaluation模态框 -->
  <div class="modal fade" id="publishEvaluation" :class="{ show: showPublishModal }" style="display: block" v-if="showPublishModal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Publish Evaluation: {{ currentEvaluation.name }}</h5>
          <button type="button" class="btn-close" @click="showPublishModal = false" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>Select the departments you want to publish this evaluation form to:</p>
          <!-- Department Selection for Publish Modal - Using Checkboxes in a styled container -->
          <div class="form-group mb-4">
             <!-- Removed label -->
            <div v-if="allDepartments && allDepartments.length > 0" class="border p-3 rounded" style="max-height: 150px; overflow-y: auto;">
              <div v-for="dept in allDepartments" :key="'publish-' + dept.id" class="form-check mb-2">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :value="dept.id"
                  :id="'publish-dept-' + dept.id"
                  v-model="selectedDepartmentsForPublish"
                >
                <label class="form-check-label" :for="'publish-dept-' + dept.id">
                  {{ dept.department_name }}
                </label>
              </div>
            </div>
            <div v-else class="text-muted mt-2">
              No departments available to assign.
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showPublishModal = false">Close</button>
          <button type="button" class="btn btn-primary" @click="handlePublishEvaluation">Publish</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showPublishModal"></div>

  <!-- 删除确认模态框 -->
  <div class="modal fade" id="deleteConfirmModal" :class="{ show: showDeleteConfirmModal }" style="display: block" v-if="showDeleteConfirmModal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Confirm Deletion</h5>
          <button type="button" class="btn-close" @click="showDeleteConfirmModal = false" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          Are you sure you want to delete the evaluation form "{{ evaluationToDelete?.name }}"? This action cannot be undone.
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showDeleteConfirmModal = false">Cancel</button>
          <button type="button" class="btn btn-danger" @click="confirmDeleteEvaluation">Delete</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showDeleteConfirmModal"></div>

  <!-- Detailed Results Modal -->
  <div class="modal fade" id="viewDetailsModal" :class="{ show: showDetailsModal }" style="display: block" v-if="showDetailsModal">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Detailed Results for: {{ selectedInstanceForDetails?.employee?.username || 'N/A' }}</h5>
          <button type="button" class="btn-close" @click="closeDetailsModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <!-- Loading State -->
          <div v-if="detailsLoading" class="text-center my-3">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading details...</span>
            </div>
            <p class="mt-2">Loading details...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="detailsError" class="alert alert-danger" role="alert">
            Error loading details: {{ detailsError }}
          </div>

          <!-- Details Content -->
          <div v-else-if="detailedAnswersData.length > 0">
            <div v-for="(answer, index) in detailedAnswersData" :key="answer.id || index" class="mb-4 pb-3 border-bottom">
              <p class="mb-1"><strong>Question {{ index + 1 }}:</strong> {{ answer.question?.text || 'Question text missing' }}</p>
              <div class="ps-3">
                <p class="mb-0"><strong>Answer:</strong></p>
                <!-- Display answer based on question type -->
                <template v-if="answer.question?.question_type === 'RATING'">
                  <span class="badge bg-info">{{ answer.rating ?? 'N/A' }} / 5</span>
                </template>
                <template v-else-if="answer.question?.question_type === 'OPTIONS'">
                  <span>{{ answer.selected_option?.option_text ?? 'N/A' }}</span>
                </template>
                <template v-else-if="answer.question?.question_type === 'TEXT' || answer.question?.question_type === 'TEXT_INPUT'">
                  <p class="text-muted fst-italic">{{ answer.text_answer || '(No answer provided)' }}</p>
                </template>
                <template v-else>
                  <span class="text-danger">Unknown question type or answer format.</span>
                </template>
              </div>
            </div>
          </div>

          <!-- No Answers State -->
          <div v-else class="alert alert-info" role="alert">
            No detailed answers found for this submission.
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeDetailsModal">Close</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showDetailsModal"></div>
  <!-- End Detailed Results Modal -->

</template>

<style scoped>
/* Styles from NotificationCenter/index.vue */

/* Main Content Padding */
.main-content {
  padding: 1.5rem;
}

/* Search Container */
.announcement-toolbar {
  display: flex;
  align-items: center; /* Align items vertically in the center */
  gap: 1rem;
}

.search-container {
  display: flex;
  align-items: center;
  border: 1px solid #ced4da; /* Adjusted border color */
  border-radius: 0.25rem; /* Adjusted border radius */
  padding: 0.375rem 0.75rem; /* Adjusted padding */
  min-width: 250px;
  height: 38px; /* Adjusted height to match typical form control */
  flex-grow: 1;
  background-color: #fff; /* Added background color */
}

.search-icon {
  font-size: 1rem; /* Adjusted font size */
  color: #6c757d; /* Adjusted color */
  margin-right: 0.5rem; /* Adjusted margin */
  flex-shrink: 0;
}

.search-input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 1rem; /* Adjusted font size */
  padding: 0; /* Remove default input padding */
}

/* Make button height match search bar */
.new-announcement-btn,
.bulk-delete-btn {
  height: 38px; /* Match height */
  padding: 0.375rem 0.75rem; /* Adjusted padding */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem; /* Adjusted font size */
  border-radius: 0.25rem; /* Adjusted border radius */
  white-space: nowrap;
  font-weight: 400; /* Adjusted font weight */
}

.new-announcement-btn {
  background-color: #198754; /* Bootstrap success color */
  color: white;
  border: 1px solid #198754; /* Add border */
}

.new-announcement-btn:hover {
  background-color: #157347; /* Darker shade on hover */
  border-color: #146c43;
}

.bulk-delete-btn {
  background-color: #d66b6b;
  color: white;
}

.bulk-delete-btn:disabled {
  background-color: #ccc;
  color: white;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .new-announcement-btn {
    max-width: 100%;
  }

  .me-md-4 {
    margin-right: 0 !important;
  }
}

/* Table Card (using similar styling to announcement-card) */
.table-card {
  border: 1px solid #ddd;
  padding: 1rem; /* Adjusted padding */
  margin-bottom: 1rem;
  border-radius: 4px; /* Adjusted border-radius */
  transition: box-shadow 0.3s ease;
  background-color: #fff; /* Added background color */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Added box-shadow */
}

.table-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* Adjusted box-shadow on hover */
}

/* Table Styling */
.table {
  width: 100%;
  margin-bottom: 0; /* Removed default margin */
  border-collapse: collapse; /* Ensure borders collapse */
}

.table th, .table td {
  padding: 1rem;
  vertical-align: middle;
  border-bottom: 1px solid #dee2e6;
}
.table th {
    font-weight: 600;
    background-color: #f8f9fa;
    text-align: left; /* Align headers to left */
}

/* Alternating row colors */
.table tbody tr:nth-child(odd) {
  background-color: #f2f2f2;
}

/* Hover effect on rows */
.table tbody tr:hover {
  background-color: #e9e9e9;
}

.btn-action {
  padding: 0.25rem 0.75rem;
  margin-left: 0.5rem;
  font-size: 0.875rem;
}
.btn-action:first-child {
    margin-left: 0;
}

/* Pagination Styling */
.pagination {
  display: flex;
  padding-left: 0;
  list-style: none;
  border-radius: 0.25rem;
  margin-top: 0; /* Removed default margin */
  margin-bottom: 0;
}

.page-item {
  margin: 0 0.15rem;
}

.page-item .page-link {
  position: relative;
  display: block;
  padding: 0.5rem 0.75rem;
  color: #0d6efd;
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  text-decoration: none;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
}

.page-item.active .page-link {
  z-index: 1;
  color: #fff;
  background-color: #0d6efd;
  border-color: #0d6efd;
}

/* Modal Responsive Styles */
@media (max-width: 576px) {
  .modal-dialog {
    margin: 0;
    max-width: none;
    height: 100vh;
  }

  .modal-content {
    border-radius: 0;
    min-height: 100vh;
  }
}

/* Border utilities */
@media (min-width: 768px) {
  .border-end-md {
    border-right: 1px solid #dee2e6;
  }
}

/* Form Styling */
.form-control {
  border-radius: 4px;
  border: 1px solid #ced4da;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  box-shadow: none;
  border-color: #80bdff;
}

.form-check-input {
  cursor: pointer;
}

.form-check-label {
  cursor: pointer;
  user-select: none;
}

/* Ensure modals are scrollable on mobile */
.modal-body {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

/* Attachment Preview */
.attachment-preview {
  width: 100%;
  height: 400px;
  border: none;
  border-radius: 4px;
  background-color: #f8f9fa;
}

@media (max-width: 768px) {
  .attachment-preview {
    height: 300px;
  }
}

/* Modal Animation */
.modal.fade .modal-dialog {
  transition: transform 0.3s ease-out;
}

.modal.fade.show .modal-dialog {
  transform: none;
}

/* Additional Responsive Utilities */
@media (max-width: 576px) {
  .container-fluid {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    padding: 1rem;
  }

  .form-control {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}

/* Specific styles for SurveyManagement */

/* Filter Container (overrides some announcement-toolbar styles) */
.filter-container.announcement-toolbar {
  margin-bottom: 1.5rem;
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  align-items: center;
  justify-content: flex-start;
}

/* Question Item Styling */
.question-item {
  border: 1px solid #dee2e6;
  background-color: #fff;
}

.filter-container.announcement-toolbar .d-flex.gap-2 {
  margin-left: auto;
}

/* Search Container within Filter Container */
.filter-container .search-container {
  min-width: auto;
  max-width: 300px;
}

/* Status Filter Specific Styles */
.status-filter-container {
  min-width: 150px;
}

.status-filter-select {
  height: 38px;
  border-radius: 0.25rem;
  border: 1px solid #ced4da;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  background-color: #fff;
}

/* Pagination alignment */
.d-flex.align-items-center.gap-3.my-3 {
  justify-content: flex-start;
}

.d-flex.align-items-center.gap-3.my-3 .text-muted.fs-5 {
  margin-right: 1rem;
}

/* Remove "Items per page" span */
.d-flex.align-items-center.mt-3.justify-content-start span.ms-3 {
  display: none;
}

/* Original SurveyManagement styles (keep if still needed) */
/* .btn-control { */
  /* margin: 10px; */ /* Replaced with Bootstrap margin classes */
/* } */

.option-container {
  padding-left: 1.5rem;
  border-left: 2px solid #eee;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
}

.option-label {
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
}

/* Specific styles for SurveyManagement */

/* General modal content styling to match KPIManagement */
.modal-content {
  border-radius: 8px; /* Apply general border-radius */
  /* background: white; Ensure background is white if not default */
}

/* Ensure KPIManagement's small screen modal style is preserved or adapted if necessary */
/* The existing @media (max-width: 576px) for .modal-content might need adjustment
   if 8px radius is desired on all screen sizes. For now, assuming existing responsive behavior is fine.
   If .modal-content already has border-radius: 0 for small screens, this new rule will be overridden by that more specific one.
*/

/* Removed .questions-section-container styles as the container is removed */

/* Delete modal style (from previous task, ensure it's included) */
#deleteRole .modal-header, #deleteRole .modal-footer {
  border: none;
}
</style>
