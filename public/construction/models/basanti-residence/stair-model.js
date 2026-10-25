// One calculated stair definition serves plan, Three.js, sections and takeoff.
export function stairSettingOut(g){
 const counts=g.flight_risers??[Math.ceil(g.riser_count/2),Math.floor(g.riser_count/2)];
 if(counts.reduce((a,b)=>a+b,0)!==g.riser_count||counts.some(n=>n<2))throw Error('Invalid stair flight split');
 const rise=g.height/g.riser_count,landing=g.landing_length??g.flight_width;
 const flights=counts.map((risers,i)=>({risers,goings:risers-1,run:(risers-1)*g.tread,rise:risers*rise,base:i?counts[0]*rise:0,direction:i?-1:1}));
 return {rise,flights,landing,totalRise:g.height,nominalResidual:g.height-g.riser_count*.176,totalRegularGoings:flights.reduce((a,f)=>a+f.goings,0),runWithLanding:flights[0].run+landing,width:g.flight_width*2,release:'PLAN FIT / HEADROOM / FLIGHT SPLIT UNCONFIRMED'};
}
export function stairProfiles(g){
 const s=stairSettingOut(g),xTurn=g.x+s.flights[0].run;
 return s.flights.map((f,i)=>{
  const start=i?xTurn:g.x,top=[[0,0]];
  for(let k=0;k<f.goings;k++)top.push([k*g.tread,(k+1)*s.rise],[(k+1)*g.tread,(k+1)*s.rise]);
  top.push([f.run,f.rise]);
  const waistVertical=g.waist/Math.cos(Math.atan(s.rise/g.tread));
  const profile=[...top,[f.run,f.goings*s.rise-waistVertical],[0,-waistVertical]].map(([x,z])=>[start+f.direction*x,g.z+f.base+z]);
  return {points:profile,y:g.y+i*g.flight_width,width:g.flight_width};
 });
}
export function stairQuantities(g){const s=stairSettingOut(g),area=p=>Math.abs(p.reduce((n,a,i)=>{const b=p[(i+1)%p.length];return n+a[0]*b[1]-a[1]*b[0]},0))/2,flightVolume=stairProfiles(g).reduce((n,p)=>n+area(p.points)*p.width,0),landingVolume=s.landing*g.flight_width*2*g.waist,flightSoffit=s.flights.reduce((n,f)=>n+Math.hypot(f.run,f.goings*s.rise)*g.flight_width,0),landingSoffit=s.landing*g.flight_width*2,riserFaces=g.height*g.flight_width;return {concrete:flightVolume+landingVolume,flightVolume,landingVolume,flightSoffit,landingSoffit,riserFaces,formContact:flightSoffit+landingSoffit+riserFaces,status:'PROVISIONAL MODEL · plan fit, junctions and edge/contact conditions unconfirmed'};}
