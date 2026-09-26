function profileView(key){
  const mine=key==='me';
  const u=mine?{name:state.nickname,handle:'@queenbee',cat:state.selectedCat,pubBrand:state.pubBrand,pubBranch:state.pubBranch}:demoUsers[key]||demoUsers.riverkim;
  return `<section class="profile-screen">
    <div class="profile-hero">
      <div class="profile-avatar">${catAvatar(u.cat,'profile-cat-image')}</div>
      <div class="profile-name-row">
        <div class="profile-name">${u.name}</div>
        ${u.pubBrand&&u.pubBranch?`<span class="profile-pub-badge" title="대표 홀덤펍"><i>♠</i><b>${escapeHtml(u.pubBrand)}</b> <small>${escapeHtml(u.pubBranch)}</small></span>`:''}
      </div>
      <div class="profile-handle">${u.handle}</div>
      <div class="bio">${mine?'홀덤 치고, 핸드 남기고, 좋은 사람들 만나는 중.':'포커 좋아하는 평범한 플레이어. 핸드 토론 환영.'}</div>
      <div class="poker-tags"><span>♠ ${mine?state.gamePref:'MTT'}</span><span>● ${mine?state.playPref:'Live'}</span><span>🇰🇷 Korea</span></div>
      <div class="stats"><div><b>24</b><span>게시물</span></div><div><b>312</b><span>팔로워</span></div><div><b>188</b><span>팔로잉</span></div></div>
      <button class="profile-edit" ${mine?'data-edit-profile':`data-follow="${key}"`}>${mine?'프로필 편집':state.following.has(key)?'팔로잉':'팔로우'}</button>
    </div>
    <div class="profile-tabs">
      <button class="${state.profileTab==='posts'?'active':''}" data-profile-tab="posts">게시물</button>
      <button class="${state.profileTab==='hands'?'active':''}" data-profile-tab="hands">핸드</button>
      <button class="${state.profileTab==='saved'?'active':''}" data-profile-tab="saved">북마크</button>
    </div>
    ${profileBody()}
  </section>`;
}
function profileBody(){
  if(state.profileTab==='hands')return `<div class="profile-body"><article class="feed-post detail-post">${hhCard(handA)}${actions('profilehand',42,18)}</article><article class="feed-post detail-post">${hhCard(handB)}${actions('profilehand2',21,9)}</article></div>`;
  if(state.profileTab==='saved')return `<div class="profile-body saved-state"><div class="saved-icon">⌑</div><b>저장한 게시물</b><span>마음에 든 핸드와 글을 여기에 모아둘 수 있어요.</span></div>`;
  return `<div class="profile-gallery">${['chips','arena','cards','cat','night','city','table','orange','crowd'].map(x=>`<div class="gallery-tile ${x}"></div>`).join('')}</div>`;
}

function profileEditModal(){
  const pubPreview=state.pubBrand&&state.pubBranch?`${escapeHtml(state.pubBrand)} ${escapeHtml(state.pubBranch)}`:'등록된 대표 홀덤펍 없음';
  return `<div class="modal-backdrop" data-close-modal>
    <div class="sheet profile-edit-sheet" onclick="event.stopPropagation()">
      <div class="grab"></div>
      <div class="profile-edit-head">
        <div><div class="sheet-title">프로필 편집</div><p>대표 홀덤펍은 닉네임 옆에 소속처럼 표시돼요.</p></div>
        <button data-close-profile-edit>닫기</button>
      </div>
      <div class="profile-edit-preview">
        ${catAvatar(state.selectedCat,'profile-edit-avatar')}
        <div><div class="edit-preview-name">${escapeHtml(state.nickname)}</div><div class="edit-preview-pub">${pubPreview}</div></div>
      </div>
      <div class="profile-edit-form">
        <label>닉네임<input id="editNickname" value="${escapeHtml(state.nickname)}" maxlength="16"></label>
        <div class="pub-edit-block">
          <div class="pub-edit-title"><b>대표 홀덤펍</b><span>브랜드와 지점명을 각각 입력해 주세요.</span></div>
          <label>브랜드<input id="editPubBrand" value="${escapeHtml(state.pubBrand)}" maxlength="20" placeholder="예: KMGM"></label>
          <label>지점명<input id="editPubBranch" value="${escapeHtml(state.pubBranch)}" maxlength="24" placeholder="예: 수원점"></label>
          <div class="pub-edit-helper">프로필에는 <b>KMGM 수원점</b>처럼 표시됩니다. 둘 다 비우면 소속이 제거돼요.</div>
        </div>
        <button class="btn full" data-save-profile>저장</button>
      </div>
    </div>
  </div>`;
}
function bottomNav(){
  const nav=[['home','홈','home'],['search','탐색','explore'],['plus','작성','compose'],['calendar','일정','schedule'],['profile','프로필','profile']];
  return `<nav class="bottom-nav">${nav.map(n=>`<button class="nav-item ${n[2]==='compose'?'compose':''} ${state.view===n[2]?'active':''}" data-nav="${n[2]}"><span class="nav-icon">${icon(n[0])}</span><span>${n[1]}</span></button>`).join('')}</nav>`;
}
function composeView(){
  if(state.composeMode==='hand')return handComposer();
  return `<section class="compose-screen">
    <header class="compose-top"><button data-nav="home">×</button><b>새 게시물</b><button class="post-link" data-post-demo>게시하기</button></header>
    <div class="compose-user">${catAvatar(state.selectedCat,'compose-cat')}<div><b>${state.nickname}</b><button class="audience">◉ 전체 공개⌄</button></div></div>
    <textarea class="compose-editor" id="composeText" placeholder="지금 무슨 이야기를 하고 싶으신가요?">${escapeHtml(state.composeText)}</textarea>
    <div class="compose-bottom-tools">
      <button data-toast="사진 업로드는 저장소 연결 단계에서 붙여요"><span>▧</span>사진</button>
      <button data-toggle-hand><span class="pink">♠</span>핸드 히스토리</button>
      <button data-toast="장소 태그는 준비 중이에요"><span>⌖</span>장소</button>
      <button data-toast="투표 기능은 준비 중이에요"><span>⌘</span>투표</button>
    </div>
  </section>`;
}
function handComposer(){
  return `<section class="hand-screen">
    <header class="compose-top"><button data-remove-hand>취소</button><b>핸드 히스토리 작성</b><button class="post-link" data-post-demo>다음</button></header>
    <div class="hand-form">
      <section><h3>내 카드</h3><div class="card-input-row">${cardSlots('hero',2)}<button class="add-card">＋</button></div></section>
      <section><h3>보드 카드</h3>
        <div class="board-entry"><label>FLOP</label><div>${cardSlots('flop',3)}</div></div>
        <div class="board-entry"><label>TURN</label><div>${cardSlots('turn',1)}</div></div>
        <div class="board-entry"><label>RIVER</label><div>${cardSlots('river',1)}<button class="add-card">＋</button></div></div>
      </section>
      ${state.cardTarget?cardPicker():''}
      <section><h3>액션 요약 <small>(선택)</small></h3><textarea id="hhPre" class="hand-textarea" placeholder="BTN 오픈에 BB에서 콜&#10;플랍 체크-콜, 턴 체크-레이즈, 리버...">${escapeHtml(state.handActions.pre)}</textarea></section>
      <section><h3>게임 정보 <small>(선택)</small></h3>
        <div class="chip-selector"><button class="active">MTT</button><button>라이브</button><button>Cash</button><button>온라인</button><button>펍</button></div>
        <label class="block-label">블라인드<input id="hhBlind" value="${escapeHtml(state.handMeta.blind)}"></label>
        <label class="checkline"><input type="checkbox"> 결과 <small>(선택)</small></label>
      </section>
      <button class="preview-link" data-preview-hand>피드 카드 미리보기</button>
    </div>
  </section>`;
}
function cardSlots(group,count){
  return Array.from({length:count},(_,i)=>{
    const v=state.handDraft[group][i]||'',active=state.cardTarget===group+':'+i,red=/[♥♦]/.test(v);
    return `<button class="card-slot ${active?'active':''} ${red?'red':''}" data-card-slot="${group}:${i}">${v?`<b>${v.slice(0,-1)}</b><span>${v.slice(-1)}</span>`:'＋'}</button>`;
  }).join('');
}
function cardPicker(){
  const ranks=['A','K','Q','J','T','9','8','7','6','5','4','3','2'],suits=['♠','♥','♦','♣'];
  return `<div class="card-picker"><div class="picker-top"><b>카드 선택</b><button data-clear-card>지우기</button></div><div class="rank-grid">${ranks.map(r=>`<button class="${state.cardRank===r?'active':''}" data-card-rank="${r}">${r}</button>`).join('')}</div><div class="suit-grid">${suits.map(s=>`<button class="${/[♥♦]/.test(s)?'red':''}" data-card-suit="${s}" ${state.cardRank?'':'disabled'}>${s}</button>`).join('')}</div></div>`;
}
function handDraftToData(){
  return {title:state.handMeta.pos+' Hand',blinds:state.handMeta.blind,players:state.handMeta.players,pos:state.handMeta.pos,stack:state.handMeta.stack,hole:state.handDraft.hero.filter(Boolean),board:[...state.handDraft.flop,...state.handDraft.turn,...state.handDraft.river].filter(Boolean),pre:state.handActions.pre||'BTN 오픈 → BB 콜',flop:'플랍 체크-콜',turn:'턴 체크-레이즈',river:'리버 콜'};
}
