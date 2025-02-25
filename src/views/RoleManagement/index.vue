<script setup lang="ts">
import { ref, computed } from 'vue'

interface RoleItem {
  id: number
  roleName: string
  permissions: string[] // 当前角色拥有的权限
  createdOn: string // 创建日期
}

// 所有可用的路由权限（层次结构）
const allPermissions = ref<string[]>([
  '/dashboard',
  '/dashboard/overview',
  '/dashboard/analytics',
  '/users',
  '/users/list',
  '/users/roles',
  '/settings',
  '/settings/general',
  '/settings/security',
  '/posts',
  '/posts/list',
  '/posts/create',
  '/reports',
  '/reports/sales',
  '/reports/performance'
])

// 生成20条角色数据
const tableData = ref<RoleItem[]>([
  {
    id: 1,
    roleName: 'Admin',
    permissions: ['/dashboard', '/users', '/settings'],
    createdOn: '2024-06-30 11:27:07'
  },
  {
    id: 2,
    roleName: 'Editor',
    permissions: ['/dashboard', '/posts'],
    createdOn: '2024-06-30 11:27:07'
  },
  // 继续生成更多数据...
  {
    id: 20,
    roleName: 'Viewer',
    permissions: ['/dashboard'],
    createdOn: '2024-06-30 11:27:07'
  }
])

const showModal = ref(false)
const currentRole = ref<Partial<RoleItem>>({});
const modalType = ref<'create' | 'edit' | 'view'>('create')

// 获取未拥有的权限
const unassignedPermissions = computed(() => {
  return allPermissions.value.filter(permission => !currentRole.value.permissions?.includes(permission))
})

const openRoleModal = () => {
  currentRole.value = {
    id: tableData.value.length + 1, // 生成唯一ID
    roleName: '',
    permissions: [],
    createdOn: new Date().toISOString().slice(0, 19).replace("T", " "), // 当前时间戳
  }
  modalType.value = 'create'
  showModal.value = true
}

const openViewModal = (role: RoleItem) => {
  currentRole.value = { ...role }
  modalType.value = 'view'
  showModal.value = true
}

const openEditModal = (role: RoleItem) => {
  currentRole.value = { ...role }
  modalType.value = 'edit'
  showModal.value = true
}

const showRemoveModal = ref(false)
const modalRemoveType = ref<'delete' | 'reset'>('delete')
const openDeleteModal = (role: RoleItem) => {
  currentRole.value = role
  modalRemoveType.value = 'delete'
  showRemoveModal.value = true
}

const saveEditedRole = () => {
  const index = tableData.value.findIndex(item => item.id === currentRole.value.id)
  if (index !== -1) {
    tableData.value[index] = { ...(currentRole.value as RoleItem) }
  }
  showModal.value = false
}

const addRole = () => {
  tableData.value.push({
    id: tableData.value.length + 1,
    roleName: currentRole.value.roleName || "Untitled Role",
    permissions: currentRole.value.permissions || [],
    createdOn: new Date().toISOString().slice(0, 19).replace("T", " "),
  })
  showModal.value = false
}

const deleteRole = () => {
  tableData.value = tableData.value.filter(item => item.id !== currentRole.value.id)
  showRemoveModal.value = false
}

// 添加权限
const addPermission = (permission: string) => {
  if (!currentRole.value.permissions) currentRole.value.permissions = []
  currentRole.value.permissions.push(permission)
}

// 移除权限
const removePermission = (permission: string) => {
  if (currentRole.value.permissions) {
    currentRole.value.permissions = currentRole.value.permissions.filter(p => p !== permission)
  }
}

// 将权限路由信息转换为层次结构
const groupPermissionsByLevel = (permissions: string[]) => {
  const grouped: { [key: string]: string[] } = {}
  permissions.forEach(permission => {
    const parts = permission.split('/').filter(Boolean)
    const parent = parts[0]
    if (!grouped[parent]) grouped[parent] = []
    grouped[parent].push(permission)
  })
  return grouped
}

// 过滤功能
const searchRole = ref('')
const startDate = ref('')
const endDate = ref('')

const filteredLogs = computed(() => {
  return tableData.value.filter(detail => {
    // 搜索角色名称
    const matchRoleSearch = detail.roleName.toLowerCase().includes(searchRole.value.toLowerCase());

    // 自定义日期范围
    const taskDate = new Date(detail.createdOn); // 将字符串日期转换为Date对象
    const start = startDate.value ? new Date(startDate.value) : null;
    const end = endDate.value ? new Date(endDate.value) : null;

    const matchesDateRange = (!start || taskDate >= start) && (!end || taskDate <= end);

    return matchRoleSearch && matchesDateRange;
  });
});

// 分页功能
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

function fetchLogs()
{

}
</script>

<script lang="ts">
export default {
  name : "role-management",
}
</script>
<template>
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Role Management</h2>
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
          <input class="form-control" type="search" placeholder="Search Role Name" v-model="searchRole">
        </form>
        <button type="button" class="btn btn-primary" @click="fetchLogs">Search</button>
      </div>
    </div>
  </div>

  <!-- 表格 -->
  <div class="table-card">
    <div class="d-flex justify-content-between align-items-center mb-1">
      <div></div>
      <button type="button" class="btn btn-success" @click="openRoleModal">Create A New Role</button>
    </div>
    <table class="table">
      <thead>
      <tr>
        <th scope="col">ID</th>
        <th scope="col">Role Name</th>
        <th scope="col">Created On</th>
        <th scope="col">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in paginatedLogs" :key="item.id">
        <td>{{ item.id }}</td>
        <td>{{ item.roleName }}</td>
        <td>{{ item.createdOn }}</td>
        <td>
          <button type="button" class="btn btn-primary btn-action" @click="openViewModal(item)">View</button>
          <button type="button" class="btn btn-warning btn-action" @click="openEditModal(item)">Edit</button>
          <button type="button" class="btn btn-danger btn-action" @click="openDeleteModal(item)">Delete</button>
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

  <!-- 创建/编辑/查看角色模态框 -->
  <div class="modal fade" id="createRole" :class="{ show: showModal }" style="display: block" v-if="showModal">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <div class="header-content">
            <h3>
              {{ modalType === 'edit' ? 'Edit Role':
                modalType === 'create' ? 'Create New Role' :
                    modalType === 'view' ? 'View Role' : ''}}
            </h3>
          </div>
        </div>
        <div class="modal-body">
          <!-- 角色名称 -->
          <div class="form-group mb-4">
            <label class="form-label">Role Name:</label>
            <input type="text" class="form-control" placeholder="Enter role name" v-model="currentRole.roleName" :disabled="modalType === 'view'">
          </div>

          <!-- 权限管理 -->
          <div class="row" v-if="modalType === 'edit' || modalType === 'create'">
            <!-- 左侧：未拥有的权限 -->
            <div class="col-md-6">
              <label class="form-label">Unassigned Permissions:</label>
              <div v-for="(permissions, parent) in groupPermissionsByLevel(unassignedPermissions)" :key="parent" class="mb-3">
                <h6>{{ parent }}</h6>
                <ul class="list-group">
                  <li class="list-group-item d-flex justify-content-between align-items-center" v-for="permission in permissions" :key="permission">
                    {{ permission }}
                    <button type="button" class="btn btn-success btn-sm" @click="addPermission(permission)">Add</button>
                  </li>
                </ul>
              </div>
            </div>

            <!-- 右侧：拥有的权限 -->
            <div class="col-md-6">
              <label class="form-label">Assigned Permissions:</label>
              <div v-for="(permissions, parent) in groupPermissionsByLevel(currentRole.permissions || [])" :key="parent" class="mb-3">
                <h6>{{ parent }}</h6>
                <ul class="list-group">
                  <li class="list-group-item d-flex justify-content-between align-items-center" v-for="permission in permissions" :key="permission">
                    {{ permission }}
                    <button type="button" class="btn btn-danger btn-sm" @click="removePermission(permission)">Remove</button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 查看模式 -->
          <div v-if="modalType === 'view'">
            <label class="form-label">Permissions:</label>
            <div v-for="(permissions, parent) in groupPermissionsByLevel(currentRole.permissions || [])" :key="parent" class="mb-3">
              <h6>{{ parent }}</h6>
              <ul class="list-group">
                <li class="list-group-item" v-for="permission in permissions" :key="permission">
                  {{ permission }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showModal = false">Close</button>

          <!-- 创建按钮 -->
          <button v-if="modalType === 'create'" type="button" class="btn btn-success" @click="addRole">Create</button>
          <!-- 保存按钮 -->
          <button v-if="modalType === 'edit'" type="button" class="btn btn-primary" @click="saveEditedRole">Save</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showModal"></div>

  <!-- 删除角色模态框 -->
  <div class="modal fade" id="deleteRole" :class="{ show: showRemoveModal }" style="display: block" v-if="showRemoveModal">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title" id="deleteRoleLabel">Are you sure?</h3>
        </div>
        <div class="modal-body">
          <span class="text-muted">This action cannot be undone. This will permanently delete the role, <b>{{currentRole.roleName}}</b>.</span>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showRemoveModal = false">Close</button>
          <button type="button" class="btn btn-danger" @click="deleteRole">Confirm</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showRemoveModal"></div>

</template>
<style scoped>
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
