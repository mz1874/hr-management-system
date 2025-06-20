import axios from './axios'
import type {Staff} from "@/interface/UserInterface.ts";

// Generic API Response Wrapper (for single item responses)
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// --- Interface Definitions ---

// Represents an option for a multiple-choice question (matches backend model)
export interface RowyQuestionOption {
    id?: number; // Optional for creation
    option_text: string;
    order?: number; // Optional for creation
}

// Represents a question within an evaluation form (matches backend model/serializer)
export interface EvaluationQuestion {
    id?: number; // Optional for creation
    text: string;
    question_type: 'RATING' | 'TEXT' | 'OPTIONS' | 'TEXT_INPUT'; // Added TEXT_INPUT
    order?: number; // Optional for creation
    options?: RowyQuestionOption[]; // Nested options for OPTIONS type
}

// Represents the evaluation form (template) (matches backend model/serializer)
export interface EvaluationForm {
    id?: number; // Optional for creation
    name: string;
    description?: string;
    status: 'DRAFT' | 'PUBLISHED'; // Matches backend choices
    publish_time?: string | null; // ISO date string or null
    created_at?: string; // Added created_at field
    departments: number[]; // Array of department IDs for write
    department_details?: { id: number; department_name: string }[]; // Read-only details from backend
    questions: EvaluationQuestion[]; // Nested questions
    submission_count?: number; // Optional: Number of submissions received
}

// Represents an answer being submitted by staff (matches backend serializer)
export interface EvaluationAnswerSubmit {
    question_id: number; // Use question_id for submission
    rating?: number | null; // For RATING type (1-5)
    text_answer?: string | null; // For TEXT type
    selected_option_id?: number | null; // For OPTIONS type
}

// Represents the entire submission payload for an instance (matches backend serializer)
export interface EvaluationSubmissionPayload {
    answers: EvaluationAnswerSubmit[];
}

// Represents a submitted answer (for viewing results) (matches backend serializer)
export interface EvaluationAnswerView {
    id: number;
    question: EvaluationQuestion; // Nested question details (might include options)
    rating?: number | null;
    text_answer?: string | null;
    selected_option?: RowyQuestionOption | null; // Nested selected option details
}

// Represents an evaluation instance (assigned task + results) (matches backend model/serializer)
export interface EvaluationInstance {
    id: number;
    form: EvaluationForm; // Nested form details (might include questions/options)
    employee:  Staff; // Nested employee details
    assigned_at: string; // ISO date string
    submitted_at?: string | null; // ISO date string or null
    status: 'PENDING' | 'SUBMITTED' | 'REVIEWED'; // Match backend choices
    overall_rating_avg?: number | null;
    answers: EvaluationAnswerView[]; // Array of submitted answers
}

// Standard Paginated response structure (e.g., for getAllEvaluationForms)
export interface StandardPaginatedData<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[]; // Direct array of items
    finished_count?: number; // Optional, may not be present in all standard paginated responses
}

export interface StandardPaginatedResponse<T> {
    code: number;
    message: string;
    data: StandardPaginatedData<T>;
}

// Nested Paginated response structure (specifically for getEvaluationInstances based on logs)
export interface NestedResultsData<T> {
    count: number; // Inner count
    next: string | null; // Inner next
    previous: string | null; // Inner previous
    results: T[]; // The actual array of items
    finished_count?: number; 
}

export interface NestedPaginatedData<T> {
    count: number; // Outer count
    next: string | null; // Outer next
    previous: string | null; // Outer previous
    results: NestedResultsData<T>; // This 'results' field is an object containing the actual items array
}

export interface NestedPaginatedResponse<T> { // Renamed from PaginatedResponse
    code: number;
    message: string;
    data: NestedPaginatedData<T>;
}

// --- API Functions ---

// Get Evaluation Forms (HR/Admin view)
// Updated status type to string to allow 'SUBMITTED' from frontend, backend handles logic.
export function getAllEvaluationForms(page: number = 1, searchParams: { search?: string, status?: string, page_size?: number } = {}) {
    const params = new URLSearchParams();
    params.append('page', String(page));
    if (searchParams.search) params.append('search', searchParams.search);
    if (searchParams.status) params.append('status', searchParams.status);
    if (searchParams.page_size) params.append('page_size', String(searchParams.page_size)); // Add page_size if provided

    // Use StandardPaginatedResponse for getAllEvaluationForms
    return axios.get<StandardPaginatedResponse<EvaluationForm>>(`/api/evaluation-forms/?${params.toString()}`);
}

// Get a specific Evaluation Form by ID
export function getEvaluationFormById(id: number) {
    return axios.get<EvaluationForm>(`/api/evaluation-forms/${id}/`);
}

// Create a new Evaluation Form
// Note: `departments` should be an array of IDs, `questions` the array of question objects
export function createEvaluationForm(formData: Omit<EvaluationForm, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'status' | 'publish_time' | 'department_details'>) {
    return axios.post<EvaluationForm>('/api/evaluation-forms/', formData);
}

// Update an existing Evaluation Form
export function updateEvaluationForm(id: number, formData: Partial<Omit<EvaluationForm, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'status' | 'publish_time' | 'department_details'> & { departments?: number[] }>) {
    return axios.put<EvaluationForm>(`/api/evaluation-forms/${id}/`, formData);
}

// Delete an Evaluation Form
export function deleteEvaluationForm(id: number) {
    return axios.delete(`/api/evaluation-forms/${id}/`);
}

// Publish an Evaluation Form
// Added optional data payload for departments
export function publishEvaluationForm(id: number, data?: { departments: number[] }) {
    return axios.post(`/api/evaluation-forms/${id}/publish/`, data);
}

// Start an Evaluation Instance (get or create)
// Define the expected nested structure for the response data
interface StartInstanceResponse {
    code: number;
    message: string;
    data: {
        instance_id: number;
    };
}
// Modified to accept optional employeeId for manager evaluations
export function startEvaluationInstance(formId: number, employeeId?: number) {
    const payload = employeeId ? { employee_id: employeeId } : {};
    // Use the defined interface for the expected response structure
    return axios.post<StartInstanceResponse>(`/api/evaluation-forms/${formId}/start_evaluation/`, payload);
}

// Get Evaluation Instances (Staff/HR/Admin view)
export function getEvaluationInstances(page: number = 1, filters: any = {}) {
    const params = new URLSearchParams();
    params.append('page', String(page));
    // Add backend-supported filters here, e.g., form ID, status
    if (filters.formId) params.append('form', filters.formId);
    if (filters.status) params.append('status', filters.status);

    // Depending on role, backend filters automatically (Staff see own, HR see own created, Admin see all)
    // Use NestedPaginatedResponse for getEvaluationInstances
    return axios.get<NestedPaginatedResponse<EvaluationInstance>>(`/api/evaluation-instances/?${params.toString()}`);
}

// Get a specific Evaluation Instance by ID
export function getEvaluationInstanceById(id: number) {
    return axios.get<ApiResponse<EvaluationInstance>>(`/api/evaluation-instances/${id}/`);
}

// Submit answers for an Evaluation Instance
export function submitEvaluationAnswers(instanceId: number, submissionData: EvaluationSubmissionPayload) {
    return axios.post(`/api/evaluation-instances/${instanceId}/submit/`, submissionData);
}

// New function to finalize department evaluation (mark submitted instances as reviewed)
export function finalizeDepartmentEvaluation(formId: number) {
    // No payload needed, the backend identifies the manager and department from the request
    return axios.post(`/api/evaluation-forms/${formId}/finalize_department_evaluation/`);
}

// Send back a submitted/reviewed evaluation instance (manager action)
export function sendBackEvaluation(instanceId: number) {
    return axios.post(`/api/evaluation-instances/${instanceId}/send_back/`);
}
