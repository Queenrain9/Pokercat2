const AUTH_FLOW_VERSION='3';
if(localStorage.getItem('pokercat_auth_version')!==AUTH_FLOW_VERSION){localStorage.removeItem('pokercat_onboarded');localStorage.setItem('pokercat_auth_version',AUTH_FLOW_VERSION);}
const cats=[
{id:'rock',name:'The Rock',pos:'0% 0%'},{id:'shark',name:'The Shark',pos:'50% 0%'},{id:'maniac',name:'The Maniac',pos:'100% 0%'},
{id:'solver',name:'The Solver',pos:'0% 50%'},{id:'trapper',name:'The Trapper',pos:'50% 50%'},{id:'hero-caller',name:'The Hero Caller',pos:'100% 50%'},
{id:'queen',name:'The Queen',pos:'0% 100%'},{id:'darling',name:'The Darling',pos:'50% 100%'},{id:'grinder',name:'The Grinder',pos:'100% 100%'}];
const demoUsers={
queenbee:{name:'QUEENBEE',handle:'@queenbee',cat:'darling',sub:'MTT · Live'},riverkim:{name:'riverkim',handle:'@riverkim',cat:'shark',sub:'2시간 전 · Manila'},
minraise:{name:'minraise',handle:'@minraise',cat:'solver',sub:'Cash · Online'},chiplee:{name:'chiplee',handle:'@chiplee',cat:'grinder',sub:'MTT · Live'},ninehigh:{name:'ninehigh',handle:'@ninehigh',cat:'rock',sub:'MTT · Live'}};
function catByRef(ref){if(typeof ref==='number')return cats[ref]||cats[0];if(typeof ref==='string')return cats.find(c=>c.id===ref)||cats[0];return ref||cats[0]}
function catAvatar(ref,className='cat-avatar-image'){const cat=catByRef(ref);return `<span class="poker-cat-avatar ${className}" style="--cat-pos:${cat.pos}" role="img" aria-label="${cat.name}"></span>`}
const state={
view:'home',onboarding:localStorage.getItem('pokercat_onboarded')==='1',onboardStep:0,authMode:'landing',
selectedCat:Number(localStorage.getItem('pokercat_cat')||7),nickname:localStorage.getItem('pokercat_name')||'QUEENBEE',
gamePref:localStorage.getItem('pokercat_game')||'MTT',playPref:localStorage.getItem('pokercat_play')||'오프라인',
pubBrand:localStorage.getItem('pokercat_pub_brand')||'',pubBranch:localStorage.getItem('pokercat_pub_branch')||'',
feedMode:'algorithm',exploreTab:'popular',scheduleTab:'events',profileTab:'posts',notificationsRead:false,modal:null,liked:new Set(),following:new Set(['riverkim']),
composeMode:'post',composeText:'',handDraft:{hero:['A♠','K♠'],flop:['Q♥','J♠','7♣'],turn:['2♦'],river:['9♣']},cardTarget:null,cardRank:null,
handMeta:{game:'MTT',players:'8-max',pos:'BTN',stack:'38BB',blind:'1K / 2K (Ante 2K)'},handActions:{pre:'BTN 오픈에 BB에서 콜',flop:'플랍 체크-콜',turn:'턴 체크-레이즈',river:'리버 콜'}};
document.documentElement.dataset.theme='dark';
function icon(name){const map={home:'⌂',search:'⌕',plus:'＋',calendar:'▦',profile:'♙'};return map[name]||'•'}
function render(){const app=document.querySelector('#app');if(!state.onboarding){app.innerHTML=state.onboardStep===0?authView():onboardView()}else{app.innerHTML='<main class="phone">'+topbar()+mainView()+bottomNav()+'</main>'+modalView()}wire()}
function authView(){
if(state.authMode==='login')return `<section class="auth-wrap login-panel"><button class="auth-back" data-auth-back>‹ 돌아가기</button><div class="brand-lockup compact"><div class="brand-title">POKER<span>CAT</span></div><div class="brand-sub">포커하는 고양이들이 모이는 곳</div></div><div class="auth-form"><div class="field"><label>아이디 또는 이메일</label><input id="loginId" placeholder="아이디 또는 이메일"></div><div class="field"><label>비밀번호</label><input id="loginPassword" type="password" placeholder="비밀번호"></div><button class="btn full" data-login-demo>로그인</button></div><div class="auth-divider"><span>또는</span></div><div class="provider-list"><button class="provider kakao" data-auth>● 카카오로 계속</button><button class="provider apple" data-auth> Apple로 계속</button></div></section>`;
return `<section class="landing"><div class="landing-art">${catAvatar('shark','landing-cat')}<div class="landing-glow"></div></div><div class="landing-copy"><div class="landing-logo">POKER<span>CAT</span></div><div class="landing-kicker">POKER COMMUNITY</div><p>포커하는 고양이들이 모이는 곳</p><button class="landing-cta" data-start>시작하기</button><button class="landing-login" data-open-login>이미 계정이 있나요? <b>로그인</b></button></div></section>`}
function onboardView(){
if(state.onboardStep===1)return `<section class="onboard"><div class="onboard-top"><b>프로필 설정</b><button data-skip-onboard>건너뛰기</button></div><h1>나를 표현하는 포커캣을 선택하세요</h1><p>언제든지 변경할 수 있어요.</p><div class="cat-grid">${cats.map((cat,i)=>`<button class="cat-choice ${state.selectedCat===i?'selected':''}" data-cat="${i}">${catAvatar(i,'cat-choice-image')}<b>${cat.name}</b></button>`).join('')}</div><div class="pager"><i class="active"></i><i></i><i></i><i></i></div><button class="onboard-next" data-next-onboard>다음</button></section>`;
return `<section class="onboard"><div class="onboard-top"><b>프로필 설정</b><button data-skip-onboard>건너뛰기</button></div><h1>포커 프로필을 완성하세요</h1><p>간단하게 시작하고 나중에 더 채울 수 있어요.</p><div class="form onboard-form"><div class="selected-cat-preview">${catAvatar(state.selectedCat,'selected-cat')}</div><div class="field"><label>닉네임</label><input id="nick" value="${state.nickname}" maxlength="16"></div><div class="row2"><div class="field"><label>선호 게임</label><select id="gamePref"><option>MTT</option><option>Cash</option><option>Mixed</option></select></div><div class="field"><label>플레이</label><select id="playPref"><option>오프라인</option><option>온라인</option><option>둘 다</option></select></div></div><button class="onboard-next" data-finish-onboard>시작하기</button></div></section>`}
function topbar(){
if(state.view==='home')return `<header class="topbar home-top">
  <button class="feed-mode-toggle ${state.feedMode==='following'?'active':''}" data-toggle-following><span>✓</span> 팔로잉</button>
  <div class="logo">POKER<span>CAT</span></div>
  <button class="notification-btn" data-open-notifications aria-label="알림"><span>🔔</span><i></i></button>
</header>`;
if(state.view==='notifications')return `<header class="topbar utility-top"><button class="back-btn" data-notification-back>‹</button><div class="page-title">알림</div><button class="read-all" data-mark-read>모두 읽음</button></header>`;
if(state.view==='compose')return '';
const map={explore:'탐색',schedule:'일정',profile:'프로필'};
return `<header class="topbar"><div class="page-title">${map[state.view]||'PokerCat'}</div><button class="top-icon" data-toast="설정은 준비 중이에요">⚙</button></header>`
}
function mainView(){if(state.view==='home')return homeView();if(state.view==='notifications')return notificationView();if(state.view==='explore')return exploreView();if(state.view==='schedule')return scheduleView();if(state.view==='profile')return profileView('me');if(state.view==='compose')return composeView();if(state.view.startsWith('user:'))return profileView(state.view.split(':')[1]);return homeView()}
function modalView(){if(state.modal==='profileEdit')return profileEditModal();if(state.modal==='handPreview')return `<div class="modal-backdrop" data-close-modal><div class="sheet" onclick="event.stopPropagation()"><div class="grab"></div><div class="sheet-title">피드 미리보기</div>${hhCard(state.previewHand||handA)}<button class="btn full" data-close-preview>계속 작성하기</button></div></div>`;return ''}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
