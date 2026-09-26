function userRow(key){
  const u=getUser(key);
  const hp=verifiedHomePub(u);
  const pub=hp?`<span class="feed-pub-affiliation"><i>🏠</i><b>${escapeHtml(hp.brand)}</b> <small>${escapeHtml(hp.branch)}</small></span>`:'';
  return `<div class="user-row">
    <button class="avatar" data-user="${key}">${catAvatar(u.cat,'avatar-cat-image')}</button>
    <div class="user-meta"><div class="user-name-line"><div class="user-name">${escapeHtml(u.name)}</div>${pub}</div><div class="user-sub">${u.time||'방금'}</div></div>
    <button class="more-btn">•••</button>
  </div>`;
}
function cards(list){
  return (list||[]).map(c=>`<div class="playing-card ${/[♥♦]/.test(c)?'red':''}"><b>${c.slice(0,-1)}</b><span>${c.slice(-1)}</span></div>`).join('');
}
const handA={title:'BTN vs BB · 3Bet Pot',blinds:'MTT · 1k/2k (Ante 2k)',players:'8-max',pos:'BTN',stack:'38BB',hole:['A♠','K♠'],board:['Q♥','J♠','7♣','2♦','9♣'],pre:'BTN 오픈 → BB 콜',flop:'플랍 체크-콜',turn:'턴 체크-레이즈',river:'리버 콜'};
const handB={title:'SB vs BB · Single Raised Pot',blinds:'Cash · 1/2',players:'6-max',pos:'BB',stack:'102BB',hole:['9♠','8♠'],board:['J♠','7♦','2♣','T♥','3♣'],pre:'SB 2.5BB → BB Call',flop:'SB 30% → BB Call',turn:'SB Check → BB 70% → Call',river:'SB Check → BB ?'};
function hhCard(d){
  return `<div class="hh-card">
    <div class="hh-kicker">🔥 ${d.blinds}</div>
    <div class="hh-row"><div><small>MY HAND</small><div class="cards-row">${cards(d.hole)}</div></div><div><small>FLOP</small><div class="cards-row">${cards(d.board.slice(0,3))}</div></div><div><small>TURN</small><div class="cards-row">${cards(d.board.slice(3,4))}</div></div><div><small>RIVER</small><div class="cards-row">${cards(d.board.slice(4,5))}</div></div></div>
    <div class="hh-action">${d.pre}<br>${d.flop}, ${d.turn}, ${d.river}</div>
  </div>`;
}
function actions(id,likes,comments){
  const liked=state.liked.has(id);
  return `<div class="post-actions">
    <button class="${liked?'liked':''}" data-like="${id}">${liked?'♥':'♡'} ${likes+(liked?1:0)}</button>
    <button>◯ ${comments}</button><span class="post-spacer"></span>
    <button data-save-post="${id}">⌑</button><button data-toast="공유 링크를 준비했어요">↗</button>
  </div>`;
}
function pokerPhoto(type='chips'){
  return `<div class="poker-photo ${type}"><div class="felt"></div><div class="chip-stack c1"></div><div class="chip-stack c2"></div><div class="chip-stack c3"></div><div class="table-card a">A♠</div><div class="table-card k">K♥</div><div class="photo-shine"></div></div>`;
}
function visibleRoomCards(filter='all'){
  return state.rooms
    .filter(r=>r.status!=='closed')
    .filter(r=>!['invite','homepub'].includes(roomAudienceType(r)))
    .filter(r=>filter==='following'?state.following.has(r.hostId):true)
    .filter(r=>roomVisibleToViewer(r,'feed'))
    .map(r=>pokerRoomFeedCard(r,'feed')).join('');
}
function homeView(){
  const roomCards=visibleRoomCards('all');
  const followedRoomCards=visibleRoomCards('following');
  const algorithmPosts=`
    <article class="feed-post">${userRow('riverkim')}<div class="post-text">오늘은 확실히 리드 잘 잡혔다<br>후반에 좀 아쉬운 스팟이 있었지만 전체적으로 굿<br>내일도 화이팅 🐱</div>${pokerPhoto('night')}${actions('p1',32,7)}</article>
    ${roomCards}
    <article class="feed-post">${userRow('queenbee')}<div class="post-text">핸드 히스토리 하나 공유해요<br>여러분은 턴에서 어떤 라인 가시나요?</div>${hhCard(handA)}${actions('p2',42,18)}</article>
    <article class="feed-post">${userRow('minraise')}<div class="post-text">대회 끝나고 느낀 점. 오늘도 한 단계 배웠다.</div>${pokerPhoto('warm')}${actions('p3',76,31)}</article>
  `;
  const followingPosts=`
    <article class="feed-post">${userRow('riverkim')}<div class="post-text">오늘은 확실히 리드 잘 잡혔다<br>후반에 좀 아쉬운 스팟이 있었지만 전체적으로 굿<br>내일도 화이팅 🐱</div>${pokerPhoto('night')}${actions('fp1',32,7)}</article>
    ${followedRoomCards}
    <div class="following-end"><b>팔로잉 피드의 끝이에요</b><span>지금 팔로우한 플레이어의 최신 게시물만 보여주고 있어요.</span></div>
  `;
  return `<section class="home-screen">
    <div class="feed-context">${state.feedMode==='following'?'팔로잉 중인 플레이어':'추천 피드'}</div>
    <div class="feed-list">${state.feedMode==='following'?followingPosts:algorithmPosts}</div>
  </section>`;
}

function homePubCommunityView(){
  const me=myUser();
  const hp=verifiedHomePub(me);
  if(!state.homePub){
    return `<section class="homepub-screen"><div class="homepub-gate"><div class="homepub-gate-icon">🏠</div><h2>Home Pub을 등록해 주세요</h2><p>인증된 대표 지점을 등록하면 같은 Home Pub 플레이어의 게시물을 따로 볼 수 있어요.</p><button class="btn" data-edit-profile>Home Pub 등록</button></div></section>`;
  }
  if(!hp){
    return `<section class="homepub-screen"><div class="homepub-gate"><div class="homepub-gate-icon">🔐</div><h2>${escapeHtml(state.homePub.brand)} ${escapeHtml(state.homePub.branch)}</h2><p>Home Pub 인증이 완료되어야 지점 전용 커뮤니티에 입장할 수 있어요.</p><button class="btn" data-open-homepub-verify>Home Pub 인증하기</button></div></section>`;
  }
  const memberKeys=['queenbee',...Object.keys(demoUsers).filter(k=>verifiedHomePub(demoUsers[k])?.id===hp.id)];
  const unique=[...new Set(memberKeys)];
  const otherKeys=unique.filter(k=>k!=='queenbee');
  const homePubRoomCards=state.rooms
    .filter(r=>r.status!=='closed'&&roomAudienceType(r)==='homepub'&&roomVisibleToViewer(r,'homepub'))
    .map(r=>pokerRoomFeedCard(r,'feed')).join('');
  const regularCommunityPosts=otherKeys.length
    ?otherKeys.map((k,i)=>`<article class="feed-post">${userRow(k)}<div class="post-text">${i===0?'오늘 저녁 데일리 참가합니다. 같은 지점 분들 테이블에서 봬요 🐱':'어제 세션에서 재밌는 핸드가 하나 있었어요. 의견 궁금합니다.'}</div>${i===0?pokerPhoto('warm'):hhCard(handB)}${actions('hp-'+k,18+i*7,4+i)}</article>`).join('')
    :'';
  const communityPosts=homePubRoomCards+regularCommunityPosts||`<div class="homepub-empty"><b>아직 이 지점의 게시물이 없어요.</b><span>전체 피드에서 같은 Home Pub 플레이어를 팔로우하면 관계가 자연스럽게 이어져요.</span></div>`;
  return `<section class="homepub-screen">
    <div class="homepub-community-head">
      <div class="homepub-community-label">VERIFIED HOME PUB</div>
      <h1>🏠 ${escapeHtml(hp.brand)} ${escapeHtml(hp.branch)}</h1>
      <p>인증된 같은 지점 플레이어의 게시물만 모아보는 커뮤니티예요.</p>
      <div class="homepub-member-strip">${unique.slice(0,6).map(k=>`<button data-user="${k}" title="${escapeHtml(getUser(k).name)}">${catAvatar(getUser(k).cat,'homepub-member-avatar')}</button>`).join('')}<span><b>${unique.length}</b> 인증 멤버</span></div>
    </div>
    <div class="homepub-feed-label"><span>Home Pub Community</span><em>전체 피드와 별도</em></div>
    <div class="feed-list">${communityPosts}</div>
  </section>`;
}

function notificationView(){
  return `<section class="notification-screen">
    <div class="notification-filter"><button class="active">전체</button><button>활동</button><button>일정</button></div>
    <div class="notification-group">
      <h3>오늘</h3>
      ${state.roomInvites.filter(i=>i.toUserId==='queenbee'&&i.status==='pending').map(inv=>{
        const room=getRoom(inv.roomId),from=getUser(inv.fromUserId);
        if(!room)return '';
        return `<article class="notification-row room-invite-notice ${state.notificationsRead?'':'unread'}">
          ${catAvatar(from.cat,'notice-avatar')}
          <div class="notice-copy"><b>${escapeHtml(from.name)}</b>님이 포커 게임에 초대했습니다.<span>${escapeHtml(room.name)} · ${roomGameLabel(room)} · ${roomSeatCount(room)}/${roomSettings(room).maxPlayers} seated</span></div>
          <div class="room-invite-notice-actions">
            <button class="notice-detail secondary" data-decline-room-invite="${room.id}">거절</button>
            <button class="notice-detail" data-accept-room-invite="${room.id}">참가</button>
          </div>
        </article>`;
      }).join('')}
      <article class="notification-row ${state.notificationsRead?'':'unread'}">
        ${catAvatar('shark','notice-avatar')}
        <div class="notice-copy"><b>riverkim</b>님이 회원님의 핸드에 댓글을 남겼어요.<span>“턴에서는 작은 사이즈도 좋아 보여요.” · 12분</span></div>
        <div class="notice-preview hand">A♠</div>
      </article>
      <article class="notification-row ${state.notificationsRead?'':'unread'}">
        ${catAvatar('solver','notice-avatar')}
        <div class="notice-copy"><b>minraise</b>님이 회원님의 게시물을 좋아합니다.<span>34분</span></div>
        <div class="notice-heart">♥</div>
      </article>
      <article class="notification-row">
        ${catAvatar('grinder','notice-avatar')}
        <div class="notice-copy"><b>chiplee</b>님이 회원님을 팔로우하기 시작했어요.<span>1시간</span></div>
        <button class="notice-follow" data-follow="chiplee">팔로우</button>
      </article>
    </div>
    <div class="notification-group">
      <h3>이번 주</h3>
      <article class="notification-row event-notice">
        <div class="notice-event-icon">♠</div>
        <div class="notice-copy"><b>HPT Premium Day1A</b>가 곧 시작돼요.<span>09.12 (토) 12:00 · 5일 전 알림</span></div>
        <button class="notice-detail" data-nav="schedule">보기</button>
      </article>
      <article class="notification-row">
        ${catAvatar('rock','notice-avatar')}
        <div class="notice-copy"><b>ninehigh</b>님이 회원님의 핸드를 저장했어요.<span>2일</span></div>
        <div class="notice-save">⌑</div>
      </article>
    </div>
  </section>`;
}

function exploreView(){
  const tabs=[['popular','인기'],['latest','최신'],['hands','핸드'],['events','대회'],['pubs','펍'],['users','유저']];
  return `<section class="explore-screen">
    <div class="search-box"><span>⌕</span><input placeholder="플레이어, 핸드, 대회 검색"><button>⌘</button></div>
    <div class="explore-tabs">${tabs.map(t=>`<button class="${state.exploreTab===t[0]?'active':''}" data-explore-tab="${t[0]}">${t[1]}</button>`).join('')}</div>
    <div class="trend-list">
      <article class="trend-card"><div class="trend-thumb chips"></div><div><b>오늘 이 핸드 어떻게 보세요?</b><span>🔥 120　◯ 62</span></div><em>›</em></article>
      <article class="trend-card"><div class="trend-thumb arena"></div><div><b>대박에서 느낀 점</b><span>♡ 98　◯ 24</span></div><em>›</em></article>
      <article class="trend-card"><div class="trend-thumb pub"></div><div><b>요즘 여기 펍 추천</b><span>서울 홍대 근처 괜찮은 펍 있을까요?</span></div><em>›</em></article>
      <article class="trend-card"><div class="trend-thumb cats"></div><div><b>HPT 새틀 후기</b><span>핸드 몇개 공유합니다</span></div><em>›</em></article>
      <article class="trend-card"><div class="trend-thumb night"></div><div><b>그라인더들의 새벽 세션</b><span>♡ 44　◯ 11</span></div><em>›</em></article>
    </div>
  </section>`;
}
function scheduleView(){
  const days=Array.from({length:30},(_,i)=>i+1);
  const events=[['HPT Premium Day1A','09.12 (토) 12:00 · Korea','D-5','orange'],['다바오 시리즈 Main Event','09.20 (일) 12:00 · Davao','D-13','blue'],['APL Seoul','09.24 (목) 14:00 · Korea','D-17','red']];
  return `<section class="schedule-screen">
    <div class="schedule-switch"><button class="active">대회</button><button data-toast="펍 이벤트는 다음 단계에서 연결해요">펍 이벤트</button><button data-toast="내 일정 저장 기능은 다음 단계에서 연결해요">내 일정</button></div>
    <div class="calendar-card"><div class="calendar-head"><b>2026년 9월</b><span>‹　›</span></div><div class="weekdays">${['월','화','수','목','금','토','일'].map(x=>`<span>${x}</span>`).join('')}</div><div class="calendar-grid">${days.map(d=>`<span class="${[3,12,15,20,24].includes(d)?'marked':''} ${d===20?'hot':''}">${d}</span>`).join('')}</div></div>
    <div class="event-list">${events.map(e=>`<article class="event-row"><div class="event-logo ${e[3]}">♠</div><div><b>${e[0]}</b><span>${e[1]}</span></div><em class="${e[3]}">${e[2]}</em></article>`).join('')}</div>
  </section>`;
}

function exploreMockContent(tab){
  const data={
    popular:[
      ['chips','오늘 이 핸드 어떻게 보세요?','🔥 120　◯ 62'],
      ['arena','APT 메인 이벤트 현장 분위기','♡ 98　◯ 24'],
      ['pub','요즘 자주 가는 펍 이야기','◯ 31'],
      ['cats','HPT 새틀 후기','핸드 몇 개 공유합니다']
    ],
    latest:[
      ['night','방금 끝난 새벽 세션','1분 전 · riverkim'],
      ['chips','20BB BTN vs BB 질문','4분 전 · minraise'],
      ['pub','오늘 야자수 서울센터점 가는 분?','7분 전 · chiplee'],
      ['arena','이번 주말 대회 참가합니다','11분 전 · ninehigh']
    ],
    hands:[
      ['chips','AQs · BTN vs BB · 24BB','리버 콜 어떻게 보세요?'],
      ['night','99 · CO vs BTN · 41BB','3Bet Pot 턴 스팟'],
      ['arena','AKo · FT 7 left · 18BB','ICM 고려한 프리플랍'],
      ['cats','76s · BB Defense · 55BB','플랍 체크레이즈 라인']
    ],
    events:[
      ['arena','APT Main Event','10.03 · 참가 예정 38명'],
      ['chips','HPT Satellite','09.29 · 참가 예정 21명'],
      ['night','Weekend Deepstack','10.05 · 참가 예정 16명']
    ],
    pubs:[
      ['pub','야자수 서울센터점','Home Pub 인증 플레이어 14명'],
      ['night','KMGM 수원점','최근 게시물 23개'],
      ['chips','KMGM 홍대점','최근 게시물 18개']
    ],
    users:[
      ['cats','riverkim','MTT · 🏠 KMGM 수원점'],
      ['chips','minraise','Cash · 🏠 KMGM 홍대점'],
      ['night','chiplee','오프라인 · 🏠 야자수 서울센터점'],
      ['arena','ninehigh','MTT · 오프라인']
    ]
  };
  const rows=data[tab]||data.popular;
  return '<div class="trend-list">'+rows.map(x=>'<article class="trend-card"><div class="trend-thumb '+x[0]+'"></div><div><b>'+escapeHtml(x[1])+'</b><span>'+escapeHtml(x[2])+'</span></div><em>›</em></article>').join('')+'</div>';
}
function pokerRoomExploreViewV1(){
  const tabs=[['popular','인기'],['rooms','포커룸'],['latest','최신'],['hands','핸드'],['events','대회'],['pubs','펍'],['users','유저']];
  const roomList=state.rooms.filter(r=>r.status!=='closed'&&roomVisibleToViewer(r,'explore'));
  const body=state.exploreTab==='rooms'
    ?'<div class="explore-room-section"><div class="explore-room-head"><div><b>진행 중인 포커룸</b><span>호스트와 설정을 확인하고 같은 Poker Room으로 입장해요.</span></div><button data-create-game>＋ 만들기</button></div><div class="explore-room-list">'+(roomList.map(r=>pokerRoomFeedCard(r,'explore')).join('')||'<div class="homepub-empty"><b>열린 포커룸이 없어요.</b><span>직접 Single Table을 만들어 친구를 초대해 보세요.</span></div>')+'</div></div>'
    :exploreMockContent(state.exploreTab);
  return '<section class="explore-screen"><div class="search-box"><span>⌕</span><input placeholder="플레이어, 핸드, 대회, 포커룸 검색"><button>⌘</button></div><div class="explore-tabs">'+tabs.map(t=>'<button class="'+(state.exploreTab===t[0]?'active':'')+'" data-explore-tab="'+t[0]+'">'+t[1]+'</button>').join('')+'</div>'+body+'</section>';
}
function exploreView(){return pokerRoomExploreViewV1()}

function feedSelectorModal(){
  const hp=state.loggedIn?verifiedHomePub(myUser()):null;
  const homePubLabel=state.loggedIn?(hp?`${escapeHtml(hp.brand)} ${escapeHtml(hp.branch)}`:'Home Pub 미등록'):'로그인 후 사용';
  return `<div class="modal-backdrop" data-close-modal>
    <div class="sheet feed-selector-sheet" onclick="event.stopPropagation()">
      <div class="grab"></div>
      <div class="sheet-title">피드 선택</div>
      <button class="feed-selector-option ${state.feedMode==='algorithm'?'active':''}" data-feed-mode="algorithm">
        <span>✦</span><div><b>추천</b><small>내 활동을 기반으로 추천되는 전체 PokerCat 피드</small></div><i>✓</i>
      </button>
      <button class="feed-selector-option ${state.feedMode==='following'?'active':''}" data-feed-mode="following">
        <span>✓</span><div><b>팔로잉</b><small>내가 팔로우한 플레이어의 게시물만 보기</small></div><i>✓</i>
      </button>
      <button class="feed-selector-option ${state.feedMode==='homepub'?'active':''}" data-feed-mode="homepub">
        <span>🏠</span><div><b>Home Pub</b><small>${homePubLabel}</small></div><i>✓</i>
      </button>
    </div>
  </div>`;
}

function homePubFeedBundle(){
  const hp=verifiedHomePub(myUser());
  if(!hp)return {hp:null,members:[],posts:''};
  const memberKeys=['queenbee',...Object.keys(demoUsers).filter(k=>verifiedHomePub(demoUsers[k])?.id===hp.id)];
  const members=[...new Set(memberKeys)];
  const otherKeys=members.filter(k=>k!=='queenbee');
  const roomPosts=state.rooms
    .filter(r=>r.status!=='closed'&&roomAudienceType(r)==='homepub'&&roomVisibleToViewer(r,'homepub'))
    .map(r=>pokerRoomFeedCard(r,'feed')).join('');
  const regularPosts=otherKeys.map((k,i)=>`<article class="feed-post">
    ${userRow(k)}
    <div class="post-text">${i===0?'오늘 저녁 야자수 서울센터점에서 세션 들어갑니다. 같은 지점 분들 테이블에서 봬요 🐱':'어제 세션에서 재밌는 핸드가 하나 있었어요. 지점 분들 의견 궁금합니다.'}</div>
    ${i===0?pokerPhoto('warm'):hhCard(handB)}
    ${actions('homepub-'+k,21+i*8,5+i)}
  </article>`).join('');
  return {hp,members,posts:roomPosts+regularPosts};
}

function homePubInlineFeed(){
  const bundle=homePubFeedBundle();
  if(!bundle.hp){
    return `<div class="homepub-inline-empty">
      <span>🏠</span><b>Home Pub 피드를 사용하려면 Home Pub이 필요해요.</b>
      <small>프로필 편집에서 대표 지점을 등록하고 인증해 주세요.</small>
      <button data-edit-profile>Home Pub 설정</button>
    </div>`;
  }
  return `<div class="homepub-inline">
    <div class="homepub-inline-head">
      <div><small>HOME PUB FEED</small><b>🏠 ${escapeHtml(bundle.hp.brand)} ${escapeHtml(bundle.hp.branch)}</b></div>
      <span>${bundle.members.length}명</span>
    </div>
    <div class="homepub-inline-members">
      ${bundle.members.slice(0,6).map(k=>`<button data-user="${k}">${catAvatar(getUser(k).cat,'homepub-member-avatar')}</button>`).join('')}
      <em>같은 Home Pub 인증 사용자</em>
    </div>
    <div class="feed-list">${bundle.posts||'<div class="homepub-empty"><b>아직 이 지점의 게시물이 없어요.</b><span>같은 Home Pub 플레이어의 게시물이 여기에 모입니다.</span></div>'}</div>
  </div>`;
}

function homeView(){
  const roomCards=visibleRoomCards('all');
  const followedRoomCards=visibleRoomCards('following');
  const algorithmPosts=`
    <article class="feed-post">${userRow('riverkim')}<div class="post-text">오늘은 확실히 리드 잘 잡혔다<br>후반에 좀 아쉬운 스팟이 있었지만 전체적으로 굿<br>내일도 화이팅 🐱</div>${pokerPhoto('night')}${actions('p1',32,7)}</article>
    ${roomCards}
    <article class="feed-post">${userRow('queenbee')}<div class="post-text">핸드 히스토리 하나 공유해요<br>여러분은 턴에서 어떤 라인 가시나요?</div>${hhCard(handA)}${actions('p2',42,18)}</article>
    <article class="feed-post">${userRow('minraise')}<div class="post-text">대회 끝나고 느낀 점. 오늘도 한 단계 배웠다.</div>${pokerPhoto('warm')}${actions('p3',76,31)}</article>
  `;
  const followingPosts=`
    <article class="feed-post">${userRow('riverkim')}<div class="post-text">오늘은 확실히 리드 잘 잡혔다<br>후반에 좀 아쉬운 스팟이 있었지만 전체적으로 굿<br>내일도 화이팅 🐱</div>${pokerPhoto('night')}${actions('fp1',32,7)}</article>
    ${followedRoomCards}
    <div class="following-end"><b>팔로잉 피드의 끝이에요</b><span>지금 팔로우한 플레이어의 최신 게시물만 보여주고 있어요.</span></div>
  `;
  if(state.feedMode==='homepub'){
    return `<section class="home-screen"><div class="feed-context">Home Pub · ${escapeHtml(verifiedHomePub(myUser())?.brand||'')} ${escapeHtml(verifiedHomePub(myUser())?.branch||'')}</div>${homePubInlineFeed()}</section>`;
  }
  return `<section class="home-screen">
    <div class="feed-context">${state.feedMode==='following'?'팔로잉 중인 플레이어':'추천 피드'}</div>
    <div class="feed-list">${state.feedMode==='following'?followingPosts:algorithmPosts}</div>
  </section>`;
}
