import { getAllRoles, deleteRoleByRoleId } from "@/api/role.ts";
import { ref, onMounted } from "vue";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import type {RoleItem} from  "@/interface/RoleInterface.ts";

export default function () {
    const tableData = ref<RoleItem[]>([]);

    const fetchRoles = () => {
        getAllRoles().then((res) => {
            const rawResults = res.data.data.results;
            tableData.value = rawResults.map((item: any) => ({
                id: item.id,
                roleName: item.name,
                permissions: item.permissions,
                createdOn: dayjs(item.create_time).format("YYYY-MM-DD"),
            }));
        });
    };

    onMounted(fetchRoles);

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
            }else {
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

    return { tableData, handleDeleteRole };
}
