<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  getAllEvaluationForms, // Use getAllEvaluationForms
  submitEvaluationAnswers // Keep submitEvaluationAnswers
} from '@/api/survey'
import type {
    EvaluationForm, // Use EvaluationForm
    EvaluationAnswerSubmit,
    EvaluationSubmissionPayload,
    EvaluationQuestion, // Keep EvaluationQuestion for nested details
    RowyQuestionOption // Keep RowyQuestionOption for nested details
} from '@/api/survey'


// --- State ---
const availableForms = ref<EvaluationForm[]>([]) // List of published evaluation forms
const totalForms = ref(0) // For pagination
const isLoadingForms = ref(false)
const isLoadingDetails = ref(false)
const finishedCount = ref(0); // This might not be relevant for published forms, will revisit later

const showFormModal = ref(false) // Use FormModal
// Holds the full details of the EvaluationForm being viewed/taken
const currentForm = ref<EvaluationForm | null>(null)
// Holds answers keyed by questionId, matching EvaluationAnswerSubmit structure
const currentAnswers = ref<Record<number, Partial<EvaluationAnswerSubmit>>>({}) // Use Partial for easier initialization

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(20) // Use default page size from backend settings (20)

// --- Computed Properties ---
const totalPages = computed(() => Math.ceil(totalForms.value / itemsPerPage.value))

// --- Methods ---

// Fetch available published evaluation forms
const fetchAvailableForms = async () => {
  isLoadingForms.value = true;
  try {
    // Use getAllEvaluationForms API call
    // Assuming backend can filter by status or we filter on frontend
    const response = await getAllEvaluationForms(currentPage.value);

    // Add checks for response.data and nested data structure
    if (response.data && response.data.data && Array.isArray(response.data.data.results)) {
        // Filter for published forms on the frontend
        availableForms.value = response.data.data.results.filter((form: EvaluationForm) => form.status === 'PUBLISHED');
        // Note: totalForms will reflect the total count from the backend, not just published forms
        totalForms.value = response.data.data.count; // Total count from backend
        // finishedCount is not relevant for published forms list
        console.log("Fetched forms:", availableForms.value);
    } else {
        console.error("Failed to fetch evaluation forms: Unexpected response format", response);
        availableForms.value = [];
        totalForms.value = 0;
        // TODO: Show a user-friendly error message
    }
  } catch (error) {
    console.error("Failed to fetch available forms:", error);
    availableForms.value = [];
    totalForms.value = 0;
    // TODO: Show error message to user
  } finally {
    isLoadingForms.value = false;
  }
}

// Initialize the answer structure for the current form
const initializeAnswers = () => {
  if (!currentForm.value || !currentForm.value.questions) {
    currentAnswers.value = {};
    return;
  }
  const initialAnswers: Record<number, Partial<EvaluationAnswerSubmit>> = {};
  currentForm.value.questions.forEach(question => {
    if (question.id === undefined) return; // Skip questions without ID

    // Initialize based on EvaluationAnswerSubmit structure
    initialAnswers[question.id] = {
      question_id: question.id,
      rating: undefined, // Initialize rating as undefined
      text_answer: '', // Initialize text answer as empty string
      selected_option_id: undefined // Initialize selected option ID as undefined
    };
  });
  currentAnswers.value = initialAnswers;
};

// Open the modal to view/take a form
const openFormModal = async (formItem: EvaluationForm) => {
  currentForm.value = null; // Clear previous form
  currentAnswers.value = {};
  isLoadingDetails.value = true;
  showFormModal.value = true;
  try {
    // When taking a new evaluation from a published form, we don't fetch an instance by ID.
    // We just use the form data directly to display questions.
    currentForm.value = formItem;
    initializeAnswers(); // Setup the answer structure based on the form's questions
  } catch (error) {
    console.error(`Failed to load form details for ID ${formItem.id}:`, error);
    // TODO: Show error to user in the modal or close it
    showFormModal.value = false; // Close modal on error
  } finally {
    isLoadingDetails.value = false;
  }
}

const closeFormModal = () => {
  showFormModal.value = false;
  currentForm.value = null;
  currentAnswers.value = {};
}

// Submit the evaluation answers (This will likely require creating a new instance first)
const submitEvaluation = async () => {
  if (!currentForm.value) {
      console.error("Submission Error: No form available.");
      // TODO: Show user feedback
      return;
  }

  // TODO: Before submitting answers, a new EvaluationInstance needs to be created on the backend
  // based on the currentForm and the logged-in user. The backend should return the ID of the
  // newly created instance, which is then used in the submitEvaluationAnswers call.
  // This part requires a new API endpoint or modification of an existing one.
  alert("Submission functionality requires backend implementation to create an evaluation instance first.");
  return; // Prevent submission until backend is ready

  /*
  // Basic Validation (Optional: Add more specific validation per question type)
  const answersArray: EvaluationAnswerSubmit[] = Object.values(currentAnswers.value)
      .filter(ans => ans?.question_id !== undefined) // Ensure question_id exists
      .map(ans => { // Construct the final answer shape
          const finalAns: EvaluationAnswerSubmit = { question_id: ans!.question_id! };
          const question = currentForm.value?.questions.find(q => q.id === ans!.question_id);

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
  const requiredQuestions = currentForm.value.questions;
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
    // This call needs the ID of the newly created EvaluationInstance
    await submitEvaluationAnswers(instanceId, submissionPayload); // instanceId needs to come from backend after instance creation
    alert("Evaluation submitted successfully!"); // Example success message
    closeFormModal();
    // Refresh the list
    await fetchAvailableForms();
  } catch (error: any) {
    console.error("Failed to submit evaluation:", error);
    // Display specific validation errors from backend if available
    const errorMessage = error.response?.data?.detail || error.message || "An error occurred during submission.";
    alert(`Failed to submit evaluation: ${errorMessage}`); // Example error message
  }
  */
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
  fetchAvailableForms(); // Fetch forms on mount
});

// Refetch data when page changes
watch(currentPage, fetchAvailableForms);
</script>

<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Published Evaluation Forms</h2>
  </div>

  <!-- Table -->
  <div class="table-card">
    <table class="table">
      <thead>
      <tr>
        <th scope="col">ID</th>
        <th scope="col">Form Name</th>
        <th scope="col">Description</th>
        <th scope="col">Publish Time</th>
        <th scope="col">Status</th>
        <th scope="col">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-if="isLoadingForms">
          <td colspan="6" class="text-center">Loading evaluation forms...</td>
      </tr>
      <tr v-else-if="availableForms.length === 0">
          <td colspan="6" class="text-center">No published evaluation forms found.</td>
      </tr>
      <tr v-else v-for="form in availableForms" :key="form.id">
        <td>{{ form.id }}</td>
        <td>{{ form.name || 'N/A' }}</td>
        <td>{{ form.description || 'N/A' }}</td>
        <td>{{ form.publish_time ? new Date(form.publish_time).toLocaleString() : 'N/A' }}</td>
        <td>{{ form.status }}</td>
        <td>
          <!-- Button to take/view the form -->
          <button type="button" class="btn btn-primary btn-action" @click="openFormModal(form)">
              Take Evaluation
          </button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>

  <!-- Evaluation Form Modal -->
  <div class="modal fade" :class="{ show: showFormModal }" style="display: block" v-if="showFormModal">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Take Evaluation: {{ currentForm?.name || 'Loading...' }}</h3>
          <button type="button" class="btn-close" @click="closeFormModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-if="isLoadingDetails" class="text-center">
            Loading form details...
          </div>
          <div v-else-if="currentForm && currentForm.questions && currentAnswers">
              <p><strong>Description:</strong> {{ currentForm.description || 'N/A' }}</p>
              <p><strong>Status:</strong> {{ currentForm.status }}</p>
              <p><strong>Publish Time:</strong> {{ currentForm.publish_time ? new Date(currentForm.publish_time).toLocaleString() : 'N/A' }}</p>

              <div class="mb-4 mt-4">
                <div class="mb-4 text-center">
                  <h3 class="form-label">Questions</h3>
                </div>
                <div v-for="(question, index) in currentForm.questions" :key="question.id" class="mb-3 border p-3 rounded">
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
                        <input type="number" class="form-control" v-model.number="currentAnswers[question.id].rating" min="1" max="5">
                  </div>

                  <!-- TEXT question type -->
                  <div v-if="question.question_type === 'TEXT' && question.id !== undefined" class="form-group">
                    <label class="form-label">Response:</label>
                        <!-- Bind to currentAnswers[question.id].text_answer -->
                        <textarea class="form-control auto-resize" v-model="currentAnswers[question.id].text_answer"></textarea>
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
                          >
                          <label class="form-check-label" :for="'option_' + option.id">
                              {{ option.option_text }}
                          </label>
                      </div>
                  </div>
                    </div>
                     <div v-if="!currentForm.questions || currentForm.questions.length === 0" class="text-muted text-center">
                        This evaluation has no questions.
                     </div>
                  </div>
                </div>
              <div v-else class="text-center text-danger">
                    Failed to load form details.
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeFormModal">Close</button>
              <!-- Show submit button -->
              <button type="button" class="btn btn-primary" @click="submitEvaluation" :disabled="isLoadingDetails || !currentForm">Submit Evaluation</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show" v-if="showFormModal"></div>

      <div class="d-flex align-items-center mt-3 justify-content-start" v-if="totalForms > 0">
        <span class="me-3">Total Forms: {{ totalForms }}</span>
        <!-- finishedCount is not relevant here -->
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
