import { useToast } from 'vue-toastification'

export function definirContainerNotificacoes(container) {
  // Mantém os toasts visíveis também sobre os modais nativos.
  useToast().updateDefaults({ container })
}

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
