<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
// Use type-only imports for interfaces from the correct API file
import {
  getAllEvaluationForms, // Changed from getAllSurveys
  getEvaluationFormById, // Changed from getSurveyById
  submitEvaluationAnswers // Changed from saveEmployeeEvaluation
} from '@/api/survey'
import type {
    EvaluationForm, // Changed from Survey
    EvaluationQuestion, // Changed from Question
    EvaluationAnswerSubmit, // Changed from Answer
    EvaluationSubmissionPayload // Changed from SurveySubmission
} from '@/api/survey'

// Interface for the survey list items (Represents a published EvaluationForm summary)
interface SurveyListItem {
  id: number;
  name: string;
  publishTime: string | null; // Corresponds to publish_time
  // status is implicitly 'PUBLISHED' based on fetch logic
}

// --- State --- 
const availableSurveys = ref<SurveyListItem[]>([]) // List of published forms
const totalSurveys = ref(0)
const isLoadingSurveys = ref(false)
const isLoadingDetails = ref(false)

const showSurveyModal = ref(false)
// Holds the full details of the EvaluationForm being taken
const currentSurvey = ref<EvaluationForm | null>(null)
// Holds answers keyed by questionId, matching EvaluationAnswerSubmit structure
const currentAnswers = ref<Record<number, Partial<EvaluationAnswerSubmit>>>({}) // Use Partial for easier initialization

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(5) // Consider making this configurable or dynamic

// --- Computed Properties ---
const totalPages = computed(() => Math.ceil(totalSurveys.value / itemsPerPage.value))

// --- Methods --- 

// Fetch published surveys (now EvaluationForms)
const fetchAvailableSurveys = async () => {
  isLoadingSurveys.value = true;
  try {
    // We only want published surveys (forms) for users to take
    const response = await getAllEvaluationForms(currentPage.value, { status: 'PUBLISHED' }); 
    // API returns PaginatedResponse<EvaluationForm>
    // Map the results to SurveyListItem structure
    // @ts-ignore
    availableSurveys.value = response.data.data.results.map((form: EvaluationForm) => ({
        id: form.id,
        name: form.name,
        publishTime: form.publish_time // Map from publish_time
    })); 
    totalSurveys.value = response.data.count; 
  } catch (error) {
    console.error("Failed to fetch available surveys:", error);
    availableSurveys.value = [];
    totalSurveys.value = 0;
    // TODO: Show error message to user
  } finally {
    isLoadingSurveys.value = false;
  }
}

// Initialize the answer structure for the current survey
const initializeAnswers = () => {
  if (!currentSurvey.value) {
    currentAnswers.value = {};
    return;
  }
  const initialAnswers: Record<number, Partial<EvaluationAnswerSubmit>> = {};
  currentSurvey.value.questions.forEach(question => {
    if (question.id === undefined) return; // Skip questions without ID
    // Initialize based on EvaluationAnswerSubmit structure
    initialAnswers[question.id] = {
      question_id: question.id,
      rating: undefined, // Initialize rating
      text_answer: '' // Initialize text_answer
    };
  });
  currentAnswers.value = initialAnswers;
};

// Open the modal to take a survey (fetch EvaluationForm details)
const openSurveyModal = async (surveyItem: SurveyListItem) => {
  currentSurvey.value = null; // Clear previous survey
  currentAnswers.value = {};
  isLoadingDetails.value = true;
  showSurveyModal.value = true;
  try {
    const response = await getEvaluationFormById(surveyItem.id);
    // Assuming response.data is the full EvaluationForm object
    currentSurvey.value = response.data; 
    initializeAnswers(); // Setup the answer structure
  } catch (error) {
    console.error(`Failed to fetch survey details for ID ${surveyItem.id}:`, error);
    // TODO: Show error to user in the modal or close it
    showSurveyModal.value = false; // Close modal on error fetching details
  } finally {
    isLoadingDetails.value = false;
  }
}

const closeSurveyModal = () => {
  showSurveyModal.value = false;
  currentSurvey.value = null;
  currentAnswers.value = {};
}

// Submit the survey answers (using EvaluationSubmissionPayload)
const submitSurvey = async () => {
  if (!currentSurvey.value) return;

  // Basic Validation (Optional: Add more specific validation per question type)
  // Filter out incomplete/empty answers if necessary
  const answersArray: EvaluationAnswerSubmit[] = Object.values(currentAnswers.value)
      .filter(ans => ans?.question_id !== undefined) // Ensure question_id exists
      .map(ans => { // Construct the final answer shape
          const finalAns: EvaluationAnswerSubmit = { question_id: ans!.question_id! };
          const question = currentSurvey.value?.questions.find(q => q.id === ans!.question_id);
          if (question?.question_type === 'RATING') {
              finalAns.rating = ans?.rating ? Number(ans.rating) : null; // Ensure rating is number or null
          } else if (question?.question_type === 'TEXT') {
              finalAns.text_answer = ans?.text_answer || null; // Ensure text is string or null
          }
          return finalAns;
      })
      // Add further filtering if needed, e.g., remove answers where both rating and text are null/undefined
      .filter(ans => ans.rating !== null || ans.text_answer !== null);


  // !!! CRITICAL ISSUE: The API `submitEvaluationAnswers` requires an `instanceId`,
  //     but this component deals with `EvaluationForm`s directly.
  //     The current flow doesn't provide an `instanceId`.
  //     Either the backend needs an endpoint to submit answers against a `formId` (less common),
  //     or this component needs to work with `EvaluationInstance`s (e.g., fetch assigned instances,
  //     or create an instance before showing the modal).
  //     Commenting out the API call for now.

  // const submissionPayload: EvaluationSubmissionPayload = {
  //   answers: answersArray,
  // };

  // const instanceId = ???; // <<<<<<<< How to get the instance ID?

  // try {
  //   // await submitEvaluationAnswers(instanceId, submissionPayload);
  //   // TODO: Show success message to user
  //   // closeSurveyModal();
  // } catch (error) {
  //   console.error("Failed to submit survey:", error);
  //   // TODO: Show error message to user (e.g., within the modal)
  // }

  console.warn("Submission skipped: Missing instanceId. See comment in submitSurvey function.");
  console.log("Prepared answers:", answersArray);
  // TODO: Remove console logs once flow is fixed.
  // For demonstration, we'll just close the modal
  closeSurveyModal();

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
  fetchAvailableSurveys();
});

// Refetch data when page changes
watch(currentPage, fetchAvailableSurveys);
</script>

<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Available Surveys</h2>
  </div>

  <!-- Table -->
  <div class="table-card">
    <table class="table">
      <thead>
      <tr>
        <th scope="col">ID</th>
        <th scope="col">Name</th>
        <th scope="col">Publish Time</th>
        <th scope="col">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-if="isLoadingSurveys">
          <td colspan="4" class="text-center">Loading surveys...</td>
      </tr>
      <tr v-else-if="availableSurveys.length === 0">
          <td colspan="4" class="text-center">No surveys available to take.</td>
      </tr>
      <tr v-else v-for="survey in availableSurveys" :key="survey.id">
        <td>{{ survey.id }}</td>
        <td>{{ survey.name }}</td>
        <td>{{ survey.publishTime ? new Date(survey.publishTime).toLocaleString() : 'N/A' }}</td>
        <td>
          <button type="button" class="btn btn-success btn-action" @click="openSurveyModal(survey)">Take Survey</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>

  <!-- Survey Taking Modal -->
  <div class="modal fade" :class="{ show: showSurveyModal }" style="display: block" v-if="showSurveyModal">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Take Survey: {{ currentSurvey?.name || 'Loading...' }}</h3>
          <button type="button" class="btn-close" @click="closeSurveyModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-if="isLoadingDetails" class="text-center">
            Loading survey details...
          </div>
          <div v-else-if="currentSurvey && currentAnswers">
          <div class="mb-4">
            <div class="mb-4 text-center">
              <h3 class="form-label">Questions</h3>
            </div>
                <div v-for="(question, index) in currentSurvey.questions" :key="question.id" class="mb-3 border p-3 rounded">
              <div class="d-flex justify-content-between align-items-center">
                    <!-- Use backend question_type -->
                    <h6>{{ index + 1 }}. {{ question.question_type === 'RATING' ? 'Rating Question' : 'Text Question' }}</h6>
              </div>
                  <!-- Use backend 'text' field -->
                  <p class="form-control mb-2 bg-light">{{ question.text }}</p>

              <!-- RATING question type -->
              <div v-if="question.question_type === 'RATING' && question.id !== undefined" class="form-group">
                <label class="form-label">Rating (1-5):</label>
                    <!-- Bind to currentAnswers[question.id].rating -->
                    <input type="number" class="form-control" v-model.number="currentAnswers[question.id].rating" min="1" max="5">
              </div>

                  <!-- TEXT question type (replaces old 'option' and 'remark' logic) -->
                  <!-- No options are displayed as backend uses TEXT type -->
                  <!-- <div v-if="question.type === 'option' && question.options && currentAnswers[question.id]" class="option-container ms-3"> ... </div> -->

              <!-- TEXT question type -->
              <div v-if="question.question_type === 'TEXT' && question.id !== undefined" class="form-group">
                <label class="form-label">Response:</label>
                    <!-- Bind to currentAnswers[question.id].text_answer -->
                    <textarea class="form-control auto-resize" v-model="currentAnswers[question.id].text_answer"></textarea>
                  </div>
                </div>
                 <div v-if="!currentSurvey.questions || currentSurvey.questions.length === 0" class="text-muted text-center">
                    This survey has no questions.
                 </div>
              </div>
            </div>
          <div v-else class="text-center text-danger">
                Failed to load survey details.
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeSurveyModal">Close</button>
          <button type="button" class="btn btn-primary" @click="submitSurvey" :disabled="isLoadingDetails || !currentSurvey">Submit</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showSurveyModal"></div>

  <div class="d-flex align-items-center mt-3 justify-content-start" v-if="totalSurveys > 0">
    <span class="me-3">Total Surveys: {{ totalSurveys }}</span>
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