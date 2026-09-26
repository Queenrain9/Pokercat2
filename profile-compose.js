function profileView(key){
  const mine=key==='me';
  const u=mine?{name:state.nickname,handle:'@queenbee',cat:state.selectedCat,sub:`${state.gamePref} · ${state.playPref}`} : demoUsers[key];
  const following=!mine&&state.following.has(key);
  return `<section>
    <div class="profile-hero">
      <div class="profile-avatar">${catAvatar(u.cat,'profile-cat-image')}</div>
      <div class="profile-name">${u.name}</div>
      <div class="profile-handle">${u.handle}</div>
      <div class="bio">${mine?'홀덤 치고, 핸드 남기고, 좋은 사람들 만나는 중.':'포커 좋아하는 평범한 플레이어. 핸드 토론 환영.'}</div>
      <div class="poker-tags"><span>♠ ${mine?state.gamePref:'MTT'}</span><span>● ${mine?state.playPref:'Live'}</span><span>🇰🇷 Korea</span></div>
      <div class="stats"><div class="stat"><b>24</b><span>게시물</span></div><div class="stat"><b>312</b><span>팔로워</span></div><div class="stat"><b>188</b><span>팔로잉</span></div></div>
      <div class="profile-actions">
        ${mine?'<button class="btn secondary full" data-toast="프로필 편집은 다음 단계에서 연결할게요">프로필 편집</button>':`<button class="btn full" data-follow="${key}">${following?'팔로잉':'팔로우'}</button><button class="btn secondary" data-toast="메시지는 다음 단계에서 연결할게요">메시지</button>`}
      </div>
    </div>
    <div class="tabs"><button class="tab-btn ${state.profileTab==='posts'?'active':''}" data-profile-tab="posts">게시물</button><button class="tab-btn ${state.profileTab==='hands'?'active':''}" data-profile-tab="hands">핸드</button></div>
    <div class="content">
      ${state.profileTab==='hands'?`<article class="card feed-card">${hhCard(handA)}${actions('profilehand',11,4)}</article>`:
      `<article class="card feed-card"><div class="post-text" style="margin-top:0">오늘도 한 세션. 결과보다 판단 퀄리티에 집중하기.</div>${actions('profilepost',31,3)}</article>`}
      ${mine?`<button class="btn secondary full" style="margin-top:12px" data-reset>베타 온보딩 다시 보기</button>`:''}
    </div>
  </section>`;
}

function bottomNav(){
  const nav=[['home','홈','home'],['search','탐색','explore'],['plus','작성','compose'],['calendar','일정','schedule'],['profile','프로필','profile']];
  return `<nav class="bottom-nav">${nav.map(n=>`<button class="nav-item ${n[2]==='compose'?'compose':''} ${state.view===n[2]?'active':''}" data-nav="${n[2]}"><span class="nav-icon">${icon(n[0])}</span><span>${n[1]}</span></button>`).join('')}</nav>`;
}


function composeView(){
  const handMode=state.composeMode==='hand';
  return `<section class="compose-page">
    <div class="compose-author">
      <div class="avatar">${catAvatar(state.selectedCat,'avatar-cat-image')}</div>
      <div class="user-meta"><div class="user-name">${state.nickname}</div><div class="user-sub">새 게시물 작성</div></div>
      <button class="btn compose-submit" data-post-demo>게시</button>
    </div>

    <textarea class="compose-text" id="composeText" placeholder="무슨 생각을 하고 있어?">${escapeHtml(state.composeText)}</textarea>

    <div class="compose-tools">
      <button class="compose-tool" data-toast="사진 업로드는 실제 저장소 연결 단계에서 붙일게요">▧ 사진</button>
      <button class="compose-tool ${handMode?'active':''}" data-toggle-hand>♠ 핸드 히스토리</button>
    </div>

    ${handMode?handComposer():''}
  </section>`;
}

function handComposer(){
  return `<section class="hand-composer">
    <div class="hand-compose-head">
      <div><strong>핸드 히스토리</strong><span>카드를 눌러 빠르게 입력</span></div>
      <button class="text-link danger-link" data-remove-hand>제거</button>
    </div>

    <div class="hand-basic-grid">
      <label>게임<select id="hhGame"><option ${state.handMeta.game==='MTT'?'selected':''}>MTT</option><option ${state.handMeta.game==='Cash'?'selected':''}>Cash</option></select></label>
      <label>테이블<select id="hhPlayers"><option ${state.handMeta.players==='9-max'?'selected':''}>9-max</option><option ${state.handMeta.players==='8-max'?'selected':''}>8-max</option><option ${state.handMeta.players==='6-max'?'selected':''}>6-max</option></select></label>
      <label>Hero<select id="hhPos">${['UTG','UTG+1','HJ','CO','BTN','SB','BB'].map(p=>`<option ${state.handMeta.pos===p?'selected':''}>${p}</option>`).join('')}</select></label>
      <label>Eff. Stack<input id="hhStack" value="${escapeHtml(state.handMeta.stack)}" inputmode="decimal"></label>
    </div>

    <label class="inline-label">블라인드<input id="hhBlind" value="${escapeHtml(state.handMeta.blind)}" placeholder="SB / BB / Ante"></label>

    <div class="card-section">
      <div class="card-section-title"><b>내 핸드</b><span>2장</span></div>
      <div class="card-slots">${cardSlots('hero',2)}</div>
    </div>

    <div class="board-builder">
      <div class="card-section">
        <div class="card-section-title"><b>FLOP</b><span>3장</span></div>
        <div class="card-slots">${cardSlots('flop',3)}</div>
      </div>
      <div class="card-section">
        <div class="card-section-title"><b>TURN</b><span>1장</span></div>
        <div class="card-slots">${cardSlots('turn',1)}</div>
      </div>
      <div class="card-section">
        <div class="card-section-title"><b>RIVER</b><span>1장</span></div>
        <div class="card-slots">${cardSlots('river',1)}</div>
      </div>
    </div>

    ${state.cardTarget?cardPicker():''}

    <div class="street-actions">
      <label><b>PREFLOP</b><textarea id="hhPre" placeholder="예: CO 2.2BB → BTN 7BB → CO Call">${escapeHtml(state.handActions.pre)}</textarea></label>
      <label><b>FLOP</b><textarea id="hhFlop" placeholder="예: CO Check → BTN 33% → Call">${escapeHtml(state.handActions.flop)}</textarea></label>
      <label><b>TURN</b><textarea id="hhTurn" placeholder="예: CO Check → Hero ?">${escapeHtml(state.handActions.turn)}</textarea></label>
      <label><b>RIVER</b><textarea id="hhRiver" placeholder="아직 안 나왔으면 비워둬">${escapeHtml(state.handActions.river)}</textarea></label>
    </div>

    <button class="btn secondary full" data-preview-hand>핸드 카드 미리보기</button>
  </section>`;
}

function cardSlots(group,count){
  return Array.from({length:count},(_,i)=>{
    const value=state.handDraft[group][i]||'';
    const active=state.cardTarget===group+':'+i;
    const red=/[♥♦]/.test(value);
    return `<button class="card-slot ${active?'active':''} ${red?'red':''}" data-card-slot="${group}:${i}">${value||'<span>＋</span>'}</button>`;
  }).join('');
}

function cardPicker(){
  const ranks=['A','K','Q','J','T','9','8','7','6','5','4','3','2'];
  const suits=['♠','♥','♦','♣'];
  return `<div class="card-picker">
    <div class="picker-top"><b>카드 선택</b><button class="text-link" data-clear-card>선택 카드 지우기</button></div>
    <div class="rank-grid">${ranks.map(r=>`<button class="rank-btn ${state.cardRank===r?'active':''}" data-card-rank="${r}">${r}</button>`).join('')}</div>
    <div class="suit-grid">
      ${suits.map(s=>`<button class="suit-btn ${/[♥♦]/.test(s)?'red':''}" data-card-suit="${s}" ${state.cardRank?'':'disabled'}>${s}</button>`).join('')}
    </div>
    <div class="helper">${state.cardRank?'이제 무늬를 골라줘.':'먼저 숫자/문자를 골라줘.'}</div>
  </div>`;
}

function handDraftToData(){
  return {
    title:state.handMeta.pos+' Hand · '+state.handMeta.game,
    blinds:state.handMeta.blind||'Blinds',
    players:state.handMeta.players||'table',
    pos:state.handMeta.pos||'BTN',
    stack:state.handMeta.stack||'—',
    hole:state.handDraft.hero.filter(Boolean),
    board:[...state.handDraft.flop,...state.handDraft.turn,...state.handDraft.river].filter(Boolean),
    pre:state.handActions.pre,
    flop:state.handActions.flop,
    turn:state.handActions.turn,
    river:state.handActions.river
  };
}

function modalView(){
  if(state.modal==='handPreview'){
    const d=state.previewHand||handA;
    return sheet(`<div class="sheet-title">피드에서 이렇게 보여</div>${hhCard(d)}<button class="btn full" data-close-preview>계속 작성하기</button>`);
  }
  return '';
}

function sheet(content){
  return `<div class="modal-backdrop" data-close-modal><div class="sheet" onclick="event.stopPropagation()"><div class="grab"></div>${content}</div></div>`;
}

function parseCard(s){
  const suitMap={h:'♥',d:'♦',c:'♣',s:'♠',H:'♥',D:'♦',C:'♣',S:'♠'};
  s=s.trim();
  if(!s)return '';
  if(/[♥♦♣♠]/.test(s))return s.toUpperCase().replace('10','T');
  return s.slice(0,-1).toUpperCase().replace('10','T')+(suitMap[s.slice(-1)]||'');
}
function parseCards(txt){
  return txt.replaceAll('/',' ').split(/\s+/).filter(Boolean).map(parseCard);
}


function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
