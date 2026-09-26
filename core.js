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
  selectedCat: Number(localStorage.getItem('pokercat_cat') || 6),
  nickname: localStorage.getItem('pokercat_name') || 'QUEENBEE',
  gamePref: localStorage.getItem('pokercat_game') || 'MTT',
  playPref: localStorage.getItem('pokercat_play') || '오프라인',
  modal:null,
  liked:new Set(),
  following:new Set(['riverkim'])
};

function themeInit(){
  const saved = localStorage.getItem('pokercat_theme');
  const dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}
themeInit();

function icon(name){
  const map={home:'⌂',search:'⌕',plus:'＋',calendar:'▦',profile:'●',sun:'☀︎',moon:'☾'};
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
  return `<section class="auth-wrap">
    <div class="brand-lockup">
      <div class="cat-mark">🐈‍⬛</div>
      <div class="brand-title">Poker<span style="color:var(--brand-strong)">Cat</span></div>
      <div class="brand-sub">홀덤 플레이어들의 피드, 핸드,<br>그리고 포커 친구들.</div>
    </div>
    <div class="provider-list">
      <button class="provider google" data-auth>G&nbsp; Google로 계속하기</button>
      <button class="provider kakao" data-auth>●&nbsp; 카카오로 계속하기</button>
      <button class="provider apple" data-auth>&nbsp; Apple로 계속하기</button>
    </div>
    <div class="auth-foot">계속하면 PokerCat 이용약관 및 개인정보처리방침에 동의하게 됩니다.<br>현재 화면은 베타 UI이며 실제 소셜 로그인은 연결 전입니다.</div>
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
  const titleMap={home:'Poker<span>Cat</span>',explore:'탐색',schedule:'대회 일정',profile:'프로필'};
  return `<header class="topbar">
    <div class="logo">${titleMap[state.view]||'Poker<span>Cat</span>'}</div>
    <div class="theme-toggle">
      <button class="icon-btn" data-theme aria-label="테마 변경">${document.documentElement.dataset.theme==='dark'?icon('sun'):icon('moon')}</button>
    </div>
  </header>`;
}

function mainView(){
  if(state.view==='home') return homeView();
  if(state.view==='explore') return exploreView();
  if(state.view==='schedule') return scheduleView();
  if(state.view==='profile') return profileView('me');
  if(state.view.startsWith('user:')) return profileView(state.view.split(':')[1]);
  return homeView();
}

