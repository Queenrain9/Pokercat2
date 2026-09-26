function userRow(key){
  const u=demoUsers[key],following=state.following.has(key);
  return `<div class="user-row">
    <button class="avatar" data-user="${key}">${catAvatar(u.cat,'avatar-cat-image')}</button>
    <div class="user-meta"><div class="user-name">${u.name}</div><div class="user-sub">${u.sub}</div></div>
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
    <button data-toast="저장했어요">⌑</button><button data-toast="공유 링크를 준비했어요">↗</button>
  </div>`;
}
function pokerPhoto(type='chips'){
  return `<div class="poker-photo ${type}"><div class="felt"></div><div class="chip-stack c1"></div><div class="chip-stack c2"></div><div class="chip-stack c3"></div><div class="table-card a">A♠</div><div class="table-card k">K♥</div><div class="photo-shine"></div></div>`;
}
function homeView(){
  const algorithmPosts=`
    <article class="feed-post">${userRow('riverkim')}<div class="post-text">오늘은 확실히 리드 잘 잡혔다<br>후반에 좀 아쉬운 스팟이 있었지만 전체적으로 굿<br>내일도 화이팅 🐱</div>${pokerPhoto('night')}${actions('p1',32,7)}</article>
    <article class="feed-post">${userRow('queenbee')}<div class="post-text">핸드 히스토리 하나 공유해요<br>여러분은 턴에서 어떤 라인 가시나요?</div>${hhCard(handA)}${actions('p2',42,18)}</article>
    <article class="feed-post">${userRow('minraise')}<div class="post-text">대회 끝나고 느낀 점. 오늘도 한 단계 배웠다.</div>${pokerPhoto('warm')}${actions('p3',76,31)}</article>
  `;
  const followingPosts=`
    <article class="feed-post">${userRow('riverkim')}<div class="post-text">오늘은 확실히 리드 잘 잡혔다<br>후반에 좀 아쉬운 스팟이 있었지만 전체적으로 굿<br>내일도 화이팅 🐱</div>${pokerPhoto('night')}${actions('fp1',32,7)}</article>
    <div class="following-end"><b>팔로잉 피드의 끝이에요</b><span>지금 팔로우한 플레이어의 최신 게시물만 보여주고 있어요.</span></div>
  `;
  return `<section class="home-screen">
    <div class="feed-context">${state.feedMode==='following'?'팔로잉 중인 플레이어':'추천 피드'}</div>
    <div class="feed-list">${state.feedMode==='following'?followingPosts:algorithmPosts}</div>
  </section>`;
}

function notificationView(){
  return `<section class="notification-screen">
    <div class="notification-filter"><button class="active">전체</button><button>활동</button><button>일정</button></div>
    <div class="notification-group">
      <h3>오늘</h3>
      <article class="notification-row unread">
        ${catAvatar('shark','notice-avatar')}
        <div class="notice-copy"><b>riverkim</b>님이 회원님의 핸드에 댓글을 남겼어요.<span>“턴에서는 작은 사이즈도 좋아 보여요.” · 12분</span></div>
        <div class="notice-preview hand">A♠</div>
      </article>
      <article class="notification-row unread">
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
