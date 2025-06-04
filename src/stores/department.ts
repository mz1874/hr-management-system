// stores/useDepartmentStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Department } from '@/interface/DepartmentInterface.ts'
import {
    selectAllDepartments,
    addDepartment,
    deleteDepartment,
    updateDepartment
} from '@/api/department.ts'
import { isSuccess } from '@/utils/httpStatus.ts'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'

export const useDepartmentStore = defineStore('department', () => {
    const departments = ref<Department[]>([])
    const flatDepartmentList = ref<Department[]>([])

    const mapToDepartment = (item: any): Department => {
        return {
            id: item.id,
            parentId: item.parent_department,
            department_name: item.department_name,
            sorting: item.sorting,
            creationTime: dayjs(item.department_created_date).format('YYYY-MM-DD'),
            children: []
        }
    }

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

    const fetchDepartments = async () => {
        const data = await selectAllDepartments()
        if (isSuccess(data.status)) {
            const rawList = data.data.data.results
            const mappedList: Department[] = rawList.map(mapToDepartment)
            flatDepartmentList.value = mappedList
            departments.value = buildDepartmentTree(mappedList)
        }
    }

    const patchDepartment = async (id: number, department: any) => {
        const res = await updateDepartment(id, department)
        if (isSuccess(res.status)) {
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Department successfully updated',
                showConfirmButton: false,
                timer: 1500
            })
            fetchDepartments()
        }
    }

    const departmentAdd = async (department: Department) => {
        try {
            const res = await addDepartment(department);

            if (isSuccess(res.status)) {
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Department successfully added',
                    showConfirmButton: false,
                    timer: 1500
                });
                fetchDepartments();
            } else {
                Swal.fire({
                    position: 'top-end',
                    icon: 'error',
                    title: 'Failed to add department',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        } catch (error) {
            console.error('Error adding department:', error);
            Swal.fire({
                position: 'top-end',
                icon: 'error',
                title: 'Operation Failed, department name should be unique!',
                showConfirmButton: false,
                timer: 1500
            });
        }
    };


    const departmentDelete = async (id: number) => {
        const res = await deleteDepartment(id)
        if (isSuccess(res.status)) {
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Department successfully deleted',
                showConfirmButton: false,
                timer: 1500
            })
            fetchDepartments()
        }
    }

    return {
        departments,
        flatDepartmentList,
        fetchDepartments,
        departmentAdd,
        departmentDelete,
        patchDepartment
    }
})
