# hackas-front

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### PWA

O PWA é configurado no `vite.config.js` com `vite-plugin-pwa`. O build gera o
manifesto, o Service Worker e seu registro automático, usando os ícones
`public/launchericon-192x192.png` e `public/launchericon-512x512.png`.

Para testar a versão instalável:

```sh
npm run build
npm run preview
```

Abra o endereço do preview e confira **Application > Manifest / Service Workers**
no DevTools. Depois do primeiro carregamento e da ativação do Service Worker,
os arquivos da interface ficam disponíveis offline. Consultas e alterações na
API continuam exigindo conexão.

Em produção, use HTTPS. O Service Worker não é ativado no `npm run dev`.
