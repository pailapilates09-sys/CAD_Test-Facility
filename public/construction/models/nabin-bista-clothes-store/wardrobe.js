import {priceLabel} from '../saugat-paneru-virtual-store/store-model.js';
import {renderCloseup} from '../saugat-paneru-virtual-store/store-view.js';

export function mountWardrobe(panel,{model,dialog,setGarmentFocus,initiallyOpen}) {
 const get=id=>panel.querySelector('#'+id);
 const toggle=get('wardrobe-toggle'),hotspot=get('wardrobe-hotspot'),actions=get('wardrobe-actions');
 const browse=get('wardrobe-browse'),inspect=get('wardrobe-inspect'),compare=get('wardrobe-compare');
 const lighting=get('wardrobe-light'),comparison=get('wardrobe-comparison'),hint=get('wardrobe-compare-hint');
 const cards=get('wardrobe-comparison-items'),status=get('store-display-note'),progress=get('wardrobe-compare-progress');
 let open=initiallyOpen,state,baseline=null,comparisonKey='';

 function render(){
  const onRack=state?.mode==='shelves';
  panel.dataset.wardrobeOpen=String(open);
  panel.dataset.wardrobeLight=lighting.value;
  toggle.setAttribute('aria-expanded',String(open&&onRack));
  toggle.querySelector('[data-door-label]').textContent=open&&onRack?'Close wardrobe':'Open wardrobe';
  hotspot.setAttribute('aria-expanded',String(open&&onRack));
  toggle.closest('.wardrobe-console').hidden=!onRack;
  actions.hidden=!open||!onRack;
  inspect.disabled=!state?.selected;
  inspect.setAttribute('aria-pressed',String(Boolean(state?.focused)));
  inspect.textContent=state?.focused?'Back to rack':'Inspect garment';
  model?.setWardrobe(open,lighting.value,Boolean(state));
  if(onRack){
   const text=state.focused?'Drag to rotate the garment.':open?'Tap a garment on the rack to inspect it.':'Tap the glass doors to open the wardrobe.';
   if(status.textContent!==text)status.textContent=text;
  }
  renderComparison();
 }

 function renderComparison(){
  compare.setAttribute('aria-expanded',String(Boolean(baseline)));
  compare.textContent=baseline?'End comparison':'Compare garments';
  panel.dataset.wardrobeComparing=String(Boolean(baseline));
  comparison.hidden=!baseline;
  progress.hidden=!baseline;
  if(!baseline)return;
  const selected=state?.product;
  const other=selected?.id===baseline.id?null:selected;
  const key=baseline.id+'|'+(other?.id??'');
  if(comparisonKey===key)return;
  comparisonKey=key;
  progress.textContent=other?`Comparing ${baseline.name} and ${other.name}`:`Pinned ${baseline.name}. Choose a second garment.`;
  hint.textContent=other?'First garment pinned. Select another item to update the comparison.':'First garment pinned. Choose another garment in the wardrobe or product table.';
  cards.replaceChildren(garmentCard(baseline,'Pinned garment'),
   other?garmentCard(other,'Current selection'):placeholder());
 }

 function garmentCard(product,label){
  const card=document.createElement('article');
  card.className='wardrobe-garment';
  const slot=document.createElement('p');slot.className='wardrobe-card-label';slot.textContent=label;
  const name=document.createElement('h4');name.textContent=product.name;
  const swatch=document.createElement('i');swatch.className='store-color-chip';
  swatch.style.setProperty('--item-color',product.color);swatch.setAttribute('aria-hidden','true');
  name.prepend(swatch);
  const preview=document.createElement('div');preview.innerHTML=renderCloseup(product);
  const facts=document.createElement('dl');
  for(const [label,value] of [['Fabric',product.fabric],['Sample sizes',product.sizes],['Sample price',priceLabel(product.price_npr)]]){
   const row=document.createElement('div');
   const term=document.createElement('dt');term.textContent=label;
   const detail=document.createElement('dd');detail.textContent=value;
   row.append(term,detail);facts.append(row);
  }
  card.append(slot,name,preview,facts);
  return card;
 }

 function placeholder(){
  const card=document.createElement('p');card.className='wardrobe-comparison-empty';card.textContent='Awaiting another garment';
  return card;
 }

 function openDoors(){open=true;render();}
 function endComparison(){baseline=null;comparisonKey='';renderComparison();}
 hotspot.disabled=!model;
 hotspot.addEventListener('click',()=>{openDoors();browse.focus({preventScroll:true});});
 toggle.addEventListener('click',()=>{
  if(open){
   open=false;baseline=null;comparisonKey='';
   if(state.focused)setGarmentFocus(false);
   render();
  }else openDoors();
 });
 lighting.addEventListener('change',render);
 browse.addEventListener('click',()=>{
  if(state.focused)setGarmentFocus(false);
  const target=panel.querySelector('#store-canvas');
  target.focus({preventScroll:true});
  if(!dialog.open)target.scrollIntoView({block:'nearest'});
 });
 inspect.addEventListener('click',()=>{
  setGarmentFocus(!state.focused);
  if(!dialog.open)panel.querySelector('.store-scene').scrollIntoView({block:'nearest'});
 });
 compare.addEventListener('click',()=>{
  if(baseline){endComparison();return;}
  baseline=state?.product;
  comparisonKey='';
  if(baseline&&state.focused)setGarmentFocus(false);
  renderComparison();
 });
 get('wardrobe-end-comparison').addEventListener('click',()=>{
  endComparison();
  (actions.hidden?panel.querySelector('[data-store-mode=floor]'):compare).focus({preventScroll:true});
 });

 render();
 return {
  showComparison(){
   if(!baseline)return false;
   if(state?.product&&state.product.id!==baseline.id)comparison.scrollIntoView({block:'nearest'});
   return true;
  },
  reveal(){if(!open){open=true;render();}},
  update(next){state=next;render();}
 };
}
