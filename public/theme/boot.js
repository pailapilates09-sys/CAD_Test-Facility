/* Runs before styles: restore the theme without a light flash on a dark page. */
(function(){
 var saved=null,flight=null,mascot=null;
 try{saved=localStorage.getItem('cad-theme');flight=localStorage.getItem('cad-flight');mascot=localStorage.getItem('cad-mascot')}catch(e){}
 var systemDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
 var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 document.documentElement.dataset.theme=saved==='light'||saved==='dark'?saved:systemDark?'dark':'light';
 document.documentElement.dataset.flight=reduced||flight==='paused'?'paused':'active';
 document.documentElement.dataset.mascot=mascot==='hidden'?'hidden':'visible';
})();
