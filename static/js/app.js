/* Клиентская логика. Все тексты и настройки приходят из window.SITE (собирается из content/*.json) */
(function(){
  var S=window.SITE||{};
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Запись на семинары ---------- */
  var form=document.getElementById('form');
  if(form){
    var err=document.getElementById('err'),statusEl=document.getElementById('status');
    var calBox=document.getElementById('cal'),calLink=document.getElementById('calLink');
    var plans=S.plans||{};

    function checkedKey(){return form.querySelector('input[name=plan]:checked').value}

    function pick(v){
      var r=form.querySelector('input[name=plan][value='+v+']');
      if(r){r.checked=true}
      document.getElementById('register').scrollIntoView({behavior:reduce?'auto':'smooth'});
      setTimeout(function(){document.getElementById('name').focus({preventScroll:true})},reduce?0:600);
    }
    Array.prototype.forEach.call(document.querySelectorAll('[data-pick]'),function(b){
      b.addEventListener('click',function(){pick(b.getAttribute('data-pick'))});
    });

    function showCal(){
      var c=plans[checkedKey()],e=encodeURIComponent,k=S.calendar||{};
      var d=c.calStart;
      calLink.href='https://calendar.google.com/calendar/render?action=TEMPLATE'
        +'&text='+e(c.calTitle)
        +'&dates='+d+'T'+k.start+'/'+d+'T'+k.end
        +'&ctz='+e(k.tz)
        +'&location='+e(k.location)
        +'&details='+e(k.details)
        +'&recur='+e('RRULE:FREQ=DAILY;COUNT='+c.calDays);
      calBox.hidden=false;
    }
    Array.prototype.forEach.call(form.querySelectorAll('input[name=plan]'),function(r){
      r.addEventListener('change',function(){if(!calBox.hidden)showCal()});
    });

    /* Meta Pixel */
    function loadPixel(){
      if(!S.pixelId||window.fbq)return;
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
      s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init',S.pixelId);
      fbq('track','PageView');
    }
    function track(name){if(window.fbq)window.fbq('track',name)}
    loadPixel();

    /* Google Таблица (адрес веб-приложения Apps Script задаётся в админке: «Общие настройки») */
    function saveToSheet(){
      var v=function(id){return document.getElementById(id).value.trim()};
      var key=checkedKey();
      var d={name:v('name'),phone:v('phone'),email:v('email'),prof:document.getElementById('prof').value,
        plan:plans[key].sheetName,planKey:key,msg:v('msg')};
      track('Lead');
      if(!S.sheetUrl)return Promise.resolve();
      /* text/plain: простой запрос без preflight, Apps Script его принимает */
      return fetch(S.sheetUrl,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(d)})
        .then(function(r){return r.text()})
        .then(function(t){
          var j;try{j=JSON.parse(t)}catch(x){throw new Error('bad response')}
          if(!j.ok)throw new Error(j.error||'error');
        });
    }

    function valid(){
      var n=document.getElementById('name'),p=document.getElementById('phone'),m=document.getElementById('email');
      var okN=n.value.trim().length>1,okP=p.value.replace(/\D/g,'').length>=7,okM=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m.value.trim());
      err.classList.toggle('on',!(okN&&okP&&okM));
      if(!okN){n.focus();return false}
      if(!okP){p.focus();return false}
      if(!okM){m.focus();return false}
      return true;
    }

    function message(){
      var v=function(id){return document.getElementById(id).value.trim()};
      var lines=[S.waIntro,
        'Выбор: '+plans[checkedKey()].waText,
        'Имя: '+v('name'),
        'Телефон: '+v('phone'),
        'Email: '+v('email')];
      if(document.getElementById('prof').value)lines.push('Специальность: '+document.getElementById('prof').value);
      if(v('msg'))lines.push('Комментарий: '+v('msg'));
      return lines.join('\n');
    }

    var sendBtn=document.getElementById('send'),after=document.getElementById('after'),waLink=document.getElementById('waLink');
    sendBtn.addEventListener('click',function(){
      if(!valid())return;
      sendBtn.disabled=true;
      statusEl.classList.remove('bad');
      statusEl.textContent=S.savingText||'';
      var waUrl='https://wa.me/'+S.waNumber+'?text='+encodeURIComponent(message());
      saveToSheet().then(function(){
        waLink.href=waUrl;
        after.hidden=false;
        showCal();
        statusEl.textContent=S.statusText||'';
      }).catch(function(){
        statusEl.classList.add('bad');
        statusEl.textContent=S.saveErrorText||'';
        waLink.href=waUrl;
        after.hidden=false;
        sendBtn.disabled=false;
      });
    });
  }

  /* ---------- Видео ---------- */
  var v=document.getElementById('clipVideo'),b=document.getElementById('clipPlay'),f=document.getElementById('clip');
  if(v&&b&&f){
    b.addEventListener('click',function(){f.classList.add('playing');v.controls=true;v.play();});
    v.addEventListener('pause',function(){if(v.ended||v.currentTime===0){f.classList.remove('playing');v.controls=false;}});
    if('IntersectionObserver' in window){new IntersectionObserver(function(e){if(!e[0].isIntersecting&&!v.paused)v.pause();},{threshold:.2}).observe(f);}
  }
})();
