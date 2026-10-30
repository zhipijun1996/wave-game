import json,itertools,copy
from pathlib import Path
from rules import *
cases=[]
def add(name,state,actions):cases.append(dict(name=name,state=state,actions=actions,expected=resolve(state,actions)))
for a,b in itertools.product(ALL+[None],repeat=2):
    s=initial();s['players'][0]['energy']=s['players'][1]['energy']=9
    # Quick must have room, while all attacks remain affordable.
    s['players'][0]['energy']=s['players'][1]['energy']=8
    add(f'{a}/{b}',s,[a,b])
for energy,blocked,a,b in itertools.product(range(10),(False,True),ALL+ [None],['charge','wave1','wave2','wave3']):
    s=initial();s['players'][0].update(energy=energy,blocked=blocked);s['players'][1]['energy']=8
    add(f'boundary/{energy}/{blocked}/{a}/{b}',s,[a,b])
for hp,turn in itertools.product([1,3,5],[59,60]):
    s=initial(hp);s['round']=turn;s['players'][1]['energy']=5
    add(f'terminal/{hp}/{turn}',s,['charge','wave3'])
p=Path(__file__).resolve().parents[1]/'tests/rule-cases.json';p.write_text(json.dumps(cases,ensure_ascii=False,separators=(',',':')))
print(f'{len(cases)} shared cases written')
