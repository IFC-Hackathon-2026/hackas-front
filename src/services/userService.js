import api from "@/api/config";

export default class UserService {
  async login(email, password){
    const response = await api.post('/token/', { email, password });
    return response.data
  }
}
