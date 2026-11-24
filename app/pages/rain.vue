
<template>
  <v-container fluid class="weather-page pa-6">
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">Rain Monitoring</h1>
      <p class="text-medium-emphasis">Live rainfall detection and sensor readings</p>
    </div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <v-row>
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="2" class="pa-5">
          <div class="text-subtitle-1 font-weight-medium">Current Rain Condition</div>
          <v-sheet rounded="lg" class="pa-8 text-center mt-4"
            :color="isRaining ? 'red-lighten-5' : 'green-lighten-5'">
            <v-icon size="60" :color="isRaining ? 'error' : 'success'">
              {{ isRaining ? 'mdi-weather-pouring' : 'mdi-weather-sunny' }}
            </v-icon>
            <div class="text-h4 font-weight-bold mt-3"
              :class="isRaining ? 'text-error' : 'text-success'">
              {{ current.rainStatus }}
            </div>
            <div class="text-caption text-medium-emphasis mt-2">
              {{ connected ? 'Live Firebase reading' : 'Waiting for connection' }}
            </div>
          </v-sheet>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="2" class="pa-5 h-100">
          <v-icon color="cyan" size="36">mdi-water</v-icon>
          <div class="text-medium-emphasis mt-3">Rain Sensor Value</div>
          <div class="text-h2 font-weight-bold mt-2">
            {{ current.rainValue }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Analog reading (0–4095)
          </div>
          <v-progress-linear
            class="mt-5"
            :model-value="current.rainValue / 4095 * 100"
            color="cyan"
            height="10"
            rounded
          />
          <div class="text-caption text-medium-emphasis mt-2">
            {{ (current.rainValue / 4095 * 100).toFixed(1) }}% of ADC range
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="lg" elevation="2" class="pa-4 mt-5">
      <div class="text-h6 font-weight-bold mb-3">Rain Sensor History</div>
      <v-table>
        <thead>
          <tr><th>Date & Time</th><th>Sensor Value</th><th>Rain Status</th></tr>
        </thead>
        <tbody>
          <tr v-for="item in [...records].reverse()" :key="item.id">
            <td>{{ formatDate(item.lastUpdated) }}</td>
            <td>{{ item.rainValue }}</td>
            <td>
              <v-chip size="small" variant="tonal"
                :color="item.rainStatus === 'RAIN DETECTED' ? 'error' : 'success'">
                {{ item.rainStatus }}
              </v-chip>
            </td>
          </tr>
          <tr v-if="!records.length">
            <td colspan="3" class="text-center">No rain records available</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const { current, records, connected, errorMessage } = useWeatherData()

const isRaining = computed(() =>
  current.value.rainStatus.toUpperCase().includes('RAIN DETECTED')
)

function formatDate(value: number) {
  return value ? new Date(value).toLocaleString() : '--'
}
</script>

<style scoped>
.weather-page { min-height: 100vh; background: #f5f8f6; }
.h-100 { height: 100%; }
</style>
