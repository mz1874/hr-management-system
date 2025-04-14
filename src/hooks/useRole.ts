import { getAllRoles, deleteRoleByRoleId, addRole } from "@/api/role.ts";
import { ref, onMounted, computed, reactive } from "vue";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import type { RoleItem } from "@/interface/RoleInterface.ts";
import { isSuccess } from "@/utils/httpStatus.ts";
import axios from "@/api/axios.ts";

export default function () {
    const tableData = ref<RoleItem[]>([]);

    const paginationInfo = reactive({
        next: null as string | null,
        previous: null as string | null,
        count: 0,
        currentUrl: "/api/role/?page=1",
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 1
    });

    // 解析 page 参数从 URL 中
    const extractPageFromUrl = (url: string) => {
        const match = url.match(/page=(\d+)/);
        return match ? parseInt(match[1]) : 1;
    };

    const fetchPage = async (url: string) => {
        const res = await axios.get(url);
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
        paginationInfo.currentUrl = url;
        paginationInfo.currentPage = extractPageFromUrl(url);
        paginationInfo.totalPages = Math.ceil(paginationInfo.count / paginationInfo.itemsPerPage);
    };

    const nextPage = () => {
        if (paginationInfo.next) {
            fetchPage(paginationInfo.next);
        }
    };

    const prevPage = () => {
        if (paginationInfo.previous) {
            fetchPage(paginationInfo.previous);
        }
    };

    const goToPage = (page: number) => {
        const url = `/api/role/?page=${page}`;
        fetchPage(url);
    };

    const handleRoleAdd = (role: RoleItem) => {
        addRole(role).then((res) => {
            if (isSuccess(res.status)) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Role Added successfully",
                    showConfirmButton: false,
                    timer: 1500
                });

                // 重新刷新当前页
                fetchPage(paginationInfo.currentUrl);
            } else {
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: "Role Add failed",
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        });
    };

    const handleDeleteRole = (id: number) => {
        return deleteRoleByRoleId(id).then((res) => {
            if (res.status === 204) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Role deleted successfully",
                    showConfirmButton: false,
                    timer: 1500
                });
                // 重新刷新当前页
                fetchPage(paginationInfo.currentUrl);
            } else {
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: "Role delete failed",
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        });
    };

    onMounted(() => {
        fetchPage("/api/role/?page=1");
    });

    return {
        tableData,
        handleDeleteRole,
        handleRoleAdd,
        fetchPage,
        paginationInfo,
        nextPage,
        prevPage,
        goToPage,
        count: computed(() => paginationInfo.count),
        currentPage: computed(() => paginationInfo.currentPage),
        totalPages: computed(() => paginationInfo.totalPages)
    };
}
