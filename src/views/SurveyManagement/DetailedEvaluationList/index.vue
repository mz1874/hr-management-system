<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  getEvaluationInstances, // Use getEvaluationInstances
  getEvaluationInstanceById, // Use getEvaluationInstanceById
  submitEvaluationAnswers
} from '@/api/survey'
import type {
    EvaluationInstance, // Use EvaluationInstance
    EvaluationAnswerSubmit,
    EvaluationSubmissionPayload,
    EvaluationQuestion, // Keep EvaluationQuestion for nested details
    RowyQuestionOption // Keep RowyQuestionOption for nested details
} from '@/api/survey'

// Interface for the evaluation instance list items (Represents an EvaluationInstance)
interface EvaluationInstanceItem extends EvaluationInstance {}


// --- State ---
const availableInstances = ref<EvaluationInstanceItem[]>([]) // List of evaluation instances
const totalInstances = ref(0) // For pagination
const isLoadingInstances = ref(false)
const isLoadingDetails = ref(false)

const showInstanceModal = ref(false) // Use InstanceModal
// Holds the full details of the EvaluationInstance being viewed/taken
const currentInstance = ref<EvaluationInstance | null>(null)
// Holds answers keyed by questionId, matching EvaluationAnswerSubmit structure
const currentAnswers = ref<Record<number, Partial<EvaluationAnswerSubmit>>>({}) // Use Partial for easier initialization

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(20) // Use default page size from backend settings (20)

// --- Computed Properties ---
const totalPages = computed(() => Math.ceil(totalInstances.value / itemsPerPage.value))

// --- Methods ---

// Fetch evaluation instances
const fetchAvailableInstances = async () => {
  isLoadingInstances.value = true;
  try {
    // Use getEvaluationInstances API call
    // Backend handles filtering based on user role (Staff, HR, Admin, Department Manager)
    const response = await getEvaluationInstances(currentPage.value);

    // Add checks for response.data and nested data structure
    if (response.data && response.data.data && Array.isArray(response.data.data.results)) {
        // Map the results to EvaluationInstanceItem structure
        // Corrected: Access results and count from response.data.data
        availableInstances.value = response.data.data.results.map((instance: EvaluationInstance) => ({
            id: instance.id,
            form: instance.form,
            employee: instance.employee,
            assigned_at: instance.assigned_at,
            submitted_at: instance.submitted_at,
            status: instance.status,
            overall_rating_avg: instance.overall_rating_avg,
            answers: instance.answers // Include existing answers for submitted/reviewed instances
        }));
        totalInstances.value = response.data.data.count; // Total count from backend
        console.log("Fetched instances:", availableInstances.value);
    } else {
        console.error("Failed to fetch evaluation instances: Unexpected response format", response);
        availableInstances.value = [];
        totalInstances.value = 0;
        // TODO: Show a user-friendly error message
    }
  } catch (error) {
    console.error("Failed to fetch available instances:", error);
    availableInstances.value = [];
    totalInstances.value = 0;
    // TODO: Show error message to user
  } finally {
    isLoadingInstances.value = false;
  }
}

// Initialize the answer structure for the current instance
const initializeAnswers = () => {
  if (!currentInstance.value || !currentInstance.value.form) {
    currentAnswers.value = {};
    return;
  }
  const initialAnswers: Record<number, Partial<EvaluationAnswerSubmit>> = {};
  currentInstance.value.form.questions.forEach(question => {
    if (question.id === undefined) return; // Skip questions without ID

    // Find existing answer if instance is already submitted/reviewed
    const existingAnswer = currentInstance.value?.answers?.find(ans => ans.question.id === question.id);

    // Initialize based on EvaluationAnswerSubmit structure
    initialAnswers[question.id] = {
      question_id: question.id,
      rating: existingAnswer?.rating !== undefined ? existingAnswer.rating : undefined, // Use existing rating or undefined
      text_answer: existingAnswer?.text_answer !== undefined ? existingAnswer.text_answer : '', // Use existing text or empty string
      selected_option_id: existingAnswer?.selected_option?.id !== undefined ? existingAnswer.selected_option.id : undefined // Use existing selected option ID or undefined
    };
  });
  currentAnswers.value = initialAnswers;
};

// Open the modal to view/take an instance (fetch EvaluationInstance details)
const openInstanceModal = async (instanceItem: EvaluationInstanceItem) => {
  currentInstance.value = null; // Clear previous instance
  currentAnswers.value = {};
  isLoadingDetails.value = true;
  showInstanceModal.value = true;
  try {
    const response = await getEvaluationInstanceById(instanceItem.id);
    // Assuming response.data is the full EvaluationInstance object
    currentInstance.value = response.data;
    initializeAnswers(); // Setup the answer structure based on fetched instance
  } catch (error) {
    console.error(`Failed to fetch instance details for ID ${instanceItem.id}:`, error);
    // TODO: Show error to user in the modal or close it
    showInstanceModal.value = false; // Close modal on error fetching details
  } finally {
    isLoadingDetails.value = false;
  }
}

const closeInstanceModal = () => {
  showInstanceModal.value = false;
  currentInstance.value = null;
  currentAnswers.value = {};
}

// Submit the instance answers (using EvaluationSubmissionPayload)
const submitInstance = async () => {
  if (!currentInstance.value || currentInstance.value.status !== 'PENDING') {
      console.error("Submission Error: Instance is not available or not in PENDING status.");
      // TODO: Show user feedback
      return;
  }

  // Basic Validation (Optional: Add more specific validation per question type)
  // Filter out incomplete/empty answers if necessary
  const answersArray: EvaluationAnswerSubmit[] = Object.values(currentAnswers.value)
      .filter(ans => ans?.question_id !== undefined) // Ensure question_id exists
      .map(ans => { // Construct the final answer shape
          const finalAns: EvaluationAnswerSubmit = { question_id: ans!.question_id! };
          const question = currentInstance.value?.form.questions.find(q => q.id === ans!.question_id);

          if (question?.question_type === 'RATING') {
              finalAns.rating = ans?.rating !== undefined ? Number(ans.rating) : null; // Ensure rating is number or null
              // Validate rating is within 1-5 if provided
              if (finalAns.rating !== null && (finalAns.rating < 1 || finalAns.rating > 5)) {
                  throw new Error(`Invalid rating for question ID ${question.id}. Must be between 1 and 5.`);
              }
          } else if (question?.question_type === 'TEXT') {
              finalAns.text_answer = ans?.text_answer || null; // Ensure text is string or null
          } else if (question?.question_type === 'OPTIONS') {
              finalAns.selected_option_id = ans?.selected_option_id !== undefined ? ans.selected_option_id : null; // Ensure selected option ID is number or null
              // Optional: Validate selected_option_id exists in question.options
              if (finalAns.selected_option_id !== null && !question?.options?.some(opt => opt.id === finalAns.selected_option_id)) {
                   throw new Error(`Invalid selected option ID for question ID ${question.id}.`);
              }
          }
          return finalAns;
      })
      // Add further filtering if needed, e.g., remove answers where all answer fields are null/undefined
      .filter(ans => ans.rating !== null || ans.text_answer !== null || ans.selected_option_id !== null);

  // Optional: Check if all required questions have been answered
  const requiredQuestions = currentInstance.value.form.questions;
  const answeredQuestionIds = new Set(answersArray.map(ans => ans.question_id));
  const allRequiredAnswered = requiredQuestions.every(q => answeredQuestionIds.has(q.id!));

  if (!allRequiredAnswered) {
      console.error("Validation failed: Please answer all questions.");
      alert("Please answer all questions before submitting.");
      return;
  }


  const submissionPayload: EvaluationSubmissionPayload = {
    answers: answersArray,
  };

  try {
    await submitEvaluationAnswers(currentInstance.value.id, submissionPayload);
    alert("Evaluation submitted successfully!"); // Example success message
    closeInstanceModal();
    // Refresh the list to show updated status
    await fetchAvailableInstances();
  } catch (error: any) {
    console.error("Failed to submit evaluation:", error);
    // Display specific validation errors from backend if available
    const errorMessage = error.response?.data?.detail || error.message || "An error occurred during submission.";
    alert(`Failed to submit evaluation: ${errorMessage}`); // Example error message
  }
}

// Pagination Navigation
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

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchAvailableInstances(); // Fetch instances on mount
});

// Refetch data when page changes
watch(currentPage, fetchAvailableInstances);
</script>

<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Evaluation Instances</h2>
  </div>

  <!-- Table -->
  <div class="table-card">
    <table class="table">
      <thead>
      <tr>
        <th scope="col">ID</th>
        <th scope="col">Form Name</th>
        <th scope="col">Employee</th>
        <th scope="col">Assigned At</th>
        <th scope="col">Submitted At</th>
        <th scope="col">Status</th>
        <th scope="col">Overall Rating Avg</th>
        <th scope="col">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-if="isLoadingInstances">
          <td colspan="8" class="text-center">Loading evaluation instances...</td>
      </tr>
      <tr v-else-if="availableInstances.length === 0">
          <td colspan="8" class="text-center">No evaluation instances found.</td>
      </tr>
      <tr v-else v-for="instance in availableInstances" :key="instance.id">
        <td>{{ instance.id }}</td>
        <td>{{ instance.form?.name || 'N/A' }}</td>
        <td>{{ instance.employee?.username || 'N/A' }}</td>
        <td>{{ instance.assigned_at ? new Date(instance.assigned_at).toLocaleString() : 'N/A' }}</td>
        <td>{{ instance.submitted_at ? new Date(instance.submitted_at).toLocaleString() : 'N/A' }}</td>
        <td>{{ instance.status }}</td>
        <td>{{ instance.overall_rating_avg !== null ? instance.overall_rating_avg : 'N/A' }}</td>
        <td>
          <!-- Button text changes based on status -->
          <button type="button" class="btn btn-primary btn-action" @click="openInstanceModal(instance)">
              {{ instance.status === 'PENDING' ? 'Take Evaluation' : 'View Evaluation' }}
          </button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>

  <!-- Evaluation Instance Modal -->
  <div class="modal fade" :class="{ show: showInstanceModal }" style="display: block" v-if="showInstanceModal">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ currentInstance?.status === 'PENDING' ? 'Take Evaluation' : 'View Evaluation' }}: {{ currentInstance?.form?.name || 'Loading...' }}</h3>
          <button type="button" class="btn-close" @click="closeInstanceModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-if="isLoadingDetails" class="text-center">
            Loading instance details...
          </div>
          <div v-else-if="currentInstance && currentInstance.form && currentAnswers">
              <p><strong>Employee:</strong> {{ currentInstance.employee?.username || 'N/A' }}</p>
              <p><strong>Status:</strong> {{ currentInstance.status }}</p>
              <p v-if="currentInstance.status !== 'PENDING'"><strong>Submitted At:</strong> {{ currentInstance.submitted_at ? new Date(currentInstance.submitted_at).toLocaleString() : 'N/A' }}</p>
              <p v-if="currentInstance.overall_rating_avg !== null"><strong>Overall Rating Avg:</strong> {{ currentInstance.overall_rating_avg }}</p>

              <div class="mb-4 mt-4">
                <div class="mb-4 text-center">
                  <h3 class="form-label">Questions</h3>
                </div>
                <div v-for="(question, index) in currentInstance.form.questions" :key="question.id" class="mb-3 border p-3 rounded">
                  <div class="d-flex justify-content-between align-items-center">
                        <!-- Display based on backend question_type -->
                        <h6>{{ index + 1 }}. {{ question.question_type === 'RATING' ? 'Rating Question' : question.question_type === 'TEXT' ? 'Text Question' : 'Option Question' }}</h6>
                  </div>
                      <!-- Use backend 'text' field -->
                      <p class="form-control mb-2 bg-light">{{ question.text }}</p>

                  <!-- RATING question type -->
                  <div v-if="question.question_type === 'RATING' && question.id !== undefined" class="form-group">
                    <label class="form-label">Rating (1-5):</label>
                        <!-- Bind to currentAnswers[question.id].rating -->
                        <input type="number" class="form-control" v-model.number="currentAnswers[question.id].rating" min="1" max="5" :disabled="currentInstance.status !== 'PENDING'">
                  </div>

                  <!-- TEXT question type -->
                  <div v-if="question.question_type === 'TEXT' && question.id !== undefined" class="form-group">
                    <label class="form-label">Response:</label>
                        <!-- Bind to currentAnswers[question.id].text_answer -->
                        <textarea class="form-control auto-resize" v-model="currentAnswers[question.id].text_answer" :disabled="currentInstance.status !== 'PENDING'"></textarea>
                      </div>

                  <!-- OPTIONS question type -->
                  <div v-if="question.question_type === 'OPTIONS' && question.id !== undefined && question.options && question.options.length > 0" class="form-group">
                      <label class="form-label">Select Option:</label>
                      <div v-for="option in question.options" :key="option.id" class="form-check">
                          <!-- Bind to currentAnswers[question.id].selected_option_id -->
                          <input
                              class="form-check-input"
                              type="radio"
                              :name="'question_' + question.id"
                              :id="'option_' + option.id"
                              :value="option.id"
                              v-model="currentAnswers[question.id].selected_option_id"
                              :disabled="currentInstance.status !== 'PENDING'"
                          >
                          <label class="form-check-label" :for="'option_' + option.id">
                              {{ option.option_text }}
                          </label>
                      </div>
                  </div>
                    </div>
                     <div v-if="!currentInstance.form.questions || currentInstance.form.questions.length === 0" class="text-muted text-center">
                        This evaluation has no questions.
                     </div>
                  </div>
                </div>
              <div v-else class="text-center text-danger">
                    Failed to load instance details.
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeInstanceModal">Close</button>
              <!-- Show submit button only if status is PENDING -->
              <button v-if="currentInstance?.status === 'PENDING'" type="button" class="btn btn-primary" @click="submitInstance" :disabled="isLoadingDetails || !currentInstance">Submit</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show" v-if="showInstanceModal"></div>

      <div class="d-flex align-items-center mt-3 justify-content-start" v-if="totalInstances > 0">
        <span class="me-3">Total Instances: {{ totalInstances }}</span>
        <nav aria-label="Page navigation">
          <ul class="pagination">
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
        <span class="ms-3">Items per page: {{ itemsPerPage }}</span>
      </div>
    </template>

    <style scoped>

    /* Keep existing relevant styles, remove styles specific to old modals/elements if desired */
    /* Add styles for loading indicators or new elements if needed */

    /* Ensure existing styles for form-group, form-label, table, modal, pagination etc. are suitable */
    .form-group {
      margin-bottom: 1rem;
    }

    .form-label {
      font-weight: bold;
      display: block;
      margin-bottom: 0.5rem;
    }

    .modal {
      display: none;
    }

    .modal.show {
      display: block;
    }

    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1040;
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

    .modal-content {
      padding: 15px;
    }

    .form-control {
      border-color: #000000;
    }

    /* Style for option questions */
    .option-container {
        padding-left: 1rem;
    }

    .auto-resize {
      resize: none;
      overflow: hidden;
    }

    .pagination {
      display: flex;
      justify-content: center;
      margin-top: 15px;
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

    /* Added style for disabled pagination */
    .page-item.disabled .page-link {
        color: #6c757d;
        pointer-events: none;
        background-color: #fff;
        border-color: #dee2e6;
    }

    /* Ensure question text is readable */
    .bg-light {
        background-color: #f8f9fa !important;
        border: 1px solid #dee2e6;
        padding: 0.5rem 0.75rem;
        white-space: pre-wrap; /* Allow text wrapping */
        word-wrap: break-word; /* Break long words */
    }

    </style>
