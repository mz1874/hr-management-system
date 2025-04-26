import axios from './axios'

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
    question_type: 'RATING' | 'TEXT' | 'OPTIONS';
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
    employee: { id: number; username: string; /* other staff details */ }; // Nested employee details
    assigned_at: string; // ISO date string
    submitted_at?: string | null; // ISO date string or null
    status: 'PENDING' | 'SUBMITTED' | 'REVIEWED'; // Match backend choices
    overall_rating_avg?: number | null;
    answers: EvaluationAnswerView[]; // Array of submitted answers
}

// Paginated response structure (matches the actual backend response format)
export interface PaginatedResponse<T> {
    code: number;
    message: string;
    data: {
        count: number;
        next: string | null;
        previous: string | null;
        results: T[];
    };
}

// --- API Functions ---

// Get Evaluation Forms (HR/Admin view)
export function getAllEvaluationForms(page: number = 1, searchParams: { search?: string, status?: 'DRAFT' | 'PUBLISHED' } = {}) { // Changed type to include 'search'
    const params = new URLSearchParams();
    params.append('page', String(page));
    if (searchParams.search) params.append('search', searchParams.search); // Changed to append 'search'
    if (searchParams.status) params.append('status', searchParams.status);


    return axios.get<PaginatedResponse<EvaluationForm>>(`/api/evaluation-forms/?${params.toString()}`);
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

// Get Evaluation Instances (Staff/HR/Admin view)
export function getEvaluationInstances(page: number = 1, filters: any = {}) {
    const params = new URLSearchParams();
    params.append('page', String(page));
    // Add backend-supported filters here, e.g., form ID, status
    if (filters.formId) params.append('form', filters.formId);
    if (filters.status) params.append('status', filters.status);

    // Depending on role, backend filters automatically (Staff see own, HR see own created, Admin see all)
    return axios.get<PaginatedResponse<EvaluationInstance>>(`/api/evaluation-instances/?${params.toString()}`);
}

// Get a specific Evaluation Instance by ID
export function getEvaluationInstanceById(id: number) {
    return axios.get<EvaluationInstance>(`/api/evaluation-instances/${id}/`);
}

// Submit answers for an Evaluation Instance
export function submitEvaluationAnswers(instanceId: number, submissionData: EvaluationSubmissionPayload) {
    return axios.post(`/api/evaluation-instances/${instanceId}/submit/`, submissionData);
}

// Get Evaluation Instances (Admin specific view - if separate endpoint needed)
export function getAdminEvaluationInstances(page: number = 1, filters: any = {}) {
    const params = new URLSearchParams();
    params.append('page', String(page));
    if (filters.formId) params.append('form', filters.formId);
    if (filters.status) params.append('status', filters.status);
    if (filters.employeeId) params.append('employee', filters.employeeId); // Example admin filter

    return axios.get<PaginatedResponse<EvaluationInstance>>(`/api/admin/evaluation-instances/?${params.toString()}`);
}
