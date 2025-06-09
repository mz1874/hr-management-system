<template>
  <!-- Filter section -->
  <div class="row align-items-center nav">
    <div class="col-6">
      <h5>System Log</h5>
    </div>

    <div class="col-md-2">
      <input ref="datepickerStart" class="form-control" placeholder="Start Time">
    </div>

    <div class="col-md-2">
      <input ref="datepickerEnd" class="form-control" placeholder="End Time">
    </div>

    <div class="col-md-2">
      <button type="button" class="btn btn-primary" @click="fetchLogs">Search</button>
    </div>
  </div>

  <!-- Log table -->
  <div class="table-card mt-4">
    <table class="table">
      <thead>
      <tr>
        <th scope="col">ID</th>
        <th scope="col">User</th>
        <th scope="col" @click="toggleSort('operation_time')">
          Operation Time
          <span v-if="ordering === 'operation_time'">↑</span>
          <span v-else-if="ordering === '-operation_time'">↓</span>
        </th>
        <th scope="col">Operation Type</th>
        <th scope="col">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="log in logs" :key="log.id">
        <td>{{ log.id }}</td>
        <td>{{ log.staff_name }}</td>
        <td>{{ formatDateTime(log.operation_time) }}</td>
        <td>{{ log.operation_type }}</td>
        <td>
          <button class="btn btn-sm btn-info btn-action" @click="viewDetails(log)">View</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>

  <!-- Pagination & total count -->
  <div class="d-flex align-items-center mt-3 justify-content-start">
    <!-- Left: Total count -->
    <span class="me-3">Total Logs: {{ totalLogs }}</span>

    <!-- Right: Pagination -->
    <nav aria-label="Page navigation">
      <ul class="pagination">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="prevPage">Previous</button>
        </li>
        <li
            class="page-item"
            v-for="(page, index) in visiblePages"
            :key="index"
            :class="{ active: page === currentPage, disabled: page === '...'}"
        >
          <button
              class="page-link"
              v-if="page !== '...'"
              @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <span v-else class="page-link">…</span>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="nextPage">Next</button>
        </li>
      </ul>
    </nav>
  </div>

  <!-- Modal -->
  <div class="modal fade" id="logDetailsModal" ref="logDetailsModal" tabindex="-1" aria-labelledby="logDetailsModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title table-bg" id="logDetailsModalLabel">Log Details</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p><strong>ID:</strong> {{ selectedLog.id }}</p>
          <p><strong>User:</strong> {{ selectedLog.staff_name }}</p>
          <p><strong>Time:</strong> {{ formatDateTime(selectedLog.operation_time) }}</p>
          <p><strong>Type:</strong> {{ selectedLog.operation_type }}</p>
          <p><strong>Details:</strong> {{ selectedLog.operation_details }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, nextTick } from 'vue';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { Modal } from "bootstrap";
import { getSystemLogs } from "@/api/systemLog.ts";
import type {SystemLogInterface} from "@/interface/SystemLogInterface.ts";

// Date pickers
const datepickerStart = ref(null);
const datepickerEnd = ref(null);

// Log data
const logs = ref<SystemLogInterface[]>([]);
const totalLogs = ref(0);
const currentPage = ref(1);
const itemsPerPage = 10;
const ordering = ref('-operation_time'); // Default: newest first


const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 4) pages.push('...');

    const start = Math.max(2, current - 2);
    const end = Math.min(total - 1, current + 2);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 3) pages.push('...');
    pages.push(total);
  }

  return pages;
});


// Selected log for modal
const selectedLog = ref({
  id: null,
  user_name: '',
  operation_time: '',
  operation_type: '',
  operation_details: ''
});

// Computed properties
const totalPages = computed(() => Math.ceil(totalLogs.value / itemsPerPage));

// Initialize date pickers
onMounted(async () => {
  await nextTick();
  if (datepickerStart.value) {
    flatpickr(datepickerStart.value, { dateFormat: 'Y-m-d', enableTime: false });
  }
  if (datepickerEnd.value) {
    flatpickr(datepickerEnd.value, { dateFormat: 'Y-m-d', enableTime: false });
  }
  fetchLogs();
});

// Format date time for display
const formatDateTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString();
};

// Toggle sort order
const toggleSort = (field: string) => {
  if (ordering.value === field) {
    ordering.value = `-${field}`;
  } else if (ordering.value === `-${field}`) {
    ordering.value = field;
  } else {
    ordering.value = `-${field}`;
  }
  fetchLogs();
};

// Pagination functions
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchLogs();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchLogs();
  }
};

const goToPage = (page: any) => {
  currentPage.value = page;
  fetchLogs();
};

// Fetch logs from API
const fetchLogs = async () => {
  try {
    const params = {
      page: currentPage.value,
      page_size: itemsPerPage,
      ordering: ordering.value,
      start_date: datepickerStart.value?.value || '',
      end_date: datepickerEnd.value?.value || ''
    };
    const response = await getSystemLogs(params);
    console.log(response.data.data.results);
    logs.value = response.data.data.results;
    console.log(logs.value);
    totalLogs.value = response.data.data.count;
  } catch (error) {
    console.error('Error fetching logs:', error);
  }
};

// View details modal
const logDetailsModal = ref();
const viewDetails = (log: SystemLogInterface) => {
  selectedLog.value = log;
  const modal = new Modal(logDetailsModal.value);
  modal.show();
};
</script>

<style scoped>
/* Your existing styles remain unchanged */
.nav {
  margin-top: 40px;
}

.table-card {
  border: 1px solid #707070;
  padding: 2rem;
  margin-bottom: 1rem;
  border-radius: 20px;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table th,
.table td {
  padding: 1rem;
  vertical-align: middle;
  border-bottom: 1px solid #707070;
}

.table th {
  background-color: #f8f9fa;
  font-weight: bold;
  text-align: center;
  cursor: pointer;
}

.table th:hover {
  background-color: #e9ecef;
}

.table td {
  text-align: center;
}

.btn-action {
  padding: 0.25rem 1rem;
  margin-left: 0.5rem;
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

.modal {
  margin-top: 200px;
}

.modal-header {
  background-color: #7DA0CA;
  color: white;
  padding: 1rem 2rem;
}

.modal-title {
  margin-bottom: 0;
}

.modal-body p {
  margin-bottom: 0.5rem;
}

.modal-footer {
  border-top: 1px solid #dee2e6;
  padding: 1rem;
}
</style>