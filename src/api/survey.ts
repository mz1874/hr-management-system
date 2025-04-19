import axios from './axios'

// Type definitions (assuming basic structure, adjust as needed based on backend)
export interface Survey {
  id: number;
  name: string;
  publishTime?: string | null;
  status: 'published' | 'created';
  departments?: number[]; // Assuming department IDs are used
  questions: Question[];
}

export interface Question {
  id: number; // Assuming backend provides ID for questions within a survey
  type: 'grade' | 'option' | 'remark'; // Added 'remark' based on original DetailedEvaluationList
  question_text: string; // Match backend naming if different (e.g., question_text)
  options?: string[];
}

// Define structure for answers to be submitted
export interface Answer {
    questionId: number;
    score?: number; // For grade type
    selectedOption?: string; // For option type
    remark?: string; // For remark type
}

// Define structure for survey submissions/results
export interface SurveySubmission {
    surveyId: number;
    answers: Answer[]; // Array of answers
    // employeeId might be inferred by the backend based on authentication
}

// --- API Functions ---

// Get all surveys (evaluations) with pagination and filtering
export function getAllSurveys(page: number = 1, searchParams: { name?: string, startDate?: string, endDate?: string, status?: 'published' | 'created' } = {}) {
    // Add query parameters for pagination, search, date range etc.
    const params = new URLSearchParams();
    params.append('page', String(page));
    if (searchParams.name) params.append('name', searchParams.name);
    if (searchParams.startDate) params.append('startDate', searchParams.startDate);
    if (searchParams.endDate) params.append('endDate', searchParams.endDate);
    if (searchParams.status) params.append('status', searchParams.status); // Added status filter

    // TODO: Replace with actual backend endpoint
    console.warn("API CALL: getAllSurveys - Using placeholder endpoint");
    return axios.get(`/api/evaluation/survey/?${params.toString()}`);
    // Example: return axios.get(`/api/evaluations/?${params.toString()}`);
}

// Get a specific survey by ID
export function getSurveyById(id: number) {
    // TODO: Replace with actual backend endpoint
    console.warn("API CALL: getSurveyById - Using placeholder endpoint");
    // Ensure the response includes the full questions array with IDs
    return axios.get(`/api/evaluation/survey/${id}/`);
    // Example: return axios.get(`/api/evaluations/${id}/`);
}

// Create a new survey
export function createSurvey(surveyData: Partial<Survey>) {
    // TODO: Replace with actual backend endpoint
    console.warn("API CALL: createSurvey - Using placeholder endpoint");
    return axios.post('/api/evaluation/survey/', surveyData);
    // Example: return axios.post('/api/evaluations/', surveyData);
}

// Update an existing survey (e.g., publish, add/remove questions)
export function updateSurvey(id: number, surveyData: Partial<Survey>) {
    // TODO: Replace with actual backend endpoint
    console.warn("API CALL: updateSurvey - Using placeholder endpoint");
    return axios.put(`/api/evaluation/survey/${id}/`, surveyData);
    // Example: return axios.put(`/api/evaluations/${id}/`, surveyData);
}

// Delete a survey
export function deleteSurvey(id: number) {
    // TODO: Replace with actual backend endpoint
    console.warn("API CALL: deleteSurvey - Using placeholder endpoint");
    return axios.delete(`/api/evaluation/survey/${id}/`);
    // Example: return axios.delete(`/api/evaluations/${id}/`);
}

// Publish a survey (specific update action)
export function publishSurvey(id: number, departments: number[]) {
    // TODO: Replace with actual backend endpoint
    console.warn("API CALL: publishSurvey - Using placeholder endpoint");
    // Map frontend 'departments' to backend 'department_ids'
    const payload = { status: 'published', department_ids: departments, publishTime: new Date().toISOString() };
    return axios.patch(`/api/evaluation/survey/${id}/publish/`, payload);
    // Example: return axios.patch(`/api/evaluations/${id}/`, { status: 'published', department_ids }); // Corrected example key
}


// --- Functions related to DetailedEvaluationList ---

// Get survey results/submissions (potentially filtered and paginated)
// Added optional page parameter
export function getSurveyResults(surveyId: number, filters: any = {}, page: number = 1) {
    // Add query parameters for filtering by department, page, etc.
    const params = new URLSearchParams();
    params.append('page', String(page));
    if (filters.departmentId) params.append('departmentId', filters.departmentId);
    // Add other filters as needed

    // TODO: Replace with actual backend endpoint
    console.warn("API CALL: getSurveyResults - Using placeholder endpoint");
    return axios.get(`/api/evaluation/survey/${surveyId}/results/?${params.toString()}`);
    // Example: return axios.get(`/api/evaluations/${surveyId}/submissions/?${params.toString()}`);
}

// Submit/Save evaluation results for an employee taking a survey
export function saveEmployeeEvaluation(submissionData: SurveySubmission) {
    // TODO: Replace with actual backend endpoint and verify payload structure
    // Backend might expect answers keyed differently, e.g., { survey: surveyId, answers: [...] }
    console.warn("API CALL: saveEmployeeEvaluation - Using placeholder endpoint and payload structure");
    return axios.post(`/api/evaluation/submit/`, submissionData); // Adjusted endpoint example
    // Example: return axios.post(`/api/evaluation-submissions/`, submissionData);
} 