function createMenuModal(){
  return `<div class="modal-backdrop create-menu-backdrop" data-close-modal>
    <div class="sheet create-menu-sheet" onclick="event.stopPropagation()">
      <div class="grab"></div>
      <div class="create-menu-title">무엇을 만들까요?</div>
      <button class="create-action" data-create-post>
        <span class="create-action-icon">✎</span>
        <div><b>글쓰기</b><small>게시물이나 핸드 히스토리를 공유해요.</small></div><i>›</i>
      </button>
      <button class="create-action game" data-create-game>
        <span class="create-action-icon">♠</span>
        <div><b>게임 만들기</b><small>PokerCat 안에서 실제 Private Poker Room을 만들어요.</small></div><i>›</i>
      </button>
    </div>
  </div>`;
}

function ensureRoomDraft(){
  if(!state.roomDraft)resetRoomDraft();
  return state.roomDraft;
}
function gameTypeMeta(id){
  return (window.POKER_ROOM_GAME_TYPES||[]).find(x=>x.id===id)||{id,name:id,shortName:id,available:true};
}
function blindStructureMeta(id){
  return (window.POKER_ROOM_BLIND_STRUCTURES||[]).find(x=>x.id===id)||null;
}
function formatChips(value){return Number(value||0).toLocaleString('ko-KR')}
function roomBigBlindCount(settings){
  const bb=Number(settings?.blinds?.bigBlind||1);
  return bb>0?Math.round(Number(settings?.startingChips||0)/bb):0;
}
function anteSummary(settings){
  const a=settings.ante||{mode:'none',amount:0};
  if(a.mode==='none')return '없음';
  if(a.mode==='all-player')return `모든 플레이어 · ${formatChips(a.amount)}`;
  if(a.mode==='bb-ante')return `BB Ante · ${formatChips(a.amount)}`;
  return '없음';
}
function blindProgressionSummary(settings){
  const b=settings.blindProgression||{mode:'fixed'};
  if(b.mode==='fixed')return '고정';
  const structure=blindStructureMeta(b.structureId);
  return `자동 증가 · ${b.levelMinutes||10}분${structure?` · ${structure.name}`:''}`;
}
function audienceMeta(type){
  const map={
    public:{label:'전체 공개',icon:'◎',desc:'전체 피드와 탐색에서 발견 가능'},
    friends:{label:'Poker Friends',icon:'◇',desc:'서로 팔로우한 사용자에게 노출'},
    followers:{label:'팔로워',icon:'👥',desc:'나를 팔로우하는 사용자에게 노출'},
    homepub:{label:'Home Pub',icon:'🏠',desc:'내 Home Pub 커뮤니티에 노출'},
    invite:{label:'초대 전용',icon:'🔒',desc:'피드에 노출하지 않고 초대한 사용자만 입장'}
  };
  return map[type]||map.public;
}
function roomAudienceLabel(room){return audienceMeta(roomAudienceType(room)).label}
function roomGameLabel(room){return gameTypeMeta(roomSettings(room).gameType).shortName||'Poker'}
function roomStackLabel(room){
  const s=roomSettings(room);
  return `${roomBigBlindCount(s)}BB`;
}
function roomStatusLabel(room){return room?.status==='playing'?'PLAYING':'LOBBY'}
function roomTable(room){return getPrimaryTable(room)}
function roomSeats(room){return roomTable(room)?.seats||[]}

function pokerRoomCreateView(){
  const draft=ensureRoomDraft();
  const s=draft.settings;
  const hp=verifiedHomePub(myUser());
  const activeSaved=state.savedRoomSettings.find(x=>x.id===state.editingSavedRoomSettingId);
  return `<section class="room-create-screen v2">
    <div class="room-format-summary">
      <div>
        <span class="room-format-kicker">GAME FORMAT</span>
        <b>Single Table</b>
        <small>현재는 싱글 테이블만 지원합니다.</small>
      </div>
      <div class="mtt-coming"><span>MTT</span><em>COMING SOON</em></div>
    </div>

    <button class="load-settings-card" data-open-room-presets>
      <span class="load-settings-icon">↙</span>
      <div><b>설정 불러오기</b><small>${draft.sourceLabel?escapeHtml(draft.sourceLabel):'PokerCat 기본 프리셋 또는 내 저장 설정'}</small></div>
      <i>›</i>
    </button>

    <div class="room-config-section">
      <div class="room-section-title">기본 정보</div>
      <label class="room-field">방 이름<input id="roomName" maxlength="30" value="${escapeHtml(draft.roomName)}" placeholder="예: Friday Night Table"></label>
      <label class="room-field">게임 종류
        <select id="roomGame">
          ${(window.POKER_ROOM_GAME_TYPES||[]).map(g=>`<option value="${g.id}" ${s.gameType===g.id?'selected':''} ${g.available?'':'disabled'}>${g.name}${g.available?'':' · Coming Soon'}</option>`).join('')}
        </select>
      </label>
      <label class="room-field">최대 인원
        <select id="roomMaxPlayers">
          ${[2,4,6,8,9].map(n=>`<option value="${n}" ${Number(s.maxPlayers)===n?'selected':''}>${n} Players</option>`).join('')}
        </select>
      </label>
    </div>

    <div class="room-config-section">
      <div class="room-section-title">칩 / 블라인드</div>
      <label class="room-field">시작 칩
        <div class="chip-input"><input id="roomStartingChips" inputmode="numeric" type="number" min="1000" step="1000" value="${s.startingChips}"><span>CHIPS</span></div>
        <small class="field-helper">현재 블라인드 기준 약 ${roomBigBlindCount(s)}BB</small>
      </label>
      <div class="room-form-row">
        <label class="room-field">Small Blind<input id="roomSb" inputmode="numeric" type="number" min="1" value="${s.blinds.smallBlind}"></label>
        <label class="room-field">Big Blind<input id="roomBb" inputmode="numeric" type="number" min="2" value="${s.blinds.bigBlind}"></label>
      </div>
    </div>

    <div class="room-config-section compact-options">
      <div class="room-section-title">게임 진행 옵션</div>
      <button class="room-option-summary" data-room-option="ante">
        <div><span>Ante</span><b>${anteSummary(s)}</b></div><i>${state.roomOptionOpen==='ante'?'⌃':'›'}</i>
      </button>
      ${state.roomOptionOpen==='ante'?roomAnteEditor(s):''}
      <button class="room-option-summary" data-room-option="blinds">
        <div><span>Blinds</span><b>${blindProgressionSummary(s)}</b></div><i>${state.roomOptionOpen==='blinds'?'⌃':'›'}</i>
      </button>
      ${state.roomOptionOpen==='blinds'?roomBlindEditor(s):''}
    </div>

    <div class="room-config-section">
      <div class="room-section-title">누구에게 게임을 열까요?</div>
      <div class="audience-grid">
        ${['public','friends','followers','homepub','invite'].map(type=>{
          const a=audienceMeta(type);
          const disabled=type==='homepub'&&!hp;
          return `<button class="audience-choice ${draft.audience.type===type?'active':''} ${disabled?'disabled':''}" data-room-audience="${type}" ${disabled?'disabled':''}>
            <span>${a.icon}</span><div><b>${a.label}</b><small>${disabled?'Home Pub 인증 후 사용 가능':a.desc}</small></div><i>${draft.audience.type===type?'✓':''}</i>
          </button>`;
        }).join('')}
      </div>
    </div>

    <div class="room-config-section save-setting-section">
      <div class="save-setting-copy">
        <b>내 게임 설정 저장</b>
        <span>${activeSaved?`불러온 설정 · ${escapeHtml(activeSaved.name)}`:'자주 쓰는 게임 룰을 이름 붙여 다시 사용할 수 있어요.'}</span>
      </div>
      <button class="save-setting-button" data-open-save-room-setting>이 설정 저장</button>
    </div>

    <div class="room-create-bottom">
      <div class="playmoney-caption">플레이머니 전용 · 현금 충전/환전/상금 지급 없음</div>
      <button class="room-create-cta" data-create-room-submit>게임방 만들기</button>
    </div>
  </section>`;
}

function roomAnteEditor(s){
  const mode=s.ante?.mode||'none';
  return `<div class="room-option-editor">
    <label class="room-field">Ante 방식
      <select id="roomAnteMode">
        <option value="none" ${mode==='none'?'selected':''}>없음</option>
        <option value="all-player" ${mode==='all-player'?'selected':''}>모든 플레이어 Ante</option>
        <option value="bb-ante" disabled>BB Ante · Coming Soon</option>
      </select>
    </label>
    ${mode!=='none'?`<label class="room-field">Ante 칩<input id="roomAnteAmount" type="number" min="1" value="${s.ante.amount||100}"></label>`:''}
  </div>`;
}
function roomBlindEditor(s){
  const bp=s.blindProgression||{mode:'fixed'};
  return `<div class="room-option-editor">
    <label class="room-field">블라인드 진행
      <select id="roomBlindMode">
        <option value="fixed" ${bp.mode==='fixed'?'selected':''}>고정</option>
        <option value="auto" ${bp.mode==='auto'?'selected':''}>자동 증가</option>
      </select>
    </label>
    ${bp.mode==='auto'?`<div class="room-form-row">
      <label class="room-field">레벨 시간
        <select id="roomBlindInterval">${[5,10,15,20].map(n=>`<option value="${n}" ${Number(bp.levelMinutes)===n?'selected':''}>${n}분</option>`).join('')}</select>
      </label>
      <label class="room-field">블라인드 구조
        <select id="roomBlindStructure">${(window.POKER_ROOM_BLIND_STRUCTURES||[]).map(x=>`<option value="${x.id}" ${bp.structureId===x.id?'selected':''}>${x.name}</option>`).join('')}</select>
      </label>
    </div>`:''}
  </div>`;
}

function roomPresetLoaderModal(){
  const presets=window.POKER_ROOM_PRESETS||[];
  return `<div class="modal-backdrop" data-close-modal><div class="sheet preset-loader-sheet" onclick="event.stopPropagation()">
    <div class="grab"></div>
    <div class="sheet-title">설정 불러오기</div>

    <div class="preset-group">
      <div class="preset-group-head"><b>PokerCat 기본 프리셋</b><span>공식 기본값 · 수정/삭제 불가</span></div>
      <div class="preset-list">
        ${presets.map(p=>`<button class="preset-row" data-load-preset="${p.id}">
          <div><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.description||'')}</small><em>${settingSummary(p.settings)}</em></div><i>불러오기</i>
        </button>`).join('')}
      </div>
    </div>

    <div class="preset-group saved">
      <div class="preset-group-head"><b>내 저장 설정</b><span>${state.savedRoomSettings.length}개 저장됨</span></div>
      <div class="preset-list">
        ${state.savedRoomSettings.length?state.savedRoomSettings.map(item=>savedSettingRow(item)).join(''):`<div class="saved-setting-empty"><b>아직 저장한 설정이 없어요.</b><span>게임 설정 화면에서 ‘이 설정 저장’을 눌러 자주 쓰는 룰을 보관할 수 있어요.</span></div>`}
      </div>
    </div>
  </div></div>`;
}
function settingSummary(s){
  return `${s.maxPlayers} Players · ${formatChips(s.startingChips)} Chips · ${formatChips(s.blinds.smallBlind)} / ${formatChips(s.blinds.bigBlind)} · ${blindProgressionSummary(s)}`;
}
function savedSettingRow(item){
  return `<div class="saved-setting-row">
    <button class="saved-setting-main" data-load-saved-setting="${item.id}"><b>${escapeHtml(item.name)}</b><small>${settingSummary(item.settings)}</small></button>
    <div class="saved-setting-actions">
      <button data-rename-saved-setting="${item.id}">이름</button>
      <button data-overwrite-saved-setting="${item.id}">덮어쓰기</button>
      <button class="danger" data-delete-saved-setting="${item.id}">삭제</button>
    </div>
  </div>`;
}
function roomSaveSettingModal(){
  return `<div class="modal-backdrop" data-close-modal><div class="sheet compact-sheet" onclick="event.stopPropagation()">
    <div class="grab"></div><div class="sheet-title">내 게임 설정 저장</div>
    <p class="compact-sheet-copy">방 이름과 초대 대상은 저장하지 않고 게임 룰만 저장합니다.</p>
    <label class="room-field">설정 이름<input id="savedRoomSettingName" maxlength="24" placeholder="예: 친구들이랑 6맥스"></label>
    <button class="btn full" data-save-room-setting>새 설정으로 저장</button>
  </div></div>`;
}
function roomRenameSettingModal(){
  const item=state.savedRoomSettings.find(x=>x.id===state.editingSavedRoomSettingId);
  if(!item)return '';
  return `<div class="modal-backdrop" data-close-modal><div class="sheet compact-sheet" onclick="event.stopPropagation()">
    <div class="grab"></div><div class="sheet-title">설정 이름 변경</div>
    <label class="room-field">설정 이름<input id="renameRoomSettingName" maxlength="24" value="${escapeHtml(item.name)}"></label>
    <button class="btn full" data-confirm-rename-setting>이름 변경</button>
  </div></div>`;
}

function roomVisibleToViewer(room,surface='feed'){
  const type=roomAudienceType(room);
  if(surface==='explore')return type==='public';
  if(state.loggedIn&&room.hostId==='queenbee')return true;
  if(type==='public')return true;
  if(!state.loggedIn)return false;
  if(type==='invite')return room.invitedUserIds.includes('queenbee');
  if(type==='followers')return state.following.has(room.hostId);
  if(type==='friends')return state.following.has(room.hostId)&&state.followers.has(room.hostId);
  if(type==='homepub'){
    const me=verifiedHomePub(myUser()),host=verifiedHomePub(getUser(room.hostId));
    return Boolean(me&&host&&me.id===host.id);
  }
  return false;
}
function canEnterRoom(room){
  if(roomAudienceType(room)==='public')return true;
  return roomVisibleToViewer(room,'feed');
}

function pokerRoomEmbed(room,context='feed'){
  if(!room)return '';
  const s=roomSettings(room),seated=roomSeatCount(room),a=audienceMeta(roomAudienceType(room));
  return `<div class="room-social-card ${context==='explore'?'explore-room-card':''}">
    <div class="room-social-roomline"><b>${escapeHtml(room.name)}</b><span class="room-audience-badge">${a.icon} ${a.label}</span></div>
    <div class="room-card-table-art">
      <div class="mini-table"><span>♠</span><b>${roomGameLabel(room)}</b></div>
      <div class="mini-seats">${Array.from({length:Math.min(s.maxPlayers,6)},(_,i)=>`<i class="${roomSeats(room)[i]?'filled':''}"></i>`).join('')}</div>
    </div>
    <div class="room-social-specs">
      <span><b>${roomGameLabel(room)}</b></span>
      <span>${s.maxPlayers} Players · ${roomStackLabel(room)}</span>
      <span><strong>${seated}</strong> / ${s.maxPlayers} seated</span>
    </div>
    <button class="room-view-btn" data-open-room="${room.id}">게임 보기 <i>›</i></button>
  </div>`;
}
function pokerRoomFeedCard(room,context='feed'){
  if(!room)return '';
  const host=getUser(room.hostId);
  if(context==='explore'){
    return `<article class="feed-post room-feed-post explore-room-post">
      ${userRow(room.hostId)}
      <div class="post-text"><b>${escapeHtml(host.name)}</b>님이 포커 테이블을 열었어요.</div>
      ${pokerRoomEmbed(room,'explore')}
    </article>`;
  }
  return `<article class="feed-post room-feed-post">
    ${userRow(room.hostId)}
    <div class="post-text"><b>${escapeHtml(host.name)}</b>님이 포커 테이블을 열었어요.<br><span class="room-post-caption">대기방에서 설정과 참가자를 확인할 수 있어요.</span></div>
    ${pokerRoomEmbed(room,'feed')}
    ${actions('room-'+room.id,12,3)}
  </article>`;
}

function pokerRoomView(id){
  const room=getRoom(id);
  if(!room)return `<section class="room-screen"><div class="room-missing"><b>게임을 찾을 수 없어요.</b><button class="btn" data-nav="home">홈으로</button></div></section>`;
  if(room.status==='playing')return pokerTableView(room);
  return pokerRoomLobbyView(room);
}

function pokerRoomLobbyView(room){
  const s=roomSettings(room),table=roomTable(room),seats=roomSeats(room);
  const host=getUser(room.hostId),isHost=state.loggedIn&&room.hostId==='queenbee';
  const mySeat=state.loggedIn?seats.indexOf('queenbee'):-1;
  const seated=roomSeatCount(room);
  return `<section class="room-lobby-screen">
    <div class="lobby-hero">
      <div class="lobby-status"><span>● WAITING ROOM</span><em>${audienceMeta(roomAudienceType(room)).label}</em></div>
      <h1>${escapeHtml(room.name)}</h1>
      <div class="lobby-host">${catAvatar(host.cat,'room-detail-host')}<div><small>HOST</small><b>${escapeHtml(host.name)}</b></div></div>
    </div>

    <div class="lobby-setting-card">
      <div class="lobby-setting-title"><b>${roomGameLabel(room)}</b><span>Single Table</span></div>
      <div class="lobby-setting-grid">
        <div><small>PLAYERS</small><b>${s.maxPlayers}</b></div>
        <div><small>STARTING CHIPS</small><b>${formatChips(s.startingChips)}</b><em>${roomBigBlindCount(s)}BB</em></div>
        <div><small>BLINDS</small><b>${formatChips(s.blinds.smallBlind)} / ${formatChips(s.blinds.bigBlind)}</b></div>
        <div><small>ANTE</small><b>${anteSummary(s)}</b></div>
        <div class="wide"><small>BLIND PROGRESSION</small><b>${blindProgressionSummary(s)}</b></div>
      </div>
    </div>

    <div class="lobby-section">
      <div class="lobby-section-head"><b>참가자</b><span>${seated} / ${s.maxPlayers} seated</span></div>
      <div class="lobby-seat-list">
        ${Array.from({length:s.maxPlayers},(_,i)=>lobbySeatRow(room,i)).join('')}
      </div>
    </div>

    <div class="lobby-actions">
      ${isHost?`<div class="host-seat-status">방장으로 착석 중</div>`:mySeat<0?`<button class="btn full" data-join-room="${room.id}">빈자리에 앉기</button>`:`<button class="btn secondary full" data-leave-room="${room.id}">착석 중 · 나가기</button>`}
      ${isHost?`<button class="btn secondary full" data-invite-room="${room.id}">팔로워 / 팔로잉 초대</button>`:''}
      ${isHost?`<button class="room-start-btn" data-start-room="${room.id}" ${seated<2?'disabled':''}>게임 시작${seated<2?' · 2명 이상 필요':''}</button>`:''}
    </div>
    <div class="lobby-playmoney-note">플레이머니 전용 · 실제 현금/환전/상금 지급 없음</div>
  </section>`;
}
function lobbySeatRow(room,index){
  const s=roomSettings(room),key=roomSeats(room)[index];
  if(!key)return `<div class="lobby-seat-row empty"><span class="seat-number">${index+1}</span><div class="empty-avatar">＋</div><div><b>빈자리</b><small>${formatChips(s.startingChips)} chips</small></div></div>`;
  const u=getUser(key);
  return `<div class="lobby-seat-row"><span class="seat-number">${index+1}</span>${catAvatar(u.cat,'lobby-seat-avatar')}<div><b>${escapeHtml(u.name)}</b><small>${key===room.hostId?'HOST · ':''}${formatChips(s.startingChips)} chips</small></div></div>`;
}

function roomSeatPositions(max){
  const positions={
    2:[[50,8],[50,92]],4:[[50,7],[92,50],[50,93],[8,50]],
    6:[[50,6],[88,28],[88,72],[50,94],[12,72],[12,28]],
    8:[[50,5],[82,17],[94,41],[88,75],[50,95],[12,75],[6,41],[18,17]],
    9:[[50,4],[78,12],[93,31],[93,64],[72,88],[28,88],[7,64],[7,31],[22,12]]
  };
  return positions[max]||positions[6];
}
function pokerTableView(room){
  const s=roomSettings(room),seats=roomSeats(room);
  const isHost=state.loggedIn&&room.hostId==='queenbee';
  const seated=roomSeatCount(room),mySeat=state.loggedIn?seats.indexOf('queenbee'):-1;
  const positions=roomSeatPositions(s.maxPlayers);
  return `<section class="room-screen poker-app-shell">
    <div class="poker-room-hud">
      <div><span class="hud-status playing">● PLAYING</span><b>${escapeHtml(room.name)}</b><small>${roomGameLabel(room)} · ${formatChips(s.blinds.smallBlind)}/${formatChips(s.blinds.bigBlind)}${s.ante.mode!=='none'?` · Ante ${formatChips(s.ante.amount)}`:''}</small></div>
      <div class="hud-stack"><strong>${formatChips(s.startingChips)}</strong><span>STARTING CHIPS · ${roomBigBlindCount(s)}BB</span></div>
    </div>
    <div class="portrait-table-stage"><div class="portrait-felt-glow"></div><div class="poker-table portrait-table">
      <div class="table-brand">POKER<span>CAT</span></div><div class="table-pot">POT <b>—</b></div>
      <div class="community-board"><span>?</span><span>?</span><span>?</span><span>?</span><span>?</span></div>
      ${positions.map((p,i)=>roomSeatNode(room,i,p[0],p[1])).join('')}<div class="dealer-chip">D</div>
    </div></div>
    <div class="poker-room-lower">
      <div class="room-table-summary compact"><div><b>${seated}/${s.maxPlayers}</b><span>SEATED</span></div><div><b>${roomBigBlindCount(s)}BB</b><span>STACK</span></div><div><b>${formatChips(s.blinds.smallBlind)}/${formatChips(s.blinds.bigBlind)}</b><span>BLINDS</span></div></div>
      ${mySeat>=0?`<div class="hero-hand-shell"><div class="hero-hand-cards"><i>?</i><i>?</i></div><div><b>${escapeHtml(state.nickname)}</b><span>${formatChips(s.startingChips)} chips</span></div></div>`:''}
      ${mySeat>=0?`<div class="poker-action-dock disabled-engine"><button disabled>FOLD</button><button disabled>CHECK</button><button disabled>BET</button><small>카드 배분·베팅 엔진은 다음 단계에서 연결됩니다.</small></div>`:''}
      <div class="room-actions">${isHost?'<button class="btn secondary full" data-invite-room="'+room.id+'">팔로워 / 팔로잉 초대</button>':''}</div>
      <div class="room-engine-note"><b>테이블 UI 프리뷰</b><p>Room → Table 구조와 좌석 상태는 실제 저장됩니다. 카드 배분과 베팅 엔진은 이후 이 Table ID에 연결됩니다.</p></div>
    </div>
  </section>`;
}
function roomSeatNode(room,index,x,y){
  const s=roomSettings(room),key=roomSeats(room)[index];
  if(!key)return `<button class="table-seat empty" style="--x:${x}%;--y:${y}%"><span>＋</span><small>SEAT ${index+1}</small></button>`;
  const u=getUser(key);
  return `<button class="table-seat filled ${key==='queenbee'?'me':''}" style="--x:${x}%;--y:${y}%" data-user="${key}">${catAvatar(u.cat,'table-seat-avatar')}<b>${escapeHtml(u.name)}</b><small>${roomBigBlindCount(s)}BB</small></button>`;
}

function roomInviteModal(){
  const room=getRoom(state.currentRoomId);
  if(!room)return '';
  const followers=[...state.followers],following=[...state.following];
  const candidates=(state.roomInviteMode==='followers'?followers:following).filter(k=>k!=='queenbee');
  return `<div class="modal-backdrop" data-close-modal><div class="sheet room-invite-sheet" onclick="event.stopPropagation()">
    <div class="grab"></div><div class="sheet-title">PokerCat 사용자 초대</div>
    <p class="room-invite-lead"><b>${escapeHtml(room.name)}</b> 대기방으로 초대할 사용자를 선택하세요.</p>
    <div class="invite-source-tabs"><button class="${state.roomInviteMode==='followers'?'active':''}" data-invite-source="followers">Followers</button><button class="${state.roomInviteMode==='following'?'active':''}" data-invite-source="following">Following</button></div>
    <div class="invite-list">${candidates.length?candidates.map(k=>roomInviteRow(room,k)).join(''):'<div class="relationship-empty">이 그룹에는 초대할 사용자가 없어요.</div>'}</div>
    <div class="external-share-placeholder"><span>↗</span><div><b>외부 링크 공유</b><small>추후 지원 예정</small></div><em>COMING SOON</em></div>
  </div></div>`;
}
function roomInviteRow(room,key){
  const u=getUser(key),invited=room.invitedUserIds.includes(key);
  const relation=state.followers.has(key)&&state.following.has(key)?'Follower · Following':state.followers.has(key)?'Follower':'Following';
  return `<div class="room-invite-row">${catAvatar(u.cat,'relationship-avatar')}<div><b>${escapeHtml(u.name)}</b><span>${relation}</span></div><button class="${invited?'sent':''}" data-send-room-invite="${key}" ${invited?'disabled':''}>${invited?'초대됨':'초대'}</button></div>`;
}
