<template>
  <div class="mb-4">
    <h2>Report Generation</h2>
  </div>
  <div class="row">
    <div class="col-md-3 mb-3">
      <label class="form-label">Department</label>
      <select class="form-select w-25" v-model="selectedDept">
        <option v-for="dept in departments" :key="dept.id" :value="dept.id">
          {{ dept.department_name }}
        </option>
      </select>
    </div>

    <div class="col-md-3 mb-3">
      <label class="form-label">Start Date</label>
      <input type="date" v-model="startDate" class="form-control" />
    </div>

    <div class="col-md-3 mb-3">
      <label class="form-label">End Date</label>
      <input type="date" v-model="endDate" class="form-control" />
    </div>

    <div class="col-md-3 mb-3 d-flex align-items-end">
      <button class="btn btn-primary px-3" @click="reset" >Clean</button>
    </div>
  </div>
  <div class="row">
    <div class="col-md-3 mb-2">
      <label class="form-label">Report Type</label>
      <select v-model="selectedReport" class="form-select">
        <option disabled value="">-- Select Report --</option>
        <option value="leave">Leave Application</option>
        <option value="kpi">KPI Report</option>
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

  <div v-if="filepath" class="mt-4">
    <iframe
        :src="filepath"
        width="100%"
        height="600px"
        style="border: 1px solid #ccc"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, reactive} from "vue";
import axios from "axios";
import {selectAllDepartments} from "@/api/department.ts";
import {isSuccess} from "@/utils/httpStatus.ts";
import {exportLeaveApplications} from "@/api/leave.ts";
import {exportKPI} from "@/api/kpiAdmin.ts";

let departments = reactive<any[]>([]);
const selectedReport = ref("");
const selectedDept = ref(0);
const startDate = ref("");
const endDate = ref("");
const filepath = ref("");

const reset = () =>{
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

  if (selectedReport.value == "leave") {
    try {
      const response = await exportLeaveApplications({
        department_id: selectedDept.value,
        start_date: startDate.value,
        end_date: endDate.value,
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${selectedReport.value}_report.xlsx`;
      link.click();
    } catch (error) {
      console.error('导出失败', error);
      alert('导出失败，请重试');
    }
  }else if(selectedReport.value == "kpi") {
    try {
      const response = await exportKPI({
        department_id: selectedDept.value,
        start_date: startDate.value,
        end_date: endDate.value,
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${selectedReport.value}_report.xlsx`;
      link.click();
    } catch (error) {
      console.error('导出失败', error);
      alert('导出失败，请重试');
    }
  }

};

</script>

<style scoped>
select.form-select,
input.form-control {
  min-width: 100%;
}
</style>
