(function(){
  document.querySelectorAll('a[href="#"]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();});});
  document.querySelectorAll('.nav-top').forEach(function(b){b.addEventListener('click',function(e){if(window.matchMedia('(hover:none)').matches){var d=b.parentNode;if(!d.classList.contains('open')){e.preventDefault();d.classList.add('open');}}});});
  var nl=document.getElementById('nl');if(nl){var btn=nl.parentNode.querySelector('button');btn&&btn.addEventListener('click',function(){if(!nl.value||!nl.checkValidity()){nl.focus();nl.reportValidity();return;}btn.textContent='Merci ! À la semaine prochaine.';btn.disabled=true;});}
})();