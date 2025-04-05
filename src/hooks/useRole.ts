import { getAllRoles } from "@/api/role.ts";
import { ref, onMounted } from "vue";
import dayjs from "dayjs";

export default function () {
    interface RoleItem {
        id: number;
        roleName: string;
        permissions: string[]; // 当前角色拥有的权限
        createdOn: string; // 创建日期
    }

    const tableData = ref<RoleItem[]>([]);

    onMounted(() => {
        getAllRoles().then((res) => {
            const rawResults = res.data.data.results;
            tableData.value = rawResults.map((item: any) => ({
                id: item.id,
                roleName: item.name,
                permissions: item.permissions,
                createdOn: dayjs(item.create_time).format('YYYY-MM-DD HH:mm:ss'),
            }));
        });
    });

    return { tableData };
}
