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
    resetRoomDraft();state.modal=null;state.view='roomcreate';render()
  });
  const roomCreateBack=document.querySelector('[data-room-create-back]');if(roomCreateBack)roomCreateBack.onclick=()=>{state.roomDraft=null;state.view='home';render()};
  const roomBack=document.querySelector('[data-room-back]');if(roomBack)roomBack.onclick=()=>{state.view=state.roomReturnView||'home';render()};

  if(state.view==='roomcreate'){
    const draft=ensureRoomDraft();
    const nameInput=document.querySelector('#roomName');if(nameInput)nameInput.oninput=()=>draft.roomName=nameInput.value;
    const gameInput=document.querySelector('#roomGame');if(gameInput)gameInput.onchange=()=>draft.settings.gameType=gameInput.value;
    const maxInput=document.querySelector('#roomMaxPlayers');if(maxInput)maxInput.onchange=()=>draft.settings.maxPlayers=Number(maxInput.value);
    const chipsInput=document.querySelector('#roomStartingChips');if(chipsInput)chipsInput.oninput=()=>draft.settings.startingChips=Number(chipsInput.value||0);
    const sbInput=document.querySelector('#roomSb');if(sbInput)sbInput.oninput=()=>draft.settings.blinds.smallBlind=Number(sbInput.value||0);
    const bbInput=document.querySelector('#roomBb');if(bbInput)bbInput.oninput=()=>draft.settings.blinds.bigBlind=Number(bbInput.value||0);

    document.querySelectorAll('[data-room-option]').forEach(b=>b.onclick=()=>{
      state.roomOptionOpen=state.roomOptionOpen===b.dataset.roomOption?null:b.dataset.roomOption;render()
    });
    const anteMode=document.querySelector('#roomAnteMode');if(anteMode)anteMode.onchange=()=>{
      draft.settings.ante.mode=anteMode.value;
      if(anteMode.value==='none')draft.settings.ante.amount=0;
      else if(!draft.settings.ante.amount)draft.settings.ante.amount=draft.settings.blinds.smallBlind||100;
      render()
    };
    const anteAmount=document.querySelector('#roomAnteAmount');if(anteAmount)anteAmount.oninput=()=>draft.settings.ante.amount=Number(anteAmount.value||0);
    const blindMode=document.querySelector('#roomBlindMode');if(blindMode)blindMode.onchange=()=>{
      draft.settings.blindProgression.mode=blindMode.value;
      if(blindMode.value==='auto'){
        draft.settings.blindProgression.levelMinutes=draft.settings.blindProgression.levelMinutes||10;
        draft.settings.blindProgression.structureId=draft.settings.blindProgression.structureId||'standard-x2';
      }else{
        draft.settings.blindProgression.levelMinutes=null;draft.settings.blindProgression.structureId=null;
      }
      render()
    };
    const blindInterval=document.querySelector('#roomBlindInterval');if(blindInterval)blindInterval.onchange=()=>draft.settings.blindProgression.levelMinutes=Number(blindInterval.value);
    const blindStructure=document.querySelector('#roomBlindStructure');if(blindStructure)blindStructure.onchange=()=>draft.settings.blindProgression.structureId=blindStructure.value;
    document.querySelectorAll('[data-room-audience]').forEach(b=>b.onclick=()=>{
      draft.audience.type=b.dataset.roomAudience;render()
    });
  }

  document.querySelectorAll('[data-open-room-presets]').forEach(b=>b.onclick=()=>{state.modal='roomPresetLoader';render()});
  document.querySelectorAll('[data-load-preset]').forEach(b=>b.onclick=()=>{
    const preset=(window.POKER_ROOM_PRESETS||[]).find(x=>x.id===b.dataset.loadPreset);if(!preset)return;
    const draft=ensureRoomDraft();draft.settings=normalizeGameSettings(cloneData(preset.settings));draft.sourceLabel='PokerCat 프리셋 · '+preset.name;
    state.editingSavedRoomSettingId=null;state.modal=null;render();toast(preset.name+' 설정을 불러왔어요')
  });
  document.querySelectorAll('[data-load-saved-setting]').forEach(b=>b.onclick=()=>{
    const item=state.savedRoomSettings.find(x=>x.id===b.dataset.loadSavedSetting);if(!item)return;
    const draft=ensureRoomDraft();draft.settings=normalizeGameSettings(cloneData(item.settings));draft.sourceLabel='내 저장 설정 · '+item.name;
    state.editingSavedRoomSettingId=item.id;state.modal=null;render();toast(item.name+' 설정을 불러왔어요')
  });
  document.querySelectorAll('[data-open-save-room-setting]').forEach(b=>b.onclick=()=>{state.modal='roomSaveSetting';render()});
  const saveRoomSetting=document.querySelector('[data-save-room-setting]');if(saveRoomSetting)saveRoomSetting.onclick=()=>{
    const name=(document.querySelector('#savedRoomSettingName')?.value||'').trim();if(!name){toast('설정 이름을 입력해 주세요');return}
    const draft=ensureRoomDraft(),now=new Date().toISOString();
    state.savedRoomSettings.unshift({
      id:'setting-'+Date.now(),name,settings:normalizeGameSettings(cloneData(draft.settings)),
      audience:null,includeAudience:false,createdAt:now,updatedAt:now
    });
    persistSavedRoomSettings();state.modal=null;render();toast('내 게임 설정으로 저장했어요')
  };
  document.querySelectorAll('[data-rename-saved-setting]').forEach(b=>b.onclick=()=>{
    state.editingSavedRoomSettingId=b.dataset.renameSavedSetting;state.modal='roomRenameSetting';render()
  });
  const confirmRename=document.querySelector('[data-confirm-rename-setting]');if(confirmRename)confirmRename.onclick=()=>{
    const name=(document.querySelector('#renameRoomSettingName')?.value||'').trim();if(!name){toast('새 이름을 입력해 주세요');return}
    const item=state.savedRoomSettings.find(x=>x.id===state.editingSavedRoomSettingId);if(!item)return;
    item.name=name;item.updatedAt=new Date().toISOString();persistSavedRoomSettings();state.modal='roomPresetLoader';render();toast('설정 이름을 변경했어요')
  };
  document.querySelectorAll('[data-overwrite-saved-setting]').forEach(b=>b.onclick=()=>{
    const item=state.savedRoomSettings.find(x=>x.id===b.dataset.overwriteSavedSetting);if(!item)return;
    const draft=ensureRoomDraft();item.settings=normalizeGameSettings(cloneData(draft.settings));item.updatedAt=new Date().toISOString();
    persistSavedRoomSettings();state.modal='roomPresetLoader';render();toast(item.name+' 설정을 덮어썼어요')
  });
  document.querySelectorAll('[data-delete-saved-setting]').forEach(b=>b.onclick=()=>{
    state.savedRoomSettings=state.savedRoomSettings.filter(x=>x.id!==b.dataset.deleteSavedSetting);
    if(state.editingSavedRoomSettingId===b.dataset.deleteSavedSetting)state.editingSavedRoomSettingId=null;
    persistSavedRoomSettings();render();toast('저장 설정을 삭제했어요')
  });

  document.querySelectorAll('[data-create-room-submit]').forEach(b=>b.onclick=()=>{
    if(!state.loggedIn){requireAuth('Poker Room을 만들려면 로그인해 주세요.',{type:'view',view:'roomcreate'});return}
    if(state.view!=='roomcreate')return;
    const draft=ensureRoomDraft(),settings=normalizeGameSettings(cloneData(draft.settings));
    const name=(draft.roomName||'').trim();
    if(!name){toast('방 이름을 입력해 주세요');return}
    if(settings.startingChips<1000){toast('시작 칩은 1,000 이상으로 설정해 주세요');return}
    if(settings.blinds.smallBlind<=0||settings.blinds.bigBlind<=settings.blinds.smallBlind){toast('Big Blind는 Small Blind보다 커야 해요');return}
    if(settings.ante.mode!=='none'&&settings.ante.amount<=0){toast('Ante 칩을 설정해 주세요');return}
    if(draft.audience.type==='homepub'&&!verifiedHomePub(myUser())){toast('Home Pub 인증 후 선택할 수 있어요');return}
    const id='room-'+Date.now(),tableId=id+'-table-1';
    const room={
      id,mode:'single-table',name,hostId:'queenbee',settings,audience:{type:draft.audience.type},
      status:'lobby',
      tables:[{id:tableId,status:'waiting',seats:Array.from({length:settings.maxPlayers},(_,i)=>i===0?'queenbee':null)}],
      invitedUserIds:[],createdAt:new Date().toISOString(),
      social:{externalShare:{enabled:false,token:null}},
      tournament:{mode:'single-table',mttConfig:null}
    };
    state.rooms=[room,...state.rooms];persistRooms();state.currentRoomId=id;state.roomReturnView='home';state.roomDraft=null;state.view='room:'+id;render();toast('게임방을 만들었어요')
  });

  document.querySelectorAll('[data-open-room]').forEach(b=>b.onclick=()=>{
    const room=getRoom(b.dataset.openRoom);if(!room)return;
    if(roomAudienceType(room)!=='public'&&!state.loggedIn){requireAuth('이 Poker Room을 보려면 로그인해 주세요.',{type:'openRoom',id:room.id});return}
    if(state.loggedIn&&!canEnterRoom(room)){toast('이 게임방의 공개 대상이 아니에요');return}
    state.currentRoomId=room.id;state.roomReturnView=state.view;state.modal=null;state.view='room:'+room.id;render()
  });
  document.querySelectorAll('[data-join-room]').forEach(b=>b.onclick=()=>{
    if(!state.loggedIn){requireAuth('대기방에서 자리에 앉으려면 로그인해 주세요.',{type:'joinRoom',id:b.dataset.joinRoom});return}
    joinRoomById(b.dataset.joinRoom)
  });
  document.querySelectorAll('[data-leave-room]').forEach(b=>b.onclick=()=>{
    if(!state.loggedIn){requireAuth('게임방 기능을 사용하려면 로그인해 주세요.');return}
    const room=getRoom(b.dataset.leaveRoom);if(!room)return;
    if(room.hostId==='queenbee'){toast('방장은 대기방을 나가기 전에 방 종료 기능이 필요해요');return}
    const seats=roomSeats(room),idx=seats.indexOf('queenbee');if(idx>=0)seats[idx]=null;
    persistRooms();render();toast('자리에서 나왔어요')
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
    persistRooms();persistRoomInvites();render();toast(getUser(toUserId).name+'님을 초대했어요')
  });
  document.querySelectorAll('[data-start-room]').forEach(b=>b.onclick=()=>{
    if(!state.loggedIn){requireAuth('게임을 시작하려면 로그인해 주세요.');return}
    const room=getRoom(b.dataset.startRoom);if(!room||room.hostId!=='queenbee')return;
    if(roomSeatCount(room)<2){toast('2명 이상 착석해야 시작할 수 있어요');return}
    room.status='playing';const table=roomTable(room);if(table)table.status='playing';
    persistRooms();render();toast('플레이머니 테이블을 시작했어요')
  });
  const roomMenu=document.querySelector('[data-room-menu]');if(roomMenu)roomMenu.onclick=()=>{
    if(!state.loggedIn){requireAuth('Poker Room 관리 기능을 사용하려면 로그인해 주세요.');return}
    const room=getRoom(state.currentRoomId);
    if(room?.hostId==='queenbee'){state.modal='roomInvite';render()}else toast('Room 메뉴는 다음 단계에서 확장해요')
  };

  document.querySelectorAll('[data-user]').forEach(b=>b.onclick=()=>{state.modal=null;state.view='user:'+b.dataset.user;render()});

  document.querySelectorAll('[data-follow]').forEach(b=>b.onclick=()=>{
    const k=b.dataset.follow;
    if(!state.loggedIn){requireAuth('플레이어를 팔로우하려면 로그인해 주세요.',{type:'follow',key:k});return}
    state.following.has(k)?state.following.delete(k):state.following.add(k);
    persistRelationships();render();
  });
  document.querySelectorAll('[data-like]').forEach(b=>b.onclick=()=>{
    const k=b.dataset.like;
    if(!state.loggedIn){requireAuth('게시물에 좋아요를 남기려면 로그인해 주세요.',{type:'like',key:k});return}
    state.liked.has(k)?state.liked.delete(k):state.liked.add(k);render()
  });
  document.querySelectorAll('[data-save-post]').forEach(b=>b.onclick=()=>{
    if(!state.loggedIn){requireAuth('게시물을 저장하려면 로그인해 주세요.',{type:'savePost'});return}
    toast('저장했어요')
  });

  const feedSelector=document.querySelector('[data-open-feed-selector]');if(feedSelector)feedSelector.onclick=()=>{state.modal='feedSelector';render()};
  document.querySelectorAll('[data-feed-mode]').forEach(b=>b.onclick=()=>{
    const mode=b.dataset.feedMode;
    if(mode!=='algorithm'&&!state.loggedIn){
      requireAuth(mode==='homepub'?'Home Pub 피드를 보려면 로그인해 주세요.':'팔로잉 피드를 보려면 로그인해 주세요.',{type:'feedMode',mode});
      return
    }
    if(mode==='homepub'&&!verifiedHomePub(myUser())){
      state.modal=null;state.feedMode='homepub';render();return
    }
    state.feedMode=mode;state.modal=null;state.view='home';render()
  });
  const openNotifications=document.querySelector('[data-open-notifications]');if(openNotifications)openNotifications.onclick=()=>{
    if(!state.loggedIn){requireAuth('알림을 확인하려면 로그인해 주세요.',{type:'view',view:'notifications'});return}
    state.view='notifications';render()
  };
  const notificationBack=document.querySelector('[data-notification-back]');if(notificationBack)notificationBack.onclick=()=>{state.view='home';render()};
  const markRead=document.querySelector('[data-mark-read]');if(markRead)markRead.onclick=()=>{state.notificationsRead=true;render();toast('알림을 모두 읽음 처리했어요')};

  const homePubBack=document.querySelector('[data-homepub-back]');if(homePubBack)homePubBack.onclick=()=>{state.view='profile';render()};
  document.querySelectorAll('[data-open-homepub]').forEach(b=>b.onclick=()=>{
    if(!state.loggedIn){requireAuth('Home Pub 기능을 사용하려면 로그인해 주세요.',{type:'view',view:'profile'});return}
    if(verifiedHomePub(myUser())){state.view='homepub';state.modal=null;render()}
    else if(state.homePub){state.modal='homePubVerify';render()}
    else{state.modal='profileEdit';render()}
  });
  document.querySelectorAll('[data-open-homepub-verify]').forEach(b=>b.onclick=()=>{
    if(!state.loggedIn){requireAuth('Home Pub 인증을 하려면 로그인해 주세요.',{type:'view',view:'profile'});return}
    if(state.homePub){state.modal='homePubVerify';render()}else{state.modal='profileEdit';render()}
  });

  document.querySelectorAll('[data-explore-tab]').forEach(b=>b.onclick=()=>{state.exploreTab=b.dataset.exploreTab;render()});
  document.querySelectorAll('[data-profile-tab]').forEach(b=>b.onclick=()=>{state.profileTab=b.dataset.profileTab;render()});
  const openProfileMenu=document.querySelector('[data-open-profile-menu]');if(openProfileMenu)openProfileMenu.onclick=()=>{state.modal='profileUtility';render()};
  document.querySelectorAll('[data-open-tools]').forEach(b=>b.onclick=()=>{state.modal=null;state.view='tools';render()});
  document.querySelectorAll('[data-open-tool]').forEach(b=>b.onclick=()=>{state.view='tool:'+b.dataset.openTool;render()});
  document.querySelectorAll('[data-tools-back]').forEach(b=>b.onclick=()=>{state.view='profile';render()});
  document.querySelectorAll('[data-tool-back]').forEach(b=>b.onclick=()=>{state.view='tools';render()});
  if(state.view==='tool:odds'){
    const potInput=document.querySelector('#oddsPotSize');
    const callInput=document.querySelector('#oddsCallAmount');
    const outsInput=document.querySelector('#oddsOuts');
    const potOddsOutput=document.querySelector('#oddsPotOdds');
    const requiredEquityOutput=document.querySelector('#oddsRequiredEquity');
    const turnOutput=document.querySelector('#oddsTurnChance');
    const riverOutput=document.querySelector('#oddsRiverChance');

    const refreshOdds=()=>{
      const result=calculatePokerOdds(potInput?.value,callInput?.value,outsInput?.value);
      if(potOddsOutput)potOddsOutput.textContent=result.pot?formatPotOddsRatio(result.pot.ratio):'--';
      if(requiredEquityOutput)requiredEquityOutput.textContent=result.pot?result.pot.requiredEquity.toFixed(1)+'%':'--%';
      if(turnOutput)turnOutput.textContent=result.outs?result.outs.turn.toFixed(1)+'%':'--%';
      if(riverOutput)riverOutput.textContent=result.outs?result.outs.river.toFixed(1)+'%':'--%';
    };

    [potInput,callInput,outsInput].filter(Boolean).forEach(input=>{
      input.addEventListener('input',refreshOdds);
      input.addEventListener('change',refreshOdds);
    });
    refreshOdds();
  }
  if(state.view==='tool:range'){
    const api=window.PREFLOP_RANGE_DATA;
    const formatInput=document.querySelector('#rangeFormat');
    const playersInput=document.querySelector('#rangePlayers');
    const stackInput=document.querySelector('#rangeStack');
    const positionInput=document.querySelector('#rangePosition');
    const situationInput=document.querySelector('#rangeSituation');
    const matrix=document.querySelector('#rangeMatrix');
    const context=document.querySelector('#rangeContext');
    const coverage=document.querySelector('#rangeCoverage');
    const primaryLegend=document.querySelector('#rangeLegendPrimary');
    const mixLegend=document.querySelector('#rangeLegendMix');
    const foldLegend=document.querySelector('#rangeLegendFold');
    const sourceNote=document.querySelector('#rangeSourceNote');

    const refreshRange=()=>{
      if(!api)return;
      const requested={
        format:formatInput?.value,
        players:Number(playersInput?.value||8),
        stack:Number(stackInput?.value||40),
        position:positionInput?.value,
        situation:situationInput?.value
      };
      const optionSet=api.getOptions(requested);
      const chart=api.getChart(requested);
      const f=chart.filters;

      if(stackInput){
        stackInput.innerHTML=rangeSelectOptions(optionSet.stacks,f.stack,x=>x+'BB');
        stackInput.value=String(f.stack);
      }
      const positionOptions=api.getOptions(f).positions;
      if(positionInput){
        positionInput.innerHTML=rangeSelectOptions(positionOptions,f.position);
        positionInput.value=f.position;
      }
      if(matrix)matrix.innerHTML=chart.cells.map(rangeCellMarkup).join('');
      if(context)context.textContent=`${f.format} · ${f.players}-Max · ${f.stack}BB · ${f.position} · ${f.situation}`;
      if(coverage)coverage.textContent=chart.stats.matrixCoverage+'%';
      if(primaryLegend)primaryLegend.textContent=chart.labels.primary;
      if(mixLegend)mixLegend.textContent=chart.labels.mix;
      if(foldLegend)foldLegend.textContent=chart.labels.fold;
      if(sourceNote)sourceNote.textContent=chart.source+' · '+chart.note;
    };

    [formatInput,playersInput,stackInput,positionInput,situationInput].filter(Boolean).forEach(input=>{
      input.addEventListener('change',refreshRange);
    });
    refreshRange();
  }
  document.querySelectorAll('[data-open-hand-detail]').forEach(b=>b.onclick=()=>{state.handReturnView=state.view;state.view='hand:'+b.dataset.openHandDetail;render()});
  document.querySelectorAll('[data-hand-detail-back]').forEach(b=>b.onclick=()=>{state.view=state.handReturnView||'profile';render()});

  const editAvatar=document.querySelector('[data-edit-avatar]');if(editAvatar)editAvatar.onclick=()=>{
    if(!state.loggedIn){requireAuth('프로필 이미지를 변경하려면 로그인해 주세요.',{type:'view',view:'profile'});return}
    state.modal='avatarPicker';render()
  };
  document.querySelectorAll('[data-select-avatar]').forEach(b=>b.onclick=()=>{
    state.selectedCat=Number(b.dataset.selectAvatar);
    localStorage.setItem('pokercat_cat',String(state.selectedCat));
    state.modal=null;render();toast('포커캣을 변경했어요')
  });

  const editProfile=document.querySelector('[data-edit-profile]');if(editProfile)editProfile.onclick=()=>{
    if(!state.loggedIn){requireAuth('프로필을 편집하려면 로그인해 주세요.',{type:'view',view:'profile'});return}
    state.modal='profileEdit';render()
  };
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

  document.querySelectorAll('[data-relationship]').forEach(b=>b.onclick=()=>{
    if(!state.loggedIn){requireAuth('팔로워와 팔로잉 목록을 보려면 로그인해 주세요.',{type:'view',view:'profile'});return}
    state.relationshipMode=b.dataset.relationship;state.modal='relationships';render()
  });

  document.querySelectorAll('[data-career-add]').forEach(b=>b.onclick=()=>{
    if(!state.loggedIn){requireAuth('커리어를 등록하려면 로그인해 주세요.',{type:'view',view:'profile'});return}
    state.editingCareerId=null;state.modal='careerEdit';render()
  });
  document.querySelectorAll('[data-career-edit]').forEach(b=>b.onclick=()=>{
    if(!state.loggedIn){requireAuth('커리어를 수정하려면 로그인해 주세요.',{type:'view',view:'profile'});return}
    state.editingCareerId=b.dataset.careerEdit;state.modal='careerEdit';render()
  });
  document.querySelectorAll('[data-career-delete]').forEach(b=>b.onclick=()=>{
    if(!state.loggedIn){requireAuth('커리어를 수정하려면 로그인해 주세요.',{type:'view',view:'profile'});return}
    state.careerHighs=state.careerHighs.filter(x=>x.id!==b.dataset.careerDelete);persistCareerHighs();render();toast('커리어 기록을 삭제했어요');
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
      imageUrl:old?.imageUrl||old?.photoUrl||null,
      verification:old?.verification||{status:'unverified',provider:null,verifiedAt:null},
      createdAt:old?.createdAt||now,updatedAt:now
    };
    if(old)state.careerHighs=state.careerHighs.map(x=>x.id===old.id?record:x);else state.careerHighs=[record,...state.careerHighs];
    persistCareerHighs();state.modal=null;state.editingCareerId=null;state.profileTab='career';render();toast('커리어를 저장했어요');
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
  document.querySelectorAll('[data-post-demo]').forEach(b=>b.onclick=()=>{
    if(!state.loggedIn){requireAuth('게시하려면 로그인해 주세요.',{type:'view',view:'compose'});return}
    state.view='home';state.composeMode='post';state.modal=null;render();toast('게시했어요')
  });
}
function applyPendingAuth(pending){
  if(!pending){render();return}
  if(pending.type==='view'){
    state.view=pending.view;state.modal=null;render();return;
  }
  if(pending.type==='modal'){
    state.modal=pending.modal;render();return;
  }
  if(pending.type==='feedMode'){
    state.feedMode=pending.mode||'algorithm';state.view='home';state.modal=null;render();return;
  }
  if(pending.type==='followingFeed'){
    state.feedMode='following';state.view='home';state.modal=null;render();return;
  }
  if(pending.type==='follow'){
    state.following.has(pending.key)?state.following.delete(pending.key):state.following.add(pending.key);
    persistRelationships();render();return;
  }
  if(pending.type==='like'){
    state.liked.has(pending.key)?state.liked.delete(pending.key):state.liked.add(pending.key);
    render();return;
  }
  if(pending.type==='savePost'){
    render();toast('저장했어요');return;
  }
  if(pending.type==='openRoom'){
    state.currentRoomId=pending.id;state.roomReturnView=state.view;state.view='room:'+pending.id;state.modal=null;render();return;
  }
  if(pending.type==='joinRoom'){
    state.currentRoomId=pending.id;state.view='room:'+pending.id;state.modal=null;
    joinRoomById(pending.id);return;
  }
  render();
}

function joinRoomById(id){
  const room=getRoom(id);if(!room)return;
  if(!canEnterRoom(room)){state.view='room:'+id;render();toast('이 게임방의 공개 대상이 아니에요');return}
  if(room.status==='playing'){state.view='room:'+id;render();toast('이미 시작된 게임은 현재 관전만 가능해요');return}
  const seats=roomSeats(room);
  if(seats.includes('queenbee')){state.view='room:'+id;render();toast('이미 착석 중이에요');return}
  const idx=seats.findIndex(x=>!x);if(idx<0){state.view='room:'+id;render();toast('빈 좌석이 없어요');return}
  seats[idx]='queenbee';persistRooms();state.view='room:'+id;render();toast('대기방에 착석했어요');
}

function toast(msg){const old=document.querySelector('.toast');if(old)old.remove();const el=document.createElement('div');el.className='toast';el.textContent=msg;document.body.appendChild(el);setTimeout(()=>el.remove(),1700)}
render();
