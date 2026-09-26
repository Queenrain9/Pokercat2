function wire(){
  document.querySelectorAll('[data-auth]').forEach(b=>b.onclick=()=>{state.onboardStep=1;render()});
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

  document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{if(b.dataset.nav==='compose'){state.modal='compose'}else{state.view=b.dataset.nav}render()});
  document.querySelectorAll('[data-user]').forEach(b=>b.onclick=()=>{state.view='user:'+b.dataset.user;render()});
  document.querySelectorAll('[data-follow]').forEach(b=>b.onclick=()=>{
    const k=b.dataset.follow; if(state.following.has(k))state.following.delete(k);else state.following.add(k);render();
  });
  document.querySelectorAll('[data-like]').forEach(b=>b.onclick=()=>{const k=b.dataset.like;state.liked.has(k)?state.liked.delete(k):state.liked.add(k);render()});
  document.querySelectorAll('[data-profile-tab]').forEach(b=>b.onclick=()=>{state.profileTab=b.dataset.profileTab;render()});
  document.querySelectorAll('[data-compose-type]').forEach(b=>b.onclick=()=>{state.modal=b.dataset.composeType;render()});
  const close=document.querySelector('[data-close-modal]'); if(close) close.onclick=()=>{state.modal=null;render()};
  const preview=document.querySelector('[data-preview-hand]'); if(preview) preview.onclick=()=>{
    state.previewHand={
      title:document.querySelector('#hhPos').value+' Hand · '+document.querySelector('#hhGame').value,
      blinds:document.querySelector('#hhBlind').value||'Blinds',
      players:'table',
      pos:document.querySelector('#hhPos').value,
      stack:document.querySelector('#hhStack').value||'—',
      hole:parseCards(document.querySelector('#hhHole').value),
      board:parseCards(document.querySelector('#hhBoard').value),
      pre:document.querySelector('#hhPre').value,
      flop:document.querySelector('#hhFlop').value,
      turn:document.querySelector('#hhTurn').value,
      river:document.querySelector('#hhRiver').value
    };
    state.modal='handPreview';render();
  };
  document.querySelectorAll('[data-post-demo]').forEach(b=>b.onclick=()=>{state.modal=null;render();toast('베타 게시물로 등록했어요')});
  document.querySelectorAll('[data-toast]').forEach(b=>b.onclick=()=>toast(b.dataset.toast));
  const theme=document.querySelector('[data-theme]'); if(theme) theme.onclick=()=>{
    const next=document.documentElement.dataset.theme==='dark'?'light':'dark';
    document.documentElement.dataset.theme=next;
    localStorage.setItem('pokercat_theme',next);
    render();
  };
  const reset=document.querySelector('[data-reset]'); if(reset) reset.onclick=()=>{
    localStorage.removeItem('pokercat_onboarded');
    state.onboarding=false;state.onboardStep=0;render();
  };
}

function toast(msg){
  const old=document.querySelector('.toast'); if(old)old.remove();
  const el=document.createElement('div');el.className='toast';el.textContent=msg;document.body.appendChild(el);
  setTimeout(()=>el.remove(),1600);
}

render();
