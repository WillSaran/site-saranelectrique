(function(){
  var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function I(n){return '/img/'+n+'.jpg';}
  var SECT=[['residentiel','Residential',I('escalier'),'For your home’s electrical safety and comfort: renovation, new construction, EV charger, pool and more.'],
    ['commercial','Commercial',I('commerce'),'For your offices, stores and buildings: lighting, maintenance, renovation and new projects.']];
  var PROJ={residentiel:[['renovation','Renovation',I('cuisine'),'Kitchen, basement, bathroom: we adapt your electrical system to your new space.'],
      ['neuf','New construction',I('multiplex'),'House, plex or addition: complete wiring, from the panel to the fixtures.'],
      ['entree','Electrical service',I('filage-ext'),'Service and panel upgrades, new circuits.'],
      ['borne','EV charger',I('camion-maison'),'Level 2 charger at home: place it on your house, we estimate the cable.'],
      ['piscine','Pool and hot tub',I('exterieur-nuit'),'Power, grounding and lighting for your backyard.'],
      ['generatrice','Generator transfer panel',I('camion-nuit'),'Transfer panel to connect your generator during outages.'],
      ['batterie','Battery, solar & EV charging',I('sigen-panne'),'Sigenergy backup battery, solar panels and EV charging connected: keep the power on during outages.'],
      ['chauffage','Heating and thermostats',I('corridor'),'Baseboards, convectors and electronic or smart thermostats.'],
      ['service','Service call / Other',I('camions'),'Repairs, outages, a dead outlet or any other need.']],
    commercial:[['eclairage','Lighting upgrade',I('commerce'),'LED conversion and new fixtures to cut costs and light better.'],
      ['entretien','Commercial maintenance',I('camions'),'Preventive and corrective maintenance to keep your installations safe.'],
      ['reno-comm','Commercial renovation',I('corridor'),'Fit-ups for spaces, offices and stores.'],
      ['neuf-comm','New commercial project',I('entrepot'),'New construction or build-outs, from design to commissioning.'],
      ['borne-comm','Commercial EV charging',I('multiplex'),'Business parking, multi-unit buildings and retail.']]};
  var TIPS={borne:['Your electrical panel, door open (we need to see the breakers)','The panel label (brand and amperage)','Where you want the charger','The path between the panel and the charger (basement, garage, exterior wall)'],
    entree:['Your electrical panel, door open','The meter and electrical service outside'],
    batterie:['A recent Hydro-Québec bill (consumption)','Your electrical panel, door open','The planned battery location (garage, basement, outside wall)','Your generator or solar panels, if you have them'],
    service:['What isn’t working (outlet, light, breaker)','Your electrical panel, door open'],
    _:['The rooms or area involved','Your electrical panel, door open','Your plans, if you have any']};
  var delais=[['urgent','Urgent'],['mois','Within 1 month'],['trois','1 to 3 months'],['info','Just exploring']];
  var Q={lieu:[['ext','Outdoors'],['garage','In the garage'],['nsp','Not sure']],
    amp:[['100','100 A'],['200','200 A'],['autre','Other'],['nsp','Not sure']],
    passage:[['ssnf','Unfinished basement'],['ext','Outside'],['fini','Finished walls'],['nsp','Not sure']],
    achat:[['oui','Yes, I have it'],['non','No, advise me']]};
  var st={step:1,bat:null,projet:null,delai:'mois',addr:null,photos:[],tool:'P',
    cells:{14:'L',16:'L',26:'L',28:'L',37:'P',40:'P',50:'P',72:'S',95:'B'},
    b:{lieu:null,amp:null,passage:null,achat:null},mt:'borne',mk:{borne:null,panneau:null}};

  function card(it,cls,onpick){var b=document.createElement('button');b.type='button';b.className='pcard'+(cls?' '+cls:'');
    b.innerHTML='<img alt="" src="'+it[2]+'"><span class="ov"></span><span class="tx"><span class="tt"></span><span class="dd"></span><span class="go">Choose →</span></span>';
    b.querySelector('.tt').textContent=it[1];b.querySelector('.dd').textContent=it[3];b.setAttribute('aria-label',it[1]+' : '+it[3]);b.onclick=onpick;return b;}
  function pills(el,list,get,set){el.innerHTML='';list.forEach(function(it){var b=document.createElement('button');b.type='button';var on=get()===it[0];b.className='pill'+(on?' on':'');b.textContent=it[1];b.setAttribute('aria-pressed',on);b.onclick=function(){set(it[0]);render();};el.appendChild(b);});}
  function isBorne(){return st.projet==='borne';}
  function projLabel(){var p=st.bat?PROJ[st.bat].filter(function(x){return x[0]===st.projet;})[0]:null;return p?p[1]:'';}
  function sectLabel(){var s=SECT.filter(function(x){return x[0]===st.bat;})[0];return s?s[1]:'';}
  function lbl(list,v){var x=list.filter(function(i){return i[0]===v;})[0];return x?x[1]:'—';}

  // Plan (projets généraux)
  var SYM={P:'<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="11" fill="#fff" stroke="#141414" stroke-width="2.5"/><line x1="10.5" y1="9" x2="10.5" y2="19" stroke="#141414" stroke-width="2.5"/><line x1="17.5" y1="9" x2="17.5" y2="19" stroke="#141414" stroke-width="2.5"/></svg>',
    L:'<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="13" fill="#FA890D" opacity=".35"/><circle cx="15" cy="15" r="8" fill="#FA890D" stroke="#141414" stroke-width="2"/></svg>',
    S:'<span class="sym" style="background:#141414;color:#fff">S</span>',
    B:'<span class="sym" style="background:#995000;color:#fff;width:34px;font-size:12px">VE</span>',
    X:'<span class="sym" style="border:2px dashed #999;color:#4D4D4D">×</span>'};
  var NAMES={P:'outlet',L:'light',S:'switch',B:'EV charger'};
  var tools=[['P','Outlet'],['L','Pot light'],['S','Switch'],['B','EV charger'],['X','Eraser']];
  function counts(){var n={P:0,L:0,S:0,B:0};for(var k in st.cells)n[st.cells[k]]++;return n;}

  // Carte borne (Leaflet + imagerie satellite Esri)
  var map=null, markers={borne:null,panneau:null}, line=null;
  function loadLeaflet(cb){
    if(window.L)return cb();
    var css=document.createElement('link');css.rel='stylesheet';css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(css);
    var s=document.createElement('script');s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';s.onload=cb;s.onerror=function(){mapMsg('The map couldn’t load. Describe the location in the notes and we’ll handle it.');};document.head.appendChild(s);
  }
  function mapMsg(t){var m=$('#map-msg');m.textContent=t||'';m.style.display=t?'flex':'none';}
  function pinIcon(kind){return L.divIcon({className:'',html:'<span class="pin '+(kind==='borne'?'pin-b':'pin-p')+'" style="width:34px;height:34px;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,.5)">'+(kind==='borne'?'VE':'P')+'</span>',iconSize:[34,34],iconAnchor:[17,17]});}
  function updDist(){
    var d=$('#dist');
    if(line){map.removeLayer(line);line=null;}
    if(markers.borne&&markers.panneau){var P=markers.panneau.getLatLng(),B=markers.borne.getLatLng(),K=L.latLng(P.lat,B.lng);line=L.polyline([P,K,B],{color:'#FA890D',weight:4,dashArray:'8 6'}).addTo(map);var m=P.distanceTo(K)+K.distanceTo(B);st.dist=Math.round(m*3.281);d.textContent='≈ '+st.dist+' ft ('+Math.round(m)+' m)';}
    else{st.dist=null;d.textContent=markers.borne?'Place the panel':'Place the charger';}
  }
  function placeMarker(kind,latlng){
    if(markers[kind])markers[kind].setLatLng(latlng);
    else{markers[kind]=L.marker(latlng,{icon:pinIcon(kind),draggable:true}).addTo(map);markers[kind].on('drag',updDist);}
    if(kind==='borne'&&!markers.panneau){st.mt='panneau';renderMapTools();}
    updDist();
  }
  function initMap(){
    if(!st.addr){mapMsg('Enter your address in step 2 to see your house.');return;}
    $('#map-addr').textContent='Address: '+st.addr.label;
    loadLeaflet(function(){
      mapMsg('');
      var c=[st.addr.lat,st.addr.lon];
      if(!map){
        map=L.map('map',{zoomControl:true,maxZoom:21}).setView(c,19);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:21,maxNativeZoom:19,attribution:'Imagery © Esri'}).addTo(map);
        map.on('click',function(e){placeMarker(st.mt,e.latlng);});
      } else { map.setView(c,19); setTimeout(function(){map.invalidateSize();},50); }
      L.circleMarker(c,{radius:5,color:'#fff',weight:2,fillColor:'#FA890D',fillOpacity:1}).addTo(map);
      updDist();
    });
  }
  function renderMapTools(){$$('#mapTools [data-mt]').forEach(function(b){var on=b.getAttribute('data-mt')===st.mt;b.className='tool'+(on?' on':'');b.setAttribute('aria-pressed',on);});}
  $$('#mapTools [data-mt]').forEach(function(b){b.onclick=function(){st.mt=b.getAttribute('data-mt');renderMapTools();};});

  // Adresse : autocomplétion (Photon / OpenStreetMap)
  var adr=$('#f-adr'),list=$('#adr-list'),tmr=null,lastQ='';
  function fmt(p){return [[p.housenumber,p.street||p.name].filter(Boolean).join(' '),p.city||p.town||p.village,p.state==='Québec'||p.state==='Quebec'?'QC':p.state,p.postcode].filter(Boolean).join(', ');}
  adr.addEventListener('input',function(){
    st.addr=null;$('#adr-ok').hidden=true;var q=adr.value.trim();clearTimeout(tmr);
    if(q.length<4){list.hidden=true;adr.setAttribute('aria-expanded','false');return;}
    tmr=setTimeout(function(){lastQ=q;
      fetch('https://photon.komoot.io/api/?limit=6&lang=fr&lat=45.31&lon=-73.26&q='+encodeURIComponent(q)).then(function(r){return r.json();}).then(function(j){
        if(q!==lastQ)return;
        var f=(j.features||[]).filter(function(x){return x.properties.countrycode==='CA';}).slice(0,5);
        list.innerHTML='';
        f.forEach(function(x){var li=document.createElement('li');li.setAttribute('role','option');li.tabIndex=-1;var t=fmt(x.properties);li.textContent=t;
          li.onmousedown=function(e){e.preventDefault();adr.value=t;st.addr={label:t,lat:x.geometry.coordinates[1],lon:x.geometry.coordinates[0]};list.hidden=true;adr.setAttribute('aria-expanded','false');$('#adr-ok').hidden=false;};
          list.appendChild(li);});
        list.hidden=!f.length;adr.setAttribute('aria-expanded',f.length?'true':'false');
      }).catch(function(){list.hidden=true;});
    },300);
  });
  adr.addEventListener('blur',function(){setTimeout(function(){list.hidden=true;},150);});
  adr.addEventListener('keydown',function(e){var items=$$('li',list);if(list.hidden||!items.length)return;var i=items.indexOf(document.activeElement);
    if(e.key==='ArrowDown'){e.preventDefault();(items[i+1]||items[0]).focus();}
  });
  list.addEventListener('keydown',function(e){var items=$$('li',list),i=items.indexOf(document.activeElement);
    if(e.key==='ArrowDown'){e.preventDefault();(items[i+1]||items[0]).focus();}
    else if(e.key==='ArrowUp'){e.preventDefault();(items[i-1]||adr).focus();}
    else if(e.key==='Enter'&&i>=0){e.preventDefault();items[i].onmousedown(e);adr.focus();}
    else if(e.key==='Escape'){list.hidden=true;adr.focus();}
  });

  // Photos
  $('#photos').onchange=function(e){Array.prototype.forEach.call(e.target.files,function(f){st.photos.push(f);});e.target.value='';render();};

  function render(){
    var sc=st.step===3?(isBorne()?'s3borne':'s3plan'):('s'+st.step);
    ['s1','s2','s3plan','s3borne','s4'].forEach(function(id){$('#'+id).hidden=id!==sc;});
    $('#steps').innerHTML=['1 · Project','2 · Your info','3 · Quote'].map(function(l,k){var c=st.step===k+1?'on':(st.step>k+1?'done':'');return '<span class="step '+c+'">'+l+'</span>';}).join('');
    // Étape 1
    var cd=$('#cards');cd.innerHTML='';$('#backSect').hidden=!st.bat;
    if(!st.bat){$('#s1title').textContent='What type of project?';$('#s1sub').textContent='Choose your sector.';
      SECT.forEach(function(it){cd.appendChild(card(it,'big',function(){st.bat=it[0];st.projet=null;render();window.scrollTo(0,0);}));});}
    else{$('#s1title').textContent=st.bat==='commercial'?'Your commercial project':'Your residential project';$('#s1sub').textContent='Tap a card to see the details, then choose.';
      PROJ[st.bat].forEach(function(it){cd.appendChild(card(it,'',function(){if(it[0]==='borne'){location.href='/borne/';return;}st.projet=it[0];st.step=2;render();window.scrollTo(0,0);}));});}
    // Étape 2
    pills($('#delais'),delais,function(){return st.delai;},function(v){st.delai=v;});
    $('#photo-tips').innerHTML=(TIPS[st.projet]||TIPS._).map(function(t){return '<li>'+esc(t)+'</li>';}).join('');
    var th=$('#thumbs');th.innerHTML='';
    st.photos.forEach(function(f,i){var w=document.createElement('span');w.className='thumb';
      if(f.type.indexOf('image')===0){var im=document.createElement('img');im.src=URL.createObjectURL(f);im.alt=f.name;w.appendChild(im);}else{w.textContent='Video';}
      var x=document.createElement('button');x.type='button';x.textContent='×';x.setAttribute('aria-label','Remove '+f.name);x.onclick=function(){st.photos.splice(i,1);render();};w.appendChild(x);th.appendChild(w);});
    $$('.r-bat').forEach(function(e){e.textContent=sectLabel();});
    $$('.r-projet').forEach(function(e){e.textContent=projLabel();});
    $$('.r-photos').forEach(function(e){e.textContent=st.photos.length?st.photos.length+' photo(s) added ✓':'No photos yet';});
    $('#toS3').textContent=isBorne()?'Continue → Place my charger':'Send my request';
    // Étape 3 plan
    var tl=$('#tools');tl.innerHTML='';tools.forEach(function(t){var b=document.createElement('button');b.type='button';b.className='tool'+(st.tool===t[0]?' on':'');b.setAttribute('aria-pressed',st.tool===t[0]);b.innerHTML='<span class="chip">'+SYM[t[0]]+'</span><span>'+t[1]+'</span>';b.onclick=function(){st.tool=t[0];render();};tl.appendChild(b);});
    var cl=$('#cells');cl.innerHTML='';for(var i=0;i<96;i++){(function(i){var v=st.cells[i];var b=document.createElement('button');b.type='button';b.className='cell';b.setAttribute('aria-label','Cell '+(i+1)+(v?' : '+NAMES[v]:': empty'));b.innerHTML=v?SYM[v]:'';b.onclick=function(){if(st.tool==='X'||st.cells[i]===st.tool)delete st.cells[i];else st.cells[i]=st.tool;render();};cl.appendChild(b);})(i);}
    var n=counts();$$('[data-n]').forEach(function(e){e.textContent=n[e.getAttribute('data-n')];});
    // Étape 3 borne
    $$('[data-q]').forEach(function(el){var k=el.getAttribute('data-q');pills(el,Q[k],function(){return st.b[k];},function(v){st.b[k]=v;});});
    $('#modele-wrap').hidden=st.b.achat!=='oui';$('#modele-wrap').style.display=st.b.achat==='oui'?'flex':'none';
    renderMapTools();
  }

  function summary(){
    var h='<p style="margin:0 0 8px"><b>'+esc(sectLabel())+' · '+esc(projLabel())+'</b></p>';
    if(st.addr)h+='<p style="margin:0 0 8px">Address: '+esc(st.addr.label)+'</p>';
    if(isBorne()){
      h+='<ul style="margin:0 0 8px;padding-left:20px">'+
        '<li>Panel → charger distance: '+(st.dist?'≈ '+st.dist+' ft (90° route)':'not specified')+'</li>'+
        '<li>Location: '+esc(lbl(Q.lieu,st.b.lieu))+'</li>'+
        '<li>Panel: '+esc(lbl(Q.amp,st.b.amp))+'</li>'+
        '<li>Cable route: '+esc(lbl(Q.passage,st.b.passage))+'</li>'+
        '<li>Charger: '+esc(st.b.achat==='oui'?([$('#f-marque').value,$('#f-modele').value].filter(Boolean).join(' ')||'already purchased'):lbl(Q.achat,st.b.achat))+'</li></ul>';
    }
    h+='<p style="margin:0">'+st.photos.length+' photo(s) attached. We’ll get back to you quickly, Monday to Friday between 7 a.m. and 4 p.m.</p>';
    return h;
  }

  $$('[data-back]').forEach(function(b){b.onclick=function(){st.step=Math.max(1,st.step-1);render();window.scrollTo(0,0);};});
  $('#toS3').onclick=function(){
    var f=$('#form'),ok=true;['#f-nom','#f-tel','#f-adr'].forEach(function(s){if(ok&&!$(s).value.trim()){$(s).focus();$(s).reportValidity();ok=false;}});
    if(!ok)return;
    if(!st.addr){ // géocode le texte tapé si aucune suggestion choisie
      fetch('https://photon.komoot.io/api/?limit=1&lang=fr&lat=45.31&lon=-73.26&q='+encodeURIComponent($('#f-adr').value)).then(function(r){return r.json();}).then(function(j){var x=(j.features||[])[0];if(x)st.addr={label:$('#f-adr').value,lat:x.geometry.coordinates[1],lon:x.geometry.coordinates[0]};go3();}).catch(go3);
    } else go3();
  };
  function go3(){if(!isBorne()){if(!st.photos.length){$('#nophoto').hidden=false;$('#np-skip').focus();return;}doSend();return;}st.step=3;render();window.scrollTo(0,0);setTimeout(initMap,30);}

  var ENDPOINT='https://script.google.com/macros/s/AKfycbzIjp7kejZ7VovKEFkqQp5YvAg-_xK1qZng6LaYSKaDNSBFIGLcoDabPHHCmrp1oilg/exec';
  function shrink(f){return new Promise(function(res){
    if(f.type.indexOf('image')!==0){ if(f.size>8e6) return res(null); var r=new FileReader();r.onload=function(){res({name:f.name,type:f.type,data:String(r.result).split(',')[1]});};r.onerror=function(){res(null);};r.readAsDataURL(f);return; }
    var u=URL.createObjectURL(f),im=new Image();im.onload=function(){var k=Math.min(1,1600/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res({name:f.name.replace(/\.[^.]+$/,'')+'.jpg',type:'image/jpeg',data:c.toDataURL('image/jpeg',0.82).split(',')[1]});};im.onerror=function(){res(null);};im.src=u;});}
  window.__sendLead=function(){
    var stEl=$('#send-status');
    if(ENDPOINT.indexOf('http')!==0){stEl.textContent='(Demo: email sending is not connected yet.)';return;}
    stEl.style.color='#6B6B6B';stEl.textContent='Sending your request…';
    var d={nom:$('#f-nom').value,tel:$('#f-tel').value,mail:$('#f-mail').value,adresse:st.addr?st.addr.label:$('#f-adr').value,
      secteur:sectLabel(),projet:projLabel(),delai:lbl(delais,st.delai),notes:$('#f-notes').value,hp:$('#f-hp').value,version:(document.querySelector('.ver')||{}).textContent,lang:'en'};
    if(isBorne()){var mk=function(m){return m?m.getLatLng():null;},Bp=mk(markers.borne),Pp=mk(markers.panneau),liens=[];
      if(Bp)liens.push({label:'See the charger on Google Maps',url:'https://www.google.com/maps/search/?api=1&query='+Bp.lat.toFixed(6)+','+Bp.lng.toFixed(6)});
      if(Pp)liens.push({label:'See the panel on Google Maps',url:'https://www.google.com/maps/search/?api=1&query='+Pp.lat.toFixed(6)+','+Pp.lng.toFixed(6)});
      d.borne={distance:st.dist?('≈ '+st.dist+' ft (90° route)'):'not specified',lieu:lbl(Q.lieu,st.b.lieu),amp:lbl(Q.amp,st.b.amp),passage:lbl(Q.passage,st.b.passage),
        borne:st.b.achat==='oui'?([$('#f-marque').value,$('#f-modele').value].filter(Boolean).join(' ')||'already purchased'):lbl(Q.achat,st.b.achat),liens:liens};}
    
    Promise.all(st.photos.map(shrink)).then(function(ph){
      var ok=[],tot=0,om=0;ph.forEach(function(p){if(p&&tot+p.data.length<18e6){ok.push(p);tot+=p.data.length;}else om++;});
      d.photos=ok;if(om)d.omis=om+' file(s) too large, not attached';
      return fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(d)});
    }).then(function(r){return r.json().catch(function(){return {ok:true};});}).then(function(j){
      if(j&&j.ok){stEl.style.color='#2E7D32';stEl.textContent='✓ Request sent to Saran Électrique.';}
      else throw new Error(j&&j.error);
    }).catch(function(){stEl.style.color='#B3261E';stEl.textContent='Sending failed. Call us at 438-490-3412 and we’ll take your request by phone.';});
  };
  function doSend(){$('#nophoto').hidden=true;st.step=4;$('#merci').innerHTML=summary();render();window.scrollTo(0,0);if(window.__sendLead)window.__sendLead();}
  $$('[data-send]').forEach(function(b){b.onclick=function(){if(!st.photos.length){$('#nophoto').hidden=false;$('#np-skip').focus();return;}doSend();};});
  $('#np-skip').onclick=doSend;
  $('#np-file').onchange=function(e){Array.prototype.forEach.call(e.target.files,function(f){st.photos.push(f);});e.target.value='';if(st.photos.length)doSend();};
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!$('#nophoto').hidden)$('#nophoto').hidden=true;});
  $('#restart').onclick=function(){st.step=1;st.bat=null;st.projet=null;render();};
  $('#backSect').onclick=function(){st.bat=null;st.projet=null;render();};
  window.__preselect=function(code){var p=code.split('-');var sec=p.shift(),pj=p.join('-');if(sec==='residentiel'&&pj==='borne'){location.replace('/borne/');return;}if(!PROJ[sec])return;st.bat=sec;st.projet=null;st.step=1;
    if(pj&&PROJ[sec].some(function(x){return x[0]===pj;})){st.projet=pj;st.step=2;}render();window.scrollTo(0,0);$$('.dd-1').forEach(function(d){d.blur&&d.blur();});document.activeElement&&document.activeElement.blur();};
  var h0=location.hash.slice(1);if(h0)window.__preselect(h0);
  window.addEventListener('hashchange',function(){var h=location.hash.slice(1);if(h)window.__preselect(h);});
  $('#planFile').onchange=function(e){var f=e.target.files[0];if(!f)return;$('#planLabel').textContent=f.name;if(f.type.indexOf('image')===0){var u=URL.createObjectURL(f);var p=$('#plan');p.style.backgroundImage='url('+u+')';$('#rooms').style.display='none';}};
  render();
})();