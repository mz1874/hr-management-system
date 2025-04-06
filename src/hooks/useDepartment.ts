import { ref, onMounted } from 'vue'
import type { Department } from '@/interface/DepartmentInterface.ts'
import { selectAllDepartments } from '@/api/department.ts'

export default function () {
    const departments = ref<Department[]>([])

    // Map data to Department list
    const mapToDepartment = (item: any): Department => {
        return {
            id: item.id,
            parentId: item.parent_department,
            name: item.department_name,
            sorting: item.sorting,
            status: item.department_status === '1' ? 'NORMAL' : 'ON HOLD',
            creationTime: item.department_created_date,
            children: []
        }
    }

    // 构建部门树
    const buildDepartmentTree = (flatList: Department[]): Department[] => {
        const idMap = new Map<number, Department>()

        flatList.forEach(dept => {
            idMap.set(dept.id, dept)
        })

        const tree: Department[] = []

        flatList.forEach(dept => {
            if (dept.parentId !== null && idMap.has(dept.parentId)) {
                const parent = idMap.get(dept.parentId)!
                parent.children = parent.children || []
                parent.children.push(dept)
            } else {
                tree.push(dept)
            }
        })
        return tree
    }

    /* 查询所有的部门信息 */
    onMounted(() => {
        selectAllDepartments().then((data) => {
            if (data.status === 200) {
                const rawList = data.data.data.results
                const mappedList: Department[] = rawList.map(mapToDepartment)
                departments.value = buildDepartmentTree(mappedList)
            }
        })
    })

    return { departments }
}
