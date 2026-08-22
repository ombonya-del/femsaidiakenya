#!/usr/bin/env python3
"""
Deterministic render test for the Intel Brief PDF.

Renders the brief from in-memory fixtures (NO network, NO live data) and asserts
it produces a valid 2-page PDF without raising. Catches layout regressions and
any exception in generate_brief.py before it ships.

Run:  python3 scripts/test_render_brief.py
Exits non-zero on any failure.
"""
import os
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import generate_brief as gb  # noqa: E402
from reportlab.pdfgen import canvas as rl_canvas  # noqa: E402
from reportlab.lib.pagesizes import A4  # noqa: E402

# ── Fixtures ────────────────────────────────────────────────────────────────
ARCHS = ["naive", "precocious", "allin", "onoff", None]
LANES = ["understand", "interrupt", "build", None]
CTYS = ["Nairobi", "Kiambu", "Siaya", "Mombasa", "Nakuru", "Kisumu", "Machakos"]

CASE_MIX = [
    {"archetype": ARCHS[i % len(ARCHS)],
     "halafu_lane": LANES[i % len(LANES)],
     "county": CTYS[i % len(CTYS)]}
    for i in range(43)
]
LIVE_CASES = [
    {"victim_name": f"Test Case {i + 1}", "county": CTYS[i % len(CTYS)],
     "incident_date": f"2026-06-2{i % 9}", "incident_type": "Femicide",
     "perpetrator_relationship": "partner", "tech_facilitated": bool(i % 2),
     "tech_platforms": ["TikTok"], "source_url": "https://example.org/x",
     "status": "active"}
    for i in range(6)
]
BRIEF = {
    "period_label": "TEST · Week 0",
    "OVERVIEW": "Fixture overview text for the render test. " * 3,
    "MOTD_PATTERN": "Fixture pattern. " * 4,
    "TECH_FACILITATED": "Fixture tech-facilitated summary. " * 3,
    "MISOGYNY_INDEX": "Fixture index analysis. " * 6,
    "THE_INSIGHT": "Fixture insight paragraph for the render test. " * 6,
    "THE_ASK": "Parliament: fixture ask one.\nJudiciary: fixture ask two.\n"
               "Funders: fixture ask three.\nCounty govts: fixture ask four.",
}
SNAP = {
    "period": "TEST · Week 0", "misogyny_index": 58, "misogyny_delta": 4,
    "media_score": 64, "community_score": 41, "articles_count": 683,
    "kibe_count": 52, "protest_count": 57, "reports_received": 9,
}


def main():
    # Patch every network-touching fetch with fixtures.
    gb.fetch_live_cases = lambda limit=6: LIVE_CASES
    gb.fetch_case_breakdowns = lambda: CASE_MIX
    gb.fetch_petition_count = lambda: 1487
    gb.parse_snap = lambda b: SNAP

    out = os.path.join(tempfile.gettempdir(), "test_brief.pdf")
    cv = rl_canvas.Canvas(out, pagesize=A4)
    gb.page_double(cv, BRIEF, SNAP)
    cv.save()

    size = os.path.getsize(out)
    assert size > 3000, f"PDF too small ({size} bytes) — likely empty"

    pages = None
    try:
        from pypdf import PdfReader
        pages = len(PdfReader(out).pages)
    except Exception:
        # pypdf not available — fall back to counting page objects in raw bytes.
        with open(out, "rb") as fh:
            raw = fh.read()
        pages = raw.count(b"/Type /Page") - raw.count(b"/Type /Pages")

    assert pages == 2, f"Expected 2 pages, got {pages}"
    print(f"RENDER TEST PASSED — {out} ({size} bytes, {pages} pages)")


if __name__ == "__main__":
    try:
        main()
    except AssertionError as e:
        print(f"RENDER TEST FAILED — {e}")
        sys.exit(1)
    except Exception as e:
        print(f"RENDER TEST ERRORED — {type(e).__name__}: {e}")
        sys.exit(1)
