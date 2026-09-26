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

function pokerRoomFeedCard(room,context='feed'){
  if(!room)return '';
  const host=getUser(room.hostId);
  const seated=roomSeatCount(room);
  const privateLabel=room.visibility==='private'?'<span class="room-private-badge">🔒 PRIVATE</span>':'<span class="room-open-badge">● OPEN</span>';
  return `<div class="room-social-card ${context==='explore'?'explore-room-card':''}">
    <div class="room-social-top">
      <div class="room-host-avatar">${catAvatar(host.cat,'room-card-avatar')}</div>
      <div><small>${escapeHtml(host.name)} opened a table</small><b>${escapeHtml(room.name)}</b></div>
      ${privateLabel}
    </div>
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

function roomSeatPositions(max){
  const positions={
    2:[[50,6],[50,84]],
    4:[[50,4],[91,46],[50,86],[9,46]],
    6:[[50,3],[88,23],[88,69],[50,88],[12,69],[12,23]],
    8:[[50,2],[82,12],[94,45],[80,80],[50,91],[20,80],[6,45],[18,12]],
    9:[[50,1],[79,9],[94,34],[91,68],[68,89],[32,89],[9,68],[6,34],[21,9]]
  };
  return positions[max]||positions[6];
}

function pokerRoomView(id){
  const room=getRoom(id);
  if(!room)return `<section class="room-screen"><div class="room-missing"><b>게임을 찾을 수 없어요.</b><button class="btn" data-nav="home">홈으로</button></div></section>`;
  const host=getUser(room.hostId),isHost=room.hostId==='queenbee';
  const seated=roomSeatCount(room),mySeat=room.seats.indexOf('queenbee');
  const positions=roomSeatPositions(room.maxPlayers);
  return `<section class="room-screen">
    <div class="room-detail-head">
      <div class="room-detail-status"><span class="${room.status}">● ${roomStatusLabel(room)}</span><em>${room.visibility==='private'?'🔒 Private':'◎ Public'}</em></div>
      <h1>${escapeHtml(room.name)}</h1>
      <div class="room-host-line">${catAvatar(host.cat,'room-detail-host')}<div><small>HOST</small><b>${escapeHtml(host.name)}</b></div></div>
      <div class="room-detail-specs">
        <span>${roomGameLabel(room)}</span><span>${room.maxPlayers} Players</span><span>${room.startStack}BB</span><span>${room.sb}/${room.bb}</span>
        ${room.ante.enabled?`<span>Ante ${room.ante.amount}</span>`:''}
        ${room.blinds.increase?`<span>↑ ${room.blinds.intervalMinutes}m</span>`:''}
      </div>
    </div>

    <div class="poker-table-wrap">
      <div class="poker-table">
        <div class="table-logo">POKER<span>CAT</span><small>PLAY MONEY</small></div>
        <div class="table-pot">POT <b>—</b></div>
        ${positions.map((p,i)=>roomSeatNode(room,i,p[0],p[1])).join('')}
      </div>
    </div>

    <div class="room-table-summary">
      <div><b>${seated}/${room.maxPlayers}</b><span>착석</span></div>
      <div><b>${room.startStack}BB</b><span>시작 스택</span></div>
      <div><b>${room.sb}/${room.bb}</b><span>블라인드</span></div>
    </div>

    <div class="room-actions">
      ${mySeat<0?'<button class="btn full" data-join-room="'+room.id+'">테이블 입장</button>':'<button class="btn secondary full" data-leave-room="'+room.id+'">착석 중 · 나가기</button>'}
      ${isHost?'<button class="btn secondary full" data-invite-room="'+room.id+'">PokerCat 친구 초대</button>':''}
      ${isHost&&seated>=2&&room.status==='open'?'<button class="room-start-btn" data-start-room="'+room.id+'">플레이머니 게임 시작</button>':''}
    </div>

    <div class="room-engine-note">
      <b>${room.status==='playing'?'테이블이 시작됐어요':'Single Table 준비 중'}</b>
      <p>${room.status==='playing'?'좌석과 룸 상태는 동작합니다. 카드 배분·베팅 엔진은 다음 개발 단계에서 이 Room ID에 연결됩니다.':'친구를 초대하거나 자리에 앉을 수 있어요. 실제 카드 배분·베팅 엔진은 다음 우선순위에서 연결됩니다.'}</p>
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
  const candidates=[...new Set([...pokerFriendKeys(),...state.followers,...state.following])].filter(k=>k!=='queenbee');
  return `<div class="modal-backdrop" data-close-modal><div class="sheet room-invite-sheet" onclick="event.stopPropagation()">
    <div class="grab"></div>
    <div class="sheet-title">PokerCat 친구 초대</div>
    <p class="room-invite-lead"><b>${escapeHtml(room.name)}</b>에 초대할 사용자를 선택하세요.</p>
    <div class="invite-source-tabs"><button class="active">Poker Friends</button><button>Followers / Following</button></div>
    <div class="invite-list">
      ${candidates.length?candidates.map(k=>roomInviteRow(room,k)).join(''):'<div class="relationship-empty">초대할 수 있는 사용자가 없어요.</div>'}
    </div>
    <div class="external-share-placeholder"><span>↗</span><div><b>외부 링크 공유</b><small>추후 지원 예정</small></div><em>COMING SOON</em></div>
  </div></div>`;
}

function roomInviteRow(room,key){
  const u=getUser(key),invited=room.invitedUserIds.includes(key);
  const friend=state.following.has(key)&&state.followers.has(key);
  return `<div class="room-invite-row">
    ${catAvatar(u.cat,'relationship-avatar')}
    <div><b>${escapeHtml(u.name)}</b><span>${friend?'Poker Friend':state.followers.has(key)?'Follower':'Following'}</span></div>
    <button class="${invited?'sent':''}" data-send-room-invite="${key}" ${invited?'disabled':''}>${invited?'초대됨':'초대'}</button>
  </div>`;
}
