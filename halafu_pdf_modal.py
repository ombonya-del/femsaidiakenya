# Patch Halafu.jsx:
# 1. Add showPDF state
# 2. Replace download links with modal trigger buttons
# 3. Add PDF modal overlay at bottom of component

import re, sys

path = sys.argv[1]
src  = open(path).read()

# ── Add showPDF state after existing briefs state ─────────────────────────
old_state = "  const [briefs, setBriefs] = useState([])"
new_state = "  const [briefs, setBriefs] = useState([])\n  const [showPDF, setShowPDF] = useState(false)"
src = src.replace(old_state, new_state)

# ── Replace download <a> tags with button that opens modal ───────────────
# Line 575 style: <a href="..." download target="_blank" ...>
# Line 601 style: <a href="..." download
# Line 634 style: <a href="..." download

PDF_URL = "/intel-brief-latest.pdf"

# Replace all three link patterns with onClick triggers
# Pattern: any <a ... href="/intel-brief-latest.pdf" ... download ...>
src = re.sub(
    r'<a\s+href="/intel-brief-latest\.pdf"[^>]*>',
    '<button onClick={() => setShowPDF(true)}',
    src
)
# Close tags: </a> → </button> (only near intel-brief context)
# We'll do targeted replacements for each button
# Find "📥 Download latest brief" and "📄 Download Intel Brief" closing tags
src = src.replace(
    '📄 Download Intel Brief\n            </button>',
    '📄 Download Intel Brief\n            </button>'
)

# Fix all </a> that follow our replaced buttons
# More surgical: replace the specific download button blocks
src = re.sub(
    r'(onClick=\{[^}]+setShowPDF[^}]+\}[^>]*>)(.*?)(</button>)',
    lambda m: m.group(1) + m.group(2) + '</button>',
    src, flags=re.DOTALL
)

# ── Add PDF modal just before the final closing </div> or return end ──────
MODAL = '''
      {/* ── PDF Viewer Modal ─────────────────────────────────────────── */}
      {showPDF && (
        <div style={{
          position:'fixed', inset:0, zIndex:9999,
          background:'rgba(0,0,0,0.85)',
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          padding:'16px',
        }}>
          {/* close bar */}
          <div style={{
            width:'100%', maxWidth:'860px',
            display:'flex', justifyContent:'space-between',
            alignItems:'center', marginBottom:'10px',
          }}>
            <span style={{color:'#F0D0D8', fontWeight:700, fontSize:'14px', letterSpacing:'.08em'}}>
              INTEL BRIEF
            </span>
            <button
              onClick={() => setShowPDF(false)}
              style={{
                background:'#8A1030', color:'#fff', border:'none',
                borderRadius:'6px', padding:'6px 16px',
                fontWeight:700, fontSize:'13px', cursor:'pointer',
              }}>
              ✕ Close
            </button>
          </div>
          {/* PDF frame */}
          <iframe
            src="/intel-brief-latest.pdf"
            title="FemSaidia Intel Brief"
            style={{
              width:'100%', maxWidth:'860px',
              height:'80vh', border:'none',
              borderRadius:'8px', background:'#fff',
            }}
          />
          {/* external link fallback */}
          <a
            href="/intel-brief-latest.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop:'10px', color:'#C05010',
              fontSize:'12px', textDecoration:'underline',
            }}>
            Open in new tab ↗
          </a>
        </div>
      )}'''

# Insert modal before the last </div> of the return statement
# Find a reliable anchor — the component's closing return fragment
if '{showPDF && (' not in src:
    # Insert before the final closing tags of the main return
    last_div = src.rfind('\n  )\n}')
    if last_div == -1:
        last_div = src.rfind('\n  )\n}')
    if last_div > 0:
        src = src[:last_div] + MODAL + src[last_div:]
        print("✅ Modal inserted")
    else:
        print("⚠️  Could not find insertion point — add modal manually")
else:
    print("✅ Modal already present")

open(path, 'w').write(src)
print("Done")
