import axios from './axios'

// --- Interface Definitions ---

// Represents a question within an evaluation form
export interface EvaluationQuestion {
  id?: number; // Optional for creation
  text: string;
  question_type: 'RATING' | 'TEXT'; // Match backend choices
  order: number;
}

// Represents the evaluation form (template)
export interface EvaluationForm {
  id: number;
  name: string;
  description?: string;
  departments?: number[]; // Array of department IDs (used for write/update)
  department_details?: { id: number; department_name: string }[]; // Read-only details
  questions: EvaluationQuestion[];
  created_by?: string; // Read-only username
  created_at?: string; // Read-only ISO date string
  updated_at?: string; // Read-only ISO date string
  status: 'DRAFT' | 'PUBLISHED'; // Match backend choices
  publish_time?: string | null; // Read-only ISO date string or null
}

// Represents an answer being submitted by staff
export interface EvaluationAnswerSubmit {
    question_id: number; // Use question_id for submission
    rating?: number | null; // For RATING type (1-5)
    text_answer?: string | null; // For TEXT type
}

// Represents the entire submission payload for an instance
export interface EvaluationSubmissionPayload {
    answers: EvaluationAnswerSubmit[];
}

// Represents a submitted answer (for viewing results)
export interface EvaluationAnswerView {
    id: number;
    question: EvaluationQuestion; // Nested question details
    rating?: number | null;
    text_answer?: string | null;
}

// Represents an evaluation instance (assigned task + results)
export interface EvaluationInstance {
    id: number;
    form: EvaluationForm; // Nested form details
    employee: { id: number; username: string; /* other staff details */ }; // Nested employee details
    assigned_at: string; // ISO date string
    submitted_at?: string | null; // ISO date string or null
    status: 'PENDING' | 'SUBMITTED' | 'REVIEWED'; // Match backend choices
    overall_rating_avg?: number | null;
    answers: EvaluationAnswerView[]; // Array of submitted answers
}

// Paginated response structure (example for forms)
export interface PaginatedResponse<T> {
    data: any;
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// --- API Functions ---

// Get Evaluation Forms (HR/Admin view)
export function getAllEvaluationForms(page: number = 1, searchParams: { name?: string, status?: 'DRAFT' | 'PUBLISHED' } = {}) {
    const params = new URLSearchParams();
    params.append('page', String(page));
    if (searchParams.name) params.append('name', searchParams.name);
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
export function publishEvaluationForm(id: number) {
    // No payload needed for this specific action based on backend setup
    return axios.post(`/api/evaluation-forms/${id}/publish/`);
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