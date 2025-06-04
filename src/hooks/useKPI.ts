import {onMounted, ref} from "vue";
import {selectAllKpis} from "@/api/kpiAdmin.ts";
import dayjs from "dayjs";
import {isSuccess} from "@/utils/httpStatus.ts";

export default function () {
    const kpiData = ref<any[]>([]);
    const count = ref(0);
    const currentPage = ref(1);

    /* 获取所有KPI, 不分页 */
    async function handlerFetchKpis(filters: any = {}) {
        try {
            const params = {page: filters.page || 1, ...filters};
            const res = await selectAllKpis(params);
            if (isSuccess(res.status)) {
                const rawResults = res.data.data.results;
                kpiData.value = rawResults.map((item: any) => ({
                    id: item.id,
                    taskTitle: item.task_title,
                    taskDescription: item.task_description,
                    startDate: dayjs(item.task_start_date).format("YYYY-MM-DD"),
                    endDate: dayjs(item.task_completion_date).format("YYYY-MM-DD"),
                    pointsGiven: item.points_earned,
                    status: item.kpi_status,
                    totalTarget: item.target_unit,
                    individualUnit: item.individual_unit,
                    createdOn: dayjs(item.create_time, "DD.MM.YYYY HH:mm:ss").format("YYYY-MM-DD"),
                    assignedUsers: item.assignedUsers || [],
                    department: item.department_name,
                    department_id: item.department,
                    seventy_percent: item.seventy_percent,
                    ninety_percent: item.ninety_percent,
                    hundred_percent: item.hundred_percent,
                    personal_details: item.personal_details,
                    hundred_twenty_percent: item.hundred_twenty_percent,
                }));
                count.value = res.data.data.count;
                currentPage.value = filters.page;
            } else {
                console.error("接口返回失败：", res);
            }
        } catch (error) {
            console.error("请求错误：", error);
        }
    }

    onMounted(() => {
        handlerFetchKpis({page: 1});
    });

    return {
        currentPage,
        count,
        kpiData,
        handlerFetchKpis
    };
}
