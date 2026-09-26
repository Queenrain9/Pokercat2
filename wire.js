function wire(){
  document.querySelectorAll('[data-auth-mode]').forEach(b=>b.onclick=()=>{state.authGateMode=b.dataset.authMode;render()});
  document.querySelectorAll('[data-close-auth]').forEach(b=>b.onclick=e=>{if(e.target!==b&&b.classList.contains('auth-gate-backdrop'))return;state.modal=null;state.pendingAuth=null;render()});
  document.querySelectorAll('[data-auth-complete]').forEach(b=>b.onclick=()=>{
    if(state.authGateMode==='signup'){
      const nick=(document.querySelector('#authNickname')?.value||'').trim();
      if(nick){state.nickname=nick;localStorage.setItem('pokercat_name',nick)}
    }
    localStorage.setItem('pokercat_logged_in','1');
    localStorage.setItem('pokercat_onboarded','1');
    state.loggedIn=true;state.onboarding=true;
    const pending=state.pendingAuth;
    state.pendingAuth=null;state.modal=null;
    applyPendingAuth(pending);
  });

  document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{
    const target=b.dataset.nav;
    if(target==='profile'&&!state.loggedIn){requireAuth('내 프로필을 보려면 로그인해 주세요.',{type:'view',view:'profile'});return}
    state.view=target;state.modal=null;if(state.view!=='compose')state.composeMode='post';render()
  });
  document.querySelectorAll('[data-open-create-menu]').forEach(b=>b.onclick=()=>{
    if(!state.loggedIn){requireAuth('게시물을 쓰거나 게임을 만들려면 로그인이 필요해요.',{type:'modal',modal:'createMenu'});return}
    state.modal='createMenu';render()
  });
  document.querySelectorAll('[data-create-post]').forEach(b=>b.onclick=()=>{
    if(!state.loggedIn){requireAuth('게시물을 작성하려면 로그인해 주세요.',{type:'view',view:'compose'});return}
    state.modal=null;state.view='compose';render()
  });
  document.querySelectorAll('[data-create-game]').forEach(b=>b.onclick=()=>{
    if(!state.loggedIn){requireAuth('Poker Room을 만들려면 로그인해 주세요.',{type:'view',view:'roomcreate'});return}
    state.modal=null;state.view='roomcreate';render()
  });
  const roomCreateBack=document.querySelector('[data-room-create-back]');if(roomCreateBack)roomCreateBack.onclick=()=>{state.view='home';render()};
  const roomBack=document.querySelector('[data-room-back]');if(roomBack)roomBack.onclick=()=>{state.view=state.roomReturnView||'home';render()};

  document.querySelectorAll('[data-create-room-submit]').forEach(b=>b.onclick=()=>{
    if(!state.loggedIn){requireAuth('Poker Room을 만들려면 로그인해 주세요.',{type:'view',view:'roomcreate'});return}
    if(state.view!=='roomcreate')return;
    const name=(document.querySelector('#roomName')?.value||'').trim();
    const maxPlayers=Number(document.querySelector('#roomMaxPlayers')?.value||6);
    const startStack=Number(document.querySelector('#roomStartStack')?.value||40);
    const sb=Number(document.querySelector('#roomSb')?.value||1);
    const bb=Number(document.querySelector('#roomBb')?.value||2);
    const anteEnabled=Boolean(document.querySelector('#roomAnteEnabled')?.checked);
    const anteAmount=Number(document.querySelector('#roomAnteAmount')?.value||0);
    const blindIncrease=Boolean(document.querySelector('#roomBlindIncrease')?.checked);
    const intervalMinutes=Number(document.querySelector('#roomBlindInterval')?.value||0);
    const visibility=document.querySelector('input[name="roomVisibility"]:checked')?.value||'public';
    const feedPublished=Boolean(document.querySelector('#roomFeedPublished')?.checked);
    if(!name){toast('방 이름을 입력해 주세요');return}
    if(sb<=0||bb<=sb){toast('Big Blind는 Small Blind보다 커야 해요');return}
    if(startStack<10){toast('시작 스택은 10BB 이상으로 설정해 주세요');return}
    const id='room-'+Date.now();
    const room={id,mode:'single-table',game:'NLH',name,hostId:'queenbee',maxPlayers,startStack,sb,bb,
      ante:{enabled:anteEnabled,amount:anteEnabled?anteAmount:0},
      blinds:{increase:blindIncrease,intervalMinutes:blindIncrease?intervalMinutes:0},
      visibility,status:'open',seats:Array.from({length:maxPlayers},(_,i)=>i===0?'queenbee':null),
      invitedUserIds:[],feedPublished,createdAt:new Date().toISOString(),
      externalShare:{enabled:false,token:null},tournament:{mode:'single-table',mttConfig:null}};
    state.rooms=[room,...state.rooms];persistRooms();state.currentRoomId=id;state.roomReturnView='home';state.view='room:'+id;render();toast('Poker Room을 만들었어요');
  });

  document.querySelectorAll('[data-open-room]').forEach(b=>b.onclick=()=>{
    const room=getRoom(b.dataset.openRoom);if(!room)return;
    if(room.visibility==='private'&&!state.loggedIn){requireAuth('비공개 Poker Room을 보려면 로그인해 주세요.',{type:'openRoom',id:room.id});return}
    state.currentRoomId=room.id;state.roomReturnView=state.view;state.modal=null;state.view='room:'+room.id;render();
  });
  document.querySelectorAll('[data-join-room]').forEach(b=>b.onclick=()=>{
    if(!state.loggedIn){requireAuth('테이블에 입장하려면 로그인해 주세요.',{type:'joinRoom',id:b.dataset.joinRoom});return}
    joinRoomById(b.dataset.joinRoom);
  });
  document.querySelectorAll('[data-leave-room]').forEach(b=>b.onclick=()=>{
    if(!state.loggedIn){requireAuth('테이블 기능을 사용하려면 로그인해 주세요.');return}
    const room=getRoom(b.dataset.leaveRoom);if(!room)return;
    if(room.hostId==='queenbee'){toast('호스트는 현재 버전에서 테이블을 나갈 수 없어요');return}
    const idx=room.seats.indexOf('queenbee');if(idx>=0)room.seats[idx]=null;persistRooms();render();toast('테이블에서 나왔어요');
  });
  document.querySelectorAll('[data-invite-room]').forEach(b=>b.onclick=()=>{
    if(!state.loggedIn){requireAuth('사용자를 초대하려면 로그인해 주세요.');return}
    state.currentRoomId=b.dataset.inviteRoom;state.roomInviteMode='followers';state.modal='roomInvite';render()
  });
  document.querySelectorAll('[data-invite-source]').forEach(b=>b.onclick=()=>{state.roomInviteMode=b.dataset.inviteSource;render()});
  document.querySelectorAll('[data-send-room-invite]').forEach(b=>b.onclick=()=>{
    if(!state.loggedIn){requireAuth('사용자를 초대하려면 로그인해 주세요.');return}
    const room=getRoom(state.currentRoomId),toUserId=b.dataset.sendRoomInvite;if(!room||room.hostId!=='queenbee')return;
    if(!room.invitedUserIds.includes(toUserId))room.invitedUserIds.push(toUserId);
    const exists=state.roomInvites.some(i=>i.roomId===room.id&&i.toUserId===toUserId&&i.status==='pending');
    if(!exists)state.roomInvites.unshift({id:'invite-'+Date.now()+'-'+toUserId,roomId:room.id,fromUserId:'queenbee',toUserId,status:'pending',createdAt:new Date().toISOString()});
    persistRooms();persistRoomInvites();render();toast(getUser(toUserId).name+'님을 초대했어요');
  });
  document.querySelectorAll('[data-start-room]').forEach(b=>b.onclick=()=>{
    if(!state.loggedIn){requireAuth('게임을 시작하려면 로그인해 주세요.');return}
    const room=getRoom(b.dataset.startRoom);if(!room||room.hostId!=='queenbee')return;
    if(roomSeatCount(room)<2){toast('2명 이상 착석해야 시작할 수 있어요');return}
    room.status='playing';persistRooms();render();toast('플레이머니 테이블을 시작했어요');
  });
  const roomMenu=document.querySelector('[data-room-menu]');if(roomMenu)roomMenu.onclick=()=>{
    if(!state.loggedIn){requireAuth('Poker Room 관리 기능을 사용하려면 로그인해 주세요.');return}
    const room=getRoom(state.currentRoomId);
    if(room?.hostId==='queenbee'){state.modal='roomInvite';render()}else toast('Room 메뉴는 다음 단계에서 확장해요');
  };

  const anteToggle=document.querySelector('#roomAnteEnabled');if(anteToggle)anteToggle.onchange=()=>document.querySelector('#roomAnteField')?.classList.toggle('active',anteToggle.checked);
  const blindToggle=document.querySelector('#roomBlindIncrease');if(blindToggle)blindToggle.onchange=()=>document.querySelector('#roomBlindIntervalField')?.classList.toggle('active',blindToggle.checked);
  document.querySelectorAll('input[name="roomVisibility"]').forEach(i=>i.onchange=()=>{document.querySelectorAll('.visibility-option').forEach(x=>x.classList.remove('active'));i.closest('.visibility-option')?.classList.add('active')});

  document.querySelectorAll('[data-user]').forEach(b=>b.onclick=()=>{state.modal=null;state.view='user:'+b.dataset.user;render()});

  document.querySelectorAll('[data-follow]').forEach(b=>b.onclick=()=>{
    const k=b.dataset.follow;
    state.following.has(k)?state.following.delete(k):state.following.add(k);
    persistRelationships();render();
  });
  document.querySelectorAll('[data-like]').forEach(b=>b.onclick=()=>{const k=b.dataset.like;state.liked.has(k)?state.liked.delete(k):state.liked.add(k);render()});

  const followingToggle=document.querySelector('[data-toggle-following]');if(followingToggle)followingToggle.onclick=()=>{state.feedMode=state.feedMode==='following'?'algorithm':'following';render()};
  const openNotifications=document.querySelector('[data-open-notifications]');if(openNotifications)openNotifications.onclick=()=>{state.view='notifications';render()};
  const notificationBack=document.querySelector('[data-notification-back]');if(notificationBack)notificationBack.onclick=()=>{state.view='home';render()};
  const markRead=document.querySelector('[data-mark-read]');if(markRead)markRead.onclick=()=>{state.notificationsRead=true;render();toast('알림을 모두 읽음 처리했어요')};

  const homePubBack=document.querySelector('[data-homepub-back]');if(homePubBack)homePubBack.onclick=()=>{state.view='profile';render()};
  document.querySelectorAll('[data-open-homepub]').forEach(b=>b.onclick=()=>{
    if(verifiedHomePub(myUser())){state.view='homepub';state.modal=null;render()}
    else if(state.homePub){state.modal='homePubVerify';render()}
    else{state.modal='profileEdit';render()}
  });
  document.querySelectorAll('[data-open-homepub-verify]').forEach(b=>b.onclick=()=>{if(state.homePub){state.modal='homePubVerify';render()}else{state.modal='profileEdit';render()}});

  document.querySelectorAll('[data-explore-tab]').forEach(b=>b.onclick=()=>{state.exploreTab=b.dataset.exploreTab;render()});
  document.querySelectorAll('[data-profile-tab]').forEach(b=>b.onclick=()=>{state.profileTab=b.dataset.profileTab;render()});

  const editProfile=document.querySelector('[data-edit-profile]');if(editProfile)editProfile.onclick=()=>{state.modal='profileEdit';render()};
  const closeProfileEdit=document.querySelector('[data-close-profile-edit]');if(closeProfileEdit)closeProfileEdit.onclick=()=>{state.modal=null;render()};
  const saveProfile=document.querySelector('[data-save-profile]');if(saveProfile)saveProfile.onclick=()=>{
    const nextName=(document.querySelector('#editNickname')?.value||'').trim()||state.nickname;
    const nextBrand=(document.querySelector('#editPubBrand')?.value||'').trim();
    const nextBranch=(document.querySelector('#editPubBranch')?.value||'').trim();
    if((nextBrand&&!nextBranch)||(!nextBrand&&nextBranch)){toast('브랜드와 지점명을 둘 다 입력해 주세요');return}
    state.nickname=nextName;localStorage.setItem('pokercat_name',state.nickname);
    if(!nextBrand&&!nextBranch){
      state.homePub=null;
    }else{
      const nextId=pubId(nextBrand,nextBranch);
      const same=state.homePub&&state.homePub.id===nextId&&state.homePub.brand===nextBrand&&state.homePub.branch===nextBranch;
      state.homePub=same?state.homePub:{id:nextId,brand:nextBrand,branch:nextBranch,status:'unverified',verification:{provider:'mvp-code',partnerId:null,verifiedAt:null}};
    }
    persistHomePub();
    localStorage.removeItem('pokercat_pub_brand');localStorage.removeItem('pokercat_pub_branch');
    state.modal=null;render();
    toast(state.homePub?(state.homePub.status==='verified'?'프로필을 저장했어요':'Home Pub을 저장했어요 · 인증이 필요해요'):'Home Pub을 제거했어요');
  };

  const verifyHomePub=document.querySelector('[data-verify-homepub]');if(verifyHomePub)verifyHomePub.onclick=()=>{
    const code=(document.querySelector('#homePubVerifyCode')?.value||'').trim().toUpperCase();
    if(code!=='CAT1'){toast('인증 코드를 확인해 주세요');return}
    if(!state.homePub)return;
    state.homePub={...state.homePub,status:'verified',verification:{provider:'mvp-code',partnerId:null,verifiedAt:new Date().toISOString()}};
    persistHomePub();state.modal=null;render();toast('Home Pub 인증이 완료됐어요');
  };

  document.querySelectorAll('[data-relationship]').forEach(b=>b.onclick=()=>{state.relationshipMode=b.dataset.relationship;state.modal='relationships';render()});

  document.querySelectorAll('[data-career-add]').forEach(b=>b.onclick=()=>{state.editingCareerId=null;state.modal='careerEdit';render()});
  document.querySelectorAll('[data-career-edit]').forEach(b=>b.onclick=()=>{state.editingCareerId=b.dataset.careerEdit;state.modal='careerEdit';render()});
  document.querySelectorAll('[data-career-delete]').forEach(b=>b.onclick=()=>{
    state.careerHighs=state.careerHighs.filter(x=>x.id!==b.dataset.careerDelete);persistCareerHighs();render();toast('Career High 기록을 삭제했어요');
  });
  const saveCareer=document.querySelector('[data-save-career]');if(saveCareer)saveCareer.onclick=()=>{
    const title=(document.querySelector('#careerTitle')?.value||'').trim();
    if(!title){toast('기록명을 입력해 주세요');return}
    const old=state.careerHighs.find(x=>x.id===state.editingCareerId);
    const now=new Date().toISOString();
    const record={
      id:old?.id||('career-'+Date.now()),title,
      category:document.querySelector('#careerCategory')?.value||'기타',
      tournamentName:(document.querySelector('#careerTournament')?.value||'').trim(),
      date:document.querySelector('#careerDate')?.value||'',
      prize:(document.querySelector('#careerPrize')?.value||'').trim(),
      description:(document.querySelector('#careerDescription')?.value||'').trim(),
      photoUrl:old?.photoUrl||null,createdAt:old?.createdAt||now,updatedAt:now
    };
    if(old)state.careerHighs=state.careerHighs.map(x=>x.id===old.id?record:x);else state.careerHighs=[record,...state.careerHighs];
    persistCareerHighs();state.modal=null;state.editingCareerId=null;state.profileTab='career';render();toast('Career High를 저장했어요');
  };

  document.querySelectorAll('[data-toast]').forEach(b=>b.onclick=()=>toast(b.dataset.toast));

  const composeText=document.querySelector('#composeText');if(composeText)composeText.oninput=()=>state.composeText=composeText.value;
  const toggleHand=document.querySelector('[data-toggle-hand]');if(toggleHand)toggleHand.onclick=()=>{state.composeMode='hand';state.cardTarget=null;state.cardRank=null;render()};
  const removeHand=document.querySelector('[data-remove-hand]');if(removeHand)removeHand.onclick=()=>{state.composeMode='post';state.cardTarget=null;state.cardRank=null;render()};
  document.querySelectorAll('[data-card-slot]').forEach(b=>b.onclick=()=>{state.cardTarget=b.dataset.cardSlot;state.cardRank=null;render()});
  document.querySelectorAll('[data-card-rank]').forEach(b=>b.onclick=()=>{state.cardRank=b.dataset.cardRank;render()});
  document.querySelectorAll('[data-card-suit]').forEach(b=>b.onclick=()=>{
    if(!state.cardTarget||!state.cardRank)return;
    const [group,indexText]=state.cardTarget.split(':');const i=Number(indexText);state.handDraft[group][i]=state.cardRank+b.dataset.cardSuit;state.cardRank=null;state.cardTarget=null;render();
  });
  const clear=document.querySelector('[data-clear-card]');if(clear)clear.onclick=()=>{if(state.cardTarget){const [g,i]=state.cardTarget.split(':');state.handDraft[g][Number(i)]='';state.cardRank=null;render()}};
  const blind=document.querySelector('#hhBlind');if(blind)blind.oninput=()=>state.handMeta.blind=blind.value;
  const pre=document.querySelector('#hhPre');if(pre)pre.oninput=()=>state.handActions.pre=pre.value;
  const preview=document.querySelector('[data-preview-hand]');if(preview)preview.onclick=()=>{state.previewHand=handDraftToData();state.modal='handPreview';render()};
  const close=document.querySelector('[data-close-modal]');if(close)close.onclick=()=>{state.modal=null;state.editingCareerId=null;render()};
  const closePreview=document.querySelector('[data-close-preview]');if(closePreview)closePreview.onclick=()=>{state.modal=null;render()};
  document.querySelectorAll('[data-post-demo]').forEach(b=>b.onclick=()=>{state.view='home';state.composeMode='post';state.modal=null;render();toast('게시했어요')});
}
function toast(msg){const old=document.querySelector('.toast');if(old)old.remove();const el=document.createElement('div');el.className='toast';el.textContent=msg;document.body.appendChild(el);setTimeout(()=>el.remove(),1700)}
render();
