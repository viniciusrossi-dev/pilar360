// Dados públicos dos empreendimentos da Pilar 360.
// Fonte única para a home (Rua 125), a página de cada projeto, o cronograma e o diário de obra.
// Atualize aqui (ou peça ao Claude no chat de orçamento e evolução da obra) e publique.

export const EMPRESA = {
  nome: 'Pilar 360 Construtora e Incorporadora Ltda',
  cnpj: '57.784.268/0001-89',
  whatsapp: '5551992143280',
  whatsappLabel: '(51) 99214-3280',
  email: 'viniciusrossi@hotmail.com.br',
  instagram: 'pilar360.construtora',
  rua: 'Rua Pedro Conceição Veigas',
  ruaApelido: 'Rua 125',
  bairro: 'Jardim Algarve',
  cidade: 'Alvorada, RS',
}

// Linha do tempo da empresa (eventos públicos, em ordem)
export const HISTORIA = [
  { data: '2024-10', titulo: 'Nasce a Pilar 360', texto: 'Uma construtora pequena com uma ideia simples: habitação acessível com projeto bem resolvido.' },
  { data: '2024-10', titulo: 'Primeiro terreno: lote 12 da Rua 125', texto: '175 m² no Jardim Algarve, em Alvorada. Vai virar o Residencial Sunset.' },
  { data: '2024-11', titulo: 'Lote 04 com projeto aprovado', texto: 'Compramos o segundo terreno, na mesma rua, já com projeto de 4 apartamentos aprovado.' },
  { data: '2025-05', titulo: 'Contenção do Sunset concluída', texto: '87 m² de muro de contenção nos fundos do lote 12, executado antes do prédio.' },
  { data: '2025-07', titulo: 'Fundação do Aloha', texto: 'Sondagem, terraplanagem e estacas. Começa a primeira obra.' },
  { data: '2026-04', titulo: 'Aloha pronto', texto: 'Estrutura, telhado, acabamentos e fachada concluídos em nove meses de obra.' },
  { data: '2026-05', titulo: 'Habite-se do Aloha requerido', texto: 'Documentação de entrega enviada à prefeitura.' },
  { data: '2026-11', titulo: 'Começa o Sunset', texto: 'Furação das estacas do segundo prédio: 13 apartamentos em 4 pavimentos.' },
]

// 24 etapas do contrato de mão de obra do Sunset (Anexo III) — semanas contadas a partir da furação.
const ETAPAS_SUNSET = [
  [1, 'Locação da obra e canteiro', 1, 1, 3000],
  [2, 'Fundação: estacas e blocos', 2, 4, 9000],
  [3, 'Radier e impermeabilização da fundação', 5, 5, 10000],
  [4, 'Esgoto primário e caixas', 6, 6, 5000],
  [5, 'Aterro e contrapiso do térreo', 7, 8, 10000],
  [6, 'Térreo: alvenaria estrutural', 9, 9, 12000],
  [7, '1ª laje e escada', 10, 11, 18000],
  [8, '2º pavimento: alvenaria', 12, 13, 20000],
  [9, '2ª laje e escada', 14, 15, 14000],
  [10, '3º pavimento: alvenaria', 16, 17, 20000],
  [11, '3ª laje e escada', 18, 19, 16000],
  [12, '4º pavimento: alvenaria', 20, 21, 20000],
  [13, 'Laje de cobertura', 22, 23, 17000],
  [14, 'Telhado, caixa d’água e calhas', 24, 26, 16000],
  [15, 'Shafts', 25, 25, 7430],
  [16, 'Instalações embutidas e testes', 9, 30, 15000],
  [17, 'Reboco de banheiros e cozinhas', 27, 28, 10000],
  [18, 'Reboco externo (fachadas)', 27, 33, 26000],
  [19, 'Contrapisos, cerâmica e azulejos', 29, 36, 27000],
  [20, 'Pintura interna e externa', 37, 41, 23000],
  [21, 'Elétrica: fiação, quadros e medição', 40, 41, 15000],
  [22, 'Louças, metais e portas', 42, 43, 6000],
  [23, 'Pátio, calçada e ligações', 42, 43, 10000],
  [24, 'Limpeza, vistoria e entrega', 44, 48, 3000],
].map(([n, nome, semIni, semFim, peso]) => ({ n, nome, semIni, semFim, peso, pct: 0 }))

export const PROJETOS = [
  {
    slug: 'residencial-sunset',
    nome: 'Residencial Sunset',
    numero: '136',
    lote: '12',
    status: 'obra',
    statusTexto: 'Em obra',
    resumo: '13 apartamentos de 1 dormitório em 4 pavimentos, com sacada nos andares de cima.',
    unidades: 13,
    pavimentos: 4,
    tipologia: '1 dormitório',
    areaUnidade: '30 a 35 m²',
    areaConstruida: '474,90 m²',
    terreno: '175 m²',
    sistema: 'Alvenaria estrutural',
    inicio: '2026-11-02', // furação — confirmar a data real
    duracaoSemanas: 48,
    entregaPrevista: '2º semestre de 2027',
    carimbo: [
      ['Empreendimento', 'Residencial Sunset'],
      ['Endereço', 'Rua Pedro Conceição Veigas, 136 · Jardim Algarve · Alvorada/RS'],
      ['Lote / quadra', 'Lote 12 · Quadra E-12A · Loteamento Algarve'],
      ['Matrícula', '73.404 · Registro de Imóveis de Alvorada'],
      ['Alvará de construção', 'nº 245/2025 · válido até 25/10/2027'],
      ['Responsável técnico', 'Eng. Marcelo Neves · ART 14398036'],
      ['Área construída', '474,90 m² em 4 pavimentos'],
      ['Unidades', '13 apartamentos de 1 dormitório'],
    ],
    tem3d: true,
    imagem: '/imagens/sunset.jpg',
    imagemTipo: 'Render da fachada',
    etapas: ETAPAS_SUNSET,
    diario: [
      { data: '2026-10-28', titulo: 'Compras da fundação', texto: 'Aço, madeira e arame da fundação em cotação com três fornecedores, para estar na obra antes da furação.' },
      { data: '2026-10-13', titulo: 'Equipe definida', texto: 'A mesma equipe de execução do Aloha assume o Sunset, com cronograma de 24 etapas e reunião semanal de obra.' },
      { data: '2025-10-24', titulo: 'Alvará aprovado', texto: 'Prefeitura de Alvorada aprova o alvará de construção nº 245/2025.' },
      { data: '2025-05-30', titulo: 'Muro de contenção concluído', texto: 'Contenção de 87 m² nos fundos do terreno, com projeto e acompanhamento do nosso engenheiro.' },
      { data: '2024-10-26', titulo: 'Terreno adquirido', texto: 'Lote 12 da Rua 125, com 175 m².' },
    ],
  },
  {
    slug: 'residencial-aloha',
    nome: 'Residencial Aloha',
    numero: '194',
    lote: '04',
    status: 'pronto',
    statusTexto: 'Obra concluída',
    resumo: '4 apartamentos de 1 dormitório: pátio privativo no térreo, sacada no andar de cima.',
    unidades: 4,
    pavimentos: 2,
    tipologia: '1 dormitório',
    areaUnidade: '33 a 35 m²',
    areaConstruida: '148,60 m²',
    terreno: '175 m²',
    sistema: 'Alvenaria estrutural',
    entregaPrevista: '2026',
    carimbo: [
      ['Empreendimento', 'Condomínio Edifício Aloha'],
      ['Endereço', 'Rua Pedro Conceição Veigas, 194 · Jardim Algarve · Alvorada/RS'],
      ['Lote / quadra', 'Lote 04 · Quadra E-12A · Loteamento Algarve'],
      ['Matrícula', '73.396 · Registro de Imóveis de Alvorada'],
      ['Alvará de construção', 'nº 255/2024'],
      ['Responsável técnico', 'Eng. Mateus Pinto da Silva · ART 14140647'],
      ['Área construída', '148,60 m² em 2 pavimentos'],
      ['Unidades', '101 e 102 com pátio · 201 e 202 com sacada'],
    ],
    tem3d: false,
    imagem: '/imagens/aloha-noite.jpg',
    imagemTipo: 'Render da fachada',
    galeria: [
      { src: '/imagens/aloha-dia.jpg', legenda: 'Fachada de dia (render)' },
      { src: '/imagens/aloha-noite.jpg', legenda: 'Fachada à noite (render)' },
    ],
    diario: [
      { data: '2026-09-15', titulo: 'Ajustes de entrega', texto: 'Revisão item a item antes da entrega das chaves: acabamentos, louças e áreas comuns.' },
      { data: '2026-05-05', titulo: 'Habite-se requerido', texto: 'Documentação e relatório fotográfico entregues à prefeitura.' },
      { data: '2026-04-20', titulo: 'Fachada pronta', texto: 'Esquadrias, pintura e fachada concluídas.' },
      { data: '2026-01-20', titulo: 'Telhado', texto: 'Cobertura executada; começam gesso e pisos.' },
      { data: '2025-12-15', titulo: 'Lajes concluídas', texto: 'Estrutura dos dois pavimentos fechada.' },
      { data: '2025-07-15', titulo: 'Estacas executadas', texto: 'Fundação com estacas de 40 cm de diâmetro.' },
      { data: '2024-11-26', titulo: 'Terreno e projeto adquiridos', texto: 'Lote 04 da Rua 125, com projeto de 4 unidades aprovado.' },
    ],
  },
]

// Próximos lotes na mesma rua (em estudo — sem promessa de lançamento)
export const PROXIMOS = [
  { rotulo: 'Próximo lote', texto: 'Em estudo' },
  { rotulo: 'Próximo lote', texto: 'Em estudo' },
]

export function getProjeto(slug) {
  return PROJETOS.find(p => p.slug === slug)
}

// Semana da obra hoje (1 = semana da furação). 0 = ainda não começou.
export function semanaAtual(projeto, hoje = new Date()) {
  if (!projeto.inicio) return null
  const ini = new Date(projeto.inicio + 'T00:00:00')
  const dias = Math.floor((hoje - ini) / 86400000)
  if (dias < 0) return 0
  return Math.min(Math.floor(dias / 7) + 1, projeto.duracaoSemanas)
}

// Avanço físico ponderado pelo peso de cada etapa (0–100)
export function avancoFisico(projeto) {
  if (projeto.status === 'pronto') return 100
  const et = projeto.etapas || []
  const total = et.reduce((a, e) => a + e.peso, 0)
  if (!total) return 0
  return Math.round(et.reduce((a, e) => a + e.peso * (e.pct / 100), 0) / total * 100)
}

// Avanço previsto para a semana atual
export function avancoPrevisto(projeto, semana) {
  const et = projeto.etapas || []
  const total = et.reduce((a, e) => a + e.peso, 0)
  if (!total || !semana) return 0
  let s = 0
  for (const e of et) {
    const dur = e.semFim - e.semIni + 1
    const feito = Math.max(0, Math.min(dur, semana - e.semIni + 1))
    s += e.peso * (feito / dur)
  }
  return Math.round(s / total * 100)
}
