import {selectPersonalKPI} from "@/api/PersonalKPI.ts";
import {reactive, ref, onMounted} from "vue";
import type {PersonalKPIInterface} from "@/interface/PersonalKPIInterface.ts";

export default function () {
    const tableData = reactive<PersonalKPIInterface[]>([]);
    let count = ref(0);
    let nextPage = ref(null);
    let previous = ref(null);
    let ongoing = ref(0);
    let delayed = ref(0);
    let done = ref(0);

    async function fetchPersonalKPI(page: number = 1, search: string = '') {
        try {
            const res = await selectPersonalKPI(page, search);
            count.value = res.data.data.count;
            nextPage.value = res.data.data.nextPage;
            previous.value = res.data.data.previousPage;
            ongoing.value = res.data.data.summary.ongoing;
            delayed.value = res.data.data.summary.delayed;
            done.value = res.data.data.summary.completed;

            // 清空现有数据
            tableData.splice(0, tableData.length);

            const mappedData = res.data.data.results.map((item): PersonalKPIInterface => {
                return {
                    id: item.id,
                    kpi_title: item.kpi_title,
                    target_unit: item.target_unit,
                    completed_unit: item.completed_unit,
                    task_start_date: item.kpi.task_start_date,
                    task_completion_date: item.kpi.task_completion_date,
                    individual_unit: item.kpi.individual_unit,
                    current_status: item.current_status
                };
            });

            tableData.push(...mappedData);
        } catch (err) {
            console.error("获取KPI数据失败:", err);
        }
    }


    onMounted(() => {
        fetchPersonalKPI();
    });

    return {
        tableData,
        count,
        nextPage,
        previous,
        fetchPersonalKPI,
        ongoing,
        delayed,
        done,
    };
}