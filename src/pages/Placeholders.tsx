const PagePlaceholder = ({ title }: { title: string }) => (
  <div className="card">
    <h2 className="brand-font" style={{ fontSize: '2rem', marginBottom: '1rem' }}>{title}</h2>
    <p style={{ color: 'var(--text-secondary)' }}>Esta página está em desenvolvimento. Em breve, novos recursos incríveis do Pink Logic estarão disponíveis aqui.</p>
  </div>
);

export const Biblioteca = () => <PagePlaceholder title="Biblioteca de Recursos" />;
