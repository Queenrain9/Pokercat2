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
        <div><b>게임 만들기</b><small>친구들과 플레이할 Private Poker Room을 만들어요.</small></div><i>›</i>
      </button>
    </div>
  </div>`;
}

function pokerRoomCreateView(){
  return `<section class="room-create-screen">
    <div class="room-create-intro">
      <div class="room-create-kicker">POKERCAT PRIVATE POKER</div>
      <h1>내 테이블 만들기</h1>
      <p>플레이머니로 친구들과 즐기는 PokerCat 내부 포커룸입니다.</p>
    </div>

    <div class="room-mode-grid">
      <button class="room-mode-card active">
        <span>♠</span><b>Single Table</b><small>현재 사용 가능</small><em>AVAILABLE</em>
      </button>
      <button class="room-mode-card disabled" disabled>
        <span>▦</span><b>Multi-Table Tournament</b><small>여러 테이블 토너먼트</small><em>COMING SOON</em>
      </button>
    </div>

    <div class="room-form">
      <label>방 이름<input id="roomName" maxlength="30" value="QueenBee's Table" placeholder="예: Friday Night Table"></label>
      <label>게임<select id="roomGame"><option value="NLH">No-Limit Hold’em</option></select></label>

      <div class="room-form-row">
        <label>최대 인원<select id="roomMaxPlayers">
          <option value="2">2 Players</option><option value="4">4 Players</option>
          <option value="6" selected>6 Players</option><option value="8">8 Players</option><option value="9">9 Players</option>
        </select></label>
        <label>시작 스택<input id="roomStartStack" type="number" min="10" max="500" value="40"><span class="input-unit">BB</span></label>
      </div>

      <div class="room-form-row">
        <label>Small Blind<input id="roomSb" type="number" min="1" value="1"></label>
        <label>Big Blind<input id="roomBb" type="number" min="2" value="2"></label>
      </div>

      <div class="room-setting-card">
        <div><b>Ante</b><span>모든 플레이어가 핸드 시작 전 내는 칩</span></div>
        <label class="switch"><input id="roomAnteEnabled" type="checkbox"><span></span></label>
      </div>
      <div class="room-subfield" id="roomAnteField">
        <label>Ante 금액<input id="roomAnteAmount" type="number" min="0" step="0.5" value="0.5"></label>
      </div>

      <div class="room-setting-card">
        <div><b>블라인드 증가</b><span>시간에 따라 블라인드를 자동으로 올려요.</span></div>
        <label class="switch"><input id="roomBlindIncrease" type="checkbox"><span></span></label>
      </div>
      <div class="room-subfield" id="roomBlindIntervalField">
        <label>레벨 시간<select id="roomBlindInterval"><option value="5">5분</option><option value="10" selected>10분</option><option value="15">15분</option><option value="20">20분</option></select></label>
      </div>

      <div class="room-visibility">
        <div class="room-form-label">공개 범위</div>
        <label class="visibility-option active"><input type="radio" name="roomVisibility" value="public" checked><span>◎</span><div><b>공개</b><small>탐색과 피드에서 발견 가능</small></div></label>
        <label class="visibility-option"><input type="radio" name="roomVisibility" value="private"><span>◉</span><div><b>비공개</b><small>초대받은 사용자 중심으로 입장</small></div></label>
      </div>

      <label class="room-feed-publish"><input id="roomFeedPublished" type="checkbox" checked><span><b>피드에 게임 카드 게시</b><small>게임을 만들면 PokerCat 피드에 입장 카드가 자동으로 올라갑니다.</small></span></label>

      <div class="room-money-note"><span>ⓘ</span><p>이 방의 모든 칩은 <b>플레이머니</b>입니다. 현금 충전·환전·상금 지급 기능은 없습니다.</p></div>
      <button class="btn full room-create-main" data-create-room-submit>Single Table 만들기</button>
    </div>
  </section>`;
}

function roomGameLabel(room){return room?.game==='NLH'?'NL Hold’em':room?.game||'Poker'}
function roomStackLabel(room){return (room?.startStack||40)+'BB'}
function roomStatusLabel(room){return room?.status==='playing'?'PLAYING':'OPEN'}

function pokerRoomEmbed(room,context='feed'){
  if(!room)return '';
  const seated=roomSeatCount(room);
  const privateLabel=room.visibility==='private'?'<span class="room-private-badge">🔒 PRIVATE</span>':'<span class="room-open-badge">● OPEN</span>';
  return `<div class="room-social-card ${context==='explore'?'explore-room-card':''}">
    <div class="room-social-roomline"><b>${escapeHtml(room.name)}</b>${privateLabel}</div>
    <div class="room-card-table-art">
      <div class="mini-table"><span>♠</span><b>${roomGameLabel(room)}</b></div>
      <div class="mini-seats">${Array.from({length:Math.min(room.maxPlayers,6)},(_,i)=>`<i class="${room.seats[i]?'filled':''}"></i>`).join('')}</div>
    </div>
    <div class="room-social-specs">
      <span><b>${roomGameLabel(room)}</b></span>
      <span>${room.maxPlayers} Players · ${roomStackLabel(room)}</span>
      <span><strong>${seated}</strong> / ${room.maxPlayers} seated</span>
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
    <div class="post-text"><b>${escapeHtml(host.name)}</b>님이 포커 테이블을 열었어요.<br><span class="room-post-caption">지금 입장해서 같이 플레이할 수 있어요.</span></div>
    ${pokerRoomEmbed(room,'feed')}
    ${actions('room-'+room.id,12,3)}
  </article>`;
}

function roomSeatPositions(max){
  const positions={
    2:[[50,8],[50,92]],
    4:[[50,7],[92,50],[50,93],[8,50]],
    6:[[50,6],[88,28],[88,72],[50,94],[12,72],[12,28]],
    8:[[50,5],[82,17],[94,41],[88,75],[50,95],[12,75],[6,41],[18,17]],
    9:[[50,4],[78,12],[93,31],[93,64],[72,88],[28,88],[7,64],[7,31],[22,12]]
  };
  return positions[max]||positions[6];
}

function pokerRoomView(id){
  const room=getRoom(id);
  if(!room)return `<section class="room-screen"><div class="room-missing"><b>게임을 찾을 수 없어요.</b><button class="btn" data-nav="home">홈으로</button></div></section>`;
  const host=getUser(room.hostId),isHost=state.loggedIn&&room.hostId==='queenbee';
  const seated=roomSeatCount(room),mySeat=state.loggedIn?room.seats.indexOf('queenbee'):-1;
  const positions=roomSeatPositions(room.maxPlayers);
  const playing=room.status==='playing';
  return `<section class="room-screen poker-app-shell">
    <div class="poker-room-hud">
      <div>
        <span class="hud-status ${room.status}">● ${roomStatusLabel(room)}</span>
        <b>${escapeHtml(room.name)}</b>
        <small>${roomGameLabel(room)} · ${room.sb}/${room.bb}${room.ante.enabled?` · Ante ${room.ante.amount}`:''}</small>
      </div>
      <div class="hud-stack"><strong>${room.startStack}BB</strong><span>START STACK</span></div>
    </div>

    <div class="portrait-table-stage">
      <div class="portrait-felt-glow"></div>
      <div class="poker-table portrait-table">
        <div class="table-brand">POKER<span>CAT</span></div>
        <div class="table-pot">POT <b>${playing?'12.5 BB':'—'}</b></div>
        <div class="community-board ${playing?'live':''}">
          <span>?</span><span>?</span><span>?</span><span>?</span><span>?</span>
        </div>
        ${positions.map((p,i)=>roomSeatNode(room,i,p[0],p[1])).join('')}
        <div class="dealer-chip">D</div>
      </div>
    </div>

    <div class="poker-room-lower">
      <div class="room-table-summary compact">
        <div><b>${seated}/${room.maxPlayers}</b><span>SEATED</span></div>
        <div><b>${room.startStack}BB</b><span>STACK</span></div>
        <div><b>${room.sb}/${room.bb}</b><span>BLINDS</span></div>
      </div>

      ${mySeat>=0?`<div class="hero-hand-shell">
        <div class="hero-hand-cards"><i>?</i><i>?</i></div>
        <div><b>${escapeHtml(state.nickname)}</b><span>${room.startStack} BB</span></div>
      </div>`:''}

      ${playing&&mySeat>=0?`<div class="poker-action-dock disabled-engine">
        <button disabled>FOLD</button><button disabled>CHECK</button><button disabled>BET</button>
        <small>카드 배분·베팅 엔진은 다음 단계에서 연결됩니다.</small>
      </div>`:''}

      <div class="room-actions">
        ${mySeat<0?'<button class="btn full" data-join-room="'+room.id+'">테이블 입장</button>':'<button class="btn secondary full" data-leave-room="'+room.id+'">착석 중 · 나가기</button>'}
        ${isHost?'<button class="btn secondary full" data-invite-room="'+room.id+'">팔로워 / 팔로잉 초대</button>':''}
        ${isHost&&seated>=2&&!playing?'<button class="room-start-btn" data-start-room="'+room.id+'">플레이머니 게임 시작</button>':''}
      </div>

      <div class="room-engine-note">
        <b>${playing?'테이블 UI 프리뷰':'Single Table 대기 중'}</b>
        <p>${playing?'실제 포커앱과 같은 세로 플레이 화면을 먼저 구성했습니다. 좌석과 룸 상태는 저장되며 실제 딜·베팅 엔진은 다음 단계에 연결됩니다.':'참가자를 초대하고 착석할 수 있습니다. 게임 시작 후에도 현재는 UI 셸과 상태 흐름까지만 동작합니다.'}</p>
      </div>
    </div>
  </section>`;
}

function roomSeatNode(room,index,x,y){
  const key=room.seats[index];
  if(!key)return `<button class="table-seat empty" style="--x:${x}%;--y:${y}%"><span>＋</span><small>SEAT ${index+1}</small></button>`;
  const u=getUser(key);
  return `<button class="table-seat filled ${key==='queenbee'?'me':''}" style="--x:${x}%;--y:${y}%" data-user="${key}">
    ${catAvatar(u.cat,'table-seat-avatar')}<b>${escapeHtml(u.name)}</b><small>${room.startStack}BB</small>
  </button>`;
}

function roomInviteModal(){
  const room=getRoom(state.currentRoomId);
  if(!room)return '';
  const followers=[...state.followers];
  const following=[...state.following];
  const candidates=(state.roomInviteMode==='followers'?followers:following).filter(k=>k!=='queenbee');
  return `<div class="modal-backdrop" data-close-modal><div class="sheet room-invite-sheet" onclick="event.stopPropagation()">
    <div class="grab"></div>
    <div class="sheet-title">PokerCat 사용자 초대</div>
    <p class="room-invite-lead"><b>${escapeHtml(room.name)}</b>에 초대할 사용자를 선택하세요.</p>
    <div class="invite-source-tabs">
      <button class="${state.roomInviteMode==='followers'?'active':''}" data-invite-source="followers">Followers</button>
      <button class="${state.roomInviteMode==='following'?'active':''}" data-invite-source="following">Following</button>
    </div>
    <div class="invite-list">
      ${candidates.length?candidates.map(k=>roomInviteRow(room,k)).join(''):'<div class="relationship-empty">이 그룹에는 초대할 사용자가 없어요.</div>'}
    </div>
    <div class="external-share-placeholder"><span>↗</span><div><b>외부 링크 공유</b><small>추후 지원 예정</small></div><em>COMING SOON</em></div>
  </div></div>`;
}

function roomInviteRow(room,key){
  const u=getUser(key),invited=room.invitedUserIds.includes(key);
  const relation=state.followers.has(key)&&state.following.has(key)?'Follower · Following':state.followers.has(key)?'Follower':'Following';
  return `<div class="room-invite-row">
    ${catAvatar(u.cat,'relationship-avatar')}
    <div><b>${escapeHtml(u.name)}</b><span>${relation}</span></div>
    <button class="${invited?'sent':''}" data-send-room-invite="${key}" ${invited?'disabled':''}>${invited?'초대됨':'초대'}</button>
  </div>`;
}
