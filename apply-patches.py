#!/usr/bin/env python3
"""
FemSaidia — App.jsx patches
Run: python3 apply-patches.py ~/femsaidiakenya/src/App.jsx
"""
import sys, re

path = sys.argv[1] if len(sys.argv) > 1 else 'src/App.jsx'
src  = open(path).read()
orig = src

# ── PATCH 1: Add totalCases state to DashboardTab ─────────────────────────
src = src.replace(
    "const [countyCounts, setCountyCounts] = useState({})",
    "const [countyCounts, setCountyCounts] = useState({})\n  const [totalCases,   setTotalCases]   = useState(null)"
, 1)

# ── PATCH 2: Add count query to useEffect ────────────────────────────────
OLD_EFFECT = "        setCountyCounts(counts)\n      })\n  },[])";
NEW_EFFECT = """        setCountyCounts(counts)
      })

    // Live total from case tracker
    _sb.from('femicide_cases')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => { if (count !== null) setTotalCases(count) })
  },[])"""
src = src.replace(OLD_EFFECT, NEW_EFFECT, 1)

# ── PATCH 3: Make '600+' stat dynamic ────────────────────────────────────
src = src.replace(
    "{v:'600+', l:'Reported cases',        s:'2023–2025 · verified',                   c:A},",
    "{v: totalCases != null ? totalCases.toLocaleString() : '600+', l:'Reported cases', s:'Case tracker · live data · verified', c:A},"
, 1)

# ── PATCH 4a: hepa nav button — h in white ───────────────────────────────
src = src.replace(
    "🛡 hepa",
    '🛡 <span style={{color:"#fff",fontWeight:700}}>h</span>epa'
, 1)

# ── PATCH 4b: hepa brand card — h in white ───────────────────────────────
src = src.replace(
    "color:'#FF5C28'}}>hepa</div>",
    "}}><span style={{color:'#fff'}}>h</span><span style={{color:'#FF5C28'}}>epa</span></div>"
, 1)

# ── PATCH 4c: 'Access hepa →' link — h in white ──────────────────────────
src = src.replace(
    "Access hepa →",
    'Access <span style={{color:"#fff"}}>h</span>epa →'
, 1)

# ── Report ────────────────────────────────────────────────────────────────
changed = sum(1 for a,b in zip(orig.splitlines(), src.splitlines()) if a != b)
if src == orig:
    print("⚠️  No changes made — check find strings match exactly")
    sys.exit(1)

open(path, 'w').write(src)
print(f"✅  {path} patched — {changed} lines changed")
print("   → Live case count: dynamic from femicide_cases table")
print("   → hepa h: white in nav, brand card, and access link")
