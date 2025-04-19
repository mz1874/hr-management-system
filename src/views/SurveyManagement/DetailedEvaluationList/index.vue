<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
// Use type-only imports for interfaces
import { getAllSurveys, getSurveyById, saveEmployeeEvaluation } from '@/api/survey'
import type { Survey, Question, Answer, SurveySubmission } from '@/api/survey'

// Interface for the survey list items
interface SurveyListItem {
  id: number;
  name: string;
  publishTime: string | null;
  // status is implicitly 'published' based on fetch logic
}

// --- State --- 
const availableSurveys = ref<SurveyListItem[]>([])
const totalSurveys = ref(0)
const isLoadingSurveys = ref(false)
const isLoadingDetails = ref(false)

const showSurveyModal = ref(false)
const currentSurvey = ref<Survey | null>(null) // Holds the full details of the survey being taken
const currentAnswers = ref<Record<number, Answer>>({}) // Holds answers keyed by questionId

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(5) // Consider making this configurable or dynamic

// --- Computed Properties ---
const totalPages = computed(() => Math.ceil(totalSurveys.value / itemsPerPage.value))

// --- Methods --- 

// Fetch published surveys
const fetchAvailableSurveys = async () => {
  isLoadingSurveys.value = true;
  try {
    // We only want published surveys for users to take
    const response = await getAllSurveys(currentPage.value, { status: 'published' }); 
    // Assuming API returns { data: { results: [], count: number } }
    // Make sure the 'results' match SurveyListItem structure (id, name, publishTime)
    availableSurveys.value = response.data.data.results.map((s: any) => ({ // Map to ensure structure
        id: s.id,
        name: s.name,
        publishTime: s.publishTime
    })); 
    totalSurveys.value = response.data.data.count; 
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
  const initialAnswers: Record<number, Answer> = {};
  currentSurvey.value.questions.forEach(question => {
    initialAnswers[question.id] = {
      questionId: question.id,
      // Initialize based on type, e.g., score to null/undefined, remark to '', etc.
      score: undefined, 
      selectedOption: undefined,
      remark: ''
    };
  });
  currentAnswers.value = initialAnswers;
};

// Open the modal to take a survey
const openSurveyModal = async (surveyItem: SurveyListItem) => {
  currentSurvey.value = null; // Clear previous survey
  currentAnswers.value = {};
  isLoadingDetails.value = true;
  showSurveyModal.value = true;
  try {
    const response = await getSurveyById(surveyItem.id);
    // Assuming response.data.data is the full Survey object including questions
    currentSurvey.value = response.data.data; 
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

// Submit the survey answers
const submitSurvey = async () => {
  if (!currentSurvey.value) return;

  // Basic Validation (Optional: Add more specific validation per question type)
  const answersArray = Object.values(currentAnswers.value);
  // Example: Check if all required questions are answered

  const submissionPayload: SurveySubmission = {
    surveyId: currentSurvey.value.id,
    answers: answersArray,
  };

  try {
    await saveEmployeeEvaluation(submissionPayload);
    // TODO: Show success message to user
    closeSurveyModal();
    // Optional: Refresh the list if needed, though usually not necessary for taking surveys
    // await fetchAvailableSurveys(); 
  } catch (error) {
    console.error("Failed to submit survey:", error);
    // TODO: Show error message to user (e.g., within the modal)
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
                    <h6>{{ index + 1 }}. {{ question.type === 'grade' ? 'Grade Question' : question.type === 'option' ? 'Option Question' : 'Remark' }}</h6>
              </div>
                  <p class="form-control mb-2 bg-light">{{ question.question_text }}</p>

              <div v-if="question.type === 'grade'" class="form-group">
                <label class="form-label">Score (1-5):</label>
                    <input type="number" class="form-control" v-model.number="currentAnswers[question.id].score" min="1" max="5">
              </div>

                  <div v-if="question.type === 'option' && question.options && currentAnswers[question.id]" class="option-container ms-3">
                      <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="form-check mb-2">
                        <input type="radio"
                               class="form-check-input me-2"
                               :name="'option-' + question.id"
                               :value="option"
                              v-model="currentAnswers[question.id].selectedOption">
                        <label class="form-check-label w-100">{{ option }}</label>
                </div>
              </div>

              <div v-if="question.type === 'remark'" class="form-group">
                <label class="form-label">Remark:</label>
                    <textarea class="form-control auto-resize" v-model="currentAnswers[question.id].remark"></textarea>
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