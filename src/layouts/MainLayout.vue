<template>
  <q-layout view="hHh lpR lFf">
    <q-header :elevated="useLightOrDark(true, false)">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          <div class="absolute-center">
            <div class="toolbar-title-text">
              <q-icon name="local_dining" />
              Restaurant Manager
            </div>
          </div>
        </q-toolbar-title>
        <q-btn 
          v-if="$route.fullPath === '/'"
          @click="storeEntries.options.sort = !storeEntries.options.sort"
          :label="!storeEntries.options.sort ? 'Sort' : 'Done'"
          flat
          no-caps
          dense
        />
      </q-toolbar>
    </q-header>

    <!-- Floating Icons on Hover -->
    <div v-if="!leftDrawerOpen"  class="floating-container custom-brown" @mouseover="showFloating = true" @mouseleave="showFloating = false">
      <q-btn round fab-mini text-color="custom-brown" icon="ads_click" class="floating-trigger" />
      <transition name="fade">
        <div v-if="showFloating && !leftDrawerOpen" class="floating-icons">
          <q-btn
            v-for="(link, index) in navLinks"
            :key="index"
            round
            dense
            fab-mini
            text-color="grey-9"
            :icon="link.icon"
            @click="navigate(link.link)"
            class="floating-btn custom-brown"
          />
        </div>
      </transition>
    </div>

    <q-drawer v-model="leftDrawerOpen" class="bg-primary" :width="250" :breakpoint="767" show-if-above bordered>
      <q-list>
        <q-item-label class="text-white" header> Navigation </q-item-label>
        <NavLink v-for="link in navLinks" :key="link.title" v-bind="link" />
        <q-item v-if="$q.platform.is.electron" @click="quitApp" clickable class="text-white absolute-bottom" tag="a">
          <q-item-section avatar>
            <q-icon name="power_settings_new" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Quit</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useStoreEntries } from 'src/stores/storeEntries'
import { useLightOrDark } from 'src/use/useLightOrDark'
import NavLink from 'components/Nav/NavLink.vue'

defineOptions({ name: 'MainLayout' })

const router = useRouter()
const $q = useQuasar()
const storeEntries = useStoreEntries()
const showFloating = ref(false) // Controls floating icon visibility

const navLinks = [
  { title: 'POS', icon: 'shopping_cart', link: '/' },
  { title: 'Stock', icon: 'list', link: '/stock' },
  { title: 'Wallet', icon: 'account_balance_wallet', link: '/expenses' },
  { title: 'Reports', icon: 'analytics', link: '/error' },
  { title: 'Settings', icon: 'settings', link: '/settings' }
]

const leftDrawerOpen = ref(false)

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const navigate = (to) => {
  router.push(to)
}

const quitApp = () => {
  $q.dialog({
    title: 'Confirm',
    message: 'Really quit Moneyballs?',
    cancel: true,
    persistent: true,
    html: true,
    ok: { label: 'Quit', color: 'negative', noCaps: true },
    cancel: { color: 'primary', noCaps: true }
  }).onOk(() => {
    if ($q.platform.is.electron) ipcRenderer.send('quit-app')
  })
}
</script>

<style scoped>
/* Floating Icons Container */
.floating-container {
  position: fixed;
  top: 53px; /* Just below the header */
  left: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 2000;
}

/* Floating Trigger Button (Always Visible) */
.floating-trigger {
  background: transparent !important;
  box-shadow: none !important;
  opacity: 0.6; /* Optional: Slight visibility */
  transition: opacity 0.3s;
}

.floating-trigger:hover {
  opacity: 1; /* Fully visible on hover */
}

/* Floating Icons */
.floating-icons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Floating Button Style */
.floating-btn {
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease-in-out;
}

/* Fade Transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
.custom-brown {
  color: #D2691E !important; /* A warm brown shade */
}
</style>
