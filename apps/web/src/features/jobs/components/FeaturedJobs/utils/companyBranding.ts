import type { CompanyColors } from '../FeaturedJobs.types'

// Mapeamento de empresas para domínios (para buscar logos via Clearbit)
const companyDomains: Record<string, string> = {
  'ci&t': 'ciandt.com',
  'cit': 'ciandt.com',
  'santander': 'santander.com.br',
  'itaú': 'itau.com.br',
  'itau': 'itau.com.br',
  'nubank': 'nubank.com.br',
  'ifood': 'ifood.com.br',
  'magazine luiza': 'magazineluiza.com.br',
  'magalu': 'magazineluiza.com.br',
  'mercado livre': 'mercadolivre.com.br',
  'stone': 'stone.com.br',
  'picpay': 'picpay.com',
  'carrefour': 'carrefour.com.br',
  'ambev': 'ambev.com.br',
  'bradesco': 'bradesco.com.br',
  'xp': 'xpinc.com',
  'btg': 'btgpactual.com',
  'totvs': 'totvs.com',
  'locaweb': 'locaweb.com.br',
  'globo': 'globo.com',
  'b3': 'b3.com.br',
  'vivo': 'vivo.com.br',
  'claro': 'claro.com.br',
  'tim': 'tim.com.br',
  'natura': 'natura.com.br',
  'americanas': 'americanas.com.br',
  'cielo': 'cielo.com.br',
  'pagseguro': 'pagseguro.com.br',
  'inter': 'bancointer.com.br',
  'c6 bank': 'c6bank.com.br',
  'amazon': 'amazon.com',
  'google': 'google.com',
  'microsoft': 'microsoft.com',
  'meta': 'meta.com',
  'apple': 'apple.com',
  'ibm': 'ibm.com',
  'oracle': 'oracle.com',
  'sap': 'sap.com',
  'accenture': 'accenture.com',
  'deloitte': 'deloitte.com',
  'thoughtworks': 'thoughtworks.com',
  'zup': 'zup.com.br',
}

// Paletas de cores para empresas (primária, secundária, accent)
const companyColors: Record<string, CompanyColors> = {
  // Bancos e Fintechs
  'nubank': ['#820ad1', '#9b2dd6', '#ba68c8'],
  'santander': ['#ec0000', '#ff1a1a', '#ff6666'],
  'itau': ['#f5f5f5', '#ffffff', '#e8e8e8'],
  'itaú': ['#f5f5f5', '#ffffff', '#e8e8e8'],
  'bradesco': ['#cc092f', '#e60033', '#ff3366'],
  'inter': ['#ff7a00', '#ff9433', '#ffad66'],
  'c6': ['#1a1a1a', '#333333', '#4d4d4d'],
  'xp': ['#000000', '#1a1a1a', '#333333'],
  'btg': ['#001e50', '#002d75', '#004299'],
  'stone': ['#00a868', '#00c980', '#33d999'],
  'picpay': ['#21c25e', '#2ed573', '#5ce096'],
  'pagseguro': ['#41c900', '#5dd91a', '#79e34d'],
  'cielo': ['#0066b3', '#0080e0', '#339de6'],
  'b3': ['#00a0df', '#33b3e5', '#66c6eb'],

  // Telecom
  'claro': ['#da291c', '#e6453a', '#ec6b62'],
  'vivo': ['#660099', '#8000bf', '#9933cc'],
  'tim': ['#004691', '#0059b8', '#1a6dbf'],

  // Varejo e Delivery
  'ifood': ['#ea1d2c', '#ff3d4d', '#ff7a85'],
  'mercado livre': ['#ffe600', '#fff033', '#fff566'],
  'magazineluiza': ['#0086ff', '#339dff', '#66b5ff'],
  'magalu': ['#0086ff', '#339dff', '#66b5ff'],
  'amazon': ['#ff9900', '#ffad33', '#ffc266'],
  'americanas': ['#e60014', '#ff1a2e', '#ff4d5e'],
  'carrefour': ['#004e9a', '#0066cc', '#3385d6'],

  // Tech Giants
  'google': ['#4285f4', '#5a95f5', '#7aa8f7'],
  'microsoft': ['#00a4ef', '#33b5f2', '#66c7f5'],
  'meta': ['#0866ff', '#3385ff', '#66a3ff'],
  'apple': ['#555555', '#777777', '#999999'],
  'ibm': ['#0f62fe', '#4589ff', '#78a9ff'],
  'oracle': ['#c74634', '#d9604f', '#e57a6b'],
  'sap': ['#0070f2', '#3391f5', '#66b1f8'],

  // Consultorias e Software Houses
  'accenture': ['#a100ff', '#b433ff', '#c766ff'],
  'deloitte': ['#86bc25', '#9fcf4d', '#b8dc75'],
  'thoughtworks': ['#cc0066', '#e61a80', '#eb4d99'],
  'ci&t': ['#ff6600', '#ff8533', '#ffa366'],
  'cit': ['#ff6600', '#ff8533', '#ffa366'],
  'zup': ['#00c389', '#1ad9a1', '#4de4b8'],
  'totvs': ['#2e3192', '#4549b0', '#6b6ec4'],
  'locaweb': ['#ff6600', '#ff8533', '#ffa366'],

  // Outros
  'globo': ['#ee3124', '#f15a4f', '#f5837a'],
  'ambev': ['#003057', '#004680', '#1a6299'],
  'natura': ['#ff6600', '#ff8533', '#ffa366'],
}

// Cores fallback baseadas em hash
const fallbackColors: CompanyColors[] = [
  ['#6366f1', '#818cf8', '#a5b4fc'],
  ['#8b5cf6', '#a78bfa', '#c4b5fd'],
  ['#ec4899', '#f472b6', '#f9a8d4'],
  ['#06b6d4', '#22d3ee', '#67e8f9'],
  ['#10b981', '#34d399', '#6ee7b7'],
  ['#f59e0b', '#fbbf24', '#fcd34d'],
  ['#ef4444', '#f87171', '#fca5a5'],
  ['#3b82f6', '#60a5fa', '#93c5fd'],
]

/**
 * Verifica se a chave é uma palavra completa no texto
 * Evita que "inter" seja encontrado em "intersolid"
 */
function matchesWholeWord(text: string, key: string): boolean {
  const regex = new RegExp(`(^|\\s|-)${key}($|\\s|-)`, 'i')
  return regex.test(text)
}

/**
 * Gera cores baseadas no nome da empresa
 */
export function getCompanyColors(company: string): CompanyColors {
  const normalized = company.toLowerCase().trim()

  for (const [key, colors] of Object.entries(companyColors)) {
    if (matchesWholeWord(normalized, key)) {
      return colors
    }
  }

  // Gera cores baseadas em hash do nome
  let hash = 0
  for (let i = 0; i < company.length; i++) {
    hash = company.charCodeAt(i) + ((hash << 5) - hash)
  }

  return fallbackColors[Math.abs(hash) % fallbackColors.length]
}

/**
 * Retorna o domínio da empresa para buscar logo
 */
export function getCompanyDomain(company: string): string {
  const normalized = company.toLowerCase().trim()

  for (const [key, domain] of Object.entries(companyDomains)) {
    if (matchesWholeWord(normalized, key)) {
      return domain
    }
  }

  return normalized.replace(/\s+/g, '') + '.com.br'
}

/**
 * Retorna URL do logo da empresa via logo.dev
 * @see https://docs.logo.dev
 */
export function getCompanyLogo(company: string, size: number = 128): string {
  const domain = getCompanyDomain(company)
  const token = import.meta.env.VITE_LOGO_DEV_TOKEN

  if (!token) {
    // Fallback para UI Avatars se não tiver token
    const initials = company.slice(0, 2).toUpperCase()
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&size=${size}`
  }

  return `https://img.logo.dev/${domain}?token=${token}&size=${size}&format=png`
}

/**
 * Verifica se uma cor hex é clara (para decidir cor do texto)
 */
export function isLightColor(hex: string): boolean {
  const color = hex.replace('#', '')
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  // Fórmula de luminância relativa
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6
}
