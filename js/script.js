
const formatarPreco = v =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
 
const normalizar = t =>
  t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
 
 
/* Estrelas e Parallax */
(function () {
  const bannerEl = document.getElementById('banner');
  const estrelasEl = document.getElementById('estrelas');
  if (!bannerEl || !estrelasEl) return;
 
  for (let i = 0; i < 45; i++) {
    const e = document.createElement('span');
    const tamanho = Math.random() * 2 + 1;
    e.className = 'estrela';
    e.style.width = e.style.height = tamanho + 'px';
    e.style.left = Math.random() * 100 + '%';
    e.style.top = Math.random() * 100 + '%';
    e.style.animationDelay = (Math.random() * 3) + 's';
    e.style.animationDuration = (2 + Math.random() * 3) + 's';
    estrelasEl.appendChild(e);
  }
 
  const camadas = document.querySelectorAll('#banner .layer');
  const textoHero = document.querySelector('.hero-texto');
  let mouseX = 0;
  let mouseAlvo = 0;
  let ticking = false;
 
  function atualizarParallax() {
    const altura = bannerEl.offsetHeight;
    const rolagem = Math.min(window.scrollY, altura);
    const progresso = rolagem / altura;
 
    camadas.forEach(camada => {
      const velocidade = parseFloat(camada.dataset.speed) || 0;
      const profundidade = parseFloat(camada.dataset.depth) || 0;
      camada.style.transform =
        `translate3d(${mouseX * profundidade}px, ${rolagem * velocidade}px, 0)`;
    });
 
    if (textoHero) textoHero.style.opacity = 1 - progresso * 1.3;
    ticking = false;
  }
 
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(atualizarParallax);
    }
  }, { passive: true });
 
  window.addEventListener('mousemove', e => {
    mouseAlvo = (e.clientX / window.innerWidth - 0.5) * 2;
  });
 
  (function suavizar() {
    mouseX += (mouseAlvo - mouseX) * 0.06;
    if (Math.abs(mouseAlvo - mouseX) > 0.001) atualizarParallax();
    requestAnimationFrame(suavizar);
  })();
 
  atualizarParallax();
})();
 
 
/* Neve */
(function () {
  const canvas = document.getElementById('neve');
  if (!canvas) return;
 
  const ctx = canvas.getContext('2d');
  const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 
  let largura, altura, flocos = [], vento = 0, ventoAlvo = 0;
 
  function novoFloco(aleatorioY) {
    const z = Math.random();
    return {
      x: Math.random() * largura,
      y: aleatorioY ? Math.random() * altura : -10,
      raio: 1 + z * 3.2,
      queda: 0.4 + z * 1.6,
      balanco: Math.random() * Math.PI * 2,
      velBalanco: 0.01 + Math.random() * 0.02,
      opacidade: 0.35 + z * 0.55
    };
  }
 
  function criarFlocos() {
    const quantidade = Math.min(220, Math.floor(largura * altura / 9000));
    flocos = [];
    for (let i = 0; i < quantidade; i++) flocos.push(novoFloco(true));
  }
 
  function redimensionar() {
    const dpr = window.devicePixelRatio || 1;
    largura = window.innerWidth;
    altura = window.innerHeight;
    canvas.width = largura * dpr;
    canvas.height = altura * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    criarFlocos();
  }
 
  function desenharNeve() {
    ctx.clearRect(0, 0, largura, altura);
    vento += (ventoAlvo - vento) * 0.03;
 
    for (const f of flocos) {
      f.balanco += f.velBalanco;
      f.y += f.queda;
      f.x += Math.sin(f.balanco) * 0.5 + vento * (f.raio / 2);
 
      if (f.y > altura + 10 || f.x < -20 || f.x > largura + 20) {
        Object.assign(f, novoFloco(false));
        if (vento !== 0 && Math.random() < 0.5) f.x = Math.random() * largura;
      }
 
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.raio, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${f.opacidade})`;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = f.raio * 2;
      ctx.fill();
    }
    requestAnimationFrame(desenharNeve);
  }
 
  window.addEventListener('resize', redimensionar);
  window.addEventListener('mousemove', e => {
    ventoAlvo = (e.clientX / window.innerWidth - 0.5) * 3;
  });
 
  redimensionar();
  if (!reduzirMovimento) desenharNeve();
})();
 
 
/* Carrossel de promoções */
(function () {
  const trilho = document.getElementById('trilho');
  if (!trilho) return;

  const cards = trilho.querySelectorAll('.fundo-promo');
  const btnAnterior = document.getElementById('anterior');
  const btnProximo = document.getElementById('proximo');
  const slider = document.querySelector('.slider');

  let indice = 0;
  let timer;

  // quantos cards cabem na tela agora (definido no CSS pela variável --visiveis)
  const visiveis = () =>
    parseInt(getComputedStyle(trilho).getPropertyValue('--visiveis'), 10) || 3;
  const maxIndice = () => Math.max(0, cards.length - visiveis());

  function mover() {
    const passo = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 0;   // largura + gap
    trilho.style.transform = `translateX(${-indice * passo}px)`;
  }

  function proximo() {
    indice = indice >= maxIndice() ? 0 : indice + 1;
    mover();
  }

  function anterior() {
    indice = indice <= 0 ? maxIndice() : indice - 1;
    mover();
  }

  function iniciarAuto() {
    pararAuto();
    if (maxIndice() > 0) timer = setInterval(proximo, 3000);   // troca a cada 3 segundos
  }

  function pararAuto() {
    clearInterval(timer);
  }

  btnProximo.addEventListener('click', () => { proximo(); iniciarAuto(); });
  btnAnterior.addEventListener('click', () => { anterior(); iniciarAuto(); });
  slider.addEventListener('mouseenter', pararAuto);
  slider.addEventListener('mouseleave', iniciarAuto);

  // arrastar com o dedo no celular
  let toqueInicial = null;
  slider.addEventListener('touchstart', e => {
    toqueInicial = e.touches[0].clientX;
    pararAuto();
  }, { passive: true });
  slider.addEventListener('touchend', e => {
    if (toqueInicial !== null) {
      const diferenca = e.changedTouches[0].clientX - toqueInicial;
      if (Math.abs(diferenca) > 40) { diferenca < 0 ? proximo() : anterior(); }
      toqueInicial = null;
    }
    iniciarAuto();
  });

  // ao girar/redimensionar a tela, recalcula quantos cards aparecem
  window.addEventListener('resize', () => {
    indice = Math.min(indice, maxIndice());
    mover();
    iniciarAuto();
  });

  iniciarAuto();
})();
 
/* Botão da música */
(function () {
  const musica = document.getElementById('musicaFundo');
  const btnMusica = document.getElementById('btnMusica');
  if (!musica || !btnMusica) return;
 
  btnMusica.addEventListener('click', () => {
    if (musica.paused) {
      musica.play();
      btnMusica.classList.add('tocando');
      btnMusica.title = 'Parar música';
      btnMusica.setAttribute('aria-label', 'Parar música');
    } else {
      musica.pause();
      btnMusica.classList.remove('tocando');
      btnMusica.title = 'Tocar música';
      btnMusica.setAttribute('aria-label', 'Tocar música');
    }
  });
})();
 
/* Lista dos produtos */
(function () {
  const grade = document.getElementById('gradeProdutos');
  const filtros = document.getElementById('filtros');
  if (!grade || !filtros) return;
 
  if (typeof produtos === 'undefined') {
    grade.innerHTML = '<p class="sem-resultado">Não foi possível carregar os produtos.</p>';
    return;
  }
 
  const campoBusca = document.querySelector('.busca input');
  const formBusca = document.querySelector('.busca');
 
  let marcaAtual = 'Todas';
  let termo = new URLSearchParams(location.search).get('busca') || '';
 
  function mostrar(lista) {
    if (lista.length === 0) {
      grade.innerHTML = '<p class="sem-resultado">Nenhum perfume encontrado.</p>';
      return;
    }
    grade.innerHTML = lista.map(p => `
      <div class="fundo-promo">
        <img class="img-promo" src="${p.imagem}" alt="${p.nome}" loading="lazy">
        <h3 title="${p.nome}">${p.nome}</h3>
        <p class="desc-promo">${p.descricao}</p>
        <p class="preco-promo">${formatarPreco(p.preco)}</p>
        <a class="btn-produto" href="produto.html?id=${p.id}">Ver produto</a>
      </div>
    `).join('');
  }
 
  function aplicarFiltros() {
    const busca = normalizar(termo.trim());
    const lista = produtos.filter(p => {
      const daMarca = marcaAtual === 'Todas' || p.marca === marcaAtual;
      const texto = normalizar(`${p.nome} ${p.marca} ${p.categoria}`);
      return daMarca && texto.includes(busca);
    });
    mostrar(lista);
  }
 
  // botões de marca: "Todas" + uma de cada
  const marcas = ['Todas', ...new Set(produtos.map(p => p.marca))];
 
  filtros.innerHTML = marcas.map((m, i) =>
    `<button class="btn-filtro ${i === 0 ? 'ativo' : ''}" data-marca="${m}">${m}</button>`
  ).join('');
 
  filtros.addEventListener('click', e => {
    const btn = e.target.closest('.btn-filtro');
    if (!btn) return;
    filtros.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    marcaAtual = btn.dataset.marca;
    aplicarFiltros();
  });
 
  // barra de busca: filtra enquanto digita
  if (campoBusca && formBusca) {
    campoBusca.value = termo;
    campoBusca.addEventListener('input', () => {
      termo = campoBusca.value;
      aplicarFiltros();
    });
    formBusca.addEventListener('submit', e => {
      e.preventDefault();
      aplicarFiltros();
    });
  }
 
  aplicarFiltros();
})();
 
 
/* Página do produto */
(function () {
  const detalhe = document.getElementById('detalhe');
  if (!detalhe) return;
 
  if (typeof produtos === 'undefined') {
    detalhe.innerHTML = '<p class="sem-resultado">Não foi possível carregar os produtos.</p>';
    return;
  }
 
  const idProduto = Number(new URLSearchParams(location.search).get('id'));
  const perfume = produtos.find(item => item.id === idProduto);
 
  if (!perfume) {
    detalhe.innerHTML = '<p class="sem-resultado">Perfume não encontrado.</p>';
    return;
  }
 
  document.title = `${perfume.nome} | Noel Fragrances`;
 
  const whats = '5519999999999';
  const msg = encodeURIComponent(
    `Olá! Tenho interesse no perfume ${perfume.nome} (${perfume.marca}).`
  );
 
  detalhe.innerHTML = `
    <img class="detalhe-img" src="${perfume.imagem}" alt="${perfume.nome}">
    <div class="detalhe-info">
      <span class="detalhe-marca">${perfume.marca}</span>
      <h2>${perfume.nome}</h2>
      <p class="detalhe-tags">${perfume.categoria} · ${perfume.genero}</p>
      <p class="detalhe-desc">${perfume.descricao}</p>
      <p class="detalhe-preco">${formatarPreco(perfume.preco)}</p>
      <a class="btn-produto" href="https://wa.me/${whats}?text=${msg}" target="_blank" rel="noopener">Comprar pelo WhatsApp</a>
    </div>
  `;
 
  // outros perfumes da mesma categoria
  const rel = produtos
    .filter(x => x.categoria === perfume.categoria && x.id !== perfume.id)
    .slice(0, 4);
 
  if (rel.length) {
    document.getElementById('relTitulo').hidden = false;
    document.getElementById('relacionados').innerHTML = rel.map(x => `
      <div class="fundo-promo">
        <img class="img-promo" src="${x.imagem}" alt="${x.nome}" loading="lazy">
        <h3 title="${x.nome}">${x.nome}</h3>
        <p class="desc-promo">${x.descricao}</p>
        <p class="preco-promo">${formatarPreco(x.preco)}</p>
        <a class="btn-produto" href="produto.html?id=${x.id}">Ver produto</a>
      </div>
    `).join('');
  }
})();
 
const natal = new Date(2026, 11, 25);
const contadorEl = document.getElementById("contadorNatal");
 
function contador() {
    const agora = new Date();
    const diferenca = natal - agora;
    if (diferenca <= 0) {
        contadorEl.textContent = "🎄 Feliz Natal!";
        return;
      }
 
    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferenca / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferenca / (1000 * 60)) % 60);
    const segundos = Math.floor((diferenca / 1000) % 60);
 
    contadorEl.textContent =
        `Faltam ${dias} dias, ${horas} horas, ${minutos} minutos e ${segundos} segundos para o Natal!`;
}

if (contadorEl) {
    contador();
    setInterval(contador, 1000);
}

/* Mensagem de confirmação de formulário */

const formContato = document.getElementById("formContato");

if (formContato) {
    const resultado = document.getElementById("resultado");

    formContato.addEventListener("submit", function (event) {
        event.preventDefault();

        alert("Mensagem enviada! Em breve entraremos em contato.");
        if (resultado) resultado.textContent = "Mensagem enviada com sucesso!";
        formContato.reset();
    });
}

/* Menu hamburguer */
(function () {
  const botao = document.getElementById('menuToggle');
  const menu = document.getElementById('navLinks');
  if (!botao || !menu) return;

  function definir(aberto) {
    menu.classList.toggle('aberto', aberto);
    botao.classList.toggle('aberto', aberto);
    botao.setAttribute('aria-expanded', aberto);
    botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  }

  botao.addEventListener('click', () => definir(!menu.classList.contains('aberto')));

  // fecha ao clicar num link, ao apertar ESC ou ao clicar fora da navbar
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => definir(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') definir(false); });
  document.addEventListener('click', e => { if (!e.target.closest('.navbar')) definir(false); });

  // voltou pra tela grande: garante o menu fechado
  window.matchMedia('(min-width: 1181px)').addEventListener('change', e => {
    if (e.matches) definir(false);
  });
})();
