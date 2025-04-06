import {ref, onMounted} from 'vue'
import type {Department} from '@/interface/DepartmentInterface.ts'
import {selectAllDepartments, addDepartment} from '@/api/department.ts'
import dayjs from "dayjs";
import Swal from "sweetalert2";


export default function () {
    const departments = ref<Department[]>([])
    const flatDepartmentList = ref<Department[]>([])       // 扁平化结构

    // Map data to Department list
    const mapToDepartment = (item: any): Department => {
        return {
            id: item.id,
            parentId: item.parent_department,
            department_name: item.department_name,
            sorting: item.sorting,
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

    function fetchDepartments() {
        selectAllDepartments().then((data) => {
            if (data.status === 200) {
                const rawList = data.data.data.results
                const mappedList: Department[] = rawList.map(mapToDepartment)
                flatDepartmentList.value = mappedList
                departments.value = buildDepartmentTree(mappedList)
            }
        })
    }

    // 查询所有的部门信息
    onMounted(() => {
        fetchDepartments();
    })

    function departmentAdd(department: Department) {
        addDepartment(department).then((res) => {
            if (res.status === 201) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Department successfully Added",
                    showConfirmButton: false,
                    timer: 1500,
                });
                fetchDepartments();
            }
        })
    }

    return {departments, flatDepartmentList, departmentAdd}
}
