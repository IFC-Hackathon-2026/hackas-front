import { useToast } from 'vue-toastification'

export const notificacao = {
  sucesso(mensagem) {
    useToast().success(mensagem)
  },

  erro(mensagem) {
    useToast().error(mensagem)
  },

  aviso(mensagem) {
    useToast().warning(mensagem)
  },

  informacao(mensagem) {
    useToast().info(mensagem)
  },
}