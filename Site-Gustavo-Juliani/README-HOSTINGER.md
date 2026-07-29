# Site pessoal de Gustavo Juliani

Esta pasta é independente do aplicativo GuFix. Ela contém um site estático e não precisa de Node.js, npm, Vite ou banco de dados.

## 1. Configurar os contatos

Abra `site-config.js` e preencha:

```js
window.GUSTAVO_SITE = {
  name: 'Gustavo Juliani',
  whatsapp: '5511999999999',
  email: 'email@dominio.com.br',
  instagram: 'https://instagram.com/usuario',
  appUrl: 'https://app.gufix.com.br'
};
```

No WhatsApp, use código do país + DDD + número, somente números.

## 2. Enviar para a Hostinger

1. Entre no hPanel da Hostinger.
2. Abra **Sites > Gerenciar > Gerenciador de Arquivos**.
3. Entre na pasta `public_html` do domínio pessoal.
4. Remova apenas a página padrão da Hostinger, se existir.
5. Envie o conteúdo desta pasta, mantendo `assets`, `css` e `js`.
6. Confirme que `index.html` ficou diretamente dentro de `public_html`.
7. Acesse o domínio e pressione `Ctrl + Shift + R`.

## Estrutura que deve ficar no public_html

```text
public_html/
  .htaccess
  index.html
  site-config.js
  assets/
    favicon.svg
  css/
    styles.css
  js/
    main.js
```

Não envie as pastas `src`, `server`, `Mobile`, `node_modules` ou os arquivos do aplicativo GuFix para o domínio pessoal.
