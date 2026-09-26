(function(global){
  'use strict';

  const MIN_PLAYERS=2;
  const MAX_PLAYERS=9;

  function parseNumber(value){
    if(typeof value==='number')return value;
    const normalized=String(value??'').replace(/[₩,$\s]/g,'').replace(/,/g,'');
    return normalized===''?NaN:Number(normalized);
  }

  function popcount(value){
    let count=0;
    while(value){
      value&=value-1;
      count++;
    }
    return count;
  }

  function validateInput(stacksInput,payoutsInput){
    const stacks=Array.isArray(stacksInput)?stacksInput.map(parseNumber):[];
    const rawPayouts=Array.isArray(payoutsInput)?payoutsInput.map(value=>{
      const text=String(value??'').trim();
      return text===''?0:parseNumber(value);
    }):[];
    const errors=[];

    if(stacks.length<MIN_PLAYERS||stacks.length>MAX_PLAYERS){
      errors.push('남은 플레이어 수는 2명에서 9명 사이여야 해요.');
    }
    if(stacks.some(stack=>!Number.isFinite(stack)||stack<=0)){
      errors.push('모든 플레이어의 스택을 0보다 큰 숫자로 입력해 주세요.');
    }
    if(rawPayouts.length>stacks.length){
      errors.push('상금 순위 수는 남은 플레이어 수보다 많을 수 없어요.');
    }
    if(rawPayouts.some(payout=>!Number.isFinite(payout)||payout<0)){
      errors.push('상금은 0 이상의 숫자로 입력해 주세요.');
    }

    const payouts=Array.from({length:stacks.length},(_,index)=>rawPayouts[index]??0);
    if(payouts.reduce((sum,payout)=>sum+payout,0)<=0){
      errors.push('최소 한 순위 이상의 상금을 입력해 주세요.');
    }
    for(let index=1;index<payouts.length;index++){
      if(payouts[index]>payouts[index-1]){
        errors.push('상금은 높은 순위부터 같거나 작아지는 구조여야 해요.');
        break;
      }
    }

    return {valid:errors.length===0,errors,stacks,payouts};
  }

  function calculate({stacks:stacksInput,payouts:payoutsInput}={}){
    const normalized=validateInput(stacksInput,payoutsInput);
    if(!normalized.valid)return {ok:false,errors:normalized.errors};

    const stacks=normalized.stacks;
    const payouts=normalized.payouts;
    const playerCount=stacks.length;
    const totalChips=stacks.reduce((sum,stack)=>sum+stack,0);
    const totalPayout=payouts.reduce((sum,payout)=>sum+payout,0);
    const stateCount=1<<playerCount;

    const stateProbability=new Float64Array(stateCount);
    const selectedStackSum=new Float64Array(stateCount);
    const finishProbabilities=Array.from({length:playerCount},()=>new Float64Array(playerCount));
    stateProbability[0]=1;

    for(let mask=1;mask<stateCount;mask++){
      const lowestBit=mask&-mask;
      const playerIndex=Math.log2(lowestBit);
      selectedStackSum[mask]=selectedStackSum[mask^lowestBit]+stacks[playerIndex];
    }

    for(let mask=0;mask<stateCount;mask++){
      const stateChance=stateProbability[mask];
      if(stateChance===0)continue;

      const placeIndex=popcount(mask);
      if(placeIndex>=playerCount)continue;

      const chipsRemaining=totalChips-selectedStackSum[mask];
      if(chipsRemaining<=0)continue;

      for(let playerIndex=0;playerIndex<playerCount;playerIndex++){
        const bit=1<<playerIndex;
        if(mask&bit)continue;

        const nextChance=stateChance*(stacks[playerIndex]/chipsRemaining);
        stateProbability[mask|bit]+=nextChance;
        finishProbabilities[playerIndex][placeIndex]+=nextChance;
      }
    }

    const players=stacks.map((stack,playerIndex)=>{
      const probabilities=Array.from(finishProbabilities[playerIndex]);
      const icmValue=probabilities.reduce((sum,probability,placeIndex)=>{
        return sum+probability*payouts[placeIndex];
      },0);

      return {
        playerIndex,
        stack,
        chipShare:(stack/totalChips)*100,
        icmValue,
        prizePoolShare:totalPayout>0?(icmValue/totalPayout)*100:0,
        finishProbabilities:probabilities
      };
    });

    const calculatedPayout=players.reduce((sum,player)=>sum+player.icmValue,0);
    const conservationError=Math.abs(calculatedPayout-totalPayout);

    return {
      ok:true,
      model:'Independent Chip Model',
      exact:true,
      playerCount,
      stacks:stacks.slice(),
      payouts:payouts.slice(),
      totalChips,
      totalPayout,
      calculatedPayout,
      conservationError,
      players
    };
  }

  global.ICM_CALCULATOR=Object.freeze({
    MIN_PLAYERS,
    MAX_PLAYERS,
    parseNumber,
    validateInput,
    calculate
  });
})(window);
