<!-- KpiDashboard.vue -->
<template>
  <div class="container mt-4">
    <div class="row g-4" id="kpi-container">
      <div v-for="kpi in kpiData" :key="kpi.title" class="col-md-4">
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
      kpiData: [
        { title: "Completeness of Order", value: 50, id: 1 },
        { title: "Accuracy of Inventory", value: 60, id: 2 },
        { title: "Average Pick Time", value: 30, id: 3 },
        { title: "Warehouse Utilization", value: 50, id: 4 },
        { title: "Inventory Turnover", value: 50, id: 5 }
      ]
    }
  },
  methods: {
    navigateToDetails(kpi) {
      this.$router.push({
        path: '/PersonalKPIDetails',
        query: {
          kpiId: kpi.id,
          title: kpi.title,
          value: kpi.value
        }
      })
    }
  }
}
</script>


<style scoped>
/* Parent container of the KPI cards */
.kpi-cards-container {
    display: flex;
    flex-wrap: wrap; /* Ensure the cards wrap to the next line on smaller screens */
    justify-content: space-between; /* Even spacing between cards */
    gap: 20px; /* Control spacing between the cards */
    padding: 10px;
}

/* KPI Card */
.kpi-card {
    text-align: center;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 20px; /* Optional: Keep slightly rounded corners */
    padding: 15px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    height: 100%;
    width: 80%; /* Make sure it can grow and shrink */
    max-width: 300px; /* Optional: Limit the max width for each card */
    padding-top: 10%;
    display: flex;
    background-color: #F8F8F8;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 10px; /* Add spacing between cards */
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
        width: 80%; /* Full width on small screens */
        max-width: none; /* Remove max width on small screens */
    }
}

</style>