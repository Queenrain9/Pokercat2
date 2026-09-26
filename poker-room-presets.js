window.POKER_ROOM_GAME_TYPES = [
  {id:'NLH',name:'No-Limit Hold’em',shortName:'NL Hold’em',available:true},
  {id:'PLO',name:'Pot-Limit Omaha',shortName:'PLO',available:false},
  {id:'SHORT_DECK',name:'Short Deck Hold’em',shortName:'Short Deck',available:false}
];

window.POKER_ROOM_BLIND_STRUCTURES = [
  {
    id:'standard-x2',
    name:'Standard',
    levels:[
      {sb:100,bb:200},{sb:150,bb:300},{sb:200,bb:400},{sb:300,bb:600},
      {sb:400,bb:800},{sb:500,bb:1000},{sb:750,bb:1500},{sb:1000,bb:2000}
    ]
  },
  {
    id:'turbo-x2',
    name:'Turbo',
    levels:[
      {sb:100,bb:200},{sb:200,bb:400},{sb:300,bb:600},{sb:500,bb:1000},
      {sb:800,bb:1600},{sb:1200,bb:2400},{sb:2000,bb:4000}
    ]
  }
];

window.POKER_ROOM_PRESETS = [
  {
    id:'pc-casual-6max',
    name:'캐주얼 6-Max',
    description:'친구들과 편하게 시작하는 기본 6맥스',
    settings:{
      gameType:'NLH',maxPlayers:6,startingChips:20000,
      blinds:{smallBlind:100,bigBlind:200},
      ante:{mode:'none',amount:0},
      blindProgression:{mode:'fixed',levelMinutes:null,structureId:null},
      rules:{}
    }
  },
  {
    id:'pc-deep-6max',
    name:'딥스택 6-Max',
    description:'200BB 딥스택 플레이',
    settings:{
      gameType:'NLH',maxPlayers:6,startingChips:40000,
      blinds:{smallBlind:100,bigBlind:200},
      ante:{mode:'none',amount:0},
      blindProgression:{mode:'fixed',levelMinutes:null,structureId:null},
      rules:{}
    }
  },
  {
    id:'pc-turbo-6max',
    name:'터보 6-Max',
    description:'짧은 레벨로 빠르게 진행',
    settings:{
      gameType:'NLH',maxPlayers:6,startingChips:20000,
      blinds:{smallBlind:100,bigBlind:200},
      ante:{mode:'none',amount:0},
      blindProgression:{mode:'auto',levelMinutes:5,structureId:'turbo-x2'},
      rules:{}
    }
  },
  {
    id:'pc-fullring-9max',
    name:'풀링 9-Max',
    description:'9인 풀링 플레이 기본값',
    settings:{
      gameType:'NLH',maxPlayers:9,startingChips:30000,
      blinds:{smallBlind:100,bigBlind:200},
      ante:{mode:'none',amount:0},
      blindProgression:{mode:'fixed',levelMinutes:null,structureId:null},
      rules:{}
    }
  },
  {
    id:'pc-headsup',
    name:'Heads-Up',
    description:'2인 헤즈업 기본값',
    settings:{
      gameType:'NLH',maxPlayers:2,startingChips:20000,
      blinds:{smallBlind:100,bigBlind:200},
      ante:{mode:'none',amount:0},
      blindProgression:{mode:'fixed',levelMinutes:null,structureId:null},
      rules:{}
    }
  }
];
