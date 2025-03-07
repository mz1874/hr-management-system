<script setup lang="ts">
import { ref, computed } from 'vue'

interface Question {
  id: number
  type: 'grade' | 'option' | 'remark' // 问题类型
  question: string // 问题内容
  score?: number // 评分题的分数（1-5）
  options?: string[] // 选择题的选项
  selectedOption?: string // 选择题的选中项
  remark?: string // 备注内容
}

interface Employee {
  id: number
  name: string
  department: string
  evaluationName: string
  questions: Question[] // 问题列表
}

// 模拟数据
const allEmployees = ref<Employee[]>([
  {
    id: 1,
    name: 'John Doe',
    department: 'HR',
    evaluationName: 'Evaluation 1',
    questions: [
      {
        id: 1,
        type: 'grade',
        question: 'How satisfied are you with your job?',
        score: 4,
      },
      {
        id: 2,
        type: 'option',
        question: 'Which team do you enjoy working with the most?',
        options: ['HR', 'Finance', 'IT', 'Marketing'],
        selectedOption: 'HR',
      },
      {
        id: 3,
        type: 'remark',
        question: 'Additional comments:',
        remark: 'Good performance overall.',
      },
    ],
  },
  {
    id: 2,
    name: 'Jane Smith',
    department: 'Finance',
    evaluationName: 'Evaluation 2',
    questions: [
      {
        id: 1,
        type: 'grade',
        question: 'How would you rate your work-life balance?',
        score: 5,
      },
      {
        id: 2,
        type: 'remark',
        question: 'Additional comments:',
        remark: 'Excellent work environment.',
      },
    ],
  },
  // 更多员工数据...
])

// 筛选条件
const selectedDepartment = ref('')
const selectedEvaluation = ref('')

// 分页功能
const currentPage = ref(1)
const itemsPerPage = 5

// 筛选后的员工列表
const filteredEmployees = computed(() => {
  return allEmployees.value.filter(employee => {
    const matchesDepartment = selectedDepartment.value ? employee.department === selectedDepartment.value : true
    const matchesEvaluation = selectedEvaluation.value ? employee.evaluationName === selectedEvaluation.value : true
    return matchesDepartment && matchesEvaluation
  })
})

// 分页后的员工列表
const paginatedEmployees = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredEmployees.value.slice(start, start + itemsPerPage)
})

// 总页数
const totalPages = computed(() => Math.ceil(filteredEmployees.value.length / itemsPerPage))

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

// 查看员工详情
const showEmployeeDetailModal = ref(false)
const currentEmployee = ref<Employee | null>(null)

const viewEmployeeDetail = (employee: Employee) => {
  currentEmployee.value = employee
  showEmployeeDetailModal.value = true
}
</script>

<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Employee Evaluation Results</h2>
  </div>

  <!-- 筛选条件 -->
  <div class="filter-container">
    <div class="d-flex gap-3 align-items-center">
      <div class="input-group">
        <label class="form-label me-2">Department:</label>
        <select class="form-control" v-model="selectedDepartment">
          <option value="">All Departments</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
          <option value="IT">IT</option>
          <option value="Marketing">Marketing</option>
        </select>
      </div>
      <div class="input-group">
        <label class="form-label me-2">Evaluation:</label>
        <select class="form-control" v-model="selectedEvaluation">
          <option value="">All Evaluations</option>
          <option value="Evaluation 1">Evaluation 1</option>
          <option value="Evaluation 2">Evaluation 2</option>
          <option value="Evaluation 3">Evaluation 3</option>
        </select>
      </div>
    </div>
  </div>

  <!-- 表格 -->
  <div class="table-card">
    <table class="table">
      <thead>
      <tr>
        <th scope="col">ID</th>
        <th scope="col">Name</th>
        <th scope="col">Department</th>
        <th scope="col">Evaluation Name</th>
        <th scope="col">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="employee in paginatedEmployees" :key="employee.id">
        <td>{{ employee.id }}</td>
        <td>{{ employee.name }}</td>
        <td>{{ employee.department }}</td>
        <td>{{ employee.evaluationName }}</td>
        <td>
          <button type="button" class="btn btn-primary btn-action" @click="viewEmployeeDetail(employee)">View</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>

  <!-- 分页 -->
  <div class="d-flex align-items-center mt-3 justify-content-start">
    <span class="me-3">Total: {{ filteredEmployees.length }}</span>
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

  <!-- 员工详情模态框 -->
  <div class="modal fade" :class="{ show: showEmployeeDetailModal }" style="display: block" v-if="showEmployeeDetailModal">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Employee Evaluation Details</h3>
        </div>
        <div class="modal-body">
          <!-- 员工基本信息 -->
          <div class="form-group mb-4">
            <label class="form-label">Employee Name:</label>
            <input type="text" class="form-control" v-model="currentEmployee.name" disabled>
          </div>
          <div class="form-group mb-4">
            <label class="form-label">Department:</label>
            <input type="text" class="form-control" v-model="currentEmployee.department" disabled>
          </div>
          <div class="form-group mb-4">
            <label class="form-label">Evaluation Name:</label>
            <input type="text" class="form-control" v-model="currentEmployee.evaluationName" disabled>
          </div>

          <!-- 问题列表 -->
          <div class="mb-4">
            <label class="form-label">Questions:</label>
            <div v-for="(question, index) in currentEmployee.questions" :key="index" class="mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <h6>{{ question.type === 'grade' ? 'Grade Question' : question.type === 'option' ? 'Option Question' : 'Remark' }}</h6>
              </div>
              <input type="text" class="form-control mb-2" v-model="question.question" disabled>

              <!-- 评分题 -->
              <div v-if="question.type === 'grade'" class="form-group">
                <label class="form-label">Score (1-5):</label>
                <input type="text" class="form-control" v-model="question.score" disabled>
              </div>

              <!-- 选择题 -->
              <div v-if="question.type === 'option'" class="option-container">
                <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="mb-2">
                  <label class="option-label">Option {{ optionIndex + 1 }}</label>
                  <input type="text" class="form-control" v-model="question.options[optionIndex]" disabled>
                </div>
                <div class="form-group">
                  <label class="form-label">Selected Option:</label>
                  <input type="text" class="form-control" v-model="question.selectedOption" disabled>
                </div>
              </div>

              <!-- 备注 -->
              <div v-if="question.type === 'remark'" class="form-group">
                <label class="form-label">Remark:</label>
                <textarea class="form-control auto-resize" v-model="question.remark" disabled></textarea>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showEmployeeDetailModal = false">Close</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showEmployeeDetailModal"></div>
</template>

<style scoped>
.filter-container {
  margin-bottom: 2rem;
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
</style>