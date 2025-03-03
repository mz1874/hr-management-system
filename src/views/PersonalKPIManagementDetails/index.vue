<template>
  <div class="container-fluid main-content">
    <!-- Row 1: Circular Chart and KPI Overview -->
    <div class="kpi-row d-flex flex-column flex-md-row align-items-center gap-3">
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
            {{ dynamicStatistics.onTrack }} on Track
          </div>
          <div>
            <i class="fas fa-exclamation-circle text-danger"></i> 
            {{ dynamicStatistics.offTrack }} off Track
          </div>
          <div>
            <i class="fas fa-check text-primary"></i> 
            {{ dynamicStatistics.completed }} completed
          </div>
        </div>
      </div>
    </div>

    <!-- Row 2: Statistics Table -->
    <div class="details mt-4">
      <div class="table-responsive">
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
                <div class="progress progress-container">
                  <div 
                    class="progress-bar" 
                    :class="getProgressBarClass(item.progress)"
                    role="progressbar" 
                    :style="{ width: item.progress + '%' }" 
                    :aria-valuenow="item.progress" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    <span class="progress-text">{{ item.currentValue }}/{{ item.maxValue }}</span>
                  </div>
                  <span class="progress-tooltip">{{ item.currentValue }} of {{ item.maxValue }} ({{ item.progress }}%)</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KpiDetailView',
  data() {
    return {
      kpiData: {
        title: '',
        value: 0,
        details: []
      }
    }
  },
  computed: {
    dynamicStatistics() {
      let onTrack = 0;
      let offTrack = 0;
      let completed = 0;
      
      // Dynamically calculate statistics based on each detail's progress.
      this.kpiData.details.forEach(item => {
        if (item.progress === 100) {
          completed++;
        } else if (item.progress >= 75) {
          onTrack++;
        } else {
          offTrack++;
        }
      });
      
      return { onTrack, offTrack, completed };
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
      // In a real application, you would fetch this data from an API.
      // Here we use route query parameters and mock data.
      const { kpiId, title, value } = this.$route.query
      
      this.kpiData = {
        title: title || 'Completeness of Order',
        value: (value !== undefined && value !== null) ? Number(value) : 50,
        details: [
          {
            id: 1,
            description: 'Picking list completed/ month (pcs)',
            progress: 20,
            currentValue: 240,
            maxValue: 1200
          },
          {
            id: 2,
            description: 'Return rate/ month (times)',
            progress: 50,
            currentValue: 15,
            maxValue: 30
          },
          {
            id: 3,
            description: 'Packing orders/ month (pcs)',
            progress: 80,
            currentValue: 800,
            maxValue: 1000
          }
        ]
      }
    }
  },
  mounted() {
    this.loadKpiData()
  },
  watch: {
    '$route.query': {
      handler() {
        this.loadKpiData()
      },
      immediate: true,
      deep: true
    }
  }
}
</script>

<style scoped>
/* Container padding */
.main-content {
  padding: 20px;
}

/* KPI Row */
.kpi-row {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

/* Circular Chart */
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

/* KPI Statistic */
.kpi-statistic {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  flex-grow: 1;
}

.kpi-statistic h4 {
  font-size: 20px;
  margin-bottom: 10px;
}

.kpi-statistic .status {
  display: flex;
  gap: 20px;
  font-size: 14px;
}

/* Details Table */
.details {
  margin-top: 5%;
}

.table-responsive {
  overflow-x: auto;
}

.table {
  border-radius: 10px;
  overflow: hidden;
  border-collapse: separate;
  border-spacing: 0;
}

.table th,
.table td {
  vertical-align: middle;
  padding: 8px;
}

.table th {
  background-color: #f8f9fa;
  text-align: center;
}

.table-bordered {
  border: 1px solid #dee2e6;
}

.table-bordered th,
.table-bordered td {
  border: 1px solid #dee2e6;
}

/* Progress Bar */
.progress {
  height: 20px;
  background-color: #f8f9fa;
  position: relative;
}

.progress-text {
  position: absolute;
  left: 5px;
  color: white;
  font-size: 12px;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  line-height: 20px;
  transition: transform 0.3s ease, font-size 0.3s ease, font-weight 0.3s ease;
}

.progress-container:hover .progress-text {
  transform: scale(1.2);
  font-size: 16px;
  font-weight: 700;
  color: black;
}


/* Tooltip for progress bar */
.progress-container {
  position: relative;
}

.progress-tooltip {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s;
  pointer-events: none;
  white-space: nowrap;
}

.progress-container:hover .progress-tooltip {
  opacity: 1;
  visibility: visible;
}

/* Responsive Adjustments */
@media (max-width: 576px) {
  .kpi-row {
    flex-direction: column;
    align-items: center;
  }
  
  .kpi-statistic {
    width: 100%;
  }
  
  .progress-circle {
    width: 120px;
    height: 120px;
  }
  
  .percentage {
    font-size: 20px;
  }
}
</style>
