import { renderHeader } from './header.js'
import { renderFooter } from './footer.js'

renderHeader()
renderFooter()

// Fade-in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible')
  })
}, { threshold: 0.1 })
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
