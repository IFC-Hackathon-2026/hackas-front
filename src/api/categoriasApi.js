
import apiClient from './config';

const categoriasApi = {
  listar() {
    return apiClient.get('/categorias/');
  }
};

export default categoriasApi;
