
<template>
  <v-container fluid class="weather-page pa-6">
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">Rain Alerts</h1>
      <p class="text-medium-emphasis">
        Rain detection events reported by your ESP32
      </p>
    </div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <v-row class="mb-3">
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="2" class="pa-5">
          <v-icon color="error" size="36">mdi-bell-alert</v-icon>
          <div class="text-medium-emphasis mt-3">Total Rain Records</div>
          <div class="text-h2 font-weight-bold mt-2">
            {{ rainEvents.length }}
          </div>
          <v-chip color="success" variant="tonal" class="mt-3">
            {{ connected ? 'Firebase Connected' : 'Disconnected' }}
          </v-chip>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="2" class="pa-5">
          <v-icon :color="isRaining ? 'error' : 'success'" size="36">
            {{ isRaining ? 'mdi-weather-pouring' : 'mdi-weather-sunny' }}
          </v-icon>
          <div class="text-medium-emphasis mt-3">Current Condition</div>
          <div class="text-h5 font-weight-bold mt-3"
            :class="isRaining ? 'text-error' : 'text-success'">
            {{ current.rainStatus }}
          </div>
          <div class="text-caption text-medium-emphasis mt-2">
            Current rain sensor status
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="lg" elevation="2" class="pa-4">
      <div class="text-h6 font-weight-bold mb-1">Rain Detection History</div>
      <div class="text-caption text-medium-emphasis mb-4">
        Latest rain events saved in Firebase
      </div>

      <v-table>
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Rain Sensor Value</th>
            <th>Alert</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in [...rainEvents].reverse()" :key="event.id">
            <td>{{ formatDate(event.lastUpdated) }}</td>
            <td>{{ event.rainValue }}</td>
            <td>
              <v-chip color="error" size="small" variant="tonal">
                RAIN DETECTED
              </v-chip>
            </td>
          </tr>
          <tr v-if="!rainEvents.length">
            <td colspan="3" class="text-center py-8">
              No rain detection events recorded.
            </td>
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

const rainEvents = computed(() =>
  records.value.filter(record =>
    record.rainStatus.toUpperCase().includes('RAIN DETECTED')
  )
)

function formatDate(value: number) {
  return value ? new Date(value).toLocaleString() : '--'
}
</script>

<style scoped>
.weather-page { min-height: 100vh; background: #f5f8f6; }
</style>
