function wire(){
  document.querySelectorAll('[data-start],[data-auth]').forEach(b=>b.onclick=()=>{state.onboardStep=1;state.authMode='landing';render()});
  const openLogin=document.querySelector('[data-open-login]');if(openLogin)openLogin.onclick=()=>{state.authMode='login';render()};
  const authBack=document.querySelector('[data-auth-back]');if(authBack)authBack.onclick=()=>{state.authMode='landing';render()};
  const login=document.querySelector('[data-login-demo]');if(login)login.onclick=()=>{localStorage.setItem('pokercat_onboarded','1');state.onboarding=true;state.view='home';render()};
  document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{state.selectedCat=Number(b.dataset.cat);render()});
  const next=document.querySelector('[data-next-onboard]');if(next)next.onclick=()=>{state.onboardStep=2;render()};
  document.querySelectorAll('[data-skip-onboard]').forEach(b=>b.onclick=()=>{localStorage.setItem('pokercat_onboarded','1');state.onboarding=true;state.view='home';render()});
  const finish=document.querySelector('[data-finish-onboard]');if(finish)finish.onclick=()=>{
    state.nickname=document.querySelector('#nick').value.trim()||'QUEENBEE';
    state.gamePref=document.querySelector('#gamePref').value;state.playPref=document.querySelector('#playPref').value;
    localStorage.setItem('pokercat_name',state.nickname);localStorage.setItem('pokercat_game',state.gamePref);localStorage.setItem('pokercat_play',state.playPref);localStorage.setItem('pokercat_cat',state.selectedCat);localStorage.setItem('pokercat_onboarded','1');
    state.onboarding=true;state.view='home';render();
  };

  document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{state.view=b.dataset.nav;state.modal=null;if(state.view!=='compose')state.composeMode='post';render()});
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
