(function () {
  const config = window.GUSTAVO_SITE || {};
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  const menuClose = document.querySelector('.menu-close');
  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#form-status');

  document.querySelector('#current-year').textContent = new Date().getFullYear();

  document.querySelectorAll('[data-app-link]').forEach(function (link) {
    link.href = config.appUrl || 'https://app.gufix.com.br';
    link.target = '_blank';
    link.rel = 'noopener';
  });

  function normalizeWhatsapp(value) {
    return String(value || '').replace(/\D/g, '');
  }

  const contacts = {
    whatsapp: normalizeWhatsapp(config.whatsapp) ? 'https://wa.me/' + normalizeWhatsapp(config.whatsapp) : '',
    email: config.email ? 'mailto:' + config.email : '',
    instagram: config.instagram || ''
  };

  document.querySelectorAll('[data-contact]').forEach(function (link) {
    const type = link.dataset.contact;
    if (contacts[type]) {
      link.href = contacts[type];
      if (type !== 'email') {
        link.target = '_blank';
        link.rel = 'noopener';
      }
    } else {
      link.classList.add('contact-not-configured');
      link.title = 'Configure este contato em site-config.js';
    }
  });

  function setMenu(open) {
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    menuButton.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  }

  menuButton.addEventListener('click', function () { setMenu(true); });
  menuClose.addEventListener('click', function () { setMenu(false); });
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const goal = String(data.get('goal') || '').trim();
    const message = String(data.get('message') || '').trim();
    const text = 'Olá, Gustavo! Meu nome é ' + name + '. Meu objetivo é: ' + goal + '.' + (message ? ' ' + message : '');

    if (normalizeWhatsapp(config.whatsapp)) {
      window.open('https://wa.me/' + normalizeWhatsapp(config.whatsapp) + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      status.textContent = 'Abrindo o WhatsApp para enviar sua mensagem.';
      return;
    }

    if (config.email) {
      window.location.href = 'mailto:' + config.email + '?subject=' + encodeURIComponent('Contato pelo site - ' + name) + '&body=' + encodeURIComponent(text);
      status.textContent = 'Abrindo seu aplicativo de e-mail.';
      return;
    }

    status.textContent = 'Antes de publicar, preencha o WhatsApp ou e-mail no arquivo site-config.js.';
  });

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(function (element) { observer.observe(element); });
})();
