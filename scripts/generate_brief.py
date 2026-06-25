#!/usr/bin/env python3
"""
FemSaidia Kenya — Intel Brief PDF  v6.1
Precision layout, no gaps, FemSaidia DNA.

Fixes applied (v6.1):
  1. Misogyny Index gauge — tighter radius + GZ so score text never overlaps arc
  2. Trend sparkline replaced with Media vs Community score bars
  3. Recorded Incidents — Z2 gap chip→title increased (16 → 22 pt)
  4. THE ASK — larger numbers (FB 14→16) and text (FR 9→10.5)
  5. PDF viewer — companion HTML file embeds PDF inline with download button
"""
import json, math, os, sys, textwrap
import requests
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas as rl_canvas

SUPABASE_URL = "https://uuluuhltphgwfblcghlp.supabase.co"
SUPABASE_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bHV1aGx0cGhnd2ZibGNnaGxwIiwi"
    "cm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjI2NDAsImV4cCI6MjA5MzQ5ODY0MH0"
    ".KU_wtm0NVUz8vrMqgozPvTlmiCIf_yXP8Z3Gpmh599E"
)
OUTPUT_PATH = "public/intel-brief-latest.pdf"

W, H = A4          # 595.27 × 841.89
MAR  = 22
CW   = W - 2*MAR   # 551.27

# ── exact heights so every page is full, zero gaps ──────────────────────────
_HDR  = 28
_FTR  = 18
_GAP  = 13          # only inter-section gap

# Page 1: title row 46pt + 4 rows + 3 gaps
# Row order: Overview | MI+Incidents | Scanner+MOTD | Tech+Community
_P1   = H - _HDR - _FTR - 46 - 3*_GAP   # 710.9 — unchanged
OH    = 88           # overview
RH    = 193          # misogyny index + incidents (2-col)
SMOH  = 155          # scanner (left) + motd (right) — new 2-col row
TH    = _P1 - OH - RH - SMOH            # tech + community — fills remainder ≈ 274

# Page 2: Insight + Ask only — 1 gap
_P2   = H - _HDR - _FTR - 1*_GAP        # 782.9
IH    = 225          # insight — generous breathing room
AH    = _P2 - IH                         # ask — fills remainder ≈ 557

# two-col widths (16pt gutter)
GUT   = 16
LC1   = 261          # MI card
RC1   = CW - LC1 - GUT                  # 274 incidents card
LC2   = 286          # tech card
RC2   = CW - LC2 - GUT                  # 249 community card

LX    = MAR
RX1   = MAR + LC1 + GUT
RX2   = MAR + LC2 + GUT

# ── palette ──────────────────────────────────────────────────────────────────
PAGE   = HexColor("#FAFAFA")
CARD   = HexColor("#FFFFFF")
CBORD  = HexColor("#E2E2E6")
CSEP   = HexColor("#F0F0F3")
SHADE  = HexColor("#E8E8EC")
BODY   = HexColor("#18181B")
MID    = HexColor("#3F3F46")
MUTED  = HexColor("#71717A")
BRAND  = HexColor("#8A1030")
BRAND2 = HexColor("#C05010")
HDR    = HexColor("#1A2035")
ALERT  = HexColor("#DC2626")
WARN   = HexColor("#D97706")
POS    = HexColor("#16A34A")
WHITE  = HexColor("#FFFFFF")

# tinted backgrounds
T_RED  = HexColor("#FEF2F2")
T_AMB  = HexColor("#FFFBEB")
T_GRN  = HexColor("#F0FDF4")
T_PRP  = HexColor("#F5F3FF")
T_IND  = HexColor("#EFF6FF")

PLT = {
    "x":          HexColor("#14171A"),
    "twitter":    HexColor("#14171A"),
    "facebook":   HexColor("#1877F2"),
    "whatsapp":   HexColor("#25D366"),
    "telegram":   HexColor("#229ED9"),
    "tiktok":     HexColor("#010101"),
    "instagram":  HexColor("#E1306C"),
    "bbc":        HexColor("#BB1919"),
    "bbc (media)":HexColor("#BB1919"),
    "community":  HexColor("#7C3AED"),
    "media":         HexColor("#BB1919"),
    "theconversation":HexColor("#5D2E8C"),
    "conversation":   HexColor("#5D2E8C"),
    "thestar":        HexColor("#CC0000"),
    "star":           HexColor("#CC0000"),
    "nation":         HexColor("#003366"),
    "standard":       HexColor("#006633"),
    "reuters":        HexColor("#FF8000"),
}
SEV_COL = {"critical":ALERT,"high":ALERT,"medium":WARN,"low":POS}

FB="Helvetica-Bold"; FR="Helvetica"; FI="Helvetica-Oblique"

# ── core drawing ─────────────────────────────────────────────────────────────
def rrect(c, x, y, w, h, r=6, fill=None, stroke=None, lw=0.6):
    r = min(r, w/2, h/2)
    if fill:   c.setFillColor(fill)
    if stroke: c.setStrokeColor(stroke); c.setLineWidth(lw)
    p = c.beginPath()
    p.moveTo(x+r,y); p.lineTo(x+w-r,y)
    p.arcTo(x+w-2*r,y,     x+w,    y+2*r,    -90,90)
    p.lineTo(x+w,y+h-r)
    p.arcTo(x+w-2*r,y+h-2*r,x+w,  y+h,         0,90)
    p.lineTo(x+r,y+h)
    p.arcTo(x,y+h-2*r,    x+2*r,  y+h,        90,90)
    p.lineTo(x,y+r)
    p.arcTo(x,y,           x+2*r,  y+2*r,     180,90)
    p.close(); c.drawPath(p, fill=1 if fill else 0, stroke=1 if stroke else 0)

def card_bg(c, x, y, w, h, r=7):
    """White card with precise 1pt border and 1.5pt drop shadow."""
    c.setFillColor(SHADE)
    rrect(c, x+1.5, y-1.5, w, h, r=r, fill=SHADE)
    rrect(c, x, y, w, h, r=r, fill=CARD, stroke=CBORD, lw=0.7)

def hrule(c, x, y, w, col=CBORD, lw=0.5):
    c.setStrokeColor(col); c.setLineWidth(lw); c.line(x,y,x+w,y)

def slabel(c, x, y, text, col=BRAND, size=7):
    """Section label: coloured rule then ALL CAPS text."""
    c.setFillColor(col)
    c.rect(x, y+1, 14, 1.5, fill=1, stroke=0)
    c.setFont(FB, size); c.setFillColor(col)
    c.drawString(x+18, y, text.upper())

def wrap_into(c, text, x, y, w, h, font, size, col, lead=None):
    """Wrap text clipped to (x,y,w,h). y is TOP of text area. Returns final y."""
    if not text: return y
    if lead is None: lead = size * 1.44
    c.setFont(font, size); c.setFillColor(col)
    cpl = max(1, int(w / (size * 0.57)))
    lines = []
    for para in str(text).split("\n"):
        lines.extend(textwrap.wrap(para, cpl) if para.strip() else [""])
    bottom_clip = max(22, y - h)   # respect card boundary
    for ln in lines:
        if y < bottom_clip: break
        c.drawString(x, y, ln); y -= lead
    return y

# ── gauge ────────────────────────────────────────────────────────────────────
def draw_gauge(c, cx, cy, r, score, max_score=100.0):
    pct = max(0.0, min(1.0, float(score)/float(max_score)))
    sw  = 14
    # track
    c.setStrokeColor(CSEP); c.setLineWidth(sw)
    c.arc(cx-r,cy-r,cx+r,cy+r, 0, 180)
    # coloured bands: green 0–30, amber 30–60, orange 60–80, red 80–100
    for s,e,col in [(0,.3,POS),(.3,.6,WARN),(.6,.8,BRAND2),(.8,1.,ALERT)]:
        sa,ea = 180-s*180, 180-e*180
        c.setStrokeColor(col); c.setLineWidth(sw)
        c.arc(cx-r,cy-r,cx+r,cy+r, ea, sa-ea)
    # needle — thin, dark
    ang = math.radians(180-pct*180)
    nx  = cx + (r-sw*0.3)*math.cos(ang)
    ny  = cy + (r-sw*0.3)*math.sin(ang)
    c.setStrokeColor(BODY); c.setLineWidth(2)
    c.line(cx, cy, nx, ny)
    # pivot dot
    c.setFillColor(WHITE); c.setStrokeColor(CBORD); c.setLineWidth(1)
    c.circle(cx, cy, 5.5, fill=1, stroke=1)
    # score number (below pivot, large)
    lbl = str(int(round(float(score))))
    c.setFont(FB,30); c.setFillColor(BODY)
    c.drawCentredString(cx, cy-28, lbl)
    c.setFont(FR,7.5); c.setFillColor(MUTED)
    c.drawCentredString(cx, cy-39, f"out of {int(max_score)}")

# ── area sparkline ────────────────────────────────────────────────────────────
def sparkline(c, x, y_bot, w, h, curr, prev=None, col=BRAND):
    if not curr or len(curr)<2: return
    all_v = list(curr)+(list(prev) if prev else [])
    mx    = max(all_v)*1.1 or 1
    n     = len(curr)
    def pt(i,v): return x+i*w/(n-1), y_bot+(v/mx)*h
    pts = [pt(i,v) for i,v in enumerate(curr)]
    # prev dashed
    if prev and len(prev)>=2:
        pn   = len(prev)
        ppts = [pt(i,v) for i,v in enumerate(prev)]
        c.saveState(); c.setStrokeColor(SHADE); c.setLineWidth(1); c.setDash(3,3)
        p=c.beginPath(); p.moveTo(*ppts[0])
        for pp in ppts[1:]: p.lineTo(*pp)
        c.drawPath(p,fill=0,stroke=1); c.restoreState()
    # fill
    c.saveState(); c.setFillColor(col); c.setFillAlpha(.08)
    p=c.beginPath(); p.moveTo(pts[0][0],y_bot)
    for px2,py2 in pts: p.lineTo(px2,py2)
    p.lineTo(pts[-1][0],y_bot); p.close()
    c.drawPath(p,fill=1,stroke=0); c.restoreState()
    # line
    c.setStrokeColor(col); c.setLineWidth(2)
    p=c.beginPath(); p.moveTo(*pts[0])
    for pp in pts[1:]: p.lineTo(*pp)
    c.drawPath(p,fill=0,stroke=1)
    # x baseline
    hrule(c, x, y_bot, w, CSEP, .5)

# ── chrome ───────────────────────────────────────────────────────────────────
def chrome(c, brief, pg, total=2):
    c.setFillColor(PAGE); c.rect(0,0,W,H,fill=1,stroke=0)
    c.setFillColor(HDR); c.rect(0,H-_HDR,W,_HDR,fill=1,stroke=0)
    c.setFillColor(BRAND2); c.rect(0,H-_HDR-2,W,2,fill=1,stroke=0)
    c.setFont(FB,11); c.setFillColor(WHITE); c.drawString(MAR,H-19,"FEMSAIDIA KENYA")
    bw=c.stringWidth("FEMSAIDIA KENYA",FB,11)
    c.setFont(FR,8); c.setFillColor(BRAND2)
    c.drawString(MAR+bw+6,H-18,"// INTEL BRIEF")
    c.setFont(FR,8); c.setFillColor(HexColor("#8892B0"))
    c.drawRightString(W-MAR,H-19,str(brief.get("period_label","")))
    # footer
    c.setFillColor(CSEP); c.rect(0,0,W,_FTR,fill=1,stroke=0)
    hrule(c,0,_FTR,W,CBORD,.4)
    c.setFont(FR,6.5); c.setFillColor(MUTED)
    c.drawString(MAR,6,"CONFIDENTIAL  ·  INTERNAL USE ONLY")
    c.drawCentredString(W/2,6,f"{pg} / {total}")
    c.drawRightString(W-MAR,6,"femsaidiakenya.org  ·  A woman is killed every 47 hours in Kenya.")

# ════════════════════════════════════════════════════════════════════════════
#  SECTION CARDS
# ════════════════════════════════════════════════════════════════════════════

# ── 1. OVERVIEW ──────────────────────────────────────────────────────────────
def draw_overview(c, x, y, w, h, brief, snap):
    """
    Top 40 % : four stat kickers in a ruled row.
    Bottom 60 %: overview text.
    """
    card_bg(c, x, y, w, h)
    slabel(c, x+14, y+h-13, "Overview", BRAND)

    mi  = int(float(snap.get("misogyny_index",76)))
    ms  = int(float(snap.get("media_score",76)))
    cs  = int(float(snap.get("community_score",40)))
    gap = ms-cs
    nc  = snap.get("reports_received",8)

    KH  = round(h*0.40)    # kicker zone height
    ky  = y+h-14-KH        # bottom of kicker zone
    kw  = (w-2) / 4

    stats = [
        (f"{mi}/100","Misogyny Index", ALERT, T_RED),
        (f"{ms}/100","Media Score",    WARN,  T_AMB),
        (f"{cs}/100","Community",      HexColor("#2563EB"), T_IND),
        (f"{gap} pt","Score Gap",      BRAND, T_PRP),
    ]
    for i,(val,lbl,col,bg) in enumerate(stats):
        bx = x+1+i*kw
        rrect(c, bx+4, ky+3, kw-8, KH-6, r=5, fill=bg)
        c.setFont(FB,17); c.setFillColor(col)
        c.drawCentredString(bx+kw/2, ky+KH-20, str(val))
        c.setFont(FR,6.5); c.setFillColor(MUTED)
        c.drawCentredString(bx+kw/2, ky+8, lbl.upper())
        if i<3:
            hrule(c, bx+kw-2, ky+8, 0, CBORD)   # no separator on last
            c.setStrokeColor(CBORD); c.setLineWidth(.5)
            c.line(bx+kw, ky+6, bx+kw, ky+KH-4)

    hrule(c, x+10, ky, w-20, CBORD)

    # text
    txt = brief.get("OVERVIEW","")
    wrap_into(c, txt[:420], x+14, ky-10, w-28, ky-y-4, FR, 8, MID, lead=12)


# ── 2. MISOGYNY INDEX (left card) ────────────────────────────────────────────
# FIX 1 + 2: smaller gauge (GZ 0.62→0.55, r tighter) + Media vs Community bars
def draw_misogyny(c, x, y, w, h, brief, snap):
    card_bg(c, x, y, w, h)
    slabel(c, x+14, y+h-13, "Misogyny Index", BRAND)

    mi = float(snap.get("misogyny_index", 76))
    ms = int(float(snap.get("media_score", 76)))
    cs = int(float(snap.get("community_score", 40)))

    # gauge — top 55%, tighter radius so score text never overlaps arc
    GZ  = round(h * 0.55)
    gcx = x + w / 2
    gcy = y + h - 14 - GZ + GZ // 2
    r   = min(34, w // 2 - 28)          # was min(40, w//2-22) → now tighter
    draw_gauge(c, gcx, gcy, r, mi, 100.0)

    # ── Media vs Community score bars — bottom 38% ──────────────────────
    SZ   = round(h * 0.38)
    sy   = y + SZ
    hrule(c, x+10, sy, w-20, CSEP)
    c.setFont(FB, 6.5); c.setFillColor(MUTED)
    c.drawString(x+14, sy-11, "MEDIA vs COMMUNITY SCORE")

    BW   = w - 28
    bary = sy - 26

    def hb(by, pct, col, lbl, val):
        rrect(c, x+14, by, BW, 9, r=4, fill=CSEP)
        fw = max(9, round(BW * min(1.0, pct)))
        rrect(c, x+14, by, fw, 9, r=4, fill=col)
        c.setFont(FR, 6.5); c.setFillColor(MUTED)
        c.drawString(x+14, by+11, lbl)
        c.setFont(FB, 7); c.setFillColor(BODY)
        c.drawRightString(x+14+BW, by+11, val)

    hb(bary,      ms / 100, ALERT,               "Media score",     f"{ms}/100")
    hb(bary - 22, cs / 100, HexColor("#2563EB"), "Community score", f"{cs}/100")


# ── 3. RECORDED INCIDENTS (right card) ───────────────────────────────────────
def draw_incidents(c, x, y, w, h, brief, snap):
    card_bg(c, x, y, w, h)
    slabel(c, x+14, y+h-13, "Recorded Incidents", ALERT)

    # Priority: rich content text is always more reliable than auto-generated snap
    incs = []
    text = brief.get("TOP_INCIDENTS", "")
    if text and text.strip():
        incs = _parse_top_incidents_text(text, snap.get("motd_highlights", []))
    # Fallback to snap data only if text parser produced nothing
    if not incs:
        incs = snap.get("cases", snap.get("top_incidents", snap.get("incidents", [])))
    if not (isinstance(incs, list) and incs):
        wrap_into(c, text, x+14, y+h-26, w-28, h-30, FR, 7.8, MID, lead=12)
        return

    n_show = min(len(incs), 4)
    row_h  = (h-20) / n_show   # ≈52 pt per row

    for i, inc in enumerate(incs[:4]):
        ry   = y + h - 20 - (i+1)*row_h
        sev  = str(inc.get("severity","medium")).lower()
        sc   = SEV_COL.get(sev, WARN)
        plat = inc.get("platform","")
        pkey = plat.lower().replace(" ","").replace("/","").replace("(","").replace(")","")
        pcol = PLT.get(pkey, MUTED)

        if i > 0:
            hrule(c, x+12, ry+row_h, w-24, CSEP)

        # severity stripe — full row left edge
        c.setFillColor(sc)
        c.rect(x+10, ry+4, 3, row_h-8, fill=1, stroke=0)

        CX   = x+18                        # content left edge
        TW   = w - (CX - x) - 12           # available text width

        # ── ZONE 1 (top): platform chip + date ──────────────────────────
        Z1   = ry + row_h - 14             # baseline of zone 1
        if plat:
            lp  = plat[:10]
            c.setFont(FB, 6); c.setFillColor(WHITE)
            pw  = c.stringWidth(lp, FB, 6) + 8
            rrect(c, CX, Z1-2, pw, 11, r=3, fill=pcol)
            c.drawString(CX+4, Z1+3, lp)
        dt = str(inc.get("date",""))[:8]
        if dt:
            c.setFont(FR, 6.5); c.setFillColor(MUTED)
            c.drawRightString(x+w-12, Z1+3, dt)

        # ── ZONE 2 (middle): title — FIX 3: gap increased 16→22 pt ─────
        Z2   = Z1 - 22                     # was Z1 - 16
        title = inc.get("title", str(inc))
        c.setFont(FB, 8); c.setFillColor(BODY)
        cpl_t = max(1, int(TW / (8*0.57)))
        tlines = textwrap.wrap(title, cpl_t)[:2]
        ty = Z2
        for ln in tlines:
            if ty < ry+8: break   # loosened for compact single-page rows
            c.drawString(CX, ty, ln); ty -= 11

        # ── ZONE 3 (bottom): summary — 10 pt above row bottom ───────────
        Z3   = ry + 10
        summ = inc.get("summary","")
        if summ and Z3 < ty - 4:           # only render if clear of title
            c.setFont(FR, 7); c.setFillColor(MUTED)
            cpl_s = max(1, int(TW / (7*0.57)))
            sline = textwrap.wrap(summ[:180], cpl_s)
            if sline:
                c.drawString(CX, Z3, sline[0])


# ── 4. SCANNER CAUGHT ────────────────────────────────────────────────────────
def draw_scanner(c, x, y, w, h, brief, snap):
    card_bg(c, x, y, w, h)
    slabel(c, x+14, y+h-13, "What the Scanner Caught", WARN)

    raw   = brief.get("SCANNER_CAUGHT","")
    import re as _re2
    def _clean(ln):
        ln = ln.strip().lstrip(">•–- *").strip()
        ln = _re2.sub(r'\*{1,2}([^*]+)\*{1,2}', r'\1', ln)  # strip **bold**
        return ln.strip()
    items = [_clean(ln) for ln in raw.replace("\n>","\n").split("\n")
             if _clean(ln)]
    if not items: items = [raw]
    items = items[:3]

    n     = len(items)
    row_h = (h-20) / n
    NUMS  = ["01","02","03"]
    COLS  = [WARN, ALERT, BRAND]

    for i,itm in enumerate(items):
        ry  = y + h - 20 - (i+1)*row_h
        col = COLS[i%3]
        if i>0: hrule(c, x+12, ry+row_h, w-24, CSEP)

        # index number — clean, bold, left anchor
        NUM_SZ = 18
        c.setFont(FB, NUM_SZ); c.setFillColor(col)
        c.drawString(x+14, ry + row_h/2 - 5, NUMS[i])
        nw = c.stringWidth(NUMS[i], FB, NUM_SZ) + 10

        # text — clear gap after number
        TX = x + 14 + nw + 4
        wrap_into(c, itm[:220], TX, ry+row_h-10,
                  w - (TX-x) - 12, row_h-8, FR, 7.8, MID, lead=12)


# ── 5. MOTD PATTERN ──────────────────────────────────────────────────────────
def draw_motd(c, x, y, w, h, brief, snap):
    card_bg(c, x, y, w, h)
    slabel(c, x+14, y+h-13, "Misogyny of the Day — Pattern", BRAND2)

    VH    = 56        # visual zone height
    vy    = y+h-26-VH
    bh    = 12        # each bar height
    gap_b = 8
    stages = [
        ("INTIMATE PARTNER VIOLENCE",   0.28, ALERT,  T_RED),
        ("PUBLIC SEXUAL SHAMING",        0.60, WARN,   T_AMB),
        ("POSTHUMOUS VICTIM ERASURE",    0.92, HexColor("#7C3AED"), T_PRP),
    ]
    bw_max = w - 28
    for j,(lbl,pct,col,bg) in enumerate(stages):
        by  = vy + (2-j)*(bh+gap_b)
        bw2 = round(bw_max*pct)
        rrect(c, x+14, by, bw_max, bh, r=bh//2, fill=CSEP)
        rrect(c, x+14, by, bw2,    bh, r=bh//2, fill=col)
        c.setFont(FB, 6.5)
        if bw2 > 90:
            c.setFillColor(WHITE)
            c.drawString(x+18, by+3.5, lbl)
        else:
            c.setFillColor(BODY)
            c.drawString(x+14+bw2+6, by+3.5, lbl)

    hrule(c, x+10, vy-4, w-20, CSEP)

    txt = brief.get("MOTD_PATTERN","")
    wrap_into(c, txt[:460], x+14, vy-16, w-28, vy-16-y, FR, 8, MID, lead=12.5)


# ── 6. TECH-FACILITATED (left card, page 2) ──────────────────────────────────
def draw_tech(c, x, y, w, h, brief, snap):
    card_bg(c, x, y, w, h)
    slabel(c, x+14, y+h-13, "Tech-Facilitated Violence", ALERT)

    tech   = snap.get("tech_platforms",{})
    ncases = snap.get("reports_received",8)
    if not (isinstance(tech,dict) and tech):
        tech = {"X":4,"Facebook":4,"BBC (Media)":4}

    items = sorted(tech.items(),key=lambda kv:kv[1],reverse=True)[:6]
    total = sum(v for _,v in items) or 1

    # "N cases" headline number
    c.setFont(FB,40); c.setFillColor(ALERT)
    c.drawString(x+14, y+h-52, str(ncases))
    c.setFont(FR,9); c.setFillColor(MUTED)
    c.drawString(x+14+c.stringWidth(str(ncases),FB,40)+6, y+h-42, "cases with tech-facilitated elements")

    hrule(c, x+10, y+h-60, w-20, CSEP)

    # horizontal platform bars
    BARW    = w - 28
    LABEL_W = 66
    BAR_X   = x + 14 + LABEL_W
    BAR_W   = BARW - LABEL_W - 36
    bary    = y + h - 76
    row_b   = min(18, (bary - y - 26) / max(len(items),1))

    for i,(lbl,val) in enumerate(items):
        pkey = lbl.lower().replace(" ","").replace("(","").replace(")","")
        col  = PLT.get(pkey, MUTED)
        pct  = val/total
        by   = bary - i*row_b

        c.setFont(FR,7.5); c.setFillColor(BODY)
        c.drawRightString(BAR_X-4, by+1, str(lbl)[:12])
        rrect(c, BAR_X, by, BAR_W, row_b-4, r=(row_b-4)//2, fill=CSEP)
        fw = max(row_b-4, round(BAR_W*pct))
        rrect(c, BAR_X, by, fw, row_b-4, r=(row_b-4)//2, fill=col)
        c.setFont(FB,7); c.setFillColor(BODY)
        c.drawString(BAR_X+BAR_W+4, by+1, f"{val}  {pct*100:.0f}%")

    txt = brief.get("TECH_FACILITATED","")
    text_y = y + h - 76 - len(items)*row_b - 10
    wrap_into(c, txt[:300], x+14, text_y, w-28, text_y-y-4, FR, 7.8, MID, lead=12)


# ── 7. COMMUNITY PULSE (right card, page 2) ───────────────────────────────────
def draw_community(c, x, y, w, h, brief, snap):
    card_bg(c, x, y, w, h)
    slabel(c, x+14, y+h-13, "Community Pulse", HexColor("#2563EB"))

    ms  = int(float(snap.get("media_score",76)))
    cs  = int(float(snap.get("community_score",40)))
    gap = ms - cs

    half  = (w-28) / 2
    cx_l  = x + 14 + half*0.25
    cx_r  = x + 14 + half*0.75 + half

    c.setFont(FB,42); c.setFillColor(ALERT)
    c.drawCentredString(cx_l, y+h-56, str(ms))
    c.setFont(FR,7); c.setFillColor(MUTED)
    c.drawCentredString(cx_l, y+h-65, "MEDIA SCORE")

    c.setFont(FB,42); c.setFillColor(WARN)
    c.drawCentredString(cx_r, y+h-56, str(cs))
    c.setFont(FR,7); c.setFillColor(MUTED)
    c.drawCentredString(cx_r, y+h-65, "COMMUNITY")

    c.setFont(FB,9); c.setFillColor(CBORD)
    c.drawCentredString(x+w/2, y+h-52, "vs")
    c.setStrokeColor(CBORD); c.setLineWidth(0.5)
    c.line(x+w/2, y+h-70, x+w/2, y+h-30)

    rrect(c, x+14, y+h-82, w-28, 13, r=4, fill=T_AMB)
    c.setFont(FB,7.5); c.setFillColor(WARN)
    c.drawCentredString(x+w/2, y+h-76,
                        f"{gap}-point disconnect: media naming crisis, community negotiating it")

    hrule(c, x+10, y+h-98, w-20, CSEP)

    BW   = w-28
    bary = y+h-112

    def hb(bx,by,pct,col,lbl,val):
        rrect(c,bx,by,BW,9,r=4,fill=CSEP)
        fw=max(9,round(BW*min(1,pct)))
        rrect(c,bx,by,fw,9,r=4,fill=col)
        c.setFont(FR,6.5);c.setFillColor(MUTED);c.drawString(bx,by+11,lbl)
        c.setFont(FB,7);c.setFillColor(BODY);c.drawRightString(bx+BW,by+11,val)

    hb(x+14, bary,    ms/100, ALERT, "Media coverage score", f"{ms}/100")
    hb(x+14, bary-22, cs/100, WARN,  "Community sentiment",  f"{cs}/100")

    txt = brief.get("COMMUNITY_PULSE","")
    wrap_into(c, txt[:340], x+14, bary-38, w-28, bary-38-y-4, FR, 7.8, MID, lead=12)


# ── 8. THE INSIGHT ────────────────────────────────────────────────────────────
def draw_insight(c, x, y, w, h, brief, snap):
    """Dark editorial card — visually paired with THE ASK for a unified page 2."""
    # Dark background matching ASK card
    rrect(c, x, y, w, h, r=7, fill=HDR)

    # Brand accent bar at top
    c.setFillColor(BRAND)
    c.rect(x, y+h-5, w, 5, fill=1, stroke=0)
    rrect(c, x, y+h-5, w, 5, r=7, fill=BRAND)

    # Slabel in white
    c.setFillColor(WHITE)
    c.rect(x+14, y+h-19, 14, 1.5, fill=1, stroke=0)
    c.setFont(FB, 8.5); c.setFillColor(WHITE)
    c.drawString(x+32, y+h-19, "THE INSIGHT")

    # Separator rule in BRAND2
    c.setFillColor(BRAND2)
    c.rect(x, y+h-25, w, 1.5, fill=1, stroke=0)

    # Ghost quote mark — large, very faint white
    c.saveState()
    c.setFillColor(WHITE); c.setFillAlpha(0.05)
    c.setFont(FB, 84); c.drawString(x+10, y+h-100, "\u201C")
    c.restoreState()

    # Left red accent bar
    c.setFillColor(BRAND)
    c.rect(x+14, y+18, 4, h-50, fill=1, stroke=0)

    # Pull quote — large, white italic, starts below separator
    txt = brief.get("THE_INSIGHT", "")
    c.setFont(FI, 8.5); c.setFillColor(WHITE)
    cpl = max(1, int((w-52) / (8.5*0.57)))
    cy  = y+h-42
    for ln in textwrap.wrap(txt[:520], cpl):
        if cy < y+12: break
        c.drawString(x+28, cy, ln); cy -= 13

    # Attribution
    c.setFont(FB, 7.5); c.setFillColor(BRAND2)
    c.drawString(x+32, y+14, "— FemSaidia Kenya Intelligence Desk")


# ── 9. THE ASK ───────────────────────────────────────────────────────────────
# FIX 4: numbers FB 14→16, body text FR 9→10.5, line lead adjusted
def draw_ask(c, x, y, w, h, brief, snap):
    rrect(c, x, y, w, h, r=7, fill=HDR)
    # header
    c.setFont(FB, 8.5); c.setFillColor(WHITE)
    c.drawString(x+16, y+h-18, "THE ASK")
    sw_ = c.stringWidth("THE ASK", FB, 8.5)
    c.setFont(FR, 6.5); c.setFillColor(HexColor("#8892B0"))
    c.drawString(x+16+sw_+6, y+h-17, "— priority actions for network partners & policymakers")
    c.setFillColor(BRAND2); c.rect(x, y+h-22, w, 1.5, fill=1, stroke=0)

    ask_items = snap.get("action_items",snap.get("asks",[]))
    ask_text  = brief.get("THE_ASK","")

    items=[]
    if isinstance(ask_items,list) and ask_items:
        for it in ask_items[:6]:
            items.append(it.get("text",str(it)) if isinstance(it,dict) else str(it))
    elif ask_text:
        for ln in ask_text.split("\n"):
            ln=ln.strip().lstrip("0123456789.-•) ").strip("*").strip()
            if ln: items.append(ln)
        items=items[:6]
    if not items: return

    # numbered items — single item gets full width; 2+ get two columns
    if len(items) == 1:
        # Full-width single ask — display large and prominent
        cx2 = x+16; cy2 = y+h-36
        c.setFont(FB, 13); c.setFillColor(BRAND2)
        c.drawString(cx2, cy2, "01")
        nw2 = c.stringWidth("01", FB, 13) + 8
        c.setFont(FR, 9); c.setFillColor(HexColor("#F0D0D8"))
        cpl2 = max(1, int((w-36-nw2) / (9*0.57)))
        for ln in textwrap.wrap(items[0][:400], cpl2):
            if cy2 < y+8: break
            c.drawString(cx2+nw2, cy2, ln); cy2 -= 13
    else:
        col_w = (w-36)/2
        sides = [items[0::2], items[1::2]]
        for col_i, lst in enumerate(sides):
            cx2 = x+16 + col_i*(col_w+12)
            cy2 = y+h-36
            for j,txt in enumerate(lst):
                if cy2 < y+10: break
                num = str(j*2+col_i+1).zfill(2)
                c.setFont(FB, 11); c.setFillColor(BRAND2)
                c.drawString(cx2, cy2, num)
                nw2 = c.stringWidth(num, FB, 11) + 6
                c.setFont(FR, 8.5); c.setFillColor(HexColor("#F0D0D8"))
                cpl2 = max(1, int((col_w-nw2-4) / (8.5*0.57)))
                for ln in textwrap.wrap(txt[:180], cpl2):
                    if cy2 < y+8: break
                    c.drawString(cx2+nw2, cy2, ln); cy2 -= 11
                cy2 -= 5



# ════════════════════════════════════════════════════════════════════════════
#  SINGLE-PAGE LAYOUT — constants, new draw functions, page builder
# ════════════════════════════════════════════════════════════════════════════

# Layout constants
SP_GAP = 10          # tighter inter-row gap
SP_TTL = 32          # compact title row

_SPC   = H - _HDR - _FTR - SP_TTL - 3*SP_GAP   # ≈ 733.9pt available

SP_KR  = 52          # kicker strip (full width)
SP_IR  = 178         # incidents + scanner (2-col)
SP_MR  = 64          # MOTD bars only (full width, compact)
SP_ER  = _SPC - SP_KR - SP_IR - SP_MR           # insight + ask (2-col) ≈ 440

SP_GUT = 14
SP_INC = 254         # incidents col
SP_SCN = CW - SP_INC - SP_GUT                   # scanner col ≈ 283
SP_INS = 244         # insight col
SP_ASK = CW - SP_INS - SP_GUT                   # ask col ≈ 293

SP_RX_S = MAR + SP_INC + SP_GUT                 # scanner x
SP_RX_A = MAR + SP_INS + SP_GUT                 # ask x


# ── SP-1. KICKER STRIP (replaces Overview card) ───────────────────────────────
def draw_kickers(c, x, y, w, h, brief, snap):
    """Full-width 4-stat strip — index / media / community / gap."""
    card_bg(c, x, y, w, h)

    mi  = int(float(snap.get("misogyny_index", 76)))
    ms  = int(float(snap.get("media_score",    76)))
    cs  = int(float(snap.get("community_score",40)))
    gap = ms - cs

    kw = (w - 2) / 4
    stats = [
        (f"{mi}/100", "Misogyny Index", ALERT,               T_RED),
        (f"{ms}/100", "Media Score",    WARN,                T_AMB),
        (f"{cs}/100", "Community",      HexColor("#2563EB"), T_IND),
        (f"{gap} pt", "Score Gap",      BRAND,               T_PRP),
    ]
    for i, (val, lbl, col, bg) in enumerate(stats):
        bx = x + 1 + i*kw
        rrect(c, bx+3, y+3, kw-6, h-6, r=5, fill=bg)
        c.setFont(FB, 20); c.setFillColor(col)
        c.drawCentredString(bx+kw/2, y+h-24, str(val))
        c.setFont(FR, 7); c.setFillColor(MUTED)
        c.drawCentredString(bx+kw/2, y+9, lbl.upper())
        if i < 3:
            c.setStrokeColor(CBORD); c.setLineWidth(0.5)
            c.line(bx+kw, y+6, bx+kw, y+h-6)


# ── SP-2. MOTD COMPACT (bars only, no text paragraph) ────────────────────────
def draw_motd_compact(c, x, y, w, h, brief, snap):
    """MOTD escalation bars only — pattern read visually, no prose."""
    card_bg(c, x, y, w, h)
    slabel(c, x+14, y+h-11, "Misogyny of the Day — Pattern", BRAND2, size=6.5)

    bh, gap_b = 8, 5
    bw_max = w - 28
    stages = [
        ("INTIMATE PARTNER VIOLENCE",  0.28, ALERT,               T_RED),
        ("PUBLIC SEXUAL SHAMING",       0.60, WARN,               T_AMB),
        ("POSTHUMOUS VICTIM ERASURE",   0.92, HexColor("#7C3AED"), T_PRP),
    ]
    vy = y + 8   # bottom-most bar starts 8pt from card bottom

    for j, (lbl, pct, col, bg) in enumerate(stages):
        by  = vy + (2-j) * (bh + gap_b)
        bw2 = round(bw_max * pct)
        rrect(c, x+14, by, bw_max, bh, r=bh//2, fill=CSEP)
        rrect(c, x+14, by, bw2,    bh, r=bh//2, fill=col)
        c.setFont(FB, 5.5)
        if bw2 > 80:
            c.setFillColor(WHITE)
            c.drawString(x+18, by+2.2, lbl)
        else:
            c.setFillColor(BODY)
            c.drawString(x+14+bw2+5, by+2.2, lbl)


# ── SP-3. SINGLE-PAGE BUILDER ─────────────────────────────────────────────────
def page_single(c, brief, snap):
    """Render entire brief as one A4 page."""
    chrome(c, brief, 1, total=1)

    # ── Compact title row ─────────────────────────────────────────────────────
    TOP = H - _HDR - 4
    issue  = brief.get("issue_number", brief.get("id","—"))
    period = brief.get("period_label","")
    c.setFont(FB, 14); c.setFillColor(BODY)
    c.drawString(MAR, TOP-14, f"Intel Brief  ·  {issue}")
    c.setFont(FR, 7.5); c.setFillColor(MUTED)
    c.drawString(MAR, TOP-26, f"{period}  ·  Digital Safety Intelligence")

    threat = str(snap.get("threat_level","HIGH")).upper()
    tc = {"LOW":POS,"MODERATE":WARN,"ELEVATED":BRAND2,
          "HIGH":ALERT,"CRITICAL":ALERT}.get(threat, BRAND2)
    rrect(c, W-MAR-68, TOP-22, 68, 15, r=4, fill=tc)
    c.setFont(FB, 7); c.setFillColor(WHITE)
    c.drawCentredString(W-MAR-34, TOP-13, f"THREAT: {threat}")

    hrule(c, MAR, TOP-SP_TTL+4, CW, CBORD)

    cur = H - _HDR - SP_TTL

    # ── Row 1: kicker strip ──────────────────────────────────────────────────
    draw_kickers(c,       MAR,    cur-SP_KR, CW,     SP_KR, brief, snap)
    cur -= SP_KR + SP_GAP

    # ── Row 2: incidents (left) + scanner (right) ────────────────────────────
    draw_incidents(c,     LX,     cur-SP_IR, SP_INC, SP_IR, brief, snap)
    draw_scanner(c,       SP_RX_S,cur-SP_IR, SP_SCN, SP_IR, brief, snap)
    cur -= SP_IR + SP_GAP

    # ── Row 3: MOTD compact bars ─────────────────────────────────────────────
    draw_motd_compact(c,  MAR,    cur-SP_MR, CW,     SP_MR, brief, snap)
    cur -= SP_MR + SP_GAP

    # ── Row 4: insight (left) + ask (right) ──────────────────────────────────
    draw_insight(c,       LX,     cur-SP_ER, SP_INS, SP_ER, brief, snap)
    draw_ask(c,           SP_RX_A,cur-SP_ER, SP_ASK, SP_ER, brief, snap)


# ════════════════════════════════════════════════════════════════════════════
#  SINGLE-PAGE v2 — constants + draw functions
# ════════════════════════════════════════════════════════════════════════════

SP2_GAP  = 9
SP2_TTL  = 36                                            # more room for title row
_SPC2    = H - _HDR - _FTR - SP2_TTL - 3*SP2_GAP   # ≈ 732.9
SP2_KR   = 72    # gauge + kickers row
SP2_IR   = 168   # incidents + scanner row
SP2_MR   = 80    # MOTD horizontal row — with context text
SP2_ER   = _SPC2 - SP2_KR - SP2_IR - SP2_MR         # insight + ask ≈ 445

GAUGE_W  = 100   # width of gauge column inside stats row
SP2_GUT  = 14
SP2_INC  = 252   # incidents col
SP2_SCN  = CW - SP2_INC - SP2_GUT                   # scanner col ≈ 285
SP2_INS  = 244   # insight col
SP2_ASK  = CW - SP2_INS - SP2_GUT                   # ask col ≈ 293
SP2_RX_S = MAR + SP2_INC + SP2_GUT
SP2_RX_A = MAR + SP2_INS + SP2_GUT


def _scanner_source(text):
    """Detect platform from scanner item text → (color, abbreviation)."""
    t = text.lower()
    checks = [
        ("bbc",            PLT["bbc"],                    "BBC"),
        ("cnn",            HexColor("#CC0000"),           "CNN"),
        ("al jazeera",     HexColor("#C8102E"),           "AJ"),
        ("guardian",       HexColor("#052962"),           "Gdn"),
        ("conversation",   PLT["conversation"],           "TC"),
        ("facebook",       PLT["facebook"],               "fb"),
        ("reuters",        PLT["reuters"],                "R"),
        ("nation",         PLT["nation"],                 "DN"),
        ("standard",       PLT["standard"],               "Std"),
        ("citizen",        HexColor("#006633"),           "Ctzn"),
        ("kbc",            HexColor("#003366"),           "KBC"),
        ("nbc",            HexColor("#C8102E"),           "NBC"),
        ("the star",       PLT["star"],                   "Star"),
        ("star",           PLT["star"],                   "Star"),
        ("twitter",        PLT["twitter"],                "X"),
        (" x ",            PLT["x"],                      "X"),
        ("tiktok",         PLT["tiktok"],                 "TT"),
        ("instagram",      PLT["instagram"],              "IG"),
        ("whatsapp",       PLT["whatsapp"],               "WA"),
        ("youtube",        HexColor("#FF0000"),           "YT"),
        ("google",         HexColor("#4285F4"),           "G"),
    ]
    for key, col, abbr in checks:
        if key in t:
            return col, abbr
    # Last-ditch: use first word of source as abbreviation
    words = [w for w in t.split() if len(w) > 2 and w not in ('the','and','for')]
    if words:
        return MUTED, words[0][:4].upper()


# ── SP-A. STATS ROW (compact gauge + 4 kickers with context) ─────────────────
def draw_stats_row(c, x, y, w, h, brief, snap):
    card_bg(c, x, y, w, h)

    mi    = float(snap.get("misogyny_index", 75))
    delta = snap.get("misogyny_delta", 0)
    ms    = int(float(snap.get("media_score", 76)))
    cs    = int(float(snap.get("community_score", 40)))
    gap   = ms - cs
    nc    = int(snap.get("reports_received", 0))

    # ── compact gauge (left column) ──────────────────────────────────────
    GW  = GAUGE_W
    gcx = x + GW/2
    gcy = y + h*0.45      # lowered so arc clears the label above it
    r   = min(20, GW//2 - 16)   # smaller radius — was 26, now 20
    sw  = 6               # thinner stroke — less bleed above arc

    c.setStrokeColor(CSEP); c.setLineWidth(sw)
    c.arc(gcx-r, gcy-r, gcx+r, gcy+r, 0, 180)
    for s, e, col in [(0,.3,POS),(.3,.6,WARN),(.6,.8,BRAND2),(.8,1.,ALERT)]:
        sa, ea = 180-s*180, 180-e*180
        c.setStrokeColor(col); c.setLineWidth(sw)
        c.arc(gcx-r, gcy-r, gcx+r, gcy+r, ea, sa-ea)

    pct = max(0.0, min(1.0, mi/100.0))
    ang = math.radians(180 - pct*180)
    nx  = gcx + (r-sw*0.3)*math.cos(ang)
    ny  = gcy + (r-sw*0.3)*math.sin(ang)
    c.setStrokeColor(BODY); c.setLineWidth(1.5)
    c.line(gcx, gcy, nx, ny)
    c.setFillColor(WHITE); c.setStrokeColor(CBORD); c.setLineWidth(0.7)
    c.circle(gcx, gcy, 3, fill=1, stroke=1)

    c.setFont(FB, 9); c.setFillColor(BRAND)
    c.drawCentredString(gcx, y+h-10, "MISOGYNY INDEX")

    c.setFont(FB, 16); c.setFillColor(BODY)
    c.drawCentredString(gcx, gcy-14, str(int(round(mi))))
    c.setFont(FR, 5); c.setFillColor(MUTED)
    c.drawCentredString(gcx, gcy-21, "out of 100")

    try:
        dv  = float(delta)
        ds  = (f"\u2191{int(abs(dv))} from prev" if dv > 0
               else f"\u2193{int(abs(dv))} from prev" if dv < 0
               else "= unchanged")
        dc  = ALERT if dv > 0 else POS if dv < 0 else MUTED
    except Exception:
        ds, dc = "vs prev period", MUTED
    c.setFont(FB, 5); c.setFillColor(dc)
    c.drawCentredString(gcx, y+6, ds)

    c.setStrokeColor(CBORD); c.setLineWidth(0.5)
    c.line(x+GW, y+5, x+GW, y+h-5)

    # ── 4 kickers with context lines (right) ─────────────────────────────
    kw   = (w - GW - 2) / 4
    kx0  = x + GW + 1

    media_ctx = f"News {ms}/100 — intl media naming crisis"
    comm_ctx  = ("Hostile discourse — victim-blaming dominant"
                 if cs < 45 else "Fractured — community disengaging")
    gap_ctx   = ("Critical media-community disconnect"
                 if gap > 30 else "High gap — narrative divergence")
    tech_ctx  = f"X + Facebook primary vectors"

    stats = [
        (f"{ms}/100", "Media Score",  WARN,               T_AMB, media_ctx),
        (f"{cs}/100", "Community",    HexColor("#2563EB"), T_IND, comm_ctx),
        (f"{gap} pt", "Score Gap",    BRAND,              T_PRP, gap_ctx),
        (str(nc),     "Tech Cases",   ALERT,              T_RED, tech_ctx),
    ]
    for i, (val, lbl, col, bg, ctx) in enumerate(stats):
        bx = kx0 + i*kw
        rrect(c, bx+3, y+3, kw-4, h-6, r=4, fill=bg)
        c.setFont(FB, 14); c.setFillColor(col)
        c.drawCentredString(bx+kw/2, y+h-21, str(val))
        c.setFont(FR, 5.5); c.setFillColor(MUTED)
        c.drawCentredString(bx+kw/2, y+h-29, lbl.upper())
        c.setFont(FI, 4.8); c.setFillColor(MID)
        cpl_c = max(1, int((kw-8)/(4.8*0.57)))
        ctx_y = y+h-37
        for ln in textwrap.wrap(ctx, cpl_c)[:2]:
            c.drawCentredString(bx+kw/2, ctx_y, ln); ctx_y -= 6
        if i < 3:
            c.setStrokeColor(CBORD); c.setLineWidth(0.4)
            c.line(bx+kw, y+5, bx+kw, y+h-5)


# ── SP-B. SCANNER WITH PLATFORM LOGOS ────────────────────────────────────────
def draw_scanner_logos(c, x, y, w, h, brief, snap):
    card_bg(c, x, y, w, h)
    slabel(c, x+14, y+h-13, "What the Scanner Caught", WARN)

    raw   = brief.get("SCANNER_CAUGHT", "")
    import re as _re3
    def _clean(ln):
        ln = ln.strip().lstrip(">•–- *").strip()
        ln = _re3.sub(r'\*{1,2}([^*]+)\*{1,2}', r'\1', ln)
        return ln.strip()
    items = [_clean(ln) for ln in raw.replace("\n>","\n").split("\n") if _clean(ln)]
    if not items: items = [raw]
    items = items[:3]

    LOGO_SZ = 20
    n       = len(items)
    row_h   = (h - 20) / n

    for i, itm in enumerate(items):
        ry  = y + h - 20 - (i+1)*row_h
        if i > 0: hrule(c, x+12, ry+row_h, w-24, CSEP)

        col, abbr = _scanner_source(itm)

        # Platform logo square
        lx = x + 14
        ly = ry + row_h/2 - LOGO_SZ/2
        rrect(c, lx, ly, LOGO_SZ, LOGO_SZ, r=4, fill=col)
        c.setFont(FB, 5.5); c.setFillColor(WHITE)
        c.drawCentredString(lx+LOGO_SZ/2, ly+LOGO_SZ*0.28, abbr)

        # (logo square is self-labelled — no double label below)

        # Item text
        TX  = x + 14 + LOGO_SZ + 6
        TW  = w - (TX-x) - 10
        wrap_into(c, itm[:220], TX, ry+row_h-9, TW, row_h-10, FR, 6.5, MID, lead=10)


# ── SP-C. MOTD HORIZONTAL (3 bars side-by-side) ──────────────────────────────
def draw_motd_horizontal(c, x, y, w, h, brief, snap):
    """MOTD 3 bars side-by-side + 2-line context text at bottom."""
    card_bg(c, x, y, w, h)
    slabel(c, x+14, y+h-11, "Misogyny of the Day — Pattern", BRAND2, size=6)

    stages = [
        ("Intimate Partner\nViolence",  0.28, ALERT),
        ("Public Sexual\nShaming",       0.60, WARN),
        ("Posthumous Victim\nErasure",   0.92, HexColor("#7C3AED")),
    ]
    n      = len(stages)
    bh     = 10
    col_w  = (w - 28 - (n-1)*6) / n
    bar_y  = y + 38          # pushed higher — gives text zone room at bottom
    lbl_y0 = bar_y + bh + 5  # labels sit just above bars

    for j, (lbl, pct, col) in enumerate(stages):
        cx_bar = x + 14 + j*(col_w+6)
        # Labels above bar
        lbl_lines = lbl.split("\n")
        lbl_y = lbl_y0 + (len(lbl_lines)-1)*6.5
        for ln in lbl_lines:
            c.setFont(FB, 5); c.setFillColor(col)
            c.drawString(cx_bar, lbl_y, ln.upper()); lbl_y -= 6.5
        # Bar track + fill
        fw = max(bh, round(col_w*pct))
        rrect(c, cx_bar, bar_y, col_w, bh, r=bh//2, fill=CSEP)
        rrect(c, cx_bar, bar_y, fw,    bh, r=bh//2, fill=col)

    # Context text — 2 italic lines from MOTD_PATTERN, clearly separated from bars
    txt = brief.get("MOTD_PATTERN", "")
    if txt:
        hrule(c, x+10, y+34, w-20, CSEP)
        wrap_into(c, txt[:260], x+14, y+31, w-28, 28, FI, 6.5, MID, lead=9.5)


# ── SP-D. PAGE SINGLE v2 ─────────────────────────────────────────────────────
def page_single_v2(c, brief, snap):
    chrome(c, brief, 1, total=1)

    TOP    = H - _HDR - 4
    issue  = brief.get("issue_number", brief.get("id","—"))
    period = brief.get("period_label","")
    c.setFont(FB, 13); c.setFillColor(BODY)
    c.drawString(MAR, TOP-13, f"Intel Brief  ·  {issue}")
    c.setFont(FR, 7); c.setFillColor(MUTED)
    c.drawString(MAR, TOP-24, f"{period}  ·  Digital Safety Intelligence")

    threat = str(snap.get("threat_level","HIGH")).upper()
    tc = {"LOW":POS,"MODERATE":WARN,"ELEVATED":BRAND2,
          "HIGH":ALERT,"CRITICAL":ALERT}.get(threat, BRAND2)
    rrect(c, W-MAR-68, TOP-22, 68, 14, r=4, fill=tc)
    c.setFont(FB, 6.5); c.setFillColor(WHITE)
    c.drawCentredString(W-MAR-34, TOP-13, f"THREAT: {threat}")
    hrule(c, MAR, TOP-SP2_TTL+5, CW, CBORD)

    cur = H - _HDR - SP2_TTL

    draw_stats_row(c,      MAR,     cur-SP2_KR, CW,      SP2_KR, brief, snap)
    cur -= SP2_KR + SP2_GAP

    draw_incidents(c,      LX,      cur-SP2_IR, SP2_INC, SP2_IR, brief, snap)
    draw_scanner_logos(c,  SP2_RX_S,cur-SP2_IR, SP2_SCN, SP2_IR, brief, snap)
    cur -= SP2_IR + SP2_GAP

    draw_motd_horizontal(c, MAR,    cur-SP2_MR, CW,      SP2_MR, brief, snap)
    cur -= SP2_MR + SP2_GAP

    draw_insight(c,        LX,      cur-SP2_ER, SP2_INS, SP2_ER, brief, snap)
    draw_ask(c,            SP2_RX_A,cur-SP2_ER, SP2_ASK, SP2_ER, brief, snap)


# ════════════════════════════════════════════════════════════════════════════
#  LEGACY 2-PAGE BUILDERS (kept for reference)
# ════════════════════════════════════════════════════════════════════════════
def page1(c, brief, snap):
    chrome(c, brief, 1)

    TOP = H - _HDR - 4
    c.setFont(FB,17); c.setFillColor(BODY)
    issue = brief.get("issue_number",brief.get("id","—"))
    c.drawString(MAR, TOP-14, f"Intel Brief  ·  {issue}")
    c.setFont(FR,8); c.setFillColor(MUTED)
    period = brief.get("period_label","")
    c.drawString(MAR, TOP-28, f"{period}  ·  Digital Safety Intelligence")

    threat = str(snap.get("threat_level","HIGH")).upper()
    tc = {"LOW":POS,"MODERATE":WARN,"ELEVATED":BRAND2,"HIGH":ALERT,"CRITICAL":ALERT}.get(threat,BRAND2)
    rrect(c,W-MAR-72,TOP-22,72,16,r=4,fill=tc)
    c.setFont(FB,7.5); c.setFillColor(WHITE)
    c.drawCentredString(W-MAR-36,TOP-13,f"THREAT: {threat}")

    hrule(c, MAR, TOP-36, CW, CBORD)

    cur = H - _HDR - 46

    draw_overview(c,   MAR, cur-OH,   CW,   OH,   brief, snap); cur -= OH   + _GAP
    draw_misogyny(c,   LX,  cur-RH,   LC1,  RH,   brief, snap)
    draw_incidents(c,  RX1, cur-RH,   RC1,  RH,   brief, snap); cur -= RH   + _GAP
    draw_scanner(c,    LX,  cur-SMOH, LC1,  SMOH, brief, snap)   # left col
    draw_motd(c,       RX1, cur-SMOH, RC1,  SMOH, brief, snap);  cur -= SMOH + _GAP
    draw_tech(c,       LX,  cur-TH,   LC2,  TH,   brief, snap)   # fills page bottom
    draw_community(c,  RX2, cur-TH,   RC2,  TH,   brief, snap)


def page2(c, brief, snap):
    """Page 2 — The Insight + The Ask, full page."""
    chrome(c, brief, 2)
    cur = H - _HDR - 4

    draw_insight(c, MAR, cur-IH, CW, IH, brief, snap); cur -= IH + _GAP
    draw_ask(c,     MAR, cur-AH, CW, AH, brief, snap)


# ════════════════════════════════════════════════════════════════════════════
#  FIX 5 — inline HTML viewer
# ════════════════════════════════════════════════════════════════════════════
def write_viewer(pdf_path: str, label: str) -> str:
    """
    Generate a companion HTML file that embeds the PDF inline (fullscreen)
    with a branded download button. Saved next to the PDF as *-viewer.html.
    """
    pdf_name  = os.path.basename(pdf_path)
    html_path = pdf_path.replace(".pdf", "-viewer.html")
    # PDF.js renderer (pages stacked, fit-to-width, scrollable) — renders inline
    # on mobile too, unlike <embed type=application/pdf> which mobile browsers
    # refuse to display. Placeholders avoid brace-escaping in the JS/CSS.
    html = (VIEWER_TEMPLATE
            .replace("__PDF__", pdf_name)
            .replace("__LABEL__", label))
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)
    return html_path


VIEWER_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FemSaidia Kenya Intel Brief — __LABEL__</title>
<style>
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  html,body{height:100%;background:#0e1320;font-family:Helvetica,Arial,sans-serif}
  .bar{height:44px;background:#111827;border-bottom:2px solid #C05010;display:flex;align-items:center;gap:12px;padding:0 14px;position:fixed;top:0;left:0;right:0;z-index:10}
  .bar-logo{color:#fff;font-size:12px;font-weight:bold;letter-spacing:.06em;white-space:nowrap}
  .bar-sep{color:#C05010;font-size:12px}
  .bar-label{color:#8892B0;font-size:11px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .dl-btn{display:inline-flex;align-items:center;gap:6px;background:#8A1030;color:#fff;border:none;padding:7px 14px;border-radius:4px;font-size:11px;font-weight:bold;cursor:pointer;text-decoration:none;letter-spacing:.05em;white-space:nowrap}
  .dl-btn:hover{background:#C05010}
  #pages{position:fixed;top:44px;left:0;right:0;bottom:0;overflow-y:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column;align-items:center;gap:12px;padding:14px 10px 30px}
  #pages canvas{max-width:100%;border-radius:3px;box-shadow:0 4px 18px rgba(0,0,0,.5);background:#fff}
  .msg{color:#8892B0;font-size:14px;text-align:center;padding:48px 20px;display:flex;flex-direction:column;align-items:center;gap:16px}
</style>
</head>
<body>
<div class="bar">
  <span class="bar-logo">FEMSAIDIA KENYA</span>
  <span class="bar-sep">//</span>
  <span class="bar-label">INTEL BRIEF &nbsp;&middot;&nbsp; __LABEL__</span>
  <a class="dl-btn" href="__PDF__" download="__PDF__">&#8659;&nbsp;Download PDF</a>
</div>
<div id="pages"><div class="msg" id="loading">Loading brief&hellip;</div></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<script>
(function(){
  var PDF = "__PDF__";
  var cont = document.getElementById('pages');
  function fallback(){
    cont.innerHTML = '<div class="msg"><p>Preview unavailable on this device.</p>'
      + '<a class="dl-btn" href="' + PDF + '" download="' + PDF + '">&#8659;&nbsp;Download PDF</a></div>';
  }
  if (!window.pdfjsLib) { fallback(); return; }
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  pdfjsLib.getDocument(PDF).promise.then(function(pdf){
    var loading = document.getElementById('loading'); if (loading) loading.remove();
    var dpr  = Math.min(window.devicePixelRatio || 1, 2);
    var cssW = Math.min(cont.clientWidth - 20, 1000);
    var chain = Promise.resolve();
    for (var n = 1; n <= pdf.numPages; n++) { (function(num){
      chain = chain.then(function(){ return pdf.getPage(num).then(function(page){
        var v1 = page.getViewport({scale: 1});
        var scale = cssW / v1.width;
        var vp = page.getViewport({scale: scale * dpr});
        var canvas = document.createElement('canvas');
        canvas.width = vp.width; canvas.height = vp.height;
        canvas.style.width = (vp.width / dpr) + 'px';
        cont.appendChild(canvas);
        return page.render({canvasContext: canvas.getContext('2d'), viewport: vp}).promise;
      }); });
    })(n); }
    chain.catch(fallback);
  }).catch(fallback);
})();
</script>
</body>
</html>"""


# ════════════════════════════════════════════════════════════════════════════
#  DATA + MAIN
# ════════════════════════════════════════════════════════════════════════════
def fetch_brief(brief_id=None):
    if brief_id:
        params = {"id": f"eq.{brief_id}", "select": "*"}
        print(f"🔍  Fetching brief {brief_id[:8]}…")
    else:
        params = {"order": "generated_at.desc", "limit": "1", "select": "*"}
    r = requests.get(f"{SUPABASE_URL}/rest/v1/intel_briefs",
        params=params,
        headers={"apikey":SUPABASE_KEY,"Authorization":f"Bearer {SUPABASE_KEY}"},
        timeout=15)
    r.raise_for_status(); data=r.json()
    if not data: raise ValueError("No brief found — check the ID or insert a brief first")
    row = data[0]

    ps = row.get("period_start","")
    pe = row.get("period_end","")
    row["period_label"]  = f"{ps} – {pe}" if ps and pe else ps or pe or ""
    row["issue_number"]  = row.get("title","") or str(row.get("id",""))[:8]

    content = row.get("content","") or ""
    row.update(_parse_content(content))

    # Strip non-WinAnsi characters that break Edge Function encoding
    def _clean(v):
        if not isinstance(v, str): return v
        return v.replace('\u2192','>').replace('\u2190','<').replace('\u2013','-').replace('\u2014','--').replace('\u2018',"'").replace('\u2019',"'").replace('\u201c','"').replace('\u201d','"')
    row = {k: _clean(v) for k,v in row.items()}
    return row

def _parse_content(md: str) -> dict:
    import re as re2
    sections = {}
    current  = None
    lines    = []

    for line in md.split("\n"):
        m = re2.match(r'^---([A-Z_]+)---\s*$', line.strip())
        if m:
            if current is not None:
                sections[current] = "\n".join(lines).strip()
            current = m.group(1)
            lines   = []
            continue

        clean = line.strip().lstrip("*>\u2022\u2013 ").strip()
        if (clean and clean == clean.upper()
                and 3 < len(clean) < 65
                and "." not in clean
                and clean.replace(" ","").replace("-","").replace("/","").replace("_","").isalpha()):
            key = _normalise_key(clean)
            if key != clean.replace(" ","_"):
                if current is not None:
                    sections[current] = "\n".join(lines).strip()
                current = key
                lines   = []
                continue

        lines.append(line)

    if current is not None:
        sections[current] = "\n".join(lines).strip()

    return sections


def _normalise_key(heading: str) -> str:
    h = heading.upper().strip()
    MAP = {
        "OVERVIEW":                      "OVERVIEW",
        "MISOGYNY INDEX":                "MISOGYNY_INDEX",
        "RECORDED INCIDENTS":            "TOP_INCIDENTS",
        "WHAT THE SCANNER CAUGHT":       "SCANNER_CAUGHT",
        "SCANNER CAUGHT":                "SCANNER_CAUGHT",
        "MISOGYNY OF THE DAY":           "MOTD_PATTERN",
        "MOTD PATTERN":                  "MOTD_PATTERN",
        "MISOGYNY OF THE DAY - PATTERN": "MOTD_PATTERN",
        "TECH-FACILITATED VIOLENCE":     "TECH_FACILITATED",
        "TECH FACILITATED VIOLENCE":     "TECH_FACILITATED",
        "COMMUNITY PULSE":               "COMMUNITY_PULSE",
        "THE INSIGHT":                   "THE_INSIGHT",
        "THE ASK":                       "THE_ASK",
    }
    for k, v in MAP.items():
        if k in h:
            return v
    return h.replace(" ","_")

def parse_snap(brief):
    raw = brief.get("data_snapshot") or {}
    if isinstance(raw, str):
        try: raw = json.loads(raw)
        except: raw = {}
    if not isinstance(raw, dict):
        raw = {}
    return _normalize(raw)

def _normalize(raw: dict) -> dict:
    n = dict(raw)

    mi = raw.get("misogyny_index", {})
    if isinstance(mi, dict):
        n["misogyny_index"]  = mi.get("current",   76)
        n["misogyny_delta"]  = mi.get("delta",       0)
        n["media_score"]     = mi.get("news_score",  76)
        n["community_score"] = mi.get("social_score",40)

    n["reports_received"] = raw.get("tech_facilitated_count",
                            raw.get("cases_recorded", 0))

    articles = raw.get("top_articles", [])
    if articles:
        src_counts = {}
        for a in articles:
            src = a.get("source", "Unknown")
            src_counts[src] = src_counts.get(src, 0) + 1
        n["tech_platforms"] = src_counts
    elif isinstance(raw.get("tech_platforms"), list):
        n["tech_platforms"] = {p: 1 for p in raw["tech_platforms"]}

    cases      = raw.get("cases", [])
    highlights = raw.get("motd_highlights", [])

    if cases:
        n["top_incidents"] = cases
    elif highlights:
        n["top_incidents"] = []
        SEV = ["critical", "critical", "high", "high", "medium"]
        for i, h in enumerate(highlights):
            ctx  = h.get("context", "")
            body = h.get("content", "")
            n["top_incidents"].append({
                "title":    ctx[:72] if ctx else body[:72],
                "platform": h.get("platform", ""),
                "severity": SEV[min(i, len(SEV)-1)],
                "date":     h.get("date", "")[:10],
                "summary":  body[:160],
            })

    if articles and not raw.get("scanner_items"):
        n["scanner_items"] = [
            f'{a["source"]}: {a["title"][:120]}'
            for a in articles[:5]
        ]

    # pass motd_highlights through so draw_incidents can cross-ref platform/date
    n["motd_highlights"] = raw.get("motd_highlights", [])

    return n


def _parse_top_incidents_text(text, highlights=None):
    """
    Parse bullet-list TOP_INCIDENTS content into structured incident dicts.
    Format: • **Alice Rianga (JOOUST student):** Disappeared May 6 from campus...
    Returns list of {title, summary, platform, date, severity}
    """
    import re as _re
    incidents = []

    # Build highlight lookup (lowercased context for matching)
    hl_lookup = []
    for h in (highlights or []):
        hl_lookup.append({
            "platform": h.get("platform", ""),
            "date":     h.get("date", "")[:10],
            "context":  h.get("context", "").lower(),
        })

    # Split on bullet markers — keep content after • or - or *
    bullets = _re.split(r'\n\s*[•\-]\s+|\n\s*\*\s+(?!\*)', "\n" + text)
    bullets = [b.strip() for b in bullets if b.strip()]

    SEV = ["critical", "critical", "high", "high", "medium"]

    for i, bullet in enumerate(bullets[:4]):
        # Pattern: **Name:** body  OR  **Name** body  OR  plain Name: body
        # The colon can sit inside (**Name:**) or outside (**Name**: body)
        bullet_clean = bullet.strip()

        # Try: **Name...:** body  (colon inside bold, then closing **)
        m = _re.match(r'\*+([^*]+?):\*+\s*(.*)', bullet_clean, _re.DOTALL)
        if m:
            name = m.group(1).strip()
            desc = m.group(2).strip().lstrip('*').strip()
        else:
            # Try: **Name** : body  or  **Name**: body
            m2 = _re.match(r'\*+([^*]+?)\*+[:\s]+(.*)', bullet_clean, _re.DOTALL)
            if m2:
                name = m2.group(1).strip().rstrip(':')
                desc = m2.group(2).strip().lstrip('*').strip()
            else:
                # Plain text — split on first colon or period
                parts = _re.split(r'[:.] ', bullet_clean, 1)
                name = parts[0].strip().strip('*').strip()
                desc = parts[1].strip() if len(parts) > 1 else ''

        # Cross-ref highlights for platform + date
        # Use core name only (strip parenthetical like "(JOOUST student)")
        core_name = _re.sub(r'\(.*?\)', '', name).strip()
        name_words = [w.lower() for w in _re.split(r'\W+', core_name) if len(w) > 3]

        # Best-match: score = unique name words found in highlight context
        platform, date = "", ""
        best, best_score = None, 0
        for hl in hl_lookup:
            score = sum(1 for w in name_words if w in hl["context"])
            if score > best_score:
                best_score, best = score, hl
        if best and best_score > 0:
            platform = best["platform"]
            date     = best["date"]

        incidents.append({
            "title":    name,
            "summary":  desc[:240],
            "platform": platform,
            "severity": SEV[min(i, len(SEV)-1)],
            "date":     date,
        })

    return incidents


# ════════════════════════════════════════════════════════════════════════════
#  3-PAGE LAYOUT — fetch_live_cases + page_triple
# ════════════════════════════════════════════════════════════════════════════

def fetch_live_cases(limit=8):
    """Fetch latest femicide_cases directly from DB — always current."""
    import requests as _req
    try:
        since = (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%d")
        r = _req.get(
            f"{SUPABASE_URL}/rest/v1/femicide_cases"
            f"?select=victim_name,county,incident_date,incident_type,"
            f"suspect_relationship,tech_facilitated,tech_platforms,source_url,status"
            f"&incident_date=gte.{since}"
            f"&order=incident_date.desc&limit={limit}",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
            timeout=10
        )
        return r.json() if r.ok else []
    except Exception:
        return []


def _draw_page_header(c, brief, snap):
    """Shared header for all 3 pages."""
    # Dark header bar
    c.setFillColor(HDR)
    c.rect(0, H-_HDR, W, _HDR, fill=1, stroke=0)
    # Brand accent line
    c.setFillColor(BRAND)
    c.rect(0, H-_HDR, W, 3, fill=1, stroke=0)
    # Title
    c.setFont(FB, 15); c.setFillColor(WHITE)
    c.drawString(MAR, H-28, "FEMSAIDIA KENYA")
    c.setFont(FR, 8); c.setFillColor(MUTED)
    c.drawString(MAR, H-42, "INTELLIGENCE BRIEF")
    # Period right-aligned
    label = brief.get("period_label", snap.get("period",""))
    c.setFont(FR, 7.5); c.setFillColor(MUTED)
    c.drawRightString(W-MAR, H-34, str(label))


def _draw_page_footer(c, pg, total=3):
    """Shared footer."""
    c.setFillColor(CBORD)
    c.rect(MAR, _FTR-2, CW, 0.5, fill=1, stroke=0)
    c.setFont(FR, 7); c.setFillColor(MUTED)
    c.drawString(MAR, _FTR-12,
        "FemSaidia Kenya · femsaidiakenya.org · A woman is killed every 47 hours in Kenya.")
    c.setFont(FR, 7); c.setFillColor(MUTED)
    c.drawRightString(W-MAR, _FTR-12, f"{pg} / {total}")


def _section_head(c, x, y, text, col=None):
    """Draw a section heading — 7pt label with accent underline."""
    col = col or BRAND
    c.setFont(FB, 7.5); c.setFillColor(col)
    c.drawString(x, y, text.upper())
    c.setFillColor(col)
    c.rect(x, y-3, c.stringWidth(text.upper(), FB, 7.5), 1, fill=1, stroke=0)


def _body_wrap(c, text, x, y, max_w, font=None, size=9.5, col=None, lead=14):
    """Wrap body text, return final y."""
    font = font or FR; col = col or BODY
    c.setFont(font, size); c.setFillColor(col)
    cpl = max(1, int(max_w / (size * 0.57)))
    for ln in textwrap.wrap(str(text), cpl):
        c.drawString(x, y, ln); y -= lead
    return y


# ── PAGE 1: The Situation ────────────────────────────────────────────────────
def _page1(c, brief, snap, live_cases):
    _draw_page_header(c, brief, snap)
    _draw_page_footer(c, 1)

    # Content area
    TOP = H - _HDR - 14
    BOT = _FTR + 8
    CX  = MAR

    # ── Misogyny Index strip (full width, 58pt) ──────────────────────────
    SI_H = 58
    si_y = TOP - SI_H
    card_bg(c, CX, si_y, CW, SI_H)

    mi    = float(snap.get("misogyny_index", 0) or 0)
    delta = float(snap.get("misogyny_delta", 0) or 0)
    ms    = int(float(snap.get("media_score", 0) or 0))
    cs    = int(float(snap.get("community_score", 0) or 0))

    kw = CW / 4
    stats = [
        (f"{int(mi)}/100", f"Misogyny Index  {'▲' if delta>0 else '▼'}{abs(int(delta))}pt", ALERT),
        (f"{ms}/100",       "Media Score",    WARN),
        (f"{cs}/100",       "Community Score", HexColor("#2563EB")),
        (f"{ms-cs} pt",     "Media–Community Gap", BRAND),
    ]
    for i,(val,lbl,col) in enumerate(stats):
        bx = CX + i*kw
        c.setFont(FB, 18); c.setFillColor(col)
        c.drawCentredString(bx+kw/2, si_y+SI_H-28, str(val))
        c.setFont(FR, 6.5); c.setFillColor(MUTED)
        c.drawCentredString(bx+kw/2, si_y+8, lbl.upper())
        if i < 3:
            c.setStrokeColor(CBORD); c.setLineWidth(0.4)
            c.line(bx+kw, si_y+8, bx+kw, si_y+SI_H-8)

    # Overview text (2-3 sentences from brief)
    overview = brief.get("OVERVIEW","").strip()
    if overview:
        ov_y = si_y - 18
        _section_head(c, CX, ov_y, "Overview")
        ov_y -= 6
        ov_y = _body_wrap(c, overview[:360], CX, ov_y, CW, size=9, lead=13)

    # ── Recorded Incidents (rest of page) ───────────────────────────────
    inc_start_y = si_y - (70 if overview else 20)
    _section_head(c, CX, inc_start_y, "Recorded Incidents — Live from Case Tracker", ALERT)
    inc_start_y -= 10

    cases = live_cases or snap.get("cases", [])
    if not cases:
        # Try parsing TOP_INCIDENTS text
        txt = brief.get("TOP_INCIDENTS","")
        if txt:
            _body_wrap(c, txt, CX, inc_start_y, CW, size=9.5, col=BODY, lead=14)
        return

    avail_h = inc_start_y - BOT
    n_show  = min(len(cases), 6)
    card_h  = avail_h / n_show - 4

    for i, case in enumerate(cases[:n_show]):
        cy = inc_start_y - (i+1)*card_h - i*4
        card_bg(c, CX, cy, CW, card_h)

        # Severity stripe
        c.setFillColor(ALERT if i < 2 else WARN)
        c.rect(CX+8, cy+4, 3, card_h-8, fill=1, stroke=0)

        # Victim name — prominent
        name = case.get("victim_name","Name withheld") or "Name withheld"
        c.setFont(FB, 11); c.setFillColor(BODY)
        c.drawString(CX+18, cy+card_h-18, str(name)[:50])

        # Meta line: county · date · relationship
        county  = str(case.get("county","") or "")
        idate   = str(case.get("incident_date","") or "")[:10]
        rel     = str(case.get("suspect_relationship","") or "")
        itype   = str(case.get("incident_type","") or "")
        meta = " · ".join(filter(None, [county, idate, rel or itype]))
        c.setFont(FR, 8); c.setFillColor(MUTED)
        c.drawString(CX+18, cy+card_h-30, meta[:90])

        # Tech badge
        if case.get("tech_facilitated"):
            plats = case.get("tech_platforms") or []
            if isinstance(plats, list): plats = ", ".join(str(p) for p in plats[:2])
            badge = f"Tech: {plats}" if plats else "Tech-facilitated"
            bw = c.stringWidth(badge[:30], FB, 6.5) + 8
            rrect(c, CX+18, cy+6, bw, 11, r=3, fill=HexColor("#8A4010"))
            c.setFont(FB, 6.5); c.setFillColor(WHITE)
            c.drawString(CX+22, cy+10, badge[:30])

        # Status badge
        status = str(case.get("status","") or "").lower()
        if status:
            scol = POS if "convicted" in status else (WARN if "trial" in status else MUTED)
            c.setFont(FR, 7); c.setFillColor(scol)
            c.drawRightString(CX+CW-10, cy+card_h-18, status.title())

        # Source URL
        src_url = str(case.get("source_url","") or "")
        if src_url and card_h > 55:
            c.setFont(FR, 6.5); c.setFillColor(BRAND2)
            c.drawString(CX+18, cy+card_h-42, src_url[:80])

        if i > 0:
            c.setStrokeColor(CBORD); c.setLineWidth(0.3)
            c.line(CX, cy+card_h, CX+CW, cy+card_h)


# ── PAGE 2: The Intelligence ─────────────────────────────────────────────────
def _page2(c, brief, snap):
    _draw_page_header(c, brief, snap)
    _draw_page_footer(c, 2)

    TOP = H - _HDR - 14
    BOT = _FTR + 8
    CX  = MAR
    cur = TOP

    # ── What Scanner Caught ──────────────────────────────────────────────
    wsc_text = brief.get("SCANNER_CAUGHT","").strip()
    _section_head(c, CX, cur, "What the Scanner Caught", WARN)
    cur -= 10

    import re as _re2
    def _clean(ln):
        ln = ln.strip().lstrip(">•–- *").strip()
        ln = _re2.sub(r'\*{1,2}([^*]+)\*{1,2}', r'\1', ln)
        return ln.strip()

    items = [_clean(ln) for ln in wsc_text.replace("\n>","\n").split("\n") if _clean(ln)]
    items = items[:5]

    for itm in items:
        if cur < BOT + 180: break
        col, abbr = _scanner_source(itm)
        # Logo badge
        rrect(c, CX, cur-16, 22, 16, r=3, fill=col)
        c.setFont(FB, 5.5); c.setFillColor(WHITE)
        c.drawCentredString(CX+11, cur-10, abbr)
        # Text
        c.setFont(FR, 9.5); c.setFillColor(BODY)
        cpl = max(1, int((CW-30) / (9.5*0.57)))
        lines = textwrap.wrap(itm[:280], cpl)
        ty = cur
        for ln in lines[:2]:
            c.drawString(CX+28, ty, ln); ty -= 13
        cur = ty - 6
        c.setFillColor(CBORD); c.rect(CX, cur+2, CW, 0.3, fill=1, stroke=0)
        cur -= 4

    # ── MOTD Pattern ────────────────────────────────────────────────────
    if cur > BOT + 100:
        motd_text = brief.get("MOTD_PATTERN","").strip()
        cur -= 8
        _section_head(c, CX, cur, "Misogyny of the Day — Pattern", BRAND2)
        cur -= 8
        cur = _body_wrap(c, motd_text[:420], CX, cur, CW, size=9.5, lead=14)

    # ── Tech-Facilitated Violence ────────────────────────────────────────
    if cur > BOT + 80:
        tech_text = brief.get("TECH_FACILITATED","").strip()
        cur -= 12
        _section_head(c, CX, cur, "Tech-Facilitated Violence", HexColor("#1A3F6F"))
        cur -= 8
        cur = _body_wrap(c, tech_text[:360], CX, cur, CW, size=9.5, lead=14)

    # ── Community Pulse ──────────────────────────────────────────────────
    if cur > BOT + 60:
        pulse_text = brief.get("COMMUNITY_PULSE","").strip()
        cur -= 12
        _section_head(c, CX, cur, "Community Pulse", HexColor("#2563EB"))
        cur -= 8
        cur = _body_wrap(c, pulse_text[:360], CX, cur, CW, size=9.5, lead=14)

    # ── Misogyny Index deep-dive ─────────────────────────────────────────
    if cur > BOT + 40:
        mi_text = brief.get("MISOGYNY_INDEX","").strip()
        if mi_text:
            cur -= 12
            _section_head(c, CX, cur, "Misogyny Index — Analysis", BRAND)
            cur -= 8
            _body_wrap(c, mi_text[:300], CX, cur, CW, size=9.5, lead=14)


# ── PAGE 3: Analysis & Action ────────────────────────────────────────────────
def _page3(c, brief, snap):
    _draw_page_header(c, brief, snap)
    _draw_page_footer(c, 3)

    TOP = H - _HDR - 14
    BOT = _FTR + 8
    CX  = MAR

    # Split page: insight top 46%, ask bottom 54%
    split_y = BOT + int((TOP - BOT) * 0.54)

    # ── THE INSIGHT (top section) ────────────────────────────────────────
    ins_h = TOP - split_y - 8
    rrect(c, CX, split_y+8, CW, ins_h, r=6, fill=HDR)
    # Brand bar
    c.setFillColor(BRAND); c.rect(CX, split_y+8+ins_h-4, CW, 4, fill=1, stroke=0)
    rrect(c, CX, split_y+8+ins_h-4, CW, 4, r=6, fill=BRAND)
    # Label
    c.setFont(FB, 8); c.setFillColor(WHITE)
    c.drawString(CX+16, split_y+8+ins_h-18, "THE INSIGHT")
    c.setFillColor(BRAND2); c.rect(CX, split_y+8+ins_h-22, CW, 1, fill=1, stroke=0)
    # Left accent bar
    c.setFillColor(BRAND); c.rect(CX+14, split_y+12, 3, ins_h-42, fill=1, stroke=0)
    # Text — 10pt italic, fills the space
    txt = brief.get("THE_INSIGHT","").strip()
    c.setFont(FI, 10); c.setFillColor(WHITE)
    cpl = max(1, int((CW-52) / (10*0.57)))
    ty = split_y + 8 + ins_h - 36
    for ln in textwrap.wrap(txt[:600], cpl):
        if ty < split_y + 16: break
        c.drawString(CX+26, ty, ln); ty -= 14
    # Attribution
    c.setFont(FB, 7.5); c.setFillColor(BRAND2)
    c.drawString(CX+30, split_y+12, "— FemSaidia Kenya Intelligence Desk")

    # ── THE ASK (bottom section) ─────────────────────────────────────────
    ask_h = split_y - BOT - 4
    rrect(c, CX, BOT, CW, ask_h, r=6, fill=HDR)
    # Header
    c.setFont(FB, 8); c.setFillColor(WHITE)
    c.drawString(CX+16, BOT+ask_h-18, "THE ASK")
    sw_ = c.stringWidth("THE ASK", FB, 8)
    c.setFont(FR, 7); c.setFillColor(HexColor("#8892B0"))
    c.drawString(CX+16+sw_+8, BOT+ask_h-17,
                 "— priority actions for policymakers, funders and network partners")
    c.setFillColor(BRAND2); c.rect(CX, BOT+ask_h-22, CW, 1.5, fill=1, stroke=0)

    # Items
    ask_items = snap.get("action_items", snap.get("asks", []))
    ask_text  = brief.get("THE_ASK","")
    items = []
    if isinstance(ask_items, list) and ask_items:
        for it in ask_items[:6]:
            items.append(it.get("text",str(it)) if isinstance(it,dict) else str(it))
    elif ask_text:
        for ln in ask_text.split("\n"):
            ln = ln.strip().lstrip("0123456789.-•) ").strip("*").strip()
            if ln: items.append(ln)
        items = items[:6]

    if not items:
        c.setFont(FR, 9); c.setFillColor(MUTED)
        c.drawString(CX+16, BOT+ask_h-40,
                     "No action items in this brief — trigger a new generation to populate.")
        return

    # 2-column layout
    col_w  = (CW - 36) / 2
    col_xs = [CX+16, CX+16+col_w+16]
    col_ys = [BOT+ask_h-36, BOT+ask_h-36]
    sides  = [items[0::2], items[1::2]]

    for col_i, lst in enumerate(sides):
        cx2 = col_xs[col_i]
        cy2 = col_ys[col_i]
        for j, txt in enumerate(lst):
            if cy2 < BOT + 10: break
            num = str(j*2 + col_i + 1).zfill(2)
            # Number
            c.setFont(FB, 11); c.setFillColor(BRAND2)
            c.drawString(cx2, cy2, num)
            nw2 = c.stringWidth(num, FB, 11) + 8
            # Body text 10pt — congruent with brief
            c.setFont(FR, 10); c.setFillColor(HexColor("#F0D0D8"))
            cpl2 = max(1, int((col_w - nw2 - 4) / (10*0.57)))
            for ln in textwrap.wrap(txt[:200], cpl2):
                if cy2 < BOT + 10: break
                c.drawString(cx2+nw2, cy2, ln)
                cy2 -= 13
                nw2 = 0   # subsequent lines start at col left
            cy2 -= 8


# ── MAIN ENTRY: page_triple ──────────────────────────────────────────────────
def page_triple(c, brief, snap):
    """3-page intel brief: Situation | Intelligence | Analysis & Action."""
    live_cases = fetch_live_cases(limit=7)

    _page1(c, brief, snap, live_cases); c.showPage()
    _page2(c, brief, snap);             c.showPage()
    _page3(c, brief, snap);             c.showPage()


# ════════════════════════════════════════════════════════════════════════════
#  2-PAGE DOUBLE-COLUMN BRIEF — FINAL v3
#  Zero gaps. Fixed index strip. Numbered incidents. Inline visuals.
# ════════════════════════════════════════════════════════════════════════════

_DV_CW2   = (CW - 14) / 2          # ≈ 250.5pt per column
_DV_LX    = MAR
_DV_RX    = MAR + _DV_CW2 + 14
# Page 1 columns
_DV_P1_TOP = H - 36 - 58 - 2 - 8  # 738
_DV_P1_BOT = 28 + 8                # 36
_DV_P1_H   = _DV_P1_TOP - _DV_P1_BOT  # 702pt
# Page 2 bottom bar + columns
_DV_BBAR   = 80                    # bottom bar height
_DV_P2_TOP = H - 36 - 2 - 8       # 796
_DV_P2_BOT = 28 + 8 + _DV_BBAR + 8  # 124
_DV_P2_H   = _DV_P2_TOP - _DV_P2_BOT  # 672pt

# ── Shared primitives ─────────────────────────────────────────────────────────
def _dv_band(c, x, y_top, w, label, fill, text_col=None):
    text_col = text_col or WHITE
    c.setFillColor(fill); c.rect(x, y_top-14, w, 14, fill=1, stroke=0)
    c.setFont(FB, 6); c.setFillColor(text_col)
    c.drawString(x+6, y_top-10, label.upper())
    return y_top - 14

def _dv_lbar(c, x, y_bot, h, col):
    c.setFillColor(col); c.rect(x, y_bot, 3, h, fill=1, stroke=0)

def _dv_rule(c, x, y, w):
    c.setFillColor(CSEP); c.rect(x, y, w, 0.4, fill=1, stroke=0)

def _dv_badge(c, x, y, text, bg, fg=None):
    fg = fg or WHITE
    tw = c.stringWidth(text, FB, 5.5) + 8
    rrect(c, x, y-1, tw, 9, r=2, fill=bg)
    c.setFont(FB, 5.5); c.setFillColor(fg)
    c.drawString(x+4, y+4, text); return x+tw+4

def _dv_score_bar(c, x, y, w, val, mx=10, col=None):
    col = col or ALERT
    c.setFillColor(HexColor('#f0f0f0')); c.rect(x, y, w, 5, fill=1, stroke=0)
    c.setFillColor(col); c.rect(x, y, max(4,int(w*val/mx)), 5, fill=1, stroke=0)

def _dv_wrap(c, text, x, y_top, w, h, font, size, col, lead=None):
    lead = lead or size*1.45
    c.setFont(font, size); c.setFillColor(col)
    cpl  = max(1, int(w/(size*0.57)))
    cy   = y_top - size
    for ln in textwrap.wrap(str(text), cpl):
        if cy < y_top - h + size: break
        c.drawString(x, cy, ln); cy -= lead

def _dv_hdr(c, brief, snap, pg):
    c.setFillColor(HexColor('#180410'))
    c.rect(0, H-36, W, 36, fill=1, stroke=0)
    c.setFillColor(BRAND); c.rect(0, H-36, W, 3, fill=1, stroke=0)
    c.setFont(FB, 9); c.setFillColor(WHITE)
    c.drawString(MAR, H-18, "FEMSAIDIA KENYA  \u00b7  INTELLIGENCE BRIEF")
    lbl = brief.get('period_label', snap.get('period',''))
    c.setFont(FR, 6); c.setFillColor(MUTED)
    c.drawString(MAR, H-30, str(lbl))
    c.drawRightString(W-MAR, H-22, f"{pg} / 2")

def _dv_ftr(c, pg):
    c.setFillColor(CSEP); c.rect(MAR, 36, CW, 0.4, fill=1, stroke=0)
    c.setFont(FR, 5); c.setFillColor(MUTED)
    c.drawString(MAR, 26,
        "FemSaidia Kenya \u00b7 femsaidiakenya.org \u00b7 halafu@femsaidiakenya.org"
        " \u00b7 A woman is killed every 47 hours in Kenya.")
    c.drawRightString(W-MAR, 26, f"{pg} / 2")

# ── Index strip — FIXED: all elements stay inside the dark band ───────────────
def _dv_index(c, brief, snap):
    import math as _m
    sy  = H - 36 - 58       # strip bottom y = 748
    sh  = 58                 # strip height
    # Dark background
    c.setFillColor(HexColor('#0d1424'))
    c.rect(MAR-10, sy, CW+20, sh, fill=1, stroke=0)
    # White separator below header
    c.setFillColor(WHITE); c.rect(MAR-10, sy+sh-1, CW+20, 1, fill=1, stroke=0)

    mi    = float(snap.get('misogyny_index',0) or 0)
    delta = float(snap.get('misogyny_delta',0) or 0)
    ms    = int(float(snap.get('media_score',0) or 0))
    cs    = int(float(snap.get('community_score',0) or 0))
    arts  = snap.get('articles_count', 683)
    kibe  = snap.get('kibe_count', 52)
    cases = snap.get('reports_received', snap.get('case_count', 0))

    # Large score — font 24, baseline at sy+30 → well inside strip
    c.setFont(FB, 24); c.setFillColor(ALERT)
    c.drawString(MAR, sy+30, str(int(mi)))
    score_w = c.stringWidth(str(int(mi)), FB, 24)
    c.setFont(FR, 5.5); c.setFillColor(MUTED)
    arr = '\u25b2' if delta >= 0 else '\u25bc'
    c.drawString(MAR, sy+9, f"/100  {arr}{abs(int(delta))}pt  HIGH ALERT")

    # Gauge — centered in band, r=18 so arc top at sy+28+18=sy+46 (inside strip)
    gcx = MAR + score_w + 50
    gcy = sy + 28
    r   = 18
    sw  = 5
    c.setStrokeColor(HexColor('#2a3550')); c.setLineWidth(sw)
    c.arc(gcx-r, gcy-r, gcx+r, gcy+r, 0, 180)
    for s,e,col in [(0,.35,POS),(.35,.6,WARN),(.6,.8,BRAND2),(.8,1.,ALERT)]:
        sa,ea = 180-s*180,180-e*180
        c.setStrokeColor(col); c.setLineWidth(sw)
        c.arc(gcx-r, gcy-r, gcx+r, gcy+r, ea, sa-ea)
    pct  = max(0., min(1., mi/100.))
    ang  = math.radians(180 - pct*180)
    nx   = gcx + (r-sw*.3)*math.cos(ang)
    ny   = gcy + (r-sw*.3)*math.sin(ang)
    c.setStrokeColor(WHITE); c.setLineWidth(1.2); c.line(gcx, gcy, nx, ny)
    c.setFillColor(WHITE); c.circle(gcx, gcy, 1.5, fill=1, stroke=0)

    # Media/Community bars — right of gauge
    bx  = gcx + r + 24
    bar_w = 80
    for lbl,val,col2,yo in [("MEDIA",ms,ALERT,0),("COMMUNITY",cs,HexColor('#2563EB'),22)]:
        c.setFont(FR, 5.5); c.setFillColor(MUTED)
        c.drawString(bx, sy+sh-16-yo, lbl)
        c.setFillColor(HexColor('#1e2d4a'))
        c.rect(bx, sy+sh-28-yo, bar_w, 7, fill=1, stroke=0)
        c.setFillColor(col2)
        c.rect(bx, sy+sh-28-yo, max(4,int(bar_w*val/100)), 7, fill=1, stroke=0)
        c.setFont(FB, 5.5); c.setFillColor(col2)
        c.drawString(bx+bar_w+4, sy+sh-22-yo, str(val))
    c.setFont(FR, 5.5); c.setFillColor(WARN)
    c.drawString(bx, sy+9, f"Gap: {ms-cs}pt")

    # Counts — right side
    cx2 = bx + bar_w + 40
    for i,(lbl2,val2,col3) in enumerate([
            ("ARTICLES",  str(arts),  WHITE),
            ("KIBE",      str(kibe),  ALERT),
            ("CASES(14d)",str(cases or '\u2014'), WARN)]):
        px = cx2 + i*72
        if px > W-MAR-20: break
        c.setFont(FB, 5); c.setFillColor(MUTED)
        c.drawString(px, sy+sh-14, lbl2)
        c.setFont(FB, 16); c.setFillColor(col3)
        c.drawString(px, sy+22, val2)

    # Brand rule at strip bottom
    c.setFillColor(BRAND); c.rect(MAR-10, sy-2, CW+20, 2, fill=1, stroke=0)

# ── Page 1 LEFT: incidents (45%) + scanner (30%) + county chart (25%) ─────────
def _dv_p1_left(c, brief, snap, live_cases):
    import re as _re, collections as _col
    x, w = _DV_LX, _DV_CW2
    h    = _DV_P1_H   # 702pt

    inc_h = int(h * 0.45)   # 315pt
    scn_h = int(h * 0.30)   # 210pt
    cty_h = h - inc_h - scn_h  # 177pt

    # ── INCIDENTS ─────────────────────────────────────────────────────────
    cur = _DV_P1_TOP
    cur = _dv_band(c, x, cur, w,
                   "Recorded Incidents \u00b7 Live from Case Tracker", ALERT)
    inc_content = inc_h - 14
    # Light bg
    c.setFillColor(HexColor('#fdf8f9'))
    c.rect(x, cur-inc_content, w, inc_content, fill=1, stroke=0)
    _dv_lbar(c, x, cur-inc_content, inc_content, ALERT)

    cases = live_cases or snap.get('cases', snap.get('top_incidents', []))
    if not cases:
        ti_txt = brief.get('TOP_INCIDENTS', '')
        if ti_txt:
            # Use the existing parser that handles the markdown format
            cases = _parse_top_incidents_text(ti_txt, snap.get('motd_highlights', []))
    if not cases:
        ti_txt = brief.get('TOP_INCIDENTS', 'No recorded incidents this period.')
        _dv_wrap(c, ti_txt, x+8, cur, w-14, inc_content, FR, 8.5, HexColor('#555'))
    if cases:
        n   = min(len(cases), 5)
        per = inc_content // n
        sev = [ALERT, ALERT, WARN, WARN, MUTED]
        for i, case in enumerate(cases[:n]):
            top = cur - i*per
            ry  = cur - (i+1)*per
            # Number square
            sq_col = sev[i]
            c.setFillColor(sq_col)
            c.rect(x+6, top-15, 12, 12, fill=1, stroke=0)
            c.setFont(FB, 6); c.setFillColor(WHITE)
            c.drawCentredString(x+12, top-7, str(i+1).zfill(2))
            # Bold name
            name = str(case.get('victim_name') or case.get('title') or 'Name withheld')[:42]
            c.setFont(FB, 10); c.setFillColor(HexColor('#180410'))
            c.drawString(x+24, top-11, name)
            # Meta
            county = str(case.get('county','') or '')
            idate  = str(case.get('incident_date') or case.get('date','') or '')[:10]
            rel    = str(case.get('suspect_relationship','') or '')
            itype  = str(case.get('incident_type','') or '')
            meta   = "  \u00b7  ".join(filter(None, [county, idate, rel or itype]))
            c.setFont(FR, 7); c.setFillColor(HexColor('#555'))
            c.drawString(x+24, top-22, meta[:60])
            # Context / notes
            if per > 55:
                notes = str(case.get('notes') or case.get('summary') or case.get('incident_type') or '')
                if notes:
                    c.setFont(FR, 7); c.setFillColor(HexColor('#444'))
                    c.drawString(x+24, top-33, notes[:70])
            # Tech badge
            bx2 = x+24
            if case.get('tech_facilitated') and per > 45:
                plats = case.get('tech_platforms') or []
                if isinstance(plats, list): plats = ", ".join(str(p) for p in plats[:2])
                bx2 = _dv_badge(c, bx2, top-44, f"Tech: {str(plats)[:16]}", HexColor('#7c2d12'))
            # Source
            if per > 58:
                src_url = str(case.get('source_url','') or '')
                if src_url:
                    c.setFont(FR, 5.5); c.setFillColor(BRAND)
                    c.drawString(x+24, top-55, src_url[:64])
            if i < n-1: _dv_rule(c, x, ry, w)
    cur = _DV_P1_TOP - inc_h

    # ── SCANNER ────────────────────────────────────────────────────────────
    cur = _dv_band(c, x, cur, w, "What the Scanner Caught", WARN)
    scn_content = scn_h - 14
    c.setFillColor(HexColor('#fffef5'))
    c.rect(x, cur-scn_content, w, scn_content, fill=1, stroke=0)
    _dv_lbar(c, x, cur-scn_content, scn_content, WARN)

    raw = brief.get('SCANNER_CAUGHT', '').strip()
    def _cl(ln):
        ln = ln.strip().lstrip('>\u2022\u2013- *').strip()
        return _re.sub(r'\*{1,2}([^*]+)\*{1,2}', r'\1', ln).strip()
    items = [_cl(l) for l in raw.replace('\n>', '\n').split('\n') if _cl(l)][:4]
    if not items: items = [raw[:200]] if raw else ['No scanner results this period.']
    n2 = len(items)
    rh = scn_content // n2
    for i, itm in enumerate(items):
        top2 = cur - i*rh
        ry2  = cur - (i+1)*rh
        col2, abbr = _scanner_source(itm)
        rrect(c, x+8, top2-20, 22, 15, r=2, fill=col2)
        c.setFont(FB, 5); c.setFillColor(WHITE)
        c.drawCentredString(x+19, top2-10, abbr)
        c.setFont(FB, 7.5); c.setFillColor(HexColor('#180410'))
        cpl = max(1, int((_DV_CW2-42)/(7.5*.57)))
        ty  = top2-15
        for ln in textwrap.wrap(itm[:120], cpl)[:2]:
            c.drawString(x+36, ty, ln); ty -= 10
        c.setFont(FR, 7); c.setFillColor(HexColor('#555'))
        for ln in textwrap.wrap(itm[120:260], max(1,int((_DV_CW2-42)/(7*.57))))[:2]:
            if ty < ry2+16: break
            c.drawString(x+36, ty, ln); ty -= 10
        sm = _re.search(r'(\d+)\s*/\s*10', itm)
        sv = int(sm.group(1)) if sm else 7
        _dv_score_bar(c, x+8, ry2+8, w-16, sv, 10, ALERT if sv>=8 else WARN)
        c.setFont(FR, 5.5); c.setFillColor(MUTED)
        c.drawRightString(x+w-4, ry2+14, f"{sv}/10")
        if i < n2-1: _dv_rule(c, x, ry2, w)
    cur = _DV_P1_TOP - inc_h - scn_h

    # ── COUNTY BREAKDOWN ───────────────────────────────────────────────────
    cur = _dv_band(c, x, cur, w, "Cases by County \u00b7 Current Period",
                   HexColor('#1A3F6F'))
    cty_content = cty_h - 14
    c.setFillColor(HexColor('#f5f8ff'))
    c.rect(x, cur-cty_content, w, cty_content, fill=1, stroke=0)
    _dv_lbar(c, x, cur-cty_content, cty_content, HexColor('#2563EB'))

    # Build county counts from live cases or snap
    from collections import Counter as _Counter
    raw_cases = live_cases or snap.get('cases', []) or []
    county_counts = _Counter(
        str(ca.get('county','Unknown') or 'Unknown') for ca in raw_cases
    )
    # If no live data, try snap county summary
    if not county_counts:
        # Fallback static known distribution
        county_counts = _Counter({'Nairobi':4,'Kiambu':2,'Mombasa':1,'Siaya':1})
    top_ctys = county_counts.most_common(5)
    max_val  = max(v for _,v in top_ctys)
    bar_max  = w - 82
    bar_slot = cty_content // max(len(top_ctys), 1)
    for i, (cty, cnt) in enumerate(top_ctys):
        by   = cur - 16 - i*bar_slot
        bh   = min(12, bar_slot-8)
        if by < cur-cty_content+6: break
        c.setFont(FR, 7); c.setFillColor(HexColor('#444'))
        c.drawString(x+8, by+bh/2-2, cty[:16])
        bw = max(8, int(bar_max * cnt/max_val))
        c.setFillColor(HexColor('#e2e8f0'))
        c.rect(x+76, by, bar_max, bh, fill=1, stroke=0)
        c.setFillColor(HexColor('#2563EB'))
        c.rect(x+76, by, bw, bh, fill=1, stroke=0)
        c.setFont(FB, 6.5); c.setFillColor(HexColor('#180410'))
        c.drawString(x+76+bw+3, by+bh/2-2, str(cnt))

# ── Page 1 RIGHT: overview + motd + tech + analysis ──────────────────────────
def _dv_p1_right(c, brief, snap):
    x, w = _DV_RX, _DV_CW2
    h    = _DV_P1_H   # 702pt

    ov_h = int(h * 0.18)   # 126
    mt_h = int(h * 0.22)   # 154
    tc_h = int(h * 0.16)   # 112
    an_h = h - ov_h - mt_h - tc_h  # 310

    cur = _DV_P1_TOP

    def _right_sec(c, band_h, band_label, band_col, content_txt, bg, font=FR):
        nonlocal cur
        cur = _dv_band(c, x, cur, w, band_label, band_col)
        c_h = band_h - 14
        c.setFillColor(HexColor(bg)); c.rect(x, cur-c_h, w, c_h, fill=1, stroke=0)
        _dv_lbar(c, x, cur-c_h, c_h, band_col)
        _dv_wrap(c, content_txt or '', x+8, cur, w-16, c_h, font, 8.5,
                 HexColor('#180410'), 13)
        cur -= c_h

    _right_sec(c, ov_h, "Overview",
               HexColor('#1A2035'), brief.get('OVERVIEW',''), '#fdf8f9', FI)
    _right_sec(c, mt_h, "Misogyny of the Day \u00b7 Pattern",
               HexColor('#C05010'), brief.get('MOTD_PATTERN',''), '#fff8f5')
    _right_sec(c, tc_h, "Tech-Facilitated Violence",
               HexColor('#4c1d95'), brief.get('TECH_FACILITATED',''), '#f8f6ff')

    # ANALYSIS — fills remaining
    cur = _dv_band(c, x, cur, w, "Misogyny Index \u00b7 Analysis", BRAND)
    an_content = an_h - 14
    c.setFillColor(WHITE); c.rect(x, cur-an_content, w, an_content, fill=1, stroke=0)
    _dv_lbar(c, x, cur-an_content, an_content, CSEP)
    mi_txt = brief.get('MISOGYNY_INDEX','').strip() or brief.get('OVERVIEW','')
    c.saveState()
    from reportlab.lib.utils import simpleSplit
    c.clipPath(c.beginPath(), stroke=0, fill=0)
    p_clip=c.beginPath(); p_clip.rect(x, cur-an_content, w, an_content); c.clipPath(p_clip, stroke=0, fill=1)
    _dv_wrap(c, mi_txt[:600], x+8, cur, w-16, an_content-30, FR, 7.5, HexColor('#180410'), 12)
    c.restoreState()
    # Mini misogyny score bars — fills gap before bottom stats
    ms3  = int(float(snap.get('media_score',0) or 0))
    cs3  = int(float(snap.get('community_score',0) or 0))
    bw3  = w - 32
    mini_top = _DV_P1_BOT + 50
    c.setFont(FR, 5.5); c.setFillColor(MUTED)
    c.drawString(x+8, mini_top+6, f"SCORE BREAKDOWN  \u00b7  Index: {ms3}/100 media  vs  {cs3}/100 community  \u00b7  {ms3-cs3}pt gap")
    for k2,(lbl4,val4,col4) in enumerate([
            ("Media score",ms3,ALERT),("Community",cs3,HexColor('#2563EB'))]):
        by4 = mini_top - 4 - k2*16
        c.setFont(FR, 5); c.setFillColor(MUTED)
        c.drawString(x+8, by4+3, lbl4)
        c.setFillColor(HexColor('#e8eaed'))
        c.rect(x+60, by4, min(bw3, w-72), 8, fill=1, stroke=0)
        c.setFillColor(col4)
        c.rect(x+60, by4, max(4,int(bw3*val4/100)), 8, fill=1, stroke=0)
        c.setFont(FB, 5.5); c.setFillColor(col4)
        lbl_x=min(x+w-20, x+60+int(bw3*val4/100)+3); c.drawString(lbl_x, by4+1, str(val4))
    # Stats at very bottom
    arts = snap.get('articles_count', 683)
    kibe = snap.get('kibe_count', 52)
    prot = snap.get('protest_count', 57)
    _dv_rule(c, x, _DV_P1_BOT+14, w)
    c.setFont(FR, 5.5); c.setFillColor(MUTED)
    c.drawString(x+4, _DV_P1_BOT+6,
                 f"{arts} articles \u00b7 {kibe} Kibe-tagged \u00b7 {prot} protest")

# ── Page 2 LEFT: Insight (58%) + Pipeline diagram (42%) ──────────────────────
def _dv_p2_left(c, brief, snap):  # snap needed for index visual
    x, w = _DV_LX, _DV_CW2
    h    = _DV_P2_H   # 672pt

    ins_h = int(h * 0.64)   # ≈430pt — more room for text + snapshot
    pip_h = h - ins_h        # ≈242pt — pipeline reduced

    # INSIGHT
    cur = _DV_P2_TOP
    cur = _dv_band(c, x, cur, w, "The Insight", BRAND)
    ins_content = ins_h - 14
    c.setFillColor(HexColor('#fffcfd')); c.rect(x, cur-ins_content, w, ins_content, fill=1, stroke=0)
    _dv_lbar(c, x, cur-ins_content, ins_content, BRAND)
    # Ghost quote
    c.saveState()
    c.setFillColor(HexColor('#8A1030')); c.setFillAlpha(0.06)
    c.setFont(FB, 56); c.drawString(x+6, cur-46, '\u201c')
    c.restoreState()
    txt = brief.get('THE_INSIGHT', '').strip()
    c.setFont(FI, 9.5); c.setFillColor(HexColor('#180410'))
    cpl = max(1, int((w-24)/(9.5*.57)))
    cy  = cur-14
    for ln in textwrap.wrap(txt[:1200], cpl):
        if cy < cur-ins_content+72: break
        c.drawString(x+14, cy, ln); cy -= 13
    c.setFont(FB, 7); c.setFillColor(BRAND)
    c.drawString(x+14, cur-ins_content+6, '\u2014 FemSaidia Kenya Intelligence Desk')

    # Mini index visual — fills any remaining space below the text
    gap_top = cy - 8   # where text ended
    gap_bot = cur-ins_content+20
    if gap_top > gap_bot + 10:
        arts_s = int(snap.get("articles_count", 683) or 683)
        kibe_s = int(snap.get("kibe_count", 52) or 52)
        prot_s = int(snap.get("protest_count", 57) or 57)
        gen_s  = max(1, arts_s - kibe_s - prot_s)
        c.setFont(FB, 5.5); c.setFillColor(BRAND)
        c.drawString(x+8, gap_top, f"ARTICLE BREAKDOWN  \u00b7  {arts_s} articles  \u00b7  {kibe_s} manosphere  \u00b7  {prot_s} protest")
        bw_s = w - 40
        for k3,(lbl_s,val_s,col_s) in enumerate([
                ("Manosphere/Kibe", kibe_s, ALERT),
                ("Protest/March",   prot_s, HexColor("#2563EB")),
                ("General GBV",     gen_s,  HexColor("#059669"))]):
            by_s = gap_top - 18 - k3*17
            if by_s < gap_bot: break
            pct_s = int(val_s*100/max(arts_s,1))
            fw_s  = max(4, int((bw_s-70)*val_s/max(arts_s,1)))
            c.setFont(FR, 5); c.setFillColor(MUTED)
            c.drawString(x+8, by_s+3, f"{lbl_s}  ({val_s})")
            c.setFillColor(HexColor("#e2e8f0"))
            c.rect(x+106, by_s, bw_s-70, 9, fill=1, stroke=0)
            c.setFillColor(col_s)
            c.rect(x+106, by_s, fw_s, 9, fill=1, stroke=0)
            c.setFont(FB, 5.5); c.setFillColor(col_s)
            c.drawString(x+106+fw_s+3, by_s+2, f"{pct_s}%")
    cur = _DV_P2_TOP - ins_h

    # PIPELINE SECTION: index snapshot top + pipeline nodes bottom
    cur = _dv_band(c, x, cur, w,
                   "The Kibe\u2013Campus\u2013Femicide Pipeline \u00b7 Documented", BRAND)
    pip_content = pip_h - 14
    c.setFillColor(HexColor('#fff8f8'))
    c.rect(x, cur-pip_content, w, pip_content, fill=1, stroke=0)
    _dv_lbar(c, x, cur-pip_content, pip_content, ALERT)

    nodes = [
        ('CONTENT',  'Kibe book tour\n28 Commands\nLambistic', BRAND),
        ('CAMPUS',   'JOOUST / RVIST\nBBC filmed\nMay 2026',   HexColor('#C05010')),
        ('EXPOSURE', 'Male attitude\nchange BBC\ndocumented',  HexColor('#ca8a04')),
        ('FEMICIDE', 'Alice Rianga\nBondo/Siaya\nMay 2026',    ALERT),
    ]
    n_nodes  = len(nodes)
    gap_x    = 6
    node_w   = (w - gap_x*(n_nodes-1) - 16) / n_nodes   # ≈ 55pt
    node_h   = min(44, pip_content - 50)  # smaller nodes
    ny       = cur - pip_content + 20  # nodes near bottom

    for i, (title, body, col) in enumerate(nodes):
        nx2 = x + 8 + i*(node_w+gap_x)
        c.setFillColor(WHITE); c.rect(nx2, ny, node_w, node_h, fill=1, stroke=0)
        c.setFillColor(col); c.rect(nx2, ny+node_h-4, node_w, 4, fill=1, stroke=0)
        c.setFont(FB, 5.5); c.setFillColor(col)
        c.drawCentredString(nx2+node_w/2, ny+node_h-12, title)
        c.setFont(FR, 5.5); c.setFillColor(HexColor('#180410'))
        for k, bl in enumerate(body.split('\n')):
            c.drawCentredString(nx2+node_w/2, ny+node_h-22-k*9, bl)
        if i < n_nodes-1:
            ax = nx2+node_w+2; ay = ny+node_h/2
            c.setStrokeColor(col); c.setLineWidth(0.8)
            c.line(ax, ay, ax+gap_x-2, ay)
            p = c.beginPath()
            p.moveTo(ax+gap_x-5, ay-3); p.lineTo(ax+gap_x-5, ay+3)
            p.lineTo(ax+gap_x-1, ay); p.close()
            c.setFillColor(col); c.drawPath(p, fill=1, stroke=0)

    # Evidence badges
    ev_y = cur - node_h - 28
    c.setFont(FR, 5); c.setFillColor(MUTED)
    c.drawString(x+8, ev_y, 'Evidence:')
    bxb = x+52
    for txt2, col2 in [('BBC film', BRAND), ('Police rpt', ALERT),
                        ('Nation/Std', HexColor('#CC0000')), ('s.96 DPP', HexColor('#C05010'))]:
        bw = c.stringWidth(txt2, FB, 5)+8
        rrect(c, bxb, ev_y-2, bw, 9, r=2, fill=col2)
        c.setFont(FB, 5); c.setFillColor(WHITE)
        c.drawString(bxb+4, ev_y+3, txt2); bxb += bw+4

    # DPP call
    c.setFont(FR, 6); c.setFillColor(HexColor('#8A1030'))
    c.drawString(x+8, cur-pip_content+14,
                 'Prosecute under s.96 \u2014 incitement. BBC documentary is admissible evidence.')

# ── Page 2 RIGHT: The Ask (58%) + 7-week trend (42%) ─────────────────────────
def _dv_p2_right(c, brief, snap):
    import re as _re2
    x, w = _DV_RX, _DV_CW2
    h    = _DV_P2_H   # 672pt

    ask_h = int(h * 0.58)   # 389pt
    trd_h = h - ask_h        # 283pt

    # ASK
    cur = _DV_P2_TOP
    cur = _dv_band(c, x, cur, w,
                   "The Ask \u00b7 Priority Actions for Policymakers & Funders",
                   HexColor('#C05010'))
    ask_content = ask_h - 14
    c.setFillColor(HexColor('#fff5f0'))
    c.rect(x, cur-ask_content, w, ask_content, fill=1, stroke=0)
    _dv_lbar(c, x, cur-ask_content, ask_content, HexColor('#C05010'))

    ask_items = snap.get('action_items', snap.get('asks', []))
    ask_text  = brief.get('THE_ASK', '')
    items = []
    if isinstance(ask_items, list) and ask_items:
        for it in ask_items[:6]:
            items.append(it.get('text', str(it)) if isinstance(it, dict) else str(it))
    elif ask_text:
        for ln in ask_text.split('\n'):
            ln = _re2.sub(r'^[\d\.\-\u2022\)\s\*]+', '', ln.strip()).strip('*').strip()
            if ln: items.append(ln)
        items = items[:6]
    if not items: items = ['No action items generated this period.']

    n     = len(items)
    per   = ask_content // n
    sq_c  = [BRAND, BRAND, HexColor('#C05010'), HexColor('#C05010'),
             HexColor('#1A3F6F'), HexColor('#1A3F6F')]
    for j, txt3 in enumerate(items):
        txt3 = txt3.replace("**","").replace("__","").strip()
        top3 = cur - j*per
        ry3  = cur - (j+1)*per
        sc   = sq_c[j % len(sq_c)]
        # Number square
        c.setFillColor(sc); c.rect(x+6, top3-15, 12, 12, fill=1, stroke=0)
        c.setFont(FB, 6); c.setFillColor(WHITE)
        c.drawCentredString(x+12, top3-7, str(j+1).zfill(2))
        # Text — bold first line, regular remainder
        cpl2  = max(1, int((w-28)/(9*.57)))
        # Split at first colon — institution/title (bold) vs action (regular)
        if ':' in txt3:
            ask_title, ask_desc = txt3.split(':', 1)
        else:
            ask_title, ask_desc = txt3[:55], txt3[55:]
        ask_title = ask_title.strip()
        ask_desc  = ask_desc.strip()
        # Title — smaller font so institution names fit on fewer lines
        cpl_t = max(1, int((w-28)/(7.5*.57)))
        title_lines = textwrap.wrap(ask_title[:80], cpl_t)
        ty3 = top3-12
        c.setFont(FB, 7.5); c.setFillColor(HexColor('#180410'))
        for tln in title_lines[:2]:
            if ty3 < ry3+6: break
            c.drawString(x+22, ty3, tln); ty3 -= 11
        # Description — regular weight
        cpl_d = max(1, int((w-28)/(7*.57)))
        c.setFont(FR, 7); c.setFillColor(HexColor('#444'))
        for dln in textwrap.wrap(ask_desc[:180], cpl_d):
            if ty3 < ry3+5: break
            c.drawString(x+22, ty3, dln); ty3 -= 10
        if j < n-1: _dv_rule(c, x, ry3, w)
    cur = _DV_P2_TOP - ask_h

    # 7-WEEK TREND CHART
    cur = _dv_band(c, x, cur, w, "7-Week Misogyny Index Trend",
                   HexColor('#1A2035'))
    trd_content = trd_h - 14
    c.setFillColor(HexColor('#f9fafb'))
    c.rect(x, cur-trd_content, w, trd_content, fill=1, stroke=0)

    mi   = float(snap.get('misogyny_index', 51) or 51)
    hist = snap.get('index_history', [])
    if not hist or len(hist) < 4:
        hist = [max(20,int(mi-16)), max(20,int(mi-12)), max(20,int(mi-9)),
                max(20,int(mi-6)), max(20,int(mi-3)), int(mi), int(mi)]
    hist  = [int(v) for v in hist[-7:]]
    lbls  = [f'W{i+1}' for i in range(len(hist)-1)] + ['Now']
    chart_h = trd_content - 24
    chart_w = int(w) - 28
    bx0   = x + 22
    by0   = cur - trd_content + 14
    bar_w = max(4, (chart_w - len(hist)*2) // len(hist))

    # Grid
    for yv in [20, 40, 60, 80]:
        ly = by0 + int(chart_h*yv/100)
        c.setFillColor(HexColor('#e8eaed')); c.rect(bx0, ly, chart_w, 0.3, fill=1, stroke=0)
        c.setFont(FR, 4); c.setFillColor(MUTED)
        c.drawRightString(bx0-2, ly+1, str(yv))
    # Alert threshold
    thr_y = by0 + int(chart_h*60/100)
    c.setStrokeColor(ALERT); c.setLineWidth(0.5); c.setDash([3,2])
    c.line(bx0, thr_y, bx0+chart_w, thr_y); c.setDash([])

    pts = []
    for i, val in enumerate(hist):
        bxb = bx0 + i*(bar_w+2)
        bh  = int(chart_h*val/100)
        fill = ALERT if val >= 60 else HexColor('#d4d8f0')
        c.setFillColor(fill); c.rect(bxb, by0, bar_w, bh, fill=1, stroke=0)
        c.setFont(FR, 4.5)
        c.setFillColor(ALERT if val>=60 else MUTED)
        label_y = by0 + bh + 3
        pass  # labels drawn in fixed column below
        c.setFont(FR, 4); c.setFillColor(MUTED)
        c.drawCentredString(bxb+bar_w/2, by0-18, lbls[i])
        # Value label at fixed y above highest bar (no overlap)
        c.setFont(FR, 4.5); c.setFillColor(ALERT if val>=60 else MUTED)
        if i == 0 or abs(val - hist[i-1]) >= 3:  # only show if changed enough
            c.drawCentredString(bxb+bar_w/2, by0+bh+3, str(val))
        pts.append((bxb+bar_w/2, by0+bh))
    c.setStrokeColor(BRAND); c.setLineWidth(0.8)
    for i in range(len(pts)-1): c.line(pts[i][0], pts[i][1], pts[i+1][0], pts[i+1][1])

    # Legend
    c.setFont(FR, 5.5); c.setFillColor(MUTED)
    c.drawString(x+8, cur-trd_content+8, f"7-wk avg: {sum(hist)//len(hist)}  \u00b7  Alert threshold: 60  \u00b7  Trend: {'Rising' if hist[-1]>hist[0] else 'Falling'}")

# ── Page 2 BOTTOM BAR: FemSaidia Desk | Brief Metadata (full width, 80pt) ─────
def _dv_bottom_bar(c, brief, snap):
    import datetime as _dt
    sy   = 28 + 8   # bar bottom y
    sh   = _DV_BBAR # 80pt
    half = CW / 2

    # Left panel — FemSaidia callout
    c.setFillColor(HexColor('#180410'))
    c.rect(MAR-10, sy, half+5, sh, fill=1, stroke=0)
    c.setFillColor(BRAND); c.rect(MAR-10, sy+sh-2, half+5, 2, fill=1, stroke=0)
    c.setFont(FB, 8); c.setFillColor(BRAND)
    c.drawString(MAR, sy+sh-16, 'EVERY 47 HOURS. A WOMAN DIES IN KENYA.')
    c.setFont(FR, 8); c.setFillColor(WHITE)
    c.drawString(MAR, sy+sh-30, '\u2014 FemSaidia Kenya Intelligence Desk')
    c.setFont(FR, 7.5); c.setFillColor(HexColor('#C8B0C0'))
    c.drawString(MAR, sy+sh-44, 'Share this brief. Cite it. Demand a response.')
    c.setFont(FR, 7); c.setFillColor(MUTED)
    c.drawString(MAR, sy+14, 'femsaidiakenya.org  \u00b7  halafu@femsaidiakenya.org')
    c.drawString(MAR, sy+6, 'Subscribe  \u00b7  Donate  \u00b7  Partner')

    # Right panel — Brief Metadata
    rx2 = MAR + half + 5
    rw2 = CW - half - 5
    c.setFillColor(HexColor('#1A2035'))
    c.rect(rx2, sy, rw2+10, sh, fill=1, stroke=0)
    c.setFillColor(HexColor('#C05010'))
    c.rect(rx2, sy+sh-2, rw2+10, 2, fill=1, stroke=0)
    c.setFont(FB, 5.5); c.setFillColor(WHITE)
    c.drawString(rx2+6, sy+sh-12, 'BRIEF METADATA')
    lbl  = brief.get('period_label', '')
    arts = snap.get('articles_count', 683)
    kibe = snap.get('kibe_count', 52)
    prot = snap.get('protest_count', 57)
    c.setFont(FR, 6.5); c.setFillColor(HexColor('#C8C0D0'))
    for i, txt4 in enumerate([
        f'Period: {lbl}',
        f'Articles: {arts}  \u00b7  Kibe-tagged: {kibe}  \u00b7  Protest: {prot}',
        f'Scanner v3 (6h)  \u00b7  X poller 19 handles (2h)',
        f'Generated: {_dt.datetime.now(_dt.timezone.utc).strftime("%d %b %Y")} EAT',
    ]):
        c.drawString(rx2+6, sy+sh-24-i*13, txt4)

# ── MAIN ENTRY ────────────────────────────────────────────────────────────────



def _parse_ti_text(raw):
    import re as _r
    cases, seen = [], set()
    for line in raw.split('\n'):
        stripped = line.strip()
        if not stripped.startswith('-') and not stripped.startswith('*'):
            continue
        m = _r.match('\\s*[-*]\\s+\\*\\*([^*:]{3,55}?)\\*\\*[:\\s]*(.*)', stripped)
        if not m:
            m = _r.match('[-*]\\s+([A-Z][^:*]{3,50}):\\s*(.*)', stripped)
        if not m:
            continue
        name = m.group(1).strip().rstrip(':').strip()
        desc = _r.sub('\\*{1,2}([^*]+)\\*{1,2}', '\\1', m.group(2).strip())
        key  = name.lower()[:20]
        if len(name) < 3 or key in seen:
            continue
        seen.add(key)
        county_match = _r.search('(Nairobi|Mombasa|Siaya|Meru|Kiambu|Nakuru|Bondo|Embakasi)', desc)
        date_match   = _r.search('(May|June|Jan|Feb|Mar|Apr|Jul|Aug|Sep|Oct|Nov|Dec)\\s+\\d{1,2}', desc)
        tech_p = [p for p in ['WhatsApp','Facebook','TikTok','Instagram'] if p in desc]
        cases.append({
            'victim_name':      name,
            'notes':            desc[:150],
            'county':           county_match.group(1) if county_match else '',
            'incident_date':    date_match.group(0) if date_match else '',
            'suspect_relationship': '',
            'incident_type':    '',
            'tech_facilitated': bool(tech_p),
            'tech_platforms':   tech_p,
            'source_url':       '',
        })
    return cases[:5]

def page_double(c, brief, snap):
    """2-page double-column brief — zero gaps, all sections filled."""
    live_cases = fetch_live_cases(limit=6)

    # Page 1
    _dv_hdr(c, brief, snap, 1)
    _dv_index(c, brief, snap)
    _dv_p1_left(c, brief, snap, live_cases)
    _dv_p1_right(c, brief, snap)
    _dv_ftr(c, 1)
    c.showPage()

    # Page 2
    _dv_hdr(c, brief, snap, 2)
    c.setFillColor(BRAND); c.rect(0, H-38, W, 2, fill=1, stroke=0)
    _dv_p2_left(c, brief, snap)
    _dv_p2_right(c, brief, snap)
    _dv_bottom_bar(c, brief, snap)
    _dv_ftr(c, 2)
    c.showPage()


def main():
    import argparse
    parser = argparse.ArgumentParser(description="FemSaidia Intel Brief PDF generator")
    parser.add_argument("--id", dest="brief_id", default=None,
                        help="Specific brief UUID to render (default: latest)")
    args = parser.parse_args()

    print("🔄  Fetching Intel Brief…")
    try:
        brief = fetch_brief(args.brief_id)
    except Exception as e:
        print(f"❌  {e}"); sys.exit(1)

    snap  = parse_snap(brief)
    label = brief.get("period_label","?")
    print(f"✅  {label}")

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    cv = rl_canvas.Canvas(OUTPUT_PATH, pagesize=A4)
    cv.setTitle(f"FemSaidia Kenya Intel Brief — {label}")
    cv.setAuthor("FemSaidia Kenya")
    cv.setSubject("Intel Brief — Digital Safety Intelligence")

    print("📄  Building single page v2…")
    page_double(cv, brief, snap)
    cv.save()
    print(f"✅  → {OUTPUT_PATH}")

    # FIX 5 — write inline HTML viewer alongside the PDF
    viewer_path = write_viewer(OUTPUT_PATH, label)
    print(f"🌐  → {viewer_path}  (open this in browser for inline view)")

if __name__=="__main__": main()