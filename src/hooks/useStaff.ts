import {onMounted, reactive, ref} from "vue";
import {selectAllStaffs, searchStaff, deleteStaff as del} from '@/api/staff.ts';
import {isSuccess} from "@/utils/httpStatus.ts";
import type {Staff} from "@/interface/UserInterface.ts";
import dayjs from "dayjs";
import Swal from "sweetalert2";

interface StaffPagination {
    count: number;
    next: string | null;
    previous: string | null;
    results: Staff[];
}

export default function () {
    const staffData = reactive<StaffPagination>({
        count: 0,
        next: null,
        previous: null,
        results: []
    });
    const currentPage = ref(1)

    /* 获取所有用户数据 */
    function fetchAllStaffs(page: number = 1): void {
        selectAllStaffs(page).then((response) => {
            if (isSuccess(response.status)) {
                const res = response.data.data;
                staffData.count = res.count;
                staffData.next = res.next;
                staffData.previous = res.previous;
                staffData.results = res.results.map((item: any) => ({
                    id: item.id,
                    name: item.username,
                    dateOfBirth: dayjs(item.date_of_birt).format("YYYY-MM-DD"),
                    role: item.roles?.[0] ? String(item.roles[0]) : '', // 或用后续role映射表
                    department: item.department ? String(item.department) : '',
                    department_name: item.department_name,
                    status: item.status,
                    employmentDate: dayjs(item.employment_time).format("YYYY-MM-DD"),
                    resignationDate: undefined, // 后端未提供，预设为 undefined
                    numberOfLeaves: item.number_of_leave,
                    medicalLeaves: item.medical_leave,
                    annualLeaves: item.annual_leave,
                }));
            }
            currentPage.value = page;
        });
    }


    function deleteStaff(id: number): void {
        del(id).then((response) => {
            if (isSuccess(response.status)) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Department successfully added",
                    showConfirmButton: false,
                    timer: 1500,
                });
                fetchAllStaffs();
            } else {
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: "Operation failed : " + response.data,
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        })
    }


    function search(staffName: string): any {
        searchStaff(staffName).then((response) => {
            if (isSuccess(response.status)) {
                console.log(response);
            }
        })
    }

    onMounted(() => {
        fetchAllStaffs();
    });

    return {
        currentPage,
        staffData,
        search,
        deleteStaff,
        fetchAllStaffs
    };
}
