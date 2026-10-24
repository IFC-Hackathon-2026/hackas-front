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

export const useUserStore = defineStore('user', () => {

  const accessToken = ref(readToken('access_token'));

  const refreshToken = ref(readToken('refresh_token'));

  const user = ref(null);
  
  const users = ref([]);

  const isAuthenticated = computed(() => !!accessToken.value);

  const resumoTarefas = computed(() => user.value?.resumo_tarefas ?? {
    total: 0,
    concluidas: 0,
    nao_concluidas: 0,
    atrasadas: 0,
    progresso: 0,
  });

  async function getMe() {
    const { data } = await userService.getMe();
    user.value = data;
    return data;
  }

  async function updateMe(data) {
    const response = await userService.updateMe(data);
    user.value = response.data;
    return response.data;
  }

  async function getAllUsers() {
    const { data } = await userService.getAllUsers();
    users.value = data.results ?? data;
    return users.value;
  }

  async function getUser(id) {
    const { data } = await userService.getUser(id);
    return data;
  }

  async function updatePhoto(file) {
    const { data: image } = await userService.uploadImage(file);
    return updateMe({ foto_attachment_key: image.attachment_key });
  }

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
    return getMe();
  }

  async function register(email, password, name, foto) {
    await userService.register(email, password, name);
    await login(email, password);

    if (foto) {
      await updatePhoto(foto);
    }
  }

  function logout() {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    users.value = [];
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  return {
    accessToken,
    refreshToken,
    user,
    users,
    isAuthenticated,
    resumoTarefas,
    login,
    register,
    logout,
    getMe,
    updateMe,
    getAllUsers,
    getUser,
    updatePhoto,
  };
});
