
(function(){
  'use strict';

  var root=document.getElementById('BloggerHelpPostsGenerator');
  if(!root){return;}

  function byId(id){return root.querySelector('#'+id);}
  function valueOf(name){var el=root.querySelector('input[name="'+name+'"]:checked');return el?el.value:'';}
  function clampNumber(id,min,max,fallback){var n=parseInt(byId(id).value,10);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;}
  function checked(id){return !!byId(id).checked;}
  function safeText(value){return String(value==null?'':value);}
  function htmlEscape(value){return safeText(value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
  function jsValue(value){return JSON.stringify(value).replace(/<\//g,'<\\/');}
  function randomSuffix(){
    var letters='abcdefghijklmnopqrstuvwxyz',out='';
    if(window.crypto&&window.crypto.getRandomValues){
      var values=new Uint8Array(2);window.crypto.getRandomValues(values);
      out=letters.charAt(values[0]%26)+letters.charAt(values[1]%26);
    }else{out=letters.charAt(Math.floor(Math.random()*26))+letters.charAt(Math.floor(Math.random()*26));}
    return out;
  }
  function newWidgetId(){byId('bhpg-widget-id').value='BloggerHelpPosts'+randomSuffix();}

  var preview=byId('bhpg-widget-preview');
  var output=byId('bhpg-output');
  var status=byId('bhpg-status');
  var copyButton=byId('bhpg-copy');
  var downloadButton=byId('bhpg-download');
  var lastType='recent';
  var generatedCode='';
  var samples=[
    {title:'How to Create a Better Blogger Website',date:'Sep 17, 2026',label:'Blogger Tips',description:'A practical guide to improving design, speed and usability on a Blogger website.'},
    {title:'Useful SEO Settings Every Blogger Should Check',date:'Sep 14, 2026',label:'SEO',description:'Review the important settings that can help search engines understand your content.'},
    {title:'Simple Ways to Make Blog Posts Easier to Read',date:'Sep 10, 2026',label:'Design',description:'Use clear typography, spacing and helpful page elements for a better reading experience.'},
    {title:'Create Responsive Widgets Without Libraries',date:'Sep 06, 2026',label:'Tutorial',description:'Build lightweight widgets that work smoothly across desktop and mobile Blogger themes.'},
    {title:'How to Organize Labels on a Growing Blog',date:'Sep 02, 2026',label:'Blogger Tips',description:'Keep categories useful for visitors while avoiding clutter and duplicate navigation.'}
  ];

  function setStatus(message,kind){status.textContent=message||'';status.dataset.kind=kind||'';}
  function setCssVar(name,value){preview.style.setProperty(name,value);}
  function shorten(text,max){text=safeText(text);return text.length>max?text.slice(0,Math.max(1,max-1)).trim()+'…':text;}

  function updateConditionalFields(){
    var type=valueOf('bhpg-widget-type');
    byId('bhpg-random-options').hidden=type!=='random';
    if(type!==lastType){
      var heading=byId('bhpg-heading');
      if(heading.value===((lastType==='random')?'Random Posts':'Recent Posts')){heading.value=(type==='random')?'Random Posts':'Recent Posts';}
      lastType=type;
    }
    byId('bhpg-heading-wrap').hidden=!checked('bhpg-show-heading');
    byId('bhpg-description-length-wrap').style.opacity=checked('bhpg-show-description')?'1':'.5';
    byId('bhpg-description-length').disabled=!checked('bhpg-show-description');
    byId('bhpg-fallback-wrap').hidden=byId('bhpg-missing-image').value!=='custom';
    var design=valueOf('bhpg-design');
    byId('bhpg-columns-panel').hidden=['grid','featured','overlay'].indexOf(design)===-1;
    var imageDisabled=design==='minimal';
    byId('bhpg-show-image').disabled=imageDisabled;
    byId('bhpg-missing-image').disabled=imageDisabled||!checked('bhpg-show-image');
    byId('bhpg-thumb-size').disabled=imageDisabled||!checked('bhpg-show-image');
    byId('bhpg-aspect-ratio').disabled=imageDisabled||!checked('bhpg-show-image');
    byId('bhpg-prevent-shift').disabled=imageDisabled||!checked('bhpg-show-image');
  }

  function makePreviewNode(tag,className,text){
    var node=document.createElement(tag);
    if(className){node.className=className;}
    if(text!==undefined){node.textContent=text;}
    return node;
  }

  function renderPreview(){
    updateConditionalFields();
    byId('bhpg-title-length-out').textContent=byId('bhpg-title-length').value;
    byId('bhpg-description-length-out').textContent=byId('bhpg-description-length').value;
    var design=valueOf('bhpg-design');
    var showImage=checked('bhpg-show-image')&&design!=='minimal';
    var showHeading=checked('bhpg-show-heading')&&byId('bhpg-heading').value.trim();
    var count=Math.min(clampNumber('bhpg-post-count',1,20,5),5);
    var align=byId('bhpg-text-align').value;
    preview.dataset.align=align;
    preview.dataset.hover=byId('bhpg-hover-effect').value;
    setCssVar('--p-bg',byId('bhpg-bg-color').value);
    setCssVar('--p-title',byId('bhpg-title-color').value);
    setCssVar('--p-text',byId('bhpg-text-color').value);
    setCssVar('--p-link',byId('bhpg-link-color').value);
    setCssVar('--p-button',byId('bhpg-button-color').value);
    setCssVar('--p-button-text',byId('bhpg-button-text-color').value);
    setCssVar('--p-border',byId('bhpg-border-color').value);
    setCssVar('--p-border-width',clampNumber('bhpg-border-width',0,10,1)+'px');
    setCssVar('--p-border-style',byId('bhpg-border-style').value);
    setCssVar('--p-radius',clampNumber('bhpg-card-radius',0,60,12)+'px');
    setCssVar('--p-gap',clampNumber('bhpg-card-spacing',0,60,14)+'px');
    setCssVar('--p-thumb-radius',clampNumber('bhpg-thumb-radius',0,60,9)+'px');
    setCssVar('--p-title-size',clampNumber('bhpg-title-size',11,36,16)+'px');
    setCssVar('--p-title-weight',byId('bhpg-title-weight').value);
    setCssVar('--p-align',align);
    setCssVar('--p-thumb-size',clampNumber('bhpg-thumb-size',48,800,96)+'px');
    setCssVar('--p-ratio',byId('bhpg-aspect-ratio').value==='auto'?'16/9':byId('bhpg-aspect-ratio').value);
    setCssVar('--p-desktop',byId('bhpg-desktop-cols').value);
    setCssVar('--p-tablet',byId('bhpg-tablet-cols').value);
    setCssVar('--p-mobile',byId('bhpg-mobile-cols').value);
    preview.replaceChildren();
    if(showHeading){preview.appendChild(makePreviewNode('h4','bhpg-preview-heading',byId('bhpg-heading').value.trim()));}
    var list=makePreviewNode('div','bhpg-preview-list');
    list.dataset.design=design;
    for(var i=0;i<count;i++){
      var sample=samples[i%samples.length];
      var card=makePreviewNode('a','bhpg-sample-card');
      card.href='javascript:void(0)';
      card.setAttribute('aria-label',sample.title+' sample preview');
      if(checked('bhpg-show-numbering')){card.appendChild(makePreviewNode('span','bhpg-sample-number',String(i+1)));}
      if(showImage){var media=makePreviewNode('span','bhpg-sample-media');media.dataset.tone=String((i%4)+1);card.appendChild(media);}
      var body=makePreviewNode('span','bhpg-sample-body');
      if(checked('bhpg-show-date')||checked('bhpg-show-label')){
        var meta=makePreviewNode('span','bhpg-sample-meta');
        if(checked('bhpg-show-label')){meta.appendChild(makePreviewNode('span','',sample.label));}
        if(checked('bhpg-show-date')){meta.appendChild(makePreviewNode('span','',sample.date));}
        body.appendChild(meta);
      }
      if(checked('bhpg-show-title')){body.appendChild(makePreviewNode('span','bhpg-sample-title',shorten(sample.title,clampNumber('bhpg-title-length',20,160,80))));}
      if(checked('bhpg-show-description')&&design!=='compact'){body.appendChild(makePreviewNode('span','bhpg-sample-desc',shorten(sample.description,clampNumber('bhpg-description-length',40,300,120))));}
      if(checked('bhpg-show-readmore')){body.appendChild(makePreviewNode('span','bhpg-sample-button','Read More'));}
      card.appendChild(body);list.appendChild(card);
    }
    preview.appendChild(list);
  }

  function normalizeBlogUrl(raw){
    raw=safeText(raw).trim();
    if(!raw){throw new Error('Enter a public Blogger blog URL.');}
    if(!/^https?:\/\//i.test(raw)){raw='https://'+raw;}
    var parsed;
    try{parsed=new URL(raw);}catch(error){throw new Error('Enter a valid Blogger blog URL.');}
    if(parsed.protocol!=='http:'&&parsed.protocol!=='https:'){throw new Error('The blog URL must start with http:// or https://.');}
    return parsed.origin;
  }

  function collectSettings(){
    var design=valueOf('bhpg-design');
    var showImage=checked('bhpg-show-image')&&design!=='minimal';
    var id=byId('bhpg-widget-id').value.trim();
    if(!/^[A-Za-z][A-Za-z0-9_-]{2,47}$/.test(id)){throw new Error('Use 3–48 letters, numbers, hyphens or underscores for the widget identifier, beginning with a letter.');}
    var missing=byId('bhpg-missing-image').value;
    var fallback=byId('bhpg-fallback-image').value.trim();
    if(showImage&&missing==='custom'){
      if(!fallback){throw new Error('Enter the custom fallback image URL.');}
      try{var parsedFallback=new URL(fallback);if(parsedFallback.protocol!=='http:'&&parsedFallback.protocol!=='https:'){throw new Error();}}catch(error){throw new Error('Enter a valid http:// or https:// fallback image URL.');}
    }
    var visible=showImage||checked('bhpg-show-title')||checked('bhpg-show-date')||checked('bhpg-show-description')||checked('bhpg-show-label')||checked('bhpg-show-readmore')||checked('bhpg-show-numbering');
    if(!visible){throw new Error('Select at least one visible post element.');}
    var excluded=byId('bhpg-exclude-labels').value.split(',').map(function(item){return item.trim();}).filter(Boolean);
    return {
      blog:normalizeBlogUrl(byId('bhpg-blog-url').value),
      type:valueOf('bhpg-widget-type'),count:clampNumber('bhpg-post-count',1,20,5),label:byId('bhpg-label-filter').value.trim(),excluded:excluded,
      excludeCurrent:checked('bhpg-exclude-current'),target:valueOf('bhpg-link-target'),randomBehavior:byId('bhpg-random-behavior').value,
      shuffle:checked('bhpg-shuffle-button')&&valueOf('bhpg-widget-type')==='random',id:id,
      showHeading:checked('bhpg-show-heading')&&!!byId('bhpg-heading').value.trim(),heading:byId('bhpg-heading').value.trim(),
      showImage:showImage,showTitle:checked('bhpg-show-title'),showDate:checked('bhpg-show-date'),showDescription:checked('bhpg-show-description'),
      showLabel:checked('bhpg-show-label'),showReadMore:checked('bhpg-show-readmore'),showNumbering:checked('bhpg-show-numbering'),
      titleLength:clampNumber('bhpg-title-length',20,160,80),descriptionLength:clampNumber('bhpg-description-length',40,300,120),
      design:design,thumbSize:clampNumber('bhpg-thumb-size',48,800,96),ratio:byId('bhpg-aspect-ratio').value,missing:missing,fallback:fallback,
      preventShift:checked('bhpg-prevent-shift'),desktopCols:clampNumber('bhpg-desktop-cols',1,4,3),tabletCols:clampNumber('bhpg-tablet-cols',1,4,2),mobileCols:clampNumber('bhpg-mobile-cols',1,4,1),
      bg:byId('bhpg-bg-color').value,titleColor:byId('bhpg-title-color').value,textColor:byId('bhpg-text-color').value,linkColor:byId('bhpg-link-color').value,
      buttonColor:byId('bhpg-button-color').value,buttonTextColor:byId('bhpg-button-text-color').value,borderColor:byId('bhpg-border-color').value,
      borderWidth:clampNumber('bhpg-border-width',0,10,1),borderStyle:byId('bhpg-border-style').value,cardRadius:clampNumber('bhpg-card-radius',0,60,12),
      spacing:clampNumber('bhpg-card-spacing',0,60,14),thumbRadius:clampNumber('bhpg-thumb-radius',0,60,9),titleSize:clampNumber('bhpg-title-size',11,36,16),
      titleWeight:byId('bhpg-title-weight').value,align:byId('bhpg-text-align').value,hover:byId('bhpg-hover-effect').value,
      loading:byId('bhpg-loading-message').value.trim(),empty:byId('bhpg-empty-message').value.trim(),error:byId('bhpg-error-message').value.trim(),hideEmpty:checked('bhpg-hide-empty')
    };
  }

  function ratioNumbers(ratio){
    if(ratio==='4/3'){return [4,3];}if(ratio==='3/2'){return [3,2];}if(ratio==='16/9'){return [16,9];}return [1,1];
  }

  function buildWidgetCss(s){
    var id='#'+s.id,p='.'+s.id+'-';
    var border=s.borderStyle==='none'?'0':' '+s.borderWidth+'px '+s.borderStyle+' '+s.borderColor;
    var aspect=s.ratio==='auto'?'auto':s.ratio;
    var css=[];
    css.push(id+','+id+' *{box-sizing:border-box}');
    css.push(id+'{width:100%;max-width:100%;margin:18px auto;color:'+s.textColor+';font-family:Arial,Helvetica,sans-serif;line-height:1.5;overflow:hidden}');
    css.push(id+' '+p+'heading{margin:0 0 14px;padding:0;color:'+s.titleColor+';font:800 22px/1.25 Arial,Helvetica,sans-serif;text-align:'+s.align+';overflow-wrap:anywhere}');
    css.push(id+' '+p+'list{display:grid;grid-template-columns:1fr;gap:'+s.spacing+'px;min-width:0;width:100%;max-width:100%}');
    css.push(id+' '+p+'card{position:relative;display:block;min-width:0;max-width:100%;overflow:hidden;border:'+border+';border-radius:'+s.cardRadius+'px;background:'+s.bg+';color:'+s.textColor+';text-decoration:none!important;transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease}');
    css.push(id+' '+p+'card:focus-visible{outline:3px solid '+s.linkColor+';outline-offset:2px}');
    css.push(id+' '+p+'body{display:block;min-width:0;padding:13px;text-align:'+s.align+'}');
    css.push(id+' '+p+'title{display:block;margin:0;padding:0;color:'+s.titleColor+';font-size:'+s.titleSize+'px;font-weight:'+s.titleWeight+';line-height:1.35;overflow-wrap:anywhere;word-break:break-word}');
    if(s.showDate||s.showLabel){
      css.push(id+' '+p+'meta{display:flex;flex-wrap:wrap;gap:5px 10px;align-items:center;'+(s.align==='center'?'justify-content:center;':s.align==='right'?'justify-content:flex-end;':'')+'margin:0 0 6px;color:'+s.linkColor+';font-size:11px;font-weight:700;line-height:1.4}');
    }
    if(s.showDescription){css.push(id+' '+p+'desc{display:block;margin:7px 0 0;color:'+s.textColor+';font-size:13px;line-height:1.55;overflow-wrap:anywhere}');}
    if(s.showReadMore){css.push(id+' '+p+'button{display:inline-flex;align-items:center;justify-content:center;min-height:34px;margin-top:10px;padding:7px 12px;border-radius:7px;background:'+s.buttonColor+';color:'+s.buttonTextColor+';font-size:11px;font-weight:800;line-height:1.2}');}
    if(s.showNumbering){css.push(id+' '+p+'number{position:absolute;z-index:4;top:8px;left:8px;display:grid;place-items:center;min-width:26px;height:26px;padding:0 6px;border-radius:999px;background:'+s.linkColor+';color:#fff;font-size:11px;font-weight:800;box-shadow:0 2px 8px rgba(15,23,42,.2)}');}
    if(s.showImage){
      css.push(id+' '+p+'media{position:relative;display:block;overflow:hidden;'+(aspect!=='auto'?'aspect-ratio:'+aspect+';':'')+'border-radius:'+s.thumbRadius+'px;background:#eef2f6}');
      css.push(id+' '+p+'media img{display:block!important;width:100%!important;max-width:100%!important;height:100%!important;margin:0!important;padding:0!important;border:0!important;object-fit:cover;transition:transform .25s ease}');
      css.push(id+' '+p+'placeholder{display:grid;place-items:center;width:100%;height:100%;min-height:70px;padding:8px;background:#eef2f6;color:#8792a5;font-size:11px;font-weight:700;text-align:center}');
    }
    if(['classic','compact'].indexOf(s.design)!==-1){
      css.push(id+' '+p+'card{display:grid;grid-template-columns:min('+s.thumbSize+'px,38%) minmax(0,1fr);align-items:stretch}');
      if(s.showImage){css.push(id+' '+p+'media{width:100%;height:100%;min-height:'+s.thumbSize+'px;border-radius:'+s.thumbRadius+'px 0 0 '+s.thumbRadius+'px}');}
      css.push(id+' '+p+'no-media{grid-template-columns:1fr}');
    }
    if(['grid','featured','overlay'].indexOf(s.design)!==-1){
      css.push(id+' '+p+'list{grid-template-columns:repeat('+s.desktopCols+',minmax(0,1fr))}');
      css.push('@media(max-width:900px){'+id+' '+p+'list{grid-template-columns:repeat('+s.tabletCols+',minmax(0,1fr))}}');
      css.push('@media(max-width:600px){'+id+' '+p+'list{grid-template-columns:repeat('+s.mobileCols+',minmax(0,1fr))}}');
    }
    if((s.design==='grid'||s.design==='featured')&&s.showImage){css.push(id+' '+p+'media{border-radius:'+s.thumbRadius+'px '+s.thumbRadius+'px 0 0}');}
    if(s.design==='featured'){css.push(id+' '+p+'body{padding:17px}');}
    if(s.design==='overlay'){
      css.push(id+' '+p+'card{display:flex;align-items:flex-end;min-height:'+Math.max(170,Math.round(s.thumbSize*1.65))+'px;background:#172033}');
      if(s.showImage){css.push(id+' '+p+'media{position:absolute;inset:0;width:100%;height:100%;border-radius:'+s.cardRadius+'px}'+id+' '+p+'media:after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(15,23,42,.94),rgba(15,23,42,.08) 78%)}');}
      css.push(id+' '+p+'body{position:relative;z-index:2;width:100%;padding:16px}');
      css.push(id+' '+p+'no-media{background:'+s.bg+'}');
    }
    if(s.design==='minimal'){
      css.push(id+' '+p+'card{border-width:0 0 '+(s.borderStyle==='none'?0:s.borderWidth)+'px;border-radius:0;background:transparent;overflow:visible}');
      css.push(id+' '+p+'body{padding:6px 2px 12px}');
    }
    if(s.hover==='lift'){css.push(id+' '+p+'card:hover{transform:translateY(-3px);box-shadow:0 10px 24px rgba(15,23,42,.12)}');}
    if(s.hover==='zoom'&&s.showImage){css.push(id+' '+p+'card:hover '+p+'media img{transform:scale(1.055)}');}
    if(s.hover==='shadow'){css.push(id+' '+p+'card:hover{box-shadow:0 12px 28px rgba(15,23,42,.17)}');}
    if(s.hover==='border'){css.push(id+' '+p+'card:hover{border-color:'+s.linkColor+'}');}
    css.push(id+' '+p+'skeleton{position:relative;display:block;min-height:'+(s.design==='overlay'?Math.max(170,Math.round(s.thumbSize*1.65)):s.design==='minimal'?58:Math.max(82,s.thumbSize))+'px;overflow:hidden;border:'+border+';border-radius:'+s.cardRadius+'px;background:#eef2f6}');
    css.push(id+' '+p+'skeleton:after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.72),transparent);animation:'+s.id+'Shimmer 1.25s infinite}@keyframes '+s.id+'Shimmer{100%{transform:translateX(100%)}}');
    if(s.loading||s.empty||s.error){css.push(id+' '+p+'state{display:block;width:100%;margin:8px 0;padding:12px;border-radius:8px;background:#f6f8fb;color:'+s.textColor+';font-size:13px;text-align:center;overflow-wrap:anywhere}');}
    if(s.shuffle){css.push(id+' '+p+'shuffle{display:inline-flex;align-items:center;justify-content:center;min-height:38px;margin:13px 0 0;padding:8px 14px;border:0;border-radius:8px;background:'+s.buttonColor+';color:'+s.buttonTextColor+';font:800 12px/1.2 Arial,Helvetica,sans-serif;cursor:pointer}'+id+' '+p+'shuffle:disabled{cursor:wait;opacity:.6}'+id+' '+p+'shuffle:focus-visible{outline:3px solid '+s.linkColor+';outline-offset:2px}');}
    css.push('@media(max-width:480px){'+id+' '+p+'card{max-width:100%}'+(s.design==='classic'||s.design==='compact'?id+' '+p+'card{grid-template-columns:min('+Math.min(s.thumbSize,110)+'px,34%) minmax(0,1fr)}':'')+'}');
    return css.join('');
  }

  function skeletonMarkup(s){
    var amount=Math.min(s.count,4),html='';
    for(var i=0;i<amount;i++){html+='<span class="'+s.id+'-skeleton" aria-hidden="true"></span>';}
    return html;
  }

  function buildWidgetScript(s){
    var p=s.id+'-',target=s.target==='new'?'_blank':'_self',rel=s.target==='new'?' rel=\\"noopener noreferrer\\"':'';
    var excluded=s.excluded.map(function(item){return item.toLocaleLowerCase();});
    var quality=Math.max(320,Math.min(1600,s.thumbSize*3));
    var dims=ratioNumbers(s.ratio),imgWidth=quality,imgHeight=Math.round(quality*dims[1]/dims[0]);
    var signature=[s.blog,s.label,s.excluded.join('|'),s.count,s.titleLength,s.descriptionLength].join('::');
    var lines=[];
    lines.push('(function(){"use strict";');
    lines.push('var W=document.getElementById('+jsValue(s.id)+');if(!W){return;}var L=W.querySelector('+jsValue('.'+p+'list')+'),Q=W.querySelector('+jsValue('.'+p+'shuffle')+'),run=0,seq=0;');
    lines.push('var B='+jsValue(s.blog)+',N='+s.count+',F='+jsValue(s.label)+',X='+jsValue(excluded)+',CUR='+String(s.excludeCurrent)+',KEY='+jsValue('BHP:'+s.id+':random')+',SIG='+jsValue(signature)+';');
    lines.push('function E(v){return String(v==null?"":v).replace(/[&<>"\']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\\\"":"&quot;","\'":"&#39;"}[c];});}');
    lines.push('function U(v){try{var u=new URL(v,location.href);return u.hostname.toLowerCase()+u.pathname.replace(/\\/$/,"");}catch(e){return String(v).split(/[?#]/)[0].replace(/^https?:\\/\\//i,"").replace(/\\/$/,"").toLowerCase();}}');
    lines.push('var C=(function(){var x=document.querySelector("link[rel=canonical]");return U(x?x.href:location.href);}());');
    lines.push('function A(e){var a=e.link||[];for(var i=0;i<a.length;i++){if(a[i].rel==="alternate"&&a[i].href){return a[i].href;}}return "";}');
    lines.push('function G(e){return (e.category||[]).map(function(c){return String(c.term||"");});}');
    lines.push('function OK(e){var u=A(e);if(!u||(CUR&&U(u)===C)){return false;}var g=G(e).map(function(x){return x.toLocaleLowerCase();});for(var i=0;i<X.length;i++){if(g.indexOf(X[i])!==-1){return false;}}return true;}');
    lines.push('function CUT(v,n){v=String(v||"").replace(/\\s+/g," ").trim();return v.length>n?v.slice(0,Math.max(1,n-1)).trim()+"…":v;}');
    if(s.showDescription){lines.push('function TXT(v){var d=new DOMParser().parseFromString(String(v||""),"text/html");return (d.body.textContent||"").replace(/\\s+/g," ").trim();}');}
    if(s.showImage){
      lines.push('function IMG(e){var u=e.media$thumbnail&&e.media$thumbnail.url?e.media$thumbnail.url:"";if(!u){var h=(e.content&&e.content.$t)||(e.summary&&e.summary.$t)||"",m=h.match(/<img[^>]+src=["\']([^"\']+)["\']/i);u=m?m[1]:"";}if(u){u=u.replace(/\\/(?:s\\d+(?:-c)?|w\\d+-h\\d+(?:-[^/]+)?)\\//,"/s'+quality+'/").replace(/\\/(?:default|mqdefault)\\.jpg(?:\\?.*)?$/,"/hqdefault.jpg");}return u;}');
    }
    var postFields='var t=(e.title&&e.title.$t)||"Untitled post",u=A(e),o={u:u,f:t,t:CUT(t,'+s.titleLength+'),pos:pos};';
    if(s.showDate){postFields+='o.dt=e.published&&e.published.$t?new Date(e.published.$t).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"}):"";';}
    if(s.showLabel){postFields+='o.g=(G(e)[0]||"");';}
    if(s.showDescription){postFields+='o.d=CUT(TXT((e.content&&e.content.$t)||(e.summary&&e.summary.$t)||""),'+s.descriptionLength+');';}
    if(s.showImage){postFields+='o.im=IMG(e);'+(s.missing==='custom'?'if(!o.im){o.im='+jsValue(s.fallback)+';}':'');}
    postFields+='return o;';
    lines.push('function POST(e,pos){'+postFields+'}');
    lines.push('function J(url){return new Promise(function(resolve,reject){var cb="__'+s.id+'_"+Date.now().toString(36)+"_"+(++seq)+"_"+Math.random().toString(36).slice(2),sc=document.createElement("script"),done=false,t;function end(err,data){if(done){return;}done=true;clearTimeout(t);if(sc.parentNode){sc.parentNode.removeChild(sc);}try{delete window[cb];}catch(x){window[cb]=void 0;}err?reject(err):resolve(data);}window[cb]=function(data){end(null,data);};sc.async=true;sc.src=url+(url.indexOf("?")===-1?"?":"&")+"callback="+encodeURIComponent(cb);sc.onerror=function(){end(new Error("feed"));};t=setTimeout(function(){end(new Error("timeout"));},8000);document.head.appendChild(sc);});}');
    lines.push('function URLF(start,max){return B+"/feeds/posts/default"+(F?"/-/"+encodeURIComponent(F):"")+"?alt=json-in-script&orderby=published&start-index="+start+"&max-results="+max;}');
    lines.push('function TOTAL(d){return Math.max(0,parseInt(d&&d.feed&&d.feed.openSearch$totalResults&&d.feed.openSearch$totalResults.$t,10)||0);}');
    lines.push('function ENTRIES(d){return d&&d.feed&&d.feed.entry?d.feed.entry:[];}');
    if(s.showImage){
      if(s.missing==='placeholder'){
        lines.push('function FIXIMG(){Array.prototype.forEach.call(L.querySelectorAll("img"),function(im){im.addEventListener("error",function(){var m=im.parentNode;if(m){m.innerHTML="<span class=\\"'+p+'placeholder\\">No Image</span>";}},{once:true});});}');
      }else if(s.missing==='custom'){
        lines.push('function FIXIMG(){Array.prototype.forEach.call(L.querySelectorAll("img"),function(im){im.addEventListener("error",function(){if(im.getAttribute("data-fallback")!=="1"){im.setAttribute("data-fallback","1");im.src='+jsValue(s.fallback)+';}else{var m=im.parentNode,c=m&&m.parentNode;if(m){m.remove();}if(c){c.classList.add('+jsValue(p+'no-media')+');}}});});}');
      }else{
        lines.push('function FIXIMG(){Array.prototype.forEach.call(L.querySelectorAll("img"),function(im){im.addEventListener("error",function(){var m=im.parentNode,c=m&&m.parentNode;if(m){m.remove();}if(c){c.classList.add('+jsValue(p+'no-media')+');}},{once:true});});}');
      }
    }
    var mediaCode='var m="";';
    if(s.showImage){
      var dimAttrs=s.preventShift&&s.ratio!=='auto'?' width=\\"'+imgWidth+'\\" height=\\"'+imgHeight+'\\"':'';
      mediaCode+='if(o.im){m="<span class=\\"'+p+'media\\"><img src=\\""+E(o.im)+"\\" alt=\\""+E(o.f)+"\\" loading=\\"lazy\\" decoding=\\"async\\"'+dimAttrs+'></span>";}';
      if(s.missing==='placeholder'){mediaCode+='else{m="<span class=\\"'+p+'media\\" role=\\"img\\" aria-label=\\"No image for "+E(o.f)+"\\"><span class=\\"'+p+'placeholder\\">No Image</span></span>";}';}
    }
    var card='function CARD(o,i){'+mediaCode+'var h="<a class=\\"'+p+'card"+(m?"":" '+p+'no-media")+"\\" role=\\"listitem\\" href=\\""+E(o.u)+"\\" target=\\"'+target+'\\"'+rel+' aria-label=\\""+E(o.f)+"\\">";';
    if(s.showNumbering){card+='h+="<span class=\\"'+p+'number\\">"+(i+1)+"</span>";';}
    if(s.showImage){card+='h+=m;';}
    card+='h+="<span class=\\"'+p+'body\\">";';
    if(s.showDate||s.showLabel){
      card+='h+="<span class=\\"'+p+'meta\\">";';
      if(s.showLabel){card+='if(o.g){h+="<span>"+E(o.g)+"</span>";}';}
      if(s.showDate){card+='if(o.dt){h+="<span>"+E(o.dt)+"</span>";}';}
      card+='h+="</span>";';
    }
    if(s.showTitle){card+='h+="<span class=\\"'+p+'title\\">"+E(o.t)+"</span>";';}
    if(s.showDescription){card+='if(o.d){h+="<span class=\\"'+p+'desc\\">"+E(o.d)+"</span>";}';}
    if(s.showReadMore){card+='h+="<span class=\\"'+p+'button\\">Read More</span>";';}
    card+='return h+="</span></a>";}';
    lines.push(card);
    lines.push('function R(posts){L.innerHTML=posts.map(CARD).join("");W.setAttribute("aria-busy","false");'+(s.loading?'var z=W.querySelector('+jsValue('.'+p+'loading')+');if(z){z.hidden=true;}':'')+(s.showImage?'FIXIMG();':'')+'}');
    lines.push('async function RECENT(){var out=[],seen={},start=1,total=Infinity,batch=Math.min(50,Math.max(10,N*2));while(out.length<N&&start<=total){var d=await J(URLF(start,batch)),es=ENTRIES(d);total=TOTAL(d);for(var i=0;i<es.length&&out.length<N;i++){if(OK(es[i])){var u=U(A(es[i]));if(!seen[u]){seen[u]=1;out.push(POST(es[i],start+i));}}}if(!es.length){break;}start+=batch;}return out;}');
    if(s.type==='random'){
      if(s.randomBehavior==='session'){
        lines.push('function CACHE(){try{var x=JSON.parse(sessionStorage.getItem(KEY)||"null");return x&&x.sig===SIG&&Array.isArray(x.posts)?x:null;}catch(e){return null;}}function SAVE(posts,pos){try{sessionStorage.setItem(KEY,JSON.stringify({sig:SIG,posts:posts,pos:pos}));}catch(e){}}');
      }
      var cacheStart=s.randomBehavior==='session'?'var cache=force?null:CACHE(),out=cache?cache.posts.filter(function(o){return !(CUR&&U(o.u)===C);}):[],used={},stored=cache&&Array.isArray(cache.pos)?cache.pos:[];':'var out=[],used={},stored=[];';
      var cacheSave=s.randomBehavior==='session'?'SAVE(out.slice(0,N),out.slice(0,N).map(function(o){return o.pos;}));':'';
      lines.push('async function RANDOM(force){'+cacheStart+'for(var a=0;a<stored.length;a++){used[stored[a]]=1;}if(out.length>=N){return out.slice(0,N);}var first=await J(URLF(1,1)),total=TOTAL(first),swap={},left=total;function draw(){while(left>0){var r=Math.floor(Math.random()*left),v=Object.prototype.hasOwnProperty.call(swap,r)?swap[r]:r;left--;swap[r]=Object.prototype.hasOwnProperty.call(swap,left)?swap[left]:left;v++;if(!used[v]){used[v]=1;return v;}}return 0;}while(out.length<N&&left>0){var need=Math.min(6,Math.max(2,N-out.length+1)),pick=[];while(pick.length<need&&left>0){var x=draw();if(x){pick.push(x);}}if(!pick.length){break;}var found=await Promise.all(pick.map(function(pos){return J(URLF(pos,1)).then(function(d){return {pos:pos,e:ENTRIES(d)[0]};});}));for(var i=0;i<found.length&&out.length<N;i++){if(found[i].e&&OK(found[i].e)){var post=POST(found[i].e,found[i].pos),dupe=false;for(var q=0;q<out.length;q++){if(U(out[q].u)===U(post.u)){dupe=true;break;}}if(!dupe){out.push(post);}}}}'+cacheSave+'return out.slice(0,N);}');
    }
    var emptyAction=s.hideEmpty?'W.hidden=true;':'L.innerHTML='+(s.empty?jsValue('<span class="'+p+'state" role="status">'+htmlEscape(s.empty)+'</span>'):'""')+';W.setAttribute("aria-busy","false");';
    var errorAction='L.innerHTML='+(s.error?jsValue('<span class="'+p+'state" role="alert">'+htmlEscape(s.error)+'</span>'):'""')+';W.setAttribute("aria-busy","false");';
    lines.push('var SK='+jsValue(skeletonMarkup(s))+';function LOAD(){W.hidden=false;W.setAttribute("aria-busy","true");L.innerHTML=SK;'+(s.loading?'var z=W.querySelector('+jsValue('.'+p+'loading')+');if(z){z.hidden=false;}':'')+'if(Q){Q.disabled=true;}}');
    lines.push('function EMPTY(){'+emptyAction+'if(Q){Q.disabled=false;}}function ERROR(e){'+errorAction+'if(Q){Q.disabled=false;}if(window.console&&console.warn){console.warn("'+s.id+' posts widget:",e);}}');
    lines.push('async function GO(force){var token=++run;LOAD();var timer=setTimeout(function(){if(token===run){run++;ERROR(new Error("loading timeout"));}},15000);try{var posts=await '+(s.type==='random'?'RANDOM(!!force)':'RECENT()')+';if(token!==run){return;}clearTimeout(timer);if(!posts.length){EMPTY();return;}R(posts);if(Q){Q.disabled=false;}}catch(e){if(token!==run){return;}clearTimeout(timer);ERROR(e);}}');
    if(s.shuffle){lines.push('Q.addEventListener("click",function(){'+(s.randomBehavior==='session'?'try{sessionStorage.removeItem(KEY);}catch(e){}':'')+'GO(true);});');}
    lines.push('GO(false);}());');
    return lines.join('');
  }

  function buildWidgetCode(s){
    var css=buildWidgetCss(s),p=s.id+'-',heading=s.showHeading?'<h2 class="'+p+'heading">'+htmlEscape(s.heading)+'</h2>':'';
    var loading=s.loading?'<span class="'+p+'state '+p+'loading" role="status">'+htmlEscape(s.loading)+'</span>':'';
    var shuffle=s.shuffle?'<button class="'+p+'shuffle" type="button">Shuffle Posts</button>':'';
    var aria=htmlEscape(s.heading||(s.type==='random'?'Random Posts':'Recent Posts'));
    var styleOpen='<sty'+'le id="'+s.id+'-styles">',styleClose='</sty'+'le>';
    var scriptOpen='<scr'+'ipt>',scriptClose='</scr'+'ipt>';
    return styleOpen+css+styleClose+'\n<section id="'+s.id+'" aria-label="'+aria+'" aria-busy="true">'+heading+'<div class="'+p+'list" role="list" aria-live="polite">'+skeletonMarkup(s)+'</div>'+loading+shuffle+'</section>\n'+scriptOpen+buildWidgetScript(s)+scriptClose;
  }

  function updateCodeSize(){
    var bytes=new Blob([generatedCode]).size;
    byId('bhpg-code-size').textContent=bytes<1024?bytes+' B':(bytes/1024).toFixed(1)+' KB';
  }

  function generate(){
    try{
      var settings=collectSettings();
      generatedCode=buildWidgetCode(settings);
      output.value=generatedCode;
      copyButton.disabled=false;downloadButton.disabled=false;updateCodeSize();
      setStatus('Widget code generated successfully.','success');
    }catch(error){generatedCode='';output.value='';copyButton.disabled=true;downloadButton.disabled=true;updateCodeSize();setStatus(error.message||'Unable to generate code.','error');}
  }

  async function copyCode(){
    if(!generatedCode){return;}
    try{
      if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(generatedCode);}else{output.focus();output.select();if(!document.execCommand('copy')){throw new Error();}}
      setStatus('Code copied to the clipboard.','success');
    }catch(error){setStatus('Copy failed. Select the code and copy it manually.','error');}
  }

  function downloadCode(){
    if(!generatedCode){return;}
    var id=byId('bhpg-widget-id').value.trim()||'BloggerHelpPosts';
    var blob=new Blob([generatedCode],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='blogger-posts-widget-'+id+'.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);
    setStatus('Text file downloaded.','success');
  }

  var designDefaults={
    'bhpg-bg-color':'#ffffff','bhpg-title-color':'#172033','bhpg-text-color':'#5b6475','bhpg-link-color':'#2563eb','bhpg-button-color':'#2563eb','bhpg-button-text-color':'#ffffff','bhpg-border-color':'#e5e7eb',
    'bhpg-border-width':'1','bhpg-border-style':'solid','bhpg-card-radius':'12','bhpg-card-spacing':'14','bhpg-thumb-radius':'9','bhpg-title-size':'16','bhpg-title-weight':'700','bhpg-text-align':'left','bhpg-hover-effect':'lift',
    'bhpg-thumb-size':'96','bhpg-aspect-ratio':'1/1','bhpg-missing-image':'placeholder','bhpg-fallback-image':'','bhpg-desktop-cols':'3','bhpg-tablet-cols':'2','bhpg-mobile-cols':'1'
  };
  function resetDesign(){
    root.querySelector('input[name="bhpg-design"][value="compact"]').checked=true;
    Object.keys(designDefaults).forEach(function(id){byId(id).value=designDefaults[id];});
    byId('bhpg-prevent-shift').checked=true;renderPreview();setStatus('Design settings reset.','success');
  }
  function resetAll(){
    if(!window.confirm('Reset every generator setting and clear the generated code?')){return;}
    byId('bhpg-form').reset();newWidgetId();lastType='recent';generatedCode='';output.value='';copyButton.disabled=true;downloadButton.disabled=true;updateCodeSize();renderPreview();setStatus('All settings reset.','success');
  }

  root.addEventListener('input',function(event){
    if(event.target&&event.target.matches('input,select,textarea')){renderPreview();if(generatedCode){setStatus('Settings changed. Generate the code again to update it.','');}}
  });
  root.addEventListener('change',function(event){if(event.target&&event.target.matches('input,select,textarea')){renderPreview();}});
  preview.addEventListener('click',function(event){var link=event.target.closest('a');if(link){event.preventDefault();}});
  byId('bhpg-new-id').addEventListener('click',function(){newWidgetId();renderPreview();setStatus('A new unique identifier was created.','success');});
  byId('bhpg-generate').addEventListener('click',generate);
  copyButton.addEventListener('click',copyCode);
  downloadButton.addEventListener('click',downloadCode);
  byId('bhpg-reset-design').addEventListener('click',resetDesign);
  byId('bhpg-reset-all').addEventListener('click',resetAll);
  newWidgetId();renderPreview();updateCodeSize();
}());

function _0x18b3(){var _0x59ff3e=['textConten','ecent-and-','tml','t-widget-g','1223632ocFPaH','replace','th\x20copyrig','MhoJj','hts','toLowerCas','by\x20Blogger','fTqDP','w.bloggerh','BwnOn','QZwJd','1682786EvtleK','elp.in/p/r','NfJhm','hostname','3127914DPPJgA','ojfaL','475629Ryvabn','omwidgetto','random-pos','vpfBh','20IIJWBt','371796NFivar','split','p.in','enerator.h','Help.in\x20wi','developed\x20','MBIAD','This\x20tool\x20','4gmEtlu','12IJPXUM','https://ww','QCVBr','recentrand','indexOf','585786MwOVIT','ById','getElement','9409240dNkhCT','bloggerhel','2|1|3|0|4'];_0x18b3=function(){return _0x59ff3e;};return _0x18b3();}function _0x4349(_0x5e6f92,_0x2fb5d3){_0x5e6f92=_0x5e6f92-(-0x1e87+-0x127*0x5+0x6*0x623);var _0x313691=_0x18b3();var _0x3b19f4=_0x313691[_0x5e6f92];return _0x3b19f4;}(function(_0x45a8e7,_0x6a57c9){var _0x14863f=_0x4349,_0x91516e=_0x45a8e7();while(!![]){try{var _0x5e4a3d=parseInt(_0x14863f(0xac))/(-0x19c9+-0x1f06*0x1+0x38d0)+-parseInt(_0x14863f(0xa6))/(-0x101f+-0x19b4+-0x1*-0x29d5)*(parseInt(_0x14863f(0x99))/(-0x1124+-0xffb*0x1+-0x1*-0x2122))+-parseInt(_0x14863f(0x9e))/(-0x8fd+-0x61*-0x53+-0x1672)*(-parseInt(_0x14863f(0x9d))/(0x402*0x4+0x1095+-0x4*0x826))+parseInt(_0x14863f(0xa7))/(-0xe5b+-0x807+0x1668)*(parseInt(_0x14863f(0x93))/(-0x2467+0x395*-0x7+0x3d81*0x1))+-parseInt(_0x14863f(0x88))/(-0x18a+-0x11e5+-0x21*-0x97)+parseInt(_0x14863f(0x97))/(-0x1b14+0x1066*0x1+-0xd*-0xd3)+-parseInt(_0x14863f(0xaf))/(0x1b9c+-0x20c3*-0x1+-0x3c55);if(_0x5e4a3d===_0x6a57c9)break;else _0x91516e['push'](_0x91516e['shift']());}catch(_0x5b5c56){_0x91516e['push'](_0x91516e['shift']());}}}(_0x18b3,-0x6d90+-0x1*-0x7172c+-0xf0ec),(function(){'use strict';var _0x58e613=_0x4349,_0x7f979={'vpfBh':_0x58e613(0xb1),'MBIAD':_0x58e613(0xa8)+_0x58e613(0x90)+_0x58e613(0x94)+_0x58e613(0xb3)+_0x58e613(0x9b)+_0x58e613(0xb5)+_0x58e613(0xa1)+_0x58e613(0xb4),'MhoJj':_0x58e613(0xb0)+_0x58e613(0xa0),'QZwJd':function(_0x56829f,_0x5e3742){return _0x56829f(_0x5e3742);},'BwnOn':function(_0x17b8d4,_0x51d362){return _0x17b8d4===_0x51d362;},'QCVBr':_0x58e613(0xaa)+_0x58e613(0x9a)+'ol','fTqDP':_0x58e613(0xa5)+_0x58e613(0xa3)+_0x58e613(0x8e)+_0x58e613(0xa2)+_0x58e613(0x8a)+_0x58e613(0x8c),'ojfaL':function(_0x3f5f70,_0x106982,_0x4490f7){return _0x3f5f70(_0x106982,_0x4490f7);}},_0x473412=_0x7f979[_0x58e613(0x9c)][_0x58e613(0x9f)]('|'),_0xaf3176=0x11ec*-0x1+0x3e5*0x5+-0x18d;while(!![]){switch(_0x473412[_0xaf3176++]){case'0':_0x55f05c=_0x55f05c[_0x58e613(0x89)](/^www\./,'');continue;case'1':'use strict';continue;case'2':var _0x1fd6b5={'NfJhm':_0x7f979[_0x58e613(0xa4)]};continue;case'3':var _0x1ff29f=[_0x7f979[_0x58e613(0x8b)]],_0x55f05c=_0x7f979[_0x58e613(0x92)](String,location[_0x58e613(0x96)]||'')[_0x58e613(0x8d)+'e']()[_0x58e613(0x89)](/\.$/,'');continue;case'4':if(_0x7f979[_0x58e613(0x91)](_0x1ff29f[_0x58e613(0xab)](_0x55f05c),-(-0x5e5*-0x1+-0x5bb+-0x29))){var _0x5bc8b4=document[_0x58e613(0xae)+_0x58e613(0xad)](_0x7f979[_0x58e613(0xa9)]);_0x5bc8b4&&(_0x5bc8b4[_0x58e613(0xb2)+'t']=_0x7f979[_0x58e613(0x8f)]);_0x7f979[_0x58e613(0x98)](setTimeout,function(){var _0x2110a8=_0x58e613;location[_0x2110a8(0x89)](_0x1fd6b5[_0x2110a8(0x95)]);},-0x22fa+-0x133+-0x37b5*-0x1);return;}continue;}break;}}()));
