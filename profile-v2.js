const PROFILE_POST_LIBRARY={
  queenbee:[
    {id:'qb-text-1',authorId:'queenbee',type:'text',time:'3시간 전',text:'오늘 새틀에서 진짜 애매한 스팟 나옴\n20BB BTN vs BB인데 리버에서 너무 고민됐다.',likes:18,comments:7,createdAt:'2026-09-26T12:00:00Z'},
    {id:'qb-hand-1',authorId:'queenbee',type:'hand',time:'어제',text:'이 핸드는 아직도 턴 사이즈가 궁금함.',hand:handA,likes:42,comments:18,createdAt:'2026-09-25T14:00:00Z'},
    {id:'qb-image-1',authorId:'queenbee',type:'image',time:'2일 전',text:'오랜만에 라이브 세션. 결과보다 플레이가 마음에 들었던 날.',imageStyle:'warm',likes:31,comments:6,createdAt:'2026-09-24T10:00:00Z'}
  ],
  riverkim:[
    {id:'rk-text-1',authorId:'riverkim',type:'text',time:'2시간 전',text:'오늘 리드 잡히는 테이블에서 많이 배웠다. 후반 몇 스팟은 다시 복기해야지.',likes:32,comments:7,createdAt:'2026-09-26T13:00:00Z'},
    {id:'rk-hand-1',authorId:'riverkim',type:'hand',time:'어제',text:'SB vs BB 싱글레이즈 팟. 리버에서 어떤 사이즈가 제일 자연스러울까요?',hand:handB,likes:21,comments:9,createdAt:'2026-09-25T11:00:00Z'}
  ],
  minraise:[
    {id:'mr-text-1',authorId:'minraise',type:'text',time:'3시간 전',text:'대회 끝나고 느낀 점. 오늘도 한 단계 배웠다.',likes:76,comments:31,createdAt:'2026-09-26T12:30:00Z'},
    {id:'mr-hand-1',authorId:'minraise',type:'hand',time:'2일 전',text:'딥스택에서 플랍 이후 라인이 궁금합니다.',hand:handA,likes:35,comments:12,createdAt:'2026-09-24T09:00:00Z'}
  ],
  chiplee:[
    {id:'cl-text-1',authorId:'chiplee',type:'text',time:'5시간 전',text:'오늘 저녁 데일리 참가합니다. 테이블에서 봬요.',likes:14,comments:4,createdAt:'2026-09-26T10:00:00Z'}
  ],
  ninehigh:[
    {id:'nh-hand-1',authorId:'ninehigh',type:'hand',time:'6시간 전',text:'20BB 스팟 복기.',hand:handB,likes:19,comments:11,createdAt:'2026-09-26T09:00:00Z'}
  ]
};

function profilePostKey(key){return key==='me'?'queenbee':key}
function profileTimelinePosts(key){
  const userKey=profilePostKey(key);
  const base=(PROFILE_POST_LIBRARY[userKey]||[]).map(x=>({...x}));
  const roomPosts=state.rooms
    .filter(r=>r.hostId===userKey&&r.status!=='closed')
    .map((room,i)=>({
      id:'profile-room-'+room.id,authorId:userKey,type:'room',time:i===0?'최근':'이전',
      text:'포커 테이블을 열었어요.',roomId:room.id,likes:8+i,comments:2+i,
      createdAt:room.createdAt||'2026-09-20T00:00:00Z'
    }));
  return [...roomPosts,...base].sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
}
function findProfilePost(id){
  const keys=['queenbee','riverkim','minraise','chiplee','ninehigh'];
  for(const k of keys){
    const found=profileTimelinePosts(k).find(p=>p.id===id);
    if(found)return found;
  }
  return null;
}

function profileView(key){
  const mine=key==='me';
  const userKey=profilePostKey(key);
  const u=mine?myUser():getUser(userKey);
  const hp=verifiedHomePub(u);
  const followersCount=mine?state.followers.size:24;
  const followingCount=mine?state.following.size:18;
  const postCount=profileTimelinePosts(userKey).length;
  const followLabel=!mine?(state.following.has(userKey)?'팔로잉':'팔로우'):'프로필 편집';
  const tags=[
    {icon:'♠',label:mine?state.gamePref:'MTT'},
    {icon:'●',label:mine?state.playPref:'오프라인'}
  ];
  if(hp)tags.push({icon:'🏠',label:hp.brand+' '+hp.branch,homePub:true});

  return '<section class="profile-screen activity-profile">'+
    '<div class="profile-hero compact-profile-hero">'+
      (mine
        ?'<button class="profile-avatar editable-avatar" data-edit-avatar aria-label="포커캣 변경">'+catAvatar(u.cat,'profile-cat-image')+'<span class="avatar-edit-badge">변경</span></button>'
        :'<div class="profile-avatar">'+catAvatar(u.cat,'profile-cat-image')+'</div>')+
      '<div class="profile-name">'+escapeHtml(u.name)+'</div>'+
      '<div class="profile-handle">'+u.handle+'</div>'+
      '<div class="bio">'+(mine?'홀덤 치고, 핸드 남기고, 좋은 사람들 만나는 중.':'포커 좋아하는 평범한 플레이어. 핸드 토론 환영.')+'</div>'+
      '<div class="poker-tags identity-tags">'+tags.map(t=>'<span class="'+(t.homePub?'homepub-tag':'')+'">'+t.icon+' '+escapeHtml(t.label)+'</span>').join('')+'</div>'+
      '<div class="stats compact-stats">'+
        '<div><b>'+postCount+'</b><span>게시물</span></div>'+
        '<button '+(mine?'data-relationship="followers"':'')+'><b>'+followersCount+'</b><span>팔로워</span></button>'+
        '<button '+(mine?'data-relationship="following"':'')+'><b>'+followingCount+'</b><span>팔로잉</span></button>'+
      '</div>'+
      '<button class="profile-edit" '+(mine?'data-edit-profile':'data-follow="'+userKey+'"')+'>'+followLabel+'</button>'+
    '</div>'+
    '<div class="profile-tabs two-tabs">'+
      '<button class="'+(state.profileTab==='posts'?'active':'')+'" data-profile-tab="posts">게시물</button>'+
      '<button class="'+(state.profileTab==='career'?'active':'')+'" data-profile-tab="career">커리어</button>'+
    '</div>'+
    profileBody(mine,userKey,u)+
  '</section>';
}

function profileBody(mine,key,u){
  if(state.profileTab==='career')return careerHighView(mine,key);
  const list=profileTimelinePosts(key);
  if(!list.length)return '<div class="profile-timeline-empty"><b>아직 게시물이 없어요.</b><span>첫 활동을 남겨보세요.</span></div>';
  return '<div class="profile-timeline">'+list.map(p=>profileTimelineCard(p)).join('')+'</div>';
}

function profileTimelineCard(post){
  const u=getUser(post.authorId);
  if(post.type==='hand')return profileHandSummaryCard(post,u);
  if(post.type==='room'){
    const room=getRoom(post.roomId);
    if(!room)return '';
    return '<article class="profile-timeline-card room-timeline-card">'+
      profilePostMeta(u,post.time)+
      '<div class="profile-post-text">'+escapeHtml(post.text)+'</div>'+
      pokerRoomEmbed(room,'feed')+
      actions(post.id,post.likes,post.comments)+
    '</article>';
  }
  return '<article class="profile-timeline-card">'+
    profilePostMeta(u,post.time)+
    '<div class="profile-post-text">'+escapeHtml(post.text).replace(/\n/g,'<br>')+'</div>'+
    (post.type==='image'?'<div class="profile-post-media">'+pokerPhoto(post.imageStyle||'warm')+'</div>':'')+
    actions(post.id,post.likes,post.comments)+
  '</article>';
}
function profilePostMeta(u,time){
  return '<div class="profile-post-meta">'+
    catAvatar(u.cat,'profile-post-avatar')+
    '<div><b>'+escapeHtml(u.name)+'</b><span>· '+escapeHtml(time||'방금')+'</span></div>'+
  '</div>';
}
function profileHandSummaryCard(post,u){
  const d=post.hand;
  return '<article class="profile-timeline-card profile-hand-summary">'+
    profilePostMeta(u,post.time)+
    (post.text?'<div class="profile-post-text">'+escapeHtml(post.text)+'</div>':'')+
    '<button class="hand-summary-body" data-open-hand-detail="'+post.id+'">'+
      '<div class="hand-summary-kicker"><span>'+escapeHtml((d.blinds||'').split(' · ')[0]||'Poker')+'</span><b>'+escapeHtml(d.blinds||'')+'</b></div>'+
      '<div class="hand-summary-cards">'+
        '<div><small>HERO</small><div class="cards-row">'+cards(d.hole)+'</div></div>'+
        '<div class="hand-board"><small>BOARD</small><div class="cards-row">'+cards(d.board)+'</div></div>'+
      '</div>'+
      '<div class="hand-summary-action">'+escapeHtml(d.pre)+' · '+escapeHtml(d.flop)+' · '+escapeHtml(d.turn)+'</div>'+
      '<div class="hand-summary-more">핸드 상세 보기 <span>›</span></div>'+
    '</button>'+
    actions(post.id,post.likes,post.comments)+
  '</article>';
}

function handDetailView(id){
  const post=findProfilePost(id);
  if(!post||post.type!=='hand')return '<section class="hand-detail-screen"><div class="profile-timeline-empty"><b>핸드를 찾을 수 없어요.</b><button class="btn" data-hand-detail-back>프로필로 돌아가기</button></div></section>';
  const u=getUser(post.authorId),d=post.hand;
  return '<section class="hand-detail-screen"><article class="hand-detail-post">'+
    profilePostMeta(u,post.time)+
    (post.text?'<div class="profile-post-text">'+escapeHtml(post.text)+'</div>':'')+
    hhCard(d)+
    '<div class="hand-detail-breakdown">'+
      '<div><small>GAME</small><b>'+escapeHtml(d.blinds)+'</b></div>'+
      '<div><small>POSITION / STACK</small><b>'+escapeHtml(d.pos)+' · '+escapeHtml(d.stack)+'</b></div>'+
      '<div><small>PREFLOP</small><b>'+escapeHtml(d.pre)+'</b></div>'+
      '<div><small>FLOP</small><b>'+escapeHtml(d.flop)+'</b></div>'+
      '<div><small>TURN</small><b>'+escapeHtml(d.turn)+'</b></div>'+
      '<div><small>RIVER</small><b>'+escapeHtml(d.river)+'</b></div>'+
    '</div>'+
    actions(post.id+'-detail',post.likes,post.comments)+
  '</article></section>';
}

function careerHighView(mine,key){
  const demoCareer=[
    {id:'demo-1',title:'APT Main Event',category:'Day 2',tournamentName:'APT Main Event',date:'2026-08-23',prize:'',description:'첫 메인 이벤트 Day 2 진출.',imageUrl:null,verification:{status:'verified',provider:'demo',verifiedAt:'2026-08-24'}},
    {id:'demo-2',title:'Local Tournament',category:'1st Place',tournamentName:'Weekly Deepstack',date:'2026-06-11',prize:'₩650,000',description:'',imageUrl:null,verification:{status:'unverified',provider:null,verifiedAt:null}},
    {id:'demo-3',title:'Best Score',category:'Best Score',tournamentName:'',date:'',prize:'₩4,800,000',description:'',imageUrl:null,verification:{status:'unverified',provider:null,verifiedAt:null}}
  ];
  const items=mine?state.careerHighs:demoCareer;
  return '<div class="career-section profile-career-section">'+
    '<div class="career-head"><div><b>커리어</b><span>포커에서 기억하고 싶은 성과를 전시해요.</span></div>'+(mine?'<button data-career-add>＋ 기록 추가</button>':'')+'</div>'+
    '<div class="career-list">'+
      (items.length?items.map((item,i)=>careerCard(item,mine,i)).join(''):'<div class="career-empty"><span>♠</span><b>아직 커리어 기록이 없어요</b><p>Day 2, 우승, Final Table, 최고 상금 같은 기록을 추가해 보세요.</p>'+(mine?'<button data-career-add>첫 커리어 기록 추가</button>':'')+'</div>')+
    '</div>'+
  '</div>';
}
function careerCard(item,mine,index){
  const month=item.date?String(item.date).slice(0,7).replace('-','.'):'';
  const verified=item.verification?.status==='verified';
  return '<article class="career-card activity-career-card">'+
    '<div class="career-rank">'+String(index+1).padStart(2,'0')+'</div>'+
    '<div class="career-main">'+
      '<div class="career-category">'+escapeHtml(item.category||'Achievement')+(verified?'<span class="career-verified">✓ 인증</span>':'')+'</div>'+
      '<h3>'+escapeHtml(item.title||'커리어')+'</h3>'+
      (item.tournamentName&&item.tournamentName!==item.title?'<div class="career-tournament">'+escapeHtml(item.tournamentName)+'</div>':'')+
      '<div class="career-meta">'+(month?'<span>'+escapeHtml(month)+'</span>':'')+(item.prize?'<strong>'+escapeHtml(item.prize)+'</strong>':'')+'</div>'+
      (item.description?'<p>'+escapeHtml(item.description)+'</p>':'')+
    '</div>'+
    (mine?'<div class="career-actions"><button data-career-edit="'+item.id+'">수정</button><button data-career-delete="'+item.id+'">삭제</button></div>':'')+
  '</article>';
}

function bottomNav(){
  if(state.view.startsWith('hand:')||state.view==='tools'||state.view.startsWith('tool:'))return '';
  return pokerRoomBottomNavV1();
}

function avatarPickerModal(){
  const available=cats.map((_,i)=>i);
  const currentPos=catByRef(state.selectedCat).pos;
  return '<div class="modal-backdrop" data-close-modal><div class="sheet avatar-picker-sheet" onclick="event.stopPropagation()">'+
    '<div class="grab"></div>'+
    '<div class="sheet-title">포커캣 변경</div>'+
    '<p class="avatar-picker-copy">프로필에 사용할 포커캣을 선택하세요.</p>'+
    '<div class="avatar-picker-grid">'+
      available.map(i=>{
        const cat=cats[i];
        const selected=Number(state.selectedCat)===i;
        return '<button class="avatar-picker-option '+(selected?'selected':'')+'" data-select-avatar="'+i+'">'+
          catAvatar(i,'avatar-picker-image')+
          '<b>'+escapeHtml(cat.name)+'</b>'+
          (selected?'<span>✓</span>':'')+
        '</button>';
      }).join('')+
    '</div>'+
  '</div></div>';
}
