<template>
    <div class="d-flex mb-4">
        <h2>Point System</h2>
    </div>

    <div class="filter-container ">
        <div class="d-flex gap-3 ">
            <form class="search-container" role="search"> 
                <i class="fas fa-search search-icon"></i>
                <input class="form-control" type="search" placeholder="Search Employee Name" v-model="searchName">
                <!-- <button class="btn btn-success" type="submit">Search</button> -->
            </form>
            <select class="search-container form-select" v-model="selectedDepartment">
                <option value="">All Department</option>
                <option>Sales Department</option>
                <option>Marketing Department</option>
                <option>Account Department</option>
                <option>Purchasing Department</option>
                <option>Warehouse & Warehouse Office</option>
                <option>Logistics Department</option>
            </select>
        </div>
    </div>  
    
    <!-- table -->
    <div class="table-card">
        <table class="table">   
            <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Username</th>
                    <th scope="col">Department</th>
                    <th scope="col">Total Points</th>
                    <th scope="col">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in paginatedLogs" :key="item.id">
                    <th>{{ item.id }}</th>
                    <td>{{ item.username }}</td>
                    <td>{{ item.department }}</td>
                    <td>{{ item.totalPoints }}</td>
                    <td>
                        <button type="button" class="btn btn-primary" @click="openView(item)">Point Details</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- pagination -->
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

    <!-- Modal for Change Status -->
    <div class="modal fade" id="changeRewardStatus" :class="{ show: showModal }" style="display: block" v-if="showModal">
        <div class="modal-dialog modal-dialog-centered modal-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <div>
                        <h3>Employee Point Details</h3>
                        <span class="text-muted">View employee points from KPIs and Rewards</span>
                    </div>
                </div>
                <div class="modal-body" v-if="currentPoint">
                    <div class="point-details-item" v-for="detail in currentPoint.details" :key="detail.name">
                        <div class="d-flex justify-content-between mb-1">
                            <span>{{ detail.name }}</span>
                            <span>{{ detail.points > 0 ? '+' : '' }}{{ detail.points }} points</span>
                        </div>
                        <div class="d-flex justify-content-between">
                            <span style= "color: gray">{{ detail.type }}</span>
                            <span style= "color: gray">{{ detail.ReceivedOn }}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="showModal = false">Close</button>
                </div>
            </div>
        </div>
    </div >
    <div class="modal-backdrop fade show" v-if="showModal"></div>

</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface pointItem {
    id: number
    username: string
    department: string
    totalPoints: number
    details: {
        name: string,
        type: 'KPI' | 'Reward',
        points: number,
        ReceivedOn: string
    }[]
}

const tableData = ref<pointItem[]>([
    {
        id: 1, username: 'Alex', department: 'Sales Department', totalPoints: 100, 
        details: [
            {
                name: 'Complete Order',
                type: 'KPI',
                points: 50,
                ReceivedOn: '2024-06-30 11:27:07'
            },            {
                name: 'Team Building',
                type: 'KPI',
                points: 100,
                ReceivedOn: '2024-06-30 11:27:07'
            },
            {
                name: 'Jaya Grocer Gift Card',
                type: 'Reward',
                points: -50,
                ReceivedOn: '2024-06-30 11:27:07'
            }]
    },
    {id: 2, username: 'Amanda', department: 'Sales Department', totalPoints: 50, 
    details: [
            {
                name: 'Project A',
                type: 'KPI',
                points: 50,
                ReceivedOn: '2024-06-30 11:27:07'
            },
            {
                name: 'McDonald Gift Card',
                type: 'Reward',
                points: -50,
                ReceivedOn: '2024-06-30 11:27:07'
            }]
    }, 
])

const currentPoint = ref<Partial<pointItem>>({});

const showModal = ref(false)

// Open modal and set current status
const openView = (point: pointItem) => {
    currentPoint.value = { ...point };
    showModal.value = true
};

// filter
const searchName = ref('')
const selectedDepartment = ref('')

const filteredLogs = computed(() => {
  return tableData.value.filter(detail => {
    //search bar for username
    const matchNameSearch = detail.username.toLowerCase().includes(searchName.value.toLowerCase());

    //search for specific status
    const matchDepartmentSearch = !selectedDepartment.value || detail.department === selectedDepartment.value
    
    return matchNameSearch && matchDepartmentSearch;
  });
});

// pagination
const currentPage = ref(1);
const itemsPerPage = 5;

const totalLogs = computed(() => filteredLogs.value.length);
const totalPages = computed(() => Math.ceil(totalLogs.value / itemsPerPage));

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredLogs.value.slice(start, start + itemsPerPage);
});

// 翻页功能
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
const goToPage = (page: number) => {
  currentPage.value = page;
};

</script>

<style scoped>
.search-container {
    margin-bottom: 1rem;
    width: 100%; /* Ensure form controls take up available width */
    max-width: 350px; /* Set a fixed maximum width */
    display: flex;
    align-items: center;
    position: relative;
}
.filter-container {
    margin-bottom: 2rem;
}
.search-icon {
    position: absolute;
    left: 10px;  /* Adjust left padding */
    top: 50%;
    transform: translateY(-50%);
    color: gray; /* Icon color */
}
.form-control {
    padding-left: 35px; /* Ensure text doesn't overlap the icon */
}

.form-control, .form-select {
    border-color: #000000;
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

/* Styling for Modal */
.modal-content {
    padding: 15px;
    border-radius: 30px;
}
.modal-header, .modal-footer {
    border: none;
}
.status-exp {
    color: #7F7F7F;
}
.point-details-item {
    padding: 10px 0px;
    border-bottom: solid 1px #d7d7d7;
    /* border-top: solid 1px #d7d7d7; */
}
</style>
