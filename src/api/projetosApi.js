
import apiClient from './config';

const projetosApi = {
  listar() {
    return apiClient.get('/projetos/');
  },

  detalhar(id) {
    return apiClient.get(`/projetos/${id}/`);
  }
};

export default projetosApi;
