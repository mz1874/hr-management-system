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

    function mapStaffData(item: any): Staff {
        return {
            id: item.id,
            email:item.email,
            username: item.username,
            staffName: item.staffName,
            date_of_birth: dayjs(item.date_of_birth).format("YYYY-MM-DD"),
            roles: item.roles,
            department: item.department,
            department_name: item.department_name,
            status: item.status,
            employment_time: dayjs(item.employment_time).format("YYYY-MM-DD"),
            resignationDate: undefined,
            password:"",
            picture : item.picture_id,
            imgUrl: item.picture_url,
            totalPoints: item.total_points,
            currentPoints: item.current_points,
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
        addStaff(staff).then((res) => {
            if(isSuccess(res.status)) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Staff added successfully",
                    showConfirmButton: false,
                    timer: 1500,
                });
                fetchAllStaffs();
            }
        }).catch(error => {
            const res = error.response.data.data.error;
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: res,
                showConfirmButton: false,
                timer: 1500,
            });
            fetchAllStaffs();
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
