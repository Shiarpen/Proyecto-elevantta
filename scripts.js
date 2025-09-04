(function init(){
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}else{run();}
  function run(){
    /* EmailJS (rellena tus claves) */
    const EMAILJS_PUBLIC_KEY = "REEMPLAZA_PUBLIC_KEY";
    const EMAILJS_SERVICE_ID = "REEMPLAZA_SERVICE_ID";
    const EMAILJS_TEMPLATE_ID = "REEMPLAZA_TEMPLATE_ID";
    const DEST_EMAIL = "cjchavez12378@gmail.com";
    if(window.emailjs && EMAILJS_PUBLIC_KEY && !EMAILJS_PUBLIC_KEY.startsWith("REEMPLAZA")){
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }

    /* Header sticky */
    const header=document.getElementById('siteHeader');
    const setHeader=()=>{const top=window.scrollY<10;header.classList.toggle('is-top',top);header.classList.toggle('is-scrolled',!top);}
    setHeader(); window.addEventListener('scroll',setHeader,{passive:true});

/* ---- Hero slideshow: cambia cada 6s ---- */
    const slidesWrap = document.getElementById('heroSlides');
    const slides = slidesWrap ? Array.from(slidesWrap.querySelectorAll('.slide')) : [];
    let heroIdx = 0;

    function setHero(idx){
    if (!slides.length) return;
    slides.forEach((s,i)=> s.classList.toggle('is-active', i === idx));
    }

    if (slides.length){
    setHero(0);
    setInterval(()=>{
        heroIdx = (heroIdx + 1) % slides.length;
        setHero(heroIdx);
    }, 6000);
    }



    /* ---- ScrollSpy: resalta el link del navbar según la sección visible ---- */
    const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    const sectionsToSpy = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

    function setActive(id){
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
    }

    if ('IntersectionObserver' in window){
    const spy = new IntersectionObserver(entries => {
        // el primero que cruce el umbral gana
        entries.forEach(entry => {
        if (entry.isIntersecting) setActive(entry.target.id);
        });
    }, {
        root: null,
        // Detecta cuando el centro de la sección entra en vista
        rootMargin: '-40% 0px -55% 0px',
        threshold: 0
    });
    sectionsToSpy.forEach(sec => spy.observe(sec));
    } else {
    // Fallback simple
    const onScrollSpy = () => {
        const y = window.scrollY + window.innerHeight * 0.45; // línea de referencia
        let current = sectionsToSpy[0]?.id;
        sectionsToSpy.forEach(sec => {
        const top = sec.offsetTop, bottom = top + sec.offsetHeight;
        if (y >= top && y < bottom) current = sec.id;
        });
        if (current) setActive(current);
    };
    window.addEventListener('scroll', onScrollSpy, {passive:true});
    onScrollSpy();
    }

    // Marca al instante cuando se hace click en un anchor del menú
    navLinks.forEach(a => a.addEventListener('click', () => {
    const id = a.getAttribute('href').slice(1);
    setActive(id);
    }));


    /* Reveal/stagger */
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('[data-stagger]').forEach(c=>{
      const kids=c.querySelectorAll(':scope > *'); kids.forEach((el,i)=>el.setAttribute('data-delay',(i*0.05).toFixed(2)));
    });
    const els=[...document.querySelectorAll('.reveal,[data-anim],.pill-card,.who-tile')];
    if(!prefersReduced && 'IntersectionObserver' in window){
      const io=new IntersectionObserver(es=>{
        es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in-view'); io.unobserve(e.target); }});
      },{threshold:.12, rootMargin:'0px 0px -8% 0px'});
      els.forEach(el=>io.observe(el));
    }else{els.forEach(el=>el.classList.add('in-view'));}

    /* Calendario */
    const monthLabel=document.getElementById('monthLabel'),daysGrid=document.getElementById('days'),weekdaysGrid=document.getElementById('weekdays');
    if(weekdaysGrid){['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].forEach(w=>{const d=document.createElement('div');d.textContent=w;weekdaysGrid.appendChild(d);});}
    let current=new Date(); current.setDate(1); let selectedISO="";
    const pad=n=>String(n).padStart(2,'0'); const toISO=(y,m,d)=>`${y}-${pad(m)}-${pad(d)}`; const fromISO=iso=>{if(!iso)return null;const p=iso.split('-').map(Number);return new Date(p[0],p[1]-1,p[2]);};
    function renderCal(){
      if(!daysGrid) return;
      daysGrid.innerHTML='';
      const y=current.getFullYear(),m=current.getMonth();
      const monthName=current.toLocaleString('es',{month:'long'}); if(monthLabel) monthLabel.textContent=monthName.charAt(0).toUpperCase()+monthName.slice(1)+' '+y;
      const first=new Date(y,m,1); const start=((first.getDay()+6)%7); const total=new Date(y,m+1,0).getDate();
      for(let i=0;i<start;i++){const c=document.createElement('div');c.className='cal-day';c.style.visibility='hidden';daysGrid.appendChild(c);}
      const today=new Date(),selected=fromISO(selectedISO);
      const same=(a,b)=>a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
      for(let d=1;d<=total;d++){
        const cell=document.createElement('button');cell.type='button';cell.className='cal-day';cell.textContent=String(d);
        const date=new Date(y,m,d); if(same(date,today))cell.classList.add('is-today'); if(same(date,selected))cell.classList.add('is-selected');
        cell.addEventListener('click',()=>{selectedISO=toISO(y,m+1,d);renderCal();loadAvailability(selectedISO);updateSummary();});
        daysGrid.appendChild(cell);
      }
    }
    const prev=document.getElementById('prevMonth'), next=document.getElementById('nextMonth');
    if(prev) prev.addEventListener('click',()=>{current.setMonth(current.getMonth()-1);renderCal();});
    if(next) next.addEventListener('click',()=>{current.setMonth(current.getMonth()+1);renderCal();});

    const timeEl=document.getElementById('time');
    const SLOT=60; const OPEN={1:[['09:00','12:00'],['15:00','18:00']],2:[['09:00','12:00'],['15:00','18:00']],3:[['09:00','12:00'],['15:00','18:00']],4:[['09:00','12:00'],['15:00','18:00']],5:[['09:00','12:00'],['15:00','18:00']],6:[['09:00','13:00']],0:[]};
    const BOOKED={'2025-09-03':['10:00','16:00'],'2025-09-04':['09:00','12:00']};
    const parseHM=s=>{const [h,m]=s.split(':').map(Number);return {h,m}}, addMin=(o,mins)=>{const d=new Date(0,0,0,o.h,o.m+mins);return {h:String(d.getHours()).padStart(2,'0'),m:String(d.getMinutes()).padStart(2,'0')}}, hm=o=>`${o.h}:${o.m}`;
    const slots=(ranges,step)=>{const out=[];ranges.forEach(([a,b])=>{let c=parseHM(a),z=parseHM(b);for(;;){const t=hm(c);if((c.h>z.h)||(c.h===z.h&&c.m>=z.m))break;out.push(t);c=addMin(c,step);} });return out;}
    const setEmpty=()=>{if(!timeEl) return; timeEl.innerHTML=`<option value="">No hay horarios disponibles</option>`;timeEl.disabled=true;}
    const setOpts=opts=>{if(!timeEl) return; if(!opts.length){setEmpty();return;}timeEl.innerHTML=`<option value="">Selecciona un horario</option>`+opts.map(h=>`<option>${h}</option>`).join('');timeEl.disabled=false;}
    function loadAvailability(iso){
      if(!timeEl) return;
      if(!iso){setOpts([]);return;}
      const dow=fromISO(iso).getDay(); const ranges=OPEN[dow]||[]; const booked=new Set((BOOKED[iso]||[]).map(String)); const all=slots(ranges,SLOT); const free=all.filter(t=>!booked.has(t)); setOpts(free);
    }

    const nameEl=document.getElementById('name'),emailEl=document.getElementById('email'),notesEl=document.getElementById('notes'),summary=document.getElementById('summary'),statusMsg=document.getElementById('statusMsg');
    const updateSummary=()=>{ if(!summary) return; const d=selectedISO?fromISO(selectedISO):null; const dateText=d?d.toLocaleDateString('es',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}):'Sin fecha seleccionada'; const timeText=!timeEl||timeEl.disabled?'Sin horario seleccionado':(timeEl.value||'Sin horario seleccionado'); summary.innerHTML=`<strong>Resumen</strong><span>Fecha: ${dateText}</span><span>Horario: ${timeText}</span>`;}
    if(timeEl) timeEl.addEventListener('change',updateSummary);

    const sendBtn=document.getElementById('sendEmail');
    if(sendBtn) sendBtn.addEventListener('click', async()=>{
      if(!selectedISO){alert('Selecciona una fecha');return;}
      if(!timeEl.value){alert('Elige un horario');return;}
      if(!nameEl.value.trim()){alert('Ingresa tu nombre');return;}
      if(emailEl.value.indexOf('@')===-1){alert('Correo inválido');return;}
      if(!window.emailjs||EMAILJS_PUBLIC_KEY.startsWith("REEMPLAZA")){alert('Configura EmailJS (PUBLIC_KEY / SERVICE_ID / TEMPLATE_ID).');return;}
      const d=fromISO(selectedISO); const date_text=d.toLocaleDateString('es',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
      const params={to_email:DEST_EMAIL,date_text,time_text:timeEl.value,name:nameEl.value,client_email:emailEl.value,notes:notesEl.value||''};
      try{sendBtn.disabled=true; if(statusMsg){statusMsg.style.color='#555';statusMsg.textContent='Enviando reservación…';}
        await emailjs.send(EMAILJS_SERVICE_ID,EMAILJS_TEMPLATE_ID,params);
        if(statusMsg){statusMsg.style.color='#0a0';statusMsg.textContent='Reservación enviada. ¡Te contactamos!';}
      }catch(e){console.error(e); if(statusMsg){statusMsg.style.color='#c00';statusMsg.textContent='Error al enviar. Revisa EmailJS.';}}
      finally{sendBtn.disabled=false;}
    });

    /* Pasarela DEMO */
    const payModal=document.getElementById('payModal'),paySummary=document.getElementById('paySummary'),payMsg=document.getElementById('payMsg');
    const card=document.getElementById('card'),exp=document.getElementById('exp'),cvv=document.getElementById('cvv'),holder=document.getElementById('holder');
    const openModal=()=>{payModal.classList.add('open');payModal.setAttribute('aria-hidden','false');}
    const closeModal=()=>{payModal.classList.remove('open');payModal.setAttribute('aria-hidden','true');payMsg.textContent='';}
    const onlyDigits=s=>(s||'').replace(/\D/g,''); const luhn=n=>{const d=onlyDigits(n).split('').reverse().map(Number);const s=d.reduce((a,x,i)=>a+(i%2?((x*=2)>9?x-9:x):x),0);return s%10===0;}
    const fmtCard=()=>{let v=onlyDigits(card.value).slice(0,16);card.value=v.replace(/(\d{4})(?=\d)/g,'$1 ').trim();}
    const fmtExp=()=>{let v=onlyDigits(exp.value).slice(0,4);if(v.length>2)v=v.slice(0,2)+'/'+v.slice(2);exp.value=v;}
    const limCVV=()=>{cvv.value=onlyDigits(cvv.value).slice(0,4);}
    if(card){card.addEventListener('input',fmtCard);exp.addEventListener('input',fmtExp);cvv.addEventListener('input',limCVV);}
    document.querySelectorAll('.reserve-pay').forEach(btn=>{
      btn.addEventListener('click',e=>{
        e.preventDefault();
        const product=btn.getAttribute('data-product')||'Servicio';
        if(paySummary) paySummary.innerHTML = `<strong>Resumen de pago</strong><span>Producto: ${product}</span>`;
        openModal();
      });
    });
    const cancelPay=document.getElementById('cancelPay'),confirmPay=document.getElementById('confirmPay');
    if(cancelPay) cancelPay.addEventListener('click',closeModal);
    if(confirmPay) confirmPay.addEventListener('click',()=>{
      const number=card.value.replace(/\s/g,''),[mm,yy]=(exp.value||'').split('/');const ok=mm&&yy&&Number(mm)>=1&&Number(mm)<=12&&yy.length===2;
      if(!luhn(number)){payMsg.style.color='#c00';payMsg.textContent='Tarjeta inválida (usa 4242 4242 4242 4242 para probar).';return;}
      if(!ok){payMsg.style.color='#c00';payMsg.textContent='Vencimiento inválido.';return;}
      if(cvv.value.length<3){payMsg.style.color='#c00';payMsg.textContent='CVV inválido.';return;}
      if((holder.value||'').trim().length<3){payMsg.style.color='#c00';payMsg.textContent='Ingresa el titular.';return;}
      payMsg.style.color='#0a0';payMsg.textContent='Pago aprobado (DEMO).';setTimeout(closeModal,1400);
    });

    /* Init */
    renderCal();
  }
})();
