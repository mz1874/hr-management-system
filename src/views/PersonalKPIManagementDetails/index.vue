<script>
export default {
  name: 'KpiDetailView',
  data() {
    return {
      kpiData: {
        title: '',
        value: 0,
        statistics: {
          onTrack: 0,
          offTrack: 0,
          completed: 0
        },
        details: []
      }
    }
  },
  methods: {
    getProgressBarClass(progress) {
      if (progress >= 75) return 'bg-success'
      if (progress >= 50) return 'bg-info'
      if (progress >= 25) return 'bg-warning'
      return 'bg-danger'
    },
    loadKpiData() {
      // In a real application, you would fetch this data from your API
      // For now, we'll use the route query parameters and mock data
      const { kpiId, title, value } = this.$route.query

      // Mock data - replace with actual API call
      this.kpiData = {
        title: title || 'Completeness of Order',
        value: Number(value) || 50,
        statistics: {
          onTrack: 2,
          offTrack: 0,
          completed: 0
        },
        details: [
          {
            id: 1,
            description: 'Picking list completed/ month (pcs)',
            progress: 20
          },
          {
            id: 2,
            description: 'Return rate/ month (times)',
            progress: 50
          },
          {
            id: 3,
            description: 'Return rate/ month (times)',
            progress: 80
          }
        ]
      }
    }
  },
  mounted() {
    this.loadKpiData()
  }
}
</script>


<template>
    <div class="container">
      <!-- Row 1: Circular Chart and KPI Overview -->
      <div class="kpi-row">
        <div class="progress-circle">
          <svg viewBox="0 0 36 36" class="circular-chart">
            <path
              class="circle-bg"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            ></path>
            <path
              class="circle"
              :style="{ '--value': kpiData.value }"
              :stroke-dasharray="`${kpiData.value}, 100`"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            ></path>
          </svg>
          <div class="percentage">{{ kpiData.value }}%</div>
        </div>
  
        <div class="kpi-statistic">
          <h4>{{ kpiData.title }}</h4>
          <div class="status">
            <div>
              <i class="fas fa-check-circle text-success"></i> 
              {{ kpiData.statistics.onTrack }} on Track
            </div>
            <div>
              <i class="fas fa-exclamation-circle text-danger"></i> 
              {{ kpiData.statistics.offTrack }} off Track
            </div>
            <div>
              <i class="fas fa-check text-primary"></i> 
              {{ kpiData.statistics.completed }} completed
            </div>
          </div>
        </div>
      </div>
  
      <!-- Row 2: Statistics Table -->
      <div class="details">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Order</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in kpiData.details" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.description }}</td>
              <td>
                <div class="progress">
                  <div 
                    class="progress-bar" 
                    :class="getProgressBarClass(item.progress)"
                    role="progressbar" 
                    :style="{ width: item.progress + '%' }" 
                    :aria-valuenow="item.progress" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
<style scoped>
.kpi-row {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.progress-circle {
  width: 150px;
  height: 150px;
  position: relative;
}

.circular-chart {
  max-width: 100%;
  max-height: 100%;
}

.circular-chart .circle-bg {
  stroke-width: 2;
  fill: none;
  stroke: #e6e6e6;
}

.circular-chart .circle {
  stroke-width: 2;
  fill: none;
  stroke: #54B689;
  stroke-linecap: round;
  animation: progress 1.5s ease-out forwards;
}

.percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  font-weight: bold;
}

@keyframes progress {
  from {
    stroke-dasharray: 0, 100;
  }
  to {
    stroke-dasharray: var(--value), 100;
  }
}

.kpi-statistic {
  background-color: white;
  padding: 20px;
  margin: 0;
  border-radius: 10px;
  display: grid;
  align-items: center;
  flex-grow: 1;
}

.kpi-statistic h4 {
  font-size: 20px;
  margin-bottom: 10px;
}

.kpi-statistic .status {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.kpi-statistic .status div {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.details {
  margin-top: 5%;
}

.table {
  border-radius: 10px;
  overflow: hidden;
  border-collapse: separate;
  border-spacing: 0;
}

.table th, .table td {
  vertical-align: middle;
}

.table th {
  background-color: #f8f9fa;
  text-align: center;
}

.table-bordered {
  border: 1px solid #dee2e6;
}

.table-bordered th, .table-bordered td {
  border: 1px solid #dee2e6;
}

.progress {
  height: 20px;
  background-color: #f8f9fa;
}
</style>
