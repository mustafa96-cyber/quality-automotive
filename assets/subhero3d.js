import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
const canvas=document.getElementById('subgl');
if(canvas){
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const grab=document.querySelector('.subgrab');
function isNight(){return document.documentElement.getAttribute('data-theme')==='night';}
let renderer,scene,camera,wheel,raf;
try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
  scene=new THREE.Scene();
  const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(new RoomEnvironment(),0.04).texture;
  camera=new THREE.PerspectiveCamera(38,1,0.1,100);camera.position.set(0,0.1,8.2);
  wheel=new THREE.Group();
  const steel=new THREE.MeshStandardMaterial({color:0xd3d7dd,metalness:1,roughness:0.24});
  const darkSteel=new THREE.MeshStandardMaterial({color:0x2a2f3a,metalness:.85,roughness:.45});
  const rubber=new THREE.MeshStandardMaterial({color:0x0b0c10,metalness:.1,roughness:.88});
  const caliperMat=new THREE.MeshStandardMaterial({color:0x1f4e8c,metalness:.5,roughness:.3,emissive:0x0a1b33,emissiveIntensity:.5});
  const rotorMat=new THREE.MeshStandardMaterial({color:0x3a3f49,metalness:.95,roughness:.3});
  wheel.add(new THREE.Mesh(new THREE.TorusGeometry(2.15,0.55,28,72),rubber));
  const barrel=new THREE.Mesh(new THREE.CylinderGeometry(2.02,2.02,0.72,64,1,true),darkSteel);barrel.rotation.x=Math.PI/2;wheel.add(barrel);
  const face=new THREE.Mesh(new THREE.CircleGeometry(2.02,64),steel);face.position.z=0.35;wheel.add(face);
  const lip=new THREE.Mesh(new THREE.TorusGeometry(2.02,0.1,18,72),steel);lip.position.z=0.35;wheel.add(lip);
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.44,0.52,0.5,36),steel);hub.rotation.x=Math.PI/2;hub.position.z=0.44;wheel.add(hub);
  const cap=new THREE.Mesh(new THREE.CircleGeometry(0.44,36),caliperMat);cap.position.z=0.69;wheel.add(cap);
  const spokeGeo=new THREE.BoxGeometry(0.3,1.55,0.17);
  for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2;for(const off of [-0.17,0.17]){const s=new THREE.Mesh(spokeGeo,steel);s.position.set(Math.cos(a)*0.92+Math.cos(a+Math.PI/2)*off,Math.sin(a)*0.92+Math.sin(a+Math.PI/2)*off,0.33);s.rotation.z=a-Math.PI/2;wheel.add(s);}
    const bolt=new THREE.Mesh(new THREE.CylinderGeometry(0.075,0.075,0.15,8),darkSteel);bolt.rotation.x=Math.PI/2;bolt.position.set(Math.cos(a)*0.64,Math.sin(a)*0.64,0.62);wheel.add(bolt);}
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(1.58,1.58,0.12,48),rotorMat);disc.rotation.x=Math.PI/2;disc.position.z=-0.06;wheel.add(disc);
  const cal=new THREE.Mesh(new THREE.BoxGeometry(0.55,1.25,0.5),caliperMat);cal.position.set(-1.42,0.25,0.02);wheel.add(cal);
  wheel.rotation.x=-0.24;wheel.rotation.y=0.6;scene.add(wheel);
  const key=new THREE.SpotLight(0xffffff,150,40,0.6,0.5);key.position.set(6,8,9);scene.add(key);
  const rim=new THREE.SpotLight(0x2f6bd0,110,40,0.7,0.6);rim.position.set(-8,-2,5);scene.add(rim);
  scene.add(new THREE.AmbientLight(0x404652,1.0));
  window.__setSceneTheme=(night)=>{renderer.toneMappingExposure=night?1.15:1.02;if(rim)rim.intensity=night?120:95;};
  window.__setSceneTheme(isNight());
  function resize(){const r=canvas.getBoundingClientRect();if(r.width<2){requestAnimationFrame(resize);return;}renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
  resize();addEventListener('resize',resize);
  let mx=0,my=0,tx=0,ty=0,t=0,dragAz=0,dragVel=0,dragging=false,lastX=0,didDrag=false;
  addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-0.5);my=(e.clientY/innerHeight-0.5);},{passive:true});
  canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;dragVel=0;try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
  addEventListener('pointerup',()=>{dragging=false;});
  canvas.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX;lastX=e.clientX;dragVel=dx*0.006;dragAz+=dragVel;if(Math.abs(dx)>2&&!didDrag){didDrag=true;if(grab)grab.style.opacity='0';}});
  function loop(){raf=requestAnimationFrame(loop);t+=0.016;
    if(!dragging){dragVel*=0.92;dragAz+=dragVel;}
    tx+=(mx*0.3-tx)*0.05;ty+=(my*0.25-ty)*0.05;
    if(!reduce&&!dragging)wheel.rotation.z-=0.006;
    wheel.rotation.y=0.6+tx+dragAz;wheel.rotation.x=-0.24-ty;
    wheel.position.y=Math.sin(t*0.6)*0.06;
    renderer.render(scene,camera);}
  loop();
}catch(err){console.warn('subhero WebGL fallback',err);canvas.style.display='none';}
}
