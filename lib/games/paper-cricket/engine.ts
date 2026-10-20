export type Outcome=0|1|2|3|4|6|'W';
export const OUTCOMES:Outcome[]=[0,1,2,3,4,6,'W'];
export const WEIGHTS=[20,25,15,5,15,8,12]; // configured distribution; never changed by difficulty
export interface Match{innings:1|2;batting:0|1;runs:[number,number];wickets:[number,number];balls:[number,number];log:Outcome[];maxBalls:number;maxWickets:number;done:boolean;winner:0|1|'tie'|null}
export const newMatch=(maxBalls=12,maxWickets=2):Match=>({innings:1,batting:0,runs:[0,0],wickets:[0,0],balls:[0,0],log:[],maxBalls,maxWickets,done:false,winner:null});
export function roll(rnd=Math.random,w=WEIGHTS):Outcome{let x=rnd()*w.reduce((a,b)=>a+b,0);for(let i=0;i<w.length;i++){x-=w[i];if(x<0)return OUTCOMES[i]}return OUTCOMES[w.length-1]}
export function applyBall(m:Match,o:Outcome):Match{
 if(m.done)return m;const b=m.batting;
 const runs=[...m.runs] as [number,number],wickets=[...m.wickets] as [number,number],balls=[...m.balls] as [number,number];
 if(o==='W')wickets[b]++;else runs[b]+=o;balls[b]++;
 const n:Match={...m,runs,wickets,balls,log:[...m.log,o]};
 const over=balls[b]>=m.maxBalls||wickets[b]>=m.maxWickets;
 if(m.innings===1){if(over){n.innings=2;n.batting=1;n.log=[]}}
 else if(over||runs[1]>runs[0]){n.done=true;n.winner=runs[1]>runs[0]?1:runs[1]<runs[0]?0:'tie'}
 return n}
