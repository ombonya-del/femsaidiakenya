import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// ── REAL-LIFE STORIES — shown on every Halafu?/SaInt project card ─────────────
// Read-only here. Stories are managed in the admin portal:
// admin.femsaidiakenya.org → Halafu? → SaInt → Mbona
// Requires the project_stories table + story-media bucket (supabase/stories-setup.sql).

const sb = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
const NS = "'Nunito Sans',sans-serif"

const PALETTES = {
  light: { acc:'#8A1030', bd:'#B89AAA', card:'#EDE0E8', txt:'#180410', mut:'#7A4A60' },
  dark:  { acc:'#C05010', bd:'rgba(138,16,48,0.35)', card:'rgba(255,255,255,0.04)', txt:'#F0E8F0', mut:'#8892B0' },
}

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

      {stories.map(s => (
        <div key={s.id} style={{ background:pal.card, border:`1px solid ${pal.bd}`,
          borderLeft:`3px solid ${pal.acc}`, padding:14, marginBottom:8 }}>
          <p style={{ fontFamily:"'Lora',serif", fontSize:14, fontWeight:700, color:pal.txt, margin:'0 0 6px' }}>
            {s.title}
          </p>
          {s.media_url && (
            s.media_type === 'video'
              ? <video src={s.media_url} controls style={{ width:'100%', maxHeight:260, marginBottom:8, background:'#000' }}/>
              : <img src={s.media_url} alt={s.title} loading="lazy"
                  style={{ width:'100%', maxHeight:260, objectFit:'cover', marginBottom:8 }}/>
          )}
          {s.summary && (
            <p style={{ fontFamily:NS, fontSize:12, color:pal.txt, lineHeight:1.7, margin:'0 0 8px' }}>
              {s.summary}
            </p>
          )}
          {s.story_url && (
            <a href={s.story_url} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily:NS, fontSize:11, fontWeight:700, color:pal.acc, textDecoration:'none' }}>
              Read the full story{s.source_name ? ` on ${s.source_name}` : ''} →
            </a>
          )}
        </div>
      ))}
    </div>
  )
}
