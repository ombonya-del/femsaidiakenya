import { useState } from 'react'
import ProjectStories from './ProjectStories'
import { KITS, KIND_LABEL, downloadTemplate } from './projectKits'

const LANE_ICON = { Understand: '🔍', Interrupt: '⚡', Build: '🔨' }

// 4-tab proposal-kit modal for a fundable project.
// props: p (project), onClose, onFund, c (theme colours)
export default function ProjectKitModal({ p, onClose, onFund, c }) {
  const [tab, setTab] = useState('overview')
  const kit = KITS[p.id]
  if (!kit) return null

  const serif = "'Lora',serif"
  const sans = "'Nunito Sans',sans-serif"
  const TABS = [
    ['overview', 'Overview'],
    ['resources', 'Resources'],
    ['funders', 'Funders'],
    ['templates', 'Templates'],
  ]

  const label = (txt, col) => (
    <p style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: col, letterSpacing: '.1em', textTransform: 'uppercase', margin: '0 0 8px' }}>{txt}</p>
  )

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(5,7,12,0.86)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 12px', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 780, background: c.CARD, border: `1px solid ${c.BD}`, borderTop: `3px solid ${p.laneColor}`, display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>

        {/* Header */}
        <div style={{ padding: '18px 22px 0', position: 'relative', flexShrink: 0 }}>
          <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: c.MUT, fontSize: 22, lineHeight: 1, cursor: 'pointer' }}>×</button>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <span style={{ fontFamily: sans, fontSize: 9, fontWeight: 700, letterSpacing: '.12em', padding: '2px 8px', color: p.laneColor, border: `1px solid ${p.laneColor}` }}>
              {LANE_ICON[p.lane] || ''} {p.lane.toUpperCase()}
            </span>
            <span style={{ fontFamily: sans, fontSize: 9, letterSpacing: '.1em', padding: '2px 8px', color: c.MUT, border: '1px solid rgba(136,146,176,0.2)' }}>{(p.status || '').toUpperCase()}</span>
          </div>
          <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: c.TXT, margin: '0 0 4px', lineHeight: 1.25, paddingRight: 30 }}>{p.title}</h2>
          <p style={{ fontFamily: sans, fontSize: 13, color: c.MUT, fontStyle: 'italic', margin: '0 0 14px' }}>{p.tagline}</p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, overflowX: 'auto', borderBottom: `1px solid ${c.BD}` }}>
            {TABS.map(([k, t]) => (
              <button key={k} onClick={() => setTab(k)} style={{
                fontFamily: sans, fontSize: 12, fontWeight: 700, letterSpacing: '.04em', whiteSpace: 'nowrap',
                padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer',
                color: tab === k ? c.TXT : c.MUT,
                borderBottom: tab === k ? `2px solid ${p.laneColor}` : '2px solid transparent', marginBottom: -1,
              }}>{t}{k === 'resources' ? ` (${kit.resources.length})` : ''}</button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '18px 22px 24px', overflowY: 'auto' }}>

          {tab === 'overview' && (
            <div>
              <p style={{ fontFamily: sans, fontSize: 13.5, color: 'rgba(240,232,240,0.85)', lineHeight: 1.8, margin: '0 0 18px' }}>{kit.description}</p>
              <div style={{ marginBottom: 16 }}>
                {label('The gap', c.RED)}
                <p style={{ fontFamily: sans, fontSize: 13, color: 'rgba(240,232,240,0.78)', lineHeight: 1.75, margin: 0 }}>{p.problem}</p>
              </div>
              <div style={{ marginBottom: 16 }}>
                {label('The intervention', c.GOLD)}
                <p style={{ fontFamily: sans, fontSize: 13, color: 'rgba(240,232,240,0.78)', lineHeight: 1.75, margin: 0 }}>{p.what}</p>
              </div>
              {p.frameworks && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
                  {p.frameworks.map((f, i) => (
                    <span key={i} style={{ fontFamily: sans, fontSize: 9, fontWeight: 700, padding: '2px 8px', color: c.GOLD, border: '1px solid rgba(200,160,64,0.3)', background: 'rgba(200,160,64,0.08)' }}>{f}</span>
                  ))}
                </div>
              )}
              <ProjectStories projectId={p.id} dark />
              <button onClick={() => onFund(p)} style={{ marginTop: 18, fontFamily: sans, fontSize: 12, fontWeight: 700, padding: '11px 22px', background: c.RED, color: c.TXT, border: 'none', cursor: 'pointer', letterSpacing: '.06em' }}>
                Express interest / fund this project →
              </button>
            </div>
          )}

          {tab === 'resources' && (
            <div>
              {label('Supporting evidence — verified sources', c.MUT)}
              <p style={{ fontFamily: sans, fontSize: 12, color: c.MUT, margin: '0 0 16px', lineHeight: 1.7 }}>Use these in the problem statement and references of your proposal. Each opens in a new tab.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {kit.resources.map((r, i) => (
                  <a key={i} href={r.u} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none', padding: '12px 14px', background: c.SURF, border: `1px solid ${c.BD}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', marginBottom: 4 }}>
                      <span style={{ fontFamily: sans, fontSize: 13, fontWeight: 700, color: c.TXT, lineHeight: 1.4 }}>{r.t}</span>
                      <span style={{ fontFamily: sans, fontSize: 8.5, fontWeight: 700, letterSpacing: '.08em', padding: '2px 7px', color: p.laneColor, border: `1px solid ${p.laneColor}`, whiteSpace: 'nowrap', flexShrink: 0 }}>{(KIND_LABEL[r.k] || r.k).toUpperCase()}</span>
                    </div>
                    <div style={{ fontFamily: sans, fontSize: 11, color: c.GOLD, marginBottom: 4 }}>{r.s}</div>
                    <div style={{ fontFamily: sans, fontSize: 12, color: 'rgba(240,232,240,0.7)', lineHeight: 1.6 }}>{r.w}</div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {tab === 'funders' && (
            <div>
              {label('Aligned funders', c.MUT)}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {(p.donors || []).map((d, i) => (
                  <span key={i} style={{ fontFamily: sans, fontSize: 11, padding: '4px 10px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${c.BD}`, color: c.TXT }}>{d}</span>
                ))}
              </div>
              {label('Funder fit — how to approach', c.GOLD)}
              <p style={{ fontFamily: sans, fontSize: 13, color: 'rgba(240,232,240,0.82)', lineHeight: 1.8, margin: 0 }}>{kit.funderNotes}</p>
            </div>
          )}

          {tab === 'templates' && (
            <div>
              {label('Proposal templates', c.MUT)}
              <p style={{ fontFamily: sans, fontSize: 12, color: c.MUT, margin: '0 0 16px', lineHeight: 1.7 }}>Pre-structured Word documents tailored to this project — open in Word or Google Docs and write over the guidance notes.</p>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr' }}>
                <div style={{ padding: '16px', background: c.SURF, border: `1px solid ${c.BD}` }}>
                  <h4 style={{ fontFamily: serif, fontSize: 15, color: c.TXT, margin: '0 0 6px' }}>Individual organisation</h4>
                  <p style={{ fontFamily: sans, fontSize: 12, color: c.MUT, margin: '0 0 10px', lineHeight: 1.6 }}>For a single applicant. Cover sheet, exec summary, problem &amp; evidence, objectives &amp; theory of change, workplan, logframe, safeguarding, legal framework, risks, budget, annexes and the verified references above.</p>
                  <button onClick={() => downloadTemplate(p, kit, 'individual')} style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, padding: '10px 18px', background: c.GRN, color: '#06240F', border: 'none', cursor: 'pointer' }}>Download individual template</button>
                </div>
                <div style={{ padding: '16px', background: c.SURF, border: `1px solid ${c.BD}` }}>
                  <h4 style={{ fontFamily: serif, fontSize: 15, color: c.TXT, margin: '0 0 6px' }}>Collective / consortium</h4>
                  <p style={{ fontFamily: sans, fontSize: 12, color: c.MUT, margin: '0 0 10px', lineHeight: 1.6 }}>For two or more organisations applying together under a lead applicant. Everything in the individual template, plus consortium profile, governance &amp; MoU, division-of-labour matrix, budget split by partner and sub-granting.</p>
                  <button onClick={() => downloadTemplate(p, kit, 'collective')} style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, padding: '10px 18px', background: c.GOLD, color: '#2A1E04', border: 'none', cursor: 'pointer' }}>Download consortium template</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
