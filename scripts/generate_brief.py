#!/usr/bin/env python3
"""
FemSaidia Kenya — Intel Brief PDF  v6
Precision layout, no gaps, FemSaidia DNA.
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

# Page 1: 46pt title row, 4 sections, 3 gaps
_P1   = H - _HDR - _FTR - 46 - 3*_GAP   # 710.9
OH    = 103          # overview
RH    = 229          # misogyny index + incidents
SH    = 174          # scanner
MH    = _P1 - OH - RH - SH              # motd — fills remainder

# Page 2: no extra title, 3 sections, 2 gaps
_P2   = H - _HDR - _FTR - 2*_GAP        # 769.9
TH    = 268          # tech + community
IH    = 185          # insight
AH    = _P2 - TH - IH                   # ask — fills remainder

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
    "media":      HexColor("#BB1919"),
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
    for ln in lines:
        if y < 22: break
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
def draw_misogyny(c, x, y, w, h, brief, snap):
    card_bg(c, x, y, w, h)
    slabel(c, x+14, y+h-13, "Misogyny Index", BRAND)

    mi    = float(snap.get("misogyny_index",76))
    delta = snap.get("misogyny_delta",2)
    curr  = snap.get("weekly_incidents",[])
    prev  = snap.get("prev_weekly_incidents",[])

    # gauge — vertically centred in top 58 % of card
    GZ    = round(h * 0.58)
    gcx   = x + w/2
    gcy   = y+h-14-GZ + GZ//2 - 5
    draw_gauge(c, gcx, gcy, min(50, w//2-16), mi, 100.0)

    # delta in sparkline label — no separate badge (avoids overlap)
    SZ = round(h * 0.33)
    sy = y + SZ
    try:
        dv = float(delta)
        ds = f"+{int(dv)}" if dv>=0 else str(int(dv))
        dc = ALERT if dv>0 else POS
        trend_lbl = f"INDEX TREND  ·  {ds} pts from prev period"
    except Exception:
        dc = MUTED
        trend_lbl = "INDEX TREND  ·  this period vs prev"
    hrule(c, x+10, sy, w-20, CSEP)
    c.setFont(FB,6.5); c.setFillColor(dc)
    c.drawString(x+14, sy-11, trend_lbl)
    if curr and len(curr)>=2:
        sparkline(c, x+14, y+8, w-28, SZ-24, curr, prev, BRAND)
    else:
        c.setFont(FI,7.5); c.setFillColor(CSEP)
        c.drawCentredString(x+w/2, y+SZ//2, "trend data not available")


# ── 3. RECORDED INCIDENTS (right card) ───────────────────────────────────────
def draw_incidents(c, x, y, w, h, brief, snap):
    card_bg(c, x, y, w, h)
    slabel(c, x+14, y+h-13, "Recorded Incidents", ALERT)

    incs = snap.get("top_incidents", snap.get("incidents",[]))
    if not (isinstance(incs,list) and incs):
        wrap_into(c, brief.get("TOP_INCIDENTS",""), x+14, y+h-26,
                  w-28, h-30, FR, 7.8, MID, lead=12)
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

        # ── ZONE 2 (middle): title — starts 16 pt below zone 1 ──────────
        Z2   = Z1 - 16
        title = inc.get("title", str(inc))
        c.setFont(FB, 8); c.setFillColor(BODY)
        cpl_t = max(1, int(TW / (8*0.57)))
        tlines = textwrap.wrap(title, cpl_t)[:2]
        ty = Z2
        for ln in tlines:
            if ty < ry+14: break
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
    items = [ln.strip().lstrip(">•– ").strip()
             for ln in raw.replace("\n>","\n").split("\n")
             if ln.strip().lstrip(">•– ").strip()]
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

    # Escalation visual: 3 horizontal intensity bars, growing wider + darker
    # reads as: small → medium → large  (escalation)
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
        # track
        rrect(c, x+14, by, bw_max, bh, r=bh//2, fill=CSEP)
        # fill
        rrect(c, x+14, by, bw2,    bh, r=bh//2, fill=col)
        # label: inside the filled bar when wide enough, else just after it
        c.setFont(FB, 6.5)
        if bw2 > 90:                       # label fits inside with contrast
            c.setFillColor(WHITE)
            c.drawString(x+18, by+3.5, lbl)
        else:                              # label sits to the right of bar
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
    BARW  = w - 28
    LABEL_W = 66
    BAR_X = x + 14 + LABEL_W
    BAR_W = BARW - LABEL_W - 36
    bary  = y + h - 76
    row_b = min(18, (bary - y - 26) / max(len(items),1))

    for i,(lbl,val) in enumerate(items):
        pkey = lbl.lower().replace(" ","").replace("(","").replace(")","")
        col  = PLT.get(pkey, MUTED)
        pct  = val/total
        by   = bary - i*row_b

        # label
        c.setFont(FR,7.5); c.setFillColor(BODY)
        c.drawRightString(BAR_X-4, by+1, str(lbl)[:12])
        # track
        rrect(c, BAR_X, by, BAR_W, row_b-4, r=(row_b-4)//2, fill=CSEP)
        # fill
        fw = max(row_b-4, round(BAR_W*pct))
        rrect(c, BAR_X, by, fw, row_b-4, r=(row_b-4)//2, fill=col)
        # count + pct
        c.setFont(FB,7); c.setFillColor(BODY)
        c.drawString(BAR_X+BAR_W+4, by+1, f"{val}  {pct*100:.0f}%")

    # body text
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

    # Two dominant numbers — the 36-pt gap is the entire insight
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

    # VS divider
    c.setFont(FB,9); c.setFillColor(CBORD)
    c.drawCentredString(x+w/2, y+h-52, "vs")
    c.setStrokeColor(CBORD); c.setLineWidth(0.5)
    c.line(x+w/2, y+h-70, x+w/2, y+h-30)

    # gap callout bar
    rrect(c, x+14, y+h-82, w-28, 13, r=4, fill=T_AMB)
    c.setFont(FB,7.5); c.setFillColor(WARN)
    c.drawCentredString(x+w/2, y+h-76,
                        f"{gap}-point disconnect: media naming crisis, community negotiating it")

    hrule(c, x+10, y+h-98, w-20, CSEP)

    # two bars
    BW = w-28
    bary = y+h-112
    def hb(bx,by,pct,col,lbl,val):
        rrect(c,bx,by,BW,9,r=4,fill=CSEP)
        fw=max(9,round(BW*min(1,pct)))
        rrect(c,bx,by,fw,9,r=4,fill=col)
        c.setFont(FR,6.5);c.setFillColor(MUTED);c.drawString(bx,by+11,lbl)
        c.setFont(FB,7);c.setFillColor(BODY);c.drawRightString(bx+BW,by+11,val)
    hb(x+14, bary,    ms/100, ALERT, "Media coverage score",    f"{ms}/100")
    hb(x+14, bary-22, cs/100, WARN,  "Community sentiment",     f"{cs}/100")

    # pulse text
    txt = brief.get("COMMUNITY_PULSE","")
    wrap_into(c, txt[:340], x+14, bary-38, w-28, bary-38-y-4, FR, 7.8, MID, lead=12)


# ── 8. THE INSIGHT ────────────────────────────────────────────────────────────
def draw_insight(c, x, y, w, h, brief, snap):
    card_bg(c, x, y, w, h)
    # top red bar — editorial accent
    c.setFillColor(BRAND)
    c.rect(x, y+h-5, w, 5, fill=1, stroke=0)
    rrect(c,x,y+h-5,w,5,r=7,fill=BRAND)   # keep top corners rounded

    slabel(c, x+14, y+h-18, "The Insight", BRAND)

    # large ghost quote mark
    c.saveState(); c.setFillColor(BRAND); c.setFillAlpha(0.07)
    c.setFont(FB,96); c.drawString(x+6, y+h-68, "\u201C")
    c.restoreState()

    # pull quote — set large, let it breathe
    txt = brief.get("THE_INSIGHT","")
    c.setFont(FI,10.5); c.setFillColor(BODY)
    cpl = max(1,int((w-52)/(10.5*0.57)))
    cy  = y+h-32
    for ln in textwrap.wrap(txt[:480], cpl):
        if cy < y+22: break
        c.drawString(x+28, cy, ln); cy -= 16

    # attribution
    c.setFont(FB,7); c.setFillColor(BRAND2)
    c.drawString(x+28, y+12, "— FemSaidia Kenya Intelligence Desk")

    # left red accent bar
    c.setFillColor(BRAND)
    c.rect(x+14, y+18, 3, h-40, fill=1, stroke=0)


# ── 9. THE ASK ───────────────────────────────────────────────────────────────
def draw_ask(c, x, y, w, h, brief, snap):
    rrect(c, x, y, w, h, r=7, fill=HDR)
    # header
    c.setFont(FB,11); c.setFillColor(WHITE)
    c.drawString(x+16, y+h-18, "THE ASK")
    sw_ = c.stringWidth("THE ASK",FB,11)
    c.setFont(FR,8); c.setFillColor(HexColor("#8892B0"))
    c.drawString(x+16+sw_+8, y+h-17, "— priority actions for network partners & policymakers")
    c.setFillColor(BRAND2); c.rect(x, y+h-22, w, 1.5, fill=1, stroke=0)

    ask_items = snap.get("action_items",snap.get("asks",[]))
    ask_text  = brief.get("THE_ASK","")

    items=[]
    if isinstance(ask_items,list) and ask_items:
        for it in ask_items[:6]:
            items.append(it.get("text",str(it)) if isinstance(it,dict) else str(it))
    elif ask_text:
        for ln in ask_text.split("\n"):
            ln=ln.strip().lstrip("0123456789.-•) ")
            if ln: items.append(ln)
        items=items[:6]
    if not items: return

    # numbered items — two columns, large index numbers
    col_w = (w-36)/2
    sides = [items[0::2], items[1::2]]
    for col_i, lst in enumerate(sides):
        cx2 = x+16 + col_i*(col_w+12)
        cy2 = y+h-36
        for j,txt in enumerate(lst):
            if cy2 < y+10: break
            num = str(j*2+col_i+1).zfill(2)
            # index number
            c.setFont(FB,11); c.setFillColor(BRAND2)
            c.drawString(cx2, cy2, num)
            nw2 = c.stringWidth(num,FB,11)+6
            # text
            c.setFont(FR,7.8); c.setFillColor(HexColor("#F0D0D8"))
            cpl2=max(1,int((col_w-nw2-4)/(7.8*0.57)))
            for ln in textwrap.wrap(txt[:200],cpl2):
                c.drawString(cx2+nw2, cy2, ln); cy2-=11
            cy2-=7


# ════════════════════════════════════════════════════════════════════════════
#  PAGE BUILDERS  (cursor descends from content_top)
# ════════════════════════════════════════════════════════════════════════════
def page1(c, brief, snap):
    chrome(c, brief, 1)

    # title row
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

    # section cascade — cursor = top of each card (y+h)
    cur = H - _HDR - 46  # just below title row

    draw_overview(c, MAR, cur-OH, CW, OH, brief, snap);  cur -= OH + _GAP
    draw_misogyny(c, LX,  cur-RH, LC1, RH, brief, snap)
    draw_incidents(c,RX1, cur-RH, RC1, RH, brief, snap); cur -= RH + _GAP
    draw_scanner(c, MAR,  cur-SH, CW, SH, brief, snap);  cur -= SH + _GAP
    draw_motd(c,    MAR,  cur-MH, CW, MH, brief, snap)


def page2(c, brief, snap):
    chrome(c, brief, 2)
    cur = H - _HDR - 4

    draw_tech(c,      LX,  cur-TH, LC2, TH, brief, snap)
    draw_community(c, RX2, cur-TH, RC2, TH, brief, snap); cur -= TH + _GAP
    draw_insight(c,   MAR, cur-IH, CW,  IH, brief, snap); cur -= IH + _GAP
    draw_ask(c,       MAR, cur-AH, CW,  AH, brief, snap)


# ════════════════════════════════════════════════════════════════════════════
#  DATA + MAIN
# ════════════════════════════════════════════════════════════════════════════
def fetch_brief():
    r = requests.get(f"{SUPABASE_URL}/rest/v1/intel_briefs",
        params={"order":"generated_at.desc","limit":"1","select":"*"},
        headers={"apikey":SUPABASE_KEY,"Authorization":f"Bearer {SUPABASE_KEY}"},
        timeout=15)
    r.raise_for_status(); data=r.json()
    if not data: raise ValueError("intel_briefs table is empty — insert a brief first")
    row = data[0]

    # Build convenience fields the rest of the script expects
    ps = row.get("period_start","")
    pe = row.get("period_end","")
    row["period_label"]  = f"{ps} – {pe}" if ps and pe else ps or pe or ""
    row["issue_number"]  = row.get("title","") or str(row.get("id",""))[:8]

    # Parse content markdown into section keys so every draw_ function works
    content = row.get("content","") or ""
    row.update(_parse_content(content))

    return row

def _parse_content(md: str) -> dict:
    """
    Parse brief text into section keys.
    Handles two formats:
      AI-generated:  ---OVERVIEW---
      Markdown:      * OVERVIEW  or  ** OVERVIEW
    """
    import re as re2
    sections = {}
    current  = None
    lines    = []

    for line in md.split("\n"):
        # Format 1: AI-generated  ---SECTION_KEY---
        m = re2.match(r'^---([A-Z_]+)---\s*$', line.strip())
        if m:
            if current is not None:
                sections[current] = "\n".join(lines).strip()
            current = m.group(1)
            lines   = []
            continue

        # Format 2: markdown  * SECTION HEADING
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
    """Map any heading variant to the key the draw_ functions expect."""
    h = heading.upper().strip()
    MAP = {
        "OVERVIEW":                    "OVERVIEW",
        "MISOGYNY INDEX":              "MISOGYNY_INDEX",
        "RECORDED INCIDENTS":          "TOP_INCIDENTS",
        "WHAT THE SCANNER CAUGHT":     "SCANNER_CAUGHT",
        "SCANNER CAUGHT":              "SCANNER_CAUGHT",
        "MISOGYNY OF THE DAY":         "MOTD_PATTERN",
        "MOTD PATTERN":                "MOTD_PATTERN",
        "MISOGYNY OF THE DAY - PATTERN":"MOTD_PATTERN",
        "TECH-FACILITATED VIOLENCE":   "TECH_FACILITATED",
        "TECH FACILITATED VIOLENCE":   "TECH_FACILITATED",
        "COMMUNITY PULSE":             "COMMUNITY_PULSE",
        "THE INSIGHT":                 "THE_INSIGHT",
        "THE ASK":                     "THE_ASK",
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
    """
    Convert the real data_snapshot shape → flat dict the draw_ functions expect.

    Real shape:
      misogyny_index: {current, previous, delta, news_score, social_score}
      top_articles:   [{title, source, score, sentiment}, ...]
      motd_highlights:[{date, content, context, platform}, ...]
      tech_facilitated_count: int
      cases_recorded: int
      cases: []
    """
    n = dict(raw)

    # ── misogyny_index ────────────────────────────────────────────────────
    mi = raw.get("misogyny_index", {})
    if isinstance(mi, dict):
        n["misogyny_index"]  = mi.get("current",  76)
        n["misogyny_delta"]  = mi.get("delta",      0)
        n["media_score"]     = mi.get("news_score", 76)
        n["community_score"] = mi.get("social_score", 40)
    # if already a plain number, leave as-is

    # ── case / incident counts ────────────────────────────────────────────
    n["reports_received"] = raw.get("tech_facilitated_count",
                            raw.get("cases_recorded", 0))

    # ── tech_platforms — build from top_articles grouped by source ────────
    articles = raw.get("top_articles", [])
    if articles:
        src_counts = {}
        for a in articles:
            src = a.get("source", "Unknown")
            src_counts[src] = src_counts.get(src, 0) + 1
        n["tech_platforms"] = src_counts
    elif isinstance(raw.get("tech_platforms"), list):
        # list of strings → give each a count of 1
        n["tech_platforms"] = {p: 1 for p in raw["tech_platforms"]}

    # ── top_incidents — built from motd_highlights (real incident data) ───
    cases = raw.get("cases", [])
    highlights = raw.get("motd_highlights", [])

    if cases:
        # use structured cases if present
        n["top_incidents"] = cases
    elif highlights:
        # build incidents from MOTD highlights
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

    # ── scanner items — build from top_articles for fallback ─────────────
    if articles and not raw.get("scanner_items"):
        n["scanner_items"] = [
            f'{a["source"]}: {a["title"][:120]}'
            for a in articles[:5]
        ]

    return n

def main():
    print("🔄  Fetching Intel Brief…")
    try: brief=fetch_brief()
    except Exception as e: print(f"❌  {e}"); sys.exit(1)
    snap=parse_snap(brief)
    label=brief.get("period_label","?")
    print(f"✅  {label}")

    os.makedirs(os.path.dirname(OUTPUT_PATH),exist_ok=True)
    cv=rl_canvas.Canvas(OUTPUT_PATH,pagesize=A4)
    cv.setTitle(f"FemSaidia Kenya Intel Brief — {label}")
    cv.setAuthor("FemSaidia Kenya")
    print("📄  Page 1…"); page1(cv,brief,snap); cv.showPage()
    print("📄  Page 2…"); page2(cv,brief,snap); cv.showPage()
    cv.save(); print(f"✅  → {OUTPUT_PATH}")

if __name__=="__main__": main()
