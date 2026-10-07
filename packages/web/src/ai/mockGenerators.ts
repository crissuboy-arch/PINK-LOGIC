export function mockCopy(input: string): string {
  const base = input.trim() || 'seu produto';
  const templates = [
    `🚀 VOCÊ PRECISA CONHECER ${base.toUpperCase()}!\n\nChegou a hora de transformar seus resultados com ${base}.\n\nO método que já ajudou milhares de pessoas agora está ao seu alcance.\n\n👉 Clique no link da bio e garanta o seu!`,
    `😱 ${base.toUpperCase()} ESTÁ MUDANDO O JOGO!\n\nSe você ainda não conhece ${base}, está perdendo dinheiro.\n\n📌 Salva esse post para ver depois.\n\nComenta "EU QUERO" que eu te explico como funciona.`,
    `💡 A estratégia de ${base} que ninguém te conta.\n\nEnquanto todo mundo faz do jeito difícil, você pode usar ${base} para resultados rápidos.\n\n👇 Desliza para o lado e descobre o segredo.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

export function mockIdeas(productName: string): { title: string; description: string; category: string }[] {
  return [
    { title: `3 Erros ao usar ${productName || 'seu produto'}`, description: `Um post carrossel mostrando os erros comuns e como evitá-los ao usar ${productName || 'seu produto'}.`, category: 'Conteúdo' },
    { title: `Bastidores da criação de ${productName || 'seu produto'}`, description: 'Mostre o processo, a dedicação e os bastidores.', category: 'Conteúdo' },
    { title: 'Depoimento transformador', description: 'Compartilhe um print de um cliente satisfeito.', category: 'Marketing' },
    { title: `O segredo por trás de ${productName || 'sua oferta'}`, description: 'Revele um insight exclusivo que poucos conhecem.', category: 'Estratégia' },
  ];
}

export function mockStrategy(input: string, type: 'product' | 'content'): any {
  if (type === 'product') {
    return {
      name: `Método ${input} Pro`,
      offer: `A solução definitiva para quem busca dominar ${input} em tempo recorde.`,
      audience: `Pessoas interessadas em ${input} que desejam resultados rápidos e profissionais.`,
      price: Math.random() > 0.5 ? 'R$ 497,00' : 'R$ 997,00',
      type: 'Infoproduto (Ebook + Aulas)',
      structure: ['Fundamentos Essenciais', 'A Estratégia dos Grandes Players', 'Plano de Ação Passo a Passo', 'Escalando seus Resultados'],
    };
  }
  return {
    hook: `Pare de tentar ${input} do jeito errado!`,
    body: `Muitas pessoas cometem o erro de focar apenas no óbvio quando se trata de ${input}. O segredo está na consistência.`,
    caption: `Você já sentiu que está dando murro em ponta de faca com ${input}?\n\n👇 Comenta "EU QUERO" que eu te explico.`,
    cta: 'Clique no link da Bio agora!',
  };
}