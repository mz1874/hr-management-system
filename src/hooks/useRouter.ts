import {onMounted, ref} from "vue";
import type {RouteItem} from "@/interface/RouteInterface.ts";
import {getMenuRoutes, addMenuRoute, deleteMenuRoute} from "@/api/Router.ts";
import {isSuccess} from "@/utils/httpStatus.ts";
import Swal from "sweetalert2";

export default function () {
    const tableData = ref<RouteItem[]>([]);

    async function fetchRouterMenu() {
        try {
            const res = await getMenuRoutes();
            if (isSuccess(res.status)) {
                // 使用map函数来格式化和插入数据
                const formattedData = res.data.data.map((item: any) => {
                    // 格式化每个菜单项为RouteItem类型
                    const routeItem: RouteItem = {
                        id: item.id,
                        parent: 0,
                        name: item.name,
                        order: item.order,
                        path: item.path,
                        hidden: item.hidden,
                        code: item.code,
                        description: item.description,
                        component: item.component,
                        icon: item.icon || "", // 默认没有图标
                        children: item.children && item.children.length > 0
                            ? item.children.map((child: any) => ({
                                id: child.id,
                                parent: item.id,
                                name: child.name,
                                order: item.order,
                                path: child.path,
                                hidden: child.hidden,
                                code: child.code,
                                description: item.description,
                                component: child.component,
                                icon: child.icon || "",
                                children: []
                            }))
                            : []
                    };
                    console.log(item.hidden);
                    return routeItem;
                });
                tableData.value = formattedData;
            }
        } catch (error) {
            console.error("Error fetching menu routes:", error);
        }
    }

    async function handlerAddRoute(route: RouteItem) {
        try {
            const res = await addMenuRoute(route);
            if (isSuccess(res.status)) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Your work has been saved",
                    showConfirmButton: false,
                    timer: 1500
                });
                fetchRouterMenu();
            }
        } catch (error) {
            console.error("Error adding route:", error);
        }
    }

    async function handlerDeleteRoute(id: number) {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: "btn btn-success",
                cancelButton: "btn btn-danger"
            },
            buttonsStyling: false
        });

        swalWithBootstrapButtons.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete!",
            cancelButtonText: "Cancel!",
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await deleteMenuRoute(id);
                    if (isSuccess(res.status)) {
                        swalWithBootstrapButtons.fire({
                            title: "Deleted!",
                            text: "The router has been deleted.",
                            icon: "success"
                        });
                        fetchRouterMenu();
                    }
                } catch (error: any) {
                    swalWithBootstrapButtons.fire({
                        title: "Delete failed !",
                        text: "This route could not be deleted as it has child's",
                        icon: "error"
                    });
                }
            }
        });
    }


    onMounted(() => {
        fetchRouterMenu();
        console.log(tableData)
    });

    return {
        tableData,
        handlerAddRoute,
        handlerDeleteRoute
    }
}
