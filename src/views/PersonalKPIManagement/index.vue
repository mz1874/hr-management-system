<template>
  <div class="container mt-4">
    <!-- Selection Container -->
    <div class="selection-container mb-4">
      <div class="row align-items-end g-3">
        <!-- Radio Buttons: "View By" -->
        <div class="col-auto">
          <label class="fw-semibold me-2">View By:</label>
          <div class="btn-group" role="group" aria-label="View Type">
            <!-- Bootstrap "btn-check" for custom radio styling -->
            <input
              type="radio"
              class="btn-check"
              id="view-month"
              value="month"
              v-model="viewType"
              autocomplete="off"
            />
            <label class="btn btn-outline-success" for="view-month">Month</label>

            <input
              type="radio"
              class="btn-check"
              id="view-year"
              value="year"
              v-model="viewType"
              autocomplete="off"
            />
            <label class="btn btn-outline-success" for="view-year">Year</label>
          </div>
        </div>

        <!-- Month Selector: only visible in "month" view -->
        <div class="col-auto" v-if="viewType === 'month'">
          <label for="month-select" class="form-label fw-semibold mb-0">Month:</label>
          <select
            id="month-select"
            v-model="selectedMonth"
            class="form-select d-inline-block w-auto ms-2"
          >
            <option v-for="month in months" :key="month" :value="month">
              {{ month }}
            </option>
          </select>
        </div>

        <!-- Year Selector: always visible -->
        <div class="col-auto">
          <label for="year-select" class="form-label fw-semibold mb-0">Year:</label>
          <select
            id="year-select"
            v-model="selectedYear"
            class="form-select d-inline-block w-auto ms-2"
          >
            <option v-for="year in years" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="row g-4" id="kpi-container">
      <div v-for="kpi in displayKpiData" :key="kpi.id" class="col-md-4">
        <div class="kpi-card" @click="navigateToDetails(kpi)" role="button" tabindex="0">
          <h5>{{ kpi.title }}</h5>
          <div class="progress-circle">
            <svg viewBox="0 0 36 36" class="circular-chart green">
              <path
                class="circle-bg"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              ></path>
              <path
                class="circle"
                :style="{ '--value': kpi.value }"
                :stroke-dasharray="`${kpi.value}, 100`"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              ></path>
            </svg>
          </div>
          <div class="percentage">{{ kpi.value }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KpiDashboard',
  data() {
    return {
      // Controls
      viewType: 'month',       // Either 'month' or 'year'
      selectedMonth: 'January',
      selectedYear: '2022',

      // Possible dropdown values
      months: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      years: ['2021', '2022', '2023'],

      // A list of KPI tasks that remain the same each month/year
      kpiTasks: [
        { id: 1, title: "Completeness of Order" },
        { id: 2, title: "Accuracy of Inventory" },
        { id: 3, title: "Average Pick Time" },
        { id: 4, title: "Warehouse Utilization" },
        { id: 5, title: "Inventory Turnover" }
      ],

      // Separate progress records: each record ties a KPI ID to a month/year and a value
      kpiProgress: [
        { kpiId: 1, month: 'January', year: '2022', value: 50 },
        { kpiId: 2, month: 'January', year: '2022', value: 60 },
        { kpiId: 3, month: 'January', year: '2022', value: 30 },
        { kpiId: 4, month: 'January', year: '2022', value: 45 },
        { kpiId: 5, month: 'January', year: '2022', value: 55 },

        { kpiId: 1, month: 'February', year: '2022', value: 40 },
        { kpiId: 2, month: 'February', year: '2022', value: 65 },
        { kpiId: 3, month: 'February', year: '2022', value: 35 },
        { kpiId: 4, month: 'February', year: '2022', value: 50 },
        { kpiId: 5, month: 'February', year: '2022', value: 60 },

        { kpiId: 1, month: 'March', year: '2023', value: 70 },
        { kpiId: 2, month: 'March', year: '2023', value: 80 },
        { kpiId: 3, month: 'March', year: '2023', value: 40 },
        { kpiId: 4, month: 'March', year: '2023', value: 55 },
        { kpiId: 5, month: 'March', year: '2023', value: 65 }
      ]
    }
  },
  computed: {
    /**
     * Returns an array of KPI objects to display, with a "value"
     * property determined by the current view type (month or year).
     */
    displayKpiData() {
      if (this.viewType === 'month') {
        // Show each KPI for the selected month/year
        return this.kpiTasks.map(task => {
          // Find a record in kpiProgress that matches the selected month/year
          const progressRecord = this.kpiProgress.find(
            record =>
              record.kpiId === task.id &&
              record.month === this.selectedMonth &&
              record.year === this.selectedYear
          );
          return {
            ...task,
            // If no record found, default to 0 or some fallback
            value: progressRecord ? progressRecord.value : 0
          };
        });
      } else {
        // YEAR VIEW: Show each KPI, but average all months for the selected year
        // 1. Filter all progress records for the chosen year
        const yearRecords = this.kpiProgress.filter(
          record => record.year === this.selectedYear
        );

        // 2. Aggregate progress by kpiId
        const aggregated = {};
        yearRecords.forEach(record => {
          if (!aggregated[record.kpiId]) {
            aggregated[record.kpiId] = { total: record.value, count: 1 };
          } else {
            aggregated[record.kpiId].total += record.value;
            aggregated[record.kpiId].count++;
          }
        });

        // 3. Map the aggregated results back onto the KPI tasks
        return this.kpiTasks.map(task => {
          const agg = aggregated[task.id];
          if (!agg) {
            // No records found for this KPI in the selected year
            return { ...task, value: 0 };
          }
          const avg = Math.round(agg.total / agg.count);
          return { ...task, value: avg };
        });
      }
    }
  },
  methods: {
    navigateToDetails(kpi) {
      // Navigate to the KPI details page with query parameters
      this.$router.push({
        path: '/PersonalKPIDetails',
        query: {
          kpiId: kpi.id,
          title: kpi.title,
          value: kpi.value
        }
      });
    }
  }
}
</script>

<style scoped>
/* Container styling */
.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Cute pastel-style container for the selection row */
.selection-container {
  background-color: #fafbfd;  /* Subtle pastel background */
  border: 1px solid #eee;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* "View By" label styling */
.fw-semibold {
  font-weight: 600 !important;
}

/* KPI Card */
.kpi-card {
  text-align: center;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  height: 100%;
  width: 80%;
  max-width: 300px;
  padding-top: 10%;
  display: flex;
  background-color: #F8F8F8;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 10px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.kpi-card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

/* Circular chart styles */
.progress-circle {
  width: 70%;
  height: 70%;
  margin: 0 auto;
}

.circular-chart {
  padding-top: 30px;
  max-width: 100%;
  max-height: 100%;
}

.circular-chart .circle-bg {
  stroke-width: 3;
  fill: none;
  stroke: #e6e6e6;
}

.circular-chart .circle {
  stroke-width: 3;
  fill: #F3F8FA;
  stroke: #54B689;
  stroke-linecap: round;
  animation: progress 1.5s ease-out forwards;
}

.percentage {
  font-size: 18px;
  padding-top: 50px;
  font-weight: bold;
  color: #333;
}

/* Keyframe animation for the circular progress */
@keyframes progress {
  from {
    stroke-dasharray: 0, 100;
  }
  to {
    stroke-dasharray: var(--value), 100;
  }
}

/* Adjustments for small screens */
@media (max-width: 576px) {
  .kpi-card {
    margin-bottom: 15px;
    width: 80%;
    max-width: none;
  }
  .selection-container {
    padding: 1rem 0.5rem;
  }
}
</style>
