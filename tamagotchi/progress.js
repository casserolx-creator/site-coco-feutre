/* Une seule clé, réservée à ce jeu ; aucun autre jeu n'est modifié. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CocoProgress=api;})(typeof window!=='undefined'?window:this,()=>{
  'use strict';
  const KEY='coco-feutre:tamagotchi:gros-matou:v1',ACTIONS=['jump','eat','play','sleep','wave','drink','toilet'];
  const fresh=()=>({version:1,counts:Object.fromEntries(ACTIONS.map(a=>[a,0])),sleeping:false,sound:false,lastAction:null});
  function normalize(raw){const state=fresh();if(!raw||typeof raw!=='object'||raw.version!==1)return state;for(const a of ACTIONS){const n=raw.counts?.[a];if(Number.isSafeInteger(n)&&n>=0)state.counts[a]=Math.min(n,999999);}state.sleeping=raw.sleeping===true;state.sound=raw.sound===true;state.lastAction=ACTIONS.includes(raw.lastAction)?raw.lastAction:null;return state;}
  function open(storage){let available=true,state=fresh();try{state=normalize(JSON.parse(storage.getItem(KEY)||'null'));}catch{state=fresh();}try{storage.setItem(KEY,JSON.stringify(state));}catch{available=false;}
    function save(){try{storage.setItem(KEY,JSON.stringify(state));available=true;}catch{available=false;}return available;}
    return {get state(){return JSON.parse(JSON.stringify(state));},get available(){return available;},record(action){if(!ACTIONS.includes(action))return;state.counts[action]=Math.min(state.counts[action]+1,999999);state.sleeping=action==='sleep';state.lastAction=action;save();},setSound(on){state.sound=on===true;save();},awake(){if(state.sleeping){state.sleeping=false;save();}}};
  }
  return {KEY,ACTIONS,normalize,open};
});
