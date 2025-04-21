<script setup lang="ts">
import {ref} from 'vue'
import type {RouteItem} from "@/interface/RouteInterface.ts";
import useRouter from "@/hooks/useRouter.ts";

const {tableData,handlerAddRoute, handlerDeleteRoute} = useRouter();

const showModal = ref(false)
const currentRoute = ref<Partial<RouteItem>>({})
const modalType = ref<'add' | 'edit' | 'addChild'>('add')
const expandedIds = ref<number[]>([])

/*是否为添加子路由的方式*/
const ifAddSubRouter = ref<boolean>(false)

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

let menuType = ref(0)

function handleParentRouteChange()
{

}

// 扁平化树形数据用于表格展示
const flattenRoutes = (routes: RouteItem[], level = 0): any[] => {
  return routes.reduce<RouteItem[]>((acc, route) => {
    const isExpanded = expandedIds.value.includes(route.id)
    const children = route.children && isExpanded ? flattenRoutes(route.children, level + 1) : []
    return [
      ...acc,
      {...route, level, hasChildren: !!route.children?.length},
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
  handlerAddRoute(newRoute)
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
  ifAddSubRouter.value = false;
  currentRoute.value = {
    id: generateId(),
    parent: null, // 根路由的parentId为0
    name: '',
    order: 1,
    path: '',
    hidden: true,
    code: '', // 新增字段
    description: '', // 新增字段
    component: '', // 新增字段
    icon: '', // 新增字段
  }
  modalType.value = 'add'
  showModal.value = true
}

// 处理添加子路由
const handleAddChild = (parent: RouteItem) => {
  ifAddSubRouter.value = true;
  currentRoute.value = {
    id: generateId(),
    parent: parent.id,
    name: '',
    order: 1,
    path: '',
    hidden: true,
    code: '',
    description: '',
    component: '',
    icon: '',
  }
  modalType.value = 'addChild'
  showModal.value = true
}

// 处理编辑路由
const handleEdit = (route: RouteItem) => {
  currentRoute.value = {...route}
  modalType.value = 'edit'
  showModal.value = true
}

// 处理删除路由
const handleDelete = (id: number) => {
  handlerDeleteRoute(id);
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
    hidden: !currentRoute.value.hidden || false,
  } as RouteItem

  if (modalType.value === 'edit') {
    updateRoute(route)
  } else {
    console.log(route)

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
        <th style="width: 100px">Visible</th>
        <th>Authentication symbol</th>
        <th>Has Parent Route</th> <!-- 新增列 -->
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
            <i class="bi" :class="!item.hidden ? 'bi-eye-fill text-success' : 'bi-eye-slash-fill text-danger'"></i>
          </td>
          <td>{{ item.permission }}</td>
          <td>
            <!-- 判断是否有父路由 -->
            <i v-if="item.level > 0" class="bi bi-check-circle text-success"></i>
            <i v-else class="bi bi-x-circle text-danger"></i>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1"
                    @click="handleAddChild(item)"
                    v-if="item.type !== 'button'">
              <i class="bi bi-plus"></i>
            </button>
<!--            <button class="btn btn-sm btn-outline-warning me-1" @click="handleEdit(item)">-->
<!--              <i class="bi bi-pencil"></i>-->
<!--            </button>-->
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
      <div class="modal-dialog modal-dialog-centered modal-lg" style="max-width: 800px; width: 90%;">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ modalType === 'edit' ? 'Edit router' : 'Add router' }}
            </h5>
            <button type="button" class="btn-close" @click="showModal = false"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class=" mb-3">
                <label class="form-label">Router Type</label>
                <select class="form-select" v-model.number="menuType" @change="handlerChangeMenuType">
                  <option value="0">Menu</option>
                  <option value="1">Router</option>
                </select>
              </div>
              <!-- 基本信息部分 -->
              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label">Menu name</label>
                  <input type="text" class="form-control" v-model="currentRoute.name" required>
                </div>
                <div class="col-6 mb-3">
                  <label class="form-label">Sort</label>
                  <input type="number" class="form-control" v-model="currentRoute.order" required>
                </div>
              </div>

              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label">Request path</label>
                  <input type="text" :disabled="!menuType" class="form-control" v-model="currentRoute.path" required>
                </div>
                <!-- 其他参数部分 -->
                <div class="col-6 mb-3">
                  <label class="form-label">Code</label>
                  <input type="text" class="form-control" v-model="currentRoute.code" required>
                </div>
              </div>


              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label">Description</label>
                  <input type="text" class="form-control" v-model="currentRoute.description" required>
                </div>
                <div class="col-6 mb-3">
                  <label class="form-label">Component</label>
                  <input type="text"  :disabled="!menuType" class="form-control" v-model="currentRoute.component" required>
                </div>
              </div>

              <div class="row">
<!--                <div class="col-6 mb-3">-->
<!--                  <label class="form-label">Icon</label>-->
<!--                  <input type="text" class="form-control" v-model="currentRoute.icon">-->
<!--                </div>-->
                <!-- 如果有父路由，则显示父路由选择列表 -->
                <div v-if="menuType && ! ifAddSubRouter" class="col-12 mb-3">
                  <label class="form-label">Select Parent Route</label>
                  <select class="form-select" v-model="currentRoute.parent">
                    <option v-for="parent in tableData" :key="parent.id" :value="parent.id">{{ parent.name }}</option>
                  </select>
                </div>
              </div>

              <!-- 显示设置部分 -->
              <div class="col-6 mb-3 form-check">
                <input type="checkbox" class="form-check-input" v-model="currentRoute.hidden">
                <label class="form-check-label">Visible</label>
              </div>
              <!-- 父路由部分 -->
              <div class="d-flex justify-content-end">
                <button type="button" class="btn btn-secondary me-2" @click="showModal = false">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
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
