// Dados públicos dos empreendimentos da Pilar 360.
// Fonte única para a home, a página de cada empreendimento, as fases da obra e o diário.
// Atualize aqui (ou peça ao Claude no chat de orçamento e evolução da obra) e publique.

export const EMPRESA = {
  nome: 'Pilar 360 Construtora e Incorporadora Ltda',
  cnpj: '57.784.268/0001-89',
  whatsapp: '5551992143280',
  whatsappLabel: '(51) 99214-3280',
  email: 'contatopilar360@gmail.com',
  instagram: 'pilar360.construtora',
  regiao: 'Grande Porto Alegre',
}

// Fases que o público vê. Cada fase agrupa etapas do contrato de execução (campo `etapas`, n de 1 a 24).
export const FASES = [
  { nome: 'Fundação', etapas: [1, 2, 3, 4, 5] },
  { nome: 'Estrutura', etapas: [6, 7, 8, 9, 10, 11, 12, 13] },
  { nome: 'Cobertura', etapas: [14, 15] },
  { nome: 'Instalações e revestimentos', etapas: [16, 17, 18, 19] },
  { nome: 'Acabamentos', etapas: [20, 21, 22, 23] },
  { nome: 'Entrega', etapas: [24] },
]

// 24 etapas do contrato de execução do Sunset (Anexo III). Uso interno: alimentam as fases.
// Atualize `pct` (0–100) depois de cada reunião semanal de obra.
const ETAPAS_SUNSET = [
  [1, 'Locação da obra e canteiro', 3000],
  [2, 'Fundação: estacas e blocos', 9000],
  [3, 'Radier e impermeabilização da fundação', 10000],
  [4, 'Esgoto primário e caixas', 5000],
  [5, 'Aterro e contrapiso do térreo', 10000],
  [6, 'Térreo: alvenaria estrutural', 12000],
  [7, '1ª laje e escada', 18000],
  [8, '2º pavimento: alvenaria', 20000],
  [9, '2ª laje e escada', 14000],
  [10, '3º pavimento: alvenaria', 20000],
  [11, '3ª laje e escada', 16000],
  [12, '4º pavimento: alvenaria', 20000],
  [13, 'Laje de cobertura', 17000],
  [14, 'Telhado, caixa d’água e calhas', 16000],
  [15, 'Shafts', 7430],
  [16, 'Instalações embutidas e testes', 15000],
  [17, 'Reboco de banheiros e cozinhas', 10000],
  [18, 'Reboco externo (fachadas)', 26000],
  [19, 'Contrapisos, cerâmica e azulejos', 27000],
  [20, 'Pintura interna e externa', 23000],
  [21, 'Elétrica: fiação, quadros e medição', 15000],
  [22, 'Louças, metais e portas', 6000],
  [23, 'Pátio, calçada e ligações', 10000],
  [24, 'Limpeza, vistoria e entrega', 3000],
].map(([n, nome, peso]) => ({ n, nome, peso, pct: 0 }))

export const PROJETOS = [
  {
    slug: 'residencial-aloha',
    nome: 'Residencial Aloha',
    status: 'pronto',
    estagio: 'Obra concluída',
    chamada: 'Quatro apartamentos, cada um com o seu espaço ao ar livre.',
    resumo: '4 apartamentos de 1 dormitório no Jardim Algarve, em Alvorada. Pátio privativo no térreo, sacada no andar de cima e condomínio enxuto.',
    unidades: 4,
    tipologia: '1 dormitório',
    areaUnidade: '33 a 35 m²',
    destaques: ['Pátio privativo ou sacada em todas as unidades', 'Medidor de água individual', 'Ponto para ar-condicionado', 'Manual do proprietário na entrega'],
    local: 'Jardim Algarve, Alvorada',
    carimbo: [
      ['Empreendimento', 'Condomínio Edifício Aloha'],
      ['Endereço', 'Rua Pedro Conceição Veigas, 194 · Jardim Algarve · Alvorada/RS'],
      ['Matrícula', '73.396 · Registro de Imóveis de Alvorada'],
      ['Alvará de construção', 'nº 255/2024'],
      ['Responsável técnico', 'Eng. Mateus Pinto da Silva · ART 14140647'],
      ['Área construída', '148,60 m² em 2 pavimentos'],
    ],
    tem3d: false,
    imagem: '/imagens/aloha-dia.jpg',
    imagemTipo: 'Render da fachada',
    galeria: [
      { src: '/imagens/aloha-noite.jpg', legenda: 'Fachada à noite · render' },
      { src: '/imagens/aloha-dia.jpg', legenda: 'Fachada de dia · render' },
    ],
    diario: [
      { data: '2026-09', titulo: 'Últimos retoques', texto: 'Revisamos cada apartamento, item por item, para entregar do jeito que a gente gostaria de receber.' },
      { data: '2026-05', titulo: 'Pronto e documentado', texto: 'Obra concluída e habite-se requerido na prefeitura. Junto com as chaves, cada morador recebe o manual do proprietário.' },
      { data: '2026-04', titulo: 'A fachada apareceu', texto: 'Esquadrias, pintura e iluminação: o Aloha ganhou a cara que imaginamos lá no projeto.' },
      { data: '2026-01', titulo: 'Telhado no lugar', texto: 'Prédio coberto. Daqui em diante, a obra passa para dentro dos apartamentos: gesso, pisos e revestimentos.' },
      { data: '2025-12', titulo: 'Estrutura de pé', texto: 'Os dois pavimentos estão levantados. Já dá para entrar e imaginar cada apartamento.' },
      { data: '2025-07', titulo: 'Primeiro dia de obra', texto: 'Começamos por onde tudo começa: uma fundação bem feita, com estacas e sondagem do terreno.' },
    ],
  },
  {
    slug: 'residencial-sunset',
    nome: 'Residencial Sunset',
    status: 'obra',
    estagio: 'Em construção',
    chamada: '13 apartamentos compactos, com sacada nos andares de cima.',
    resumo: '13 apartamentos de 1 dormitório em 4 pavimentos, no Jardim Algarve, em Alvorada. Projeto aprovado e obra começando.',
    unidades: 13,
    tipologia: '1 dormitório',
    areaUnidade: '30 a 35 m²',
    destaques: ['Sacada nos andares de cima', 'Prédio de 4 pavimentos, sem elevador', 'Medidor de água individual', 'Modelo 3D a partir da planta aprovada'],
    local: 'Jardim Algarve, Alvorada',
    entregaPrevista: '2º semestre de 2027',
    carimbo: [
      ['Empreendimento', 'Residencial Sunset'],
      ['Endereço', 'Rua Pedro Conceição Veigas, 136 · Jardim Algarve · Alvorada/RS'],
      ['Matrícula', '73.404 · Registro de Imóveis de Alvorada'],
      ['Alvará de construção', 'nº 245/2025'],
      ['Responsável técnico', 'Eng. Marcelo Neves · ART 14398036'],
      ['Área construída', '474,90 m² em 4 pavimentos'],
    ],
    tem3d: true,
    imagem: '/imagens/sunset.jpg',
    imagemTipo: 'Render de estudo',
    etapas: ETAPAS_SUNSET,
    diario: [
      { data: '2026-10', titulo: 'Tudo pronto para começar', texto: 'Projeto aprovado, equipe definida e materiais da fundação a caminho. O Sunset está prestes a sair do papel.' },
      { data: '2025-10', titulo: 'Projeto aprovado', texto: 'A Prefeitura de Alvorada aprovou o Sunset: 13 apartamentos de 1 dormitório, com sacada nos andares de cima.' },
      { data: '2025-05', titulo: 'Terreno preparado', texto: 'Antes do prédio, cuidamos da base: o terreno ganhou um muro de contenção nos fundos para a obra começar com segurança.' },
      { data: '2024-10', titulo: 'O começo do Sunset', texto: 'Escolhemos um terreno no Jardim Algarve, pertinho do Aloha, para o nosso próximo residencial.' },
    ],
  },
]

export function getProjeto(slug) {
  return PROJETOS.find(p => p.slug === slug)
}

// Situação de cada fase: 'feita', 'andamento' ou 'aseguir'
export function fasesDo(projeto) {
  if (projeto.status === 'pronto' || !projeto.etapas) {
    return FASES.map(f => ({ nome: f.nome, situacao: projeto.status === 'pronto' ? 'feita' : 'aseguir' }))
  }
  const porN = Object.fromEntries(projeto.etapas.map(e => [e.n, e]))
  return FASES.map(f => {
    const et = f.etapas.map(n => porN[n]).filter(Boolean)
    const tot = et.reduce((a, e) => a + e.peso, 0)
    const feito = et.reduce((a, e) => a + e.peso * e.pct / 100, 0)
    const pct = tot ? feito / tot : 0
    return { nome: f.nome, situacao: pct >= 1 ? 'feita' : pct > 0 ? 'andamento' : 'aseguir' }
  })
}

// Fase atual em uma frase ("Fundação", "Estrutura"…)
export function faseAtual(projeto) {
  const fs = fasesDo(projeto)
  return (fs.find(f => f.situacao === 'andamento') || fs.find(f => f.situacao === 'aseguir') || fs[fs.length - 1]).nome
}
