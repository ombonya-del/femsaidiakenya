import json, re, sys
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
import urllib.request, urllib.parse

# ── COLORS (Midnight Slate / FemSaidia) ──────────────────────────────────────
C_BG       = HexColor('#111827')  # dark background
C_DARK2    = HexColor('#1A2035')
C_ACCENT   = HexColor('#8A1030')  # deep red
C_ACCENT2  = HexColor('#C05010')  # amber
C_TEXT     = HexColor('#F0D0D8')  # light pink text
C_MUTED    = HexColor('#8892B0')
C_WHITE    = white
C_RULE     = HexColor('#8A1030')

W, H = A4

# ── FETCH BRIEF FROM SUPABASE ─────────────────────────────────────────────────
SUPABASE_URL = "https://uuluuhltphgwfblcghlp.supabase.co"
ANON_KEY     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bHV1aGx0cGhnd2ZibGNnaGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MjI2NDAsImV4cCI6MjA5MzQ5ODY0MH0.KU_wtm0NVUz8vrMqgozPvTlmiCIf_yXP8Z3Gpmh599E"

req = urllib.request.Request(
    f"{SUPABASE_URL}/rest/v1/intel_briefs?select=*&order=generated_at.desc&limit=1",
    headers={"apikey": ANON_KEY, "Authorization": f"Bearer {ANON_KEY}"}
)
with urllib.request.urlopen(req) as r:
    briefs = json.loads(r.read())

if not briefs:
    print("No briefs found")
    sys.exit(1)

brief = briefs[0]
title = brief['title']
content = brief['content']
period_start = brief.get('period_start', '')
period_end = brief.get('period_end', '')
generated_at = brief.get('generated_at', '')[:10]
brief_id = brief['id']

print(f"Generating PDF for: {title}")

# ── PARSE SECTIONS ────────────────────────────────────────────────────────────
def parse_sections(text):
    sections = {}
    current = 'INTRO'
    current_lines = []
    for line in text.split('\n'):
        m = re.match(r'---([A-Z_]+)---', line.strip())
        if m:
            sections[current] = '\n'.join(current_lines).strip()
            current = m.group(1)
            current_lines = []
        else:
            current_lines.append(line)
    sections[current] = '\n'.join(current_lines).strip()
    return sections

sections = parse_sections(content)

# ── OUTPUT PATH ───────────────────────────────────────────────────────────────
out = f"/Users/vo/femsaidiakenya/public/intel-brief-latest.pdf"

# ── BUILD PDF ─────────────────────────────────────────────────────────────────
doc = SimpleDocTemplate(out, pagesize=A4,
    leftMargin=18*mm, rightMargin=18*mm,
    topMargin=12*mm, bottomMargin=16*mm)

# Styles
def style(name, **kw):
    s = ParagraphStyle(name, **kw)
    return s

S = {
    'title': style('title',
        fontName='Helvetica-Bold', fontSize=22, textColor=C_WHITE,
        leading=26, alignment=TA_LEFT, spaceAfter=2*mm),
    'subtitle': style('subtitle',
        fontName='Helvetica', fontSize=10, textColor=C_MUTED,
        leading=14, alignment=TA_LEFT, spaceAfter=4*mm),
    'section': style('section',
        fontName='Helvetica-Bold', fontSize=9, textColor=C_ACCENT,
        leading=12, spaceBefore=5*mm, spaceAfter=2*mm,
        letterSpacing=1.5),
    'body': style('body',
        fontName='Helvetica', fontSize=9.5, textColor=C_TEXT,
        leading=15, alignment=TA_JUSTIFY, spaceAfter=2*mm),
    'bullet': style('bullet',
        fontName='Helvetica', fontSize=9, textColor=C_TEXT,
        leading=14, leftIndent=8*mm, spaceAfter=1.5*mm),
    'insight': style('insight',
        fontName='Helvetica-Oblique', fontSize=10, textColor=C_WHITE,
        leading=16, alignment=TA_JUSTIFY, spaceAfter=3*mm),
    'ask': style('ask',
        fontName='Helvetica', fontSize=11, textColor=C_ACCENT2,
        leading=16, alignment=TA_LEFT, spaceAfter=3*mm),
    'footer': style('footer',
        fontName='Helvetica', fontSize=8, textColor=C_MUTED,
        leading=11, alignment=TA_CENTER),
    'header_label': style('header_label',
        fontName='Helvetica-Bold', fontSize=8, textColor=C_ACCENT,
        leading=10, letterSpacing=1.2),
}

def rule(color=C_RULE, thickness=0.5):
    return HRFlowable(width='100%', thickness=thickness, color=color, spaceAfter=3*mm, spaceBefore=1*mm)

def section_header(label):
    return [
        Spacer(1, 3*mm),
        Paragraph(f'● {label.upper().replace("_"," ")}', S['section']),
        rule(C_ACCENT, 0.3),
    ]

def body_text(text):
    items = []
    for line in text.strip().split('\n'):
        line = line.strip()
        if not line:
            continue
        # Convert markdown bold
        line = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', line)
        if line.startswith('- ') or line.startswith('• '):
            items.append(Paragraph(f'→ {line[2:]}', S['bullet']))
        elif re.match(r'^\d+\.', line):
            items.append(Paragraph(f'→ {line[3:].strip()}', S['bullet']))
        else:
            items.append(Paragraph(line, S['body']))
    return items

# ── HEADER BAND ───────────────────────────────────────────────────────────────
story = []

# Dark header table
header_data = [[
    Paragraph('<b>FEMSAIDIA KENYA</b>', style('hl', fontName='Helvetica-Bold', fontSize=14, textColor=C_WHITE, leading=18)),
    Paragraph(f'INTELLIGENCE BRIEF<br/><font size="8" color="#8892B0">{period_start} — {period_end}</font>',
        style('hr', fontName='Helvetica', fontSize=10, textColor=C_MUTED, leading=14, alignment=TA_LEFT)),
    Paragraph(f'Generated<br/><font size="8" color="#8892B0">{generated_at}</font>',
        style('hd', fontName='Helvetica', fontSize=10, textColor=C_MUTED, leading=14, alignment=TA_LEFT)),
]]
header_table = Table(header_data, colWidths=[70*mm, 80*mm, 40*mm])
header_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), C_BG),
    ('TEXTCOLOR', (0,0), (-1,-1), C_WHITE),
    ('ALIGN', (0,0), (0,-1), 'LEFT'),
    ('ALIGN', (1,0), (1,-1), 'LEFT'),
    ('ALIGN', (2,0), (2,-1), 'LEFT'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('TOPPADDING', (0,0), (-1,-1), 8),
    ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ('LEFTPADDING', (0,0), (0,-1), 6),
    ('LINEBELOW', (0,0), (-1,0), 1.5, C_ACCENT),
]))
story.append(header_table)
story.append(Spacer(1, 4*mm))

# Title
story.append(Paragraph(title, S['title']))
story.append(rule(C_RULE, 1.5))
story.append(Spacer(1, 2*mm))

# ── SECTIONS ──────────────────────────────────────────────────────────────────
section_map = [
    ('OVERVIEW',          'Overview'),
    ('MISOGYNY_INDEX',    'Misogyny Index'),
    ('TOP_INCIDENTS',     'Recorded Incidents'),
    ('SCANNER_CAUGHT',    'What the Scanner Caught'),
    ('MOTD_PATTERN',      'Misogyny of the Day — Pattern'),
    ('TECH_FACILITATED',  'Tech-Facilitated Violence'),
    ('COMMUNITY_PULSE',   'Community Pulse'),
]

for key, label in section_map:
    text = sections.get(key, '')
    if not text:
        continue
    story.extend(section_header(label))
    story.extend(body_text(text))

# Insight
insight = sections.get('THE_INSIGHT', '')
if insight:
    story.extend(section_header('The Insight'))
    story.append(Paragraph(f'"{insight.strip()}"', S['insight']))

# The Ask
ask = sections.get('THE_ASK', '')
if ask:
    story.append(Spacer(1, 4*mm))
    story.append(rule(C_ACCENT2, 1))
    story.append(Paragraph('THE ASK', S['section']))
    story.append(Paragraph(ask.strip(), S['ask']))

# Footer
story.append(Spacer(1, 8*mm))
story.append(rule(C_MUTED, 0.3))
story.append(Paragraph(
    f'FemSaidia Kenya · femsaidiakenya.org · halafu@femsaidiakenya.org · A woman is killed every 47 hours in Kenya.',
    S['footer']))

# ── BACKGROUND CANVAS ─────────────────────────────────────────────────────────
def dark_background(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(C_DARK2)
    canvas.rect(0, 0, W, H, fill=1, stroke=0)
    canvas.restoreState()

doc.build(story, onFirstPage=dark_background, onLaterPages=dark_background)
print(f"✓ PDF generated: {out}")
