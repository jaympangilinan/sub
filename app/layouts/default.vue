
<template>
  <v-app>

    <!-- SIDEBAR -->
    <v-navigation-drawer
      v-model="drawer"
      :permanent="!mobile"
      :temporary="mobile"
      width="260"
      color="white"
      elevation="0"
      class="sidebar"
    >
      <!-- BRAND -->
      <div class="sidebar-brand pa-5">
        <div class="d-flex align-center ga-3">
          <v-avatar color="primary" size="46" rounded="lg">
            <v-icon
              icon="mdi-weather-partly-cloudy"
              color="white"
              size="28"
            />
          </v-avatar>

          <div>
            <div class="font-weight-bold text-primary">
              SUBDIVISION IoT
            </div>
            <div class="text-caption text-grey">
              Weather Monitoring
            </div>
          </div>
        </div>
      </div>

      <v-divider />

      <!-- NAVIGATION -->
      <div class="px-4 py-4">
        <div class="text-caption text-grey font-weight-bold mb-3">
          MAIN MENU
        </div>

        <v-list
          nav
          density="comfortable"
          bg-color="transparent"
          class="navigation-list"
        >
          <v-list-item
            v-for="item in navigationItems"
            :key="item.title"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            rounded="lg"
            color="primary"
            class="mb-1"
            :active="route.path === item.to"
            @click="closeMobileDrawer"
          />
        </v-list>
      </div>

      <!-- SIDEBAR FOOTER -->
      <template #append>
        <div class="pa-4">
          <v-card
            color="green-lighten-5"
            flat
            rounded="lg"
          >
            <v-card-text>
              <div class="d-flex align-center ga-2 mb-2">
                <v-icon
                  color="success"
                  icon="mdi-check-circle"
                />

                <span class="font-weight-bold text-success">
                  Monitoring System
                </span>
              </div>

              <div class="text-caption text-grey-darken-1">
                Subdivision Weather Monitoring
              </div>

              <v-divider class="my-3" />

              <div class="d-flex align-center justify-space-between">
                <span class="text-caption text-grey-darken-1">
                  Platform
                </span>

                <v-chip
                  size="x-small"
                  color="success"
                  variant="tonal"
                >
                  ESP32 + Firebase
                </v-chip>
              </div>
            </v-card-text>
          </v-card>

          <div class="text-center text-caption text-grey mt-4">
            Subdivision IoT System © 2026
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- TOP BAR -->
    <v-app-bar
      flat
      color="white"
      border="b"
      height="72"
    >
      <v-app-bar-nav-icon
        v-if="mobile"
        @click="drawer = !drawer"
      />

      <v-toolbar-title class="font-weight-bold text-grey-darken-3">
        {{ pageTitle }}
      </v-toolbar-title>

      <v-spacer />

      <v-chip
        color="success"
        variant="tonal"
        class="mr-3 d-none d-sm-flex"
        size="small"
      >
        <v-icon start icon="mdi-circle" size="9" />
        Weather Monitoring
      </v-chip>

      <v-tooltip text="Weather monitoring system">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-cloud-check-outline"
            variant="text"
            color="primary"
          />
        </template>
      </v-tooltip>

      <v-avatar
        color="primary"
        size="38"
        class="ml-2 mr-4"
      >
        <v-icon icon="mdi-account" color="white" />
      </v-avatar>
    </v-app-bar>

    <!-- PAGE CONTENT -->
    <v-main>
      <div class="main-content">
        <slot />
      </div>
    </v-main>

  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const route = useRoute()

// RESPONSIVE DISPLAY
const { mdAndDown } = useDisplay()

const mobile = computed(() => mdAndDown.value)

const drawer = ref(true)

// NAVIGATION ITEMS
const navigationItems = [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard-outline',
    to: '/'
  },
  {
    title: 'Temperature',
    icon: 'mdi-thermometer',
    to: '/temperature'
  },
  {
    title: 'Humidity',
    icon: 'mdi-water-percent',
    to: '/humidity'
  },
  {
    title: 'Rain Monitoring',
    icon: 'mdi-weather-rainy',
    to: '/rain'
  },
  {
    title: 'Rain Alerts',
    icon: 'mdi-bell-alert-outline',
    to: '/alerts'
  },
  {
    title: 'Sensor History',
    icon: 'mdi-chart-line',
    to: '/history'
  }
]

// DYNAMIC PAGE TITLE
const pageTitle = computed(() => {
  const currentPage = navigationItems.find(
    item => item.to === route.path
  )

  return currentPage?.title || 'Weather Monitoring'
})

// SIDEBAR BEHAVIOR
watch(
  mobile,
  (isMobile) => {
    drawer.value = !isMobile
  },
  { immediate: true }
)

// CLOSE DRAWER AFTER MOBILE NAVIGATION
function closeMobileDrawer() {
  if (mobile.value) {
    drawer.value = false
  }
}
</script>

<style scoped>
.sidebar {
  border-right: 1px solid #edf0ee;
}

.sidebar-brand {
  min-height: 90px;
  display: flex;
  align-items: center;
}

.navigation-list :deep(.v-list-item) {
  min-height: 46px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
}

.navigation-list :deep(.v-list-item--active) {
  background-color: #e8f5ef;
  color: #168c72;
  font-weight: 600;
}

.navigation-list :deep(.v-list-item--active .v-icon) {
  color: #168c72;
}

.main-content {
  min-height: calc(100vh - 72px);
  background: #f5f8f6;
}
</style>
