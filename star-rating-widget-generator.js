
//<![CDATA[
(function(){
  "use strict";

  var root=document.getElementById("bhRatingGenerator");
  if(!root){return;}

  var ids={
    domain:"bhgDomain",
    domainHelp:"bhgDomainHelp",
    generateRules:"bhgGenerateRules",
    copyRules:"bhgCopyRules",
    rulesOutput:"bhgRulesOutput",
    rulesStatus:"bhgRulesStatus",
    firebaseUrl:"bhgFirebaseUrl",
    platform:"bhgPlatform",
    scope:"bhgScope",
    customWrap:"bhgCustomWrap",
    customId:"bhgCustomId",
    platformHelp:"bhgPlatformHelp",
    checkFirebase:"bhgCheckFirebase",
    connectionStatus:"bhgConnectionStatus",
    matchWarning:"bhgMatchWarning",
    icon:"bhgIcon",
    max:"bhgMax",
    align:"bhgAlign",
    iconSize:"bhgIconSize",
    textSize:"bhgTextSize",
    font:"bhgFont",
    iconColor:"bhgIconColor",
    iconColorText:"bhgIconColorText",
    textColor:"bhgTextColor",
    textColorText:"bhgTextColorText",
    topText:"bhgTopText",
    bottomText:"bhgBottomText",
    noRatings:"bhgNoRatings",
    message:"bhgMessage",
    bold:"bhgBold",
    card:"bhgCard",
    lock:"bhgLock",
    resetPreview:"bhgResetPreview",
    previewBox:"bhgPreviewBox",
    previewTop:"bhgPreviewTop",
    previewIcons:"bhgPreviewIcons",
    previewBottom:"bhgPreviewBottom",
    previewMessage:"bhgPreviewMessage",
    codeOutput:"bhgCodeOutput",
    codeStatus:"bhgCodeStatus",
    copyCode:"bhgCopyCode",
    resetAll:"bhgResetAll"
  };

  var el={};
  Object.keys(ids).forEach(function(key){el[key]=document.getElementById(ids[key]);});

  var defaults={
    platform:"blogger-post",
    scope:"page",
    icon:"star",
    max:"5",
    align:"center",
    iconSize:"32",
    textSize:"16",
    font:"inherit",
    iconColor:"#fbbf24",
    textColor:"#1f2937",
    topText:"How helpful was this page?",
    bottomText:"Average: $average$/$max$ ($votes$ $ratingWord$)",
    noRatings:"Be the first to rate this page!",
    message:"Your rating is $userRating$ out of $max$."
  };

  var iconColors={
    star:"#fbbf24",
    heart:"#ef4444",
    thumb:"#3b82f6"
  };

  var fontMap={
    inherit:"inherit",
    system:"system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    arial:"Arial,sans-serif",
    verdana:"Verdana,sans-serif",
    tahoma:"Tahoma,sans-serif",
    trebuchet:"'Trebuchet MS',sans-serif",
    georgia:"Georgia,serif",
    times:"'Times New Roman',serif"
  };

  var generatedDomain="";
  var checkedFirebase="";
  var checkedDomain="";
  var previewSelected=0;
  var previewHover=0;
  var installationId="bh"+randomId().slice(0,8);

  function randomId(){
    var value="";
    if(window.crypto&&window.crypto.getRandomValues){
      var bytes=new Uint32Array(2);
      window.crypto.getRandomValues(bytes);
      value=bytes[0].toString(36)+bytes[1].toString(36);
    }else{
      value=Date.now().toString(36)+Math.floor(Math.random()*1000000).toString(36);
    }
    return value.slice(0,18);
  }

  function normalizeDomain(value){
    var text=String(value||"").trim();
    if(!text){return {ok:false,value:"",error:"Enter your website domain or home-page URL."};}
    if(text.indexOf("://")===-1){text="https://"+text;}
    try{
      var url=new URL(text);
      var host=String(url.hostname||"").toLowerCase();
      if(host.slice(0,4)==="www."){host=host.slice(4);}
      host=host.replace(/\.$/,"");
      if(!/^https?:$/.test(url.protocol)||url.username||url.password||!host||host.indexOf(".")===-1){throw new Error("domain");}
      return {ok:true,value:host,url:"https://"+host};
    }catch(error){
      return {ok:false,value:"",error:"Enter a valid domain such as example.com."};
    }
  }

  function normalizeFirebaseUrl(value){
    var text=String(value||"").trim();
    if(!text){return {ok:false,value:"",error:"Enter your Firebase Realtime Database URL."};}
    if(text.indexOf("://")===-1){text="https://"+text;}
    try{
      var url=new URL(text);
      var host=String(url.hostname||"").toLowerCase();
      var validHost=host.endsWith(".firebaseio.com")||host.endsWith(".firebasedatabase.app");
      if(url.protocol!=="https:"||!validHost||url.username||url.password||url.port){throw new Error("firebase");}
      return {ok:true,value:"https://"+host};
    }catch(error){
      return {ok:false,value:"",error:"Use a valid firebaseio.com or firebasedatabase.app Database URL."};
    }
  }

  function hashText(value){
    var hash=2166136261;
    var text=String(value||"");
    for(var i=0;i<text.length;i+=1){
      hash^=text.charCodeAt(i);
      hash=Math.imul(hash,16777619);
    }
    return (hash>>>0).toString(16).padStart(8,"0");
  }

  function clampNumber(value,min,max,fallback){
    var number=parseInt(value,10);
    if(!isFinite(number)){number=fallback;}
    return Math.max(min,Math.min(max,number));
  }

  function validHex(value,fallback){
    var text=String(value||"").trim();
    if(/^#[0-9a-fA-F]{6}$/.test(text)){return text.toLowerCase();}
    return fallback;
  }

  function cleanCustomId(value){
    var text=String(value||"").trim().toLowerCase();
    text=text.replace(/[^a-z0-9_-]+/g,"-").replace(/^-+|-+$/g,"");
    return text.slice(0,80);
  }

  function setStatus(target,type,message){
    target.className="bhg-status bhg-note bhg-show";
    if(type==="success"){target.className+=" bhg-note-success";}
    if(type==="error"){target.className+=" bhg-note-error";}
    if(type==="warning"){target.className+=" bhg-note-warning";}
    target.querySelector("p").textContent=message;
  }

  function clearStatus(target){
    target.className="bhg-status bhg-note";
    target.querySelector("p").textContent="";
  }

  function showNormalizedDomain(){
    var result=normalizeDomain(el.domain.value);
    if(!String(el.domain.value||"").trim()){
      el.domainHelp.textContent="";
    }else if(result.ok){
      el.domainHelp.textContent="Normalized domain: "+result.value;
    }else{
      el.domainHelp.textContent=result.error;
    }
  }

  function buildScaleRules(max){
    var oldVotes="(data.exists() ? data.child('votes').val() + 1 : 1)";
    var oldMinimum="(data.exists() ? data.child('totalScore').val() + 1 : 1)";
    var oldMaximum="(data.exists() ? data.child('totalScore').val() + "+max+" : "+max+")";
    return {
      "$scope":{
        ".read":true,
        ".write":"newData.hasChildren(['votes','totalScore']) && newData.child('votes').isNumber() && newData.child('totalScore').isNumber() && newData.child('votes').val() == "+oldVotes+" && newData.child('totalScore').val() >= "+oldMinimum+" && newData.child('totalScore').val() <= "+oldMaximum,
        "votes":{
          ".validate":"newData.isNumber() && newData.val() > 0 && newData.val() % 1 == 0"
        },
        "totalScore":{
          ".validate":"newData.isNumber() && newData.val() > 0 && newData.val() % 1 == 0"
        },
        "$other":{
          ".validate":false
        }
      }
    };
  }

  function generateRules(){
    var domain=normalizeDomain(el.domain.value);
    if(!domain.ok){
      generatedDomain="";
      el.rulesOutput.value="";
      el.copyRules.disabled=true;
      setStatus(el.rulesStatus,"error",domain.error);
      updateAll();
      el.domain.focus();
      return;
    }

    var siteKey="site_"+hashText(domain.value);
    var rules={rules:{".read":false,".write":false,bhratings_v1:{}}};
    rules.rules.bhratings_v1[siteKey]={
      max3:buildScaleRules(3),
      max5:buildScaleRules(5),
      max10:buildScaleRules(10)
    };

    el.domain.value=domain.url;
    generatedDomain=domain.value;
    checkedFirebase="";
    checkedDomain="";
    el.rulesOutput.value=JSON.stringify(rules,null,2);
    el.copyRules.disabled=false;
    setStatus(el.rulesStatus,"success","Rules generated for "+domain.value+". Copy them into Firebase Realtime Database > Rules and click Publish.");
    updateAll();
  }

  function fallbackCopy(textarea){
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0,textarea.value.length);
    try{return document.execCommand("copy");}catch(error){return false;}
  }

  function copyText(textarea,statusTarget,successMessage){
    var value=String(textarea.value||"");
    if(!value){
      setStatus(statusTarget,"error","There is no code to copy yet.");
      return;
    }
    if(navigator.clipboard&&window.isSecureContext){
      navigator.clipboard.writeText(value).then(function(){
        setStatus(statusTarget,"success",successMessage);
      }).catch(function(){
        if(fallbackCopy(textarea)){
          setStatus(statusTarget,"success",successMessage);
        }else{
          setStatus(statusTarget,"warning","Automatic copying was blocked. The code has been selected; copy it manually.");
        }
      });
    }else if(fallbackCopy(textarea)){
      setStatus(statusTarget,"success",successMessage);
    }else{
      setStatus(statusTarget,"warning","Automatic copying was blocked. The code has been selected; copy it manually.");
    }
  }

  function updatePlatformHelp(){
    var text="";
    if(el.platform.value==="blogger-post"){
      text="Blogger Page/Post: open the page or post editor, switch to HTML View, and paste the complete generated code exactly where the rating widget should appear.";
    }else if(el.platform.value==="blogger-theme"){
      text="Blogger Theme: first back up your theme. Open Theme > Edit HTML, locate the post body area (often <data:post.body/>), and paste the generated XML-safe code immediately after the appropriate post-body occurrence. It is automatically limited to individual post pages.";
    }else if(el.platform.value==="wordpress"){
      text="WordPress: paste into a Custom HTML block using an account allowed to publish JavaScript. Some hosted plans or security settings remove scripts; check the published page.";
    }else{
      text="Normal Website: paste the complete generated code into the HTML exactly where the rating widget should appear, preferably before the closing body tag when placement is controlled by a separate container.";
    }
    el.platformHelp.textContent=text;
  }

  function updateCustomScope(){
    if(el.scope.value==="custom"){
      el.customWrap.classList.add("bhg-show");
    }else{
      el.customWrap.classList.remove("bhg-show");
    }
  }

  function getIconShape(name){
    if(name==="heart"){
      return '<path d="M12 21.1C10.9 20.1 4 14.1 4 8.7A4.7 4.7 0 0 1 12 5.3 4.7 4.7 0 0 1 20 8.7c0 5.4-6.9 11.4-8 12.4Z"/>';
    }
    if(name==="thumb"){
      return '<path d="M9 21H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h4v11Zm2 0V10l3.1-6.2c.4-.8 1.4-1.1 2.2-.6.5.3.8.8.8 1.4V9h2.7a2.2 2.2 0 0 1 2.1 2.8l-2 7A3 3 0 0 1 17 21h-6Z"/>';
    }
    return '<path d="m12 2.5 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9L12 2.5Z"/>';
  }

  function svgMarkup(icon){
    return '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">'+getIconShape(icon)+'</svg>';
  }

  function formatAverage(total,votes,max){
    if(!votes){return "0";}
    var average=total/votes;
    average=Math.max(0,Math.min(max,average));
    var rounded=Math.round(average*10)/10;
    return String(rounded);
  }

  function formatCount(value){
    try{return new Intl.NumberFormat().format(value);}catch(error){return String(value);}
  }

  function replaceTokens(template,data){
    var text=String(template||"");
    var values={
      "$average$":data.average,
      "$averageRating$":data.average,
      "$max$":String(data.max),
      "$maxRating$":String(data.max),
      "$votes$":data.votes,
      "$totalRatings$":data.votes,
      "$ratingWord$":data.rawVotes===1?"rating":"ratings",
      "$userRating$":data.userRating?String(data.userRating):""
    };
    Object.keys(values).forEach(function(token){text=text.split(token).join(values[token]);});
    return text;
  }

  function renderPreview(){
    var max=parseInt(el.max.value,10)||5;
    var size=clampNumber(el.iconSize.value,16,72,32);
    var textSize=clampNumber(el.textSize.value,10,32,16);
    var iconColor=validHex(el.iconColorText.value,defaults.iconColor);
    var textColor=validHex(el.textColorText.value,defaults.textColor);
    var votes=1254;
    var total=Math.round(votes*max*.82);
    var averageValue=total/votes;
    var fillValue=previewSelected||previewHover||Math.round(averageValue);
    var data={
      average:formatAverage(total,votes,max),
      max:max,
      votes:formatCount(votes),
      rawVotes:votes,
      userRating:previewSelected
    };

    el.previewBox.dataset.align=el.align.value;
    el.previewBox.dataset.bold=el.bold.checked?"yes":"no";
    el.previewBox.dataset.card=el.card.checked?"yes":"no";
    el.previewBox.style.setProperty("--bh-preview-icon-size",size+"px");
    el.previewBox.style.setProperty("--bh-preview-icon-color",iconColor);
    el.previewBox.style.setProperty("--bh-preview-text-size",textSize+"px");
    el.previewBox.style.setProperty("--bh-preview-text",textColor);
    el.previewBox.style.setProperty("--bh-preview-font",fontMap[el.font.value]||fontMap.arial);
    el.previewBox.style.setProperty("--bh-preview-row-max",(max*Math.max(24,size))+"px");

    el.previewTop.textContent=replaceTokens(el.topText.value,data);
    el.previewTop.style.display=String(el.topText.value||"").trim()?"block":"none";
    el.previewBottom.textContent=replaceTokens(el.bottomText.value,data);
    el.previewBottom.style.display=String(el.bottomText.value||"").trim()?"block":"none";
    el.previewMessage.textContent=previewSelected?replaceTokens(el.message.value,data):"";
    el.previewMessage.hidden=!previewSelected||!el.message.value.trim();

    el.previewIcons.innerHTML="";
    for(var rating=1;rating<=max;rating+=1){
      var button=document.createElement("button");
      button.type="button";
      button.className="bhg-preview-rate"+(rating<=fillValue?" bhg-active":"");
      button.setAttribute("role","radio");
      button.setAttribute("aria-label","Rate "+rating+" out of "+max);
      button.setAttribute("aria-checked",previewSelected===rating?"true":"false");
      button.dataset.rating=String(rating);
      button.disabled=previewSelected>0;
      button.innerHTML=svgMarkup(el.icon.value);
      button.addEventListener("mouseenter",previewEnter);
      button.addEventListener("focus",previewEnter);
      button.addEventListener("mouseleave",previewLeave);
      button.addEventListener("click",previewClick);
      button.addEventListener("keydown",previewKeydown);
      el.previewIcons.appendChild(button);
    }
  }

  function updatePreviewFills(){
    var max=parseInt(el.max.value,10)||5;
    var fill=previewSelected||previewHover||Math.round(max*.82);
    var items=el.previewIcons.children;
    for(var i=0;i<items.length;i++){items[i].classList.toggle("bhg-active",i<fill);}
  }

  function previewEnter(event){
    if(previewSelected){return;}
    previewHover=parseInt(event.currentTarget.dataset.rating,10)||0;
    updatePreviewFills();
  }

  function previewLeave(){
    if(previewSelected){return;}
    previewHover=0;
    updatePreviewFills();
  }

  function previewClick(event){
    if(previewSelected){return;}
    previewSelected=parseInt(event.currentTarget.dataset.rating,10)||0;
    previewHover=0;
    renderPreview();
  }

  function previewKeydown(event){
    if(previewSelected){return;}
    var max=parseInt(el.max.value,10)||5;
    var rating=parseInt(event.currentTarget.dataset.rating,10)||1;
    var next=rating;
    if(event.key==="ArrowRight"||event.key==="ArrowUp"){next=Math.min(max,rating+1);}
    else if(event.key==="ArrowLeft"||event.key==="ArrowDown"){next=Math.max(1,rating-1);}
    else if(event.key==="Home"){next=1;}
    else if(event.key==="End"){next=max;}
    else{return;}
    event.preventDefault();
    previewHover=next;
    updatePreviewFills();
    var target=el.previewIcons.querySelector('[data-rating="'+next+'"]');
    if(target){target.focus();}
  }

  function collectConfig(){
    var domain=normalizeDomain(el.domain.value);
    var firebase=normalizeFirebaseUrl(el.firebaseUrl.value);
    var customId=cleanCustomId(el.customId.value);
    var max=parseInt(el.max.value,10)||5;
    if([3,5,10].indexOf(max)===-1){max=5;}
    return {
      valid:domain.ok&&firebase.ok&&(el.scope.value!=="custom"||!!customId),
      domain:domain,
      firebase:firebase,
      siteKey:domain.ok?"site_"+hashText(domain.value):"",
      platform:el.platform.value,
      scope:el.scope.value,
      customId:customId,
      icon:el.icon.value,
      max:max,
      align:el.align.value,
      iconSize:clampNumber(el.iconSize.value,16,72,32),
      textSize:clampNumber(el.textSize.value,10,32,16),
      font:fontMap[el.font.value]||fontMap.arial,
      iconColor:validHex(el.iconColorText.value,defaults.iconColor),
      textColor:validHex(el.textColorText.value,defaults.textColor),
      topText:String(el.topText.value||""),
      bottomText:String(el.bottomText.value||""),
      noRatings:String(el.noRatings.value||""),
      message:String(el.message.value||""),
      bold:el.bold.checked,
      card:el.card.checked,
      lock:el.lock.checked
    };
  }

  function safeJson(value){
    return JSON.stringify(value)
      .split("<").join("\\u003c")
      .split(">").join("\\u003e")
      .split("&").join("\\u0026")
      .split("\u2028").join("\\u2028")
      .split("\u2029").join("\\u2029");
  }

  function reducedWidgetRuntime(C){
    "use strict";
    var r=document.currentScript.previousElementSibling;
    BHLOCK();
    var w=r.querySelector('.bh-r'),a=[],m=BHMAX,v=0,h=0,q=0,rev=0,d={votes:0,totalScore:0},ready=0;
    function H(x){var n=2166136261;for(var i=0;i<x.length;i++){n=Math.imul(n^x.charCodeAt(i),16777619);}return(n>>>0).toString(16);}
    var k=BHKEY,u=C.d+k+'.json',s=BHSTORE+k;
    function P(k,x){var p=r.querySelector('.bh-'+k);if(!x){if(p){p.remove();}return;}if(!p){p=document.createElement('p');p.className='bh-p bh-'+k;if(k==='s'){p.setAttribute('role','status');}r.insertBefore(p,BHINSERT);}p.textContent=x;}
    BHTOKENFUNCTION();
    function draw(){
      var n=v||h||(ready&&d.votes?Math.round(d.totalScore/d.votes):0);
      a.forEach(function(b,i){b.classList.toggle('bh-on',i<n);b.disabled=!!v||!!q;b.setAttribute('aria-checked',v===i+1);b.tabIndex=i===(h||1)-1?0:-1;});
      BHTEXT();
    }
    function set(x){d=x||{votes:0,totalScore:0};ready=1;draw();}
    function result(x){if(!x.ok){throw Error();}return x.json();}
    function vote(n){
      if(v||q){return;}
      try{var old=JSON.parse(localStorage.getItem(s));if(old&&old.rating>=1&&old.rating<=m){v=+old.rating;draw();BHMESSAGE();return;}}catch(e){}
      q=1;rev++;h=n;P('s','');draw();
      fetch(u,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({votes:{'.sv':{increment:1}},totalScore:{'.sv':{increment:n}}})}).then(result).then(function(x){v=n;q=0;h=0;set(x);try{localStorage.setItem(s,JSON.stringify({rating:n,v:1}));}catch(e){}BHMESSAGE();}).catch(function(){q=0;h=0;draw();P('s','Rating failed.');});
    }
    for(var i=1;i<=m;i++){
      (function(n){var b=document.createElement('button');b.type='button';b.setAttribute('role','radio');b.setAttribute('aria-label','Rate '+n+' out of '+m);b.innerHTML=C.i;
      b.onmouseenter=b.onfocus=function(){if(!v&&!q){h=n;draw();}};
      b.onclick=function(){vote(n);};
      b.onkeydown=function(e){var j=n,t=e.key;if(t==='ArrowRight'||t==='ArrowUp'){j=Math.min(m,n+1);}else if(t==='ArrowLeft'||t==='ArrowDown'){j=Math.max(1,n-1);}else if(t==='Home'){j=1;}else if(t==='End'){j=m;}else{return;}e.preventDefault();a[j-1].focus();};
      a.push(b);w.appendChild(b);})(i);
    }
    w.onmouseleave=w.onfocusout=function(){h=0;draw();};
    try{var old=JSON.parse(localStorage.getItem(s));if(old&&old.rating>=1&&old.rating<=m){v=+old.rating;}}catch(e){}
    draw();BHMESSAGE();
    fetch(u,{cache:'no-store'}).then(result).then(function(x){if(!rev){set(x);}}).catch(function(){if(!rev){P('s','Ratings unavailable.');}});
  }

  function escapeHtml(value){return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}

  function buildGeneratedCode(c){
    var id=installationId,x='#'+id;
    var data={d:c.firebase.value+'/bhratings_v1/'+c.siteKey+'/max'+c.max+'/',i:'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+getIconShape(c.icon)+'</svg>'};
    var all='';
    [['t',c.topText],['b',c.bottomText],['n',c.noRatings],['y',c.message]].forEach(function(pair){if(pair[1].trim()){data[pair[0]]=pair[1];all+=pair[1];}});
    var values=[];
    if(all.indexOf('$average$')>=0){values.push('average:d.votes?String(Math.round(Math.max(0,Math.min(m,d.totalScore/d.votes))*10)/10):"0"');}
    if(all.indexOf('$votes$')>=0){values.push('votes:d.votes.toLocaleString()');}
    if(all.indexOf('$ratingWord$')>=0){values.push('ratingWord:d.votes===1?"rating":"ratings"');}
    if(all.indexOf('$max$')>=0){values.push('max:m');}
    if(all.indexOf('$userRating$')>=0){values.push('userRating:v||""');}
    function text(key){return values.length?'T(C.'+key+')':'C.'+key;}
    var runtime=reducedWidgetRuntime.toString().replace('function reducedWidgetRuntime','function');
    var page="(function(){var p=r.getAttribute('data-bh-post');if(p){return 'p_'+p;}var l=document.querySelector('link[rel=canonical]'),z=new URL(l&&l.href||location.href,location.href);return 'p_'+H(z.hostname.toLowerCase().replace(/^www\\./,'')+(z.pathname.replace(/\\/+$/,'')||'/'));})()";
    var k=c.scope==='site'?'global':c.scope==='custom'?'custom_'+hashText(c.customId):'';
    runtime=runtime.replace('BHKEY',k?safeJson(k):page).replace('BHMAX',String(c.max)).replace('BHSTORE',safeJson('bhr_v1_'+c.siteKey+'_'+c.max+'_'));
    if(k){runtime=runtime.replace(/    function H\(x\).*\n/,'');}
    if(c.lock){data.h=c.domain.value;}
    var lock=c.lock?"var g=location.hostname.toLowerCase().replace(/\\.$/,'');if(g!==C.h&&!g.endsWith('.'+C.h)){r.remove();return;}r.hidden=false;":'';
    runtime=runtime.replace('BHLOCK();',lock);
    var tokenFn=values.length?'function T(x){var z={'+values.join(',')+'};return x.replace(/\\$(average|max|votes|ratingWord|userRating)\\$/g,function(k,n){return z[n]===undefined?k:String(z[n]);});}':'';
    runtime=runtime.replace('BHTOKENFUNCTION();',tokenFn);
    var txt=data.t?"P('t',"+text('t')+");":'';
    if(data.b||data.n){txt+="if(ready){P('b',d.votes?"+(data.b?text('b'):"''")+":"+(data.n?text('n'):"''")+");}";}
    runtime=runtime.replace('BHTEXT();',txt);
    runtime=runtime.replace('BHINSERT',(data.t?"k==='t'?w:":'')+(data.b||data.n?"k==='b'?r.querySelector('.bh-s'):":'')+'null');
    runtime=runtime.split('BHMESSAGE();').join(data.y?"if(v){P('s',"+text('y')+");}":'');
    runtime=runtime.split('\n').map(function(line){return line.trim();}).join('');
    var style='box-sizing:border-box;max-width:100%;text-align:'+c.align+';font-size:'+c.textSize+'px;color:'+c.textColor;
    if(c.font!=='inherit'){style+=';font-family:'+c.font;}
    if(c.card){style+=';padding:16px;border:1px solid #ddd;border-radius:10px;background:#fff';}
    var css=x+' .bh-p{margin:6px 0!important;padding:0!important;font:inherit;color:inherit;overflow-wrap:anywhere}'+x+' button{box-sizing:border-box;display:inline-flex;flex:0 1 '+Math.max(24,c.iconSize)+'px;min-width:0;min-height:44px;padding:0!important;margin:0!important;border:0!important;background:none!important;box-shadow:none!important;align-items:center;justify-content:center;cursor:pointer;appearance:none}'+x+' button:disabled{opacity:1;cursor:default}'+x+' button:focus-visible{outline:2px solid currentColor;outline-offset:1px}'+x+' svg{display:block;width:'+c.iconSize+'px;max-width:100%;height:auto;aspect-ratio:1;fill:#cbd5e1}'+x+' .bh-on svg{fill:'+c.iconColor+'}';
    if(c.lock){css+=x+'[hidden]{display:none!important}';}
    if(c.bold&&data.t){css+=x+' .bh-t{font-weight:700}';}
    var markup='<div id="'+id+'" style="'+escapeHtml(style)+'"'+(c.lock?' hidden="hidden"':'')+(c.platform==='blogger-theme'?' expr:data-bh-post="data:post.id"':'')+'><div class="bh-r" role="radiogroup" aria-label="Content rating" style="display:flex;gap:0;justify-content:'+({left:'flex-start',center:'center',right:'flex-end'}[c.align])+'"></div></div>';
    runtime='('+runtime+')('+safeJson(data)+');';
    var script='<script>'+ (c.platform==='blogger-theme'?escapeHtml(runtime):runtime)+'</scr'+'ipt>';
    var out='<style>'+css+'</style>'+markup+script;
    return c.platform==='blogger-theme'?'<b:if cond="data:view.isPost">'+out+'</b:if>':out;
  }


  function updateWarnings(config){
    var warning="";
    if(String(el.domain.value||"").trim()&&!config.domain.ok){
      warning=config.domain.error;
    }else if(config.domain.ok&&!generatedDomain){
      warning="Generate and publish Firebase Rules before using the widget code.";
    }else if(config.domain.ok&&generatedDomain&&config.domain.value!==generatedDomain){
      warning="The domain has changed. Your Firebase Rules and widget code no longer match; generate and publish updated Rules.";
    }else if(checkedFirebase&&config.firebase.ok&&(checkedFirebase!==config.firebase.value||checkedDomain!==config.domain.value)){
      warning="The Firebase URL or domain changed after the connection check. Publish the Rules in the current database and check the connection again.";
    }
    if(warning){
      el.matchWarning.classList.add("bhg-show");
      el.matchWarning.querySelector("p").textContent=warning;
    }else{
      el.matchWarning.classList.remove("bhg-show");
      el.matchWarning.querySelector("p").textContent="";
    }
    el.copyRules.disabled=!generatedDomain||!config.domain.ok||config.domain.value!==generatedDomain;
  }

  function updateCode(){
    var config=collectConfig();
    updateWarnings(config);
    if(!config.valid||!generatedDomain||generatedDomain!==config.domain.value){
      el.codeOutput.value="";
      document.getElementById("bhgBytes").textContent="";
      el.copyCode.disabled=true;
      if(el.scope.value==="custom"&&!config.customId&&String(el.customId.value||"").trim()){
        setStatus(el.codeStatus,"error","Enter a Custom Widget ID using letters, numbers, hyphens, or underscores.");
      }else{
        clearStatus(el.codeStatus);
      }
      return;
    }
    el.codeOutput.value=buildGeneratedCode(config);
    document.getElementById("bhgBytes").textContent="("+new Blob([el.codeOutput.value]).size.toLocaleString()+" bytes)";
    el.copyCode.disabled=false;
    clearStatus(el.codeStatus);
  }

  function updateAll(){
    showNormalizedDomain();
    updatePlatformHelp();
    updateCustomScope();
    renderPreview();
    updateCode();
  }

  function checkConnection(){
    var config=collectConfig();
    if(!config.domain.ok){setStatus(el.connectionStatus,"error",config.domain.error);el.domain.focus();return;}
    if(!config.firebase.ok){setStatus(el.connectionStatus,"error",config.firebase.error);el.firebaseUrl.focus();return;}
    if(!generatedDomain||generatedDomain!==config.domain.value){
      setStatus(el.connectionStatus,"error","Generate matching Firebase Rules for the current domain first.");
      return;
    }
    el.firebaseUrl.value=config.firebase.value;
    el.checkFirebase.disabled=true;
    setStatus(el.connectionStatus,"","Checking Firebase connection...");
    var controller=window.AbortController?new AbortController():null;
    var timer=window.setTimeout(function(){if(controller){controller.abort();}},12000);
    var url=config.firebase.value+"/bhratings_v1/"+config.siteKey+"/max"+config.max+"/connection_check.json?shallow=true";
    fetch(url,{method:"GET",cache:"no-store",signal:controller?controller.signal:undefined}).then(function(response){
      if(response.status===401||response.status===403){throw new Error("Firebase permission denied. Paste and publish the generated Rules, then try again.");}
      if(!response.ok){throw new Error("Firebase responded with error "+response.status+". Check the Database URL.");}
      return response.text();
    }).then(function(){
      checkedFirebase=config.firebase.value;
      checkedDomain=config.domain.value;
      setStatus(el.connectionStatus,"success","Firebase connected successfully. The rating path can be read. Make sure the generated Rules are published before accepting ratings.");
    }).catch(function(error){
      var message=error&&error.name==="AbortError"?"Connection timed out. Check your internet connection and Firebase URL.":(error&&error.message?error.message:"Unable to connect to Firebase.");
      setStatus(el.connectionStatus,"error",message);
    }).finally(function(){
      window.clearTimeout(timer);
      el.checkFirebase.disabled=false;
      updateCode();
    });
  }

  function syncColor(source,target,fallback){
    var color=validHex(source.value,fallback);
    source.value=color;
    target.value=color;
  }

  function resetPreview(){
    previewSelected=0;
    previewHover=0;
    renderPreview();
  }

  function resetAll(){
    if(!window.confirm("Reset all generator settings, generated Rules, and widget code?")){return;}
    el.domain.value="";
    el.firebaseUrl.value="";
    el.platform.value=defaults.platform;
    el.scope.value=defaults.scope;
    el.customId.value="";
    el.icon.value=defaults.icon;
    el.max.value=defaults.max;
    el.align.value=defaults.align;
    el.iconSize.value=defaults.iconSize;
    el.textSize.value=defaults.textSize;
    el.font.value=defaults.font;
    el.iconColor.value=defaults.iconColor;
    el.iconColorText.value=defaults.iconColor;
    el.textColor.value=defaults.textColor;
    el.textColorText.value=defaults.textColor;
    el.topText.value=defaults.topText;
    el.bottomText.value=defaults.bottomText;
    el.noRatings.value=defaults.noRatings;
    el.message.value=defaults.message;
    el.bold.checked=false;
    el.card.checked=false;
    el.lock.checked=true;
    el.rulesOutput.value="";
    el.codeOutput.value="";
    generatedDomain="";
    checkedFirebase="";
    checkedDomain="";
    installationId="bh"+randomId().slice(0,8);
    previewSelected=0;
    previewHover=0;
    el.copyRules.disabled=true;
    el.copyCode.disabled=true;
    clearStatus(el.rulesStatus);
    clearStatus(el.connectionStatus);
    clearStatus(el.codeStatus);
    updateAll();
    el.domain.focus();
  }

  el.generateRules.addEventListener("click",generateRules);
  el.copyRules.addEventListener("click",function(){copyText(el.rulesOutput,el.rulesStatus,"Firebase Rules copied.");});
  el.checkFirebase.addEventListener("click",checkConnection);
  el.copyCode.addEventListener("click",function(){copyText(el.codeOutput,el.codeStatus,"Widget code copied.");});
  el.resetPreview.addEventListener("click",resetPreview);
  el.resetAll.addEventListener("click",resetAll);

  el.icon.addEventListener("change",function(){
    var color=iconColors[el.icon.value]||defaults.iconColor;
    el.iconColor.value=color;
    el.iconColorText.value=color;
    previewSelected=0;
    previewHover=0;
    updateAll();
  });

  el.iconColor.addEventListener("input",function(){el.iconColorText.value=el.iconColor.value;updateAll();});
  el.textColor.addEventListener("input",function(){el.textColorText.value=el.textColor.value;updateAll();});
  el.iconColorText.addEventListener("change",function(){syncColor(el.iconColorText,el.iconColor,defaults.iconColor);updateAll();});
  el.textColorText.addEventListener("change",function(){syncColor(el.textColorText,el.textColor,defaults.textColor);updateAll();});

  var watched=[el.domain,el.firebaseUrl,el.platform,el.scope,el.customId,el.max,el.align,el.iconSize,el.textSize,el.font,el.topText,el.bottomText,el.noRatings,el.message,el.bold,el.card,el.lock];
  watched.forEach(function(input){
    input.addEventListener("input",function(){
      if(input===el.max){previewSelected=0;previewHover=0;}
      updateAll();
    });
    input.addEventListener("change",function(){
      if(input===el.max){previewSelected=0;previewHover=0;}
      updateAll();
    });
  });

  updateAll();
})();
//]]>
  
  
  (function(){
"use strict";
var d=["bloggerhelp.in"],h=String(location.hostname||"").toLowerCase().replace(/\.$/,"");
h=h.replace(/^www\./,"");
if(d.indexOf(h)===-1){
var b=document.getElementById("protectedCodes_9ka32p");
if(b){b.textContent="This code is not authorized to run on this website. Visit BloggrHelp.in";}
setTimeout(function(){location.replace("https://www.bloggerhelp.in/p/star-rating-widget-generator.html");},5000);
return;
}
var bx=document.getElementById("protectedCodes_9ka32p");
if(bx){["contextmenu"].forEach(function(n){bx.addEventListener(n,function(e){e.preventDefault();});});}
document.addEventListener("keydown",function(e){var k=String(e.key).toLowerCase();if(k==="f12"||(e.ctrlKey&&(["u","s","p","c"].indexOf(k)!==-1||(e.shiftKey&&["i","j"].indexOf(k)!==-1)))){e.preventDefault();}},true);
})();
