(function(){
  'use strict';

  function engine(){return window.PokerCatHoldemEngine}
  function currentRoom(id){
    return getRoom(id||state.currentRoomId||String(state.view||'').split(':')[1]);
  }
  function startGameForRoom(room){
    const table=getPrimaryTable(room),api=engine();
    if(!room||!table||!api)throw new Error('Hold’em 엔진을 불러오지 못했어요.');
    if(roomSeatCount(room)<2)throw new Error('2명 이상 착석해야 시작할 수 있어요.');
    table.gameState=api.createGame({
      tableId:table.id,
      seats:table.seats,
      settings:room.settings
    });
    table.status='playing';
    room.status='playing';
    persistRooms();
    return table.gameState;
  }
  function isDemoPlayer(userId){
    return userId&&userId!=='queenbee'&&typeof demoUsers!=='undefined'&&Boolean(demoUsers[userId]);
  }
  function runDemoActions(room){
    const api=engine(),game=getPrimaryTable(room)?.gameState;
    if(!api||!game)return;
    let guard=0;
    while(game.status==='hand-in-progress'&&guard++<60){
      const seat=game.actingSeat,p=game.players?.[seat];
      if(!p||!isDemoPlayer(p.userId))break;
      const legal=api.getLegalActions(game,seat);
      if(!legal.canAct)break;
      if(legal.canCheck)api.applyAction(game,seat,'check');
      else if(legal.canCall&&legal.callAmount<=Math.max(game.settings.blinds.bigBlind*2,Math.floor(p.stack*0.08)))api.applyAction(game,seat,'call');
      else if(legal.canFold)api.applyAction(game,seat,'fold');
      else break;
    }
    persistRooms();
  }
  function wireHoldem(){
    document.querySelectorAll('[data-start-room]').forEach(button=>button.onclick=()=>{
      if(!state.loggedIn){requireAuth('게임을 시작하려면 로그인해 주세요.');return}
      const room=getRoom(button.dataset.startRoom);
      if(!room||room.hostId!=='queenbee')return;
      try{
        startGameForRoom(room);
        runDemoActions(room);
        render();
        toast('No-Limit Hold’em 첫 핸드를 시작했어요');
      }catch(error){toast(error.message||'게임을 시작하지 못했어요')}
    });

    document.querySelectorAll('[data-init-holdem]').forEach(button=>button.onclick=()=>{
      const room=getRoom(button.dataset.initHoldem);
      if(!room||room.hostId!=='queenbee')return;
      try{
        startGameForRoom(room);
        runDemoActions(room);
        render();
        toast('기존 테이블에 Hold’em 엔진을 연결했어요');
      }catch(error){toast(error.message||'게임 상태를 만들지 못했어요')}
    });

    const size=document.querySelector('[data-holdem-bet-size]');
    if(size){
      const label=document.querySelector('#holdemBetSizeLabel');
      const action=document.querySelector('.holdem-primary-action span');
      const refresh=()=>{
        const value=Number(size.value||0);
        if(label)label.textContent=formatChips(value);
        if(action)action.textContent=formatChips(value);
      };
      size.addEventListener('input',refresh);
      size.addEventListener('change',refresh);
      refresh();
    }

    document.querySelectorAll('[data-holdem-action]').forEach(button=>button.onclick=()=>{
      const room=currentRoom(button.dataset.roomId);
      const table=getPrimaryTable(room),game=table?.gameState,api=engine();
      if(!room||!game||!api){toast('게임 상태를 찾을 수 없어요');return}
      const seat=roomSeats(room).indexOf('queenbee');
      if(seat<0){toast('이 테이블에 착석하지 않았어요');return}
      const action=button.dataset.holdemAction;
      const amount=(action==='bet'||action==='raise')?Number(document.querySelector('#holdemBetSize')?.value||0):null;
      try{
        api.applyAction(game,seat,action,amount);
        runDemoActions(room);
        persistRooms();
        render();
      }catch(error){toast(error.message||'액션을 처리하지 못했어요')}
    });

    document.querySelectorAll('[data-next-holdem-hand]').forEach(button=>button.onclick=()=>{
      const room=getRoom(button.dataset.nextHoldemHand),table=getPrimaryTable(room),api=engine();
      if(!room||!table?.gameState||!api)return;
      if(room.hostId!=='queenbee'){toast('방장만 다음 핸드를 시작할 수 있어요');return}
      try{
        api.startNextHand(table.gameState);
        runDemoActions(room);
        if(table.gameState.status==='game-complete')table.status='complete';
        persistRooms();
        render();
        toast(table.gameState.status==='game-complete'?'테이블 게임이 종료됐어요':'다음 핸드를 시작했어요');
      }catch(error){toast(error.message||'다음 핸드를 시작하지 못했어요')}
    });
  }

  const baseWire=window.wire;
  if(typeof baseWire==='function'){
    window.wire=function(){
      baseWire();
      wireHoldem();
    };
    render();
  }
})();