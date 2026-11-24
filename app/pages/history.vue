
<template>
  <v-container fluid class="history-page pa-6">

    <!-- PAGE HEADER -->
    <div class="d-flex justify-space-between align-center flex-wrap ga-3 mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Sensor History</h1>
        <p class="text-medium-emphasis mt-1">
          Historical weather readings from your ESP32 sensors
        </p>
      </div>

      <v-chip
        :color="connected ? 'success' : 'error'"
        variant="tonal"
        :prepend-icon="connected ? 'mdi-check-circle' : 'mdi-alert-circle'"
      >
        {{ connected ? 'Firebase Connected' : 'Disconnected' }}
      </v-chip>
    </div>

    <!-- ERROR -->
    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      class="mb-5"
    >
      {{ errorMessage }}
    </v-alert>

    <!-- LOADING -->
    <v-alert
      v-if="loading"
      type="info"
      variant="tonal"
      class="mb-5"
    >
      Loading historical sensor readings...
    </v-alert>

    <!-- EMPTY STATE -->
    <v-alert
      v-if="!loading && connected && records.length === 0"
      type="warning"
      variant="tonal"
      class="mb-5"
    >
      No historical readings found. Make sure your ESP32 is saving
      records to Firebase under /weatherHistory.
    </v-alert>

    <!-- SUMMARY CARDS -->
    <v-row class="mb-2">

      <v-col cols="12" sm="6" lg="3">
        <v-card rounded="lg" elevation="2" class="pa-4">
          <div class="d-flex justify-space-between">
            <span class="text-medium-emphasis">Total Records</span>
            <v-icon color="primary">mdi-database</v-icon>
          </div>
          <div class="text-h4 font-weight-bold mt-3">
            {{ records.length }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Latest 100 readings
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card rounded="lg" elevation="2" class="pa-4">
          <div class="d-flex justify-space-between">
            <span class="text-medium-emphasis">Temperature</span>
            <v-icon color="orange">mdi-thermometer</v-icon>
          </div>
          <div class="text-h4 font-weight-bold mt-3">
            {{ latestRecord ? latestRecord.temperature.toFixed(1) : '--' }}°C
          </div>
          <div class="text-caption text-medium-emphasis">
            Latest reading
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card rounded="lg" elevation="2" class="pa-4">
          <div class="d-flex justify-space-between">
            <span class="text-medium-emphasis">Humidity</span>
            <v-icon color="blue">mdi-water-percent</v-icon>
          </div>
          <div class="text-h4 font-weight-bold mt-3">
            {{ latestRecord ? latestRecord.humidity.toFixed(1) : '--' }}%
          </div>
          <div class="text-caption text-medium-emphasis">
            Latest reading
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card rounded="lg" elevation="2" class="pa-4">
          <div class="d-flex justify-space-between">
            <span class="text-medium-emphasis">Rain Condition</span>
            <v-icon color="cyan">mdi-weather-pouring</v-icon>
          </div>
          <div class="text-h6 font-weight-bold mt-3">
            {{ latestRecord?.rainStatus || '--' }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Latest sensor status
          </div>
        </v-card>
      </v-col>

    </v-row>

    <!-- TEMPERATURE CHART -->
    <v-card rounded="lg" elevation="2" class="pa-4 mb-5">
      <div class="d-flex justify-space-between align-center flex-wrap mb-3">
        <div>
          <div class="text-h6 font-weight-bold">
            Temperature History
          </div>
          <div class="text-caption text-medium-emphasis">
            Historical temperature readings in °C
          </div>
        </div>
        <v-icon color="orange" size="30">
          mdi-thermometer
        </v-icon>
      </div>

      <div v-if="records.length > 0" class="chart-container">
        <svg viewBox="0 0 600 190" preserveAspectRatio="none">
          <line
            v-for="y in [25, 65, 105, 145]"
            :key="y"
            x1="35" :y1="y" x2="585" :y2="y"
            stroke="#e5e7eb"
            stroke-dasharray="4 4"
          />
          <polyline
            :points="temperaturePoints"
            fill="none"
            stroke="#F59E0B"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div v-else class="empty-chart">
        No temperature history available
      </div>
    </v-card>

    <!-- HUMIDITY CHART -->
    <v-card rounded="lg" elevation="2" class="pa-4 mb-5">
      <div class="d-flex justify-space-between align-center flex-wrap mb-3">
        <div>
          <div class="text-h6 font-weight-bold">
            Humidity History
          </div>
          <div class="text-caption text-medium-emphasis">
            Historical humidity readings in %
          </div>
        </div>
        <v-icon color="blue" size="30">
          mdi-water-percent
        </v-icon>
      </div>

      <div v-if="records.length > 0" class="chart-container">
        <svg viewBox="0 0 600 190" preserveAspectRatio="none">
          <line
            v-for="y in [25, 65, 105, 145]"
            :key="y"
            x1="35" :y1="y" x2="585" :y2="y"
            stroke="#e5e7eb"
            stroke-dasharray="4 4"
          />
          <polyline
            :points="humidityPoints"
            fill="none"
            stroke="#2196F3"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div v-else class="empty-chart">
        No humidity history available
      </div>
    </v-card>

    <!-- RAIN CHART -->
    <v-card rounded="lg" elevation="2" class="pa-4 mb-5">
      <div class="d-flex justify-space-between align-center flex-wrap mb-3">
        <div>
          <div class="text-h6 font-weight-bold">
            Rain Sensor History
          </div>
          <div class="text-caption text-medium-emphasis">
            Analog sensor readings (0–4095)
          </div>
        </div>
        <v-icon color="cyan" size="30">
          mdi-weather-rainy
        </v-icon>
      </div>

      <div v-if="records.length > 0" class="chart-container">
        <svg viewBox="0 0 600 190" preserveAspectRatio="none">
          <line
            v-for="y in [25, 65, 105, 145]"
            :key="y"
            x1="35" :y1="y" x2="585" :y2="y"
            stroke="#e5e7eb"
            stroke-dasharray="4 4"
          />
          <polyline
            :points="rainPoints"
            fill="none"
            stroke="#06B6D4"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div v-else class="empty-chart">
        No rain sensor history available
      </div>
    </v-card>

    <!-- HISTORY TABLE -->
    <v-card rounded="lg" elevation="2" class="pa-4">
      <div class="d-flex justify-space-between align-center flex-wrap mb-4">
        <div>
          <div class="text-h6 font-weight-bold">
            Historical Records
          </div>
          <div class="text-caption text-medium-emphasis">
            Latest sensor readings from Firebase
          </div>
        </div>

        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-refresh"
          @click="refreshHistory"
        >
          Refresh
        </v-btn>
      </div>

      <v-table hover>
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Temperature</th>
            <th>Humidity</th>
            <th>Rain Value</th>
            <th>Rain Status</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="record in records" :key="record.id">
            <td class="text-no-wrap">
              {{ formatDate(record.lastUpdated) }}
            </td>
            <td>{{ record.temperature.toFixed(1) }} °C</td>
            <td>{{ record.humidity.toFixed(1) }}%</td>
            <td>{{ record.rainValue }}</td>
            <td>
              <v-chip
                size="small"
                :color="record.rainStatus === 'RAIN DETECTED' ? 'error' : 'success'"
                variant="tonal"
              >
                {{ record.rainStatus }}
              </v-chip>
            </td>
          </tr>

          <tr v-if="records.length === 0">
            <td colspan="5" class="text-center py-8 text-medium-emphasis">
              No records available
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <div class="text-caption text-medium-emphasis mt-4">
      Automatically synchronized with Firebase Realtime Database.
    </div>

  </v-container>
</template>

<script setup lang="ts">
import {
  ref as vueRef,
  computed,
  onMounted,
  onUnmounted
} from 'vue'

import {
  ref as databaseRef,
  query,
  orderByChild,
  limitToLast,
  onValue
} from 'firebase/database'

import type { Database } from 'firebase/database'

interface HistoryRecord {
  id: string
  temperature: number
  humidity: number
  rainValue: number
  rainStatus: string
  lastUpdated: number
}

const records = vueRef<HistoryRecord[]>([])

const connected = vueRef(false)
const loading = vueRef(true)
const errorMessage = vueRef('')

let unsubscribe: (() => void) | undefined

const latestRecord = computed(() => records.value.at(-1) ?? null)

// Convert sensor values into SVG chart coordinates
function makeChartPoints(
  values: number[],
  minValue: number,
  maxValue: number
) {
  if (values.length === 0) return ''

  const width = 550
  const height = 140
  const startX = 35
  const startY = 15

  const range = maxValue - minValue || 1

  return values.map((value, index) => {
    const x = values.length === 1
      ? startX + width / 2
      : startX + (index / (values.length - 1)) * width

    const normalized = Math.max(
      0,
      Math.min(1, (value - minValue) / range)
    )

    const y = startY + height - normalized * height

    return `${x},${y}`
  }).join(' ')
}

const temperaturePoints = computed(() => {
  const values = records.value.map(r => r.temperature)
  if (!values.length) return ''

  const min = Math.min(...values)
  const max = Math.max(...values)
  const padding = Math.max((max - min) * 0.2, 1)

  return makeChartPoints(values, min - padding, max + padding)
})

const humidityPoints = computed(() => {
  return makeChartPoints(
    records.value.map(r => r.humidity),
    0,
    100
  )
})

const rainPoints = computed(() => {
  return makeChartPoints(
    records.value.map(r => r.rainValue),
    0,
    4095
  )
})

// Format Firebase timestamp
function formatDate(timestamp: number) {
  if (!timestamp) return '--'

  return new Date(timestamp).toLocaleString()
}

// Connect to Firebase history
function loadHistory() {
  try {
    const nuxtApp = useNuxtApp() as unknown as {
      $database: Database
    }

    const historyReference = databaseRef(
      nuxtApp.$database,
      'weatherHistory'
    )

    const historyQuery = query(
      historyReference,
      orderByChild('lastUpdated'),
      limitToLast(100)
    )

    unsubscribe = onValue(
      historyQuery,
      (snapshot) => {
        const data = snapshot.val()

        if (!data) {
          records.value = []
        } else {
          records.value = Object.entries(data)
            .map(([id, value]) => {
              const item = value as Omit<HistoryRecord, 'id'>

              return {
                id,
                temperature: Number(item.temperature ?? 0),
                humidity: Number(item.humidity ?? 0),
                rainValue: Number(item.rainValue ?? 0),
                rainStatus: item.rainStatus ?? 'UNKNOWN',
                lastUpdated: Number(item.lastUpdated ?? 0)
              }
            })
            .sort((a, b) => a.lastUpdated - b.lastUpdated)
        }

        connected.value = true
        loading.value = false
        errorMessage.value = ''
      },
      (error) => {
        console.error('Firebase history error:', error)

        connected.value = false
        loading.value = false
        errorMessage.value =
          'Unable to load history. Check Firebase database rules and configuration.'
      }
    )
  } catch (error) {
    console.error(error)

    connected.value = false
    loading.value = false
    errorMessage.value = 'Firebase initialization failed.'
  }
}

function refreshHistory() {
  unsubscribe?.()
  loading.value = true
  loadHistory()
}

onMounted(() => {
  loadHistory()
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  background: #f5f8f6;
}

.chart-container {
  width: 100%;
  height: 220px;
  padding: 10px 0;
}

.chart-container svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.empty-chart {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9e9e9e;
  font-size: 14px;
}
</style>
