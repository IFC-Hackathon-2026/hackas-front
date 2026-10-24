import api from '@/api/config'

export default class PedidoParticipacaoService {
  getPedidos(params = {}) {
    return api.get('/pedidos-participacao/', { params })
  }

  getPedido(id) {
    return api.get(`/pedidos-participacao/${id}/`)
  }

  solicitarEntrada(projetoId) {
    return api.post('/pedidos-participacao/', { projeto: projetoId })
  }

  convidarUsuario(projetoId, usuarioId) {
    return api.post('/pedidos-participacao/', {
      projeto: projetoId,
      usuario: usuarioId,
    })
  }

  aceitarPedido(id) {
    return api.post(`/pedidos-participacao/${id}/aceitar/`)
  }

  recusarPedido(id) {
    return api.post(`/pedidos-participacao/${id}/recusar/`)
  }

  excluirPedido(id) {
    return api.delete(`/pedidos-participacao/${id}/`)
  }
}
