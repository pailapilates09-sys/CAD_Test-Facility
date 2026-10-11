/** All geometry is in inches. Converted once from the supplied plywood dimensions. */
const inch = value => value / 25.4;
export const colors = { A: '#70b9e9', B: '#3bcbc2', studs: '#efb043', collars: '#d95853', braces: '#22956c', base: '#8568bd', nails: '#172938', joints: '#aa431f', core: '#dce3e8' };
export const spec = Object.freeze({
  id: 'column-formwork-16', revision: 'W01', units: 'in', status: 'PRELIMINARY',
  clear: 16, height: 96, ply: inch(12), sheet: { width: 48, height: 96 },
  timber: { width: 2, depth: 3 }, kerf: inch(3),
  panels: [ { id: 'A', qty: 2, width: 16, centres: [1, 8, 15] }, { id: 'B', qty: 2, width: inch(430.4), centres: [1, inch(215.2), inch(405)] } ],
  collarDatums: [3, 15, 27, 39, 51, 63, 75, 87, 93], railLength: 30,
  nailPositions: [...Array.from({length: 16}, (_,i) => inch(50 + i * 150)), 96 - inch(50)],
  nailLength: inch(50), nailPitch: inch(150), nailEndOffset: inch(50),
  braceHeadHeight: 75, braceHeadOffset: inch(342.2), braceFootOffset: inch(1900), blockLength: inch(250),
  drive: {
    root: 'https://drive.google.com/drive/folders/1BVsrqqG5I_1XA_9YaZOnBHVfoaext6lU',
    product: 'https://drive.google.com/drive/folders/1F_Fb3o_ODn8-RUTY3-s8CXx_bwianVt3',
    drawings: 'https://drive.google.com/drive/folders/1NLG6wdnuT88crenF2SxSYo7sQ5CmWuZU',
    releases: 'https://drive.google.com/drive/folders/1_kngq75CEOJGsmkb9XxfP-CEF3Dxagir',
    pdf: 'https://drive.google.com/file/d/19bpxMTrn7LIdq2N5oV8oxMLoZ3jQ34Hn/view?usp=drivesdk'
  }
});
export const braceLength = Math.hypot(spec.braceFootOffset - spec.braceHeadOffset, spec.braceHeadHeight);
export const fmt = (n, precision = 3) => Number(n.toFixed(precision)).toString();
export const materials = [
  {id:'P1',name:'Plywood stock sheets',qty:2,size:'96 x 48 x '+fmt(spec.ply,4)+' in',stock:'2 sheets',note:'Each sheet supplies one A and one B panel.'},
  {id:'P2',name:'A plywood panels',qty:2,size:'16 x 96 x '+fmt(spec.ply,4)+' in',stock:'Cut from P1',note:'Narrow faces, opposite each other.'},
  {id:'P3',name:'B plywood panels',qty:2,size:fmt(spec.panels[1].width)+' x 96 x '+fmt(spec.ply,4)+' in',stock:'Cut from P1',note:'Covers the two cut ends of A.'},
  {id:'S1',name:'Vertical battens',qty:12,size:'96 in long; 2 x 3 in section',stock:'12 timbers, each 96 in',note:'Three battens per panel. Actual timber size assumed.'},
  {id:'Y1',name:'Collar rails',qty:36,size:'30 in long; 2 x 3 in section',stock:'12 timbers, each 96 in',note:'Nine collars, four rails each. Joint design pending.'},
  {id:'R1',name:'Diagonal braces',qty:4,size:fmt(braceLength)+' in long; 2 x 3 in section',stock:'4 timbers, each 120 in',note:'Geometric length, before final joint allowances.'},
  {id:'L1',name:'Base-stop blocks',qty:8,size:fmt(spec.blockLength)+' in long; 2 x 3 in section',stock:'Offcuts from R1 stock',note:'Two stacked blocks per face. Positive anchorage required.'},
  {id:'N1',name:'Ply-retaining nails',qty:204,size:fmt(spec.nailLength)+' in long, as drawn',stock:'204 installed; allow procurement spare',note:'51 per face. Structural collar/brace fixings excluded.'}
];
export const sources = [
  ['Three.js','https://github.com/mrdoob/three.js','MIT','Used here','Rotatable 3D scenes, picking, cameras and geometry. Our viewer uses pinned r180, served with the site.'],
  ['SVG.js','https://github.com/svgdotjs/svg.js','MIT','Reviewed','Convenient SVG creation and animation. These five shop drawings use native SVG directly.'],
  ['Maker.js','https://github.com/microsoft/maker.js','Apache-2.0','Future option','Parametric 2D linework and SVG/DXF/PDF export; useful for fabrication drawings.'],
  ['JSCAD','https://github.com/jscad/OpenJSCAD.org','MIT','Future option','Parametric 2D and 3D geometry in JavaScript; useful when products need solid modelling.'],
  ['Replicad','https://github.com/sgenoud/replicad','MIT','Future option','Code-based CAD on OpenCascade; useful for shaped parts and STEP workflows.'],
  ['OpenCascade.js','https://github.com/donalffons/opencascade.js','LGPL-2.1','Future option','CAD kernel in JavaScript/WebAssembly for solid geometry; more complex than this box assembly needs.'],
  ['Babylon.js','https://github.com/BabylonJS/Babylon.js','Apache-2.0','Alternative','A 3D rendering engine for richer scenes. An alternative to Three.js for future products.'],
  ['Konva','https://github.com/konvajs/konva','MIT','Future option','Interactive 2D canvas objects, dragging and selection; useful for a drawing editor.'],
  ['Fabric.js','https://github.com/fabricjs/fabric.js','MIT','Future option','Canvas editing and SVG interchange; useful for user annotations and layouts.'],
  ['D3','https://github.com/d3/d3','ISC','Future option','Data-driven SVG, HTML and Canvas graphics; useful for material and quantity charts.']
].map(([name,url,license,use,description],i)=>({rank:i+1,name,url,license,use,description,reviewed:'2026-10-10'}));
