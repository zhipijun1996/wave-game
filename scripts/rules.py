"""Independent deterministic Python resolver; shares only versioned JSON parameters."""
import json
from pathlib import Path
CONFIG=json.loads((Path(__file__).resolve().parents[1]/'data/skills.json').read_text())
SKILLS={s['id']:s for s in CONFIG['skills']}
ALL=list(SKILLS)
BASIC=['charge','wave1','guard1']
def reason(p,a):
    return (a not in p['skills'] or (p['blocked'] and SKILLS[a]['kind']=='charge') or (a=='quick' and p['energy']>=CONFIG['energyCap']) or p['energy']<SKILLS[a]['cost'])
def legal(p): return [a for a in p['skills'] if not reason(p,a)]
def initial(hp=5,skills=None,enemy=None):
    skills=ALL if skills is None else skills
    return {'round':1,'players':[{'hp':hp,'energy':0,'blocked':False,'skills':skills.copy()},{'hp':hp,'energy':0,'blocked':False,'skills':(enemy or skills).copy()}]}
def resolve(state,requested):
    actions=[a if a in SKILLS and not reason(p,a) else ('guard1' if p['blocked'] else 'charge') for p,a in zip(state['players'],requested)]
    s=[SKILLS[a] for a in actions]; damage=[0,0];gain=[0,0];events=[];cost=[x['cost'] for x in s]
    if all(x['kind']=='attack' for x in s):
        damage=[max(0,s[1]['damage']-s[0]['damage']),max(0,s[0]['damage']-s[1]['damage'])]
        events.append({'type':'cancel' if s[0]['damage']==s[1]['damage'] else 'partial','side':0 if damage[0]>0 else 1,'amount':abs(s[0]['damage']-s[1]['damage'])})
    else:
        for i in (0,1):
            j=1-i
            if s[i]['kind']!='attack':continue
            if s[j]['kind']=='reflect' and s[j]['cover']>=s[i]['power']:
                damage[i]=s[i]['damage'];events.append({'type':'reflect','side':j,'amount':s[i]['damage']})
            elif s[j]['kind']=='guard' and s[j]['cover']>=s[i]['power']:events.append({'type':'block','side':j,'amount':s[i]['damage']})
            else:
                damage[j]=s[i]['damage'];events.append({'type':'break' if s[j]['kind'] in ['guard','reflect'] else 'hit','side':j,'amount':s[i]['damage']})
    players=[]
    for i,p in enumerate(state['players']):
        gain[i]=min(s[i]['gain'],CONFIG['energyCap']-p['energy']+cost[i]) if s[i]['gain'] and not(s[i]['hitCancelsGain'] and damage[i]>0) else 0
        if s[i]['kind']=='charge':events.append({'type':'interrupted' if actions[i]=='quick' and damage[i]>0 else 'charge','side':i,'amount':gain[i]})
        players.append({**p,'hp':max(0,p['hp']-damage[i]),'energy':p['energy']-cost[i]+gain[i],'blocked':s[i]['lockCharge']})
    winner='draw' if all(p['hp']==0 for p in players) else 1 if players[0]['hp']==0 else 0 if players[1]['hp']==0 else 'draw' if state['round']>=CONFIG['maxRounds'] else None
    return dict(actions=actions,next={'round':state['round']+1,'players':players},damage=damage,gain=gain,cost=cost,events=events,winner=winner)
