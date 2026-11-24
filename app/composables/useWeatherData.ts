
import { ref as vueRef, onMounted, onUnmounted } from 'vue'
import {
  ref as databaseRef,
  query,
  orderByChild,
  limitToLast,
  onValue
} from 'firebase/database'
import type { Database } from 'firebase/database'

export interface WeatherRecord {
  id: string
  temperature: number
  humidity: number
  rainValue: number
  rainStatus: string
  lastUpdated: number
}

export function useWeatherData() {
  const current = vueRef<WeatherRecord>({
    id: 'current',
    temperature: 0,
    humidity: 0,
    rainValue: 0,
    rainStatus: 'WAITING FOR DATA',
    lastUpdated: 0
  })

  const records = vueRef<WeatherRecord[]>([])
  const connected = vueRef(false)
  const loading = vueRef(true)
  const errorMessage = vueRef('')

  let stopLive: (() => void) | undefined
  let stopHistory: (() => void) | undefined

  onMounted(() => {
    try {
      const { $database } = useNuxtApp() as unknown as {
        $database: Database
      }

      stopLive = onValue(
        databaseRef($database, 'weather'),
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val()

            current.value = {
              id: 'current',
              temperature: Number(data.temperature ?? 0),
              humidity: Number(data.humidity ?? 0),
              rainValue: Number(data.rainValue ?? 0),
              rainStatus: data.rainStatus ?? 'UNKNOWN',
              lastUpdated: Number(data.lastUpdated ?? 0)
            }

            connected.value = true
            errorMessage.value = ''
          } else {
            errorMessage.value = 'No current weather data found.'
          }

          loading.value = false
        },
        (error) => {
          console.error(error)
          connected.value = false
          loading.value = false
          errorMessage.value = 'Unable to connect to Firebase.'
        }
      )

      const historyQuery = query(
        databaseRef($database, 'weatherHistory'),
        orderByChild('lastUpdated'),
        limitToLast(100)
      )

      stopHistory = onValue(
        historyQuery,
        (snapshot) => {
          const data = snapshot.val()

          records.value = data
            ? Object.entries(data)
                .map(([id, value]) => {
                  const item = value as Record<string, unknown>

                  return {
                    id,
                    temperature: Number(item.temperature ?? 0),
                    humidity: Number(item.humidity ?? 0),
                    rainValue: Number(item.rainValue ?? 0),
                    rainStatus: String(item.rainStatus ?? 'UNKNOWN'),
                    lastUpdated: Number(item.lastUpdated ?? 0)
                  }
                })
                .sort((a, b) => a.lastUpdated - b.lastUpdated)
            : []
        },
        (error) => {
          console.error(error)
          errorMessage.value = 'Unable to load historical readings.'
        }
      )
    } catch (error) {
      console.error(error)
      connected.value = false
      loading.value = false
      errorMessage.value = 'Firebase initialization failed.'
    }
  })

  onUnmounted(() => {
    stopLive?.()
    stopHistory?.()
  })

  return {
    current,
    records,
    connected,
    loading,
    errorMessage
  }
}
