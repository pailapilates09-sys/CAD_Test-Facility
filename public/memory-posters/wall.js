const posters=[...document.querySelectorAll('[data-poster]')],search=document.querySelector('#poster-search'),filters=[...document.querySelectorAll('[data-category-filter]')];
let category='all';
const status=document.querySelector('#memory-status');
const filter=()=>{
 const query=search.value.toLocaleLowerCase().trim();let count=0;
 for(const poster of posters){poster.hidden=!(category==='all'||poster.dataset.category===category)||!poster.textContent.toLocaleLowerCase().includes(query);if(!poster.hidden)count++;}
 document.querySelector('#poster-count').textContent=count===posters.length?count+' posters':count+' of '+posters.length+' posters';document.querySelector('#poster-empty').hidden=count!==0;
};
for(const button of filters){button.disabled=false;button.addEventListener('click',()=>{category=button.dataset.categoryFilter;for(const current of filters)current.setAttribute('aria-pressed',String(current===button));filter();});}
search.disabled=false;search.addEventListener('input',filter);
const reading=document.querySelector('#reading-view');reading.disabled=false;
const applyReading=value=>{document.body.classList.toggle('memory-reading',value);reading.setAttribute('aria-pressed',String(value));reading.textContent=value?'Wall view':'Reading view';};
try{applyReading(localStorage.getItem('paila-memory-reading')==='true');}catch{applyReading(false);}
reading.addEventListener('click',()=>{const value=reading.getAttribute('aria-pressed')!=='true';applyReading(value);try{localStorage.setItem('paila-memory-reading',String(value));}catch{}});
const print=document.querySelector('#print-posters');print.disabled=false;print.addEventListener('click',()=>window.print());
for(const button of document.querySelectorAll('[data-copy-prompt]')){
 button.disabled=false;button.addEventListener('click',async()=>{
  const prompt=document.getElementById(button.dataset.copyPrompt);
  try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(prompt.textContent);status.textContent='Prompt copied. Paste it into your next request.';button.textContent='Copied ✓';setTimeout(()=>button.textContent='Copy prompt',2000);}
  catch{const range=document.createRange();range.selectNodeContents(prompt);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);status.textContent='Prompt selected. Use your browser’s Copy command to keep it.';}
 });
}
