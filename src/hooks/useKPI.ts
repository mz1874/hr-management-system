import {ref} from "vue";
import {selectAllKpis} from "@/api/kpiAdmin.ts";
import dayjs from "dayjs";
import {isSuccess} from "@/utils/httpStatus.ts";

export default function () {
    const kpiData = ref<any[]>([]);
    const count = ref(0);
    const currentPage = ref(1)
    /*获取所有KPI, 不分页*/
    function fetchKpis(page: number = 1) {
        selectAllKpis(page).then((res) => {
            if (isSuccess(res.status)) {
                const rawResults = res.data.data.results;
                kpiData.value = rawResults.map((item: any) => {
                    return {
                        id: item.id,
                        taskTitle: item.task_title,
                        taskDescription: item.task_description,
                        startDate: dayjs(item.task_start_date).format("YYYY-MM-DD"),
                        // startDate: item.task_start_date,
                        endDate: dayjs(item.task_completion_date).format("YYYY-MM-DD"),
                        pointsGiven: item.points_earned,
                        status: item.kpi_status,  // KPI状态
                        totalTarget: item.target_unit,
                        individualUnit: item.individual_unit,
                        createdOn: dayjs(item.create_time, "DD.MM.YYYY HH:mm:ss").format("YYYY-MM-DD"),
                        assignedUsers: item.assignedUsers || [],
                        department: item.department_name, // 直接使用API返回的部门名称
                        department_id: item.department
                    };
                });
            }
            count.value = res.data.data.count;
            currentPage.value = page;
        })
    }

    return {
        currentPage,
        count,
        kpiData,
        fetchKpis
    }
}