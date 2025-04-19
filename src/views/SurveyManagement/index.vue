<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  getAllSurveys,
  createSurvey,
  deleteSurvey,
  publishSurvey,
  updateSurvey
} from '@/api/survey'
// Import necessary types
import type { Survey, Question } from '@/api/survey' // Added type imports

//TODO 抽取
interface EvaluationItem {
  id: number
  name: string
  publishTime: string | null // 发布时间（如果已发布）
  status: 'published' | 'created' // 发布状态
  departments: number[] // Assuming API uses department IDs
  questions: QuestionItem[] // 问题列表
}

interface QuestionItem {
  id?: number
  type: 'grade' | 'option' // 问题类型
  question: string // 问题内容
  options?: string[] // 选项（仅适用于 Option 类型）
}

// TODO: Fetch departments from API
interface Department {
  id: number;
  name: string;
}
// 所有可选的部门 - Replace with API call result
const allDepartments = ref<Department[]>([
  { id: 1, name: 'HR' },
  { id: 2, name: 'Finance' },
  { id: 3, name: 'IT' },
  { id: 4, name: 'Marketing' },
  { id: 5, name: 'Operations' }
])
const departmentMap = computed(() => {
  return allDepartments.value.reduce((map, dept) => {
    map[dept.id] = dept.name;
    return map;
  }, {} as Record<number, string>);
});

// Evaluation data from API
const tableData = ref<EvaluationItem[]>([]) // Initialize empty
const totalSurveys = ref(0) // For pagination

// Modal state
const showModal = ref(false)
const currentEvaluation = ref<Partial<EvaluationItem> & { questions: QuestionItem[] }>({ questions: [] })
const modalType = ref<'create' | 'edit' | 'view'>('create')
const showPublishModal = ref(false)
const selectedDepartmentsForPublish = ref<number[]>([]) // Use numbers for department IDs

// Filtering state
const searchName = ref('')
const startDate = ref('')
const endDate = ref('')

// Pagination state (Moved up)
const currentPage = ref(1)
const itemsPerPage = ref(5) // TODO: Make this dynamic or fetch from API config if possible

// --- Fetching Data ---
const fetchSurveys = async () => {
  try {
    const params = {
      name: searchName.value,
      startDate: startDate.value,
      endDate: endDate.value
    }
    // Assuming API returns { data: { results: [], count: number } }
    const response = await getAllSurveys(currentPage.value, params)
    tableData.value = response.data.data.results // Adjust based on actual API response structure
    totalSurveys.value = response.data.data.count // Adjust based on actual API response structure
  } catch (error) {
    console.error("Failed to fetch surveys:", error);
    // TODO: Show error message to user
    tableData.value = [] // Clear data on error
    totalSurveys.value = 0
  }
}

// Fetch initial data on component mount
onMounted(() => {
  fetchSurveys()
  // TODO: Fetch allDepartments from API
  // getAllDepartments().then(res => allDepartments.value = res.data.data.results);
});

// Refetch data when page changes
watch(currentPage, fetchSurveys)
// Note: Consider adding watchers for filters (searchName, startDate, endDate)
// to refetch data automatically, or rely on the search button click.

// Trigger fetch when search button is clicked
const handleSearch = () => {
  currentPage.value = 1; // Reset to first page on new search
  fetchSurveys();
}

// --- Modal Actions ---

// 打开创建模态框
const openEvaluationModal = () => {
  currentEvaluation.value = {
    name: '',
    publishTime: null,
    status: 'created',
    departments: [],
    questions: []
  }
  modalType.value = 'create'
  showModal.value = true
}

// 打开发布模态框
const openPublishModal = (evaluation: EvaluationItem) => {
  currentEvaluation.value = JSON.parse(JSON.stringify(evaluation)); // Use deep copy
  selectedDepartmentsForPublish.value = evaluation.departments || []; // Initialize checkboxes
  showPublishModal.value = true
}

// 发布Evaluation - API Call
const handlePublishEvaluation = async () => {
  if (!currentEvaluation.value || !currentEvaluation.value.id) return;
  try {
    await publishSurvey(currentEvaluation.value.id, selectedDepartmentsForPublish.value)
    // Refresh data or update local state
    await fetchSurveys()
    showPublishModal.value = false
    selectedDepartmentsForPublish.value = [] // Reset selection
    // TODO: Show success message
  } catch (error) {
    console.error("Failed to publish survey:", error);
    // TODO: Show error message
  }
}

// 删除Evaluation - API Call
const handleDeleteEvaluation = async (evaluation: EvaluationItem) => {
  // TODO: Add confirmation dialog before deleting
  if (!evaluation.id) return;
  try {
    await deleteSurvey(evaluation.id)
    // Refresh data
    await fetchSurveys()
    // TODO: Show success message
  } catch (error) {
    console.error("Failed to delete survey:", error);
    // TODO: Show error message
  }
}

// 添加问题
const addQuestion = (type: 'grade' | 'option') => {
  if (!currentEvaluation.value.questions) currentEvaluation.value.questions = []
  const newQuestion: QuestionItem = {
    type,
    question: '',
    options: type === 'option' ? [''] : undefined // Start with one empty option for 'option' type
  }
  currentEvaluation.value.questions.push(newQuestion)
}

// 删除问题 (local only before save)
const removeQuestion = (questionIndex: number) => { // Use index since ID might not exist yet
  if (currentEvaluation.value.questions) {
    currentEvaluation.value.questions.splice(questionIndex, 1);
  }
}

// 添加选项 (local only before save)
const addOption = (questionIndex: number) => {
  const question = currentEvaluation.value.questions[questionIndex];
  if (question && question.type === 'option') {
    if (!question.options) question.options = [];
    question.options.push('');
  }
}

// 删除选项 (local only before save)
const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = currentEvaluation.value.questions[questionIndex];
    if (question && question.type === 'option' && question.options) {
        question.options.splice(optionIndex, 1);
    }
}

// 创建Evaluation - API Call
const handleAddEvaluation = async () => {
  // Basic validation
  if (!currentEvaluation.value.name || !currentEvaluation.value.questions || currentEvaluation.value.questions.length === 0) {
      console.error("Validation failed: Name and at least one question required.");
      // TODO: Add user feedback for validation error
      return;
  }

  try {
    // Prepare payload and explicitly map questions
    const mappedQuestions = currentEvaluation.value.questions.map(q => {
        const mappedQuestion: any = {
            type: q.type,
            question_text: q.question, // Map frontend 'question' to backend 'question_text'
            // id is typically not sent for creation
        };
        if (q.type === 'option' && q.options) {
            mappedQuestion.options = q.options.filter(opt => opt.trim() !== '');
        }
        return mappedQuestion;
    }).filter(q => q.question_text && q.question_text.trim() !== '');

    if (mappedQuestions.length === 0) {
        console.error("Validation failed: At least one valid question required.");
        // TODO: Add user feedback
        return;
    }

    // Construct the final payload with the correct type
    const payload: Partial<Survey> = {
        name: currentEvaluation.value.name,
        questions: mappedQuestions as Question[], // Assert type after mapping
        // Include other relevant fields from currentEvaluation if needed, e.g., departments
        departments: currentEvaluation.value.departments
    };

    await createSurvey(payload) // Pass the correctly structured payload
    await fetchSurveys() // Refresh data
    showModal.value = false
    // TODO: Show success message
  } catch (error) {
    console.error("Failed to create survey:", error);
    // TODO: Show error message
  }
}

// --- Edit Functionality ---
const openEditModal = (evaluation: EvaluationItem) => {
  currentEvaluation.value = JSON.parse(JSON.stringify(evaluation)); // Deep copy
  modalType.value = 'edit';
  showModal.value = true;
}

const handleSaveEditedEvaluation = async () => {
  if (!currentEvaluation.value || !currentEvaluation.value.id) return;

  // Basic validation
  if (!currentEvaluation.value.name || !currentEvaluation.value.questions || currentEvaluation.value.questions.length === 0) {
    console.error("Validation failed: Name and at least one question required.");
    // TODO: Add user feedback
    return;
  }

  // Prepare payload, ensuring correct mapping
  const mappedQuestions = currentEvaluation.value.questions.map(q => {
        const mappedQuestion: any = {
            type: q.type,
            question_text: q.question, // Map frontend 'question' to backend 'question_text'
            id: q.id // Include id for updates
        };
        if (q.type === 'option' && q.options) {
            mappedQuestion.options = q.options.filter(opt => opt.trim() !== '');
        }
        return mappedQuestion;
    }).filter(q => q.question_text && q.question_text.trim() !== '');

   if (mappedQuestions.length === 0) {
        console.error("Validation failed: At least one valid question required.");
        // TODO: Add user feedback
        return;
    }

    // Construct the final payload with the correct type
    const payload: Partial<Survey> = {
        name: currentEvaluation.value.name,
        questions: mappedQuestions as Question[], // Assert type after mapping
        // Include other relevant fields from currentEvaluation if needed
        departments: currentEvaluation.value.departments, 
        status: currentEvaluation.value.status // Keep existing status
    };

  try {
    await updateSurvey(currentEvaluation.value.id, payload); // Pass the correctly structured payload
    await fetchSurveys(); // Refresh data
    showModal.value = false;
    // TODO: Show success message
  } catch (error) {
    console.error("Failed to update survey:", error);
    // TODO: Show error message
  }
}

// --- Computed Properties for Pagination ---

const totalPages = computed(() => Math.ceil(totalSurveys.value / itemsPerPage.value))

const paginatedLogs = computed(() => tableData.value) // Use tableData directly (already paginated by API)

// --- Pagination Navigation ---
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
</script>

<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Publish Evaluation</h2>
  </div>

  <!-- 筛选条件 -->
  <div class="filter-container">
    <div class="d-flex justify-content-between align-items-center">
      <!-- 左侧：日期选择器 -->
      <div class="d-flex gap-3 align-items-center">
        <div class="input-group">
          <input type="date" class="form-control" id="startDate" placeholder="Start Date" v-model="startDate">
        </div>
        <div class="input-group">
          <input type="date" class="form-control" id="endDate" placeholder="End Date" v-model="endDate">
        </div>
      </div>

      <!-- 右侧：搜索框和按钮 -->
      <div class="d-flex gap-3 align-items-center">
        <form class="search-container" role="search" @submit.prevent="handleSearch">
          <i class="fas fa-search search-icon"></i>
          <input class="form-control" type="search" placeholder="Search Evaluation Name" v-model="searchName">
        </form>
        <button type="button" class="btn btn-primary" @click="handleSearch">Search</button>
      </div>
    </div>
  </div>

  <!-- 表格 -->
  <div class="table-card">
    <div class="d-flex justify-content-between align-items-center mb-1">
      <div></div>
      <button type="button" class="btn btn-success" @click="openEvaluationModal">Create A New Evaluation</button>
    </div>
    <table class="table">
      <thead>
      <tr>
        <th scope="col">ID</th>
        <th scope="col">Name</th>
        <th scope="col">Publish Time</th>
        <th scope="col">Status</th>
        <th scope="col">Departments</th>
        <th scope="col">Actions</th>
      </tr>
      </thead>
      <tbody v-if="paginatedLogs.length > 0">
        <tr v-for="item in paginatedLogs" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.publishTime ? new Date(item.publishTime).toLocaleString() : 'NA' }}</td>
          <td>{{ item.status }}</td>
          <td>{{ item.departments && item.departments.length > 0 ? item.departments.map(id => departmentMap[id] || id).join(', ') : 'None' }}</td>
          <td>
            <button v-if="item.status === 'created'" type="button" class="btn btn-warning btn-action" @click="openEditModal(item)">Edit</button>
            <button v-if="item.status === 'created'" type="button" class="btn btn-primary btn-action" @click="openPublishModal(item)">Publish</button>
            <button type="button" class="btn btn-danger btn-action" @click="handleDeleteEvaluation(item)">Delete</button>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td colspan="6" class="text-center">No evaluations found.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 分页 -->
  <div class="d-flex align-items-center mt-3 justify-content-start" v-if="totalSurveys > 0">
    <span class="me-3">Total: {{ totalSurveys }}</span>

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

  <!-- 创建/编辑/查看Evaluation模态框 -->
  <div class="modal fade" id="createEvaluation" :class="{ show: showModal }" style="display: block" v-if="showModal">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <div class="header-content">
            <h3>
              {{ modalType === 'edit' ? 'Edit Evaluation':
                modalType === 'create' ? 'Create New Evaluation' :
                    modalType === 'view' ? 'View Evaluation' : ''}}
            </h3>
          </div>
          <button type="button" class="btn-close" @click="showModal = false" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <!-- Evaluation名称 -->
          <div class="form-group mb-4">
            <label class="form-label">Evaluation Name:</label>
            <input type="text" class="form-control" placeholder="Enter evaluation name" v-model="currentEvaluation.name" :disabled="modalType === 'view'">
          </div>

          <!-- 问题管理 -->
          <div class="mb-4">
            <label class="form-label">Questions:</label>
            <div v-for="(question, questionIndex) in currentEvaluation.questions" :key="questionIndex" class="mb-3 border p-3 rounded">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6>{{ question.type === 'grade' ? 'Grade Question' : 'Option Question' }} #{{ questionIndex + 1 }}</h6>
                <button type="button" class="btn btn-danger btn-sm" @click="removeQuestion(questionIndex)" :disabled="modalType === 'view'">Remove Question</button>
              </div>
              <input type="text" class="form-control mb-2" placeholder="Enter question text" v-model="question.question" :disabled="modalType === 'view'">
              <div v-if="question.type === 'option'" class="option-container ms-3">
                <label class="option-label mb-1">Options:</label>
                <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="mb-2 d-flex align-items-center">
                  <input type="text" class="form-control me-2" placeholder="Enter option text" v-model="question.options[optionIndex]" :disabled="modalType === 'view'">
                  <button type="button" class="btn btn-outline-danger btn-sm" @click="removeOption(questionIndex, optionIndex)" :disabled="modalType === 'view' || (question.options && question.options.length <= 1)">X</button>
                </div>
                <button type="button" class="btn btn-success btn-sm" @click="addOption(questionIndex)" :disabled="modalType === 'view'">Add Option</button>
              </div>
            </div>
            <div v-if="!currentEvaluation.questions || currentEvaluation.questions.length === 0" class="text-muted mb-3">
              No questions added yet.
            </div>
            <div class="mt-3">
              <button type="button" class="btn btn-primary btn-control me-2" @click="addQuestion('grade')" :disabled="modalType === 'view'">Add Grade Question</button>
              <button type="button" class="btn btn-primary btn-control" @click="addQuestion('option')" :disabled="modalType === 'view'">Add Option Question</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showModal = false">Close</button>
          <button v-if="modalType === 'create'" type="button" class="btn btn-success" @click="handleAddEvaluation">Create</button>
          <button v-if="modalType === 'edit'" type="button" class="btn btn-primary" @click="handleSaveEditedEvaluation">Save Changes</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showModal"></div>

  <!-- 发布Evaluation模态框 -->
  <div class="modal fade" id="publishEvaluation" :class="{ show: showPublishModal }" style="display: block" v-if="showPublishModal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Publish Evaluation: {{ currentEvaluation.name }}</h3>
          <button type="button" class="btn-close" @click="showPublishModal = false" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <label class="form-label">Select Departments to Publish To:</label>
          <div v-for="department in allDepartments" :key="department.id" class="form-check">
            <input type="checkbox" class="form-check-input" :id="'dept-' + department.id" :value="department.id" v-model="selectedDepartmentsForPublish">
            <label class="form-check-label" :for="'dept-' + department.id">{{ department.name }}</label>
          </div>
          <div v-if="!allDepartments || allDepartments.length === 0" class="text-muted">
            No departments available.
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showPublishModal = false">Close</button>
          <button type="button" class="btn btn-primary" @click="handlePublishEvaluation" :disabled="selectedDepartmentsForPublish.length === 0">Publish</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showPublishModal"></div>
</template>

<style scoped>
.btn-control {
  margin: 10px;
}

/* 新增样式 */
.option-container {
  padding-left: 1.5rem;
  border-left: 2px solid #eee;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
}

.option-label {
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
}

/* 筛选条件容器 */
.filter-container {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
}

/* 搜索容器 */
.search-container {
  position: relative;
  width: 100%;
  max-width: 300px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: gray;
}

.search-container .form-control {
  padding-left: 35px;
}

/* 输入框和按钮的布局 */
.d-flex.gap-3 {
  gap: 1rem;
}

/* 表格卡片样式 */
.table-card {
  border: 1px solid #dee2e6;
  padding: 2rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  background-color: #fff;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

/* 表格样式 */
.table th, .table td {
  padding: 1rem;
  vertical-align: middle;
  border-bottom: 1px solid #dee2e6;
}
.table th {
    font-weight: 600;
    background-color: #f8f9fa;
}

.btn-action {
  padding: 0.25rem 0.75rem;
  margin-left: 0.5rem;
  font-size: 0.875rem;
}
.btn-action:first-child {
    margin-left: 0;
}

/* 分页样式 */
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
.page-item.disabled .page-link {
    color: #6c757d;
    pointer-events: none;
    background-color: #fff;
    border-color: #dee2e6;
}

.pagination {
  display: flex;
  margin-top: 15px;
   margin-bottom: 0;
}

/* 模态框样式 */
.modal {
  display: none;
}
.modal.show {
    display: block;
}

.modal-content {
  padding: 1.5rem;
   border-radius: 0.5rem;
}
.modal-header {
    border-bottom: 1px solid #dee2e6;
    padding-bottom: 1rem;
}
.modal-footer {
    border-top: 1px solid #dee2e6;
    padding-top: 1rem;
}

.form-label {
  font-weight: bold;
}

.form-control {
  border-color: #ced4da;
}
.form-control:focus {
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.row {
  display: flex;
  align-items: stretch;
}

.col-md-6:not(:last-child) {
  border-right: 1px solid #707070;
  padding-right: 30px;
}

.col-md-6:last-child {
  padding-left: 30px;
}

.auto-resize {
  resize: none;
  overflow: hidden;
}

input:disabled, textarea:disabled {
  background-color: #e9ecef !important;
   opacity: 1;
}

/* 删除模态框样式 */
#deleteRole .modal-header, #deleteRole .modal-footer {
  border: none;
}
</style>

