import api from "@/api/config";

export default class UserService {
  async login(email, password) {
    return api.post('/token/', { email, password })
  }

  async register(email, password, name) {
    return api.post('/registro/', { email, name, password })
  }

  async getMe() {
    return api.get('/usuarios/me/')
  }

  async updateMe(data) {
    return api.patch('/usuarios/me/', data)
  }

  async getAllUsers() {
    return api.get('/usuarios/')
  }

  async getUser(id) {
    return api.get(`/usuarios/${id}/`)
  }

  async uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)

    return api.post('/media/images/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }
}
