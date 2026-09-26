const AUTH_FLOW_VERSION = '2';
if(localStorage.getItem('pokercat_auth_version') !== AUTH_FLOW_VERSION){
  localStorage.removeItem('pokercat_onboarded');
  localStorage.setItem('pokercat_auth_version', AUTH_FLOW_VERSION);
}

const cats = [
  ['🐱','Aggro Cat'],['🐈','Grinder Cat'],['😼','Bluff Cat'],
  ['😺','Social Cat'],['😸','Lucky Cat'],['🙀','Tilt Cat'],
  ['🐈‍⬛','Night Cat'],['😽','Live Cat'],['😹','Online Cat']
];

const demoUsers = {
  queenbee:{name:'QUEENBEE',handle:'@queenbee',cat:'🐈‍⬛',sub:'MTT · Live'},
  riverkim:{name:'RIVERKIM',handle:'@riverkim',cat:'😼',sub:'Cash · Online'},
  ninehigh:{name:'NINEHIGH',handle:'@ninehigh',cat:'🐱',sub:'MTT · Live'},
  minraise:{name:'MINRAISE',handle:'@minraise',cat:'😺',sub:'Mixed · Live'}
};

const state = {
  view:'home',
  profileTab:'posts',
  onboarding: localStorage.getItem('pokercat_onboarded') === '1',
  onboardStep:0,
  authMode:'login',
  selectedCat: Number(localStorage.getItem('pokercat_cat') || 6),
  nickname: localStorage.getItem('pokercat_name') || 'QUEENBEE',
  gamePref: localStorage.getItem('pokercat_game') || 'MTT',
  playPref: localStorage.getItem('pokercat_play') || '오프라인',
  modal:null,
  liked:new Set(),
  following:new Set(['riverkim']),
  composeMode:'post',
  handDraft:{hero:['',''],flop:['','',''],turn:[''],river:['']},
  cardTarget:null,
  cardRank:null,
  composeText:'',
  handMeta:{game:'MTT',players:'8-max',pos:'BTN',stack:'38BB',blind:'1K / 2K / 2K'},
  handActions:{pre:'',flop:'',turn:'',river:''}
};

document.documentElement.dataset.theme = 'dark';
localStorage.removeItem('pokercat_theme');

function icon(name){
  const map={home:'⌂',search:'⌕',plus:'＋',calendar:'▦',profile:'●'};
  return map[name]||'•';
}

function render(){
  const app=document.querySelector('#app');
  if(!state.onboarding){
    app.innerHTML = state.onboardStep===0 ? authView() : onboardView();
  } else {
    app.innerHTML = '<main class="phone">'+topbar()+mainView()+bottomNav()+'</main>'+modalView();
  }
  wire();
}

function authView(){
  if(state.authMode==='signup'){
    return `<section class="auth-wrap">
      <button class="auth-back" data-auth-back>‹ 로그인으로</button>
      <div class="brand-lockup compact">
        <div class="cat-mark">🐈‍⬛</div>
        <div class="brand-title">Poker<span style="color:var(--brand-strong)">Cat</span></div>
        <div class="brand-sub">새 계정을 만들 방법을 선택해.</div>
      </div>
      <div class="provider-list">
        <button class="provider google" data-auth>G&nbsp; Google로 가입하기</button>
        <button class="provider kakao" data-auth>●&nbsp; 카카오로 가입하기</button>
        <button class="provider apple" data-auth>&nbsp; Apple로 가입하기</button>
      </div>
      <div class="auth-foot">가입을 계속하면 PokerCat 이용약관 및 개인정보처리방침에 동의하게 됩니다.<br>현재는 베타 UI라 실제 계정 연동 전입니다.</div>
    </section>`;
  }

  return `<section class="auth-wrap">
    <div class="brand-lockup">
      <div class="cat-mark">🐈‍⬛</div>
      <div class="brand-title">Poker<span style="color:var(--brand-strong)">Cat</span></div>
      <div class="brand-sub">홀덤 플레이어들의 피드, 핸드,<br>그리고 포커 친구들.</div>
    </div>
    <div class="auth-form">
      <div class="field"><label>아이디 또는 이메일</label><input id="loginId" autocomplete="username" placeholder="아이디 또는 이메일"></div>
      <div class="field"><label>비밀번호</label><input id="loginPassword" type="password" autocomplete="current-password" placeholder="비밀번호"></div>
      <div class="auth-row"><button class="text-link" data-toast="비밀번호 찾기는 실제 계정 연동 단계에서 연결할게요">비밀번호를 잊었어?</button></div>
      <button class="btn full" data-login-demo>로그인</button>
    </div>
    <div class="auth-divider"><span>또는</span></div>
    <button class="btn secondary full" data-open-signup>회원가입</button>
    <div class="auth-foot">현재는 베타 UI라 로그인 버튼을 누르면 데모 계정으로 들어갑니다.</div>
  </section>`;
}

function onboardView(){
  if(state.onboardStep===1){
    return `<section class="onboard">
      <div class="step">PROFILE · 1/2</div>
      <h1>너의 첫 PokerCat을 골라봐.</h1>
      <p>지금은 임시 캐릭터야. 추후 홀덤 플레이어 유형을 담은 9종 고양이 디자인으로 교체될 예정이야.</p>
      <div class="cat-grid">${cats.map((c,i)=>`<button class="cat-choice ${state.selectedCat===i?'selected':''}" data-cat="${i}"><div class="cat">${c[0]}</div><b>${c[1]}</b></button>`).join('')}</div>
      <button class="btn full" data-next-onboard>다음</button>
    </section>`;
  }
  return `<section class="onboard">
    <div class="step">PROFILE · 2/2</div>
    <h1>포커 프로필을 가볍게 만들자.</h1>
    <p>언제든 프로필에서 바꿀 수 있어.</p>
    <div class="form" style="margin-top:22px">
      <div class="field"><label>닉네임</label><input id="nick" value="${state.nickname}" maxlength="16" placeholder="닉네임"></div>
      <div class="row2">
        <div class="field"><label>선호 게임</label><select id="gamePref"><option>MTT</option><option>Cash</option><option>Mixed</option></select></div>
        <div class="field"><label>주로 어디서?</label><select id="playPref"><option>오프라인</option><option>온라인</option><option>둘 다</option></select></div>
      </div>
      <button class="btn full" data-finish-onboard>프로필 만들기</button>
    </div>
  </section>`;
}

function topbar(){
  const titleMap={home:'Poker<span>Cat</span>',explore:'탐색',schedule:'대회 일정',profile:'프로필',compose:'새 게시물'};
  return `<header class="topbar">
    <div class="logo">${titleMap[state.view]||'Poker<span>Cat</span>'}</div>
    <div></div>
  </header>`;
}

function mainView(){
  if(state.view==='home') return homeView();
  if(state.view==='explore') return exploreView();
  if(state.view==='schedule') return scheduleView();
  if(state.view==='profile') return profileView('me');
  if(state.view==='compose') return composeView();
  if(state.view.startsWith('user:')) return profileView(state.view.split(':')[1]);
  return homeView();
}

