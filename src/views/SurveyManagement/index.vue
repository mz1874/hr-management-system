<script setup lang="ts">
import { ref, computed } from 'vue'

//TODO 抽取
interface EvaluationItem {
  id: number
  name: string
  publishTime: string | null // 发布时间（如果已发布）
  status: 'published' | 'created' // 发布状态
  departments: string[] // 发布的部门（支持多个部门）
  questions: QuestionItem[] // 问题列表
}

interface QuestionItem {
  id: number
  type: 'grade' | 'option' // 问题类型
  question: string // 问题内容
  options?: string[] // 选项（仅适用于 Option 类型）
}

// 所有可选的部门
const allDepartments = ref<string[]>([
  'HR',
  'Finance',
  'IT',
  'Marketing',
  'Operations'
])

// 生成20条Evaluation数据
const tableData = ref<EvaluationItem[]>([
  {
    id: 1,
    name: 'Evaluation 1',
    publishTime: '2024-06-30 11:27:07',
    status: 'published',
    departments: ['HR', 'Finance'],
    questions: [
      {
        id: 1,
        type: 'grade',
        question: 'How satisfied are you with your job?'
      },
      {
        id: 2,
        type: 'option',
        question: 'Which team do you enjoy working with the most?',
        options: ['HR', 'Finance', 'IT', 'Marketing']
      }
    ]
  },
  {
    id: 2,
    name: 'Evaluation 2',
    publishTime: null,
    status: 'created',
    departments: [],
    questions: [
      {
        id: 1,
        type: 'grade',
        question: 'How would you rate your work-life balance?'
      }
    ]
  }
])

const showModal = ref(false)
const currentEvaluation = ref<Partial<EvaluationItem>>({})
const modalType = ref<'create' | 'edit' | 'view'>('create')
const showPublishModal = ref(false)

// 打开创建模态框
const openEvaluationModal = () => {
  currentEvaluation.value = {
    id: tableData.value.length + 1, // 生成唯一ID
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
  currentEvaluation.value = { ...evaluation }
  showPublishModal.value = true
}

// 发布Evaluation
const publishEvaluation = () => {
  const index = tableData.value.findIndex(item => item.id === currentEvaluation.value.id)
  if (index !== -1) {
    tableData.value[index].status = 'published'
    tableData.value[index].publishTime = new Date().toISOString().slice(0, 19).replace("T", " ")
    tableData.value[index].departments = currentEvaluation.value.departments || []
  }
  showPublishModal.value = false
}

// 删除Evaluation
const deleteEvaluation = (evaluation: EvaluationItem) => {
  tableData.value = tableData.value.filter(item => item.id !== evaluation.id)
}

// 添加问题
const addQuestion = (type: 'grade' | 'option') => {
  if (!currentEvaluation.value.questions) currentEvaluation.value.questions = []
  const newQuestion: QuestionItem = {
    id: currentEvaluation.value.questions.length + 1,
    type,
    question: '',
    options: type === 'option' ? [] : undefined
  }
  currentEvaluation.value.questions.push(newQuestion)
}

// 删除问题
const removeQuestion = (questionId: number) => {
  if (currentEvaluation.value.questions) {
    currentEvaluation.value.questions = currentEvaluation.value.questions.filter(q => q.id !== questionId)
  }
}

// 创建Evaluation
const addEvaluation = () => {
  if (currentEvaluation.value.name && currentEvaluation.value.questions) {
    const newEvaluation: EvaluationItem = {
      id: tableData.value.length + 1,
      name: currentEvaluation.value.name,
      publishTime: null,
      status: 'created',
      departments: [],
      questions: currentEvaluation.value.questions
    }
    tableData.value.push(newEvaluation)
    showModal.value = false
  }
}

// 过滤功能
const searchName = ref('')
const startDate = ref('')
const endDate = ref('')

const filteredLogs = computed(() => {
  return tableData.value.filter(detail => {
    // 搜索Evaluation名称
    const matchNameSearch = detail.name.toLowerCase().includes(searchName.value.toLowerCase())

    // 自定义日期范围
    const taskDate = detail.publishTime ? new Date(detail.publishTime) : null
    const start = startDate.value ? new Date(startDate.value) : null
    const end = endDate.value ? new Date(endDate.value) : null

    const matchesDateRange = (!start || (taskDate && taskDate >= start)) && (!end || (taskDate && taskDate <= end))

    return matchNameSearch && matchesDateRange
  })
})

// 分页功能
const currentPage = ref(1)
const itemsPerPage = 5

const totalLogs = computed(() => filteredLogs.value.length)
const totalPages = computed(() => Math.ceil(totalLogs.value / itemsPerPage))

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredLogs.value.slice(start, start + itemsPerPage)
})

// 翻页功能
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
const goToPage = (page: number) => {
  currentPage.value = page
}

function saveEditedEvaluation()
{

}

function fetchLogs()
{

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
        <form class="search-container" role="search">
          <i class="fas fa-search search-icon"></i>
          <input class="form-control" type="search" placeholder="Search Evaluation Name" v-model="searchName">
        </form>
        <button type="button" class="btn btn-primary" @click="fetchLogs">Search</button>
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
      <tbody>
      <tr v-for="item in paginatedLogs" :key="item.id">
        <td>{{ item.id }}</td>
        <td>{{ item.name }}</td>
        <td>{{ item.publishTime || 'NA' }}</td>
        <td>{{ item.status }}</td>
        <td>{{ item.departments.join(', ') }}</td>
        <td>
          <button v-if="item.status === 'created'" type="button" class="btn btn-primary btn-action" @click="openPublishModal(item)">Publish</button>
          <button type="button" class="btn btn-danger btn-action" @click="deleteEvaluation(item)">Delete</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>

  <!-- 分页 -->
  <div class="d-flex align-items-center mt-3 justify-content-start">
    <span class="me-3">Total: {{ totalLogs }}</span>

    <nav aria-label="Page navigation">
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="prevPage">Previous</button>
        </li>
        <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }">
          <button class="page-link" @click="goToPage(page)">{{ page }}</button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="nextPage">Next</button>
        </li>
      </ul>
    </nav>
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
            <div v-for="question in currentEvaluation.questions" :key="question.id" class="mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <h6>{{ question.type === 'grade' ? 'Grade Question' : 'Option Question' }}</h6>
                <button type="button" class="btn btn-danger btn-sm" @click="removeQuestion(question.id)">Remove</button>
              </div>
              <input type="text" class="form-control mb-2" placeholder="Enter question" v-model="question.question" :disabled="modalType === 'view'">
              <div v-if="question.type === 'option'" class="option-container">
                <div v-for="(option, index) in question.options" :key="index" class="mb-2">
                  <label class="option-label">Option {{ index + 1 }}</label>
                  <input type="text" class="form-control" placeholder="Enter option" v-model="question.options[index]" :disabled="modalType === 'view'">
                </div>
                <button type="button" class="btn btn-success btn-sm" @click="question.options.push('')">Add Option</button>
              </div>
            </div>
            <button type="button" class="btn btn-primary btn-control" @click="addQuestion('grade')">Add Grade Question</button>
            <button type="button" class="btn btn-primary btn-control" @click="addQuestion('option')">Add Option Question</button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showModal = false">Close</button>

          <!-- 创建按钮 -->
          <button v-if="modalType === 'create'" type="button" class="btn btn-success" @click="addEvaluation">Create</button>
          <!-- 保存按钮 -->
          <button v-if="modalType === 'edit'" type="button" class="btn btn-primary" @click="saveEditedEvaluation">Save</button>
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
          <h3 class="modal-title">Publish Evaluation</h3>
        </div>
        <div class="modal-body">
          <label class="form-label">Select Departments:</label>
          <div v-for="department in allDepartments" :key="department" class="form-check">
            <input type="checkbox" class="form-check-input" :id="department" :value="department" v-model="currentEvaluation.departments">
            <label class="form-check-label" :for="department">{{ department }}</label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showPublishModal = false">Close</button>
          <button type="button" class="btn btn-primary" @click="publishEvaluation">Publish</button>
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
  margin-left: 20px; /* 缩进 */
}

.option-label {
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
}

/* 筛选条件容器 */
.filter-container {
  margin-bottom: 2rem;
}

/* 搜索容器 */
.search-container {
  position: relative;
  width: 100%;
  max-width: 300px; /* 限制搜索框的最大宽度 */
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: gray;
}

.search-container .form-control {
  padding-left: 35px; /* 确保文本不与图标重叠 */
}

/* 输入框和按钮的布局 */
.d-flex.gap-3 {
  gap: 1rem; /* 设置元素之间的间距 */
}

/* 表格卡片样式 */
.table-card {
  border: 1px solid #707070;
  padding: 2rem;
  margin-bottom: 1rem;
  border-radius: 20px;
}

/* 表格样式 */
.table th, .table td {
  padding: 1rem;
  vertical-align: middle;
  border-bottom: 1px solid #707070;
}

.btn-action {
  padding: 0.25rem 1rem;
  margin-left: 0.5rem;
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

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

/* 模态框样式 */
.modal {
  display: none;
}

.modal-content {
  padding: 15px;
}

.form-label {
  font-weight: bold;
}

.form-control {
  border-color: #000000;
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
  background-color: transparent !important;
  color: black !important;
}

/* 删除模态框样式 */
#deleteRole .modal-header, #deleteRole .modal-footer {
  border: none;
}
</style>
