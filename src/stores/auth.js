import { defineStore } from 'pinia';
import { supabase } from 'src/config/supabase';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
  }),

  actions: {
    // Sign up a new user
    async signUp(email, password) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      this.user = data.user; // Store user data
    },

    // Log in an existing user
    async login(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      this.user = data.user; // Store user data
    },

    // Log out the user
    async logout() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      this.user = null;
    },

    // Fetch current user (useful on app startup)
    async fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        this.user = null;
      } else {
        this.user = data.user; // Store authenticated user
      }
    },

    // Automatically track auth state changes
    listenForAuthChanges() {
      supabase.auth.onAuthStateChange((event, session) => {
        this.user = session?.user || null;
      });
    }
  }
});
