/* Sons originaux synthétisés dans le navigateur, sans fichier ni service externe. */
(() => {
  'use strict';
  class CocoSounds {
    constructor(context=null){this.context=context;this.enabled=false;this.nodes=new Set();this.sources=new Set();this.revision=0;this.output=null;this.noiseBuffer=null;}
    prepare(){
      if(!this.context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('Audio indisponible');this.context=new Audio();}
      if(!this.output){const c=this.context;this.output=c.createGain();this.output.gain.value=.55;const limiter=c.createDynamicsCompressor();limiter.threshold.value=-19;limiter.knee.value=15;limiter.ratio.value=5;limiter.attack.value=.004;limiter.release.value=.12;this.output.connect(limiter);limiter.connect(c.destination);this.noiseBuffer=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const a=this.noiseBuffer.getChannelData(0);let seed=731;for(let i=0;i<a.length;i++){seed=(seed*16807)%2147483647;a[i]=(seed/2147483647)*2-1;}}
    }
    async enable(value){
      this.enabled=!!value;if(!this.enabled){this.stop();return false;}
      try{this.prepare();if(typeof this.context.startRendering!=='function'&&this.context.state!=='running')await this.context.resume();return this.enabled;}catch{this.enabled=false;this.stop();return false;}
    }
    stop(){this.revision++;for(const source of this.sources){try{source.stop();}catch{}}for(const node of this.nodes){try{node.disconnect();}catch{}}this.sources.clear();this.nodes.clear();}
    suspend(){this.stop();if(this.context&&this.context.state==='running'&&typeof this.context.suspend==='function')this.context.suspend().catch(()=>{});}
    group(source,nodes){this.sources.add(source);nodes.forEach(n=>this.nodes.add(n));source.onended=()=>{this.sources.delete(source);for(const n of nodes){try{n.disconnect();}catch{}this.nodes.delete(n);}};}
    curve(param,points,start,scale=1){param.setValueAtTime(points[0][1]*scale,start+points[0][0]);for(let i=1;i<points.length;i++)param.linearRampToValueAtTime(points[i][1]*scale,start+points[i][0]);}
    tone(type,points,duration,level,delay=0,filter=null){
      const c=this.context,t=c.currentTime+.015+delay,source=type==='noise'?c.createBufferSource():c.createOscillator(),gain=c.createGain(),nodes=[source,gain];
      if(type==='noise'){source.buffer=this.noiseBuffer;source.loop=true;}else{source.type=type;this.curve(source.frequency,points,t);}
      let end=source;if(filter){const f=c.createBiquadFilter();f.type=filter.type||'lowpass';f.Q.value=filter.q||.7;this.curve(f.frequency,filter.points||[[0,filter.frequency||1400]],t);source.connect(f);end=f;nodes.push(f);}
      end.connect(gain);gain.connect(this.output);const attack=Math.min(.018,duration*.2);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(level,t+attack);gain.gain.setValueAtTime(level*.72,t+duration*.55);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);source.start(t);source.stop(t+duration+.025);this.group(source,nodes);
    }
    meow(delay=0,small=false){
      const c=this.context,t=c.currentTime+.015+delay,d=small?.48:.88,osc=c.createOscillator(),gain=c.createGain(),low=c.createBiquadFilter(),high=c.createBiquadFilter(),blend=c.createGain(),vibrato=c.createOscillator(),depth=c.createGain();
      osc.type='sawtooth';this.curve(osc.frequency,[[0,440],[d*.18,small?820:710],[d*.46,small?700:640],[d*.8,410],[d,320]],t);low.type='bandpass';low.Q.value=2.2;this.curve(low.frequency,[[0,1350],[d*.2,2200],[d*.65,1450],[d,760]],t);high.type='bandpass';high.Q.value=1.4;this.curve(high.frequency,[[0,3300],[d*.6,2500],[d,1300]],t);blend.gain.value=.28;osc.connect(low);osc.connect(high);low.connect(gain);high.connect(blend);blend.connect(gain);gain.connect(this.output);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.18,t+.035);gain.gain.linearRampToValueAtTime(.15,t+d*.35);gain.gain.exponentialRampToValueAtTime(.0001,t+d);vibrato.frequency.value=6.5;depth.gain.value=11;vibrato.connect(depth);depth.connect(osc.frequency);osc.start(t);osc.stop(t+d+.03);vibrato.start(t);vibrato.stop(t+d+.03);this.group(osc,[osc,gain,low,high,blend]);this.group(vibrato,[vibrato,depth]);
    }
    purr(delay=0,duration=2.2){
      const c=this.context,t=c.currentTime+.015+delay,source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain(),pulse=c.createOscillator(),depth=c.createGain();source.buffer=this.noiseBuffer;source.loop=true;filter.type='lowpass';filter.frequency.value=300;filter.Q.value=.7;source.connect(filter);filter.connect(gain);gain.connect(this.output);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.13,t+.2);gain.gain.setValueAtTime(.1,t+duration-.3);gain.gain.linearRampToValueAtTime(0,t+duration);pulse.frequency.value=25;depth.gain.setValueAtTime(0,t);depth.gain.linearRampToValueAtTime(.075,t+.2);depth.gain.setValueAtTime(.06,t+duration-.3);depth.gain.linearRampToValueAtTime(0,t+duration);pulse.connect(depth);depth.connect(gain.gain);source.start(t);source.stop(t+duration+.03);pulse.start(t);pulse.stop(t+duration+.03);this.group(source,[source,filter,gain]);this.group(pulse,[pulse,depth]);this.tone('triangle',[[0,70],[duration,64]],duration,.055,delay,{frequency:220});
    }
    bubble(delay=0,pitch=600){this.tone('sine',[[0,pitch],[.04,pitch*1.7],[.12,pitch*.55]],.14,.12,delay);}
    async play(name){
      this.stop();const revision=this.revision;if(!this.enabled)return null;
      const available=await this.enable(true);if(revision!==this.revision)return null;if(!available)return false;
      this.tone('sine',[[0,1050],[.035,620]],.045,.045);
      switch(name){
        case 'hello': [523,659,784,1047].forEach((f,i)=>this.tone('sine',[[0,f]],.22,.12,i*.12));this.meow(.57,true);break;
        case 'wave': this.meow(.08);this.meow(1.15,true);break;
        case 'jump': this.tone('triangle',[[0,170],[.13,230],[.42,760],[.63,410]],.66,.12,.38,{frequency:1800});this.meow(.8,true);this.tone('sine',[[0,130],[.12,60]],.16,.14,1.88);break;
        case 'eat': for(let i=0;i<6;i++)this.tone('noise',null,.075,.13,.12+i*.32,{type:'bandpass',frequency:1800,q:.8});this.purr(2,1.15);break;
        case 'drink': for(let i=0;i<7;i++){this.bubble(.12+i*.32,490+(i%3)*110);this.tone('noise',null,.065,.045,.16+i*.32,{type:'bandpass',frequency:2300});}break;
        case 'play': for(let i=0;i<5;i++)this.tone('sine',[[0,280],[.055,120],[.19,80]],.2,.13,.25+i*.85);this.meow(.75,true);[659,784,988].forEach((f,i)=>this.tone('sine',[[0,f]],.13,.06,3.4+i*.13));break;
        case 'sleep': [659,523,392].forEach((f,i)=>this.tone('sine',[[0,f]],.65,.07,i*.28));this.purr(.85,3.6);break;
        case 'toilet': this.tone('triangle',[[0,320],[.22,120]],.27,.09,.15);this.bubble(2.55,240);this.tone('noise',null,.46,.065,2.7,{type:'lowpass',points:[[0,1600],[.46,300]]});[523,659,784].forEach((f,i)=>this.tone('sine',[[0,f]],.16,.08,3.25+i*.12));break;
      }
      return true;
    }
  }
  window.CocoSounds=CocoSounds;
})();
