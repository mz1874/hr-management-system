import {onMounted, reactive, ref} from "vue";
import {selectAllStaffs, searchStaff, deleteStaff as del, addStaff, editStaff} from "@/api/staff.ts";
import {isSuccess} from "@/utils/httpStatus.ts";
import type {Staff} from "@/interface/UserInterface.ts";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import type {StaffPagination} from "@/interface/StaffPaginationInterface.ts";

export default function useStaff() {
    const staffData = reactive<StaffPagination>({
        count: 0,
        next: null,
        previous: null,
        results: [],
        summary: {
            total_users: 0,
            inactive_users: 0,
            active_users: 0,
        },
    });

    const currentPage = ref(1);
    const searchName = ref("");
    const searchDepartmentId = ref<number | null>(null);
    const isSearching = ref(false);

    // 👉 数据映射
    function mapStaffData(item: any): Staff {
        return {
            id: item.id,
            username: item.username,
            date_of_birth: dayjs(item.date_of_birth).format("YYYY-MM-DD"),
            roles: item.roles,
            department: item.department,
            department_name: item.department_name,
            status: item.status,
            employment_time: dayjs(item.employment_time).format("YYYY-MM-DD"),
            resignationDate: undefined,
            numberOfLeaves: item.number_of_leave,
            medicalLeaves: item.medical_leave,
            annualLeaves: item.annual_leave,
            password:"",
            imgUrl: "",
            totalPoints: item.total_points,
            leave_entitlements: item.leave_entitlements,
        };
    }

    // 👉 更新 staffData
    function updateStaffData(res: any): void {
        staffData.count = res.count;
        staffData.next = res.next;
        staffData.previous = res.previous;
        staffData.summary = res.summary;
        staffData.results = res.results.map(mapStaffData);
    }

    // 👉 获取所有员工数据
    async function fetchAllStaffs(page = 1): Promise<void> {
        isSearching.value = false;
        try {
            const response = await selectAllStaffs(page);
            if (isSuccess(response.status)) {
                updateStaffData(response.data.data);
                currentPage.value = page;
            }
        } catch (error) {
            console.error("Failed to fetch staff:", error);
        }
    }

    function handlerAddStaff(staff: Staff) {
        console.log(staff.date_of_birth);
        addStaff(staff).then((res) => {
            if(isSuccess(res.status)) {
                console.log(res);
                fetchAllStaffs();
            }
        })
    }

    // 👉 删除员工
    async function deleteStaff(id: number): Promise<void> {
        try {
            const response = await del(id);
            if (isSuccess(response.status)) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Staff deleted successfully",
                    showConfirmButton: false,
                    timer: 1500,
                });
                fetchAllStaffs();
            } else {
                throw new Error(response.data);
            }
        } catch (error: any) {
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Operation failed: " + error.message,
                showConfirmButton: false,
                timer: 1500,
            });
        }
    }

    async function handlerEditStaff(staff: Staff) {
        try {
            const response = await editStaff(staff);
            if (isSuccess(response.status)) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Staff edited successfully",
                    showConfirmButton: false,
                    timer: 1500,
                });
                fetchAllStaffs();
            } else {
                throw new Error(response.data);
            }
        } catch (error) {
            console.error("Search failed:", error);
        }
    }

    // 👉 搜索员工
    async function search(staffName: string, departmentId: number | null = null, page = 1): Promise<void> {
        searchName.value = staffName;
        searchDepartmentId.value = departmentId;
        isSearching.value = true;

        try {
            const response = await searchStaff(staffName, departmentId, page);
            if (isSuccess(response.status)) {
                updateStaffData(response.data.data);
                currentPage.value = page;
            }
        } catch (error) {
            console.error("Search failed:", error);
        }
    }

    onMounted(() => {
        fetchAllStaffs();
    });

    return {
        isSearching,
        searchDepartmentId,
        searchName,
        currentPage,
        staffData,
        search,
        deleteStaff,
        fetchAllStaffs,
        handlerAddStaff,
        handlerEditStaff,
    };
}
