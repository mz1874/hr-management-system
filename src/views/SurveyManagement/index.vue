<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Swal from 'sweetalert2'; // Import SweetAlert2
import {
  getAllEvaluationForms,
  createEvaluationForm,
  deleteEvaluationForm,
  publishEvaluationForm,
  updateEvaluationForm
} from '@/api/survey'
import { selectAllDepartments } from '@/api/department'
import type { EvaluationForm, EvaluationQuestion, RowyQuestionOption } from '@/api/survey'

// Interface for the evaluation form list items (matches backend EvaluationForm structure)
interface EvaluationItem extends Omit<EvaluationForm, 'questions'> {
    questions: QuestionItem[]; // Use local QuestionItem interface for UI state
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
// Removed startDate and endDate as filtering is backend-handled

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(10) // Set items per page to 10


// --- Fetching Data ---
const fetchSurveys = async () => {
  try {
    // Pass backend-supported search parameters
    const params: { search?: string } = {}; // Changed parameter name to 'search'
    if (searchName.value) {
        params.search = searchName.value; // Changed parameter name to 'search'
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
});

// Refetch data when page or search term changes
watch([currentPage, searchName], () => {
  // Reset page to 1 when search term changes, but only if it's not already 1
  if (currentPage.value !== 1 && searchName.value !== '') {
    currentPage.value = 1;
  } else {
    fetchSurveys();
  }
});

// Removed handleSearch as fetching is now handled by the watcher
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
    // TODO: Show success message
  } catch (error) {
    console.error("Failed to publish survey:", error);
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
const addQuestion = (type: 'grade' | 'option') => {
  if (!currentEvaluation.value.questions) currentEvaluation.value.questions = []
  const backendType = type === 'grade' ? 'RATING' : 'OPTIONS'; // Map to backend type
  const newQuestion: QuestionItem = {
    question_type: backendType,
    text: '',
    // Initialize options array as empty for 'OPTIONS' type
    options: backendType === 'OPTIONS' ? [{ option_text: '', order: 0 }] : undefined, // Initialize with one empty option
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
    const payload: Omit<EvaluationForm, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'status' | 'publish_time' | 'department_details'> = {
        name: currentEvaluation.value.name,
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
    const payload: Partial<Omit<EvaluationForm, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'status' | 'publish_time' | 'department_details'>> & { departments?: number[] } = {
        name: currentEvaluation.value.name,
        description: currentEvaluation.value.description || '', // Include description
        questions: mappedQuestions,
    };

    // Conditionally add departments if the evaluation is PUBLISHED
    if (currentEvaluation.value.status === 'PUBLISHED') {
        payload.departments = currentEvaluation.value.departments || [];
    }

  try {
    await updateEvaluationForm(currentEvaluation.value.id, payload); // Use correct API function and payload
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
</script>

<template>
  <div class="main-content container-fluid px-3 px-md-4">
    <!-- Main Content Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="h3">Publish Evaluation</h2>
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
          <th scope="col">Created At</th>
          <th scope="col">Publish Time</th>
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
            <td>{{ item.status }}</td>
            <td>
              <!-- Allow editing regardless of status -->
              <button type="button" class="btn btn-warning btn-action" @click="openEditModal(item)">Edit</button>
              <!-- Only show Publish for DRAFT status -->
              <button v-if="item.status === 'DRAFT'" type="button" class="btn btn-primary btn-action" @click="openPublishModal(item)">Publish</button>
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
  <!-- 创建/编辑/查看Evaluation模态框 -->
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
          <!-- Evaluation名称 -->
          <div class="form-group mb-4">
            <label class="form-label">Evaluation Name:</label>
            <input type="text" class="form-control" placeholder="Enter evaluation name" v-model="currentEvaluation.name" :disabled="modalType === 'view'">
          </div>

          <!-- Department Selection (Edit Modal) - Only show for PUBLISHED status -->
          <div class="form-group mb-4" v-if="modalType === 'edit' && currentEvaluation.status === 'PUBLISHED'">
            <label class="form-label">Assigned to:</label> <!-- Changed label -->
            <div v-if="allDepartments && allDepartments.length > 0" class="border p-3 rounded" style="max-height: 150px; overflow-y: auto;">
              <div v-for="dept in allDepartments" :key="'edit-' + dept.id" class="form-check mb-2">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :value="dept.id"
                  :id="'edit-dept-' + dept.id"
                  v-model="currentEvaluation.departments"
                >
                <label class="form-check-label" :for="'edit-dept-' + dept.id">
                  {{ dept.department_name }}
                </label>
              </div>
            </div>
            <div v-else class="text-muted mt-2">
              No departments available to assign.
            </div>
          </div>

          <!-- 问题管理 -->
          <div class="questions-section-container mb-4" v-if="currentEvaluation.questions"> <!-- New container div -->
            <label class="form-label">Questions:</label>
            <div v-if="currentEvaluation.questions">
              <div v-for="(question, questionIndex) in currentEvaluation.questions" :key="questionIndex" class="mb-3 border p-3 rounded">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <!-- Display based on backend type -->
                  <h6>{{ question.question_type === 'RATING' ? 'Rating Question' : question.question_type === 'TEXT' ? 'Text Question' : 'Option Question' }} #{{ questionIndex + 1 }}</h6>
                  <button type="button" class="btn btn-danger btn-sm" @click="removeQuestion(questionIndex)" :disabled="modalType === 'view'">Remove Question</button>
                </div>
                <!-- Use 'text' field -->
                <input type="text" class="form-control mb-2" placeholder="Enter question text" v-model="question.text" :disabled="modalType === 'view'">

                <!-- Option input section for OPTIONS type questions -->
                <div v-if="question.question_type === 'OPTIONS'" class="option-container ms-3 mt-2">
                   <label class="option-label mb-1">Options:</label>
                   <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="mb-2 d-flex align-items-center">
                     <input type="text" class="form-control me-2" placeholder="Enter option text" v-model="option.option_text" :disabled="modalType === 'view'">
                     <!-- Prevent deleting the last option -->
                     <button type="button" class="btn btn-outline-danger btn-sm" @click="removeOption(questionIndex, optionIndex)" :disabled="modalType === 'view' || (question.options?.length <= 1)">X</button>
                   </div>
                   <button type="button" class="btn btn-success btn-sm" @click="addOption(questionIndex)" :disabled="modalType === 'view'">Add Option</button>
                </div>
              </div>
              <div v-if="!currentEvaluation.questions || currentEvaluation.questions?.length === 0" class="text-muted mb-3">
                No questions added yet.
              </div>
              <div class="mt-3">
                <button type="button" class="btn btn-primary btn-control me-2" @click="addQuestion('grade')" :disabled="modalType === 'view'">Add Grade Question</button>
                <button type="button" class="btn btn-primary btn-control" @click="addQuestion('option')" :disabled="modalType === 'view'">Add Option Question</button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showModal = false">Close</button>
          <button v-if="modalType === 'create'" type="button" class="btn btn-success" @click="handleAddEvaluation">Create</button>
          <button v-if="modalType === 'edit'" type="button" class="btn btn-primary" @click="handleSaveEditedEvaluation">Save Changes</button>
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
          <h3 class="modal-title">Publish Evaluation: {{ currentEvaluation.name }}</h3>
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
  background-color: #198754;
  border-color: #198754;
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
  margin-bottom: 1.5rem; /* Reduced padding */
  padding: 1rem 1.5rem; /* Adjusted padding */
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  /* Ensure search and button are on the left */
  justify-content: flex-start;
}

.filter-container.announcement-toolbar .d-flex.gap-2 {
  margin-left: auto; /* Push create button to the right */
}

/* Search Container within Filter Container */
.filter-container .search-container {
  min-width: auto; /* Allow search container to shrink */
  max-width: 300px; /* Keep max width */
}

/* Pagination alignment */
.d-flex.align-items-center.gap-3.my-3 {
  justify-content: flex-start; /* Align total and pagination to the left */
}

.d-flex.align-items-center.gap-3.my-3 .text-muted.fs-5 {
  margin-right: 1rem; /* Add some space between total and pagination */
}

/* Remove "Items per page" span */
.d-flex.align-items-center.mt-3.justify-content-start span.ms-3 {
  display: none;
}

/* Original SurveyManagement styles (keep if still needed) */
.btn-control {
  margin: 10px;
}

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

/* Questions Section Container */
.questions-section-container {
  background-color: #f8f9fa; /* Light grey background */
  padding: 1.5rem; /* Add padding */
  border: 1px solid #dee2e6; /* Add border */
  border-radius: 0.25rem; /* Add border radius */
}

/* Delete modal style (from previous task, ensure it's included) */
#deleteRole .modal-header, #deleteRole .modal-footer {
  border: none;
}
</style>
