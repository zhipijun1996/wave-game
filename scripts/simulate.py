"""Reproducible offline balance tournament. Runtime never needs Python."""
import argparse,csv,json,math,random,statistics,itertools,time
from collections import Counter,defaultdict
from pathlib import Path
from rules import *
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'artifacts';OUT.mkdir(exist_ok=True)
STRATEGIES=['random','bank','attack','defense','reflect','resource','history','mixed','always_guard','always_charge','quick_guard']
UNLOCK=['quick','reflect1','wave2','guard2','reflect2','wave3','guard3']

def choose(st,side,strategy,rng,hist):
    p=st['players'][side];opp=st['players'][1-side];ls=legal(p);others=legal(opp)
    if strategy=='always_guard':return 'guard1'
    if strategy=='always_charge':return 'charge' if 'charge' in ls else 'guard1'
    if strategy=='quick_guard':return 'quick' if 'quick' in ls else 'guard1'
    weights=[]
    if strategy in ['resource','history','mixed']:
        if strategy=='mixed' and rng.random()<.25:return rng.choice(ls)
        freq=Counter({a:1 for a in others})
        if strategy in ['history','mixed']:
            for h in hist[-10:]:freq[h[1-side]]+=2
        for a in ls:
            score=0;denom=0
            for b in others:
                acts=[a,b] if side==0 else [b,a];r=resolve(st,acts);w=freq[b]*(1.5 if SKILLS[b]['kind']=='charge' else 1)
                score+=w*(r['damage'][1-side]*(3 if opp['hp']<=SKILLS[a]['damage'] else 1.7)-2*r['damage'][side]+.3*(r['gain'][side]-r['cost'][side]));denom+=w
            weights.append(math.exp(max(-12,min(12,score/denom/1.1)))+.08)
    else:
        for a in ls:
            k=SKILLS[a]['kind'];w=1.
            if strategy=='bank':w=5 if k=='charge' else 4 if a=='wave3' else .5
            if strategy=='attack':w=6 if k=='attack' else 3 if k=='charge' else .4
            if strategy=='defense':w=6 if k=='guard' else 2 if k=='charge' else .7
            if strategy=='reflect':w=6 if k=='reflect' else 2 if k=='charge' else .7
            weights.append(w)
    return rng.choices(ls,weights)[0]

def wilson(win,n):
    if not n:return [0,0]
    z=1.96;p=win/n;den=1+z*z/n;mid=(p+z*z/(2*n))/den;half=z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/den
    return [round(max(0,mid-half),5),round(min(1,mid+half),5)]
def percentile(values,q):return sorted(values)[min(len(values)-1,int((len(values)-1)*q))] if values else None

def run_match(name,a,b,seed,hp,skills,enemy=None,start=(0,0),metrics=None,record=True,swapStreams=False):
    st=initial(hp,skills,enemy);st['players'][0]['energy'],st['players'][1]['energy']=start
    rngs=[random.Random(seed),random.Random(seed^0x13579)];
    if swapStreams:rngs.reverse()
    hist=[];cost=[0,0];first3=[None,None];first5=[None,None];used3=[None,None];used5=[None,None]
    while True:
        for i in range(2):
            e=st['players'][i]['energy']
            if e>=3 and first3[i] is None:first3[i]=st['round']
            if e>=5 and first5[i] is None:first5[i]=st['round']
        acts=[choose(st,0,a,rngs[0],hist),choose(st,1,b,rngs[1],hist)]
        r=resolve(st,acts)
        for i in range(2):
            if acts[i]=='wave2' and used3[i] is None:used3[i]=st['round']
            if acts[i]=='wave3' and used5[i] is None:used5[i]=st['round']
            cost[i]+=r['cost'][i]
        if metrics is not None:
            m=metrics;m['rounds']+=1
            for i in range(2):
                p,op=st['players'][i],st['players'][1-i];s=SKILLS[acts[i]]
                for x in legal(p):m['available'][x]+=1
                m['selected'][acts[i]]+=1;m['energySpent'][acts[i]]+=r['cost'][i]
                if p['blocked']:
                    m['blockedTurns']+=1
                    if legal(p)==['guard1']:m['forcedDefense']+=1
                if acts[i]=='quick':
                    can=any(SKILLS[x]['kind']=='attack' for x in legal(op));low=p['hp']<=2;freq=sum(SKILLS[h[1-i]]['kind']=='attack' for h in hist[-5:]);key=f"enemyCanAttack={can}/lowHP={low}/recentAttack={freq>=3}/startEnergy={p['energy']}"
                    stat=m['quickStrata'][key];stat['attempts']+=1;stat['success']+=int(r['damage'][i]==0);stat['gain']+=r['gain'][i];stat['lostGain']+=min(2,CONFIG['energyCap']-p['energy']) if r['damage'][i]>0 else 0
                    if p['energy']==0 and r['damage'][i]>0 and r['next']['players'][i]['hp']>0:m['zeroInterruptedSurvived']+=1
                if s['kind']=='attack':
                    k=m['attacks'][acts[i]];k['attempts']+=1;k['actualDamage']+=r['damage'][1-i]
                    typ='hit'
                    if any(e['type']=='cancel' for e in r['events']):typ='cancel'
                    elif any(e['type']=='partial' for e in r['events']):typ='partial'
                    elif any(e['type']=='block' and e['side']==1-i for e in r['events']):typ='blocked'
                    elif any(e['type']=='reflect' and e['side']==1-i for e in r['events']):typ='reflected'
                    elif any(e['type']=='break' and e['side']==1-i for e in r['events']):typ='break'
                    k[typ]+=1
                if s['kind']=='reflect':m['reflectAttempts']+=1;m['reflectSuccess']+=int(any(e['type']=='reflect' and e['side']==i for e in r['events']))
        hist.append(acts);st=r['next']
        if r['winner'] is not None:break
    return dict(scenario=name,a=a,b=b,seed=seed,swapStreams=swapStreams,start0=start[0],start1=start[1],winner=r['winner'],rounds=st['round']-1,cost0=cost[0],cost1=cost[1],first3_0=first3[0],first3_1=first3[1],first5_0=first5[0],first5_1=first5[1],actualWave2_0=used3[0],actualWave2_1=used3[1],actualWave3_0=used5[0],actualWave3_1=used5[1])

def newmetrics():return dict(rounds=0,available=Counter(),selected=Counter(),energySpent=Counter(),blockedTurns=0,forcedDefense=0,zeroInterruptedSurvived=0,reflectAttempts=0,reflectSuccess=0,attacks=defaultdict(Counter),quickStrata=defaultdict(Counter))
def summarize(rows):
    n=len(rows);wins=sum(r['winner']==0 for r in rows);draw=sum(r['winner']=='draw' for r in rows)
    turns=[r['rounds'] for r in rows]
    return dict(samples=n,winRate=round(wins/n,5),lossRate=round((n-wins-draw)/n,5),drawRate=round(draw/n,5),win95CI=wilson(wins,n),draw95CI=wilson(draw,n),roundMedian=statistics.median(turns),roundP90=percentile(turns,.9),roundP95=percentile(turns,.95),limit60=draw,meanEnergySpent=round(statistics.mean(r['cost0']+r['cost1'] for r in rows),3))
def sequences():
    rows=[]
    for seq in [('charge','quick'),('quick','guard1'),('charge','charge')]:
        for hit in [False,True]:
            st=initial();st['players'][1]['energy']=5
            for act in seq:
                enemy='wave1' if hit and act=='quick' else 'guard1';st=resolve(st,[act,enemy])['next']
            rows.append(dict(sequence=' → '.join(seq),hitQuick=hit,energy=st['players'][0]['energy'],blocked=st['players'][0]['blocked']))
    return rows

def main():
    p=argparse.ArgumentParser();p.add_argument('--seeds',type=int,default=40);p.add_argument('--search-seeds',type=int,default=5);args=p.parse_args();t=time.time()
    original={x:SKILLS[x]['cost'] for x in ['guard2','guard3','reflect2']};candidates=[('initial',original),('cheap-guard',{'guard2':0,'guard3':1,'reflect2':2}),('costly-reflect',{'guard2':1,'guard3':2,'reflect2':3})];search=[]
    for name,costs in candidates:
        for x,c in costs.items():SKILLS[x]['cost']=c
        rows=[]
        for a,b in itertools.product(STRATEGIES,repeat=2):
            for seed in range(args.search_seeds):rows.append(run_match('advanced',a,b,173+seed*97,5,ALL))
        search.append(dict(candidate=name,costs=costs,summary=summarize(rows),byStrategy={a:summarize([r for r in rows if r['a']==a]) for a in STRATEGIES}))
        print('search',name,len(rows),'matches',flush=True)
    for x,c in original.items():SKILLS[x]['cost']=c
    metrics=newmetrics();rows=[];scenarios=[('basic1',1,BASIC),('basic3',3,BASIC),('advanced5',5,ALL)]
    for name,hp,skills in scenarios:
        for a,b in itertools.product(STRATEGIES,repeat=2):
            for seed in range(args.seeds):
                rows.append(run_match(name,a,b,173+seed*97,hp,skills,metrics=metrics))
                rows.append(run_match(name,b,a,173+seed*97,hp,skills,metrics=metrics,swapStreams=True))
        print('final',name,flush=True)
    for level in range(8):
        player=BASIC+UNLOCK[:level];enemy=BASIC+UNLOCK[:min(7,level+1)]
        for a in STRATEGIES:
            for seed in range(args.seeds):
                # Both orientations preserve the real asymmetric skill sets.
                rows.append(run_match('story'+str(level+1),a,'mixed',173+seed*97,3,player,enemy,metrics=metrics))
                rows.append(run_match('story'+str(level+1)+'-swap','mixed',a,173+seed*97,3,enemy,player,metrics=metrics,swapStreams=True))
    for hp,start,a,b in itertools.product([1,3,5],[(0,3),(0,5),(1,8),(3,0),(5,0),(8,1)],['resource','history','mixed'],['attack','defense','mixed']):
        for seed in range(max(5,args.seeds//4)):rows.append(run_match(f'stress-hp{hp}',a,b,173+seed*97,hp,ALL,start=start,metrics=metrics))
    with (OUT/'balance-matches.csv').open('w') as f:
        w=csv.DictWriter(f,fieldnames=rows[0].keys());w.writeheader();w.writerows(rows)
    summaries={name:summarize([r for r in rows if r['scenario']==name]) for name in sorted(set(r['scenario'] for r in rows))}
    opportunity={a:dict(selected=metrics['selected'][a],available=metrics['available'][a],rate=round(metrics['selected'][a]/max(1,metrics['available'][a]),5),energySpent=metrics['energySpent'][a]) for a in ALL}
    thresholds={k:dict(observed=sum(r[k] is not None for r in rows),median=statistics.median([r[k] for r in rows if r[k] is not None])) for k in ['first3_0','first5_0','actualWave2_0','actualWave3_0']}
    bystrategy={name:{a:summarize([r for r in rows if r['scenario']==name and r['a']==a]) for a in STRATEGIES} for name,_,_ in scenarios}
    output=dict(version=CONFIG['version'],seeds=[173+i*97 for i in range(args.seeds)],totalMatches=len(rows),seconds=round(time.time()-t,2),search=search,adopted='initial',summaries=summaries,opportunity=opportunity,thresholds=thresholds,byStrategy=bystrategy,metrics=metrics,sequences=sequences())
    (OUT/'balance-results.json').write_text(json.dumps(output,ensure_ascii=False,indent=2));print('done',len(rows),round(time.time()-t,1),'seconds',flush=True)
if __name__=='__main__':main()
