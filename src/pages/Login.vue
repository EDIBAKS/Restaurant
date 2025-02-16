<template>
    <q-page>
      <q-card class="q-pa-md">
        <q-input v-model="email" label="Email" />
        <q-input v-model="password" type="password" label="Password" />
        <q-btn label="Login" @click="handleLogin" />
      </q-card>
    </q-page>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useAuthStore } from 'src/stores/auth';
  import { useRouter } from 'vue-router';
  
  const email = ref('');
  const password = ref('');
  const authStore = useAuthStore();
  const router = useRouter();
  
  const handleLogin = async () => {
    try {
      await authStore.login(email.value, password.value);
      router.push('/');
    } catch (error) {
      console.error('Login error:', error.message);
    }
  };
  </script>
  