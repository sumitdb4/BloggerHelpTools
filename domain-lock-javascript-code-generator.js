  
(function(){
  "use strict";

  var root=document.getElementById("frLightDomainLock");
  if(!root){return;}

  function get(id){return document.getElementById(id);}

  var form=get("frldForm");
  var original=get("frldOriginalCode");
  var characterCount=get("frldCharacterCount");
  var domainsField=get("frldDomains");
  var advanced=get("frldAdvanced");
  var errorText=get("frldErrorText");
  var redirectUrl=get("frldRedirectUrl");
  var status=get("frldStatus");
  var result=get("frldResult");
  var output=get("frldOutput");
  var copyButton=get("frldCopy");
  var copyLabel=copyButton.querySelector("span");
  var downloadButton=get("frldDownload");
  var resetButton=get("frldReset");

  function showStatus(message,type){
    status.textContent=message||"";
    status.className="frld-status"+(type?" frld-"+type:"");
    if(message){status.scrollIntoView({behavior:"smooth",block:"nearest"});}
  }

  function updateCharacterCount(){
    var count=original.value.length;
    characterCount.textContent=count+" character"+(count===1?"":"s");
  }

  function selectedMode(){
    var selected=root.querySelector('input[name="frldDomainMode"]:checked');
    return selected?selected.value:"www";
  }

  function normalizeDomain(value,mode){
    var text=String(value||"").trim().toLowerCase();
    if(!text){return "";}
    if(!/^[a-z][a-z0-9+.-]*:\/\//i.test(text)){text="https://"+text;}
    try{
      var parsed=new URL(text);
      var host=String(parsed.hostname||"").toLowerCase().replace(/\.$/,"");
      if(mode==="www"&&host.indexOf("www.")===0){host=host.slice(4);}
      if(!host||host==="localhost"||/^\d{1,3}(\.\d{1,3}){3}$/.test(host)){return "";}
      if(host.length>253||host.indexOf(".")<1||host.indexOf("..")!==-1||!/^[a-z0-9.-]+$/.test(host)){return "";}
      var labels=host.split(".");
      for(var i=0;i<labels.length;i++){
        if(!labels[i]||labels[i].length>63||!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(labels[i])){return "";}
      }
      return host;
    }catch(ignore){return "";}
  }

  function parseDomains(value,mode){
    var lines=String(value||"").split(/\r?\n/);
    var valid=[];
    var invalid=[];
    var seen={};
    for(var i=0;i<lines.length;i++){
      var raw=lines[i].trim();
      if(!raw){continue;}
      var domain=normalizeDomain(raw,mode);
      if(!domain){invalid.push(raw);continue;}
      if(!seen[domain]){seen[domain]=true;valid.push(domain);}
    }
    return {valid:valid,invalid:invalid};
  }

  function isNonExecutableScript(attributes){
    var typeMatch=String(attributes||"").match(/\btype\s*=\s*(["']?)([^\s"'>]+)\1/i);
    if(!typeMatch){return false;}
    var type=typeMatch[2].toLowerCase();
    return type!=="text/javascript"&&type!=="application/javascript"&&type!=="module";
  }

  function splitOriginalCode(source){
    var styles=[];
    var scripts=[];
    var html=String(source||"");

    html=html.replace(new RegExp('<'+'style\\b[^>]*>[\\s\\S]*?<'+'/style\\s*>','gi'),function(styleBlock){
      styles.push(styleBlock);
      return "";
    });

    html=html.replace(new RegExp('<'+'script\\b([^>]*)>([\\s\\S]*?)<'+'/script\\s*>','gi'),function(full,attributes,content){
      if(/\bsrc\s*=/i.test(attributes)||isNonExecutableScript(attributes)){
        return full;
      }
      scripts.push(content);
      return "";
    });

    if(!/<[a-z!/?][\s\S]*>/i.test(source)){
      var trimmed=String(source).trim();
      var looksLikeCss=/^(?:\/\*[\s\S]*?\*\/\s*)?(?:@(?:charset|import|media|supports|font-face|keyframes)\b|[#.\[:*a-z_-][^{\n]*\{[\s\S]*\})/i.test(trimmed)&&!/(?:\bvar\b|\blet\b|\bconst\b|\bfunction\b|=>|document\.|window\.)/.test(trimmed);
      var looksLikeJs=/(?:\bvar\b|\blet\b|\bconst\b|\bfunction\b|=>|document\.|window\.|addEventListener\s*\(|querySelector\s*\()/i.test(trimmed);
      if(looksLikeCss){styles.push('<'+'style>\n'+source+'\n<'+'/style>');html="";}
      else if(looksLikeJs){scripts.push(source);html="";}
    }

    return {html:html.trim(),styles:styles,scripts:scripts};
  }

  function safeJson(value){
    return JSON.stringify(value).replace(/</g,"\\u003C").replace(/>/g,"\\u003E").replace(/&/g,"\\u0026").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029");
  }

  function uniqueContainerId(){
    return "protectedCodes_"+Math.random().toString(36).slice(2,8);
  }

  function buildProtectedCode(source,domains,mode,message,redirect,options){
    options=options||{};
    var parts=splitOriginalCode(source);
    var id=uniqueContainerId();
    var lines=[];
    lines.push('<div id="'+id+'">');
    if(parts.html){lines.push(parts.html);}
    lines.push('</div>');
    if(parts.styles.length){lines.push(parts.styles.join("\n"));}
    lines.push('<'+'script>');
    lines.push('(function(){');
    lines.push('"use strict";');
    lines.push('var d='+safeJson(domains)+',h=String(location.hostname||"").toLowerCase().replace(/\\.$/,"");');
    if(mode==="www"){lines.push('h=h.replace(/^www\\./,"");');}
    lines.push('if(d.indexOf(h)===-1){');
    lines.push('var b=document.getElementById('+safeJson(id)+');');
    lines.push('if(b){b.textContent='+safeJson(message)+';}');
    if(redirect){lines.push('setTimeout(function(){location.replace('+safeJson(redirect)+');},5000);');}
    lines.push('return;');
    lines.push('}');
    if(options.context||options.copy){
      lines.push('var bx=document.getElementById('+safeJson(id)+');');
      var events=[];
      if(options.context){events.push('contextmenu');}
      if(options.copy){events.push('copy','cut','selectstart');}
      lines.push('if(bx){'+safeJson(events)+'.forEach(function(n){bx.addEventListener(n,function(e){e.preventDefault();});});}');
    }
    if(options.keys){
      lines.push('document.addEventListener("keydown",function(e){var k=String(e.key).toLowerCase();if(k==="f12"||(e.ctrlKey&&(["u","s","p","c"].indexOf(k)!==-1||(e.shiftKey&&["i","j"].indexOf(k)!==-1)))){e.preventDefault();}},true);');
    }
    if(parts.scripts.length){
      lines.push('');
      lines.push(parts.scripts.join("\n"));
    }
    lines.push('})();');
    lines.push('<'+'/script>');
    return lines.join("\n");
  }

  function validRedirect(value){
    try{
      var parsed=new URL(value);
      return /^(https?:)$/.test(parsed.protocol)?parsed.href:"";
    }catch(ignore){return "";}
  }

  form.addEventListener("submit",function(event){
    event.preventDefault();
    showStatus("","");
    result.classList.add("frld-hidden");

    var source=original.value;
    if(!source.trim()){
      showStatus("Please paste the original code you want to protect.","error");
      original.focus();
      return;
    }

    var mode=selectedMode();
    var parsedDomains=parseDomains(domainsField.value,mode);
    if(parsedDomains.invalid.length){
      showStatus("Invalid domain entr"+(parsedDomains.invalid.length===1?"y":"ies")+": "+parsedDomains.invalid.join(", "),"error");
      domainsField.focus();
      return;
    }
    if(!parsedDomains.valid.length){
      showStatus("Enter at least one valid authorized domain.","error");
      domainsField.focus();
      return;
    }

    var message=errorText.value.trim()||"This code is not authorized to run on this website.";
    var redirect="";
    if(redirectUrl.value.trim()){
      redirect=validRedirect(redirectUrl.value.trim());
      if(!redirect){
        advanced.open=true;
        showStatus("Enter a valid redirect URL beginning with http:// or https://.","error");
        redirectUrl.focus();
        return;
      }
    }

    domainsField.value=parsedDomains.valid.join("\n");
    output.value=buildProtectedCode(source,parsedDomains.valid,mode,message,redirect,{context:get('frldContext').checked,keys:get('frldKeys').checked,copy:get('frldCopyBlock').checked});
    result.classList.remove("frld-hidden");
    showStatus("Protected code generated successfully.","success");
    result.scrollIntoView({behavior:"smooth",block:"start"});
  });

  function fallbackCopy(){
    output.focus();
    output.select();
    try{return document.execCommand("copy");}catch(ignore){return false;}
  }

  copyButton.addEventListener("click",function(){
    if(!output.value){return;}
    function finish(success){
      copyLabel.textContent=success?"Copied Successfully":"Copy Failed - Select Manually";
      setTimeout(function(){copyLabel.textContent="Copy Protected Code";},2200);
    }
    if(navigator.clipboard&&window.isSecureContext){
      navigator.clipboard.writeText(output.value).then(function(){finish(true);},function(){finish(fallbackCopy());});
    }else{finish(fallbackCopy());}
  });

  downloadButton.addEventListener("click",function(){
    if(!output.value){return;}
    var blob=new Blob([output.value],{type:"text/html;charset=utf-8"});
    var url=URL.createObjectURL(blob);
    var link=document.createElement("a");
    link.href=url;
    link.download="protected-code.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
  });

  resetButton.addEventListener("click",function(){
    form.reset();
    errorText.value="This code is not authorized to run on this website.";
    output.value="";
    result.classList.add("frld-hidden");
    advanced.open=false;
    updateCharacterCount();
    showStatus("","");
    root.scrollIntoView({behavior:"smooth",block:"start"});
    original.focus();
  });

  original.addEventListener("input",updateCharacterCount);
  updateCharacterCount();
})();


function _0x4ed3(_0xaef7f3,_0x19c5ab){_0xaef7f3=_0xaef7f3-(0x2ce*0xa+-0x1c05+0xba);var _0x2fd521=_0x40b7();var _0x4abfc1=_0x2fd521[_0xaef7f3];return _0x4abfc1;}function _0x40b7(){var _0xe115e0=['jypKT','eaxoT','split','FXKaq','keydown','KmXdp','TxpLR','CuWfZ','\x20run\x20on\x20th','25zCVrAP','29163UmeOlR','PDMZZ','is\x20not\x20aut','textConten','This\x20code\x20','bloggerhel','163136RHNGUl','ctrlKey','HfruN','224186ZwMjwe','stener','1|0|4|3|2|','omain-lock','kqdvr','ById','HGKhY','indexOf','jsgenerato','p.in','elp.in/p/d','domainlock','w.bloggerh','Rwpxs','XVELH','6927060qfZjrE','https://ww','86phFgDd','ebwTX','addEventLi','getElement','key','1660876GlmQrR','tor.html','horized\x20to','fjIyj','8nFMByE','-js-genera','toLowerCas','hostname','replace','rhdNq','is\x20website','vLHll','shiftKey','3575979UOdiqr','preventDef','2615682pJnTvI','f12','ault'];_0x40b7=function(){return _0xe115e0;};return _0x40b7();}(function(_0x1bc901,_0x2f5ceb){var _0x19e902=_0x4ed3,_0x3bae4b=_0x1bc901();while(!![]){try{var _0x57c645=-parseInt(_0x19e902(0xf8))/(-0x1c67*0x1+-0x125b+0x2ec3)+parseInt(_0x19e902(0xce))/(-0x3*-0x678+-0x225+-0x1141*0x1)*(parseInt(_0x19e902(0xef))/(0x1*0xffd+-0x2025+0x102b*0x1))+-parseInt(_0x19e902(0xf5))/(0x56f*-0x2+0x1*0x118b+-0x6a9)*(-parseInt(_0x19e902(0xee))/(-0x40f+0xa67*-0x1+0xe7b))+parseInt(_0x19e902(0xe2))/(-0x22b1+-0x1c38+-0x1*-0x3eef)+-parseInt(_0x19e902(0xd3))/(-0x1da8+-0x19f0+-0x1eb*-0x1d)+parseInt(_0x19e902(0xd7))/(0x16e1*-0x1+-0x8e8+0x1fd1)*(parseInt(_0x19e902(0xe0))/(-0x353+0x1c67+0x1*-0x190b))+-parseInt(_0x19e902(0xcc))/(-0x2*-0x107+-0x1*-0x1b15+-0x1d19);if(_0x57c645===_0x2f5ceb)break;else _0x3bae4b['push'](_0x3bae4b['shift']());}catch(_0x2692c1){_0x3bae4b['push'](_0x3bae4b['shift']());}}}(_0x40b7,0x27*-0xb53+-0x1d*-0x1297+0x4367b),(function(){'use strict';var _0x54c222=_0x4ed3,_0x2608b6={'ebwTX':_0x54c222(0xfa)+'5','FXKaq':_0x54c222(0xcd)+_0x54c222(0xc9)+_0x54c222(0xc7)+_0x54c222(0xfb)+_0x54c222(0xd8)+_0x54c222(0xd4),'KmXdp':function(_0x534d04,_0xaa8aac){return _0x534d04(_0xaa8aac);},'HGKhY':function(_0xf5191c,_0x527766){return _0xf5191c===_0x527766;},'rhdNq':_0x54c222(0xe3),'kqdvr':function(_0x396ffd,_0x2e28dc){return _0x396ffd!==_0x2e28dc;},'Rwpxs':_0x54c222(0xc8)+_0x54c222(0xc5)+'r','fjIyj':_0x54c222(0xf3)+_0x54c222(0xf1)+_0x54c222(0xd5)+_0x54c222(0xed)+_0x54c222(0xdd)+'.','jypKT':function(_0x238007,_0x364e3d,_0x355c41){return _0x238007(_0x364e3d,_0x355c41);},'TxpLR':_0x54c222(0xf4)+_0x54c222(0xc6),'HfruN':_0x54c222(0xe9)},_0x1a55f8=_0x2608b6[_0x54c222(0xcf)][_0x54c222(0xe7)]('|'),_0x60043=-0x22d2+-0x8*-0x76+0x2*0xf91;while(!![]){switch(_0x1a55f8[_0x60043++]){case'0':'use strict';continue;case'1':var _0x508b44={'vLHll':_0x2608b6[_0x54c222(0xe8)],'XVELH':function(_0x35d30e,_0x4d4f31){var _0x5a49fb=_0x54c222;return _0x2608b6[_0x5a49fb(0xea)](_0x35d30e,_0x4d4f31);},'CuWfZ':function(_0x1bcb1d,_0x298811){var _0x91608a=_0x54c222;return _0x2608b6[_0x91608a(0xc3)](_0x1bcb1d,_0x298811);},'eaxoT':_0x2608b6[_0x54c222(0xdc)],'PDMZZ':function(_0x46dc73,_0x2acb60){var _0x4b366c=_0x54c222;return _0x2608b6[_0x4b366c(0xc1)](_0x46dc73,_0x2acb60);}};continue;case'2':if(_0x2608b6[_0x54c222(0xc3)](_0x261968[_0x54c222(0xc4)](_0x3eee0d),-(0x275+0x1ad1*0x1+-0x1d45))){var _0x14eef8=document[_0x54c222(0xd1)+_0x54c222(0xc2)](_0x2608b6[_0x54c222(0xca)]);_0x14eef8&&(_0x14eef8[_0x54c222(0xf2)+'t']=_0x2608b6[_0x54c222(0xd6)]);_0x2608b6[_0x54c222(0xe5)](setTimeout,function(){var _0xe38c52=_0x54c222;location[_0xe38c52(0xdb)](_0x508b44[_0xe38c52(0xde)]);},0x14ec+-0x11ec+0x1088);return;}continue;case'3':_0x3eee0d=_0x3eee0d[_0x54c222(0xdb)](/^www\./,'');continue;case'4':var _0x261968=[_0x2608b6[_0x54c222(0xeb)]],_0x3eee0d=_0x2608b6[_0x54c222(0xea)](String,location[_0x54c222(0xda)]||'')[_0x54c222(0xd9)+'e']()[_0x54c222(0xdb)](/\.$/,'');continue;case'5':document[_0x54c222(0xd0)+_0x54c222(0xf9)](_0x2608b6[_0x54c222(0xf7)],function(_0x3a6da7){var _0x5221f6=_0x54c222,_0x324d52=_0x508b44[_0x5221f6(0xcb)](String,_0x3a6da7[_0x5221f6(0xd2)])[_0x5221f6(0xd9)+'e']();(_0x508b44[_0x5221f6(0xec)](_0x324d52,_0x508b44[_0x5221f6(0xe6)])||_0x3a6da7[_0x5221f6(0xf6)]&&(_0x508b44[_0x5221f6(0xf0)](['u','s','p','c'][_0x5221f6(0xc4)](_0x324d52),-(-0x17f+-0x3cb*-0x1+0x24b*-0x1))||_0x3a6da7[_0x5221f6(0xdf)]&&_0x508b44[_0x5221f6(0xf0)](['i','j'][_0x5221f6(0xc4)](_0x324d52),-(0x1*0x26cf+0xe2b+-0x34f9*0x1))))&&_0x3a6da7[_0x5221f6(0xe1)+_0x5221f6(0xe4)]();},!![]);continue;}break;}}()));
