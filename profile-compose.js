function profileView(key){
  const mine=key==='me';
  const u=mine?{name:state.nickname,handle:'@queenbee',cat:cats[state.selectedCat][0],sub:`${state.gamePref} · ${state.playPref}`} : demoUsers[key];
  const following=!mine&&state.following.has(key);
  return `<section>
    <div class="profile-hero">
      <div class="profile-avatar">${u.cat}</div>
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

function modalView(){
  if(!state.modal) return '';
  if(state.modal==='compose'){
    return sheet(`<div class="sheet-title">새 글 만들기</div>
      <div class="choice-grid">
        <button class="choice" data-compose-type="normal"><div style="font-size:28px">✎</div><b>일반 글</b><span>텍스트와 사진을 올려요.</span></button>
        <button class="choice" data-compose-type="hand"><div style="font-size:28px">♠</div><b>핸드 히스토리</b><span>포커 상황을 깔끔하게 정리해요.</span></button>
      </div>`);
  }
  if(state.modal==='normal'){
    return sheet(`<div class="sheet-title">일반 글</div><div class="form">
      <div class="field"><textarea placeholder="무슨 생각을 하고 있어?"></textarea></div>
      <button class="btn full" data-post-demo>게시하기</button>
    </div>`);
  }
  if(state.modal==='hand'){
    return sheet(`<div class="sheet-title">핸드 히스토리 작성</div>
      <div class="form">
        <div class="row2"><div class="field"><label>게임</label><select id="hhGame"><option>MTT</option><option>Cash</option></select></div><div class="field"><label>테이블</label><select><option>9-max</option><option>8-max</option><option>6-max</option></select></div></div>
        <div class="row2"><div class="field"><label>블라인드</label><input id="hhBlind" placeholder="1K / 2K / 2K" value="1K / 2K / 2K"></div><div class="field"><label>Effective Stack</label><input id="hhStack" placeholder="38BB" value="38BB"></div></div>
        <div class="row2"><div class="field"><label>Hero Position</label><select id="hhPos"><option>UTG</option><option>HJ</option><option>CO</option><option selected>BTN</option><option>SB</option><option>BB</option></select></div><div class="field"><label>내 카드</label><input id="hhHole" placeholder="Ah Qh" value="Ah Qh"></div></div>
        <div class="field"><label>보드</label><input id="hhBoard" placeholder="Qc 8h 4h / 6s / 2d" value="Qc 8h 4h / 6s"></div>
        <div class="street-editor"><strong>Preflop</strong><textarea id="hhPre">CO 2.2BB → BTN 7BB → CO Call</textarea></div>
        <div class="street-editor"><strong>Flop</strong><textarea id="hhFlop">CO Check → BTN 33% → Call</textarea></div>
        <div class="street-editor"><strong>Turn</strong><textarea id="hhTurn">CO Check → Hero ?</textarea></div>
        <div class="street-editor"><strong>River</strong><textarea id="hhRiver" placeholder="아직 안 나왔으면 비워두기"></textarea></div>
        <div class="helper">지금은 입력 구조를 잡는 베타 UI야. 카드 자동완성, 플레이어별 액션 빌더, 팟 계산은 다음 단계에서 다듬을 수 있어.</div>
        <button class="btn full" data-preview-hand>미리보기 & 게시</button>
      </div>`);
  }
  if(state.modal==='handPreview'){
    const d=state.previewHand||handA;
    return sheet(`<div class="sheet-title">피드에서 이렇게 보여</div>${hhCard(d)}<button class="btn full" data-post-demo>이 형식으로 게시하기</button>`);
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

