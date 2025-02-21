<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useStoreSettings } from 'src/stores/storeSettings'
import { useStoreAuth } from 'src/stores/storeAuth'
import { useStoreEntries } from 'src/stores/storeEntries'

defineOptions({
  name: 'App'
});

const storeSettings = useStoreSettings()
const storeAuth= useStoreAuth(),
      storeEntries = useStoreEntries(),
      $q = useQuasar(),
      router = useRouter()

onMounted(() => {
    storeAuth.init()
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