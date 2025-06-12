<template>
  <div class="d-flex flex-column min-vh-100">
    <main class="flex-grow-1">
      <div class="mb-4">
        <h2>Report Generation</h2>
      </div>
      <div class="row">
        <div class="col-md-3 mb-3">
          <label class="form-label">Department</label>
          <select class="form-select" v-model="selectedDept">
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.department_name }}
            </option>
          </select>
        </div>

        <div class="col-md-3 mb-3">
          <label class="form-label">Start Date</label>
          <input type="date" v-model="startDate" class="form-control"/>
        </div>

        <div class="col-md-3 mb-3">
          <label class="form-label">End Date</label>
          <input type="date" v-model="endDate" class="form-control"/>
        </div>

        <div class="col-md-3 mb-3 d-flex align-items-end">
          <button class="btn btn-primary px-3" @click="reset">Clean</button>
        </div>
      </div>
      <div class="row">
        <div class="col-md-3 mb-2">
          <label class="form-label">Report Type</label>
          <select v-model="selectedReport" class="form-select">
            <option disabled value="">-- Select Report --</option>
            <option value="leave">Leave Application</option>
            <option value="kpi">KPI Report</option>
            <option value="personal">Personal KPI Report</option>
            <option value="point">Point System</option>
            <option value="reward">Reward Redemption</option>
          </select>
        </div>
      </div>

      <button
          class="btn btn-primary"
          :disabled="!selectedReport"
          @click="generateReport"
      >
        Generate Report
      </button>
      <div v-if="isExporting" class="mt-3">
        <div class="progress">
          <div
              class="progress-bar progress-bar-striped progress-bar-animated"
              role="progressbar"
              style="width: 100%"
              aria-valuenow="100"
              aria-valuemin="0"
              aria-valuemax="100"
          ></div>
        </div>
        <p class="mt-2">Exporting，Please wait...</p>
      </div>


      <div v-if="filepath" class="mt-4">
        <iframe
            :src="filepath"
            width="100%"
            height="600px"
            style="border: 1px solid #ccc"
        ></iframe>
      </div>
    </main>
  </div>

</template>

<script setup lang="ts">
import {ref, onMounted, reactive} from "vue";
import {selectAllDepartments} from "@/api/department.ts";
import {isSuccess} from "@/utils/httpStatus.ts";
import {exportLeaveApplications} from "@/api/leave.ts";
import {exportKPI, exportPersonalKPI} from "@/api/kpiAdmin.ts";
import {exportPointHistory, exportRewardRedemption} from "@/api/reward.ts";
import Swal from "sweetalert2";

let departments = reactive<any[]>([]);
const selectedReport = ref("");
const selectedDept = ref(0);
const startDate = ref("");
const endDate = ref("");
const filepath = ref("");
const isExporting = ref(false);


const reset = () => {
  selectedReport.value = "";
  selectedDept.value = 0;
  startDate.value = "";
  endDate.value = "";
}

const fetchDepartments = () => {
  selectAllDepartments().then((res) => {
    if (isSuccess(res.status) && res.data.code === 200) {
      const fetchedDepartments = res.data.data.results;
      const allDepartmentsOption = {id: '0', department_name: 'All Departments'};
      departments.splice(0, departments.length, allDepartmentsOption, ...fetchedDepartments);
    } else {
      console.error('Failed to fetch department list:', res);
    }
  }).catch((error) => {
    console.error('Error fetching department list:', error);
  });
};

onMounted(async () => {
  fetchDepartments();
});

const generateReport = async () => {
  const reportType = selectedReport.value;
  const params = {
    department_id: selectedDept.value,
    start_date: startDate.value,
    end_date: endDate.value,
  };

  const reportMap = {
    leave: exportLeaveApplications,
    kpi: exportKPI,
    personal: exportPersonalKPI,
    point: exportPointHistory,
    reward: exportRewardRedemption,
  };

  const exportFunc = reportMap[reportType];

  if (!exportFunc) {
    await Swal.fire({
      icon: 'warning',
      title: '无效的报表类型',
      text: '请选择正确的报表类型再导出',
    });
    return;
  }

  isExporting.value = true;  // 开始导出，显示进度条

  try {
    const response = await exportFunc(params);
    const blob = new Blob([response.data], {
      type: response.headers['content-type'],
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${reportType}_report.xlsx`;
    link.click();
    URL.revokeObjectURL(link.href);
    await Swal.fire({
      icon: 'success',
      title: '导出成功',
      text: '报表已成功生成并下载',
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error('导出失败', error);
    await Swal.fire({
      icon: 'error',
      title: '导出失败',
      text: '请检查网络或稍后重试',
    });
  } finally {
    isExporting.value = false;  // 导出完成，隐藏进度条
  }
};


</script>

<style scoped>
min-height:

calc
(
100
vh

-
100
px

)
; /* 减去 header + footer 高度 */

select.form-select,
input.form-control {
  min-width: 100%;
}
</style>
