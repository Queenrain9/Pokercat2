function profileView(key){
  const mine=key==='me';
  const u=mine?myUser():getUser(key);
  const hp=verifiedHomePub(u);
  const pendingHp=mine&&state.homePub&&state.homePub.status!=='verified'?state.homePub:null;
  const followersCount=mine?state.followers.size:24;
  const followingCount=mine?state.following.size:18;
  const followLabel=!mine?(state.following.has(key)?'팔로잉':'팔로우'):'프로필 편집';

  let homePubLine='';
  if(hp){
    homePubLine=mine
      ?`<button class="profile-identity-line homepub verified" data-open-homepub><span>🏠</span><div><small>Home Pub</small><b>${escapeHtml(hp.brand)} ${escapeHtml(hp.branch)}</b></div><em>인증 ✓</em><i>›</i></button>`
      :`<div class="profile-identity-line homepub verified"><span>🏠</span><div><small>Home Pub</small><b>${escapeHtml(hp.brand)} ${escapeHtml(hp.branch)}</b></div><em>인증 ✓</em></div>`;
  }else if(pendingHp){
    homePubLine=`<button class="profile-identity-line homepub pending" data-open-homepub-verify><span>🏠</span><div><small>Home Pub</small><b>${escapeHtml(pendingHp.brand)} ${escapeHtml(pendingHp.branch)}</b></div><em>미인증</em><i>›</i></button>`;
  }else if(mine){
    homePubLine=`<button class="profile-identity-line homepub empty" data-edit-profile><span>🏠</span><div><small>Home Pub</small><b>대표 지점 등록하기</b></div><i>›</i></button>`;
  }else{
    homePubLine=`<div class="profile-identity-line homepub empty"><span>🏠</span><div><small>Home Pub</small><b>등록되지 않음</b></div></div>`;
  }

  return `<section class="profile-screen">
    <div class="profile-hero">
      <div class="profile-avatar">${catAvatar(u.cat,'profile-cat-image')}</div>
      <div class="profile-name-row"><div class="profile-name">${escapeHtml(u.name)}</div></div>
      <div class="profile-handle">${u.handle}</div>

      <div class="profile-identity-stack">
        ${homePubLine}
      </div>

      <div class="bio">${mine?'홀덤 치고, 핸드 남기고, 좋은 사람들 만나는 중.':'포커 좋아하는 평범한 플레이어. 핸드 토론 환영.'}</div>
      <div class="poker-tags"><span>♠ ${mine?state.gamePref:'MTT'}</span><span>● ${mine?state.playPref:'Live'}</span><span>🇰🇷 Korea</span></div>

      <div class="stats">
        <div><b>24</b><span>게시물</span></div>
        <button ${mine?'data-relationship="followers"':''}><b>${followersCount}</b><span>팔로워</span></button>
        <button ${mine?'data-relationship="following"':''}><b>${followingCount}</b><span>팔로잉</span></button>
      </div>

      <button class="profile-edit" ${mine?'data-edit-profile':`data-follow="${key}"`}>${followLabel}</button>
    </div>

    <div class="profile-tabs four-tabs">
      <button class="${state.profileTab==='posts'?'active':''}" data-profile-tab="posts">게시물</button>
      <button class="${state.profileTab==='hands'?'active':''}" data-profile-tab="hands">핸드</button>
      <button class="${state.profileTab==='career'?'active':''}" data-profile-tab="career">커리어</button>
      <button class="${state.profileTab==='saved'?'active':''}" data-profile-tab="saved">북마크</button>
    </div>
    ${profileBody(mine,key,u)}
  </section>`;
}

function profileBody(mine,key,u){
  if(state.profileTab==='hands')return `<div class="profile-body"><article class="feed-post detail-post">${hhCard(handA)}${actions('profilehand',42,18)}</article><article class="feed-post detail-post">${hhCard(handB)}${actions('profilehand2',21,9)}</article></div>`;
  if(state.profileTab==='career')return careerHighView(mine,key);
  if(state.profileTab==='saved')return `<div class="profile-body saved-state"><div class="saved-icon">⌑</div><b>저장한 게시물</b><span>마음에 든 핸드와 글을 여기에 모아둘 수 있어요.</span></div>`;
  return `<div class="profile-gallery">${['chips','arena','cards','cat','night','city','table','orange','crowd'].map(x=>`<div class="gallery-tile ${x}"></div>`).join('')}</div>`;
}

function careerHighView(mine,key){
  const demoCareer=[
    {id:'demo-1',title:'Final Table',category:'Final Table',tournamentName:'Sunday Main',date:'2026-08-23',prize:'₩1,800,000',description:'첫 메인 이벤트 파이널 테이블.'},
    {id:'demo-2',title:'펍 토너 우승',category:'우승',tournamentName:'Weekly Deepstack',date:'2026-07-11',prize:'₩650,000',description:''}
  ];
  const items=mine?state.careerHighs:demoCareer;
  return `<div class="career-section">
    <div class="career-head"><div><b>커리어</b><span>기억하고 싶은 포커 성과를 전시해요.</span></div>${mine?'<button data-career-add>＋ 기록 추가</button>':''}</div>
    <div class="career-list">
      ${items.length?items.map((item,i)=>careerCard(item,mine,i)).join(''):`<div class="career-empty"><span>♠</span><b>아직 전시된 기록이 없어요</b><p>첫 우승, Day 2, Final Table 같은 순간을 남겨보세요.</p>${mine?'<button data-career-add>첫 커리어 등록</button>':''}</div>`}
    </div>
  </div>`;
}
function careerCard(item,mine,index){
  return `<article class="career-card">
    <div class="career-rank">${String(index+1).padStart(2,'0')}</div>
    <div class="career-main">
      <div class="career-category">${escapeHtml(item.category||'Achievement')}</div>
      <h3>${escapeHtml(item.title||'커리어')}</h3>
      ${item.tournamentName?`<div class="career-tournament">${escapeHtml(item.tournamentName)}</div>`:''}
      <div class="career-meta">${item.date?`<span>${escapeHtml(item.date)}</span>`:''}${item.prize?`<strong>${escapeHtml(item.prize)}</strong>`:''}</div>
      ${item.description?`<p>${escapeHtml(item.description)}</p>`:''}
    </div>
    ${mine?`<div class="career-actions"><button data-career-edit="${item.id}">수정</button><button data-career-delete="${item.id}">삭제</button></div>`:''}
  </article>`;
}

function profileEditModal(){
  const hp=state.homePub;
  const pubPreview=hp?`${escapeHtml(hp.brand)} ${escapeHtml(hp.branch)} · ${hp.status==='verified'?'인증 완료':'미인증'}`:'등록된 Home Pub 없음';
  return `<div class="modal-backdrop" data-close-modal>
    <div class="sheet profile-edit-sheet" onclick="event.stopPropagation()">
      <div class="grab"></div>
      <div class="profile-edit-head"><div><div class="sheet-title">프로필 편집</div><p>Home Pub은 한 곳만 등록할 수 있어요.</p></div><button data-close-profile-edit>닫기</button></div>
      <div class="profile-edit-preview">${catAvatar(state.selectedCat,'profile-edit-avatar')}<div><div class="edit-preview-name">${escapeHtml(state.nickname)}</div><div class="edit-preview-pub">${pubPreview}</div></div></div>
      <div class="profile-edit-form">
        <label>닉네임<input id="editNickname" value="${escapeHtml(state.nickname)}" maxlength="16"></label>
        <div class="pub-edit-block">
          <div class="pub-edit-title"><b>🏠 Home Pub</b><span>인증된 대표 지점은 프로필 소속과 지점 커뮤니티 기준이 됩니다.</span></div>
          <label>브랜드<input id="editPubBrand" value="${escapeHtml(hp?.brand||'')}" maxlength="20" placeholder="예: KMGM"></label>
          <label>지점명<input id="editPubBranch" value="${escapeHtml(hp?.branch||'')}" maxlength="24" placeholder="예: 수원점"></label>
          <div class="pub-edit-helper">Home Pub을 변경하면 기존 인증은 해제되고 다시 인증해야 해요. 둘 다 비우면 Home Pub이 제거됩니다.</div>
          ${hp?.status==='verified'?'<div class="verification-state verified">✓ Home Pub 인증 완료</div>':hp?'<div class="verification-state pending">! 저장 후 Home Pub 인증이 필요해요</div>':''}
        </div>
        <button class="btn full" data-save-profile>프로필 저장</button>
        ${hp&&hp.status!=='verified'?'<button class="btn secondary full" data-open-homepub-verify>Home Pub 인증하기</button>':''}
      </div>
    </div>
  </div>`;
}

function homePubVerifyModal(){
  const hp=state.homePub;
  if(!hp)return '';
  return `<div class="modal-backdrop" data-close-modal><div class="sheet verify-sheet" onclick="event.stopPropagation()">
    <div class="grab"></div>
    <div class="verify-icon">🏠</div>
    <div class="sheet-title">Home Pub 인증</div>
    <p class="verify-lead"><b>${escapeHtml(hp.brand)} ${escapeHtml(hp.branch)}</b><br>인증된 사용자만 이 지점 커뮤니티를 이용할 수 있어요.</p>
    <div class="mvp-verification-box"><b>MVP 지점 코드 인증</b><span>현재 베타에서는 테스트 코드로 인증 흐름을 검증합니다. 정식 버전에서는 공식 펍/제휴 인증 provider로 교체됩니다.</span><code>테스트 코드 · CAT1</code></div>
    <label class="verify-code-label">지점 인증 코드<input id="homePubVerifyCode" maxlength="8" placeholder="CAT1"></label>
    <button class="btn full" data-verify-homepub>인증 완료</button>
  </div></div>`;
}

function relationshipModal(){
  const mode=state.relationshipMode==='followers'?'followers':'following';
  const keys=mode==='followers'?[...state.followers]:[...state.following];
  const title=mode==='followers'?'Followers':'Following';
  return `<div class="modal-backdrop" data-close-modal><div class="sheet relationship-sheet" onclick="event.stopPropagation()">
    <div class="grab"></div><div class="sheet-title">${title}</div>
    <div class="relationship-summary">포커캣에서 연결된 플레이어 · ${keys.length}</div>
    <div class="relationship-list">${keys.length?keys.map(k=>relationshipRow(k)).join(''):'<div class="relationship-empty">아직 표시할 플레이어가 없어요.</div>'}</div>
  </div></div>`;
}
function relationshipRow(key){
  const u=getUser(key),hp=verifiedHomePub(u);
  return `<div class="relationship-row">${catAvatar(u.cat,'relationship-avatar')}<div><b>${escapeHtml(u.name)}</b><span>${hp?`🏠 ${escapeHtml(hp.brand)} ${escapeHtml(hp.branch)}`:u.handle}</span></div><button data-user="${key}">보기</button></div>`;
}

function careerEditModal(){
  const item=state.careerHighs.find(x=>x.id===state.editingCareerId)||{id:'',title:'',category:'기타',tournamentName:'',date:'',prize:'',description:'',imageUrl:null};
  const categories=['Day 2','Final Table','우승','ITM','최고 상금','기타'];
  if(item.category&&!categories.includes(item.category))categories.push(item.category);
  return `<div class="modal-backdrop" data-close-modal><div class="sheet career-edit-sheet" onclick="event.stopPropagation()">
    <div class="grab"></div><div class="sheet-title">${item.id?'커리어 수정':'커리어 기록 추가'}</div>
    <div class="career-form">
      <label>기록명 *<input id="careerTitle" value="${escapeHtml(item.title)}" maxlength="80" required placeholder="예: Main Event Day 2"></label>
      <label>분류<select id="careerCategory">${categories.map(category=>`<option ${item.category===category?'selected':''}>${escapeHtml(category)}</option>`).join('')}</select></label>
      <label>대회명<input id="careerTournament" value="${escapeHtml(item.tournamentName||'')}" maxlength="100" placeholder="선택"></label>
      <div class="career-form-row"><label>날짜<input id="careerDate" type="date" value="${escapeHtml(item.date||'')}"></label><label>상금<input id="careerPrize" value="${escapeHtml(item.prize||'')}" maxlength="40" placeholder="₩5,000,000"></label></div>
      <label>설명<textarea id="careerDescription" maxlength="280" placeholder="이 기록에 대한 짧은 설명">${escapeHtml(item.description||'')}</textarea></label>
      <button class="btn full" data-save-career>${item.id?'수정 저장':'기록 저장'}</button>
    </div>
  </div></div>`;
}
function bottomNav(){
  const nav=[['home','홈','home'],['search','탐색','explore'],['plus','작성','compose'],['tools','툴즈','tools'],['profile','프로필','profile']];
  return `<nav class="bottom-nav">${nav.map(n=>{const active=state.view===n[2]||(state.view==='homepub'&&n[2]==='profile');return `<button class="nav-item ${n[2]==='compose'?'compose':''} ${active?'active':''}" data-nav="${n[2]}"><span class="nav-icon">${icon(n[0])}</span><span>${n[1]}</span></button>`}).join('')}</nav>`;
}

function composeView(){
  if(state.composeMode==='hand')return handComposer();
  return `<section class="compose-screen"><header class="compose-top"><button data-nav="home">×</button><b>새 게시물</b><button class="post-link" data-post-demo>게시하기</button></header>
    <div class="compose-user">${catAvatar(state.selectedCat,'compose-cat')}<div><b>${state.nickname}</b><button class="audience">◉ 전체 공개⌄</button></div></div>
    <textarea class="compose-editor" id="composeText" placeholder="지금 무슨 이야기를 하고 싶으신가요?">${escapeHtml(state.composeText)}</textarea>
    <div class="compose-bottom-tools"><button data-toast="사진 업로드는 저장소 연결 단계에서 붙여요"><span>▧</span>사진</button><button data-toggle-hand><span class="pink">♠</span>핸드 히스토리</button><button data-toast="장소 태그는 준비 중이에요"><span>⌖</span>장소</button><button data-toast="투표 기능은 준비 중이에요"><span>⌘</span>투표</button></div>
  </section>`;
}

function handComposer(){
  return `<section class="hand-screen"><header class="compose-top"><button data-remove-hand>취소</button><b>핸드 히스토리 작성</b><button class="post-link" data-post-demo>다음</button></header>
    <div class="hand-form">
      <section><h3>내 카드</h3><div class="card-input-row">${cardSlots('hero',2)}<button class="add-card">＋</button></div></section>
      <section><h3>보드 카드</h3><div class="board-entry"><label>FLOP</label><div>${cardSlots('flop',3)}</div></div><div class="board-entry"><label>TURN</label><div>${cardSlots('turn',1)}</div></div><div class="board-entry"><label>RIVER</label><div>${cardSlots('river',1)}<button class="add-card">＋</button></div></div></section>
      ${state.cardTarget?cardPicker():''}
      <section><h3>액션 요약 <small>(선택)</small></h3><textarea id="hhPre" class="hand-textarea" placeholder="BTN 오픈에 BB에서 콜&#10;플랍 체크-콜, 턴 체크-레이즈, 리버...">${escapeHtml(state.handActions.pre)}</textarea></section>
      <section><h3>게임 정보 <small>(선택)</small></h3><div class="chip-selector"><button class="active">MTT</button><button>라이브</button><button>Cash</button><button>온라인</button><button>펍</button></div><label class="block-label">블라인드<input id="hhBlind" value="${escapeHtml(state.handMeta.blind)}"></label><label class="checkline"><input type="checkbox"> 결과 <small>(선택)</small></label></section>
      <button class="preview-link" data-preview-hand>피드 카드 미리보기</button>
    </div>
  </section>`;
}
function cardSlots(group,count){return Array.from({length:count},(_,i)=>{const v=state.handDraft[group][i]||'',active=state.cardTarget===group+':'+i,red=/[♥♦]/.test(v);return `<button class="card-slot ${active?'active':''} ${red?'red':''}" data-card-slot="${group}:${i}">${v?`<b>${v.slice(0,-1)}</b><span>${v.slice(-1)}</span>`:'＋'}</button>`}).join('')}
function cardPicker(){const ranks=['A','K','Q','J','T','9','8','7','6','5','4','3','2'],suits=['♠','♥','♦','♣'];return `<div class="card-picker"><div class="picker-top"><b>카드 선택</b><button data-clear-card>지우기</button></div><div class="rank-grid">${ranks.map(r=>`<button class="${state.cardRank===r?'active':''}" data-card-rank="${r}">${r}</button>`).join('')}</div><div class="suit-grid">${suits.map(s=>`<button class="${/[♥♦]/.test(s)?'red':''}" data-card-suit="${s}" ${state.cardRank?'':'disabled'}>${s}</button>`).join('')}</div></div>`}
function handDraftToData(){return {title:state.handMeta.pos+' Hand',blinds:state.handMeta.blind,players:state.handMeta.players,pos:state.handMeta.pos,stack:state.handMeta.stack,hole:state.handDraft.hero.filter(Boolean),board:[...state.handDraft.flop,...state.handDraft.turn,...state.handDraft.river].filter(Boolean),pre:state.handActions.pre||'BTN 오픈 → BB 콜',flop:'플랍 체크-콜',turn:'턴 체크-레이즈',river:'리버 콜'}}

function pokerRoomBottomNavV1(){
  if(state.view==='roomcreate'||state.view.startsWith('room:'))return '';
  const nav=[['home','홈','home'],['search','탐색','explore'],['plus','작성','compose'],['calendar','일정','schedule'],['profile','프로필','profile']];
  return `<nav class="bottom-nav">${nav.map(n=>{
    const active=state.view===n[2]||(state.view==='homepub'&&n[2]==='profile');
    if(n[2]==='compose')return `<button class="nav-item compose ${state.view==='compose'||state.view==='roomcreate'?'active':''}" data-open-create-menu><span class="nav-icon">${icon(n[0])}</span><span>작성</span></button>`;
    return `<button class="nav-item ${active?'active':''}" data-nav="${n[2]}"><span class="nav-icon">${icon(n[0])}</span><span>${n[1]}</span></button>`;
  }).join('')}</nav>`;
}
function bottomNav(){return pokerRoomBottomNavV1()}
