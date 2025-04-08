import { onMounted, reactive } from "vue";
import { selectAllStaffs } from '@/api/staff.ts';
import { isSuccess } from "@/utils/httpStatus.ts";
import type { Staff } from "@/interface/UserInterface.ts";

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

    /* 获取所有用户数据 */
    function fetchAllStaffs(): void {
        selectAllStaffs().then((response) => {
            if (isSuccess(response.status)) {
                const res = response.data.data;
                console.log(res);
                staffData.count = res.count;
                staffData.next = res.next;
                staffData.previous = res.previous;

                staffData.results = res.results.map((item: any) => ({
                    id: item.id,
                    name: item.username,
                    dateOfBirth: item.date_of_birth,
                    role: item.roles?.[0] ? String(item.roles[0]) : '', // 或用后续role映射表
                    department: item.department ? String(item.department) : '',
                    status: item.status ? 'Active' : 'Inactive',
                    employmentDate: item.employment_time,
                    resignationDate: undefined, // 后端未提供，预设为 undefined
                    numberOfLeaves: item.number_of_leave,
                    medicalLeaves: item.medical_leave,
                    annualLeaves: item.annual_leave,
                }));
            }
        });
    }

    onMounted(() => {
        fetchAllStaffs();
        console.log(JSON.stringify(staffData));
    });

    return { fetchAllStaffs, staffData };
}
