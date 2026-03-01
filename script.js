// Fade-in ao rolar a página
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible')
    }
  })
}, { threshold: 0.1 })

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el))

// Nav: muda opacidade ao rolar
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav')
  if (window.scrollY > 50) {
    nav.style.background = 'rgba(10,10,10,0.97)'
  } else {
    nav.style.background = 'rgba(10,10,10,0.9)'
  }
})
