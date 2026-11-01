// Movimento do site: entradas orquestradas ao rolar, capa com entrada própria e parallax leve.
// Tudo é desligado quando o aparelho pede menos movimento (prefers-reduced-motion).
// O conteúdo só é escondido depois que este script liga a classe .m no <html>,
// então sem JavaScript a página aparece inteira.

const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Divide um título em palavras para elas subirem uma a uma
function quebrarPalavras(el) {
  if (el.dataset.quebrado) return
  el.dataset.quebrado = '1'
  const partes = el.innerHTML.split(/(\s+|<br\s*\/?>)/)
  let i = 0
  el.innerHTML = partes.map(p => {
    if (!p || /^\s+$/.test(p) || /^<br/i.test(p)) return p
    return `<span class="pl"><span class="pl-in" style="--i:${i++}">${p}</span></span>`
  }).join('')
  el.setAttribute('aria-label', el.textContent)
}

export function iniciarMovimento(raiz = document) {
  if (reduz) return
  document.documentElement.classList.add('m')

  // títulos de seção: palavras sobem
  raiz.querySelectorAll('.titulo, .port-nome, .capa-titulo, .p-cabeca .titulo-xl').forEach(el => {
    quebrarPalavras(el)
    el.classList.add('rv-palavras')
  })
  // imagens: revelação em cortina
  raiz.querySelectorAll('.port-foto, .p-galeria figure:not(.vt-alvo)').forEach(el => el.classList.add('rv-img'))
  // listas em sequência: cada item entra um pouco depois do anterior
  raiz.querySelectorAll('.passos, .fases, .diario, .destaques, .caminho ul').forEach(lista => {
    lista.classList.add('rv-seq')
    ;[...lista.children].forEach((li, i) => li.style.setProperty('--i', i))
  })
  // blocos de texto simples
  raiz.querySelectorAll('.tese-frase, .tese-lado, .bloco-cabeca .texto, .port-info > :not(.port-nome), .caminho .subtitulo, .caminho .section-label, .onde-grade .lead, .onde-grade .texto, .carimbo, .sim, .p-cta .btn, .contato-form, .contato-canais, .p-cabeca .lead, .p-cabeca .ficha, .p-cabeca .estagio')
    .forEach(el => el.classList.add('rv-sobe'))

  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach(e => {
      if (e.isIntersecting) {
        // imagens com cortina são observadas pelo pai (o clip-path esconde o próprio elemento do observer)
        const alvos = e.target.__alvos || [e.target]
        alvos.forEach(a => a.classList.add('em-vista'))
        obs.unobserve(e.target)
      }
    })
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 })

  raiz.querySelectorAll('.rv-palavras, .rv-seq, .rv-sobe').forEach(el => obs.observe(el))
  raiz.querySelectorAll('.rv-img').forEach(el => {
    const pai = el.parentElement
    pai.__alvos = [...(pai.__alvos || []), el]
    obs.observe(pai)
  })

  // capa: entra assim que a página carrega, e a imagem desliza mais devagar que a rolagem
  const capa = document.querySelector('.capa')
  if (capa) {
    requestAnimationFrame(() => capa.classList.add('capa-entrou'))
    const img = capa.querySelector('.capa-img')
    let pedido = false
    const mover = () => {
      pedido = false
      const y = window.scrollY
      if (y > capa.offsetHeight) return
      img.style.transform = `translate3d(0, ${y * 0.28}px, 0) scale(1.04)`
    }
    window.addEventListener('scroll', () => {
      if (!pedido) { pedido = true; requestAnimationFrame(mover) }
    }, { passive: true })
  }
}
