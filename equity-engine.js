(function(){
  const RANKS=['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
  const SUITS=['s','h','d','c'];
  const EXACT_LIMIT=80000;
  const MONTE_CARLO_SAMPLES=25000;

  function rankIndex(r){return RANKS.indexOf(r)}
  function fullDeck(){const d=[];for(const r of RANKS)for(const s of SUITS)d.push(r+s);return d}
  function comboKey(a,b){return [a,b].sort().join('|')}

  function addClass(out,r1,r2,type=''){
    if(r1===r2){
      for(let i=0;i<SUITS.length;i++)for(let j=i+1;j<SUITS.length;j++)out.push([r1+SUITS[i],r2+SUITS[j]]);
      return;
    }
    for(const s1 of SUITS)for(const s2 of SUITS){
      if(type==='S'&&s1!==s2)continue;
      if(type==='O'&&s1===s2)continue;
      out.push([r1+s1,r2+s2]);
    }
  }

  function expandSimple(token){
    const out=[];
    let m=token.match(/^([AKQJT2-9])\1(\+)?$/);
    if(m){
      const start=rankIndex(m[1]);
      (m[2]?RANKS.slice(0,start+1):[m[1]]).forEach(r=>addClass(out,r,r));
      return out;
    }
    m=token.match(/^([AKQJT2-9])([AKQJT2-9])([SO])?(\+)?$/);
    if(!m||m[1]===m[2])return [];
    const r1=m[1],r2=m[2],type=m[3]||'',plus=Boolean(m[4]);
    const i1=rankIndex(r1),i2=rankIndex(r2);
    if(i1<0||i2<0||i1>=i2)return [];
    if(plus){for(let j=i2;j>i1;j--)addClass(out,r1,RANKS[j],type)}
    else addClass(out,r1,r2,type);
    return out;
  }

  function expandToken(token){
    if(!token.includes('-'))return expandSimple(token);
    const parts=token.split('-');
    if(parts.length!==2)return [];
    const a=parts[0].match(/^([AKQJT2-9])\1$/),b=parts[1].match(/^([AKQJT2-9])\1$/);
    if(a&&b){
      const start=rankIndex(a[1]),end=rankIndex(b[1]),step=start<=end?1:-1,out=[];
      for(let i=start;;i+=step){addClass(out,RANKS[i],RANKS[i]);if(i===end)break}
      return out;
    }
    const h1=parts[0].match(/^([AKQJT2-9])([AKQJT2-9])([SO])?$/),h2=parts[1].match(/^([AKQJT2-9])([AKQJT2-9])([SO])?$/);
    if(!h1||!h2||h1[1]!==h2[1]||(h1[3]||'')!==(h2[3]||''))return [];
    const first=h1[1],type=h1[3]||'',start=rankIndex(h1[2]),end=rankIndex(h2[2]),firstIdx=rankIndex(first);
    if(start<=firstIdx||end<=firstIdx)return [];
    const step=start<=end?1:-1,out=[];
    for(let i=start;;i+=step){addClass(out,first,RANKS[i],type);if(i===end)break}
    return out;
  }

  function parseRange(text,blockedCards=[]){
    const normalized=String(text||'').toUpperCase().replace(/10/g,'T').trim().replace(/\s*,\s*/g,',').replace(/\s+/g,',').replace(/,+/g,',');
    const tokens=normalized.split(',').filter(Boolean);
    if(!tokens.length)throw new Error('Villain Range를 입력해 주세요.');
    const blocked=new Set(blockedCards),seen=new Set(),combos=[],invalid=[];
    for(const token of tokens){
      const expanded=expandToken(token);
      if(!expanded.length){invalid.push(token);continue}
      for(const combo of expanded){
        if(combo.some(c=>blocked.has(c)))continue;
        const key=comboKey(combo[0],combo[1]);
        if(seen.has(key))continue;
        seen.add(key);combos.push(combo);
      }
    }
    if(invalid.length)throw new Error('지원하지 않는 Range 표기: '+invalid.join(', '));
    if(!combos.length)throw new Error('현재 Hero/Board와 겹치지 않는 Villain combo가 없습니다.');
    return combos;
  }

  function cardValue(card){return 14-rankIndex(card[0])}
  function compareScore(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){const av=a[i]||0,bv=b[i]||0;if(av!==bv)return av>bv?1:-1}return 0}
  function evaluateFive(cards){
    const values=cards.map(cardValue).sort((a,b)=>b-a),counts=new Map();
    values.forEach(v=>counts.set(v,(counts.get(v)||0)+1));
    const groups=[...counts.entries()].sort((a,b)=>b[1]-a[1]||b[0]-a[0]);
    const flush=cards.every(c=>c[1]===cards[0][1]);
    const uniq=[...new Set(values)];if(uniq.includes(14))uniq.push(1);
    let straightHigh=0,run=1;
    for(let i=1;i<uniq.length;i++){if(uniq[i-1]-1===uniq[i]){run++;if(run>=5){straightHigh=uniq[i-4];break}}else run=1}
    if(flush&&straightHigh)return [8,straightHigh];
    if(groups[0][1]===4)return [7,groups[0][0],groups[1][0]];
    if(groups[0][1]===3&&groups[1]?.[1]===2)return [6,groups[0][0],groups[1][0]];
    if(flush)return [5,...values];
    if(straightHigh)return [4,straightHigh];
    if(groups[0][1]===3)return [3,groups[0][0],...groups.slice(1).map(g=>g[0]).sort((a,b)=>b-a)];
    const pairs=groups.filter(g=>g[1]===2).map(g=>g[0]).sort((a,b)=>b-a);
    if(pairs.length>=2){const kicker=groups.filter(g=>g[1]===1).map(g=>g[0]).sort((a,b)=>b-a)[0]||0;return [2,pairs[0],pairs[1],kicker]}
    if(pairs.length===1){const kickers=groups.filter(g=>g[1]===1).map(g=>g[0]).sort((a,b)=>b-a);return [1,pairs[0],...kickers]}
    return [0,...values];
  }

  function bestScore(cards){
    let best=null;
    for(let a=0;a<cards.length-4;a++)for(let b=a+1;b<cards.length-3;b++)for(let c=b+1;c<cards.length-2;c++)for(let d=c+1;d<cards.length-1;d++)for(let e=d+1;e<cards.length;e++){
      const score=evaluateFive([cards[a],cards[b],cards[c],cards[d],cards[e]]);
      if(!best||compareScore(score,best)>0)best=score;
    }
    return best;
  }

  function choose(n,k){if(k<0||k>n)return 0;k=Math.min(k,n-k);let x=1;for(let i=1;i<=k;i++)x=x*(n-k+i)/i;return Math.round(x)}
  function enumerate(deck,k,visit,start=0,pick=[]){if(k===0){visit(pick);return}for(let i=start;i<=deck.length-k;i++){pick.push(deck[i]);enumerate(deck,k-1,visit,i+1,pick);pick.pop()}}
  function seedFromText(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function seededRandom(seed){let t=seed>>>0;return()=>{t+=0x6D2B79F5;let r=t;r=Math.imul(r^r>>>15,r|1);r^=r+Math.imul(r^r>>>7,r|61);return((r^r>>>14)>>>0)/4294967296}}
  function randomRunout(deck,k,rand){const arr=deck.slice();for(let i=0;i<k;i++){const j=i+Math.floor(rand()*(arr.length-i));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr.slice(0,k)}

  function calculate({hero,villainCombos,board=[],seedText=''}){
    if(!Array.isArray(hero)||hero.length!==2||hero.some(x=>!x))throw new Error('Hero Hand 2장을 선택해 주세요.');
    if(!Array.isArray(board)||board.length>5)throw new Error('Board는 최대 5장입니다.');
    const fixed=[...hero,...board];
    if(new Set(fixed).size!==fixed.length)throw new Error('Hero와 Board에 중복 카드가 있습니다.');
    const validVillains=(villainCombos||[]).filter(combo=>combo.length===2&&!combo.some(c=>fixed.includes(c))&&combo[0]!==combo[1]);
    if(!validVillains.length)throw new Error('계산 가능한 Villain hand/combo가 없습니다.');
    const missing=5-board.length,deckSize=52-fixed.length-2,scenarioCount=validVillains.length*choose(deckSize,missing);
    let wins=0,ties=0,losses=0,total=0;
    const judge=(villain,runout)=>{
      const complete=[...board,...runout];
      const cmp=compareScore(bestScore([...hero,...complete]),bestScore([...villain,...complete]));
      if(cmp>0)wins++;else if(cmp<0)losses++;else ties++;total++;
    };
    if(scenarioCount<=EXACT_LIMIT){
      for(const villain of validVillains){const blocked=new Set([...fixed,...villain]),deck=fullDeck().filter(c=>!blocked.has(c));enumerate(deck,missing,r=>judge(villain,r))}
      return {method:'exact',wins,ties,losses,total,rangeCombos:validVillains.length,heroEquity:(wins+ties/2)/total*100,villainEquity:(losses+ties/2)/total*100};
    }
    const rand=seededRandom(seedFromText(seedText||JSON.stringify({hero,board,validVillains})));
    for(let i=0;i<MONTE_CARLO_SAMPLES;i++){
      const villain=validVillains[Math.floor(rand()*validVillains.length)],blocked=new Set([...fixed,...villain]),deck=fullDeck().filter(c=>!blocked.has(c));
      judge(villain,randomRunout(deck,missing,rand));
    }
    return {method:'monte-carlo',wins,ties,losses,total,rangeCombos:validVillains.length,heroEquity:(wins+ties/2)/total*100,villainEquity:(losses+ties/2)/total*100};
  }

  window.PokerCatEquityEngine={RANKS,SUITS,parseRange,calculate};
})();
