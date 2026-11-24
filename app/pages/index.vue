
<template>
  <v-container fluid class="pa-6 dashboard">
    <div class="d-flex align-center justify-space-between flex-wrap mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Weather Dashboard</h1>
        <p class="text-medium-emphasis mt-1">
          Live subdivision weather monitoring
        </p>
      </div>

      <v-chip
        :color="connected ? 'success' : 'error'"
        variant="tonal"
        prepend-icon="mdi-circle"
      >
        {{ connected ? 'Firebase Connected' : 'Disconnected' }}
      </v-chip>
    </div>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      class="mb-5"
    >
      {{ errorMessage }}
    </v-alert>

    <v-alert
      v-if="loading"
      type="info"
      variant="tonal"
      class="mb-5"
    >
      Waiting for Firebase sensor data...
    </v-alert>

    <v-row>
      <!-- Temperature -->
      <v-col cols="12" sm="6" lg="4">
        <v-card rounded="lg" elevation="2" class="pa-4 h-100">
          <div class="d-flex align-center justify-space-between">
            <span class="text-subtitle-1 font-weight-medium">
              Temperature
            </span>
            <v-icon color="orange" size="30">
              mdi-thermometer
            </v-icon>
          </div>

          <div class="text-h3 font-weight-bold mt-5">
            {{ temperature !== null ? temperature.toFixed(1) : '--' }}°C
          </div>
          <p class="text-medium-emphasis mt-2">DHT22 sensor</p>
        </v-card>
      </v-col>

      <!-- Humidity -->
      <v-col cols="12" sm="6" lg="4">
        <v-card rounded="lg" elevation="2" class="pa-4 h-100">
          <div class="d-flex align-center justify-space-between">
            <span class="text-subtitle-1 font-weight-medium">
              Humidity
            </span>
            <v-icon color="blue" size="30">
              mdi-water-percent
            </v-icon>
          </div>

          <div class="text-h3 font-weight-bold mt-5">
            {{ humidity !== null ? humidity.toFixed(1) : '--' }}%
          </div>
          <p class="text-medium-emphasis mt-2">DHT22 sensor</p>
        </v-card>
      </v-col>

      <!-- Rain Sensor -->
      <v-col cols="12" sm="6" lg="4">
        <v-card rounded="lg" elevation="2" class="pa-4 h-100">
          <div class="d-flex align-center justify-space-between">
            <span class="text-subtitle-1 font-weight-medium">
              Rain Sensor Value
            </span>
            <v-icon color="cyan" size="30">
              mdi-weather-pouring
            </v-icon>
          </div>

          <div class="text-h3 font-weight-bold mt-5">
            {{ rainValue ?? '--' }}
          </div>
          <p class="text-medium-emphasis mt-2">
            ESP32 analog reading (0–4095)
          </p>
        </v-card>
      </v-col>

      <!-- Rain Status -->
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="2" class="pa-5">
          <div class="text-subtitle-1 font-weight-medium mb-4">
            Current Rain Condition
          </div>

          <v-sheet
            rounded="lg"
            class="pa-5 text-center"
            :color="isRaining ? 'red-lighten-5' : 'green-lighten-5'"
          >
            <v-icon
              :color="isRaining ? 'error' : 'success'"
              size="48"
            >
              {{ isRaining ? 'mdi-weather-rainy' : 'mdi-weather-sunny' }}
            </v-icon>

            <div
              class="text-h5 font-weight-bold mt-2"
              :class="isRaining ? 'text-error' : 'text-success'"
            >
              {{ rainStatus || 'Waiting for data' }}
            </div>
          </v-sheet>
        </v-card>
      </v-col>

      <!-- Last Update -->
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="2" class="pa-5 h-100">
          <div class="text-subtitle-1 font-weight-medium mb-4">
            Sensor Information
          </div>

          <div class="d-flex align-center mb-4">
            <v-icon color="primary" class="mr-3">
              mdi-clock-outline
            </v-icon>
            <div>
              <div class="text-caption text-medium-emphasis">
                Last updated
              </div>
              <div class="font-weight-medium">
                {{ formattedLastUpdated }}
              </div>
            </div>
          </div>

          <v-divider class="mb-4" />

          <div class="d-flex align-center">
            <v-icon color="success" class="mr-3">
              mdi-chip
            </v-icon>
            <div>
              <div class="text-caption text-medium-emphasis">
                Hardware
              </div>
              <div class="font-weight-medium">
                ESP32 + DHT22 + Rain Sensor
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <div class="text-caption text-medium-emphasis mt-6">
      Live readings are received from Firebase Realtime Database.
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref as vueRef, onMounted, onUnmounted, computed } from 'vue'
import { ref as databaseRef, onValue } from 'firebase/database'
import type { Database } from 'firebase/database'

interface WeatherData {
  temperature?: number
  humidity?: number
  rainValue?: number
  rainStatus?: string
  lastUpdated?: number
}

const temperature = vueRef<number | null>(null)
const humidity = vueRef<number | null>(null)
const rainValue = vueRef<number | null>(null)
const rainStatus = vueRef('')
const lastUpdated = vueRef<number | null>(null)

const connected = vueRef(false)
const loading = vueRef(true)
const errorMessage = vueRef('')

let unsubscribe: (() => void) | undefined

const isRaining = computed(() =>
  rainStatus.value.toUpperCase().includes('RAIN DETECTED')
)

const formattedLastUpdated = computed(() => {
  if (!lastUpdated.value) return 'No update received'

  return new Date(lastUpdated.value).toLocaleString()
})

onMounted(() => {
  try {
    const nuxtApp = useNuxtApp() as unknown as {
      $database: Database
    }

    const weatherPath = databaseRef(nuxtApp.$database, 'weather')

    unsubscribe = onValue(
      weatherPath,
      (snapshot) => {
        if (!snapshot.exists()) {
          errorMessage.value = 'No weather data found at /weather.'
          loading.value = false
          connected.value = true
          return
        }

        const data = snapshot.val() as WeatherData

        temperature.value =
          typeof data.temperature === 'number'
            ? data.temperature
            : null

        humidity.value =
          typeof data.humidity === 'number'
            ? data.humidity
            : null

        rainValue.value =
          typeof data.rainValue === 'number'
            ? data.rainValue
            : null

        rainStatus.value = data.rainStatus ?? ''

        lastUpdated.value =
          typeof data.lastUpdated === 'number'
            ? data.lastUpdated
            : null

        connected.value = true
        loading.value = false
        errorMessage.value = ''
      },
      (error) => {
        console.error('Firebase listener error:', error)
        connected.value = false
        loading.value = false
        errorMessage.value =
          'Unable to read Firebase data. Check your database rules and configuration.'
      }
    )
  } catch (error) {
    console.error('Firebase setup error:', error)
    connected.value = false
    loading.value = false
    errorMessage.value = 'Firebase initialization failed.'
  }
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f8f6;
}

.h-100 {
  height: 100%;
}
</style>
