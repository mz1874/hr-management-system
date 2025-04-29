<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import Swal from 'sweetalert2'; // Import SweetAlert
import {
  getAllEvaluationForms, // Use getAllEvaluationForms
  // TODO: Import getEvaluationInstanceById when implementing results view
  // getEvaluationInstanceById,
  startEvaluationInstance, // Import the new function
  submitEvaluationAnswers // Keep submitEvaluationAnswers
} from '@/api/survey';
import type {
    EvaluationForm, // Use EvaluationForm
    EvaluationAnswerSubmit,
    EvaluationSubmissionPayload,
    EvaluationQuestion, // Keep EvaluationQuestion for nested details
    RowyQuestionOption, // Keep RowyQuestionOption for nested details
    // TODO: Import EvaluationInstance, EvaluationAnswerView when implementing results view
    // EvaluationInstance,
    // EvaluationAnswerView
} from '@/api/survey'

// Interface to add user-specific status locally
interface DisplayEvaluationForm extends EvaluationForm {
  user_status: 'PUBLISHED' | 'SUBMITTED'; // Made non-optional to match computed property
}

// --- State ---
const availableForms = ref<DisplayEvaluationForm[]>([]) // Use DisplayEvaluationForm
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
const itemsPerPage = ref(10) // Keep for API call, but hide display

// Filter state
const searchName = ref(''); // Add state for search input
const evaluationStatusesForDropdown = ['PUBLISHED', 'SUBMITTED']; // Statuses for the dropdown
const selectedStatus = ref<string | null>('PUBLISHED'); // Default to PUBLISHED, allow null for 'All'

// Local submission tracking state
const submittedFormIds = ref(new Set<number>()); // Track submitted forms locally for this session

// Results Modal State
const showResultsModal = ref(false);
const currentSubmissionData = ref<DisplayEvaluationForm | null>(null); // Store form data for results modal
const isLoadingSubmissionDetails = ref(false); // Loading state for results modal
// const detailedSubmissionAnswers = ref<EvaluationAnswerView[]>([]); // State for actual answers (TODO)

// --- Computed Properties ---
const totalPages = computed(() => Math.ceil(totalForms.value / itemsPerPage.value))

// Computed property to add user_status based on local submission tracking
const displayForms = computed(() => {
  // When 'All Status' (null) is selected, the backend should return all relevant forms.
  // We don't need extra frontend filtering here based on form.status.
  // We just map the received list to add the user-specific status.
  return availableForms.value.map(form => ({
    ...form,
    // Determine user_status based on local tracking
    user_status: submittedFormIds.value.has(form.id) ? 'SUBMITTED' : 'PUBLISHED'
  }));
});


// --- Methods ---

// Helper function for date formatting (YYYY-MM-DD)
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'; // Changed from 'NOT PUBLISHED' to 'N/A' for consistency
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

// Fetch available published evaluation forms
const fetchAvailableForms = async () => {
  isLoadingForms.value = true;
  try {
    // Use getAllEvaluationForms API call
    // Pass page_size, status, and search parameters
    const params: { page_size: number; status?: string | null; search?: string } = {
        page_size: itemsPerPage.value,
        status: selectedStatus.value, // Pass selected status (can be null)
        search: searchName.value || undefined // Pass search term if not empty
    };
    // When 'All Status' is selected (null), don't send status param to backend.
    // Backend should return all accessible forms (likely PUBLISHED based on typical permissions).
    // We will filter locally in the computed property if 'All Status' is selected.
    if (params.status === null) {
        delete params.status;
    }
    const response = await getAllEvaluationForms(currentPage.value, params);

    // Add checks for response.data and nested data structure
    if (response.data && response.data.data && Array.isArray(response.data.data.results)) {
        // Map API results to add the default user_status
        availableForms.value = response.data.data.results.map((form: EvaluationForm) => ({
            ...form,
            user_status: 'PUBLISHED' // Add default status
        }));
        totalForms.value = response.data.data.count; // Total count from backend
        console.log("Fetched forms based on status:", selectedStatus.value, availableForms.value);
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

// --- Results Modal Logic (Placeholder) ---
// Accept EvaluationForm, as user_status isn't strictly needed inside yet
const openResultsModal = async (form: EvaluationForm) => {
  console.log("Opening results for form:", form);
  // Assign to currentSubmissionData (which expects DisplayEvaluationForm | null)
  // We know 'form' will have user_status added by the computed prop when rendered,
  // but for type safety, we can cast or handle potential missing property if needed later.
  // For now, direct assignment might work if TS allows structural compatibility,
  // or explicitly add the expected status if needed for internal logic.
  // Let's assume the computed property handles the display state.
  currentSubmissionData.value = form as DisplayEvaluationForm; // Cast for assignment safety
  showResultsModal.value = true;
  isLoadingSubmissionDetails.value = true;
  // detailedSubmissionAnswers.value = []; // Clear previous

  // TODO: Implement actual fetching of submission details when backend is ready
  // try {
  //   // Assuming we need the instance ID. This needs clarification on how to get it.
  //   // Maybe fetch instances for this form + current user?
  //   // const instanceId = ???;
  //   // const response = await getEvaluationInstanceById(instanceId);
  //   // if (response.data && Array.isArray(response.data.answers)) {
  //   //   detailedSubmissionAnswers.value = response.data.answers;
  //   // } else {
  //   //   console.error("Unexpected results format");
  //   //   // Show error in modal
  //   // }
  // } catch (error) {
  //   console.error("Failed to fetch submission details:", error);
  //   // Show error in modal
  // } finally {
  //   isLoadingSubmissionDetails.value = false;
  // }

  // Simulate loading delay for now
  await new Promise(resolve => setTimeout(resolve, 500));
  isLoadingSubmissionDetails.value = false;
};

const closeResultsModal = () => {
  showResultsModal.value = false;
  currentSubmissionData.value = null;
  // detailedSubmissionAnswers.value = [];
};


// Submit the evaluation answers
const submitEvaluation = async () => {
  if (!currentForm.value) {
      console.error("Submission Error: No form available.");
      // TODO: Show user feedback
      return;
  }

  // Remove placeholder alert and commented out return
  // alert("Submission functionality requires backend implementation to create an evaluation instance first.");
  // return;

  // --- Start Actual Submission Logic ---
  try {
    // 1. Start the evaluation instance to get its ID
    const startResponse = await startEvaluationInstance(currentForm.value.id);
    console.log("DEBUG: Received start_evaluation response:", startResponse); // Add frontend logging
    // Access instance_id from the nested data object based on standard response format
    const instanceId = startResponse.data.data.instance_id;

    if (!instanceId) {
        throw new Error("Failed to retrieve evaluation instance ID.");
    }

    // 2. Basic Validation (Optional: Add more specific validation per question type)
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
      Swal.fire('Validation Error', 'Please answer all questions before submitting.', 'warning'); // Use Swal
      return;
  }


  const submissionPayload: EvaluationSubmissionPayload = {
    answers: answersArray,
  };

    // 3. Submit the answers using the obtained instance ID
    await submitEvaluationAnswers(instanceId, submissionPayload);

    // 4. Show success message, add to local submitted list, close modal, refresh list
    Swal.fire('Success', 'Evaluation submitted successfully!', 'success');
    if (currentForm.value?.id !== undefined) {
        submittedFormIds.value.add(currentForm.value.id); // Track locally
    }
    closeFormModal();
    // No need to call fetchAvailableForms() here unless we want to immediately
    // reflect a backend status change (which isn't implemented yet).
    // The computed property `displayForms` will handle the UI update based on `submittedFormIds`.
    // await fetchAvailableForms();

  } catch (error: any) { // Single catch block for the entire process
    console.error("Failed to submit evaluation:", error);
    // Display specific validation errors from backend if available
    const errorMessage = error.response?.data?.detail || error.message || "An error occurred during submission.";
    Swal.fire('Error', `Failed to submit evaluation: ${errorMessage}`, 'error');
  }
  // --- End Actual Submission Logic ---
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

// Refetch data when status filter changes
watch(selectedStatus, () => {
  currentPage.value = 1; // Reset to first page on filter change
  fetchAvailableForms();
});

// Refetch data when search name changes
watch(searchName, () => {
  currentPage.value = 1; // Reset to first page on search change
  fetchAvailableForms();
});
</script>

<template>
  <div class="main-content container-fluid px-3 px-md-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="h3">Department Evaluations</h2> <!-- Reverted Title -->
    </div>

    <!-- Filter Row - Matching SurveyManagement layout -->
    <div class="filter-container announcement-toolbar d-flex flex-wrap align-items-center gap-3 mb-4">
        <!-- Search Input -->
        <div class="search-container flex-grow-1"> <!-- Re-added flex-grow-1 -->
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
         <!-- Removed label, relying on default option text -->
         <select id="statusFilter" v-model="selectedStatus" class="form-select status-filter-select">
           <option :value="null">All Status</option> <!-- Added All Status option -->
           <option v-for="status in evaluationStatusesForDropdown" :key="status" :value="status">
             {{ status }}
           </option>
         </select>
       </div>
       <!-- Add other filters here if needed -->
    </div>


    <!-- Table -->
    <div class="table-card">
      <table class="table">
        <thead>
      <tr>
        <th scope="col">ID</th>
        <th scope="col">Evaluation Name</th>
        <!-- Description column removed -->
        <th scope="col">Published Date</th>
          <th scope="col">Status</th>
          <th scope="col">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="isLoadingForms">
            <td colspan="5" class="text-center">Loading evaluation forms...</td>
        </tr>
        <tr v-else-if="displayForms.length === 0">
            <td colspan="5" class="text-center">No evaluation forms found matching the criteria.</td>
        </tr>
        <!-- Iterate over computed displayForms -->
        <tr v-else v-for="form in displayForms" :key="form.id">
          <td>{{ form.id }}</td>
          <td>{{ form.name || 'N/A' }}</td>
          <td>{{ formatDate(form.publish_time) }}</td>
          <!-- Display user_status as plain text -->
          <td>
            {{ form.user_status }}
          </td>
          <td>
            <!-- Conditional Button -->
            <button v-if="form.user_status === 'PUBLISHED'" type="button" class="btn btn-primary btn-action" @click="openFormModal(form)">
                Take Evaluation
            </button>
            <button v-else-if="form.user_status === 'SUBMITTED'" type="button" class="btn btn-info btn-action" @click="openResultsModal(form)">
                View Submission
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
              <!-- Removed Description from modal -->
              <p><strong>Status:</strong> {{ currentForm.status }}</p>
              <p><strong>Published Date:</strong> {{ formatDate(currentForm.publish_time) }}</p> <!-- Use formatDate -->

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
                    <label class="form-label">Rating (1-5 stars):</label>
                    <div class="star-rating">
                      <span
                        v-for="star in 5"
                        :key="star"
                        class="star"
                        :class="{ 'filled': currentAnswers[question.id].rating !== undefined && star <= currentAnswers[question.id].rating! }"
                        @click="currentAnswers[question.id].rating = star"
                      >
                        <i class="fas fa-star"></i>
                      </span>
                    </div>
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

      <!-- Results Modal (Placeholder) -->
      <div class="modal fade" :class="{ show: showResultsModal }" style="display: block" v-if="showResultsModal">
          <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">Submission Details: {{ currentSubmissionData?.name || '...' }}</h5>
                      <button type="button" class="btn-close" @click="closeResultsModal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                      <div v-if="isLoadingSubmissionDetails" class="text-center">
                          Loading submission details...
                      </div>
                      <div v-else>
                          <!-- TODO: Display actual fetched answers here -->
                          <p><strong>Status:</strong> {{ currentSubmissionData?.status }}</p>
                          <p><strong>Publish Time:</strong> {{ formatDate(currentSubmissionData?.publish_time) }}</p>
                          <hr/>
                          <h6 class="mb-3">Your Answers:</h6>
                          <div class="alert alert-info">
                              Result display is pending backend implementation.
                          </div>
                          <!-- Example structure for when answers are available -->
                          <!--
                          <div v-if="detailedSubmissionAnswers.length > 0">
                              <div v-for="(answer, index) in detailedSubmissionAnswers" :key="answer.id || index" class="mb-3 border-bottom pb-2">
                                  <p class="mb-1"><strong>Q{{ index + 1 }}:</strong> {{ answer.question?.text }}</p>
                                  <div class="ps-3">
                                      <template v-if="answer.question?.question_type === 'RATING'">Rating: {{ answer.rating ?? 'N/A' }}</template>
                                      <template v-else-if="answer.question?.question_type === 'OPTIONS'">Selected: {{ answer.selected_option?.option_text ?? 'N/A' }}</template>
                                      <template v-else-if="answer.question?.question_type === 'TEXT'">Response: {{ answer.text_answer || 'N/A' }}</template>
                                  </div>
                              </div>
                          </div>
                          <div v-else>
                              Could not load submission details or no answers were recorded.
                          </div>
                          -->
                      </div>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" @click="closeResultsModal">Close</button>
                  </div>
              </div>
          </div>
      </div>
      <div class="modal-backdrop fade show" v-if="showResultsModal"></div>
      <!-- End Results Modal -->


      <!-- Pagination - Matching SurveyManagement layout -->
      <div class="d-flex align-items-center gap-3 my-3" v-if="totalForms > 0">
        <div class="text-muted fs-5"> <!-- Re-added fs-5 -->
          Total: {{ totalForms }}
        </div>
        <nav aria-label="Page navigation"> <!-- Removed ms-3 -->
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
        <!-- Removed Items per page span -->
      </div>
  </div> <!-- Close main-content -->
</template>

<style scoped>
/* Import relevant styles from SurveyManagement if needed, or define here */

/* Search Container Styling - Ensure it matches SurveyManagement */
.search-container {
  display: flex;
  align-items: center;
  border: 1px solid #6c757d; /* Adjusted border color */
  border-radius: 0.25rem; /* Adjusted border radius */
  padding: 0.375rem 0.75rem; /* Adjusted padding */
  /* min-width: 250px; */ /* Removed min-width */
  height: 38px; /* Adjusted height to match typical form control */
  flex-grow: 1; /* Keep flex-grow */
  background-color: #fff; /* Added background color */
  max-width: 350px; /* Optional: Set a max-width if needed */
}

.search-icon {
  color: #6c757d;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.search-input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 1rem;
  padding: 0;
}


/* Filter Container - Ensure alignment and background */
.filter-container {
  padding: 1rem 1.5rem;
  /* background-color: #f8f9fa; */ /* Removed background */
  border-radius: 0.5rem;
  /* border: 1px solid #dee2e6; */ /* Removed border */
}

.status-filter-container {
  display: flex;
  align-items: center;
}

.status-filter-select {
  min-width: 150px; /* Adjust as needed */
  height: 38px;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  border-radius: 0.25rem;
  border: 1px solid #6c757d;
}

/* Pagination Styling (ensure consistency) */
.pagination {
  display: flex;
  padding-left: 0;
  list-style: none;
  border-radius: 0.25rem;
}

.page-item {
  margin: 0 0.15rem;
}

.page-item .page-link {
  position: relative;
  display: block;
  padding: 0.5rem 0.75rem;
  /* Use high-contrast colors from SurveyManagement if different */
  color: #0d6efd; /* Example blue */
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
  /* Use active color from SurveyManagement */
  background-color: #198754; /* Example green */
  border-color: #198754; /* Example green */
}


/* Keep existing relevant styles, remove styles specific to old modals/elements if desired */

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
      color: #0d6efd;
    }

    .page-item.active .page-link {
      color: #fff;
      background-color: #0d6efd;
      border-color: #0d6efd;
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

    /* Star Rating Styles */
    .star-rating {
      display: inline-block; /* Or flex */
      font-size: 1.5rem; /* Adjust size as needed */
      color: #ccc; /* Default star color */
    }

    .star {
      cursor: pointer;
      padding: 0 0.1em; /* Spacing between stars */
      transition: color 0.2s;
    }

    .star.filled {
      color: #ffc107; /* Filled star color (e.g., gold) */
    }

    .star:hover,
    .star:hover ~ .star { /* Make stars light up on hover */
      /* Optional: Add a hover effect if desired */
      /* color: #ffdd7a; */
    }


    </style>
