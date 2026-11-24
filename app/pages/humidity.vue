
<template>
  <v-container fluid class="weather-page pa-6">
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">Humidity Monitoring</h1>
      <p class="text-medium-emphasis">Live humidity readings from DHT22</p>
    </div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <v-row>
      <v-col cols="12" md="4">
        <v-card rounded="lg" elevation="2" class="pa-5">
          <v-icon color="blue" size="36">mdi-water-percent</v-icon>
          <div class="text-medium-emphasis mt-3">Current Humidity</div>
          <div class="text-h2 font-weight-bold mt-2">
            {{ current.humidity.toFixed(1) }}%
          </div>
          <v-chip color="success" variant="tonal" class="mt-3">
            {{ connected ? 'Live data' : 'Disconnected' }}
          </v-chip>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card rounded="lg" elevation="2" class="pa-5 h-100">
          <div class="text-h6 font-weight-bold mb-2">Humidity History</div>
          <div class="text-caption text-medium-emphasis mb-4">
            Latest {{ records.length }} historical readings
          </div>
          <svg v-if="records.length" viewBox="0 0 600 190"
            preserveAspectRatio="none" class="chart">
            <line v-for="y in [25,65,105,145]" :key="y"
              x1="35" :y1="y" x2="585" :y2="y"
              stroke="#e5e7eb" stroke-dasharray="4 4"/>
            <polyline :points="points" fill="none" stroke="#2196F3"
              stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div v-else class="empty">No humidity history yet.</div>
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="lg" elevation="2" class="pa-4 mt-5">
      <div class="text-h6 font-weight-bold mb-3">Humidity Records</div>
      <v-table>
        <thead><tr><th>Date & Time</th><th>Humidity</th></tr></thead>
        <tbody>
          <tr v-for="item in [...records].reverse()" :key="item.id">
            <td>{{ formatDate(item.lastUpdated) }}</td>
            <td>{{ item.humidity.toFixed(1) }}%</td>
          </tr>
          <tr v-if="!records.length">
            <td colspan="2" class="text-center">No records available</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const { current, records, connected, errorMessage } = useWeatherData()

const points = computed(() => {
  const values = records.value.map(r => r.humidity)
  if (!values.length) return ''

  return values.map((v, i) => {
    const x = values.length === 1 ? 310 : 35 + i / (values.length - 1) * 550
    const y = 155 - (Math.max(0, Math.min(100, v)) / 100) * 140
    return `${x},${y}`
  }).join(' ')
})

function formatDate(value: number) {
  return value ? new Date(value).toLocaleString() : '--'
}
</script>

<style scoped>
.weather-page { min-height: 100vh; background: #f5f8f6; }
.chart { width: 100%; height: 210px; }
.empty { height: 180px; display: grid; place-items: center; color: #888; }
.h-100 { height: 100%; }
</style>
