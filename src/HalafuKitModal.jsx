import { useState } from 'react'
import { ArrowRight, ExternalLink } from 'lucide-react'
import ProjectStories from './ProjectStories'
import { KITS, KIND_LABEL, downloadTemplate } from './projectKits'

// Lane accent (light theme)
const LANE_ACCENT = { Understand: '#7C3AED', Interrupt: '#16A34A', Build: '#8A1030' }
const LANE_ICON   = { Understand: '🔍', Interrupt: '⚡', Build: '🔨' }

// 4-tab proposal-kit modal for a Halafu? fundable project (light theme).
// props: p (project), onClose, onFund (opens FundModal at parent), c (theme), donorMeta
export default function HalafuKitModal({ p, onClose, onFund, c, donorMeta = {} }) {
  const [tab, setTab]           = useState('overview')
  const [joinType, setJoinType] = useState(null)
  const kit = KITS[p.id]
  if (!kit) return null

  const accent = LANE_ACCENT[p.lane] || c.A
  const serif  = "'Lora',serif"
  const sans   = "'Nunito Sans',sans-serif"
  const PANEL  = '#F4EAEF'   // modal body (clean light)
  const INNER  = '#FBF5F8'   // inner cards
  const TABS = [['overview', 'Overview'], ['resources', 'Resources'], ['funders', 'Funders'], ['templates', 'Templates']]

  const label = (txt, col = c.A) => (
    <p style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: col, letterSpacing: '.1em', textTransform: 'uppercase', margin: '0 0 8px' }}>{txt}</p>
  )
  const para = { fontFamily: sans, fontSize: 13, color: c.TXT, lineHeight: 1.8, margin: 0 }
  const li   = { fontFamily: sans, fontSize: 13, color: c.TXT, lineHeight: 1.7, marginBottom: 6 }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(24,4,16,0.85)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 12px', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 760, background: PANEL, border: `1px solid ${c.BD}`, borderTop: `3px solid ${accent}`, display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}>

        {/* Header */}
        <div style={{ padding: '18px 22px 0', position: 'relative', flexShrink: 0 }}>
          <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: c.MUT, fontSize: 24, lineHeight: 1, cursor: 'pointer' }}>×</button>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: sans, fontSize: 9, fontWeight: 700, letterSpacing: '.12em', padding: '2px 8px', color: accent, border: `1px solid ${accent}` }}>
              {LANE_ICON[p.lane] || ''} {p.lane.toUpperCase()}
            </span>
            <span style={{ fontFamily: sans, fontSize: 9, letterSpacing: '.1em', padding: '2px 8px', color: c.MUT, border: `1px solid ${c.BD}` }}>{(p.status || '').toUpperCase()}</span>
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
                borderBottom: tab === k ? `2px solid ${accent}` : '2px solid transparent', marginBottom: -1,
              }}>{t}{k === 'resources' ? ` (${kit.resources.length})` : ''}</button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '18px 22px 24px', overflowY: 'auto' }}>

          {tab === 'overview' && (
            <div>
              <p style={{ ...para, marginBottom: 18 }}>{kit.description}</p>

              <div style={{ marginBottom: 16 }}>{label('The gap')}<p style={para}>{p.problem}</p></div>
              <div style={{ marginBottom: 16 }}>{label('The intervention')}<p style={para}>{p.what}</p></div>

              <div style={{ marginBottom: 16 }}>
                {label('Objectives')}
                <ol style={{ margin: 0, paddingLeft: 20 }}>{(kit.objectives || []).map((o, i) => <li key={i} style={li}>{o}</li>)}</ol>
              </div>

              <div style={{ marginBottom: 16 }}>
                {label('Indicative activities')}
                <ul style={{ margin: 0, paddingLeft: 20 }}>{(kit.activities || []).map((a, i) => <li key={i} style={li}>{a}</li>)}</ul>
              </div>

              <div style={{ marginBottom: 16 }}>
                {label('Expected outcomes')}
                <ul style={{ margin: 0, paddingLeft: 20 }}>{(kit.outcomes || []).map((o, i) => <li key={i} style={li}>{o}</li>)}</ul>
              </div>

              <div style={{ marginBottom: 16 }}>
                {label('Advocacy & policy hooks')}
                <ul style={{ margin: 0, paddingLeft: 20 }}>{(kit.legal || []).map((l, i) => <li key={i} style={li}>{l}</li>)}</ul>
              </div>

              {kit.estBudget && (
                <div style={{ marginBottom: 16, background: INNER, border: `1px solid ${c.BD}`, padding: '12px 14px' }}>
                  {label('Estimated budget')}
                  <p style={para}>{kit.estBudget}</p>
                  <p style={{ fontFamily: sans, fontSize: 11, color: c.MUT, fontStyle: 'italic', margin: '6px 0 0' }}>Planning estimate for scoping only — not a quote. Build a detailed budget in the funder's format.</p>
                </div>
              )}

              {p.tech && (
                <div style={{ marginBottom: 18 }}>{label('Tech angle')}<p style={para}>{p.tech}</p></div>
              )}

              <ProjectStories projectId={p.id} />

              {/* Actions — fund / join (preserved from the card) */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
                <button onClick={() => onFund(p)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1E2D40', color: '#D4B0B8', fontFamily: sans, fontSize: 12, fontWeight: 700, padding: '10px 18px', border: '1px solid #3A1830', cursor: 'pointer', letterSpacing: '.04em' }}>💰 Fund this project</button>
                {!joinType ? (
                  <>
                    <button onClick={() => setJoinType('individual')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: c.A, color: '#F0D0D8', fontFamily: sans, fontSize: 12, fontWeight: 700, padding: '10px 18px', border: 'none', cursor: 'pointer' }}>👤 Join as individual</button>
                    <button onClick={() => setJoinType('organisation')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: c.CRD, color: c.A, fontFamily: sans, fontSize: 12, fontWeight: 700, padding: '10px 18px', border: `1px solid ${c.A}`, cursor: 'pointer' }}>🏢 Join as organisation</button>
                  </>
                ) : (
                  <div style={{ width: '100%', background: INNER, border: `1px solid ${c.BD}`, padding: 16 }}>
                    <p style={{ fontSize: 12, color: c.TXT, fontFamily: sans, fontWeight: 700, marginBottom: 4 }}>
                      {joinType === 'individual' ? '👤 Joining as an individual' : '🏢 Joining as an organisation'}
                    </p>
                    <p style={{ fontSize: 11, color: c.MUT, fontFamily: sans, lineHeight: 1.7, marginBottom: 12 }}>
                      {joinType === 'individual'
                        ? 'Tell us who you are, what you bring (skills, experience, networks, lived experience) and where you are based.'
                        : 'Tell us about your organisation, what you can contribute and where you operate.'}
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <a href={`mailto:halafu@femsaidiakenya.org?subject=Halafu? — Joining: ${encodeURIComponent(p.title)} (${joinType})`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: c.A, color: '#F0D0D8', fontFamily: sans, fontSize: 12, fontWeight: 700, padding: '10px 18px', textDecoration: 'none' }}>
                        Send us an email <ArrowRight size={13} />
                      </a>
                      <button onClick={() => setJoinType(null)} style={{ fontFamily: sans, fontSize: 11, padding: '10px 14px', background: 'none', border: `1px solid ${c.BD}`, color: c.MUT, cursor: 'pointer' }}>Back</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'resources' && (
            <div>
              {label('Supporting evidence — verified sources')}
              <p style={{ fontFamily: sans, fontSize: 12, color: c.MUT, margin: '0 0 16px', lineHeight: 1.7 }}>Use these in the problem statement and references of your proposal. Each opens in a new tab.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {kit.resources.map((r, i) => (
                  <a key={i} href={r.u} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none', padding: '12px 14px', background: INNER, border: `1px solid ${c.BD}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', marginBottom: 4 }}>
                      <span style={{ fontFamily: sans, fontSize: 13, fontWeight: 700, color: c.TXT, lineHeight: 1.4 }}>{r.t} <ExternalLink size={11} style={{ verticalAlign: 'middle', opacity: 0.6 }} /></span>
                      <span style={{ fontFamily: sans, fontSize: 8.5, fontWeight: 700, letterSpacing: '.08em', padding: '2px 7px', color: accent, border: `1px solid ${accent}`, whiteSpace: 'nowrap', flexShrink: 0 }}>{(KIND_LABEL[r.k] || r.k).toUpperCase()}</span>
                    </div>
                    <div style={{ fontFamily: sans, fontSize: 11, color: c.A, marginBottom: 4 }}>{r.s}</div>
                    <div style={{ fontFamily: sans, fontSize: 12, color: c.MUT, lineHeight: 1.6 }}>{r.w}</div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {tab === 'funders' && (
            <div>
              {label('Aligned funders — best-fit by mandate')}
              <p style={{ fontFamily: sans, fontSize: 12, color: c.MUT, margin: '0 0 16px', lineHeight: 1.7 }}>Click any funder to visit their grants page.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {(p.donors || []).map((d, i) => {
                  const meta = donorMeta[d.name] || {}
                  const inner = (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', marginBottom: 2 }}>
                        <span style={{ fontFamily: sans, fontSize: 13, fontWeight: 700, color: c.TXT }}>{d.name}{meta.url ? <ExternalLink size={11} style={{ verticalAlign: 'middle', opacity: 0.6, marginLeft: 4 }} /> : null}</span>
                      </div>
                      {meta.area && <div style={{ fontFamily: sans, fontSize: 10.5, color: c.A, letterSpacing: '.04em', marginBottom: 4 }}>{meta.area}</div>}
                      <div style={{ fontFamily: sans, fontSize: 12, color: c.MUT, lineHeight: 1.6 }}>{d.why}</div>
                    </>
                  )
                  return meta.url
                    ? <a key={i} href={meta.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none', padding: '12px 14px', background: INNER, border: `1px solid ${c.BD}` }}>{inner}</a>
                    : <div key={i} style={{ padding: '12px 14px', background: INNER, border: `1px solid ${c.BD}` }}>{inner}</div>
                })}
              </div>
              {label('Funder fit — how to approach')}
              <p style={para}>{kit.funderNotes}</p>
            </div>
          )}

          {tab === 'templates' && (
            <div>
              {label('Proposal templates')}
              <p style={{ fontFamily: sans, fontSize: 12, color: c.MUT, margin: '0 0 16px', lineHeight: 1.7 }}>Pre-structured Word documents tailored to this project — open in Word or Google Docs and write over the guidance notes. Each is pre-filled with this project's objectives, activities, outcomes, policy hooks and references.</p>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr' }}>
                <div style={{ padding: 16, background: INNER, border: `1px solid ${c.BD}` }}>
                  <h4 style={{ fontFamily: serif, fontSize: 15, color: c.TXT, margin: '0 0 6px' }}>Individual organisation</h4>
                  <p style={{ fontFamily: sans, fontSize: 12, color: c.MUT, margin: '0 0 10px', lineHeight: 1.6 }}>For a single applicant. Cover sheet, exec summary, problem &amp; evidence, objectives &amp; theory of change, workplan, logframe, safeguarding, legal framework, risks, budget, annexes and the verified references.</p>
                  <button onClick={() => downloadTemplate(p, kit, 'individual')} style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, padding: '10px 18px', background: '#16A34A', color: '#fff', border: 'none', cursor: 'pointer' }}>Download individual template</button>
                </div>
                <div style={{ padding: 16, background: INNER, border: `1px solid ${c.BD}` }}>
                  <h4 style={{ fontFamily: serif, fontSize: 15, color: c.TXT, margin: '0 0 6px' }}>Collective / consortium</h4>
                  <p style={{ fontFamily: sans, fontSize: 12, color: c.MUT, margin: '0 0 10px', lineHeight: 1.6 }}>For two or more organisations applying together under a lead applicant. Everything in the individual template, plus consortium profile, governance &amp; MoU, division-of-labour matrix, budget split by partner and sub-granting.</p>
                  <button onClick={() => downloadTemplate(p, kit, 'collective')} style={{ fontFamily: sans, fontSize: 12, fontWeight: 700, padding: '10px 18px', background: c.A, color: '#F0D0D8', border: 'none', cursor: 'pointer' }}>Download consortium template</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
