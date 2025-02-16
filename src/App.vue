<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useStoreSettings } from 'src/stores/storeSettings'
import { useStoreEntries } from 'src/stores/storeEntries'
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();

defineOptions({
  name: 'App'
});

const storeSettings = useStoreSettings(),
      storeEntries = useStoreEntries(),
      $q = useQuasar(),
      router = useRouter()

onMounted(() => {
  authStore.fetchUser(); // Fetch user when app starts
  authStore.listenForAuthChanges(); // Listen for auth changes
 
  storeSettings.loadSettings()
  storeEntries.loadEntries()

  if ($q.platform.is.electron) {
    ipcRenderer.on('show-settings', () => {
      router.push('/settings')
    })
  }

})

// window.addEventListener('contextmenu', e => {
//   e.preventDefault()
// })
</script>
