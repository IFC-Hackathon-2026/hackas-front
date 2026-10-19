import { computed, ref } from "vue";
import { defineStore } from "pinia";
import UserService from "@/services/userService";

const userService = new UserService();

function readToken(key) {
  const token = localStorage.getItem(key);
  if (!token || token === 'undefined' || token === 'null') {
    localStorage.removeItem(key);
    return null;
  }
  return token;
}

export const useAuthStore = defineStore('auth', ()=>{
  const accessToken = ref(readToken('access_token'));
  const refreshToken = ref(readToken('refresh_token'));

  const isAuthenticated = computed(() => !!accessToken.value);

  async function login(email, password) {
    const { data } = await userService.login(email, password);
    if (typeof data?.access !== 'string' || !data.access ||
        typeof data?.refresh !== 'string' || !data.refresh) {
      throw new Error('Resposta de login sem tokens válidos.');
    }

    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    accessToken.value = data.access;
    refreshToken.value = data.refresh;
  }

  function logout() {
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  return { accessToken, refreshToken, isAuthenticated, login, logout };
});
