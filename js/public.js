'use strict';

function crearFallbackImagen(img, numero) {
  const box = document.createElement('div');
  box.className = 'fallback-slide';

  const indice = document.createElement('b');
  indice.textContent = String(numero).padStart(2, '0');

  const titulo = document.createElement('span');
  titulo.textContent = 'Imagen del proyecto';

  const ruta = document.createElement('small');
  ruta.textContent = `Agregar Recursos/${numero}.webp`;

  box.append(indice, titulo, ruta);
  img.replaceWith(box);
}

function prepararImagenes() {
  document.querySelectorAll('img[data-fallback-slide]').forEach((img) => {
    img.addEventListener('error', () => {
      const numero = Number.parseInt(img.dataset.fallbackSlide || '0', 10);
      crearFallbackImagen(img, Number.isFinite(numero) ? numero : 0);
    }, { once: true });
  });

  document.querySelectorAll('img[data-fallback-hero]').forEach((img) => {
    img.addEventListener('error', () => {
      const parent = img.parentElement;
      if (parent) parent.classList.add('missing');
      img.remove();
    }, { once: true });
  });
}

function iniciarCarrusel() {
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll('.slide')];
  const dots = carousel.querySelector('[data-dots]');
  const prev = carousel.querySelector('[data-prev]');
  const next = carousel.querySelector('[data-next]');
  if (!slides.length || !dots || !prev || !next) return;

  let current = 0;
  let timer;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
    [...dots.children].forEach((dot, i) => dot.classList.toggle('active', i === current));
    clearInterval(timer);
    timer = window.setInterval(() => show(current + 1), 5500);
  };

  slides.forEach((_, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Ir a imagen ${i + 1}`);
    button.addEventListener('click', () => show(i));
    dots.appendChild(button);
  });

  prev.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  show(0);
}

prepararImagenes();
iniciarCarrusel();
