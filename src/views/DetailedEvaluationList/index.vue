<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import Swal from 'sweetalert2'; // Import SweetAlert

import { searchStaff } from '@/api/staff'; // Use searchStaff API
import {
  getAllEvaluationForms,
  getEvaluationInstances, // Import getEvaluationInstances
  // TODO: Import getEvaluationInstanceById when implementing results view
  // getEvaluationInstanceById,
  startEvaluationInstance, // Import the new function
  submitEvaluationAnswers, // Keep submitEvaluationAnswers
  finalizeDepartmentEvaluation // Import the new function
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
} from '@/api/survey';
import type { Staff } from '@/interface/UserInterface'; // Import Staff type
import { getCurrentUser } from '@/api/login';

// Define star rating meanings
const starRatingMeanings: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Satisfactory',
  4: 'Good',
  5: 'Excellent'
};

// Interface for forms in the list (may not need user_instance_status anymore)
interface DisplayEvaluationForm extends EvaluationForm {
  // user_instance_status might be removed or repurposed later if backend changes
  user_instance_status: 'PUBLISHED' | 'SUBMITTED' | 'PENDING' | 'REVIEWED' | 'NOT_STARTED' | null;
}

// --- State ---

const availableForms = ref<DisplayEvaluationForm[]>([]) // Forms available to the manager
const totalForms = ref(0) // For pagination
const isLoadingForms = ref(false)
const isLoadingDetails = ref(false) // Keep for potential future use loading form questions if separated
const finishedCount = ref(0); // TODO: Revisit if this count is needed and how to calculate it

const showFormModal = ref(false)
// Holds the full details of the EvaluationForm selected
const currentForm = ref<EvaluationForm | null>(null)
// Holds answers keyed by questionId for the currently selected staff member
const currentAnswers = ref<Record<number, Partial<EvaluationAnswerSubmit>>>({})

// New state for staff selection
const departmentStaff = ref<Staff[]>([]);
const selectedStaffForEvaluation = ref<Staff | null>(null);
const isLoadingStaff = ref(false); // Loading state for staff list in modal
const staffCompletionStatus = ref<Map<number, string>>(new Map()); // Map staff ID to their evaluation status (e.g., 'SUBMITTED', 'PENDING')
const completedStaffCount = ref(0); // Count of completed evaluations for the current form
const isLoadingStatuses = ref(false); // Loading state for statuses

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(10) // Keep for API call, but hide display

// Filter state
const searchName = ref(''); // Add state for search input
const evaluationStatusesForDropdown = ['PUBLISHED', 'SUBMITTED']; // Statuses for the dropdown
const selectedStatus = ref<string | null>('PUBLISHED'); // Default to PUBLISHED, allow null for 'All' (Backend handles filtering)

// Results Modal State
const showResultsModal = ref(false);
const currentSubmissionData = ref<DisplayEvaluationForm | null>(null); // Store form data for results modal
const isLoadingSubmissionDetails = ref(false); // Loading state for results modal
// const detailedSubmissionAnswers = ref<EvaluationAnswerView[]>([]); // State for actual answers (TODO)

// --- Computed Properties ---
const totalPages = computed(() => Math.ceil(totalForms.value / itemsPerPage.value))

// Computed property returns the forms fetched from the backend
// We might filter out forms the manager can't act on later if needed
const displayForms = computed(() => {
  // Filter out DRAFT forms as they shouldn't be evaluated
  return availableForms.value.filter(form => form.status !== 'DRAFT');
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
        // Assign fetched forms (casting might still be needed depending on API definition)
        // Filter DRAFT status here as a safeguard
        availableForms.value = response.data.data.results
            .map((form: any) => form as DisplayEvaluationForm) // Keep cast for safety
            .filter((form: DisplayEvaluationForm) => form.status !== 'DRAFT');

        totalForms.value = response.data.data.count; // Use total count from backend for pagination
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

// Open the modal to select staff and then evaluate
const openFormModal = async (formItem: EvaluationForm) => {
  currentForm.value = formItem; // Set the selected form
  selectedStaffForEvaluation.value = null; // Reset selected staff
  departmentStaff.value = []; // Clear previous staff list
  staffCompletionStatus.value.clear(); // Clear previous statuses
  completedStaffCount.value = 0; // Reset count
  currentAnswers.value = {}; // Clear previous answers
  isLoadingStaff.value = true; // Start loading staff
  isLoadingStatuses.value = true; // Start loading statuses
  showFormModal.value = true; // Show the modal

  try {
    const departmentId = 1; // Get manager's department ID
    if (!departmentId) {
      throw new Error("Manager's department ID not found.");
    }
    // Fetch staff for the manager's department using searchStaff
    // Pass empty string for name, department ID, and page 1
    const response = await searchStaff('', departmentId, 1);
    if (response.data && response.data.data && Array.isArray(response.data.data.results)) {
      // Assuming searchStaff returns paginated results, store only results for now
      // TODO: Handle pagination if needed for staff list within modal
      departmentStaff.value = response.data.data.results; // Assign staff if fetch is successful

      // --- Fetch Evaluation Statuses for these staff (Moved outside the else block) ---
      if (departmentStaff.value.length > 0 && currentForm.value?.id !== undefined) {
        try {
          // Fetch instances for the current form, backend should filter by evaluator implicitly
          // Or add evaluator_id if backend requires it
          const statusResponse = await getEvaluationInstances(1, { formId: currentForm.value.id });
          console.log("Fetched evaluation instances for status check:", statusResponse.data);

          if (statusResponse.data && statusResponse.data.data && Array.isArray(statusResponse.data.data.results)) {
            const instances = statusResponse.data.data.results;
            const statusMap = new Map<number, string>();
            let completedCount = 0;

            // Create a map of staff ID -> status from the fetched instances
            instances.forEach(instance => {
              if (instance.employee?.id && instance.status) {
                // Consider SUBMITTED or REVIEWED as completed for this view
                if (instance.status === 'SUBMITTED' || instance.status === 'REVIEWED') {
                  statusMap.set(instance.employee.id, 'Completed');
                  completedCount++;
                } else {
                  statusMap.set(instance.employee.id, instance.status); // Store other statuses like PENDING
                }
              }
            });

            staffCompletionStatus.value = statusMap;
            completedStaffCount.value = completedCount;
            console.log("Staff completion status map:", staffCompletionStatus.value);
            console.log("Completed count:", completedStaffCount.value);
          } else {
            console.warn("No evaluation instances found or unexpected format for status check.");
          }
        } catch (statusError) {
          console.error("Failed to fetch evaluation statuses:", statusError);
          // Don't block the modal, just show staff without status info
          Swal.fire('Warning', 'Could not load evaluation completion statuses for staff.', 'warning');
        } finally {
          isLoadingStatuses.value = false; // Stop loading statuses
        }
      } else {
        isLoadingStatuses.value = false; // No staff or form ID, stop loading statuses
      }
      // --- End Fetch Evaluation Statuses ---

    } else { // This else block now only handles the error case for fetching staff
      throw new Error("Failed to fetch department staff or unexpected format.");
    }
  } catch (error) { // This catch handles errors from both fetching staff and fetching statuses
    console.error("Failed to fetch department staff or statuses:", error);
    Swal.fire('Error', 'Could not load staff list or their evaluation statuses.', 'error');
    // Optionally close the modal or show error within it
    // showFormModal.value = false;
  } finally {
    isLoadingStaff.value = false; // Stop loading staff
    // isLoadingStatuses is handled within its own try/catch/finally
  }
}

const closeFormModal = () => {
  showFormModal.value = false;
  currentForm.value = null;
  selectedStaffForEvaluation.value = null; // Reset staff selection on close
  departmentStaff.value = [];
  currentAnswers.value = {};
}

// New method to handle staff selection within the modal
const selectStaffForEvaluation = (staff: Staff) => {
  selectedStaffForEvaluation.value = staff;
  initializeAnswers(); // Initialize/reset answers for the selected staff and form
  console.log(`Evaluating staff: ${staff.username} with form: ${currentForm.value?.name}`);
}

// --- Results Modal Logic (Placeholder - likely needs rework for staff-specific results) ---
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


// Submit the evaluation answers for the selected staff member
const submitEvaluation = async () => {
  if (!currentForm.value || !selectedStaffForEvaluation.value) {
      console.error("Submission Error: No form or staff selected.");
      Swal.fire('Error', 'Please select a staff member and ensure a form is loaded.', 'error');
      return;
  }

  const staffId = selectedStaffForEvaluation.value.id;
  const formId = currentForm.value.id;

  // --- Start Actual Submission Logic ---
  try {
    // 1. Start the evaluation instance for the specific staff member
    //    *** Backend Modification Needed ***
    //    The startEvaluationInstance API needs to accept the employee_id
    //    For now, we might still call the old API if it creates an instance for the manager,
    //    but ideally, it should create one for the target employee.
    //    Let's assume for now the backend handles creating the correct instance based on a modified API call (passing staffId).
    //    The backend API now expects the employee_id to associate the instance correctly.

    // Call API, passing the ID of the staff member being evaluated
    const startResponse = await startEvaluationInstance(formId, staffId); 
    console.log("DEBUG: Received start_evaluation response:", startResponse);
    const instanceId = startResponse.data.data.instance_id; // Get instance ID (should be for the staff member)

    if (!instanceId) {
        throw new Error("Failed to retrieve evaluation instance ID for the selected staff.");
    }

    // 2. Validation
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
      // Removed filtering that was incorrectly removing answers for required questions with empty content
      // .filter(ans => ans.rating !== null || ans.text_answer !== null || ans.selected_option_id !== null);

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

  // --- Add More Specific Frontend Validation ---
  let contentValidationPassed = true;
  let validationErrorMessage = '';

  for (const answer of answersArray) {
      const question = currentForm.value?.questions.find(q => q.id === answer.question_id);
      if (!question) {
          // Should not happen if requiredQuestions check passed, but as a safeguard
          contentValidationPassed = false;
          validationErrorMessage = `Validation Error: Could not find question details for ID ${answer.question_id}.`;
          break;
      }

      if (question.question_type === 'RATING' && (answer.rating === null || answer.rating === undefined)) {
          contentValidationPassed = false;
          validationErrorMessage = `Validation Error: Rating is required for question ID ${question.id}.`;
          break;
      } else if (question.question_type in ['TEXT', 'TEXT_INPUT'] && (answer.text_answer === null || answer.text_answer.trim() === '')) {
           contentValidationPassed = false;
           validationErrorMessage = `Validation Error: Text answer is required for question ID ${question.id}.`;
           break;
      } else if (question.question_type === 'OPTIONS' && (answer.selected_option_id === null || answer.selected_option_id === undefined)) {
           // Optional: Add validation if an option must be selected
           // contentValidationPassed = false;
           // validationErrorMessage = `Validation Error: An option must be selected for question ID ${question.id}.`;
           // break;
      }
  }

  if (!contentValidationPassed) {
      console.error("Frontend content validation failed:", validationErrorMessage);
      Swal.fire('Validation Error', validationErrorMessage, 'warning');
      return; // Stop submission if frontend validation fails
  }
  // --- End More Specific Frontend Validation ---


    // 3. Submit the answers using the obtained instance ID
    await submitEvaluationAnswers(instanceId, submissionPayload);

    // 4. Update local state immediately
    const currentStaffId = selectedStaffForEvaluation.value.id;
    staffCompletionStatus.value.set(currentStaffId, 'Completed');
    completedStaffCount.value = Array.from(staffCompletionStatus.value.values()).filter(status => status === 'Completed').length;

    // 5. Show success message and return to staff list
    Swal.fire('Saved', `Evaluation saved successfully for ${selectedStaffForEvaluation.value.username}.`, 'success');
    // Return to staff list view within the modal
    selectedStaffForEvaluation.value = null; 
    // No need to clear answers here, they get re-initialized when selecting next staff
    // Modal is no longer closed automatically here

  } catch (error: any) { // Single catch block for the entire process
    console.error("Failed to submit evaluation:", error);
    let errorMessage = "An error occurred during submission.";

    if (error.response && error.response.data) {
      // Attempt to extract detailed error message from backend response
      if (error.response.data.detail) {
        errorMessage = `Validation Error: ${error.response.data.detail}`;
      } else if (typeof error.response.data === 'object') {
        // Handle cases where validation errors are in an object (e.g., field errors)
        errorMessage = "Validation Errors:<br>";
        for (const field in error.response.data) {
          if (Array.isArray(error.response.data[field])) {
            errorMessage += `<strong>${field}:</strong> ${error.response.data[field].join(', ')}<br>`;
          } else {
             errorMessage += `<strong>${field}:</strong> ${error.response.data[field]}<br>`;
          }
        }
      } else {
        // Fallback for other unexpected data formats
        errorMessage = `Backend Error: ${error.response.data}`;
      }
    } else {
      // Handle network errors or other non-response errors
      errorMessage = `Request Error: ${error.message}`;
    }

    Swal.fire('Error', `Failed to submit evaluation: ${errorMessage}`, 'error');
  }
  // --- End Actual Submission Logic ---
}

// Handle the final submission of all department evaluations for a form
const handleFinalSubmit = async () => {
  if (!currentForm.value || currentForm.value.id === undefined) {
    console.error("Final Submission Error: No form selected.");
    Swal.fire('Error', 'No evaluation form selected for final submission.', 'error');
    return;
  }

  // Double-check if all staff evaluations are completed locally
  if (completedStaffCount.value !== departmentStaff.value.length) {
      console.warn("Attempted final submit before all staff evaluations are completed.");
      Swal.fire('Warning', 'Please complete all staff evaluations before submitting the department evaluation.', 'warning');
      return;
  }

  isLoadingForms.value = true; // Use forms loading state for final submit process
  try {
    // Call the new backend API to finalize the department evaluation
    await finalizeDepartmentEvaluation(currentForm.value.id);

    Swal.fire('Success', 'Department evaluation finalized successfully.', 'success');

    // Close the modal and refresh the forms list
    closeFormModal();
    fetchAvailableForms(); // Refresh the list to show updated status if applicable

  } catch (error) {
    console.error("Failed to finalize department evaluation:", error);
    const errorMessage = (error as any).response?.data?.detail || (error as any).message || "An error occurred during finalization.";
    Swal.fire('Error', `Failed to finalize department evaluation: ${errorMessage}`, 'error');
  } finally {
    isLoadingForms.value = false; // Stop loading
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
        <th scope="col">Published Date</th>
        <th scope="col">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="isLoadingForms">
            <td colspan="4" class="text-center">Loading evaluation forms...</td> <!-- Corrected colspan -->
        </tr>
        <tr v-else-if="displayForms.length === 0">
            <td colspan="4" class="text-center">No evaluation forms found matching the criteria.</td> <!-- Adjusted colspan -->
        </tr>
        <!-- Iterate over computed displayForms -->
        <tr v-else v-for="form in displayForms" :key="form.id">
          <td>{{ form.id }}</td>
          <td>{{ form.name || 'N/A' }}</td>
          <td>{{ formatDate(form.publish_time) }}</td>
          <!-- Removed Status Column -->
          <td>
            <!-- Action Button - Always show "Evaluate Staff" -->
            <button type="button" class="btn btn-primary btn-action" @click="openFormModal(form)">
                Evaluate Staff
            </button>
            <!-- TODO: Add a way to view results later, maybe another button or link -->
            <!-- <button type="button" class="btn btn-info btn-action ms-2" @click="openResultsModal(form)">
                View Results
            </button> -->
        </td>
      </tr>
      </tbody>
    </table>
  </div>
  </div>

  <!-- Evaluation Form Modal -->
  <div class="modal fade" :class="{ show: showFormModal }" style="display: block" v-if="showFormModal">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <!-- Dynamically set title based on whether staff is selected -->
          <h3 class="modal-title">
            <span v-if="!selectedStaffForEvaluation">Select Staff for Evaluation: {{ currentForm?.name }}</span>
            <span v-else>Evaluating: {{ selectedStaffForEvaluation?.username }} - Form: {{ currentForm?.name }}</span>
          </h3>
          <button type="button" class="btn-close" @click="closeFormModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <!-- Show staff list if no staff is selected -->
          <div v-if="!selectedStaffForEvaluation">
            <h5>Select Staff Member from Your Department</h5>
             <!-- Loading Indicator for Staff and Statuses -->
             <div v-if="isLoadingStaff || isLoadingStatuses" class="text-center my-3">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading staff & statuses...</span>
              </div>
            </div>
             <!-- Staff List Display -->
             <div v-else-if="departmentStaff.length > 0">
               <!-- Completion Count -->
               <p class="text-muted mb-2">
                 Completed: {{ completedStaffCount }} / {{ departmentStaff.length }}
               </p>
               <div class="list-group">
                 <button
                   v-for="staff in departmentStaff"
                   :key="staff.id"
                   type="button"
                   class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                   @click="selectStaffForEvaluation(staff)"
                   :disabled="staffCompletionStatus.get(staff.id) === 'Completed'"
                 >
                   <span>
                     {{ staff.username }}
                     <!-- Add text indicator -->
                     <span v-if="staffCompletionStatus.get(staff.id) === 'Completed'"> (Completed)</span>
                     <!-- Status Badge -->
                     <span v-if="staffCompletionStatus.get(staff.id) === 'Completed'" class="badge bg-success ms-2">Completed</span>
                     <span v-else-if="staffCompletionStatus.get(staff.id) === 'PENDING'" class="badge bg-warning text-dark ms-2">Not Completed</span>
                     <!-- Add other statuses if needed, e.g., a default badge if status is unknown -->
                     <span v-else class="badge bg-secondary ms-2">Not Started</span> 
                   </span>
                   <!-- Show arrow only if not completed -->
                   <i v-if="staffCompletionStatus.get(staff.id) !== 'Completed'" class="fas fa-chevron-right"></i>
                 </button>
               </div>
             </div>
             <div v-else class="alert alert-warning">
              No staff members found in your department or failed to load staff list.
            </div>
          </div>

          <!-- Show evaluation questions if staff is selected -->
          <div v-else>
             <!-- Button to go back to staff selection -->
             <button type="button" class="btn btn-outline-secondary btn-sm mb-3" @click="selectedStaffForEvaluation = null">
               <i class="fas fa-arrow-left me-1"></i> Back to Staff List
             </button>

             <!-- Existing Question Display Logic -->
             <div v-if="currentForm && currentForm.questions && currentAnswers">
               <div class="mb-4 mt-2"> <!-- Adjusted margin -->
                 <div class="mb-4 text-center">
                   <h4 class="form-label">Evaluation Questions for {{ selectedStaffForEvaluation.username }}</h4>
                </div>
                <div v-for="(question, index) in currentForm.questions" :key="question.id" class="mb-3 border p-3 rounded">
                  <div class="d-flex justify-content-between align-items-center">
                        <!-- Display based on backend question_type -->
                        <h6>{{ index + 1 }}. {{ question.question_type === 'RATING' ? 'Rating Question' : question.question_type === 'TEXT' ? 'Text Question' : question.question_type === 'OPTIONS' ? 'Option Question' : 'Text Input Question' }}</h6>
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
                    <!-- Display meaning of selected rating -->
                    <p v-if="currentAnswers[question.id].rating" class="text-muted mt-1 mb-0 small">
                      Selected: {{ currentAnswers[question.id].rating }} Star(s) - {{ starRatingMeanings[currentAnswers[question.id].rating!] }}
                    </p>
                  </div>

                  <!-- TEXT question type -->
                  <div v-if="question.question_type === 'TEXT' && question.id !== undefined" class="form-group">
                    <label class="form-label">Response:</label>
                        <!-- Bind to currentAnswers[question.id].text_answer -->
                        <textarea class="form-control auto-resize" v-model="currentAnswers[question.id].text_answer"></textarea>
                      </div>
                  
                  <!-- TEXT_INPUT question type -->
                  <div v-if="question.question_type === 'TEXT_INPUT' && question.id !== undefined" class="form-group">
                    <label class="form-label">Response:</label>
                        <!-- Bind to currentAnswers[question.id].text_answer -->
                        <input type="text" class="form-control" v-model="currentAnswers[question.id].text_answer">
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
            <div class="modal-footer justify-content-between">
               <!-- Left side: Back to list / Cancel -->
               <div>
                 <button 
                   v-if="selectedStaffForEvaluation" 
                   type="button" 
                   class="btn btn-outline-secondary me-2" 
                   @click="selectedStaffForEvaluation = null"
                 >
                   <i class="fas fa-arrow-left me-1"></i> Back to Staff List
                 </button>
                 <button type="button" class="btn btn-secondary" @click="closeFormModal">Cancel</button>
               </div>
               <!-- Right side: Submit individual / Final Submit -->
               <div>
                 <button
                   v-if="selectedStaffForEvaluation"
                   type="button"
                   class="btn btn-primary"
                   @click="submitEvaluation"
                   :disabled="isLoadingStaff || isLoadingStatuses"
                 >
                   Save Evaluation for {{ selectedStaffForEvaluation?.username }}
                 </button>
                 <!-- New Final Submit Button -->
                 <button
                   v-if="!selectedStaffForEvaluation" 
                   type="button"
                   class="btn btn-success"
                   @click="handleFinalSubmit"
                   :disabled="completedStaffCount !== departmentStaff.length || departmentStaff.length === 0"
                 >
                   Submit Department Evaluation
                 </button>
               </div>
             </div>
          </div>
        </div>
      </div>
      

      <!-- Pagination - Matching SurveyManagement layout -->
      
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
       color: #ffdd7a; 
    }


    </style>
