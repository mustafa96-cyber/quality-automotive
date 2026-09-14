import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
const canvas=document.getElementById('gl');
if(canvas){
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const heroEl=document.getElementById('top'), stageA=document.getElementById('stageA'), stageB=document.getElementById('stageB'), badge=document.getElementById('badge3d'), hprog=document.getElementById('hprog'), grab=document.querySelector('.grab');
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x);};
function narrow(){return matchMedia('(max-width:940px)').matches;}
function isNight(){return document.documentElement.getAttribute('data-theme')==='night';}
function progress(){const r=heroEl.getBoundingClientRect();const total=r.height-innerHeight;if(total<=0)return 0;return Math.min(1,Math.max(0,-r.top/total));}
let renderer,scene,camera,wheel,raf;
try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
  scene=new THREE.Scene();
  const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),0.04).texture;
  camera=new THREE.PerspectiveCamera(36,1,0.1,100);camera.position.set(0,0.15,8);
  wheel=new THREE.Group();
  const steel=new THREE.MeshStandardMaterial({color:0xd3d7dd,metalness:1,roughness:0.24});
  const darkSteel=new THREE.MeshStandardMaterial({color:0x2a2f3a,metalness:.85,roughness:.45});
  const rubber=new THREE.MeshStandardMaterial({color:0x0b0c10,metalness:.1,roughness:.88});
  const caliperMat=new THREE.MeshStandardMaterial({color:0x1f4e8c,metalness:.5,roughness:.3,emissive:0x0a1b33,emissiveIntensity:.5});
  const rotorMat=new THREE.MeshStandardMaterial({color:0x3a3f49,metalness:.95,roughness:.3});
  const tireG=new THREE.Group();
  tireG.add(new THREE.Mesh(new THREE.TorusGeometry(2.15,0.55,32,90),rubber));
  const barrel=new THREE.Mesh(new THREE.CylinderGeometry(2.02,2.02,0.72,80,1,true),darkSteel);barrel.rotation.x=Math.PI/2;tireG.add(barrel);
  const alloyG=new THREE.Group();
  const face=new THREE.Mesh(new THREE.CircleGeometry(2.02,80),steel);face.position.z=0.35;alloyG.add(face);
  const lip=new THREE.Mesh(new THREE.TorusGeometry(2.02,0.1,22,90),steel);lip.position.z=0.35;alloyG.add(lip);
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.44,0.52,0.5,44),steel);hub.rotation.x=Math.PI/2;hub.position.z=0.44;alloyG.add(hub);
  const cap=new THREE.Mesh(new THREE.CircleGeometry(0.44,44),caliperMat);cap.position.z=0.69;alloyG.add(cap);
  const spokeGeo=new THREE.BoxGeometry(0.3,1.55,0.17);
  for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2;
    for(const off of [-0.17,0.17]){const s=new THREE.Mesh(spokeGeo,steel);
      s.position.set(Math.cos(a)*0.92+Math.cos(a+Math.PI/2)*off,Math.sin(a)*0.92+Math.sin(a+Math.PI/2)*off,0.33);
      s.rotation.z=a-Math.PI/2;alloyG.add(s);}
    const bolt=new THREE.Mesh(new THREE.CylinderGeometry(0.075,0.075,0.15,10),darkSteel);bolt.rotation.x=Math.PI/2;bolt.position.set(Math.cos(a)*0.64,Math.sin(a)*0.64,0.62);alloyG.add(bolt);}
  const rotorG=new THREE.Group();
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(1.58,1.58,0.12,64),rotorMat);disc.rotation.x=Math.PI/2;rotorG.add(disc);
  for(let i=0;i<16;i++){const a=(i/16)*Math.PI*2;const h=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,0.14,10),rubber);h.rotation.x=Math.PI/2;h.position.set(Math.cos(a)*1.25,Math.sin(a)*1.25,0);rotorG.add(h);}
  rotorG.position.z=-0.06;
  const caliper=new THREE.Mesh(new THREE.BoxGeometry(0.55,1.25,0.5),caliperMat);caliper.position.set(-1.42,0.25,0.02);
  const capBaseX=-1.42,capBaseZ=0.02;
  wheel.add(tireG,alloyG,rotorG,caliper);
  wheel.rotation.x=-0.2;wheel.rotation.y=0.55;scene.add(wheel);
  const shadowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const rg=g.createRadialGradient(64,64,4,64,64,64);rg.addColorStop(0,'rgba(10,15,25,.5)');rg.addColorStop(1,'rgba(10,15,25,0)');g.fillStyle=rg;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);})();
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(7,2.6),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,opacity:.65,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.set(0,-2.6,0);scene.add(shadow);
  const key=new THREE.SpotLight(0xffffff,150,40,0.6,0.5);key.position.set(6,8,9);scene.add(key);
  const rim=new THREE.SpotLight(0x2f6bd0,110,40,0.7,0.6);rim.position.set(-8,-2,5);scene.add(rim);
  const fill=new THREE.PointLight(0xc94b2e,26,50);fill.position.set(-4,5,-6);scene.add(fill);
  scene.add(new THREE.AmbientLight(0x404652,1.0));
  const PC=120,pg=new THREE.BufferGeometry(),parr=new Float32Array(PC*3);
  for(let i=0;i<PC;i++){parr[i*3]=(Math.random()-0.5)*16;parr[i*3+1]=(Math.random()-0.5)*10;parr[i*3+2]=(Math.random()-0.5)*7-1;}
  pg.setAttribute('position',new THREE.BufferAttribute(parr,3));
  const pmat=new THREE.PointsMaterial({color:0x6f9ad6,size:0.03,transparent:true,opacity:.4,depthWrite:false});
  const points=new THREE.Points(pg,pmat);scene.add(points);
  window.__setSceneTheme=(night)=>{renderer.toneMappingExposure=night?1.15:1.02;if(rim)rim.intensity=night?120:95;pmat.opacity=night?.55:.35;};
  window.__setSceneTheme(isNight());
  function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
  resize();addEventListener('resize',resize);
  let mx=0,my=0,tx=0,ty=0,t=0,dragAz=0,dragVel=0,dragging=false,lastX=0,didDrag=false;
  addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-0.5);my=(e.clientY/innerHeight-0.5);},{passive:true});
  canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;dragVel=0;try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
  addEventListener('pointerup',()=>{dragging=false;});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX;lastX=e.clientX;dragVel=dx*0.006;dragAz+=dragVel;if(Math.abs(dx)>2&&!didDrag){didDrag=true;if(grab)grab.style.opacity='0';}});
  function loop(){raf=requestAnimationFrame(loop);t+=0.016;
    const p=progress();const e=ss(0.08,0.62,p);const nw=narrow();
    alloyG.position.z=0.95*e;tireG.position.z=-0.28*e;rotorG.position.z=-0.06-1.15*e;
    caliper.position.x=capBaseX-0.9*e;caliper.position.z=capBaseZ-0.55*e;
    if(!dragging){dragVel*=0.92;dragAz+=dragVel;}
    tx+=(mx*0.45-tx)*0.05;ty+=(my*0.32-ty)*0.05;
    if(!reduce&&!dragging) wheel.rotation.z-=0.004*(1-e*0.8);
    wheel.rotation.y=0.55+tx+dragAz+p*Math.PI*0.4;wheel.rotation.x=-0.2-ty;
    const baseX=nw?0:2.4;wheel.position.x=baseX-(nw?0:1.3)*e;
    wheel.position.y=Math.sin(t*0.6)*0.06;wheel.scale.setScalar((nw?0.82:1)*(1-0.06*e));
    shadow.position.x=wheel.position.x;shadow.material.opacity=(nw?.5:.65)*(1-0.4*e);
    camera.position.z=8-0.7*e;camera.position.y=0.15+0.25*e;
    if(!reduce){points.rotation.y+=0.0008;points.rotation.z+=0.0004;}
    const aOp=1-ss(0.05,0.26,p);
    if(stageA){stageA.style.opacity=aOp;stageA.style.transform='translateY('+(-24*ss(0.05,0.3,p))+'px)';stageA.style.pointerEvents=aOp<0.15?'none':'auto';}
    if(badge)badge.style.opacity=aOp;
    if(stageB){stageB.style.opacity=ss(0.34,0.52,p)*(1-ss(0.92,1,p));stageB.style.transform='translateY(calc(-50% + '+(22*(1-ss(0.34,0.52,p)))+'px))';}
    if(hprog)hprog.style.width=(p*100).toFixed(1)+'%';
    renderer.render(scene,camera);}
  loop();
}catch(err){console.warn('WebGL hero fallback',err);canvas.style.display='none';var fb=document.querySelector('.hero-fb');if(fb)fb.style.display='block';}
}
