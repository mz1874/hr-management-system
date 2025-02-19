<script setup lang="ts">
import { ref } from 'vue'

interface RouteItem {
  id: number
  parentId: number | null
  name: string
  order: number
  path: string  
  type: 'directory' | 'menu' | 'button'
  visible: boolean
  permission: string
  children?: RouteItem[]
}

const tableData = ref<RouteItem[]>([
  {
    id: 1,
    parentId: null,
    name: 'System Management',
    order: 1,
    path: '/system',
    type: 'directory',
    visible: true,
    permission: 'system',
    children: [
      {
        id: 2,
        parentId: 1,
        name: 'User Management',
        order: 1,
        path: '/system/user',
        type: 'menu',
        visible: true,
        permission: 'system:user'
      },
      {
        id: 3,
        parentId: 1,
        name: 'Role Management',
        order: 2,
        path: '/system/role',
        type: 'menu',
        visible: true,
        permission: 'system:role'
      }
    ]
  }
])

const showModal = ref(false)
const currentRoute = ref<Partial<RouteItem>>({})
const modalType = ref<'add' | 'edit' | 'addChild'>('add')
const expandedIds = ref<number[]>([])

// 生成唯一ID
let nextId = 4
const generateId = () => nextId++

// 切换展开状态
const toggleExpand = (id: number) => {
  const index = expandedIds.value.indexOf(id)
  if (index > -1) {
    expandedIds.value.splice(index, 1)
  } else {
    expandedIds.value.push(id)
  }
}

// 扁平化树形数据用于表格展示
const flattenRoutes = (routes: RouteItem[], level = 0): any[] => {
  return routes.reduce<RouteItem[]>((acc, route) => {
    const isExpanded = expandedIds.value.includes(route.id)
    const children = route.children && isExpanded ? flattenRoutes(route.children, level + 1) : []
    return [
      ...acc,
      { ...route, level, hasChildren: !!route.children?.length },
      ...children
    ]
  }, [])
}

// 查找路由及其父级
const findRoute = (routes: RouteItem[], id: number): RouteItem | null => {
  for (const route of routes) {
    if (route.id === id) return route
    if (route.children) {
      const found = findRoute(route.children, id)
      if (found) return found
    }
  }
  return null
}

// 添加路由
const addRoute = (newRoute: RouteItem) => {
  if (newRoute.parentId) {
    const parent = findRoute(tableData.value, newRoute.parentId)
    if (parent) {
      if (!parent.children) parent.children = []
      parent.children.push(newRoute)
    }
  } else {
    tableData.value.push(newRoute)
  }
}

// 更新路由
const updateRoute = (updatedRoute: RouteItem) => {
  const route = findRoute(tableData.value, updatedRoute.id)
  if (route) {
    Object.assign(route, updatedRoute)
  }
}   

// 处理添加根路由
const handleAddRoot = () => {
  currentRoute.value = {
    id: generateId(),
    parentId: null,
    name: '',
    order: 1,
    path: '',
    type: 'directory',
    visible: true,
    permission: ''
  }
  modalType.value = 'add'
  showModal.value = true
}

// 处理添加子路由
const handleAddChild = (parent: RouteItem) => {
  currentRoute.value = {
    id: generateId(),
    parentId: parent.id,
    name: '',
    order: 1,
    path: '',
    type: parent.type === 'directory' ? 'menu' : 'button',
    visible: true,
    permission: ''
  }
  modalType.value = 'addChild'
  showModal.value = true
}

// 处理编辑路由
const handleEdit = (route: RouteItem) => {
  currentRoute.value = { ...route }
  modalType.value = 'edit'
  showModal.value = true
}

// 处理删除路由
const handleDelete = (id: number) => {
  if (confirm('确定要删除该路由吗？')) {
    tableData.value = deleteRoute(tableData.value, id)
  }
}

// 删除路由
const deleteRoute = (routes: RouteItem[], id: number): RouteItem[] => {
  return routes.filter(route => {
    if (route.id === id) return false
    if (route.children) {
      route.children = deleteRoute(route.children, id)
    }
    return true
  })
}

// 处理表单提交
const handleSubmit = () => {
  if (!currentRoute.value) return

  const route = {
    ...currentRoute.value,
    id: currentRoute.value.id || generateId(),
    order: currentRoute.value.order || 1,
    visible: currentRoute.value.visible || false,
    permission: currentRoute.value.permission || ''
  } as RouteItem

  if (modalType.value === 'edit') {
    updateRoute(route)
  } else {
    addRoute(route)
  }

  showModal.value = false
}
</script>

<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between mb-3">
      <h2>Router management</h2>
      <button class="btn btn-primary" @click="handleAddRoot">
        <i class="bi bi-plus-lg"></i> Add root router
      </button>
    </div>

    <table class="table table-hover table-bordered">
      <thead class="table-light">
      <tr>
        <th style="width: 30px"></th>
        <th>Menu Name</th>
        <th style="width: 80px">Sort</th>
        <th>Request Path</th>
        <th style="width: 100px">Type</th>
        <th style="width: 100px">Visible</th>
        <th>Authentication symbol</th>
        <th style="width: 180px">Operation</th>
      </tr>
      </thead>
      <tbody>
      <template v-for="item in flattenRoutes(tableData)" :key="item.id">
        <tr>
          <td>
            <i v-if="item.hasChildren"
               class="bi cursor-pointer"
               :class="expandedIds.includes(item.id) ? 'bi-caret-down-fill' : 'bi-caret-right-fill'"
               @click="toggleExpand(item.id)"></i>
          </td>
          <td>
              <span :style="{ 'margin-left': `${item.level * 20}px` }">
                {{ item.name }}
              </span>
          </td>
          <td>{{ item.order }}</td>
          <td>{{ item.path }}</td>
          <td>
              <span class="badge" :class="{
                'bg-primary': item.type === 'directory',
                'bg-success': item.type === 'menu',
                'bg-secondary': item.type === 'button'
              }">
                {{ { directory: 'directory', menu: 'menu', button: 'button' }[item.type] }}
              </span>
          </td>
          <td>
            <i class="bi" :class="item.visible ? 'bi-eye-fill text-success' : 'bi-eye-slash-fill text-danger'"></i>
          </td>
          <td>{{ item.permission }}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1"
                    @click="handleAddChild(item)"
                    v-if="item.type !== 'button'">
              <i class="bi bi-plus"></i>
            </button>
            <button class="btn btn-sm btn-outline-warning me-1" @click="handleEdit(item)">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" @click="handleDelete(item.id)">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      </template>
      </tbody>
    </table>

    <!-- 编辑/新增模态框 -->
    <div class="modal fade" :class="{ show: showModal }" style="display: block" v-if="showModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ modalType === 'edit' ? 'Edit router' : 'Add router' }}
            </h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label">Menu name</label>
                <input type="text" class="form-control" v-model="currentRoute.name" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Sort</label>
                <input type="number" class="form-control" v-model="currentRoute.order" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Request path</label>
                <input type="text" class="form-control" v-model="currentRoute.path">
              </div>
              <div class="mb-3">
                <label class="form-label">type</label>
                <select class="form-select" v-model="currentRoute.type">
                  <option value="directory">directory</option>
                  <option value="menu">menu</option>
                  <option value="button">button</option>
                </select>
              </div>
              <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" v-model="currentRoute.visible">
                <label class="form-check-label">visible</label>
              </div>
              <div class="mb-3">
                <label class="form-label">Authorization symbol</label>
                <input type="text" class="form-control" v-model="currentRoute.permission" required>
              </div>
              <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-secondary me-2" @click="showModal = false">cancel</button>
                <button type="submit" class="btn btn-primary">save</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showModal"></div>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.table tr td:first-child {
  position: relative;
}
</style>
