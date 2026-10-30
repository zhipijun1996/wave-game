import {BASIC,type SkillId} from './rules';
export const STORY=[
 {name:'小冲',title:'总比别人快半拍',skill:'quick',personality:'quick',color:'#d08059',intro:'放学啦！先别急着回家。看我一口气，攒出两份气！',hint:'快充受击不加气，下一回合还不能充气。看准时机再用。',outro:'嘿，被你看穿了！快，也得挑时候。'},
 {name:'小镜',title:'把你的波，还给你',skill:'reflect1',personality:'reflect',color:'#748aaa',intro:'眼镜可不是摆设。我能看清你的每一颗小波。',hint:'反弹花 1 气，可送回小波；充气时，对手的反弹就落空了。',outro:'这次算你厉害。交叠手指，记住这个姿势。'},
 {name:'阿轰',title:'操场上的小旋风',skill:'wave2',personality:'big',color:'#cb7955',intro:'小波太轻了！踏稳脚步，再把气推到掌心。',hint:'中波花 3 气、伤害 2。普通防御挡不住；小波可削去 1 点伤害。',outro:'轰！这股力量，交给你了。'},
 {name:'盾仔',title:'稳稳当当，也很帅',skill:'guard2',personality:'guard',color:'#7d9575',intro:'别光顾着猛冲。脚跟稳一点，双手竖起来。',hint:'中防花 1 气，可挡小波和中波。对方没进攻也会扣气。',outro:'你站得越来越稳了。守住，才有下一次机会。'},
 {name:'回回',title:'借一点力，转一个弯',skill:'reflect2',personality:'reflect',color:'#9b83aa',intro:'接住，缩一下，再送回去。中波也可以转弯！',hint:'中反弹花 2 气，可反送小波或中波；大波会击穿。',outro:'漂亮！你也会借力啦。'},
 {name:'大壮',title:'今天的风，有点大',skill:'wave3',personality:'big',color:'#b88d4d',intro:'这一招得全身一起发力。可别只伸伸胳膊！',hint:'大波花 5 气、伤害 3。用大防挡住，或用自己的波削弱它。',outro:'呼——肩膀放松。现在你也能掀起大风。'},
 {name:'铁帽',title:'最可靠的一道防线',skill:'guard3',personality:'guard',color:'#78928b',intro:'最后一招。帽子保护脑袋，大防保护你。',hint:'大防花 2 气，可挡所有波。留意空防的气量代价。',outro:'十招齐了。去找操场高手，来场毕业战吧！'},
 {name:'操场高手',title:'拍拍手，我们都长大了',skill:null,personality:'mixed',color:'#cc9259',intro:'从第一颗小波到现在，你学得真快。来，不留遗憾地打一场！',hint:'完整十招毕业战。猜招、攒气、反击，把你学会的都用上。',outro:'毕业快乐！放学后的操场，永远有你的位置。'}
] as const;
export function learned(completed:number):SkillId[]{return [...BASIC,...STORY.slice(0,Math.min(7,completed)).map(x=>x.skill).filter((x):x is Exclude<typeof x,null>=>!!x)] as SkillId[];}
export const SKINS=[{id:'plain',name:'初见',desc:'一身墨线，满身好奇。',at:0,color:'#338b86'},{id:'ribbon',name:'追风发带',desc:'跑起来，风就在身后。',at:2,color:'#d08059'},{id:'cat',name:'猫耳同学',desc:'今天也要轻轻巧巧地赢。',at:5,color:'#8f82ad'},{id:'cape',name:'操场传说',desc:'每个普通人，都能发光。',at:8,color:'#c4a04b'}];
