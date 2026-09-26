function userRow(key){
  const u=demoUsers[key];
  const isFollowing=state.following.has(key);
  return `<div class="user-row">
    <button class="avatar" data-user="${key}" style="border:none">${catAvatar(u.cat,'avatar-cat-image')}</button>
    <div class="user-meta"><div class="user-name">${u.name}</div><div class="user-sub">${u.sub} · 18분</div></div>
    <button class="follow-btn ${isFollowing?'following':''}" data-follow="${key}">${isFollowing?'팔로잉':'팔로우'}</button>
  </div>`;
}

function hhCard(data){
  return `<div class="hh-card">
    <div class="hh-head"><div><div class="hh-title">${data.title}</div><div class="user-sub">${data.blinds} · ${data.players}</div></div><span class="tag">HAND</span></div>
    <div class="hh-summary">
      <div><div class="user-sub" style="margin-bottom:6px">HERO · ${data.pos}</div><div class="hole-cards">${cards(data.hole)}</div></div>
      <div class="stack-box"><strong>${data.stack}</strong><span>effective</span></div>
    </div>
    <div class="board-row">${cards(data.board,true)}</div>
    <div class="street-list">
      ${data.pre?`<div class="street"><b>PREFLOP</b>${data.pre}</div>`:''}
      ${data.flop?`<div class="street"><b>FLOP</b>${data.flop}</div>`:''}
      ${data.turn?`<div class="street"><b>TURN</b>${data.turn}</div>`:''}
      ${data.river?`<div class="street"><b>RIVER</b>${data.river}</div>`:''}
    </div>
  </div>`;
}
function cards(list){
  if(!list) return '';
  return list.map(c=>{
    const red=/[♥♦]/.test(c);
    return `<div class="playing-card ${red?'red':''}">${c}</div>`;
  }).join('');
}

const handA={title:'BTN vs BB · 3Bet Pot',blinds:'1K / 2K / 2K',players:'8-max',pos:'BTN',stack:'38.5BB',hole:['A♥','Q♥'],board:['Q♣','8♥','4♥','6♠'],pre:'CO 2.2BB → BTN 7BB → CO Call',flop:'CO Check → BTN 33% → Call',turn:'CO Check → Hero ?'};
const handB={title:'SB vs BB · Single Raised Pot',blinds:'2K / 4K / 4K',players:'9-max',pos:'BB',stack:'24BB',hole:['9♠','8♠'],board:['J♠','7♦','2♣','T♥','3♣'],pre:'SB 2.5BB → BB Call',flop:'SB 30% → BB Call',turn:'SB Check → BB 70% → Call',river:'SB Check → BB ?'};

function homeView(){
  return `<section class="content">
    <article class="card feed-card">
      ${userRow('ninehigh')}
      <div class="post-text">어제 데일리에서 이 턴 진짜 고민했음. 여기 사이즈 뭐가 제일 자연스러워 보여?</div>
      ${hhCard(handA)}
      ${actions('p1',28,12)}
    </article>

    <article class="card feed-card">
      ${userRow('riverkim')}
      <div class="post-text">오랜만에 온라인 캐시. 새벽 세션 끝 🌙<br>오늘은 블러프보다 밸류를 더 잘 챙긴 날.</div>
      <div class="post-photo">SESSION SNAPSHOT<br><span style="font-size:12px;opacity:.72">image placeholder</span></div>
      ${actions('p2',42,7)}
    </article>

    <article class="card feed-card">
      ${userRow('minraise')}
      <div class="post-text">리버에서 얇게 한 번 더 갈 수 있었나? 의견 궁금.</div>
      ${hhCard(handB)}
      ${actions('p3',17,19)}
    </article>
  </section>`;
}

function actions(id,likes,comments){
  const liked=state.liked.has(id);
  return `<div class="post-actions">
    <button class="${liked?'liked':''}" data-like="${id}">${liked?'♥':'♡'} ${likes+(liked?1:0)}</button>
    <button data-comment>◯ ${comments}</button>
    <button data-toast="저장했어요">⌑ 저장</button>
    <button data-toast="공유 링크를 준비했어요">↗ 공유</button>
  </div>`;
}

function exploreView(){
  return `<section class="content">
    <div class="empty-state">
      <div class="empty-icon">⌕</div>
      <h3>탐색은 아직 비워두었어.</h3>
      <p>플레이어 검색, 트렌딩 핸드, 태그, 추천 구조는 다음 기획에서 정하면 돼.</p>
    </div>
  </section>`;
}

function scheduleView(){
  const events=[
    ['SEP 27','PokerCat Weekly 100K','서울 · NLH MTT','100K','14:00'],
    ['OCT 02','Autumn Main Event Day 1A','수도권 · Main Event','300K','13:00'],
    ['OCT 03','Autumn Main Event Day 1B','수도권 · Main Event','300K','13:00'],
    ['OCT 09','Mystery Bounty Night','서울 · Mystery Bounty','150K','18:00']
  ];
  return `<section class="content">
    <div class="section-title">다가오는 대회</div>
    ${events.map(e=>`<article class="card schedule-card">
      <div class="schedule-date">${e[0]}</div>
      <div class="schedule-name">${e[1]}</div>
      <div class="schedule-meta"><span>📍 ${e[2]}</span><span>🎟 ${e[3]}</span><span>◷ ${e[4]}</span></div>
    </article>`).join('')}
    <div class="helper" style="text-align:center;margin:18px 0">현재는 레이아웃용 샘플 일정입니다.</div>
  </section>`;
}

