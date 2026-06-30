import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// ── REAL-LIFE STORIES — shown on project cards + the MBONA section ────────────
// Read-only here. Stories are managed in the admin portal:
// admin.femsaidiakenya.org → Halafu? → SaInt → Mbona

const sb = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
const NS = "'Nunito Sans',sans-serif"

const PALETTES = {
  light: { acc:'#8A1030', bd:'#B89AAA', card:'#EDE0E8', txt:'#180410', mut:'#7A4A60' },
  dark:  { acc:'#C05010', bd:'rgba(138,16,48,0.35)', card:'rgba(255,255,255,0.04)', txt:'#F0E8F0', mut:'#8892B0' },
}

const isDesktop = () => typeof window !== 'undefined' && window.innerWidth >= 768

// One story card — compact horizontal layout: a filled thumbnail (cover, no dead
// space) beside the text, with the summary clamped so cards stay tight.
export function StoryCard({ s, pal, projectLabel }) {
  const [open, setOpen] = useState(false)
  const media = s.media_url && (
    <div style={{ flexShrink:0, width:118, height:118, overflow:'hidden',
      background:'rgba(0,0,0,0.12)', borderRadius:2 }}>
      {s.media_type === 'video'
        ? <video src={s.media_url} controls
            style={{ width:'100%', height:'100%', objectFit:'cover', background:'#000', display:'block' }}/>
        : <img src={s.media_url} alt={s.title} loading="lazy"
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>}
    </div>
  )
  return (
    <div style={{ background:pal.card, border:`1px solid ${pal.bd}`,
      borderLeft:`3px solid ${pal.acc}`, padding:12, minWidth:0,
      display:'flex', gap:12, alignItems:'flex-start' }}>
      {media}
      <div style={{ minWidth:0, flex:1 }}>
        {projectLabel && (
          <p style={{ fontFamily:NS, fontSize:9, fontWeight:700, letterSpacing:'.1em',
            textTransform:'uppercase', color:pal.acc, margin:'0 0 3px' }}>{projectLabel}</p>
        )}
        <p style={{ fontFamily:"'Lora',serif", fontSize:14, fontWeight:700, color:pal.txt, margin:'0 0 5px', lineHeight:1.3 }}>
          {s.title}
        </p>
        {s.summary && (
          <p style={{ fontFamily:NS, fontSize:12, color:pal.txt, lineHeight:1.6, margin:'0 0 6px',
            ...(open ? {} : { display:'-webkit-box', WebkitLineClamp:4, WebkitBoxOrient:'vertical', overflow:'hidden' }) }}>
            {s.summary}
          </p>
        )}
        <div style={{ display:'flex', gap:14, flexWrap:'wrap', alignItems:'center' }}>
          {s.summary && s.summary.length > 220 && (
            <button onClick={()=>setOpen(o=>!o)} style={{ fontFamily:NS, fontSize:11, fontWeight:700,
              color:pal.mut, background:'none', border:'none', padding:0, cursor:'pointer' }}>
              {open ? 'Show less' : 'Read more'}
            </button>
          )}
          {s.story_url && (
            <a href={s.story_url} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily:NS, fontSize:11, fontWeight:700, color:pal.acc, textDecoration:'none' }}>
              Full story{s.source_name ? ` · ${s.source_name}` : ''} →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// Grid + "see more" wrapper: 2 per row on desktop, 1 on mobile, first 2 visible
export function StoriesGrid({ stories, pal, withProjectLabels = false, projectTitleFor = () => null }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? stories : stories.slice(0, 2)
  return (
    <>
      <div style={{ display:'grid',
        gridTemplateColumns: isDesktop() ? 'repeat(2, minmax(0,1fr))' : '1fr',
        gap:8 }}>
        {visible.map(s => (
          <StoryCard key={s.id} s={s} pal={pal}
            projectLabel={withProjectLabels ? projectTitleFor(s.project_id) : null}/>
        ))}
      </div>
      {stories.length > 2 && (
        <button onClick={()=>setShowAll(a=>!a)}
          style={{ marginTop:8, width:'100%', fontFamily:NS, fontSize:11, fontWeight:700,
            padding:'9px 0', background:'transparent', color:pal.acc,
            border:`1px dashed ${pal.acc}`, cursor:'pointer', letterSpacing:'.06em' }}>
          {showAll ? '▲ Show fewer stories' : `▼ See ${stories.length - 2} more stor${stories.length - 2 === 1 ? 'y' : 'ies'}`}
        </button>
      )}
    </>
  )
}

// Per-project stories (rendered inside each expanded project card)
export default function ProjectStories({ projectId, dark = false }) {
  const pal = PALETTES[dark ? 'dark' : 'light']
  const [stories, setStories] = useState([])

  useEffect(() => {
    sb.from('project_stories').select('*')
      .eq('project_id', projectId).eq('active', true)
      .order('created_at', { ascending:false })
      .then(({ data }) => setStories(data || []))
  }, [projectId])

  if (stories.length === 0) return null

  return (
    <div style={{ marginBottom:20 }}>
      <p style={{ fontFamily:NS, fontSize:11, fontWeight:700, letterSpacing:'.1em',
        textTransform:'uppercase', color:pal.acc, margin:'0 0 8px' }}>
        ❖ Real-life stories {stories.length > 1 && `(${stories.length})`}
      </p>
      <StoriesGrid stories={stories} pal={pal}/>
    </div>
  )
}

// MBONA: REAL STORIES — aggregated section for the main dashboard / SaInt
export function MbonaSection({ dark = false, projectTitles = {} }) {
  const pal = PALETTES[dark ? 'dark' : 'light']
  const [stories, setStories] = useState([])

  useEffect(() => {
    sb.from('project_stories').select('*')
      .eq('active', true)
      .order('created_at', { ascending:false })
      .then(({ data }) => setStories(data || []))
  }, [])

  if (stories.length === 0) return null

  return (
    <div style={{ background: dark ? 'rgba(255,255,255,0.02)' : '#F5EEF2',
      border:`1px solid ${pal.bd}`, borderTop:`3px solid ${pal.acc}`,
      padding:'20px', marginBottom:2 }}>
      <p style={{ fontFamily:NS, fontSize:10, fontWeight:700, letterSpacing:'.18em',
        textTransform:'uppercase', color:pal.acc, margin:'0 0 4px' }}>
        ❖ MBONA: REAL STORIES
      </p>
      <p style={{ fontFamily:NS, fontSize:12, color:pal.mut, margin:'0 0 14px', lineHeight:1.7 }}>
        Mbona — Swahili for <em>why</em>. The real lives behind every project we propose.
      </p>
      <StoriesGrid stories={stories} pal={pal} withProjectLabels
        projectTitleFor={(id) => projectTitles[id] || null}/>
    </div>
  )
}
