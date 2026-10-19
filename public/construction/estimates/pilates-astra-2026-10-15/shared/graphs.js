import {createRangeBoard} from '../v5.1/range-board.js';
import {createReviewVisuals} from '../v6/review-visuals.js';
async function init(){
 const response=await fetch('../v5/comparison.json',{cache:'no-cache'});if(!response.ok)throw Error('Chart source unavailable');
 const data=await response.json();
 createRangeBoard(data,{permanentOriginal:true})(data.items);
 createReviewVisuals(data,{detailLabel:'All work data'})(data.items);
 document.addEventListener('click',event=>{const button=event.target.closest('[data-detail]');if(button)location.href='../v10/#work-'+encodeURIComponent(button.dataset.detail);});
}
init().catch(error=>{document.getElementById('range-board-summary').textContent='Interactive inspection unavailable; the published charts remain visible. '+error.message;});
