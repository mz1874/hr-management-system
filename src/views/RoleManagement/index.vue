<script setup lang="ts">
import {ref, computed, reactive} from 'vue';
import useRole from "@/hooks/useRole.ts";
import type { RoleItem } from "@/interface/RoleInterface.ts";
import Swal from "sweetalert2";
import useRouter from "@/hooks/useRouter.ts";
const { tableData: routerTableData } = useRouter();

const selectedPermissions = ref([])

const treeOptions = computed(() => {
  if (!routerTableData.value?.length) return []
  return convertToTreeSelect(routerTableData.value)
})

function convertToTreeSelect(data) {
  return data.map(item => ({
    id: item.id,
    label: item.name,
    children: item.children?.length ? convertToTreeSelect(item.children) : undefined
  }))
}

const {
  tableData,
  handleDeleteRole,
  handleRoleAdd,
  count,
  paginationInfo,
  nextPage,
  prevPage,
  fetchPage,
  goToPage,
  currentPage,
  totalPages,
  searchRole,
  handleSearchByStaffName,
  handleRoleEdit
} = useRole();


// 模态框控制
const showModal = ref(false);
const currentRole = ref<RoleItem>();
const modalType = ref<'create' | 'edit' | 'view'>('create');

// 删除模态框
const showRemoveModal = ref(false);
const modalRemoveType = ref<'delete' | 'reset'>('delete');



// 打开创建模态框
const openRoleModal = () => {
  currentRole.value = {
    id: 0,
    name: '',
    permissions: [],
    createdOn: new Date().toISOString().slice(0, 19).replace("T", " "),
  };
  modalType.value = 'create';
  showModal.value = true;
};

// 查看角色
const openViewModal = (role: RoleItem) => {
  currentRole.value = { ...role };
  modalType.value = 'view';
  showModal.value = true;
};

// 编辑角色
const openEditModal = (role: RoleItem) => {
  currentRole.value = { ...role };
  selectedPermissions.value = [...role.permissions]; // 添加这行
  modalType.value = 'edit';
  showModal.value = true;
};

// 删除角色确认
const openDeleteModal = (role: RoleItem) => {
  currentRole.value = role;
  modalRemoveType.value = 'delete';
  showRemoveModal.value = true;
};

// 保存编辑
const saveEditedRole = () => {
  if(currentRole.value.name === '' || currentRole.value.name === '' || currentRole.value.name === '') {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Role name cannot be empty!",
    });
  }else {
    currentRole.value.permissions = [...selectedPermissions.value];
    handleRoleEdit(currentRole.value);
    const index = tableData.value.findIndex(item => item.id === currentRole.value.id);
    if (index !== -1) {
      tableData.value[index] = { ...currentRole.value };
    }
  }
  showModal.value = false;
};

// 添加角色
const addRole = () => {
  if (!currentRole.value.name) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Role name cannot be empty!",
    });
    return;
  }

  const roleItem: RoleItem = {
    id: 0,
    name: currentRole.value.name,
    permissions: currentRole.value.permissions || [],
    createdOn: ''
  };

  roleItem.permissions = selectedPermissions.value;
  handleRoleAdd(roleItem);
  showModal.value = false;
};

// 确认删除角色
const roleDelete = () => {
  handleDeleteRole(currentRole.value.id);
  showRemoveModal.value = false;
};

// 添加权限
const addPermission = (permission: string) => {
  if (!currentRole.value.permissions) currentRole.value.permissions = [];
  if (!currentRole.value.permissions.includes(permission)) {
    currentRole.value.permissions.push(permission);
  }
};

// 移除权限
const removePermission = (permission: string) => {
  if (currentRole.value.permissions) {
    currentRole.value.permissions = currentRole.value.permissions.filter(p => p !== permission);
  }
};

// 分组权限
const groupPermissionsByLevel = (permissions: string[]) => {
  const grouped: { [key: string]: string[] } = {};
  permissions.forEach(permission => {
    const parts = permission.split('/').filter(Boolean);
    const parent = parts[0];
    if (!grouped[parent]) grouped[parent] = [];
    grouped[parent].push(permission);
  });
  return grouped;
};

function fetchLogs()
{
  if(searchRole.value == '')
  {
    paginationInfo.currentPage = 1;
    paginationInfo.totalPages = 1;
    paginationInfo.itemsPerPage = 10;
    paginationInfo.currentPage = 1;
    paginationInfo.currentUrl = "/api/role/?page=1";
    paginationInfo.previous= null as string | null;
    paginationInfo.next=  null as string | null
    fetchPage("/api/role/?page=1");
  }else {
    handleSearchByStaffName(searchRole.value );
  }
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
    <div class="d-flex justify-content-end align-items-center gap-2">
      <form class="search-container d-flex align-items-center gap-2" role="search">
        <i class="fas fa-search search-icon"></i>
        <input class="form-control" type="search" placeholder="Search Role Name" v-model="searchRole">
      </form>
      <button type="button" class="btn btn-primary" @click="fetchLogs()">Search</button>
    </div>
  </div>



  <!-- 表格 -->
  <div class="table-card">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <div></div>
      <button type="button" class="btn btn-success" @click="openRoleModal">Create A New Role</button>
    </div>

    <table class="table table-hover">
      <thead class="table-light">
      <tr>
        <th scope="col">ID</th>
        <th scope="col">Role Name</th>
        <th scope="col">Created On</th>
        <th scope="col">Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-if="tableData.length === 0">
        <td colspan="4" class="text-center">No roles found.</td>
      </tr>
      <tr v-for="item in tableData" :key="item.id">
        <td>{{ item.id }}</td>
        <td>{{ item.name }}</td>
        <td>{{ item.createdOn }}</td>
        <td>
          <button type="button" class="btn btn-sm btn-primary me-1" @click="openViewModal(item)">View</button>
          <button type="button" class="btn btn-sm btn-warning me-1" @click="openEditModal(item)">Edit</button>
          <button type="button" v-show="item.name.toLowerCase() !== 'admin'.toLowerCase()" class="btn btn-sm btn-danger" @click="openDeleteModal(item)">
            Delete
          </button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>


  <!-- 分页 -->
  <div class="d-flex align-items-center mt-3 justify-content-start">
    <span class="me-3">Total: {{ count }}</span>

    <nav aria-label="Page navigation">
      <ul class="pagination mb-0">
        <li class="page-item" :class="{ disabled: !paginationInfo.previous }">
          <button class="page-link" @click="prevPage" :disabled="!paginationInfo.previous">Previous</button>
        </li>

        <li
            class="page-item"
            v-for="page in totalPages"
            :key="page"
            :class="{ active: page === currentPage }"
        >
          <button class="page-link" @click="goToPage(page)">{{ page }}</button>
        </li>

        <li class="page-item" :class="{ disabled: !paginationInfo.next }">
          <button class="page-link" @click="nextPage" :disabled="!paginationInfo.next">Next</button>
        </li>
      </ul>
    </nav>
  </div>


  <!-- 创建/编辑/查看角色模态框 -->
  <div class="modal fade" id="createRole" :class="{ show: showModal }" style="display: block" v-if="showModal">
    <div class="modal-dialog custom-modal modal-xl modal-dialog-centered modal-dialog-scrollable">
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
            <input type="text" class="form-control" placeholder="Enter role name" v-model="currentRole.name" :disabled="modalType === 'view'">
          </div>

          <!-- 权限管理 -->
          <div class="row" v-if="modalType === 'edit' || modalType === 'create'">
            <!-- 左侧：未拥有的权限 -->
              <label class="form-label">All Permissions:</label>
                <Treeselect
                    v-model="selectedPermissions"
                    :multiple="true"
                    :options="treeOptions"
                    :default-expand-level="1"
                    placeholder="请选择权限"
                />
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
          <span class="text-muted">This action cannot be undone. This will permanently delete the role, <b>{{currentRole.name}}</b>.</span>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="showRemoveModal = false">Close</button>
          <button type="button" class="btn btn-danger" @click="roleDelete">Confirm</button>
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
/* 修改这部分样式 */
.custom-modal {
  max-width: 700px;
  width: 100%;
  min-height: 600px;
}

.modal-body {
  height: 300px;
  overflow-y: auto;
  padding: 1.5rem;
}

/* 确保模态框内容区域有足够空间 */
.modal-content {
  min-height: 100%; /* 确保内容区域填满模态框 */
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
