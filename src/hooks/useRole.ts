import {
    deleteRoleByRoleId,
    addRole,
    searchByRoleName,
    editRole
} from "@/api/role.ts";
import { ref, onMounted, computed, reactive } from "vue";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import type { RoleItem } from "@/interface/RoleInterface.ts";
import { isSuccess } from "@/utils/httpStatus.ts";
import axios from "@/api/axios.ts";

export default function () {
    const tableData = ref<RoleItem[]>([]);
    const searchRole = ref('');

    const paginationInfo = reactive({
        next: null as string | null,
        previous: null as string | null,
        count: 0,
        currentUrl: "/api/role/?page=1",
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 1
    });

    // 提取分页 URL 中的页码
    const extractPageFromUrl = (url: string) => {
        const match = url.match(/page=(\d+)/);
        return match ? parseInt(match[1]) : 1;
    };

    // 通用的分页处理
    const fetchPage = async (url: string) => {
        try {
            const res = await axios.get(url);
            const rawResults = res.data.data.results;

            tableData.value = rawResults.map((item: any) => ({
                id: item.id,
                name: item.name,
                permissions: item.permissions,
                createdOn: dayjs(item.create_time).format("YYYY-MM-DD")
            }));

            const { next, previous, count } = res.data.data;
            paginationInfo.next = next;
            paginationInfo.previous = previous;
            paginationInfo.count = count;
            paginationInfo.currentUrl = url;
            paginationInfo.currentPage = extractPageFromUrl(url);
            paginationInfo.totalPages = Math.ceil(count / paginationInfo.itemsPerPage);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // 翻页操作
    const goToPage = (page: number) => {
        const url = searchRole.value
            ? `/api/role/search_by_name/?name=${encodeURIComponent(searchRole.value)}&page=${page}`
            : paginationInfo.currentUrl.replace(/([?&]page=)\d+/, `$1${page}`);
        fetchPage(url);
    };

    // 通用的成功提示函数
    const showAlert = (message: string, type: "success" | "error") => {
        Swal.fire({
            position: "top-end",
            icon: type,
            title: message,
            showConfirmButton: false,
            timer: 1500
        });
    };

    // 添加角色
    const handleRoleAdd = async (role: RoleItem) => {
        try {
            const res = await addRole(role);
            if (isSuccess(res.status)) {
                showAlert("Role Added successfully", "success");
                fetchPage(paginationInfo.currentUrl); // 刷新当前页
            } else {
                showAlert("Role Add failed", "error");
            }
        } catch (error: any) {
            console.error('Error adding role:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
            showAlert(`Role Add failed: ${errorMessage}`, "error");
        }
    };


    // 删除角色
    const handleDeleteRole = async (id: number) => {
        try {
            const res = await deleteRoleByRoleId(id);
            if (res.status === 204) {
                showAlert("Role deleted successfully", "success");
                fetchPage(paginationInfo.currentUrl); // 刷新当前页
            } else {
                showAlert("Role delete failed", "error");
            }
        } catch (error) {
            showAlert("Role delete failed", "error");
        }
    };

    // 搜索角色
    const handleSearchByStaffName = async (name: string, page: number = 1) => {
        try {
            const res = await searchByRoleName(name, page);
            if (isSuccess(res.status)) {
                const rawResults = res.data.data.results;
                tableData.value = rawResults.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    permissions: item.permissions,
                    createdOn: dayjs(item.create_time).format("YYYY-MM-DD")
                }));

                paginationInfo.next = res.data.data.next;
                paginationInfo.previous = res.data.data.previous;
                paginationInfo.count = res.data.data.count;

                paginationInfo.currentUrl = `/api/role/search_by_name/?name=${encodeURIComponent(name)}`;
                paginationInfo.currentPage = page;
                paginationInfo.totalPages = Math.ceil(paginationInfo.count / paginationInfo.itemsPerPage);
            }
        } catch (error) {
            console.error('Error searching role:', error);
        }
    };

    // 编辑角色
    const handleRoleEdit = async (role: RoleItem) => {
        try {
            const res = await editRole(role);
            if (isSuccess(res.status)) {
                showAlert("Role edited successfully", "success");
            } else {
                showAlert("Role edit failed", "error");
            }
        } catch (error) {
            showAlert("Role edit failed", "error");
        }
    };

    // 初始加载第一页数据
    onMounted(() => {
        fetchPage("/api/role/?page=1");
    });

    return {
        tableData,
        handleDeleteRole,
        handleRoleAdd,
        paginationInfo,
        nextPage: () => fetchPage(paginationInfo.next!),
        prevPage: () => fetchPage(paginationInfo.previous!),
        searchRole,
        goToPage,
        count: computed(() => paginationInfo.count),
        currentPage: computed(() => paginationInfo.currentPage),
        totalPages: computed(() => paginationInfo.totalPages),
        handleSearchByStaffName,
        handleRoleEdit
    };
}
