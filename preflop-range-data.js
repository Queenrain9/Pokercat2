/*
 * PokerCat Preflop Range data layer
 * --------------------------------
 * UI code should consume this module through getChart/getOptions only.
 * Replace the baseline scoring rules or add exact solver packs here without
 * changing poker-tools.js.
 */
(function(){
  const RANKS=['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
  const RANK_VALUE={A:14,K:13,Q:12,J:11,T:10,'9':9,'8':8,'7':7,'6':6,'5':5,'4':4,'3':3,'2':2};

  const OPTIONS={
    formats:['MTT','Cash'],
    players:[9,8,6],
    stacks:{
      MTT:[60,40,25,20,15],
      Cash:[100,60,40]
    },
    positions:{
      9:['UTG','UTG+1','UTG+2','LJ','HJ','CO','BTN','SB','BB'],
      8:['UTG','UTG+1','LJ','HJ','CO','BTN','SB','BB'],
      6:['UTG','HJ','CO','BTN','SB','BB']
    },
    situations:['RFI','vs RFI','3Bet','vs 3Bet']
  };

  const LABELS={
    RFI:{primary:'Raise',mix:'Mix',fold:'Fold'},
    'vs RFI':{primary:'Continue',mix:'Mix',fold:'Fold'},
    '3Bet':{primary:'3-Bet',mix:'Mix',fold:'Fold'},
    'vs 3Bet':{primary:'Continue',mix:'Mix',fold:'Fold'}
  };

  const BASE_THRESHOLD={
    RFI:55,
    'vs RFI':67,
    '3Bet':74,
    'vs 3Bet':76
  };

  const POSITION_ADJUST={
    UTG:12,'UTG+1':10,'UTG+2':9,LJ:7,HJ:4,CO:0,BTN:-5,SB:-2,BB:-7
  };

  const STACK_ADJUST={
    MTT:{60:2,40:0,25:-1,20:-2,15:-3},
    Cash:{100:3,60:1,40:0}
  };

  const FORMAT_ADJUST={MTT:0,Cash:1};
  const PLAYER_ADJUST={9:2,8:1,6:-1};

  function matrixLabels(){
    const labels=[];
    for(let r=0;r<13;r++){
      for(let c=0;c<13;c++){
        labels.push(r===c?RANKS[r]+RANKS[c]:(r<c?RANKS[r]+RANKS[c]+'s':RANKS[c]+RANKS[r]+'o'));
      }
    }
    return labels;
  }

  const MATRIX_LABELS=matrixLabels();

  function parseHand(label){
    const a=label[0],b=label[1],suffix=label[2]||'';
    return {
      a,b,
      high:Math.max(RANK_VALUE[a],RANK_VALUE[b]),
      low:Math.min(RANK_VALUE[a],RANK_VALUE[b]),
      pair:a===b,
      suited:suffix==='s',
      offsuit:suffix==='o'
    };
  }

  function handScore(label){
    const hand=parseHand(label);
    if(hand.pair)return Math.min(100,55+(hand.high*3.2));
    const gap=Math.max(0,hand.high-hand.low-1);
    const connected=Math.max(0,5-(gap*1.25));
    const broadway=(hand.high>=10&&hand.low>=10)?5:0;
    const aceBonus=hand.high===14?3:0;
    const suitedBonus=hand.suited?5:0;
    const wheelBonus=(hand.high===14&&hand.low<=5&&hand.suited)?2:0;
    const offsuitPenalty=hand.offsuit&&hand.low<=7?2:0;
    return Math.max(0,Math.min(100,
      (hand.high*4.1)+(hand.low*2.2)+connected+broadway+aceBonus+suitedBonus+wheelBonus-offsuitPenalty
    ));
  }

  function validPositions(players,situation){
    const all=[...(OPTIONS.positions[players]||OPTIONS.positions[8])];
    if(situation==='RFI'||situation==='vs 3Bet')return all.filter(p=>p!=='BB');
    if(situation==='vs RFI'||situation==='3Bet')return all.filter((p,i)=>i>0);
    return all;
  }

  function normalize(input){
    const format=OPTIONS.formats.includes(input?.format)?input.format:'MTT';
    const players=OPTIONS.players.includes(Number(input?.players))?Number(input.players):8;
    const stacks=OPTIONS.stacks[format];
    const stack=stacks.includes(Number(input?.stack))?Number(input.stack):stacks[0];
    const situation=OPTIONS.situations.includes(input?.situation)?input.situation:'RFI';
    const positions=validPositions(players,situation);
    const position=positions.includes(input?.position)?input.position:(positions.includes('BTN')?'BTN':positions[0]);
    return {format,players,stack,position,situation};
  }

  function thresholdFor(filters){
    const f=normalize(filters);
    let threshold=BASE_THRESHOLD[f.situation]
      +(POSITION_ADJUST[f.position]||0)
      +(STACK_ADJUST[f.format]?.[f.stack]||0)
      +(FORMAT_ADJUST[f.format]||0)
      +(PLAYER_ADJUST[f.players]||0);

    // Blind defence is wider, but shallow MTT 3-bet/continue decisions tighten
    // marginal offsuit hands compared with late-position opening ranges.
    if(f.position==='BB'&&(f.situation==='vs RFI'||f.situation==='3Bet'))threshold-=2;
    if(f.format==='MTT'&&f.stack<=20&&(f.situation==='3Bet'||f.situation==='vs 3Bet'))threshold+=2;
    return Math.max(44,Math.min(90,threshold));
  }

  function classify(label,filters){
    const score=handScore(label);
    const threshold=thresholdFor(filters);
    const hand=parseHand(label);
    let adjusted=score;

    if(filters.situation==='RFI'&&hand.suited)adjusted+=1.5;
    if(filters.situation==='3Bet'&&hand.pair)adjusted+=2;
    if(filters.situation==='vs RFI'&&filters.position==='BB'&&hand.suited)adjusted+=2;
    if(filters.situation==='vs 3Bet'&&hand.offsuit&&hand.low<10)adjusted-=3;

    const premium=(hand.pair&&hand.high>=12)||(hand.high===14&&hand.low>=13);
    if(premium)return {action:'primary',frequency:100,score:adjusted};

    const mixBand=3.25;
    if(adjusted>=threshold+mixBand)return {action:'primary',frequency:100,score:adjusted};
    if(adjusted>=threshold-mixBand){
      const frequency=Math.max(25,Math.min(75,Math.round((50+((adjusted-threshold)/mixBand)*25)/5)*5));
      return {action:'mix',frequency,score:adjusted};
    }
    return {action:'fold',frequency:0,score:adjusted};
  }

  function getChart(input){
    const filters=normalize(input);
    const cells=MATRIX_LABELS.map(label=>({label,...classify(label,filters)}));
    const playable=cells.filter(c=>c.action!=='fold').length;
    const pure=cells.filter(c=>c.action==='primary').length;
    return {
      filters,
      labels:LABELS[filters.situation],
      cells,
      stats:{
        playableCombos:playable,
        pureCombos:pure,
        matrixCoverage:Math.round((playable/169)*100)
      },
      source:'PokerCat baseline v1',
      note:'교체 가능한 기본 전략 데이터 · 솔버/GTO 보장 데이터 아님'
    };
  }

  function getOptions(input={}){
    const format=OPTIONS.formats.includes(input.format)?input.format:'MTT';
    const players=OPTIONS.players.includes(Number(input.players))?Number(input.players):8;
    const situation=OPTIONS.situations.includes(input.situation)?input.situation:'RFI';
    return {
      formats:[...OPTIONS.formats],
      players:[...OPTIONS.players],
      stacks:[...OPTIONS.stacks[format]],
      positions:validPositions(players,situation),
      situations:[...OPTIONS.situations]
    };
  }

  window.PREFLOP_RANGE_DATA={
    version:'1.0.0',
    ranks:[...RANKS],
    getOptions,
    getChart
  };
})();
