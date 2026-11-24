(function(){
  document.querySelectorAll('a[href="#"]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();});});
  document.querySelectorAll('.nav-top').forEach(function(b){b.addEventListener('click',function(e){if(window.matchMedia('(hover:none)').matches){var d=b.parentNode;if(!d.classList.contains('open')){e.preventDefault();d.classList.add('open');}}});});
  var nl=document.getElementById('nl');if(nl){var btn=nl.parentNode.querySelector('button');btn&&btn.addEventListener('click',function(){if(!nl.value||!nl.checkValidity()){nl.focus();nl.reportValidity();return;}btn.textContent=document.documentElement.lang.indexOf('en')===0?'Thanks! See you next week.':'Merci ! À la semaine prochaine.';btn.disabled=true;});}
  // Apparition au défilement
  var els=[].slice.call(document.querySelectorAll('.wrap > h2, .cardgrid, .avis-grid, .why, .sg-steps, .sg-split, .prose, [data-rv]'));
  var pend=els.filter(function(el){return el.getBoundingClientRect().top>window.innerHeight;});
  pend.forEach(function(el){el.classList.add('rv');});
  function chk(){pend=pend.filter(function(el){if(el.getBoundingClientRect().top<window.innerHeight*0.92){el.classList.add('in');return false;}return true;});if(!pend.length){window.removeEventListener('scroll',chk);}}
  window.addEventListener('scroll',chk,{passive:true});window.addEventListener('resize',chk);setTimeout(function(){pend.forEach(function(el){if(el.getBoundingClientRect().bottom<0)el.classList.add('in');});},1500);
  // Diaporama de l'accueil
  document.querySelectorAll('.hero-slides').forEach(function(box){var im=box.querySelectorAll('img');if(im.length<2)return;var i=0;setInterval(function(){im[i].classList.remove('on');i=(i+1)%im.length;im[i].classList.add('on');},4500);});
})();
