import api from "@/api/config";

export default class UserService {
  async login(email, password){
      return await api.post('/token/', { email, password });
  }

  async register(email, password, name, foto) {
    return await api.post('/registro/', { email, name, password, foto });
  }
}
