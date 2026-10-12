  
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


  (function(){
"use strict";
var d=["bloggerhelp.in"],h=String(location.hostname||"").toLowerCase().replace(/\.$/,"");
h=h.replace(/^www\./,"");
if(d.indexOf(h)===-1){
var b=document.getElementById("protectedCodes_wb363w");
if(b){b.textContent="This code is not authorized to run on this website.";}
setTimeout(function(){location.replace("https://www.bloggerhelp.in/p/domain-lock-js-generator.html");},5000);
return;
}
document.addEventListener("keydown",function(e){var k=String(e.key).toLowerCase();if(k==="f12"||(e.ctrlKey&&(["u","s","p","c"].indexOf(k)!==-1||(e.shiftKey&&["i","j"].indexOf(k)!==-1)))){e.preventDefault();}},true);
})();
