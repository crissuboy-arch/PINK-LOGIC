import { motion } from 'framer-motion'
import { Eye, Palette, Type, MousePointer } from 'lucide-react'

function ColorSwatch({ hex, label }: { hex: string; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: hex || '#333', border: '1px solid rgba(255,255,255,0.08)' }} />
      <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{hex}</span>
    </div>
  )
}

export default function LivePreviewPanel({ output }: { output: Record<string, unknown> | null }) {
  if (!output || Object.keys(output).length === 0) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.78rem', background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
        <Eye size={28} style={{ marginBottom: '0.4rem', opacity: 0.3 }} />
        <div>Preview será exibido aqui</div>
        <div style={{ fontSize: '0.7rem', marginTop: '0.15rem' }}>durante a execução dos agentes</div>
      </div>
    )
  }

  const palette = output.paleta as Record<string, string> | undefined
  const typography = (output.tipografia || output.typography) as Record<string, string> | undefined
  const styleTokens = output.styleTokens as Record<string, string> | undefined
  const headline = output.headline as string | undefined
  const cta = output.cta as string | undefined
  const nome = (output.nome || output.conceito) as string | undefined

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
        <Eye size={12} style={{ color: '#10b981' }} />
        <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Preview</span>
      </div>

      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {nome && <div style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>{nome}</div>}

        {headline && (
          <div style={{ padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)' }}>
            <div style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>Headline</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{headline}</div>
          </div>
        )}

        {cta && (
          <div style={{ padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--primary), #B026FF)', color: 'white', fontWeight: 700, fontSize: '0.85rem', textAlign: 'center' }}>
            {cta}
          </div>
        )}

        {palette && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.35rem' }}>
              <Palette size={11} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Paleta</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-start' }}>
              {palette.primary && <ColorSwatch hex={palette.primary} label="Primary" />}
              {palette.secondary && <ColorSwatch hex={palette.secondary} label="Secondary" />}
              {palette.accent && <ColorSwatch hex={palette.accent} label="Accent" />}
              {palette.background && <ColorSwatch hex={palette.background} label="Bg" />}
              {palette.text && <ColorSwatch hex={palette.text} label="Text" />}
            </div>
          </div>
        )}

        {typography && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.35rem' }}>
              <Type size={11} style={{ color: '#3b82f6' }} />
              <span style={{ fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Tipografia</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem' }}>
              {typography.heading && <span style={{ color: 'white', fontFamily: typography.heading }}>Heading: {typography.heading}</span>}
              {typography.body && <span style={{ color: 'var(--text-secondary)', fontFamily: typography.body }}>Body: {typography.body}</span>}
            </div>
          </div>
        )}

        {styleTokens && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.35rem' }}>
              <MousePointer size={11} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Style Tokens</span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', fontSize: '0.7rem' }}>
              {Object.entries(styleTokens).map(([k, v]) => (
                <span key={k} style={{ padding: '0.15rem 0.4rem', borderRadius: 4, background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)' }}>
                  {k}: <strong style={{ color: 'white' }}>{v}</strong>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
