"""Rebuild the renamed OFL subset. Supply the original v1.530 TTF as argv[1]."""
from pathlib import Path
import sys
from fontTools import subset
root=Path(__file__).resolve().parents[1]
opts=subset.Options();opts.flavor='woff2';opts.name_IDs=['*']
font=subset.load_font(sys.argv[1],opts)
text=''.join(p.read_text() for folder in ['src','data','docs'] for p in (root/folder).rglob('*') if p.suffix in ['.ts','.json','.md'])
sub=subset.Subsetter(opts);sub.populate(text=text+''.join(chr(i) for i in range(32,127))+'♥✓←→↗Ⅱ♧☀✧✌−');sub.subset(font)
for n in font['name'].names:
 if n.nameID in (1,3,4,6,16):n.string=('PlaygroundWenKai-Regular' if n.nameID==6 else 'Playground WenKai').encode(n.getEncoding(),errors='replace')
font.flavor='woff2';font.save(root/'public/assets/fonts/PlaygroundWenKai.woff2')
