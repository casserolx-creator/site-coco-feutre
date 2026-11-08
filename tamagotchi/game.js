(() => {
  'use strict';
  const atlas=window.CocoArt, ns='http://www.w3.org/2000/svg';
  function setArt(element,name) {
    const rect=atlas[name]; if(!rect) throw new Error('Illustration absente : '+name);
    let svg=element.querySelector('svg');
    if(!svg){svg=document.createElementNS(ns,'svg');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');const image=document.createElementNS(ns,'image');image.setAttribute('href','assets/coco-feutre-sheet.png');image.setAttribute('width','1536');image.setAttribute('height','1024');svg.append(image);element.append(svg);}
    svg.setAttribute('viewBox',rect.join(' '));svg.setAttribute('preserveAspectRatio',element.classList.contains('farm')?'xMidYMid slice':'xMidYMax meet');element.dataset.art=name;
  }
  document.querySelectorAll('[data-art]').forEach(element=>setArt(element,element.dataset.art));
  const screen=document.querySelector('.screen'),cat=document.querySelector('#cat'),friend=document.querySelector('.friend'),speech=document.querySelector('#speech'),mood=document.querySelector('#mood'),effect=document.querySelector('#effect-text'),soundButton=document.querySelector('#sound');
  let browserStorage;try{browserStorage=window.localStorage;}catch{browserStorage={getItem(){throw new Error('Stockage bloqué');},setItem(){throw new Error('Stockage bloqué');}};}
  const progress=window.CocoProgress.open(browserStorage);
  let timers=[],soundEnabled=progress.state.sound,sequence=0;
  const sounds=new window.CocoSounds();sounds.enabled=soundEnabled;
  const souvenirs=[['jump','🐾','Sauter'],['eat','🍽️','Manger'],['play','⚽','Jouer avec Pinouille'],['sleep','🌙','Faire dodo'],['wave','👋','Faire coucou'],['drink','💧','Boire'],['toilet','🚽','Petit Coin Bidou']];
  function renderProgress(){const state=progress.state,found=souvenirs.filter(([key])=>state.counts[key]>0).length;document.querySelector('#progress-count').textContent=`${found} / 7 petits bonheurs découverts`;document.querySelector('#progress-icons').innerHTML=souvenirs.map(([key,icon,label])=>`<span class="souvenir${state.counts[key]>0?' discovered':''}" role="img" aria-label="${label} : ${state.counts[key]>0?'découvert':'à découvrir'}" title="${label} · ${state.counts[key]} fois">${icon}</span>`).join('');document.querySelector('#save-note').textContent=progress.available?'Vos petits bonheurs sont gardés sur cet appareil.':'Le navigateur ne permet pas la sauvegarde locale.';}
  const actions={
    jump:{duration:2500,pose:'ready',mood:'✦ Petit bond',lines:['Hop ! Et re-hop !','Un bond de Gros Matou !','Youpi, les petites pattes !'],end:'Atterrissage tout doux.'},
    eat:{duration:3500,pose:'eat',mood:'✿ Pause gourmande',lines:['Miam, les croquettes !','Croc, croc… délicieux !','Une petite bouchée de bonheur.'],end:'Mmmh… petit ventre content.'},
    play:{duration:5000,pose:'play',mood:'♡ Avec Pinouille',lines:['Pinouille vient jouer !','À deux, le ballon roule mieux !','Attrape le ballon, Pinouille !'],end:'À bientôt, petit copain !'},
    sleep:{duration:0,pose:'sleep',mood:'☾ Petite sieste',lines:['Chut… ronron, ronron…','Bien au chaud, les petits yeux se ferment.','Une sieste toute douce…'],effect:'Z z z'},
    wave:{duration:2900,pose:'wave',mood:'♡ Un petit coucou',lines:['Miaou ! Coucou, quel plaisir !','Une petite patte et un miaou !','Gros Matou fait coucou !'],end:'Heureux de vous retrouver !',effect:'♡'},
    drink:{duration:3500,pose:'drink',mood:'◡ Pause fraîcheur',lines:['Lap, lap… de la bonne eau !','Un petit bol bien frais !','Quelques petites gorgées…'],end:'Voilà qui fait du bien !'},
    toilet:{duration:4200,pose:'front',mood:'✦ Petit Coin Bidou',lines:['Un instant… petit coin bidou !','Le petit paravent, et hop !','Une petite pause en toute tranquillité.'],end:'Plouf ! Et voilà, tout content !'}
  };
  function later(fn,ms){timers.push(setTimeout(fn,ms));}
  function cancel(){sounds.stop();timers.forEach(clearTimeout);timers=[];document.querySelectorAll('.pressed').forEach(b=>b.classList.remove('pressed'));}
  function idle(text='Un petit coucou à Gros Matou ?'){
    screen.dataset.state='idle';setArt(cat,'front');mood.textContent='✿ Tout tranquille';speech.textContent=text;screen.setAttribute('aria-label','Gros Matou se repose dans la cour de la Ferme Foin-Foin');
    later(()=>setArt(cat,'right'),6500);later(()=>setArt(cat,'left'),9500);later(()=>setArt(cat,'front'),12500);
  }
  function updateSound(){soundButton.setAttribute('aria-pressed',String(soundEnabled));soundButton.querySelector('.sound-label').textContent=soundEnabled?'SON ON':'SON OFF';progress.setSound(soundEnabled);renderProgress();soundButton.setAttribute('aria-label',soundEnabled?'Couper le son':'Activer le son');}
  function act(name,{record=true,quiet=false}={}){const action=actions[name];if(!action)return;cancel();if(record){progress.record(name);renderProgress();}sequence++;screen.removeAttribute('data-state');void screen.offsetWidth;setArt(cat,action.pose);setArt(friend,name==='play'?'pinouille-play':'pinouille');screen.dataset.state=name;mood.textContent=action.mood;speech.textContent=action.lines[(sequence-1)%action.lines.length];screen.setAttribute('aria-label',speech.textContent);effect.textContent=action.effect||'✦';if(soundEnabled&&!quiet)sounds.play(name).then(ok=>{if(ok===false&&soundEnabled){soundEnabled=false;updateSound();}});const button=document.querySelector(`[data-action="${name}"]`);button.classList.add('pressed');later(()=>button.classList.remove('pressed'),160);
    if(name==='jump'){later(()=>setArt(cat,'jump'),590);later(()=>setArt(cat,'ready'),1870);}
    if(name==='play'){later(()=>setArt(friend,'pinouille'),3500);}
    if(action.duration)later(()=>idle(action.end),action.duration);
  }
  document.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>act(button.dataset.action)));
  const keys={a:'jump',b:'eat',x:'play',y:'sleep',l:'wave',r:'drink',' ':'toilet'};
  document.addEventListener('keydown',event=>{if(event.repeat||event.ctrlKey||event.altKey||event.metaKey||event.target.isContentEditable||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;if(event.key==='Enter')return;if(event.key===' '&&event.target.closest('button,a')&&!event.target.closest('[data-action]'))return;const action=keys[event.key.toLowerCase()];if(action){event.preventDefault();act(action);}});
  soundButton.addEventListener('click',async()=>{soundEnabled=!soundEnabled;const wanted=soundEnabled;updateSound();const enabled=await sounds.enable(wanted);if(wanted&&soundEnabled){if(!enabled){soundEnabled=false;updateSound();return;}const ok=await sounds.play('hello');if(ok===false){soundEnabled=false;updateSound();}}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancel();sounds.suspend();}else{if(screen.dataset.state!=='sleep')idle('Coucou, Gros Matou est toujours là !');if(soundEnabled)sounds.enable(true);}});
  window.addEventListener('pagehide',cancel);updateSound();renderProgress();if(progress.state.sleeping)act('sleep',{record:false,quiet:true});else idle(progress.state.lastAction?'Heureux de vous retrouver, les souvenirs sont bien gardés !':undefined);
})();
