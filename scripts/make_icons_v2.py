"""Ten original hand-drawn skill pictograms for the anime playground revision.

Run independently after make_assets.py: that historical generator also writes icons.
All geometry is authored here; no images, font glyphs, or downloaded artwork.
"""
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assets/icons'
INK = '#303432'
PAPER = '#fcfaf2'
TEAL = '#338b86'
BLUE = '#398dc5'
ORANGE = '#e99c42'
PURPLE = '#8d77b4'
GREEN = '#8dce73'

# At 25 CSS px, a stroke is about one screen pixel: retain strong silhouettes.
ICONS = {
    'charge': f'''
<circle cx="32" cy="32" r="10" fill="#dff0de" stroke="{TEAL}"/>
<path d="M13 20q-1-8 8-10l17 1q5 1 3 4l-13 1m-6 2 14 1m-19 3 15 1M51 44q1 8-8 10l-17-1q-5-1-3-4l13-1m6-2-14-1m19-3-15-1"/>
<path d="m9 29 2-3m44 12-2 3" stroke="{TEAL}"/>
''',
    'quick': f'''
<path d="M24 7h16v5H24z" fill="{INK}" stroke-width="1.5"/>
<rect x="17" y="12" width="30" height="41" rx="5" fill="#eaf2d7"/>
<path d="m29 18-7 15h8l-4 13 15-20h-9l5-8" fill="{ORANGE}" stroke="{ORANGE}" stroke-width="1.5"/>
<path d="m10 15-4 9h6l-4 9m46-17-4 9h6l-4 9" stroke="{TEAL}"/>
<path d="M29 54v4h6v-4m-6 2h6"/>
''',
    'wave1': f'''
<path d="m7 43 12-7 1-15q0-4 3-4t3 4v10-18q0-4 3-4t3 4v17m0-9v-6q0-4 3-4t3 4v19l5-5q4-2 5 1l-9 15-12 2-12 9" fill="{PAPER}"/>
<path d="M8 34 19 28m-3 19 8-5"/>
<circle cx="49" cy="18" r="8" fill="#dff1e8" stroke="{TEAL}"/>
<path d="m40 9 4-2m-4 20 4 2m9-24 2-3m3 16h3" stroke="{TEAL}" stroke-width="2"/>
''',
    'wave2': f'''
<path d="M9 17q0-12 12-12t12 12v6q-1 10-11 10T9 23Z" fill="{PAPER}"/>
<path d="m10 14 22-2m-20 3-7 5m7-3-7 11" stroke="#c95c4e" stroke-width="5"/>
<path d="m21 20 6 1m-5 5h4M10 38l11-5 12 7M10 38l-3 17m10-19 3 12 11-4m-9-10 5 15 8-3"/>
<path d="m30 46 3-13m-3 3 4-7m1 17 2-14" stroke-width="2.5"/>
<ellipse cx="46" cy="37" rx="12" ry="14" fill="#d6edf8" stroke="{BLUE}"/>
<path d="m44 31 8 5-10 8m11-20 4-4m0 16h5m-8 14 4 4" stroke="{BLUE}" stroke-width="2"/>
''',
    'wave3': f'''
<path d="M22 5q13 0 14 15l-3 9H20l-4-9q-1-13 6-15Z" fill="#e2e8e5"/>
<path d="m25 5 1 21M18 16l5 3m6-1 5-3" stroke="#6b777a" stroke-width="2"/>
<path d="m19 17 4 1-2 3-3-2m12-1 4-1v3l-4 2" fill="#fff8c8" stroke="#fff8c8" stroke-width="1"/>
<path d="m18 31-7 9 7 13h18l5-13-8-9-7 7Z" fill="#d57363"/>
<circle cx="26" cy="37" r="3" fill="{BLUE}" stroke="{PAPER}" stroke-width="1.5"/>
<path d="m14 47 22-12m-8-5 1 21" stroke="{PAPER}" stroke-width="7"/>
<path d="m14 47 22-12m-8-5 1 21" stroke-width="2.5"/>
<path d="M37 39h24m-23 5h20m-20-9h22" stroke="{BLUE}" stroke-width="3"/>
<path d="M37 39h24" stroke="#fffdf0" stroke-width="1.5"/>
''',
    'guard1': f'''
<path d="m38 39 15 15q3 3 6 0t0-5L44 34" fill="#bc9a78"/>
<circle cx="27" cy="26" r="20" fill="#52646a"/>
<circle cx="27" cy="26" r="14" stroke="#c6d1c7" stroke-width="2"/>
<path d="m19 16-4 7m0 5 1 4" stroke="#f4f3df" stroke-width="2.5"/>
<path d="m48 8 5-5m-4 14h8m-12-14 1 5" stroke="{ORANGE}"/>
''',
    'guard2': f'''
<path d="m8 31 2-16 7 4 2-14 5 14 7-5 2 17-10 9-7-2Z" fill="{PURPLE}"/>
<path d="m19 5 3 20m-9-3 5 3m6 0 5-5" stroke="{GREEN}" stroke-width="3"/>
<path d="m4 29 7-5 3 15-9 5m25-12 5-8 4 15-10 5" fill="{PURPLE}"/>
<path d="m39 17 15 6 6 15-6 15-15 6-15-6-6-15 6-15Z" fill="#fff0c8" stroke="{ORANGE}" stroke-width="3"/>
<path d="m39 24 10 4 4 10-4 10-10 4-10-4-4-10 4-10Z" stroke="{ORANGE}" stroke-width="2"/>
<path d="m39 31 5 2 2 5-2 5-5 2-5-2-2-5 2-5Z" stroke="{ORANGE}" stroke-width="2"/>
''',
    'guard3': f'''
<path d="m24 9 9-3 9 3 4 17-13 11-12-11Z" fill="{PAPER}"/>
<path d="m33 20-14-15 5 17 9 5 9-5 5-17-14 15" fill="#e9c56a" stroke="#b88c3c" stroke-width="1.5"/>
<path d="m27 27 5 1m3 0 5-1" stroke="{TEAL}" stroke-width="2.5"/>
<path d="m6 31 15-2 4 19-8 11-11-11Z" fill="{PAPER}"/>
<path d="m28 36 14-1 4 17-10 9-9-11Z" fill="{PAPER}"/>
<path d="m44 28 14 4-1 19-11 6-5-14Z" fill="{PAPER}"/>
<path d="m11 35 6-1 3 12-4 5-5-5Zm21 5 6-1 3 12-5 4-4-6Zm15-7 6 2-1 12-5 4-2-9Z" fill="#b9ebcf" stroke="{TEAL}" stroke-width="1.5"/>
''',
    'reflect1': f'''
<path d="M7 23v24q0 8 9 8t9-8V23" fill="#bb7b9f"/>
<ellipse cx="16" cy="23" rx="9" ry="5" fill="#d7dfb3"/>
<ellipse cx="16" cy="23" rx="5" ry="2.5" fill="#394d49" stroke="none"/>
<path d="M37 22v24q0 8 9 8t9-8V22" fill="#bb7b9f"/>
<ellipse cx="46" cy="22" rx="9" ry="5" fill="#d7dfb3"/>
<ellipse cx="46" cy="22" rx="5" ry="2.5" fill="#394d49" stroke="none"/>
<path d="M16 5v11m-4-4 4 4 4-4M46 15V4m-4 4 4-4 4 4" stroke="{TEAL}" stroke-width="3"/>
<path d="m10 36 6 5 6-5m18-1 6 5 6-5" stroke="#f6e6a3" stroke-width="2"/>
<path d="M26 46q6 6 10-1" stroke="#906c8a" stroke-width="2"/>
''',
    'reflect2': f'''
<path d="m37 43 12 15" stroke="#6d625c" stroke-width="6"/>
<path d="M25 6q-12 0-12 11 0 6 6 11-12 2-12 13 0 13 15 13 9 0 16-8 12 0 13-12 1-12-11-14 2-14-15-14Z" fill="#e7e0cf"/>
<path d="M25 10q-8 0-8 7 0 5 9 10 5-4 10-5 1-12-11-12Z" fill="#b95049" stroke-width="1.5"/>
<path d="m27 27-2 13m-6-2h12" stroke="#595953" stroke-width="2.5"/>
<path d="M50 9q9 4 8 15m-5-3 5 4 3-6M6 12q-5 7-3 13" stroke="{TEAL}" stroke-width="2.5"/>
'''
}

OUT.mkdir(parents=True, exist_ok=True)
for name, geometry in ICONS.items():
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g fill="none" stroke="{INK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">{geometry}</g></svg>\n'
    ET.fromstring(svg)
    (OUT / f'{name}.svg').write_text(svg)
print(f'{len(ICONS)} original 64×64 hand-drawn skill icons generated')
