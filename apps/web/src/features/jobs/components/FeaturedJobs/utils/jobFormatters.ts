// Funções de formatação para dados de vagas

const levelLabels: Record<string, string> = {
  'ESTAGIO': 'Estágio',
  'JUNIOR': 'Júnior',
}

export function formatLevel(level: string): string {
  return levelLabels[level] || level
}

export function buildBadgeText(remote: boolean, level: string): string {
  return remote ? 'VAGA REMOTA' : formatLevel(level).toUpperCase()
}

export function buildSubtitle(company: string, level: string, location?: string): string {
  const base = `Oportunidade ${formatLevel(level).toLowerCase()} na ${company}`
  return location ? `${base} - ${location}` : base
}
