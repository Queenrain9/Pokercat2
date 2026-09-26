(function(){
  'use strict';

  const VERSION=1;
  const RANKS='23456789TJQKA'.split('');
  const SUITS=['s','h','d','c'];
  const STREETS=['preflop','flop','turn','river'];
  const STREET_LABEL={preflop:'PRE-FLOP',flop:'FLOP',turn:'TURN',river:'RIVER',showdown:'SHOWDOWN',complete:'COMPLETE'};

  function asInt(value,fallback=0){
    const n=Number(value);
    return Number.isFinite(n)?Math.max(0,Math.floor(n)):fallback;
  }
  function makeDeck(){
    const deck=[];
    for(const r of RANKS)for(const s of SUITS)deck.push(r+s);
    return deck;
  }
  function shuffle(deck,rng=Math.random){
    const out=deck.slice();
    for(let i=out.length-1;i>0;i--){
      const j=Math.floor(rng()*(i+1));
      [out[i],out[j]]=[out[j],out[i]];
    }
    return out;
  }
  function occupied(game){
    return game.players.filter(Boolean);
  }
  function livePlayers(game){
    return occupied(game).filter(p=>!p.folded);
  }
  function contestingPlayers(game){
    return occupied(game).filter(p=>!p.folded&&p.stack>=0);
  }
  function activeSeats(game){
    return occupied(game).filter(p=>p.stack>0).map(p=>p.seatIndex);
  }
  function nextSeat(game,from,predicate){
    const n=game.players.length;
    if(!n)return null;
    for(let step=1;step<=n;step++){
      const seat=(from+step+n)%n;
      const player=game.players[seat];
      if(player&&(!predicate||predicate(player,seat)))return seat;
    }
    return null;
  }
  function orderedFrom(game,from,seats){
    const set=new Set(seats);
    const out=[];
    let cursor=from;
    for(let i=0;i<game.players.length;i++){
      cursor=(cursor+1)%game.players.length;
      if(set.has(cursor))out.push(cursor);
    }
    return out;
  }
  function sumPot(game){
    return occupied(game).reduce((sum,p)=>sum+asInt(p.totalContribution),0);
  }
  function takeCard(game){
    if(!game.deck.length)throw new Error('Deck is empty.');
    return game.deck.shift();
  }
  function burn(game){
    const card=takeCard(game);
    game.burnCards.push(card);
    return card;
  }
  function log(game,entry){
    game.actionLog.push({at:new Date().toISOString(),street:game.street,...entry});
    if(game.actionLog.length>200)game.actionLog=game.actionLog.slice(-200);
  }
  function pay(game,seat,amount,{street=true,kind='chips'}={}){
    const p=game.players[seat];
    if(!p)return 0;
    const paid=Math.min(p.stack,asInt(amount));
    p.stack-=paid;
    p.totalContribution+=paid;
    if(street)p.streetContribution+=paid;
    if(p.stack===0)p.allIn=true;
    if(paid>0)log(game,{seat,action:kind,amount:paid});
    return paid;
  }
  function positionNames(count){
    if(count<=2)return ['BTN/SB','BB'];
    if(count===3)return ['BTN','SB','BB'];
    if(count===4)return ['BTN','SB','BB','CO'];
    if(count===5)return ['BTN','SB','BB','UTG','CO'];
    if(count===6)return ['BTN','SB','BB','UTG','HJ','CO'];
    if(count===7)return ['BTN','SB','BB','UTG','LJ','HJ','CO'];
    if(count===8)return ['BTN','SB','BB','UTG','UTG+1','LJ','HJ','CO'];
    return ['BTN','SB','BB','UTG','UTG+1','MP','LJ','HJ','CO'];
  }
  function assignPositions(game){
    occupied(game).forEach(p=>p.position='');
    const seats=activeSeats(game);
    if(!seats.length)return;
    const ordered=[game.buttonSeat,...orderedFrom(game,game.buttonSeat,seats.filter(s=>s!==game.buttonSeat))];
    const names=positionNames(ordered.length);
    ordered.forEach((seat,index)=>{if(game.players[seat])game.players[seat].position=names[index]||('P'+(index+1));});
  }
  function normalizeSettings(settings={}){
    const sb=asInt(settings.blinds?.smallBlind,100);
    const bb=Math.max(sb+1,asInt(settings.blinds?.bigBlind,Math.max(200,sb*2)));
    return {
      gameType:settings.gameType||'NLH',
      startingChips:Math.max(bb,asInt(settings.startingChips,20000)),
      blinds:{smallBlind:sb,bigBlind:bb},
      ante:{
        mode:settings.ante?.mode||'none',
        amount:asInt(settings.ante?.amount,0)
      }
    };
  }
  function createGame({tableId,seats,settings,buttonSeat=null,rng=Math.random}={}){
    const cfg=normalizeSettings(settings);
    const seatList=Array.isArray(seats)?seats:[];
    const players=seatList.map((userId,seatIndex)=>userId?{
      seatIndex,userId,stack:cfg.startingChips,startingStack:cfg.startingChips,
      holeCards:[],folded:false,allIn:false,streetContribution:0,totalContribution:0,
      position:'',lastAction:null
    }:null);
    const game={
      version:VERSION,tableId:tableId||'table',settings:cfg,
      status:'ready',handNumber:0,buttonSeat:buttonSeat,
      smallBlindSeat:null,bigBlindSeat:null,street:'preflop',
      deck:[],burnCards:[],board:[],players,
      currentBet:0,lastFullRaiseSize:cfg.blinds.bigBlind,
      actingSeat:null,needsAction:[],actedSinceFullRaise:[],
      actionLog:[],handResult:null,revealedSeats:[],startedAt:null,completedAt:null
    };
    return startNextHand(game,{rng,firstButtonSeat:buttonSeat});
  }

  function chooseButton(game,firstButtonSeat){
    const eligible=activeSeats(game);
    if(eligible.length<2)return null;
    if(game.handNumber===0){
      if(firstButtonSeat!=null&&eligible.includes(firstButtonSeat))return firstButtonSeat;
      return eligible[0];
    }
    return nextSeat(game,game.buttonSeat,p=>p.stack>0);
  }
  function postAntes(game){
    const {mode,amount}=game.settings.ante;
    if(!amount||mode==='none')return;
    if(mode==='all-player'){
      activeSeats(game).forEach(seat=>pay(game,seat,amount,{street:false,kind:'ante'}));
    }else if(mode==='bb-ante'&&game.bigBlindSeat!=null){
      pay(game,game.bigBlindSeat,amount,{street:false,kind:'bb-ante'});
    }
  }
  function postBlinds(game){
    const seats=activeSeats(game);
    const headsUp=seats.length===2;
    game.smallBlindSeat=headsUp?game.buttonSeat:nextSeat(game,game.buttonSeat,p=>p.stack>0);
    game.bigBlindSeat=nextSeat(game,game.smallBlindSeat,p=>p.stack>0);
    postAntes(game);
    pay(game,game.smallBlindSeat,game.settings.blinds.smallBlind,{street:true,kind:'small-blind'});
    pay(game,game.bigBlindSeat,game.settings.blinds.bigBlind,{street:true,kind:'big-blind'});
    game.currentBet=game.settings.blinds.bigBlind;
    game.lastFullRaiseSize=game.settings.blinds.bigBlind;
  }
  function dealHoleCards(game){
    let first=nextSeat(game,game.buttonSeat,p=>p.stack>=0&&!p.folded);
    if(first==null)return;
    const live=occupied(game).filter(p=>p.startingStack>0);
    for(let round=0;round<2;round++){
      let seat=first;
      for(let i=0;i<game.players.length;i++){
        const p=game.players[seat];
        if(p&&p.startingStack>0)p.holeCards.push(takeCard(game));
        seat=(seat+1)%game.players.length;
      }
    }
  }
  function resetForHand(game){
    occupied(game).forEach(p=>{
      p.startingStack=p.stack;
      p.holeCards=[];
      p.folded=p.stack<=0;
      p.allIn=p.stack<=0;
      p.streetContribution=0;
      p.totalContribution=0;
      p.position='';
      p.lastAction=null;
    });
    game.smallBlindSeat=null;
    game.bigBlindSeat=null;
    game.street='preflop';
    game.deck=[];
    game.burnCards=[];
    game.board=[];
    game.currentBet=0;
    game.lastFullRaiseSize=game.settings.blinds.bigBlind;
    game.actingSeat=null;
    game.needsAction=[];
    game.actedSinceFullRaise=[];
    game.actionLog=[];
    game.handResult=null;
    game.revealedSeats=[];
    game.completedAt=null;
  }
  function startNextHand(game,{rng=Math.random,firstButtonSeat=null}={}){
    if(!game||!Array.isArray(game.players))throw new Error('Invalid game state.');
    const canPlay=activeSeats(game);
    if(canPlay.length<2){
      game.status='game-complete';
      game.actingSeat=null;
      return game;
    }
    const button=chooseButton(game,firstButtonSeat);
    resetForHand(game);
    game.buttonSeat=button;
    game.handNumber+=1;
    game.status='hand-in-progress';
    game.startedAt=new Date().toISOString();
    game.deck=shuffle(makeDeck(),rng);
    assignPositions(game);
    postBlinds(game);
    dealHoleCards(game);

    const eligible=occupied(game).filter(p=>!p.folded&&!p.allIn).map(p=>p.seatIndex);
    game.needsAction=eligible.slice();
    game.actedSinceFullRaise=[];
    const headsUp=activeSeats(game).length===2;
    const firstActor=headsUp?game.buttonSeat:nextSeat(game,game.bigBlindSeat,p=>!p.folded&&!p.allIn);
    game.actingSeat=pickActor(game,firstActor==null?game.buttonSeat:(firstActor-1+game.players.length)%game.players.length);
    log(game,{action:'hand-start',buttonSeat:game.buttonSeat,smallBlindSeat:game.smallBlindSeat,bigBlindSeat:game.bigBlindSeat});
    autoAdvanceIfNoBetting(game);
    return game;
  }

  function pickActor(game,from){
    if(!game.needsAction.length)return null;
    const needed=new Set(game.needsAction);
    return nextSeat(game,from,(p,seat)=>needed.has(seat)&&!p.folded&&!p.allIn);
  }
  function removeNeed(game,seat){
    game.needsAction=game.needsAction.filter(s=>s!==seat);
  }
  function eligibleToAct(game){
    return occupied(game).filter(p=>!p.folded&&!p.allIn).map(p=>p.seatIndex);
  }
  function finishIfSingle(game){
    const live=livePlayers(game);
    if(live.length!==1)return false;
    const winner=live[0];
    const pot=sumPot(game);
    winner.stack+=pot;
    game.status='hand-complete';
    game.street='complete';
    game.actingSeat=null;
    game.needsAction=[];
    game.completedAt=new Date().toISOString();
    game.handResult={
      type:'uncontested',totalPot:pot,winnerSeats:[winner.seatIndex],
      payouts:{[winner.seatIndex]:pot},pots:[{amount:pot,winnerSeats:[winner.seatIndex]}]
    };
    log(game,{action:'win-uncontested',seat:winner.seatIndex,amount:pot});
    return true;
  }
  function dealStreet(game,nextStreet){
    occupied(game).forEach(p=>p.streetContribution=0);
    game.currentBet=0;
    game.lastFullRaiseSize=game.settings.blinds.bigBlind;
    game.actedSinceFullRaise=[];
    if(nextStreet==='flop'){
      burn(game);game.board.push(takeCard(game),takeCard(game),takeCard(game));
    }else if(nextStreet==='turn'||nextStreet==='river'){
      burn(game);game.board.push(takeCard(game));
    }
    game.street=nextStreet;
    game.needsAction=eligibleToAct(game);
    game.actingSeat=pickActor(game,game.buttonSeat);
    log(game,{action:'street-start',street:nextStreet});
  }
  function nextStreetName(street){
    const i=STREETS.indexOf(street);
    return i>=0&&i<STREETS.length-1?STREETS[i+1]:null;
  }
  function advanceStreet(game){
    if(finishIfSingle(game))return;
    const next=nextStreetName(game.street);
    if(!next){
      showdown(game);
      return;
    }
    dealStreet(game,next);
    autoAdvanceIfNoBetting(game);
  }
  function autoAdvanceIfNoBetting(game){
    if(game.status!=='hand-in-progress')return;
    const live=livePlayers(game);
    const actors=live.filter(p=>!p.allIn);
    if(live.length<=1){finishIfSingle(game);return;}
    if(actors.length<=1){
      while(game.board.length<5){
        if(game.board.length===0)dealStreet(game,'flop');
        else if(game.board.length===3)dealStreet(game,'turn');
        else if(game.board.length===4)dealStreet(game,'river');
        else break;
      }
      showdown(game);
      return;
    }
    game.needsAction=game.needsAction.filter(seat=>{
      const p=game.players[seat];
      return p&&!p.folded&&!p.allIn;
    });
    if(!game.needsAction.length)advanceStreet(game);
  }

  function legalActions(game,seat){
    const p=game?.players?.[seat];
    const base={
      canAct:false,canFold:false,canCheck:false,canCall:false,canBet:false,canRaise:false,
      toCall:0,callAmount:0,minBetTo:0,minRaiseTo:0,maxTo:0,raiseAllInOnly:false
    };
    if(!p||game.status!=='hand-in-progress'||game.actingSeat!==seat||p.folded||p.allIn)return base;
    const toCall=Math.max(0,game.currentBet-p.streetContribution);
    const maxTo=p.streetContribution+p.stack;
    const acted=new Set(game.actedSinceFullRaise);
    const out={...base,canAct:true,toCall,callAmount:Math.min(toCall,p.stack),maxTo};
    out.canFold=toCall>0;
    out.canCheck=toCall===0;
    out.canCall=toCall>0&&p.stack>0;

    if(game.currentBet===0&&p.stack>0){
      out.canBet=true;
      out.minBetTo=maxTo<game.settings.blinds.bigBlind?maxTo:game.settings.blinds.bigBlind;
    }else if(game.currentBet>0&&maxTo>game.currentBet&&!acted.has(seat)){
      out.canRaise=true;
      out.minRaiseTo=game.currentBet+game.lastFullRaiseSize;
      if(maxTo<out.minRaiseTo){
        out.minRaiseTo=maxTo;
        out.raiseAllInOnly=true;
      }
    }
    return out;
  }

  function setAfterPassiveAction(game,seat){
    removeNeed(game,seat);
    if(!game.actedSinceFullRaise.includes(seat))game.actedSinceFullRaise.push(seat);
  }
  function setAfterAggression(game,seat,oldCurrentBet,target,fullRaise){
    if(fullRaise){
      game.lastFullRaiseSize=target-oldCurrentBet;
      game.actedSinceFullRaise=[seat];
      game.needsAction=eligibleToAct(game).filter(s=>s!==seat);
    }else{
      if(!game.actedSinceFullRaise.includes(seat))game.actedSinceFullRaise.push(seat);
      const need=new Set(game.needsAction.filter(s=>s!==seat));
      eligibleToAct(game).forEach(s=>{
        if(s!==seat&&game.players[s].streetContribution<target)need.add(s);
      });
      game.needsAction=[...need];
    }
    game.currentBet=Math.max(game.currentBet,target);
  }
  function applyAction(game,seat,action,amount=null){
    const p=game?.players?.[seat];
    const legal=legalActions(game,seat);
    if(!p||!legal.canAct)throw new Error('지금은 이 좌석의 액션 차례가 아닙니다.');
    const type=String(action||'').toLowerCase();

    if(type==='fold'){
      if(!legal.canFold&&legal.canCheck)throw new Error('체크할 수 있는 상황입니다.');
      p.folded=true;p.lastAction='FOLD';
      setAfterPassiveAction(game,seat);
      log(game,{seat,action:'fold'});
    }else if(type==='check'){
      if(!legal.canCheck)throw new Error('체크할 수 없습니다.');
      p.lastAction='CHECK';
      setAfterPassiveAction(game,seat);
      log(game,{seat,action:'check'});
    }else if(type==='call'){
      if(!legal.canCall)throw new Error('콜할 금액이 없습니다.');
      const paid=pay(game,seat,legal.callAmount,{street:true,kind:'call'});
      p.lastAction=p.allIn?'CALL · ALL-IN':'CALL';
      setAfterPassiveAction(game,seat);
      log(game,{seat,action:'call-complete',amount:paid,to:Math.min(game.currentBet,p.streetContribution)});
    }else if(type==='bet'){
      if(!legal.canBet)throw new Error('지금은 베팅할 수 없습니다.');
      const target=asInt(amount);
      if(target<=0||target>legal.maxTo)throw new Error('베팅 금액을 확인해 주세요.');
      if(target<legal.minBetTo&&target!==legal.maxTo)throw new Error('최소 베팅 금액보다 작습니다.');
      const oldCurrent=game.currentBet;
      pay(game,seat,target-p.streetContribution,{street:true,kind:'bet'});
      const actual=p.streetContribution;
      const fullRaise=actual>=game.settings.blinds.bigBlind;
      p.lastAction=p.allIn?'BET · ALL-IN':'BET';
      setAfterAggression(game,seat,oldCurrent,actual,fullRaise);
      log(game,{seat,action:'bet-complete',to:actual,fullRaise});
    }else if(type==='raise'){
      if(!legal.canRaise)throw new Error('지금은 레이즈할 수 없습니다.');
      const target=asInt(amount);
      if(target<=game.currentBet||target>legal.maxTo)throw new Error('레이즈 금액을 확인해 주세요.');
      if(target<legal.minRaiseTo&&target!==legal.maxTo)throw new Error('최소 레이즈 금액보다 작습니다.');
      const oldCurrent=game.currentBet;
      const raiseSize=target-oldCurrent;
      pay(game,seat,target-p.streetContribution,{street:true,kind:'raise'});
      const actual=p.streetContribution;
      const actualRaise=actual-oldCurrent;
      const fullRaise=actualRaise>=game.lastFullRaiseSize;
      p.lastAction=p.allIn?'RAISE · ALL-IN':'RAISE';
      setAfterAggression(game,seat,oldCurrent,actual,fullRaise);
      log(game,{seat,action:'raise-complete',to:actual,raiseSize,fullRaise});
    }else{
      throw new Error('지원하지 않는 액션입니다.');
    }

    if(finishIfSingle(game))return game;
    game.needsAction=game.needsAction.filter(s=>{
      const player=game.players[s];
      return player&&!player.folded&&!player.allIn;
    });
    if(!game.needsAction.length){
      advanceStreet(game);
      return game;
    }
    game.actingSeat=pickActor(game,seat);
    if(game.actingSeat==null)advanceStreet(game);
    return game;
  }

  function cardValue(card){
    return RANKS.indexOf(card[0])+2;
  }
  function compareScore(a,b){
    for(let i=0;i<Math.max(a.length,b.length);i++){
      const av=a[i]||0,bv=b[i]||0;
      if(av!==bv)return av>b?1:-1;
    }
    return 0;
  }
  function compareScores(a,b){
    for(let i=0;i<Math.max(a.length,b.length);i++){
      const av=a[i]||0,bv=b[i]||0;
      if(av!==bv)return av>bv?1:-1;
    }
    return 0;
  }
  function evaluateFive(cards){
    const values=cards.map(cardValue).sort((a,b)=>b-a);
    const counts=new Map();
    values.forEach(v=>counts.set(v,(counts.get(v)||0)+1));
    const groups=[...counts.entries()].sort((a,b)=>b[1]-a[1]||b[0]-a[0]);
    const flush=cards.every(c=>c[1]===cards[0][1]);
    const uniq=[...new Set(values)].sort((a,b)=>b-a);
    if(uniq.includes(14))uniq.push(1);
    let straightHigh=0,run=1;
    for(let i=1;i<uniq.length;i++){
      if(uniq[i-1]-1===uniq[i]){
        run++;
        if(run>=5){straightHigh=uniq[i-4];break;}
      }else run=1;
    }
    if(flush&&straightHigh)return [8,straightHigh];
    if(groups[0][1]===4)return [7,groups[0][0],groups[1][0]];
    if(groups[0][1]===3&&groups[1]?.[1]===2)return [6,groups[0][0],groups[1][0]];
    if(flush)return [5,...values];
    if(straightHigh)return [4,straightHigh];
    if(groups[0][1]===3)return [3,groups[0][0],...groups.slice(1).map(g=>g[0]).sort((a,b)=>b-a)];
    const pairs=groups.filter(g=>g[1]===2).map(g=>g[0]).sort((a,b)=>b-a);
    if(pairs.length>=2){
      const kicker=groups.filter(g=>g[1]===1).map(g=>g[0]).sort((a,b)=>b-a)[0]||0;
      return [2,pairs[0],pairs[1],kicker];
    }
    if(pairs.length===1){
      const kickers=groups.filter(g=>g[1]===1).map(g=>g[0]).sort((a,b)=>b-a);
      return [1,pairs[0],...kickers];
    }
    return [0,...values];
  }
  function bestScore(cards){
    if(cards.length<5)return null;
    let best=null;
    for(let a=0;a<cards.length-4;a++)
      for(let b=a+1;b<cards.length-3;b++)
        for(let c=b+1;c<cards.length-2;c++)
          for(let d=c+1;d<cards.length-1;d++)
            for(let e=d+1;e<cards.length;e++){
              const score=evaluateFive([cards[a],cards[b],cards[c],cards[d],cards[e]]);
              if(!best||compareScores(score,best)>0)best=score;
            }
    return best;
  }
  function handCategory(score){
    return ['High Card','Pair','Two Pair','Three of a Kind','Straight','Flush','Full House','Four of a Kind','Straight Flush'][score?.[0]||0];
  }
  function buildSidePots(game){
    const contributors=occupied(game).filter(p=>p.totalContribution>0);
    const levels=[...new Set(contributors.map(p=>p.totalContribution))].sort((a,b)=>a-b);
    const pots=[];
    let previous=0;
    for(const level of levels){
      const involved=contributors.filter(p=>p.totalContribution>=level);
      const amount=(level-previous)*involved.length;
      const eligible=involved.filter(p=>!p.folded).map(p=>p.seatIndex);
      if(amount>0)pots.push({amount,eligibleSeats:eligible,cap:level});
      previous=level;
    }
    return pots;
  }
  function showdown(game){
    while(game.board.length<5){
      if(game.board.length===0){burn(game);game.board.push(takeCard(game),takeCard(game),takeCard(game));}
      else{burn(game);game.board.push(takeCard(game));}
    }
    game.street='showdown';
    const live=livePlayers(game);
    const scores={};
    live.forEach(p=>{scores[p.seatIndex]=bestScore([...p.holeCards,...game.board]);});
    const pots=buildSidePots(game);
    const payouts={};
    const resultPots=[];
    for(const pot of pots){
      const eligible=pot.eligibleSeats.length?pot.eligibleSeats:live.map(p=>p.seatIndex);
      let winners=[];
      let best=null;
      for(const seat of eligible){
        const score=scores[seat];
        if(!best||compareScores(score,best)>0){best=score;winners=[seat];}
        else if(compareScores(score,best)===0)winners.push(seat);
      }
      const share=Math.floor(pot.amount/winners.length);
      let remainder=pot.amount-share*winners.length;
      winners.forEach(seat=>{payouts[seat]=(payouts[seat]||0)+share;});
      const remainderOrder=orderedFrom(game,game.buttonSeat,winners);
      for(const seat of remainderOrder){
        if(remainder<=0)break;
        payouts[seat]=(payouts[seat]||0)+1;
        remainder--;
      }
      resultPots.push({amount:pot.amount,eligibleSeats:eligible,winnerSeats:winners});
    }
    Object.entries(payouts).forEach(([seat,amount])=>{game.players[Number(seat)].stack+=amount;});
    const winnerSeats=[...new Set(resultPots.flatMap(p=>p.winnerSeats))];
    game.revealedSeats=live.map(p=>p.seatIndex);
    game.status='hand-complete';
    game.street='showdown';
    game.actingSeat=null;
    game.needsAction=[];
    game.completedAt=new Date().toISOString();
    game.handResult={
      type:'showdown',totalPot:sumPot(game),winnerSeats,payouts,pots:resultPots,
      hands:Object.fromEntries(live.map(p=>[p.seatIndex,{score:scores[p.seatIndex],category:handCategory(scores[p.seatIndex])}]))
    };
    log(game,{action:'showdown',winnerSeats,payouts});
    return game;
  }

  function formatCard(card){
    if(!card)return null;
    const suitMap={s:'♠',h:'♥',d:'♦',c:'♣'};
    return {code:card,rank:card[0],suit:suitMap[card[1]]||card[1],red:card[1]==='h'||card[1]==='d'};
  }

  window.PokerCatHoldemEngine={
    VERSION,STREET_LABEL,createGame,startNextHand,applyAction,legalActions,
    getLegalActions:legalActions,potSize:sumPot,buildSidePots,bestScore,compareScores,handCategory,formatCard
  };
})();