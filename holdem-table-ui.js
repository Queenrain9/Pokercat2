(function(){
  'use strict';

  function holdemEngine(){return window.PokerCatHoldemEngine}
  function holdemGame(room){return getPrimaryTable(room)?.gameState||null}
  function holdemPot(game){return game&&holdemEngine()?holdemEngine().potSize(game):0}
  function holdemSuitClass(card){return card&&(/[hd]$/.test(card))?' red':''}
  function holdemCardMarkup(card,extra=''){
    if(!card)return '<span class="holdem-card empty '+extra+'">?</span>';
    const meta=holdemEngine()?.formatCard(card)||{rank:card[0],suit:card[1],red:false};
    return '<span class="holdem-card '+(meta.red?'red ':'')+extra+'"><b>'+escapeHtml(meta.rank)+'</b><i>'+escapeHtml(meta.suit)+'</i></span>';
  }
  function holdemBoardMarkup(game){
    const cards=game?.board||[];
    return Array.from({length:5},(_,i)=>holdemCardMarkup(cards[i]||null,'board-card')).join('');
  }
  function holdemPositionBadge(game,seat){
    const p=game?.players?.[seat];
    if(!p)return '';
    const blind=seat===game.smallBlindSeat?'SB':seat===game.bigBlindSeat?'BB':'';
    const label=p.position||blind||'';
    return label?'<span class="holdem-position">'+escapeHtml(label)+'</span>':'';
  }
  function holdemLastAction(game,seat){
    const action=game?.players?.[seat]?.lastAction;
    return action?'<span class="holdem-last-action">'+escapeHtml(action)+'</span>':'';
  }
  function holdemHoleMini(game,seat){
    const p=game?.players?.[seat];
    if(!p)return '';
    const show=(game.revealedSeats||[]).includes(seat);
    if(!show)return '<span class="holdem-mini-card back"></span><span class="holdem-mini-card back"></span>';
    return (p.holeCards||[]).map(card=>{
      const m=holdemEngine()?.formatCard(card)||{rank:card?.[0]||'?',suit:card?.[1]||'',red:false};
      return '<span class="holdem-mini-card '+(m.red?'red':'')+'">'+escapeHtml(m.rank)+escapeHtml(m.suit)+'</span>';
    }).join('');
  }
  function holdemWinnerText(room,game){
    const result=game?.handResult;
    if(!result)return '';
    const names=(result.winnerSeats||[]).map(seat=>{
      const id=game.players?.[seat]?.userId;
      return id?getUser(id).name:'Seat '+(seat+1);
    });
    if(result.type==='uncontested'){
      return (names.join(', ')||'Winner')+' · '+formatChips(result.totalPot)+' chips';
    }
    const handParts=(result.winnerSeats||[]).map(seat=>{
      const id=game.players?.[seat]?.userId;
      const name=id?getUser(id).name:'Seat '+(seat+1);
      const category=result.hands?.[seat]?.category;
      return category?name+' · '+category:name;
    });
    return (handParts.join(' / ')||names.join(', '))+' · POT '+formatChips(result.totalPot);
  }
  function holdemBetDefault(game,legal){
    const bb=game.settings.blinds.bigBlind;
    const pot=Math.max(bb,holdemPot(game));
    const step=Math.max(1,game.settings.blinds.smallBlind||1);
    if(legal.canBet){
      const target=Math.max(legal.minBetTo,Math.round((pot*0.5)/step)*step);
      return Math.min(legal.maxTo,target);
    }
    if(legal.canRaise)return Math.min(legal.maxTo,legal.minRaiseTo);
    return 0;
  }
  function holdemSizingMarkup(game,legal){
    if(!legal.canBet&&!legal.canRaise)return '';
    const isRaise=legal.canRaise;
    const min=isRaise?legal.minRaiseTo:legal.minBetTo;
    const max=legal.maxTo;
    const value=holdemBetDefault(game,legal);
    const step=Math.max(1,game.settings.blinds.smallBlind||1);
    const label=isRaise?'RAISE TO':'BET';
    return '<div class="holdem-sizing">'+
      '<div class="holdem-sizing-line"><span>'+label+'</span><b id="holdemBetSizeLabel">'+formatChips(value)+'</b></div>'+
      '<input id="holdemBetSize" data-holdem-bet-size type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+value+'">'+
      '<div class="holdem-sizing-range"><span>MIN '+formatChips(min)+'</span><span>MAX '+formatChips(max)+'</span></div>'+
      '<button class="holdem-primary-action" data-holdem-action="'+(isRaise?'raise':'bet')+'" data-room-id="'+escapeHtml(game.tableId||'')+'">'+label+' <span>'+formatChips(value)+'</span></button>'+
    '</div>';
  }
  function holdemActionDock(room,game,mySeat){
    const engine=holdemEngine();
    if(!engine||!game)return '';
    const legal=mySeat>=0?engine.getLegalActions(game,mySeat):null;
    if(game.status==='hand-complete'){
      const alive=(game.players||[]).filter(p=>p&&p.stack>0).length;
      const isHost=state.loggedIn&&room.hostId==='queenbee';
      return '<div class="holdem-result-panel">'+
        '<small>HAND '+game.handNumber+' COMPLETE</small>'+
        '<b>'+escapeHtml(holdemWinnerText(room,game))+'</b>'+
        (isHost&&alive>=2?'<button class="holdem-next-hand" data-next-holdem-hand="'+room.id+'">다음 핸드</button>':'')+
      '</div>';
    }
    if(game.status==='game-complete'){
      const champion=(game.players||[]).find(p=>p&&p.stack>0);
      const name=champion?getUser(champion.userId).name:'Winner';
      return '<div class="holdem-result-panel game-complete"><small>TABLE COMPLETE</small><b>'+escapeHtml(name)+' 승리</b></div>';
    }
    if(mySeat<0)return '<div class="holdem-waiting-action">관전 중 · 현재 액션을 실시간으로 표시합니다.</div>';
    if(!legal?.canAct){
      const actor=game.players?.[game.actingSeat];
      const actorName=actor?getUser(actor.userId).name:'다른 플레이어';
      return '<div class="holdem-waiting-action"><span class="pulse-dot"></span>'+escapeHtml(actorName)+'님의 액션을 기다리는 중</div>';
    }
    const passive=[];
    if(legal.canFold)passive.push('<button class="fold" data-holdem-action="fold" data-room-id="'+room.id+'">FOLD</button>');
    if(legal.canCheck)passive.push('<button class="check" data-holdem-action="check" data-room-id="'+room.id+'">CHECK</button>');
    if(legal.canCall)passive.push('<button class="call" data-holdem-action="call" data-room-id="'+room.id+'">CALL <span>'+formatChips(legal.callAmount)+'</span></button>');
    return '<div class="poker-action-dock holdem-live-actions">'+
      '<div class="holdem-passive-actions">'+passive.join('')+'</div>'+
      holdemSizingMarkup(game,legal)+
    '</div>';
  }
  function holdemRecentActions(game){
    const rows=(game?.actionLog||[]).filter(x=>x.seat!=null&&['fold','check','call-complete','bet-complete','raise-complete'].includes(x.action)).slice(-4).reverse();
    if(!rows.length)return '';
    return '<div class="holdem-action-log">'+rows.map(item=>{
      const p=game.players?.[item.seat],name=p?getUser(p.userId).name:'Seat '+(item.seat+1);
      const action=item.action==='call-complete'?'CALL':item.action==='bet-complete'?'BET':item.action==='raise-complete'?'RAISE':item.action.toUpperCase();
      const amount=item.to!=null?' · '+formatChips(item.to):item.amount?' · '+formatChips(item.amount):'';
      return '<div><span>'+escapeHtml(name)+'</span><b>'+action+amount+'</b></div>';
    }).join('')+'</div>';
  }

  window.pokerTableView=function(room){
    const s=roomSettings(room),seats=roomSeats(room),table=roomTable(room);
    const game=table?.gameState||null;
    const engine=holdemEngine();
    const isHost=state.loggedIn&&room.hostId==='queenbee';
    const seated=roomSeatCount(room),mySeat=state.loggedIn?seats.indexOf('queenbee'):-1;
    const positions=roomSeatPositions(s.maxPlayers);

    if(!game||!engine){
      return '<section class="room-screen poker-app-shell">'+
        '<div class="poker-room-hud"><div><span class="hud-status playing">● PLAYING</span><b>'+escapeHtml(room.name)+'</b><small>'+roomGameLabel(room)+' · '+formatChips(s.blinds.smallBlind)+'/'+formatChips(s.blinds.bigBlind)+'</small></div></div>'+
        '<div class="holdem-engine-missing"><b>게임 상태를 시작할 준비가 됐어요.</b><p>기존 테이블에 Hold’em 엔진 상태가 아직 없습니다.</p>'+(isHost&&seated>=2?'<button data-init-holdem="'+room.id+'">이 테이블에서 첫 핸드 시작</button>':'')+'</div>'+
      '</section>';
    }

    const street=engine.STREET_LABEL[game.street]||String(game.street||'').toUpperCase();
    const actor=game.actingSeat!=null?game.players?.[game.actingSeat]:null;
    const hero=mySeat>=0?game.players?.[mySeat]:null;
    const heroCards=hero?.holeCards||[];
    const pot=engine.potSize(game);

    return '<section class="room-screen poker-app-shell holdem-active-table">'+
      '<div class="poker-room-hud">'+
        '<div><span class="hud-status playing">● '+escapeHtml(street)+'</span><b>'+escapeHtml(room.name)+'</b><small>Hand #'+game.handNumber+' · '+formatChips(s.blinds.smallBlind)+' / '+formatChips(s.blinds.bigBlind)+(s.ante.mode!=='none'?' · Ante '+formatChips(s.ante.amount):'')+'</small></div>'+
        '<div class="hud-stack"><strong>'+formatChips(pot)+'</strong><span>CURRENT POT</span></div>'+
      '</div>'+
      '<div class="portrait-table-stage">'+
        '<div class="portrait-felt-glow"></div>'+
        '<div class="poker-table portrait-table holdem-running">'+
          '<div class="table-brand">POKER<span>CAT</span></div>'+
          '<div class="table-pot">POT <b>'+formatChips(pot)+'</b></div>'+
          '<div class="community-board holdem-board">'+holdemBoardMarkup(game)+'</div>'+
          positions.map((p,i)=>window.roomSeatNode(room,i,p[0],p[1],game)).join('')+
        '</div>'+
      '</div>'+
      '<div class="poker-room-lower">'+
        '<div class="room-table-summary compact">'+
          '<div><b>'+escapeHtml(street)+'</b><span>STREET</span></div>'+
          '<div><b>'+formatChips(pot)+'</b><span>POT</span></div>'+
          '<div><b>'+formatChips(s.blinds.smallBlind)+'/'+formatChips(s.blinds.bigBlind)+'</b><span>BLINDS</span></div>'+
        '</div>'+
        (hero?'<div class="hero-hand-shell holdem-hero">'+
          '<div class="hero-hand-cards">'+holdemCardMarkup(heroCards[0],holdemSuitClass(heroCards[0]))+holdemCardMarkup(heroCards[1],holdemSuitClass(heroCards[1]))+'</div>'+
          '<div><b>'+escapeHtml(state.nickname)+'</b><span>'+formatChips(hero.stack)+' chips · '+escapeHtml(hero.position||'')+'</span></div>'+
          (game.actingSeat===mySeat&&game.status==='hand-in-progress'?'<em>YOUR TURN</em>':'')+
        '</div>':'')+
        holdemActionDock(room,game,mySeat)+
        (actor&&game.status==='hand-in-progress'?'<div class="holdem-turn-line">ACTION · <b>'+escapeHtml(getUser(actor.userId).name)+'</b></div>':'')+
        holdemRecentActions(game)+
        '<div class="room-actions">'+(isHost?'<button class="btn secondary full" data-invite-room="'+room.id+'">팔로워 / 팔로잉 초대</button>':'')+'</div>'+
      '</div>'+
    '</section>';
  };

  window.roomSeatNode=function(room,index,x,y,game){
    const s=roomSettings(room),key=roomSeats(room)[index];
    if(!key)return '<button class="table-seat empty" style="--x:'+x+'%;--y:'+y+'%"><span>＋</span><small>SEAT '+(index+1)+'</small></button>';
    const u=getUser(key),p=game?.players?.[index]||null;
    const stack=p?.stack??s.startingChips;
    const acting=game?.actingSeat===index&&game?.status==='hand-in-progress';
    const dealer=game?.buttonSeat===index;
    const showdown=game?.status==='hand-complete'&&(game?.revealedSeats||[]).includes(index);
    return '<button class="table-seat filled '+(key==='queenbee'?'me ':'')+(acting?'acting ':'')+(p?.folded?'folded ':'')+'" style="--x:'+x+'%;--y:'+y+'%" data-user="'+key+'">'+
      (dealer?'<span class="dealer-marker">D</span>':'')+
      holdemPositionBadge(game,index)+
      catAvatar(u.cat,'table-seat-avatar')+
      '<b>'+escapeHtml(u.name)+'</b>'+
      '<small>'+formatChips(stack)+' chips</small>'+
      (game?'<div class="holdem-seat-cards '+(showdown?'show':'')+'">'+holdemHoleMini(game,index)+'</div>':'')+
      holdemLastAction(game,index)+
    '</button>';
  };
})();