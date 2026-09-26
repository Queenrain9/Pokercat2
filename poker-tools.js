const POKER_TOOLS = [
  {id:'equity',name:'Equity Calculator',icon:'♠',desc:'Hero / Villain / Board 기반 equity 계산'},
  {id:'bankroll',name:'Bankroll Tracker',icon:'₩',desc:'Bankroll과 세션 손익 기록'},
  {id:'odds',name:'Poker Odds Calculator',icon:'%',desc:'Pot Odds · Required Equity · Outs'},
  {id:'range',name:'Preflop Range Charts',icon:'13×13',desc:'상황별 프리플랍 레인지 조회'},
  {id:'icm',name:'ICM Calculator',icon:'ICM',desc:'토너먼트 스택과 상금 구조 기반 ICM'}
];

function pokerToolTitle(id){
  return POKER_TOOLS.find(t=>t.id===id)?.name||'Poker Tools';
}

function profileUtilityMenuModal(){
  return `<div class="modal-backdrop" data-close-modal>
    <div class="sheet profile-utility-sheet" onclick="event.stopPropagation()">
      <div class="grab"></div>
      <div class="sheet-title">프로필 메뉴</div>
      <button class="utility-menu-row" data-open-tools>
        <span class="utility-menu-icon">♠</span>
        <div><b>Poker Tools</b><small>계산기, Bankroll, Range, ICM 도구 모음</small></div>
        <i>›</i>
      </button>
      <button class="utility-menu-row" data-toast="저장함은 다음 단계에서 연결할게요">
        <span class="utility-menu-icon">⌑</span>
        <div><b>저장함</b><small>저장한 게시물과 핸드</small></div>
        <i>›</i>
      </button>
      <button class="utility-menu-row" data-toast="설정 메뉴는 준비 중이에요">
        <span class="utility-menu-icon">⚙</span>
        <div><b>설정</b><small>계정 및 앱 설정</small></div>
        <i>›</i>
      </button>
    </div>
  </div>`;
}

function pokerToolsHubView(){
  return `<section class="tools-screen tools-hub">
    <div class="tools-hero">
      <div class="tools-kicker">POKERCAT UTILITY</div>
      <h1>Poker Tools</h1>
      <p>플레이와 학습에 자주 쓰는 보조 도구를 한곳에 모았어요.</p>
    </div>
    <div class="tools-list">
      ${POKER_TOOLS.map(tool=>`
        <button class="tool-hub-card" data-open-tool="${tool.id}">
          <span class="tool-hub-icon">${tool.icon}</span>
          <div><b>${tool.name}</b><small>${tool.desc}</small></div>
          <i>›</i>
        </button>
      `).join('')}
    </div>
    <div class="tools-note">Poker Tools는 도구별로 실제 계산 기능을 단계적으로 연결하고 있어요.</div>
  </section>`;
}

function pokerToolView(id){
  if(id==='equity')return equityToolView();
  if(id==='bankroll')return bankrollToolView();
  if(id==='odds')return oddsToolView();
  if(id==='range')return rangeToolView();
  if(id==='icm')return icmToolView();
  return pokerToolsHubView();
}

function toolSectionTitle(title,sub=''){
  return `<div class="tool-section-title"><b>${title}</b>${sub?`<span>${sub}</span>`:''}</div>`;
}
function placeholderCard(text='결과 계산 영역'){
  return `<div class="tool-result-placeholder"><span>PREVIEW</span><b>${text}</b><small>계산 로직은 다음 단계에서 연결됩니다.</small></div>`;
}

const EQUITY_SUIT_SYMBOL={s:'♠',h:'♥',d:'♦',c:'♣'};
const equityToolState={
  mode:'hand',
  hero:['As','Ks'],
  villain:['Qh','Qc'],
  board:['Js','Ts','2d','',''],
  rangeText:'QQ+, AKs, AKo',
  result:null,
  error:''
};

function equityCardLabel(card){return card?card[0]+EQUITY_SUIT_SYMBOL[card[1]]:'＋'}
function equityCardTone(card){return card&&['h','d'].includes(card[1])?' red':''}
function equityAllSelected(excludeGroup='',excludeIndex=-1){
  const cards=[];
  equityToolState.hero.forEach((c,i)=>{if(c&&!(excludeGroup==='hero'&&i===excludeIndex))cards.push(c)});
  if(equityToolState.mode==='hand')equityToolState.villain.forEach((c,i)=>{if(c&&!(excludeGroup==='villain'&&i===excludeIndex))cards.push(c)});
  equityToolState.board.forEach((c,i)=>{if(c&&!(excludeGroup==='board'&&i===excludeIndex))cards.push(c)});
  return cards;
}
function equityCardOptions(selected){
  const engine=window.PokerCatEquityEngine;
  if(!engine)return '<option value="">＋</option>';
  const cards=[];
  for(const rank of engine.RANKS)for(const suit of engine.SUITS)cards.push(rank+suit);
  return `<option value="">＋</option>${cards.map(card=>`<option value="${card}" ${selected===card?'selected':''}>${equityCardLabel(card)}</option>`).join('')}`;
}
function equityCardSelect(group,index,card,board=false){
  return `<select class="equity-card-select${board?' board-card':''}${equityCardTone(card)}" data-equity-card-group="${group}" data-equity-card-index="${index}" aria-label="${group} card ${index+1}">${equityCardOptions(card)}</select>`;
}
function equityResultNote(){
  const r=equityToolState.result;
  if(!r)return `<div class="equity-result-note"><b>실제 Hold'em equity 계산</b><span>플랍 이후처럼 경우의 수가 작으면 정확한 전수 계산, 큰 경우는 Monte Carlo 방식으로 계산합니다.</span></div>`;
  return `<div class="equity-result-note calculated"><div><b>${r.method==='exact'?'Exact':'Monte Carlo'}</b><strong>${r.total.toLocaleString()} ${r.method==='exact'?'runouts':'samples'}</strong></div><span>Hero ${r.wins.toLocaleString()}승 · Tie ${r.ties.toLocaleString()} · Villain ${r.losses.toLocaleString()}승${r.rangeCombos>1?` · Range ${r.rangeCombos} combos`:''}</span></div>`;
}

function equityToolView(){
  const result=equityToolState.result;
  const heroPct=result?result.heroEquity.toFixed(1)+'%':'--%';
  const villainPct=result?result.villainEquity.toFixed(1)+'%':'--%';
  return `<section class="tools-screen tool-detail">
    <div class="tool-intro"><span>♠</span><div><b>Equity Calculator</b><small>Hand vs Hand / Range equity</small></div></div>
    <div class="tool-panel">
      ${toolSectionTitle('Hero Hand')}
      <div class="tool-card-slots">${equityToolState.hero.map((card,i)=>equityCardSelect('hero',i,card)).join('')}</div>
    </div>
    <div class="tool-panel">
      ${toolSectionTitle('Villain','Hand 또는 Range')}
      <div class="segmented-mini"><button type="button" class="${equityToolState.mode==='hand'?'active':''}" data-equity-mode="hand">Hand</button><button type="button" class="${equityToolState.mode==='range'?'active':''}" data-equity-mode="range">Range</button></div>
      ${equityToolState.mode==='hand'
        ?`<div class="tool-card-slots">${equityToolState.villain.map((card,i)=>equityCardSelect('villain',i,card)).join('')}</div>`
        :`<label class="tool-input-label">Range<input id="equityRangeInput" value="${escapeHtml(equityToolState.rangeText)}" placeholder="예: QQ+, AKs, AKo"></label><div class="equity-range-hint">지원: QQ+ · 99-66 · AJs+ · AKs · AKo · A5s-A2s</div>`}
    </div>
    <div class="tool-panel">
      ${toolSectionTitle('Board','0~5 cards')}
      <div class="tool-card-slots board">${equityToolState.board.map((card,i)=>equityCardSelect('board',i,card,true)).join('')}</div>
    </div>
    <div class="tool-panel">
      ${toolSectionTitle('Equity')}
      <div class="equity-result-shell">
        <div><small>HERO</small><b>${heroPct}</b><span>Equity</span></div>
        <div class="equity-vs">VS</div>
        <div><small>VILLAIN</small><b>${villainPct}</b><span>Equity</span></div>
      </div>
      ${equityToolState.error?`<div class="equity-error">${escapeHtml(equityToolState.error)}</div>`:''}
      <button type="button" class="tool-secondary-cta equity-calc-btn" data-equity-calculate>Equity 계산</button>
      ${equityResultNote()}
    </div>
  </section>`;
}

function buildEquityCalculation(){
  const engine=window.PokerCatEquityEngine;
  if(!engine)throw new Error('Equity engine을 불러오지 못했습니다.');
  const hero=equityToolState.hero.filter(Boolean),board=equityToolState.board.filter(Boolean),blocked=[...hero,...board];
  if(hero.length!==2)throw new Error('Hero Hand 2장을 선택해 주세요.');
  let villainCombos;
  if(equityToolState.mode==='hand'){
    const villain=equityToolState.villain.filter(Boolean);
    if(villain.length!==2)throw new Error('Villain Hand 2장을 선택해 주세요.');
    if(villain.some(c=>blocked.includes(c))||villain[0]===villain[1])throw new Error('Hero/Board와 겹치는 Villain 카드가 있습니다.');
    villainCombos=[villain];
  }else villainCombos=engine.parseRange(equityToolState.rangeText,blocked);
  return engine.calculate({hero,villainCombos,board,seedText:[hero.join(''),equityToolState.mode,equityToolState.mode==='range'?equityToolState.rangeText:equityToolState.villain.join(''),board.join('')].join('|')});
}

function installEquityToolEvents(){
  if(window.__pokercatEquityEventsInstalled)return;
  window.__pokercatEquityEventsInstalled=true;
  document.addEventListener('input',event=>{
    if(event.target.id!=='equityRangeInput')return;
    equityToolState.rangeText=event.target.value;equityToolState.result=null;equityToolState.error='';
  });
  document.addEventListener('change',event=>{
    const select=event.target.closest?.('[data-equity-card-group]');
    if(!select)return;
    const group=select.dataset.equityCardGroup,index=Number(select.dataset.equityCardIndex),card=select.value;
    if(card&&equityAllSelected(group,index).includes(card)){
      equityToolState.error='이미 사용 중인 카드입니다.';render();return;
    }
    equityToolState[group][index]=card;equityToolState.result=null;equityToolState.error='';render();
  });
  document.addEventListener('click',event=>{
    const mode=event.target.closest?.('[data-equity-mode]');
    if(mode){equityToolState.mode=mode.dataset.equityMode;equityToolState.result=null;equityToolState.error='';render();return}
    const calc=event.target.closest?.('[data-equity-calculate]');
    if(!calc)return;
    const input=document.querySelector('#equityRangeInput');if(input)equityToolState.rangeText=input.value;
    calc.disabled=true;calc.textContent='계산 중…';
    setTimeout(()=>{try{equityToolState.result=buildEquityCalculation();equityToolState.error=''}catch(error){equityToolState.result=null;equityToolState.error=error?.message||'Equity 계산 중 오류가 발생했습니다.'}render()},0);
  });
}
installEquityToolEvents();

function bankrollToolView(){
  const data=loadBankrollData();
  const period=state.bankrollPeriod||'month';
  const periodInfo=bankrollPeriodInfo(period);
  const sorted=data.sessions.slice().sort((a,b)=>b.date.localeCompare(a.date)||String(b.updatedAt).localeCompare(String(a.updatedAt)));
  const selected=bankrollSessionsForPeriod(sorted,period);
  const allProfit=sorted.reduce((sum,session)=>sum+Number(session.result||0),0);
  const periodProfit=selected.reduce((sum,session)=>sum+Number(session.result||0),0);
  const wins=selected.filter(session=>session.result>0).length;
  const winRate=selected.length?(wins/selected.length)*100:null;
  const durationSessions=selected.filter(session=>Number.isFinite(session.durationHours)&&session.durationHours>=0);
  const avgDuration=durationSessions.length?durationSessions.reduce((sum,session)=>sum+session.durationHours,0)/durationSessions.length:null;
  const currentBankroll=data.startingBankroll+allProfit;
  const recent=sorted.slice(0,10);

  return `<section class="tools-screen tool-detail">
    <div class="tool-intro"><span>₩</span><div><b>Bankroll Tracker</b><small>Session based bankroll overview</small></div></div>
    <div class="bankroll-hero-card">
      <small>CURRENT BANKROLL</small>
      <b>${formatBankrollWon(currentBankroll)}</b>
      <div class="bankroll-base-line">
        <span>시작 Bankroll ${formatBankrollWon(data.startingBankroll)}</span>
        <button data-edit-bankroll-base>변경</button>
      </div>
    </div>
    <div class="bankroll-period-switch" role="group" aria-label="기간 선택">
      ${[['month','이번 달'],['30d','30일'],['all','전체']].map(([key,label])=>`<button class="${period===key?'active':''}" data-bankroll-period="${key}">${label}</button>`).join('')}
    </div>
    <div class="tool-metric-grid">
      <div><small>${periodInfo.label} 손익</small><b class="${periodProfit>0?'positive':periodProfit<0?'negative':''}">${formatBankrollWon(periodProfit,{signed:true})}</b></div>
      <div><small>Session</small><b>${selected.length}</b></div>
      <div><small>Win Rate</small><b>${winRate===null?'--':winRate.toFixed(0)+'%'}</b></div>
      <div><small>Avg. Session</small><b>${avgDuration===null?'--':avgDuration.toFixed(1)+'h'}</b></div>
    </div>
    <div class="tool-panel">
      ${toolSectionTitle('최근 Session',sorted.length?sorted.length+'개 기록':'기록 없음')}
      <div class="session-list">
        ${recent.length?recent.map(session=>`<button class="session-row" data-edit-bankroll-session="${escapeHtml(session.id)}">
          <div>
            <b>${formatBankrollDate(session.date)}</b>
            <span>${escapeHtml(session.gameType)} · ${escapeHtml(session.venueType)}${session.durationHours!==null?' · '+session.durationHours+'h':''}</span>
            ${session.note?`<small>${escapeHtml(session.note)}</small>`:''}
          </div>
          <div class="session-result-wrap">
            <strong class="${session.result>0?'positive':session.result<0?'negative':''}">${formatBankrollWon(session.result,{signed:true})}</strong>
            <i>›</i>
          </div>
        </button>`).join(''):`<div class="bankroll-empty"><b>아직 기록된 세션이 없어요.</b><span>첫 세션을 추가하면 Bankroll과 통계가 자동으로 계산됩니다.</span></div>`}
      </div>
      <button class="tool-secondary-cta bankroll-add-session" data-add-bankroll-session>＋ Session 기록 추가</button>
    </div>
  </section>
  ${state.modal==='bankrollSession'?bankrollSessionModal():''}
  ${state.modal==='bankrollBase'?bankrollBaseModal():''}`;
}

function bankrollSessionModal(){
  const data=loadBankrollData();
  const existing=data.sessions.find(session=>session.id===state.bankrollEditingId)||null;
  const date=existing?.date||bankrollToday();
  const result=existing?String(existing.result):'';
  const duration=existing?.durationHours===null||existing?.durationHours===undefined?'':String(existing.durationHours);
  return `<div class="modal-backdrop" data-close-modal>
    <div class="sheet bankroll-sheet" onclick="event.stopPropagation()">
      <div class="grab"></div>
      <div class="sheet-title">${existing?'Session 수정':'Session 추가'}</div>
      <div class="bankroll-form">
        <label class="tool-input-label">날짜<input id="bankrollDate" type="date" value="${escapeHtml(date)}"></label>
        <div class="tool-form-row">
          <label class="tool-input-label">게임
            <select id="bankrollGameType">
              ${['MTT','Cash','SNG','Mixed'].map(value=>`<option ${existing?.gameType===value?'selected':''}>${value}</option>`).join('')}
            </select>
          </label>
          <label class="tool-input-label">플레이
            <select id="bankrollVenueType">
              ${['Live','Online'].map(value=>`<option ${existing?.venueType===value?'selected':''}>${value}</option>`).join('')}
            </select>
          </label>
        </div>
        <label class="tool-input-label">손익 (₩)<input id="bankrollResult" type="number" inputmode="numeric" step="1000" value="${escapeHtml(result)}" placeholder="예: 320000 또는 -85000"></label>
        <label class="tool-input-label">플레이 시간 (선택)<input id="bankrollDuration" type="number" inputmode="decimal" min="0" step="0.5" value="${escapeHtml(duration)}" placeholder="예: 4.5"></label>
        <label class="tool-input-label">메모 (선택)<input id="bankrollNote" maxlength="80" value="${escapeHtml(existing?.note||'')}" placeholder="예: HPT Day 1, 강남 캐시"></label>
      </div>
      <div class="bankroll-modal-actions">
        ${existing?'<button class="bankroll-delete-btn" data-delete-bankroll-session>삭제</button>':''}
        <button class="btn full bankroll-save-btn" data-save-bankroll-session>${existing?'수정 저장':'세션 저장'}</button>
      </div>
    </div>
  </div>`;
}

function bankrollBaseModal(){
  const data=loadBankrollData();
  return `<div class="modal-backdrop" data-close-modal>
    <div class="sheet bankroll-sheet bankroll-base-sheet" onclick="event.stopPropagation()">
      <div class="grab"></div>
      <div class="sheet-title">시작 Bankroll</div>
      <p class="bankroll-sheet-copy">현재 Bankroll은 시작 금액에 모든 세션 손익을 더해 계산합니다.</p>
      <label class="tool-input-label">시작 금액 (₩)<input id="bankrollStartingAmount" type="number" inputmode="numeric" min="0" step="1000" value="${escapeHtml(data.startingBankroll)}" placeholder="예: 3000000"></label>
      <button class="btn full bankroll-save-btn" data-save-bankroll-base>저장</button>
    </div>
  </div>`;
}

function calculatePokerOdds(potSize,callAmount,outs){
  const potRaw=String(potSize??'').trim();
  const callRaw=String(callAmount??'').trim();
  const outsRaw=String(outs??'').trim();
  const pot=Number(potRaw),call=Number(callRaw),outCount=Number(outsRaw);

  const potValid=potRaw!==''&&callRaw!==''&&Number.isFinite(pot)&&Number.isFinite(call)&&pot>=0&&call>=0&&(pot+call)>0;
  const outsValid=outsRaw!==''&&Number.isFinite(outCount)&&Number.isInteger(outCount)&&outCount>=0&&outCount<=47;

  const potResult=potValid?{
    ratio:call===0?Infinity:pot/call,
    requiredEquity:(call/(pot+call))*100
  }:null;

  let outsResult=null;
  if(outsValid){
    const turn=(outCount/47)*100;
    const missTurn=(47-outCount)/47;
    const missRiver=Math.max(0,46-outCount)/46;
    const river=(1-(missTurn*missRiver))*100;
    outsResult={
      turn:Math.min(100,Math.max(0,turn)),
      river:Math.min(100,Math.max(0,river))
    };
  }

  return {pot:potResult,outs:outsResult};
}

function formatPotOddsRatio(value){
  return Number.isFinite(value)?value.toFixed(2)+' : 1':'∞ : 1';
}

function oddsToolView(){
  return `<section class="tools-screen tool-detail">
    <div class="tool-intro"><span>%</span><div><b>Poker Odds Calculator</b><small>Pot Odds · Required Equity · Outs</small></div></div>
    <div class="tool-panel">
      ${toolSectionTitle('Pot Odds')}
      <div class="tool-form-row">
        <label class="tool-input-label">Pot Size<input id="oddsPotSize" type="number" inputmode="decimal" min="0" step="any" placeholder="예: 12000"></label>
        <label class="tool-input-label">Call Amount<input id="oddsCallAmount" type="number" inputmode="decimal" min="0" step="any" placeholder="예: 4000"></label>
      </div>
      <div class="tool-result-grid">
        <div><small>Pot Odds</small><b id="oddsPotOdds">--</b></div>
        <div><small>Required Equity</small><b id="oddsRequiredEquity">--%</b></div>
      </div>
      <div class="range-placeholder-note">Pot Size는 콜하기 직전 현재 팟 기준</div>
    </div>
    <div class="tool-panel">
      ${toolSectionTitle('Outs')}
      <label class="tool-input-label">Outs<input id="oddsOuts" type="number" inputmode="numeric" min="0" max="47" step="1" placeholder="예: 9"></label>
      <div class="tool-result-grid">
        <div><small>Turn 완성</small><b id="oddsTurnChance">--%</b></div>
        <div><small>River까지</small><b id="oddsRiverChance">--%</b></div>
      </div>
      <div class="range-placeholder-note">플랍 기준 정확 확률 · Turn 47장, River 46장 미지 카드 기준</div>
    </div>
  </section>`;
}
function rangeCellClass(action){
  return action==='primary'?'strong':action==='mix'?'mix':'fold';
}
function rangeCellMarkup(cell){
  const freq=cell.action==='fold'?0:cell.frequency;
  return `<button class="range-cell ${rangeCellClass(cell.action)}" data-range-hand="${cell.label}" title="${cell.label} · ${freq}%">${cell.label}</button>`;
}
function rangeSelectOptions(items,selected,formatter){
  return items.map(item=>{
    const value=String(item),label=formatter?formatter(item):value;
    return `<option value="${value}" ${String(selected)===value?'selected':''}>${label}</option>`;
  }).join('');
}
function rangeToolView(){
  const api=window.PREFLOP_RANGE_DATA;
  if(!api){
    return `<section class="tools-screen tool-detail range-tool">
      <div class="tool-intro"><span>13×13</span><div><b>Preflop Range Charts</b><small>상황별 프리플랍 레인지 조회</small></div></div>
      <div class="tool-panel"><div class="range-placeholder-note">Range 데이터를 불러오지 못했어요.</div></div>
    </section>`;
  }

  const chart=api.getChart({format:'MTT',players:8,stack:40,position:'BTN',situation:'RFI'});
  const options=api.getOptions(chart.filters);
  const f=chart.filters;

  return `<section class="tools-screen tool-detail range-tool">
    <div class="tool-intro"><span>13×13</span><div><b>Preflop Range Charts</b><small>상황별 프리플랍 레인지 조회</small></div></div>
    <div class="tool-panel range-filters">
      ${toolSectionTitle('조건')}
      <div class="range-filter-grid">
        <label class="tool-input-label">Format<select id="rangeFormat">${rangeSelectOptions(options.formats,f.format)}</select></label>
        <label class="tool-input-label">Players<select id="rangePlayers">${rangeSelectOptions(options.players,f.players,x=>x+'-Max')}</select></label>
        <label class="tool-input-label">Stack<select id="rangeStack">${rangeSelectOptions(options.stacks,f.stack,x=>x+'BB')}</select></label>
        <label class="tool-input-label">Position<select id="rangePosition">${rangeSelectOptions(options.positions,f.position)}</select></label>
      </div>
      <label class="tool-input-label">Situation<select id="rangeSituation">${rangeSelectOptions(options.situations,f.situation)}</select></label>
    </div>
    <div class="tool-panel range-matrix-panel">
      <div class="range-chart-meta">
        <span id="rangeContext">${f.format} · ${f.players}-Max · ${f.stack}BB · ${f.position} · ${f.situation}</span>
        <b id="rangeCoverage">${chart.stats.matrixCoverage}%</b>
      </div>
      <div class="range-legend">
        <span class="strong" id="rangeLegendPrimary">${chart.labels.primary}</span>
        <span class="mix" id="rangeLegendMix">${chart.labels.mix}</span>
        <span class="fold" id="rangeLegendFold">${chart.labels.fold}</span>
      </div>
      <div class="range-matrix" id="rangeMatrix">${chart.cells.map(rangeCellMarkup).join('')}</div>
      <div class="range-placeholder-note" id="rangeSourceNote">${chart.source} · ${chart.note}</div>
    </div>
  </section>`;
}

function normalizeIcmDraft(draft){
  const requested=Number(draft?.playerCount||5);
  const playerCount=Math.min(9,Math.max(2,Number.isFinite(requested)?Math.round(requested):5));
  const stacks=Array.from({length:playerCount},(_,index)=>String(draft?.stacks?.[index]??''));
  const payouts=Array.from({length:playerCount},(_,index)=>String(draft?.payouts?.[index]??''));
  return {playerCount,stacks,payouts};
}

function ensureIcmDraft(){
  const draft=normalizeIcmDraft(state.icmDraft);
  state.icmDraft=draft;
  return draft;
}

function formatIcmNumber(value){
  const number=Number(value)||0;
  return Math.round(number).toLocaleString('ko-KR');
}

function formatIcmMoney(value){
  return '₩'+formatIcmNumber(value);
}

function icmResultMarkup(result){
  if(!result?.ok)return '';
  return `<div class="icm-result-summary">
      <div><small>TOTAL PRIZE</small><b>${formatIcmMoney(result.totalPayout)}</b></div>
      <div><small>MODEL</small><b>Exact ICM</b></div>
    </div>
    <div class="icm-result-list">
      ${result.players.map((player,index)=>`<div class="icm-result-row">
        <div class="icm-result-player">
          <b>${index===0?'Hero':'Player '+(index+1)}</b>
          <small>Stack ${formatIcmNumber(player.stack)} · Chips ${player.chipShare.toFixed(1)}%</small>
        </div>
        <div class="icm-result-value">
          <b>${formatIcmMoney(player.icmValue)}</b>
          <small>${player.prizePoolShare.toFixed(2)}% of prize pool</small>
        </div>
      </div>`).join('')}
    </div>
    <div class="icm-result-check">ICM Value 합계 ${formatIcmMoney(result.calculatedPayout)} · 총상금과 일치</div>`;
}

function icmToolView(){
  const draft=ensureIcmDraft();
  return `<section class="tools-screen tool-detail icm-tool">
    <div class="tool-intro"><span>ICM</span><div><b>ICM Calculator</b><small>Exact Independent Chip Model</small></div></div>

    <div class="tool-panel">
      ${toolSectionTitle('Players & Stacks','2–9 Players')}
      <label class="tool-input-label">남은 플레이어 수
        <select id="icmPlayerCount">
          ${Array.from({length:8},(_,index)=>index+2).map(count=>`<option value="${count}" ${draft.playerCount===count?'selected':''}>${count} Players</option>`).join('')}
        </select>
      </label>
      <div class="icm-stack-list" id="icmStackList">
        ${draft.stacks.map((value,index)=>`<label class="icm-row">
          <span>${index===0?'Hero':'Player '+(index+1)}</span>
          <input type="text" inputmode="numeric" data-icm-stack-index="${index}" value="${escapeHtml(value)}" placeholder="예: ${index===0?'420000':'250000'}">
        </label>`).join('')}
      </div>
    </div>

    <div class="tool-panel">
      ${toolSectionTitle('Payouts','미지급 순위는 0 또는 빈칸')}
      <div class="icm-payout-list" id="icmPayoutList">
        ${draft.payouts.map((value,index)=>`<label class="icm-payout-row">
          <span>${index+1}위</span>
          <div><i>₩</i><input type="text" inputmode="numeric" data-icm-payout-index="${index}" value="${escapeHtml(value)}" placeholder="${index<3?['5000000','3000000','2000000'][index]:'0'}"></div>
        </label>`).join('')}
      </div>
      <div class="range-placeholder-note">상금은 높은 순위부터 같거나 작아야 합니다.</div>
    </div>

    <div class="tool-panel">
      ${toolSectionTitle('ICM Result','각 플레이어 기대 상금')}
      <button class="btn full icm-calc-btn" data-calculate-icm>ICM 계산</button>
      <div class="icm-result-shell" id="icmResultShell">
        <div class="icm-empty-result">
          <b>스택과 상금을 입력해 주세요.</b>
          <span>각 순위 도달 확률을 계산해 플레이어별 ICM Value를 표시합니다.</span>
        </div>
      </div>
    </div>

    <div class="tool-panel icm-future-panel">
      <div class="icm-future-slot">
        <div><b>Decision Model</b><small>Hero Decision · Push / Fold</small></div>
        <span>후속 확장</span>
      </div>
      <p>기본 ICM 엔진과 입력 구조를 분리해 두어 이후 액션 EV와 Push/Fold 모델을 연결할 수 있습니다.</p>
    </div>
  </section>`;
}
