import {getAllRoles, deleteRoleByRoleId, addRole} from "@/api/role.ts";
import {ref, onMounted} from "vue";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import type {RoleItem} from "@/interface/RoleInterface.ts";
import {isSuccess} from "@/utils/httpStatus.ts";

export default function () {
    const tableData = ref<RoleItem[]>([]);

    const fetchRoles = () => {
        getAllRoles().then((res) => {
            const rawResults = res.data.data.results;
            tableData.value = rawResults.map((item: any) => ({
                id: item.id,
                name: item.name,
                permissions: item.permissions,
                createdOn: dayjs(item.create_time).format("YYYY-MM-DD"),
            }));
        });
    };

    const handleRoleAdd = (role: RoleItem) => {
        addRole(role).then((res) => {
            if (isSuccess(res.status)) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Role Added successfully",
                    showConfirmButton: false,
                    timer: 1500,
                });
                const item = res.data.data; // 直接取对象
                const tempRole: RoleItem = {
                    id: item.id,
                    name: item.name,
                    createdOn: item.create_time,
                    permissions: [],
                };
                tableData.value.unshift(tempRole);
            } else {
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: "Role Added field",
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        })
    }


    onMounted(() => {
        fetchRoles();
    });

    const handleDeleteRole = (id: number) => {
        return deleteRoleByRoleId(id).then((res) => {
            if (res.status === 204) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Role deleted successfully",
                    showConfirmButton: false,
                    timer: 1500,
                });
                fetchRoles();
            } else {
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: "Role deleted field",
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        });
    };

    return {tableData, handleDeleteRole, handleRoleAdd};
}
