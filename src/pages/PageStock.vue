<template>
  <q-page padding>
    <div class="q-pa-md">
      
        <!-- Tabs -->
        <q-tabs
        v-model="tab"
        inline-label
        
      >
        <q-tab name="mails" icon="note_add" label="Add Stock" />
        <q-tab name="alarms" icon="receipt_long" label="Reports" />
        
      </q-tabs>

        <!-- Tab Panels -->
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="mails">
           <newStk/>
          </q-tab-panel>

          <q-tab-panel name="alarms">
          Alarms
          </q-tab-panel>

          <q-tab-panel name="movies">
            <!--<MovieComponent /> -->
            Movies
          </q-tab-panel>
        </q-tab-panels>
      </div>
   
  </q-page>
</template>
<script setup>
import { ref } from 'vue'
import newStk from 'src/components/newStk.vue';
const tab = ref('mails')
</script>


