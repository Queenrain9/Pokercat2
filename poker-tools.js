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

function equityToolView(){
  return `<section class="tools-screen tool-detail">
    <div class="tool-intro"><span>♠</span><div><b>Equity Calculator</b><small>Hand vs Hand / Range equity</small></div></div>
    <div class="tool-panel">
      ${toolSectionTitle('Hero Hand')}
      <div class="tool-card-slots"><button>A♠</button><button>K♠</button></div>
    </div>
    <div class="tool-panel">
      ${toolSectionTitle('Villain','Hand 또는 Range')}
      <div class="segmented-mini"><button class="active">Hand</button><button>Range</button></div>
      <div class="tool-card-slots"><button>Q♥</button><button>Q♣</button></div>
      <label class="tool-input-label">Range<input placeholder="예: QQ+, AKs, AKo"></label>
    </div>
    <div class="tool-panel">
      ${toolSectionTitle('Board')}
      <div class="tool-card-slots board"><button>J♠</button><button>T♠</button><button>2♦</button><button>＋</button><button>＋</button></div>
    </div>
    <div class="tool-panel">
      ${toolSectionTitle('Equity')}
      <div class="equity-result-shell">
        <div><small>HERO</small><b>--%</b><span>Equity</span></div>
        <div class="equity-vs">VS</div>
        <div><small>VILLAIN</small><b>--%</b><span>Equity</span></div>
      </div>
      ${placeholderCard('Equity 결과')}
    </div>
  </section>`;
}

function bankrollToolView(){
  const sessions=[
    {date:'09.24',game:'MTT · Live',result:'+₩320,000',positive:true},
    {date:'09.21',game:'Cash · Live',result:'-₩85,000',positive:false},
    {date:'09.18',game:'MTT · Online',result:'+₩140,000',positive:true}
  ];
  return `<section class="tools-screen tool-detail">
    <div class="tool-intro"><span>₩</span><div><b>Bankroll Tracker</b><small>Session based bankroll overview</small></div></div>
    <div class="bankroll-hero-card">
      <small>CURRENT BANKROLL</small><b>₩3,420,000</b><span>예시 데이터</span>
    </div>
    <div class="tool-metric-grid">
      <div><small>이번 달 손익</small><b>+₩375,000</b></div>
      <div><small>Session</small><b>12</b></div>
      <div><small>Win Rate</small><b>58%</b></div>
      <div><small>Avg. Session</small><b>4.2h</b></div>
    </div>
    <div class="tool-panel">
      ${toolSectionTitle('최근 Session')}
      <div class="session-list">
        ${sessions.map(s=>`<div class="session-row"><div><b>${s.date}</b><span>${s.game}</span></div><strong class="${s.positive?'positive':'negative'}">${s.result}</strong></div>`).join('')}
      </div>
      <button class="tool-secondary-cta" data-toast="세션 저장 기능은 다음 단계에서 연결됩니다">＋ Session 기록 추가</button>
    </div>
  </section>`;
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

function icmToolView(){
  return `<section class="tools-screen tool-detail">
    <div class="tool-intro"><span>ICM</span><div><b>ICM Calculator</b><small>Tournament chip value & decision</small></div></div>
    <div class="tool-panel">
      ${toolSectionTitle('Players & Stacks')}
      <label class="tool-input-label">남은 플레이어 수<select><option>5 Players</option><option>6 Players</option><option>9 Players</option></select></label>
      <div class="icm-stack-list">
        ${[['Hero','420,000'],['Player 2','310,000'],['Player 3','250,000'],['Player 4','180,000'],['Player 5','90,000']].map(x=>`<div class="icm-row"><span>${x[0]}</span><input value="${x[1]}"></div>`).join('')}
      </div>
    </div>
    <div class="tool-panel">
      ${toolSectionTitle('Payouts')}
      <div class="icm-payout-grid"><input value="₩5,000,000"><input value="₩3,000,000"><input value="₩2,000,000"><input value="₩1,200,000"><input value="₩800,000"></div>
    </div>
    <div class="tool-panel">
      ${toolSectionTitle('Hero Decision')}
      <label class="tool-input-label">상황<textarea placeholder="예: BTN 12BB, folded to Hero, payout jump..."></textarea></label>
    </div>
    <div class="tool-panel">
      ${toolSectionTitle('ICM Result')}
      <div class="tool-result-grid">
        <div><small>ICM Value</small><b>--</b></div>
        <div><small>Push / Fold</small><b>--</b></div>
      </div>
      ${placeholderCard('ICM 결과')}
    </div>
  </section>`;
}
