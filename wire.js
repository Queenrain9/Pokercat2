function wire(){
  document.querySelectorAll('[data-auth]').forEach(b=>b.onclick=()=>{state.onboardStep=1;state.authMode='login';render()});
  const signup=document.querySelector('[data-open-signup]'); if(signup) signup.onclick=()=>{state.authMode='signup';render()};
  const authBack=document.querySelector('[data-auth-back]'); if(authBack) authBack.onclick=()=>{state.authMode='login';render()};
  const login=document.querySelector('[data-login-demo]'); if(login) login.onclick=()=>{
    localStorage.setItem('pokercat_onboarded','1');
    state.onboarding=true;state.view='home';render();
  };
  document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{state.selectedCat=Number(b.dataset.cat);render()});
  const next=document.querySelector('[data-next-onboard]'); if(next) next.onclick=()=>{state.onboardStep=2;render()};
  const finish=document.querySelector('[data-finish-onboard]'); if(finish) finish.onclick=()=>{
    state.nickname=document.querySelector('#nick').value.trim()||'QUEENBEE';
    state.gamePref=document.querySelector('#gamePref').value;
    state.playPref=document.querySelector('#playPref').value;
    localStorage.setItem('pokercat_name',state.nickname);
    localStorage.setItem('pokercat_game',state.gamePref);
    localStorage.setItem('pokercat_play',state.playPref);
    localStorage.setItem('pokercat_cat',state.selectedCat);
    localStorage.setItem('pokercat_onboarded','1');
    state.onboarding=true;render();
  };

  document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{state.view=b.dataset.nav;state.modal=null;render()});
  document.querySelectorAll('[data-user]').forEach(b=>b.onclick=()=>{state.view='user:'+b.dataset.user;render()});
  document.querySelectorAll('[data-follow]').forEach(b=>b.onclick=()=>{
    const k=b.dataset.follow; if(state.following.has(k))state.following.delete(k);else state.following.add(k);render();
  });
  document.querySelectorAll('[data-like]').forEach(b=>b.onclick=()=>{const k=b.dataset.like;state.liked.has(k)?state.liked.delete(k):state.liked.add(k);render()});
  document.querySelectorAll('[data-profile-tab]').forEach(b=>b.onclick=()=>{state.profileTab=b.dataset.profileTab;render()});
  const close=document.querySelector('[data-close-modal]'); if(close) close.onclick=()=>{state.modal=null;render()};
  const composeText=document.querySelector('#composeText'); if(composeText) composeText.oninput=()=>{state.composeText=composeText.value};
  const syncHandDraft=()=>{
    const map=[['hhGame','game'],['hhPlayers','players'],['hhPos','pos'],['hhStack','stack'],['hhBlind','blind']];
    map.forEach(([id,key])=>{const el=document.querySelector('#'+id);if(el){el.oninput=el.onchange=()=>{state.handMeta[key]=el.value}}});
    const actions=[['hhPre','pre'],['hhFlop','flop'],['hhTurn','turn'],['hhRiver','river']];
    actions.forEach(([id,key])=>{const el=document.querySelector('#'+id);if(el){el.oninput=()=>{state.handActions[key]=el.value}}});
  };
  syncHandDraft();
  const toggleHand=document.querySelector('[data-toggle-hand]'); if(toggleHand) toggleHand.onclick=()=>{state.composeMode=state.composeMode==='hand'?'post':'hand';state.cardTarget=null;state.cardRank=null;render()};
  const removeHand=document.querySelector('[data-remove-hand]'); if(removeHand) removeHand.onclick=()=>{state.composeMode='post';state.cardTarget=null;state.cardRank=null;render()};
  document.querySelectorAll('[data-card-slot]').forEach(b=>b.onclick=()=>{state.cardTarget=b.dataset.cardSlot;state.cardRank=null;render()});
  document.querySelectorAll('[data-card-rank]').forEach(b=>b.onclick=()=>{state.cardRank=b.dataset.cardRank;render()});
  document.querySelectorAll('[data-card-suit]').forEach(b=>b.onclick=()=>{
    if(!state.cardTarget||!state.cardRank)return;
    const [group,indexText]=state.cardTarget.split(':');
    const index=Number(indexText);
    state.handDraft[group][index]=state.cardRank+b.dataset.cardSuit;
    state.cardRank=null;
    const order=[['hero',0],['hero',1],['flop',0],['flop',1],['flop',2],['turn',0],['river',0]];
    const current=order.findIndex(x=>x[0]===group&&x[1]===index);
    const next=order.slice(current+1).find(x=>!state.handDraft[x[0]][x[1]]);
    state.cardTarget=next?next[0]+':'+next[1]:null;
    render();
  });
  const clearCard=document.querySelector('[data-clear-card]'); if(clearCard) clearCard.onclick=()=>{
    if(!state.cardTarget)return;
    const [group,indexText]=state.cardTarget.split(':');
    state.handDraft[group][Number(indexText)]='';
    state.cardRank=null;render();
  };
  const preview=document.querySelector('[data-preview-hand]'); if(preview) preview.onclick=()=>{
    state.previewHand=handDraftToData();
    state.modal='handPreview';render();
  };
  const closePreview=document.querySelector('[data-close-preview]'); if(closePreview) closePreview.onclick=()=>{state.modal=null;render()};
  document.querySelectorAll('[data-post-demo]').forEach(b=>b.onclick=()=>{
    state.modal=null;state.view='home';state.composeMode='post';
    state.composeText='';
    state.handDraft={hero:['',''],flop:['','',''],turn:[''],river:['']};
    state.cardTarget=null;state.cardRank=null;
    state.handActions={pre:'',flop:'',turn:'',river:''};
    render();toast('베타 게시물로 등록했어요');
  });
  document.querySelectorAll('[data-toast]').forEach(b=>b.onclick=()=>toast(b.dataset.toast));
  const theme=document.querySelector('[data-theme]'); if(theme) theme.onclick=()=>{
    const next=document.documentElement.dataset.theme==='dark'?'light':'dark';
    document.documentElement.dataset.theme=next;
    localStorage.setItem('pokercat_theme',next);
    render();
  };
  const reset=document.querySelector('[data-reset]'); if(reset) reset.onclick=()=>{
    localStorage.removeItem('pokercat_onboarded');
    state.onboarding=false;state.onboardStep=0;state.authMode='login';render();
  };
}

function toast(msg){
  const old=document.querySelector('.toast'); if(old)old.remove();
  const el=document.createElement('div');el.className='toast';el.textContent=msg;document.body.appendChild(el);
  setTimeout(()=>el.remove(),1600);
}

render();
