const AUTH_FLOW_VERSION='3';
if(localStorage.getItem('pokercat_auth_version')!==AUTH_FLOW_VERSION){localStorage.removeItem('pokercat_onboarded');localStorage.setItem('pokercat_auth_version',AUTH_FLOW_VERSION);}

function loadJSON(key,fallback){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch{return fallback}}
function saveJSON(key,value){localStorage.setItem(key,JSON.stringify(value))}
function pubId(brand,branch){return (brand+'-'+branch).trim().toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9가-힣-]/g,'')}
function verifiedHomePub(user){const hp=user?.homePub;return hp&&hp.status==='verified'?hp:null}

const cats=[
{id:'rock',name:'The Rock',pos:'0% 0%'},{id:'shark',name:'The Shark',pos:'50% 0%'},{id:'maniac',name:'The Maniac',pos:'100% 0%'},
{id:'solver',name:'The Solver',pos:'0% 50%'},{id:'trapper',name:'The Trapper',pos:'50% 50%'},{id:'hero-caller',name:'The Hero Caller',pos:'100% 50%'},
{id:'queen',name:'The Queen',pos:'0% 100%'},{id:'darling',name:'The Darling',pos:'50% 100%'},{id:'grinder',name:'The Grinder',pos:'100% 100%'}];

const demoUsers={
queenbee:{name:'QUEENBEE',handle:'@queenbee',cat:'darling',time:'4시간 전'},
riverkim:{name:'riverkim',handle:'@riverkim',cat:'shark',time:'2시간 전',homePub:{id:'kmgm-수원점',brand:'KMGM',branch:'수원점',status:'verified',verification:{provider:'partner-demo',partnerId:'kmgm-suwon'}}},
minraise:{name:'minraise',handle:'@minraise',cat:'solver',time:'3시간 전',homePub:{id:'kmgm-홍대점',brand:'KMGM',branch:'홍대점',status:'verified',verification:{provider:'partner-demo',partnerId:'kmgm-hongdae'}}},
chiplee:{name:'chiplee',handle:'@chiplee',cat:'grinder',time:'5시간 전',homePub:{id:'kmgm-수원점',brand:'KMGM',branch:'수원점',status:'verified',verification:{provider:'partner-demo',partnerId:'kmgm-suwon'}}},
ninehigh:{name:'ninehigh',handle:'@ninehigh',cat:'rock',time:'6시간 전',homePub:{id:'kmgm-인천점',brand:'KMGM',branch:'인천점',status:'verified',verification:{provider:'partner-demo',partnerId:'kmgm-incheon'}}}
};

function catByRef(ref){if(typeof ref==='number')return cats[ref]||cats[0];if(typeof ref==='string')return cats.find(c=>c.id===ref)||cats[0];return ref||cats[0]}
function catAvatar(ref,className='cat-avatar-image'){const cat=catByRef(ref);return `<span class="poker-cat-avatar ${className}" style="--cat-pos:${cat.pos}" role="img" aria-label="${cat.name}"></span>`}

const legacyBrand=localStorage.getItem('pokercat_pub_brand')||'';
const legacyBranch=localStorage.getItem('pokercat_pub_branch')||'';
let storedHomePub=loadJSON('pokercat_home_pub_v1',null);
if(!storedHomePub&&legacyBrand&&legacyBranch){
  storedHomePub={id:pubId(legacyBrand,legacyBranch),brand:legacyBrand,branch:legacyBranch,status:'unverified',verification:{provider:'legacy-import',partnerId:null,verifiedAt:null}};
  saveJSON('pokercat_home_pub_v1',storedHomePub);
}
const storedCareer=loadJSON('pokercat_career_highs_v1',[]);
const storedFollowing=loadJSON('pokercat_following_v1',['riverkim']);
const storedFollowers=loadJSON('pokercat_followers_v1',['riverkim','chiplee']);
const storedSavedRoomSettings=loadJSON('pokercat_room_saved_settings_v1',[]);

function cloneData(value){return JSON.parse(JSON.stringify(value))}
function defaultRoomSettings(){
  const preset=(window.POKER_ROOM_PRESETS||[])[0];
  return cloneData(preset?.settings||{
    gameType:'NLH',maxPlayers:6,startingChips:20000,
    blinds:{smallBlind:100,bigBlind:200},
    ante:{mode:'none',amount:0},
    blindProgression:{mode:'fixed',levelMinutes:null,structureId:null},
    rules:{}
  });
}
function normalizeGameSettings(input={}){
  const legacyBb=Number(input.bb||input.blinds?.bigBlind||200)||200;
  const legacyStack=Number(input.startStack||0);
  const startingChips=Number(input.startingChips||0)||(legacyStack?legacyStack*legacyBb:20000);
  const anteMode=input.ante?.mode||(input.ante?.enabled?'all-player':'none');
  const progressionMode=input.blindProgression?.mode||(input.blinds?.increase?'auto':'fixed');
  return {
    gameType:input.gameType||input.game||'NLH',
    maxPlayers:Number(input.maxPlayers||6),
    startingChips,
    blinds:{
      smallBlind:Number(input.blinds?.smallBlind||input.sb||100),
      bigBlind:Number(input.blinds?.bigBlind||input.bb||200)
    },
    ante:{
      mode:anteMode,
      amount:anteMode==='none'?0:Number(input.ante?.amount||0)
    },
    blindProgression:{
      mode:progressionMode,
      levelMinutes:progressionMode==='auto'?Number(input.blindProgression?.levelMinutes||input.blinds?.intervalMinutes||10):null,
      structureId:progressionMode==='auto'?(input.blindProgression?.structureId||'standard-x2'):null
    },
    rules:{...(input.rules||{})}
  };
}
function normalizeRoom(room){
  const settings=normalizeGameSettings(room.settings||room);
  const oldSeats=room.seats||room.tables?.[0]?.seats||[];
  const seats=Array.from({length:settings.maxPlayers},(_,i)=>oldSeats[i]||null);
  const audienceType=room.audience?.type||(room.visibility==='private'?'invite':'public');
  const status=room.status==='open'?'lobby':(room.status||'lobby');
  return {
    id:room.id,mode:room.mode||'single-table',name:room.name||'PokerCat Table',
    hostId:room.hostId||'queenbee',settings,
    audience:{type:audienceType},
    status,
    tables:[{
      id:room.tables?.[0]?.id||room.id+'-table-1',
      status:status==='playing'?'playing':'waiting',
      seats
    }],
    invitedUserIds:[...(room.invitedUserIds||[])],
    createdAt:room.createdAt||new Date().toISOString(),
    social:{externalShare:{enabled:false,token:null}},
    tournament:{mode:room.mode||'single-table',mttConfig:room.tournament?.mttConfig||null}
  };
}
function createRoomDraft(){
  return {
    roomName:(state?.nickname||localStorage.getItem('pokercat_name')||'QueenBee')+"'s Table",
    mode:'single-table',
    settings:defaultRoomSettings(),
    audience:{type:'public'}
  };
}
const seededRooms=[
  normalizeRoom({id:'room-river-night',mode:'single-table',name:'River Night Table',hostId:'riverkim',settings:{
    gameType:'NLH',maxPlayers:6,startingChips:20000,blinds:{smallBlind:100,bigBlind:200},
    ante:{mode:'none',amount:0},blindProgression:{mode:'fixed',levelMinutes:null,structureId:null},rules:{}
  },audience:{type:'public'},status:'lobby',seats:['riverkim','chiplee',null,null,null,null],createdAt:'2026-09-26T12:00:00.000Z'}),
  normalizeRoom({id:'room-minraise-study',mode:'single-table',name:'Late Night 6-Max',hostId:'minraise',settings:{
    gameType:'NLH',maxPlayers:6,startingChips:30000,blinds:{smallBlind:100,bigBlind:200},
    ante:{mode:'all-player',amount:100},blindProgression:{mode:'fixed',levelMinutes:null,structureId:null},rules:{}
  },audience:{type:'public'},status:'lobby',seats:['minraise','ninehigh','riverkim',null,null,null],createdAt:'2026-09-26T13:00:00.000Z'})
];
const storedRoomsRaw=loadJSON('pokercat_rooms_v1',null);
const storedRooms=Array.isArray(storedRoomsRaw)&&storedRoomsRaw.length?storedRoomsRaw.map(normalizeRoom):seededRooms;
const storedRoomInvites=loadJSON('pokercat_room_invites_v1',[
  {id:'invite-river-demo',roomId:'room-river-night',fromUserId:'riverkim',toUserId:'queenbee',status:'pending',createdAt:'2026-09-26T13:10:00.000Z'}
]);

const state={
view:'home',loggedIn:localStorage.getItem('pokercat_logged_in')==='1',onboarding:localStorage.getItem('pokercat_onboarded')==='1',onboardStep:0,authMode:'landing',
selectedCat:Number(localStorage.getItem('pokercat_cat')||7),nickname:localStorage.getItem('pokercat_name')||'QUEENBEE',
gamePref:localStorage.getItem('pokercat_game')||'MTT',playPref:localStorage.getItem('pokercat_play')||'오프라인',
homePub:storedHomePub,careerHighs:Array.isArray(storedCareer)?storedCareer:[],
rooms:storedRooms,roomInvites:Array.isArray(storedRoomInvites)?storedRoomInvites:[],savedRoomSettings:Array.isArray(storedSavedRoomSettings)?storedSavedRoomSettings:[],roomDraft:null,roomOptionOpen:null,roomPresetTab:'pokerCat',editingSavedRoomSettingId:null,currentRoomId:null,roomReturnView:'home',
feedMode:'algorithm',exploreTab:'popular',scheduleTab:'events',profileTab:'posts',notificationsRead:false,
modal:null,authGateMode:'login',authReason:'',pendingAuth:null,relationshipMode:'following',roomInviteMode:'followers',editingCareerId:null,liked:new Set(),
following:new Set(Array.isArray(storedFollowing)?storedFollowing:['riverkim']),
followers:new Set(Array.isArray(storedFollowers)?storedFollowers:['riverkim','chiplee']),
composeMode:'post',composeText:'',handDraft:{hero:['A♠','K♠'],flop:['Q♥','J♠','7♣'],turn:['2♦'],river:['9♣']},cardTarget:null,cardRank:null,
handMeta:{game:'MTT',players:'8-max',pos:'BTN',stack:'38BB',blind:'1K / 2K (Ante 2K)'},handActions:{pre:'BTN 오픈에 BB에서 콜',flop:'플랍 체크-콜',turn:'턴 체크-레이즈',river:'리버 콜'}};

function myUser(){return {name:state.nickname,handle:'@queenbee',cat:state.selectedCat,time:'4시간 전',homePub:state.homePub}}
function getUser(key){return key==='queenbee'?(state.loggedIn?myUser():demoUsers.queenbee):(demoUsers[key]||demoUsers.riverkim)}
function persistRelationships(){saveJSON('pokercat_following_v1',[...state.following]);saveJSON('pokercat_followers_v1',[...state.followers])}
function persistHomePub(){saveJSON('pokercat_home_pub_v1',state.homePub)}
function persistCareerHighs(){saveJSON('pokercat_career_highs_v1',state.careerHighs)}
function persistRooms(){saveJSON('pokercat_rooms_v1',state.rooms)}
function persistRoomInvites(){saveJSON('pokercat_room_invites_v1',state.roomInvites)}
function persistSavedRoomSettings(){saveJSON('pokercat_room_saved_settings_v1',state.savedRoomSettings)}
function getRoom(id){return state.rooms.find(r=>r.id===id)||null}
function getPrimaryTable(room){return room?.tables?.[0]||null}
function roomSeatCount(room){return (getPrimaryTable(room)?.seats||[]).filter(Boolean).length}
function roomSettings(room){return room?.settings||defaultRoomSettings()}
function roomAudienceType(room){return room?.audience?.type||'public'}
function resetRoomDraft(){
  state.roomDraft={
    roomName:(state.nickname||'QueenBee')+"'s Table",
    mode:'single-table',
    settings:defaultRoomSettings(),
    audience:{type:'public'}
  };
  state.roomOptionOpen=null;
  state.editingSavedRoomSettingId=null;
}

document.documentElement.dataset.theme='dark';
function icon(name){const map={home:'⌂',search:'⌕',plus:'＋',calendar:'▦',profile:'♙'};return map[name]||'•'}

function render(){
  const app=document.querySelector('#app');
  app.innerHTML='<main class="phone">'+topbar()+mainView()+bottomNav()+'</main>'+modalView();
  wire()
}

function requireAuth(reason,pending=null){
  if(state.loggedIn)return true;
  state.authGateMode='login';
  state.authReason=reason||'이 기능을 사용하려면 로그인이 필요해요.';
  state.pendingAuth=pending;
  state.modal='authGate';
  render();
  return false;
}

function authView(){
if(state.authMode==='login')return `<section class="auth-wrap login-panel"><button class="auth-back" data-auth-back>‹ 돌아가기</button><div class="brand-lockup compact"><div class="brand-title">POKER<span>CAT</span></div><div class="brand-sub">포커하는 고양이들이 모이는 곳</div></div><div class="auth-form"><div class="field"><label>아이디 또는 이메일</label><input id="loginId" placeholder="아이디 또는 이메일"></div><div class="field"><label>비밀번호</label><input id="loginPassword" type="password" placeholder="비밀번호"></div><button class="btn full" data-login-demo>로그인</button></div><div class="auth-divider"><span>또는</span></div><div class="provider-list"><button class="provider kakao" data-auth>● 카카오로 계속</button><button class="provider apple" data-auth> Apple로 계속</button></div></section>`;
return `<section class="landing"><div class="landing-art">${catAvatar('shark','landing-cat')}<div class="landing-glow"></div></div><div class="landing-copy"><div class="landing-logo">POKER<span>CAT</span></div><div class="landing-kicker">POKER COMMUNITY</div><p>포커하는 고양이들이 모이는 곳</p><button class="landing-cta" data-start>시작하기</button><button class="landing-login" data-open-login>이미 계정이 있나요? <b>로그인</b></button></div></section>`}

function onboardView(){
if(state.onboardStep===1)return `<section class="onboard"><div class="onboard-top"><b>프로필 설정</b><button data-skip-onboard>건너뛰기</button></div><h1>나를 표현하는 포커캣을 선택하세요</h1><p>언제든지 변경할 수 있어요.</p><div class="cat-grid">${cats.map((cat,i)=>`<button class="cat-choice ${state.selectedCat===i?'selected':''}" data-cat="${i}">${catAvatar(i,'cat-choice-image')}<b>${cat.name}</b></button>`).join('')}</div><div class="pager"><i class="active"></i><i></i><i></i><i></i></div><button class="onboard-next" data-next-onboard>다음</button></section>`;
return `<section class="onboard"><div class="onboard-top"><b>프로필 설정</b><button data-skip-onboard>건너뛰기</button></div><h1>포커 프로필을 완성하세요</h1><p>간단하게 시작하고 나중에 더 채울 수 있어요.</p><div class="form onboard-form"><div class="selected-cat-preview">${catAvatar(state.selectedCat,'selected-cat')}</div><div class="field"><label>닉네임</label><input id="nick" value="${state.nickname}" maxlength="16"></div><div class="row2"><div class="field"><label>선호 게임</label><select id="gamePref"><option>MTT</option><option>Cash</option><option>Mixed</option></select></div><div class="field"><label>플레이</label><select id="playPref"><option>오프라인</option><option>온라인</option><option>둘 다</option></select></div></div><button class="onboard-next" data-finish-onboard>시작하기</button></div></section>`}

function topbar(){
if(state.view==='home')return `<header class="topbar home-top"><button class="feed-mode-toggle ${state.feedMode==='following'?'active':''}" data-toggle-following><span>✓</span> 팔로잉</button><div class="logo">POKER<span>CAT</span></div><button class="notification-btn" data-open-notifications aria-label="알림"><span>🔔</span><i></i></button></header>`;
if(state.view==='notifications')return `<header class="topbar utility-top"><button class="back-btn" data-notification-back>‹</button><div class="page-title">알림</div><button class="read-all" data-mark-read>모두 읽음</button></header>`;
if(state.view==='homepub')return `<header class="topbar utility-top"><button class="back-btn" data-homepub-back>‹</button><div class="page-title">Home Pub</div><button class="read-all" data-nav="profile">프로필</button></header>`;
if(state.view==='roomcreate')return `<header class="topbar utility-top"><button class="back-btn" data-room-create-back>‹</button><div class="page-title">게임 만들기</div><span class="topbar-spacer"></span></header>`;
if(state.view.startsWith('room:'))return `<header class="topbar utility-top"><button class="back-btn" data-room-back>‹</button><div class="page-title">Poker Room</div><button class="read-all" data-room-menu>•••</button></header>`;
if(state.view==='compose')return '';
const map={explore:'탐색',schedule:'일정',profile:'프로필'};
return `<header class="topbar"><div class="page-title">${map[state.view]||'PokerCat'}</div><button class="top-icon" data-toast="설정은 준비 중이에요">⚙</button></header>`
}

function mainView(){
if(state.view==='home')return homeView();
if(state.view==='notifications')return notificationView();
if(state.view==='homepub')return homePubCommunityView();
if(state.view==='roomcreate')return pokerRoomCreateView();
if(state.view.startsWith('room:'))return pokerRoomView(state.view.split(':')[1]);
if(state.view==='explore')return exploreView();
if(state.view==='schedule')return scheduleView();
if(state.view==='profile')return profileView('me');
if(state.view==='compose')return composeView();
if(state.view.startsWith('user:'))return profileView(state.view.split(':')[1]);
return homeView()
}

function modalView(){
if(state.modal==='authGate')return authGateModal();
if(state.modal==='profileEdit')return profileEditModal();
if(state.modal==='homePubVerify')return homePubVerifyModal();
if(state.modal==='careerEdit')return careerEditModal();
if(state.modal==='relationships')return relationshipModal();
if(state.modal==='createMenu')return createMenuModal();
if(state.modal==='roomInvite')return roomInviteModal();
if(state.modal==='roomPresetLoader')return roomPresetLoaderModal();
if(state.modal==='roomSaveSetting')return roomSaveSettingModal();
if(state.modal==='roomRenameSetting')return roomRenameSettingModal();
if(state.modal==='handPreview')return `<div class="modal-backdrop" data-close-modal><div class="sheet" onclick="event.stopPropagation()"><div class="grab"></div><div class="sheet-title">피드 미리보기</div>${hhCard(state.previewHand||handA)}<button class="btn full" data-close-preview>계속 작성하기</button></div></div>`;
return ''
}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}

function authGateModal(){
  const signup=state.authGateMode==='signup';
  return `<div class="modal-backdrop auth-gate-backdrop" data-close-auth>
    <div class="sheet auth-gate-sheet" onclick="event.stopPropagation()">
      <div class="grab"></div>
      <div class="auth-gate-brand">POKER<span>CAT</span></div>
      <h2>${signup?'PokerCat 시작하기':'다시 오셨네요'}</h2>
      <p class="auth-gate-reason">${escapeHtml(state.authReason||'계정으로 로그인하면 PokerCat의 모든 기능을 사용할 수 있어요.')}</p>
      <div class="auth-gate-tabs">
        <button class="${!signup?'active':''}" data-auth-mode="login">로그인</button>
        <button class="${signup?'active':''}" data-auth-mode="signup">회원가입</button>
      </div>
      <div class="auth-gate-form">
        ${signup?`<label>닉네임<input id="authNickname" maxlength="16" placeholder="PokerCat에서 사용할 이름"></label>`:''}
        <label>아이디 또는 이메일<input id="authId" autocomplete="username" placeholder="아이디 또는 이메일"></label>
        <label>비밀번호<input id="authPassword" type="password" autocomplete="${signup?'new-password':'current-password'}" placeholder="비밀번호"></label>
        <button class="btn full auth-primary" data-auth-complete>${signup?'회원가입하고 계속':'로그인하고 계속'}</button>
      </div>
      <div class="auth-divider"><span>또는</span></div>
      <div class="provider-list">
        <button class="provider kakao" data-auth-complete>● 카카오로 계속</button>
        <button class="provider apple" data-auth-complete> Apple로 계속</button>
      </div>
      <button class="continue-browsing" data-close-auth>로그인 없이 계속 둘러보기</button>
    </div>
  </div>`;
}
