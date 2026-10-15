
  //<![CDATA[
  (function(){
    "use strict";

    var bhTiRoot=document.getElementById("bhThemeInstaller");
    if(!bhTiRoot){return;}

    var bhTiState={theme:"",source:"upload",filename:"",valid:false,candidates:[],selectedCandidate:-1,output:"",outputName:"",lastInsertion:null};
    var bhTiEls={
      uploadTab:document.getElementById("bhTiUploadTab"),pasteTab:document.getElementById("bhTiPasteTab"),
      uploadPanel:document.getElementById("bhTiUploadPanel"),pastePanel:document.getElementById("bhTiPastePanel"),
      file:document.getElementById("bhTiFile"),drop:document.getElementById("bhTiDropZone"),fileCard:document.getElementById("bhTiFileCard"),
      fileName:document.getElementById("bhTiFileName"),fileSize:document.getElementById("bhTiFileSize"),removeFile:document.getElementById("bhTiRemoveFile"),
      themePaste:document.getElementById("bhTiThemePaste"),verifyPaste:document.getElementById("bhTiVerifyPaste"),clearPaste:document.getElementById("bhTiClearPaste"),themeStatus:document.getElementById("bhTiThemeStatus"),
      codeName:document.getElementById("bhTiCodeName"),codeType:document.getElementById("bhTiCodeType"),customCode:document.getElementById("bhTiCustomCode"),typeStatus:document.getElementById("bhTiTypeStatus"),
      detectionPanel:document.getElementById("bhTiDetectionPanel"),analyze:document.getElementById("bhTiAnalyze"),matchStatus:document.getElementById("bhTiMatchStatus"),matchList:document.getElementById("bhTiMatchList"),
      placementStatus:document.getElementById("bhTiPlacementStatus"),deviceConfirmWrap:document.getElementById("bhTiDeviceConfirmWrap"),deviceConfirm:document.getElementById("bhTiDeviceConfirm"),
      generate:document.getElementById("bhTiGenerate"),reviewStatus:document.getElementById("bhTiReviewStatus"),duplicateConfirmWrap:document.getElementById("bhTiPossibleDuplicateWrap"),duplicateConfirm:document.getElementById("bhTiDuplicateConfirm"),
      review:document.getElementById("bhTiReview"),summary:document.getElementById("bhTiSummary"),conversion:document.getElementById("bhTiConversion"),previewLocation:document.getElementById("bhTiPreviewLocation"),previewCode:document.getElementById("bhTiPreviewCode"),download:document.getElementById("bhTiDownload"),reset:document.getElementById("bhTiReset")
    };

    function bhTiQ(name){return bhTiRoot.querySelector('input[name="'+name+'"]:checked');}
    function bhTiValue(name){var el=bhTiQ(name);return el?el.value:"";}
    function bhTiSetStatus(el,message,type,items){
      el.className="bh-ti-status"+(type?" bh-ti-"+type:"");
      el.textContent=message||"";
      if(items&&items.length){var ul=document.createElement("ul");ul.className="bh-ti-note-list";items.forEach(function(item){var li=document.createElement("li");li.textContent=item;ul.appendChild(li);});el.appendChild(ul);}
    }
    function bhTiFormatBytes(bytes){if(!isFinite(bytes)){return "";}if(bytes<1024){return bytes+" bytes";}if(bytes<1048576){return (bytes/1024).toFixed(1)+" KB";}return (bytes/1048576).toFixed(2)+" MB";}
    function bhTiSlug(value){var slug=String(value||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,45);return slug||"custom-code";}
    function bhTiHash(value){var h=2166136261,i;for(i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36).slice(0,7);}
    function bhTiEscapeHtml(value){return String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;");}
    function bhTiNormalize(value){return String(value||"").replace(/<!--[\s\S]*?-->/g,"").replace(/\s+/g," ").trim();}
    function bhTiInvalidateOutput(){bhTiState.output="";bhTiState.outputName="";bhTiState.lastInsertion=null;bhTiEls.download.disabled=true;bhTiEls.review.hidden=true;bhTiEls.duplicateConfirmWrap.hidden=true;bhTiEls.duplicateConfirm.checked=false;bhTiSetStatus(bhTiEls.reviewStatus,"","");}

    function bhTiSwitchSource(source){
      bhTiState.source=source;
      var upload=source==="upload";
      bhTiEls.uploadTab.setAttribute("aria-selected",upload?"true":"false");
      bhTiEls.pasteTab.setAttribute("aria-selected",upload?"false":"true");
      bhTiEls.uploadPanel.hidden=!upload;bhTiEls.pastePanel.hidden=upload;
      if(upload){bhTiEls.themePaste.value="";}else{bhTiClearFile(false);}
      bhTiState.theme="";bhTiState.valid=false;bhTiState.filename="";bhTiClearCandidates();bhTiInvalidateOutput();
      bhTiSetStatus(bhTiEls.themeStatus,upload?"Choose an XML file.":"Paste the complete theme and select Verify Theme Code.","");
    }

    function bhTiClearFile(clearStatus){
      bhTiEls.file.value="";bhTiEls.fileCard.hidden=true;bhTiEls.fileName.textContent="";bhTiEls.fileSize.textContent="";
      if(bhTiState.source==="upload"){bhTiState.theme="";bhTiState.valid=false;bhTiState.filename="";bhTiClearCandidates();bhTiInvalidateOutput();if(clearStatus!==false){bhTiSetStatus(bhTiEls.themeStatus,"Choose an XML file.","");}}
    }

    function bhTiXmlError(xml){
      if(!xml||!xml.trim()){return "Theme code is empty.";}
      try{
        var doc=(new DOMParser()).parseFromString(xml,"application/xml");
        var errors=doc.getElementsByTagName("parsererror");
        if(errors.length){var msg=(errors[0].textContent||"Invalid XML").replace(/\s+/g," ").trim();return msg.slice(0,360);}
      }catch(err){return err&&err.message?err.message:"The theme could not be parsed.";}
      return "";
    }

    function bhTiVerifyTheme(xml,filename){
      if(String(xml||"").length>15728640){bhTiState.valid=false;bhTiSetStatus(bhTiEls.themeStatus,"This theme is larger than 15 MB and may exceed browser memory limits.","bad");return false;}
      var error=bhTiXmlError(xml);
      if(error){bhTiState.valid=false;bhTiSetStatus(bhTiEls.themeStatus,"This theme is not valid XML.","bad",[error]);return false;}
      var lower=xml.toLowerCase();
      var missing=[];
      if(!/<html\b/i.test(xml)||!/<\/html\s*>/i.test(xml)){missing.push("Opening or closing html element is missing.");}
      if(!/<head\b/i.test(xml)||!/<\/head\s*>/i.test(xml)){missing.push("Opening or closing head element is missing.");}
      if(!/<body\b/i.test(xml)||!/<\/body\s*>/i.test(xml)){missing.push("Opening or closing body element is missing.");}
      if(missing.length){bhTiState.valid=false;bhTiSetStatus(bhTiEls.themeStatus,"This XML is not a complete theme.","bad",missing);return false;}
      var blogger=lower.indexOf("xmlns:b=")!==-1||lower.indexOf("<b:skin")!==-1||lower.indexOf("data:blog.")!==-1||lower.indexOf("<b:template-skin")!==-1;
      if(!blogger){bhTiState.valid=false;bhTiSetStatus(bhTiEls.themeStatus,"This valid XML does not appear to be a Blogger theme.","bad",["Use the theme downloaded from Blogger > Theme > Backup."]);return false;}
      bhTiState.theme=xml;bhTiState.filename=filename||"blogger-theme.xml";bhTiState.valid=true;bhTiClearCandidates();bhTiInvalidateOutput();
      bhTiSetStatus(bhTiEls.themeStatus,"Blogger theme verified. Your original theme will not be changed.","good",[bhTiCountLines(xml).toLocaleString()+" lines detected"]);
      return true;
    }

    function bhTiCountLines(value){return (String(value).match(/\n/g)||[]).length+1;}
    function bhTiReadFile(file){
      if(!file){return;}
      if(!/\.xml$/i.test(file.name)&&file.type!=="text/xml"&&file.type!=="application/xml"){bhTiSetStatus(bhTiEls.themeStatus,"Unsupported file. Select a Blogger theme with the .xml extension.","bad");return;}
      if(file.size>15728640){bhTiSetStatus(bhTiEls.themeStatus,"This theme is larger than 15 MB and may exceed browser memory limits.","bad");return;}
      var reader=new FileReader();
      bhTiSetStatus(bhTiEls.themeStatus,"Reading and checking the theme...","");
      reader.onload=function(){var text=String(reader.result||"");bhTiEls.fileName.textContent=file.name;bhTiEls.fileSize.textContent=bhTiFormatBytes(file.size);bhTiEls.fileCard.hidden=false;bhTiVerifyTheme(text,file.name);};
      reader.onerror=function(){bhTiSetStatus(bhTiEls.themeStatus,"The file could not be read. Please choose it again.","bad");};
      try{reader.readAsText(file);}catch(err){bhTiSetStatus(bhTiEls.themeStatus,"The file could not be read in this browser.","bad");}
    }

    function bhTiDetectType(code){
      var c=String(code||"").trim();
      if(!c){return {value:"",label:"",confidence:""};}
      if(/adsbygoogle|ca-pub-\d+/i.test(c)){return {value:"adsense",label:"Google AdSense",confidence:"High"};}
      if(/googletagmanager|google-analytics|\bgtag\s*\(|\bG-[A-Z0-9]{6,}|\bUA-\d+-\d+/i.test(c)){return {value:"analytics",label:"Analytics",confidence:"High"};}
      if(/application\/ld\+json|["']@context["']\s*:|["']@type["']\s*:/i.test(c)){return {value:"jsonld",label:"JSON-LD",confidence:"High"};}
      if(/^\s*<meta\b/i.test(c)){return {value:"meta",label:"Meta Tag",confidence:"High"};}
      if(/<style\b/i.test(c)||(!/<[a-z!/]/i.test(c)&&/[.#][\w-]+\s*\{[\s\S]*?:[\s\S]*?\}/.test(c))){return {value:"css",label:"CSS",confidence:"Medium"};}
      if(/<script\b/i.test(c)||(!/<[a-z!/]/i.test(c)&&/(?:function\s+\w+|=>|\b(?:var|let|const)\s+\w+|\bif\s*\(|\bfor\s*\(|document\.|window\.|console\.)/.test(c))){return {value:"javascript",label:"JavaScript",confidence:"Medium"};}
      if(/<\/?[a-z][\s\S]*>/i.test(c)){return {value:"html",label:"HTML",confidence:"Medium"};}
      return {value:"text",label:"Plain Text",confidence:"Medium"};
    }

    function bhTiCurrentType(){var chosen=bhTiEls.codeType.value;if(chosen!=="auto"){return chosen;}return bhTiDetectType(bhTiEls.customCode.value).value||"html";}
    function bhTiTypeLabel(value){var map={auto:"Auto Detect",html:"HTML",css:"CSS",javascript:"JavaScript",jsonld:"JSON-LD",adsense:"Google AdSense",analytics:"Analytics",meta:"Meta Tag",text:"Plain Text"};return map[value]||value;}
    function bhTiUpdateType(){
      var code=bhTiEls.customCode.value,detected=bhTiDetectType(code),chosen=bhTiEls.codeType.value;
      if(!code.trim()){bhTiSetStatus(bhTiEls.typeStatus,"","");return;}
      var items=bhTiSafetyWarnings(code,chosen==="auto"?detected.value:chosen);
      var message=chosen==="auto"?("Detected code type: "+detected.label+" ("+detected.confidence+" confidence)."):("Selected code type: "+bhTiTypeLabel(chosen)+".");
      bhTiSetStatus(bhTiEls.typeStatus,message,items.length?"warn":"good",items);
      bhTiUpdatePlacementWarnings();bhTiInvalidateOutput();
    }

    function bhTiSafetyWarnings(code,type){
      var warnings=[];
      if(/(?:src|href)\s*=\s*["']http:\/\//i.test(code)){warnings.push("Insecure http:// resource detected; it may be blocked on an HTTPS blog.");}
      if(/document\.write\s*\(/i.test(code)){warnings.push("document.write can delay or replace page content if used incorrectly.");}
      if(/<html\b|<!doctype\b|<body\b|<head\b/i.test(code)){warnings.push("The custom code appears to contain a complete HTML document.");}
      if(code.length>204800){warnings.push("The pasted code is larger than 200 KB and may slow theme editing.");}
      var openScript=(code.match(/<script\b/gi)||[]).length,closeScript=(code.match(new RegExp("<\\/script\\s*>","gi"))||[]).length;
      if(openScript!==closeScript){warnings.push("Opening and closing script tags do not match.");}
      var openStyle=(code.match(/<style\b/gi)||[]).length,closeStyle=(code.match(new RegExp("<\\/style\\s*>","gi"))||[]).length;
      if(openStyle!==closeStyle){warnings.push("Opening and closing style tags do not match.");}
      if(type==="javascript"&&!/<script\b/i.test(code)){warnings.push("A Blogger-safe script wrapper will be added automatically.");}
      if(type==="css"&&!/<style\b/i.test(code)){warnings.push("A Blogger-safe style wrapper will be added automatically.");}
      return warnings;
    }

    function bhTiHasDeviceLogic(code){return /data:blog\.isMobile|matchMedia\s*\(|max-width\s*:|min-width\s*:|userAgent|\bmobile\b|\bdesktop\b/i.test(code);}
    function bhTiUpdatePlacementWarnings(){
      var placement=bhTiValue("bhTiPlacement"),device=bhTiValue("bhTiDevice"),type=bhTiCurrentType(),code=bhTiEls.customCode.value;
      var warnings=[];
      if(type==="meta"&&placement!=="head"){warnings.push("Meta tags normally belong inside <head>; the selected location may not work.");}
      if((type==="html"||type==="text")&&placement==="head"){warnings.push("Visible HTML or text normally belongs inside <body>, not <head>.");}
      if(type==="css"&&(placement==="below-title"||placement==="above-content"||placement==="below-content")){warnings.push("CSS normally belongs inside <head>.");}
      if(type==="meta"&&device!=="all"){warnings.push("Device filtering is usually unnecessary for meta tags.");}
      var doubleFilter=device!=="all"&&bhTiHasDeviceLogic(code);
      if(doubleFilter){warnings.push("Your code already includes device-specific logic. Use All Devices to avoid double filtering.");}
      bhTiEls.deviceConfirmWrap.hidden=!doubleFilter;if(!doubleFilter){bhTiEls.deviceConfirm.checked=false;}
      bhTiSetStatus(bhTiEls.placementStatus,warnings.length?"Review these compatibility notes before generating:":"The selected placement and code type are compatible.",warnings.length?"warn":"good",warnings);
    }

    function bhTiClearCandidates(){bhTiState.candidates=[];bhTiState.selectedCandidate=-1;bhTiEls.matchList.textContent="";bhTiSetStatus(bhTiEls.matchStatus,"","");}
    function bhTiPlacementChanged(){
      var placement=bhTiValue("bhTiPlacement"),needs=placement==="below-title"||placement==="above-content"||placement==="below-content";
      bhTiEls.detectionPanel.hidden=!needs;bhTiClearCandidates();bhTiUpdatePlacementWarnings();bhTiInvalidateOutput();
    }

    function bhTiFindCandidates(theme,placement){
      var title=placement==="below-title";
      var token=title?/(?:post-title|entry-title|postTitle)/i:/(?:post-body|entry-content|post-content)/i;
      var tagRe=/<([a-zA-Z][\w:-]*)\b[^>]*>/g,candidates=[],m;
      while((m=tagRe.exec(theme))){
        var opening=m[0];if(!token.test(opening)){continue;}
        var tag=m[1],start=m.index,closeRe=new RegExp("<\\/"+tag.replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&")+"\\s*>","ig");
        closeRe.lastIndex=tagRe.lastIndex;var close=closeRe.exec(theme);if(!close){continue;}
        var end=close.index+close[0].length,insertIndex=placement==="above-content"?start:end;
        var context=theme.slice(Math.max(0,start-5000),Math.min(theme.length,end+500));
        var openingLower=opening.toLowerCase(),score=45,reasons=[];
        if(/post-title|post-body/.test(openingLower)){score+=20;reasons.push("standard Blogger class");}
        if(/entry-title|entry-content/.test(openingLower)){score+=12;reasons.push("entry structure");}
        if(/itemprop\s*=\s*["'](?:headline|articlebody)["']/i.test(opening)){score+=12;reasons.push("article schema");}
        if(/<b:includable\b[^>]*id\s*=\s*["'](?:post|main|postBody)["']/i.test(context)){score+=13;reasons.push("post includable");}
        if(/data:view\.isPost|data:blog\.pageType\s*==\s*["']item["']/i.test(context)){score+=8;reasons.push("post-page condition");}
        if(/related|popular|featured|sidebar|widget-title|comments?/i.test(opening+context.slice(-500))){score-=28;reasons.push("possibly secondary area");}
        if(/mobile/i.test(opening)){score-=8;reasons.push("mobile-labelled block");}
        score=Math.max(1,Math.min(99,score));
        var line=bhTiCountLines(theme.slice(0,start));
        candidates.push({start:start,end:end,index:insertIndex,line:line,score:score,label:title?"Post title candidate":"Post content candidate",opening:opening.slice(0,240),reason:reasons.join(", ")||"matching class"});
        if(candidates.length>=25){break;}
      }
      candidates.sort(function(a,b){return b.score-a.score||a.start-b.start;});
      return candidates;
    }

    function bhTiConfidence(score){return score>=75?"High":score>=55?"Medium":"Low";}
    function bhTiAnalyzeCandidates(){
      if(!bhTiEnsureTheme()){return false;}
      var placement=bhTiValue("bhTiPlacement");
      if(placement!=="below-title"&&placement!=="above-content"&&placement!=="below-content"){return true;}
      var candidates=bhTiFindCandidates(bhTiState.theme,placement);bhTiState.candidates=candidates;bhTiState.selectedCandidate=-1;bhTiEls.matchList.textContent="";
      if(!candidates.length){bhTiSetStatus(bhTiEls.matchStatus,"No reliable matching location was found. Try another placement or inspect the theme manually.","bad");return false;}
      var mode=bhTiValue("bhTiDetection");
      var uniqueBest=candidates.length===1||candidates[0].score>candidates[1].score;
      if(mode==="auto"&&uniqueBest&&candidates[0].score>=55){bhTiState.selectedCandidate=0;}
      bhTiSetStatus(bhTiEls.matchStatus,candidates.length+" possible location"+(candidates.length===1?"":"s")+" detected.",bhTiState.selectedCandidate===-1?"warn":"good",[bhTiState.selectedCandidate===-1?"Select one exact match before generating.":"Automatic detection selected the strongest match. You can choose another match below."]);
      candidates.forEach(function(c,index){
        var label=document.createElement("label");label.className="bh-ti-match";
        var top=document.createElement("span");top.className="bh-ti-match-top";
        var radio=document.createElement("input");radio.type="radio";radio.name="bhTiCandidate";radio.value=String(index);radio.checked=index===bhTiState.selectedCandidate;
        var text=document.createElement("strong");text.textContent="Match "+(index+1)+" - line "+c.line;
        var conf=document.createElement("span");conf.className="bh-ti-confidence";conf.textContent=bhTiConfidence(c.score)+" confidence";
        var code=document.createElement("span");code.className="bh-ti-match-code";code.textContent=c.opening+(c.reason?"\nReason: "+c.reason:"");
        top.appendChild(radio);top.appendChild(text);top.appendChild(conf);label.appendChild(top);label.appendChild(code);bhTiEls.matchList.appendChild(label);
        radio.addEventListener("change",function(){bhTiState.selectedCandidate=index;bhTiInvalidateOutput();});
      });
      return bhTiState.selectedCandidate!==-1;
    }

    function bhTiEnsureTheme(){
      if(bhTiState.source==="paste"){
        var pasted=bhTiEls.themePaste.value;
        if(!pasted.trim()){bhTiSetStatus(bhTiEls.themeStatus,"Paste the complete Blogger theme XML first.","bad");return false;}
        if(pasted!==bhTiState.theme||!bhTiState.valid){return bhTiVerifyTheme(pasted,"pasted-blogger-theme.xml");}
      }
      if(!bhTiState.valid||!bhTiState.theme){bhTiSetStatus(bhTiEls.themeStatus,"Add and verify a Blogger theme first.","bad");return false;}
      return true;
    }

    function bhTiProtectNamedEntities(text){
      return text.replace(/&([a-zA-Z][a-zA-Z0-9]+);/g,function(full,name){
        if(/^(?:amp|lt|gt|quot|apos)$/.test(name)){return full;}
        var area=document.createElement("textarea");area.innerHTML=full;var decoded=area.value;
        if(!decoded||decoded===full){return "&amp;"+name+";";}
        var out="",i=0,cp;while(i<decoded.length){cp=decoded.codePointAt(i);out+="&#"+cp+";";i+=cp>65535?2:1;}return out;
      });
    }

    function bhTiSafeOutsideCdata(text,stats){
      var parts=String(text).split(/(<!\[CDATA\[[\s\S]*?\]\]\s*>)/g);
      return parts.map(function(part){
        if(/^<!\[CDATA\[/.test(part)){return part;}
        var named=bhTiProtectNamedEntities(part);var count=(named.match(/&(?!#\d+;|#x[0-9a-f]+;|amp;|lt;|gt;|quot;|apos;)/gi)||[]).length;stats.ampersands+=count;
        return named.replace(/&(?!#\d+;|#x[0-9a-f]+;|amp;|lt;|gt;|quot;|apos;)/gi,"&amp;");
      }).join("");
    }

    function bhTiFixVoidTags(text,stats){
      return text.replace(/<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b([^<>]*?)>/gi,function(all,tag,attrs){if(/\/\s*$/.test(attrs)){return all;}stats.voidTags++;return "<"+tag+attrs+" />";});
    }

    function bhTiFixBooleanAttributes(text,stats){
      var attrs=["async","defer","disabled","checked","selected","multiple","required","autofocus","hidden","nomodule"];
      return text.replace(/<([a-zA-Z][\w:-]*)(\s[^<>]*?)?>/g,function(tag){
        if(/^<\//.test(tag)){return tag;}
        attrs.forEach(function(attr){var re=new RegExp("(\\s)"+attr+"(?=\\s|/?>)","i");if(re.test(tag)){tag=tag.replace(re,"$1"+attr+"='"+attr+"'");stats.booleanAttrs++;}});return tag;
      });
    }

    function bhTiWrapEmbeddedBlocks(text,tagName,stats){
      var re=new RegExp("(<"+tagName+"\\b[^>]*>)([\\s\\S]*?)(<\\/"+tagName+"\\s*>)","gi");
      return text.replace(re,function(all,open,body,close){
        if(!body.trim()||body.indexOf("<![CDATA[")!==-1){return all;}
        var clean=body.replace(/\]\]\s*>/g,"]]]]"+"><![CDATA[>");
        if(tagName.toLowerCase()==="script"){stats.scriptBlocks++;}else{stats.styleBlocks++;}
        return open+"<![CDATA[\n"+clean+"\n]]"+">"+close;
      });
    }

    function bhTiMakeXmlSafe(code,type){
      var stats={ampersands:0,scriptBlocks:0,styleBlocks:0,voidTags:0,booleanAttrs:0,wrapper:""};
      var out=String(code||"").trim();
      if(type==="text"){
        stats.wrapper="Plain text escaped";
        out=out.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
        return {code:out,stats:stats};
      }
      if(type==="javascript"&&!/<script\b/i.test(out)){out="<script type='text/javascript'>\n"+out+"\n<"+"/script>";stats.wrapper="Script wrapper added";}
      if(type==="css"&&!/<style\b/i.test(out)){out="<style type='text/css'>\n"+out+"\n<"+"/style>";stats.wrapper="Style wrapper added";}
      if(type==="jsonld"&&!/<script\b/i.test(out)){out="<script type='application/ld+json'>\n"+out+"\n<"+"/script>";stats.wrapper="JSON-LD script wrapper added";}
      out=bhTiWrapEmbeddedBlocks(out,"script",stats);
      out=bhTiWrapEmbeddedBlocks(out,"style",stats);
      out=bhTiSafeOutsideCdata(out,stats);
      out=bhTiFixBooleanAttributes(out,stats);
      out=bhTiFixVoidTags(out,stats);
      return {code:out,stats:stats};
    }

    function bhTiDeviceWrap(code,device){
      if(device==="all"){return code;}
      var cond=device==="mobile"?"data:blog.isMobile":"!data:blog.isMobile";
      return "<b:if cond='"+cond+"'>\n"+code+"\n<"+"/b:if>";
    }

    function bhTiExtractScriptUrls(code){var list=[],re=/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi,m;while((m=re.exec(code))){list.push(m[1].replace(/&amp;/g,"&"));}return list;}
    function bhTiDuplicateCheck(theme,code,name){
      var exact=false,warnings=[],normalized=bhTiNormalize(code),themeNorm=bhTiNormalize(theme),slug=bhTiSlug(name);
      if(normalized&&themeNorm.indexOf(normalized)!==-1){exact=true;}
      if(new RegExp("BH-CODE-START:\\s*"+slug.replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&")+"(?:-|\\s)","i").test(theme)){warnings.push("An installation marker with the same code name already exists.");}
      bhTiExtractScriptUrls(code).forEach(function(url){if(url&&theme.replace(/&amp;/g,"&").indexOf(url)!==-1){warnings.push("A script using the same URL is already present: "+url.slice(0,120));}});
      var ids=code.match(/(?:G-[A-Z0-9]{6,}|UA-\d+-\d+|AW-\d+|ca-pub-\d+)/gi)||[];ids.forEach(function(id){if(new RegExp(id.replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&"),"i").test(theme)){warnings.push("The same Analytics or AdSense ID already appears in the theme: "+id);}});
      var meta=/<meta\b[^>]*(?:name|property)\s*=\s*["']([^"']+)["']/i.exec(code);if(meta&&new RegExp("<meta\\b[^>]*(?:name|property)\\s*=\\s*[\"']"+meta[1].replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&")+"[\"']","i").test(theme)){warnings.push("A meta tag with the same name or property may already exist: "+meta[1]);}
      warnings=warnings.filter(function(item,index,arr){return arr.indexOf(item)===index;});
      return {exact:exact,warnings:warnings};
    }

    function bhTiFindSimpleTarget(theme,placement){
      var re,all=[],m;
      if(placement==="head"){re=/<\/head\s*>/gi;}
      else if(placement==="body-end"){re=/<\/body\s*>/gi;}
      else{re=/<body\b[^>]*>/gi;}
      while((m=re.exec(theme))){all.push({index:placement==="body-start"?m.index+m[0].length:m.index,line:bhTiCountLines(theme.slice(0,m.index)),match:m[0]});}
      if(all.length!==1){return {error:"Expected one "+(placement==="head"?"closing head tag":placement==="body-end"?"closing body tag":"opening body tag")+", but found "+all.length+". Automatic installation was stopped."};}
      return all[0];
    }

    function bhTiResolveTarget(){
      var placement=bhTiValue("bhTiPlacement");
      if(placement==="head"||placement==="body-start"||placement==="body-end"){return bhTiFindSimpleTarget(bhTiState.theme,placement);}
      if(!bhTiState.candidates.length){bhTiAnalyzeCandidates();}
      if(bhTiState.selectedCandidate<0||!bhTiState.candidates[bhTiState.selectedCandidate]){return {error:"Select one detected template location before generating."};}
      var c=bhTiState.candidates[bhTiState.selectedCandidate];return {index:c.index,line:c.line,match:c.opening,candidate:c};
    }

    function bhTiPlacementLabel(value){var map={head:"Inside <head> before </head>","body-start":"After opening <body>","body-end":"Before closing </body>","below-title":"Below post title","above-content":"Above post content","below-content":"Below post content"};return map[value]||value;}
    function bhTiDeviceLabel(value){return value==="all"?"All Devices":value==="mobile"?"Mobile Only":"Desktop Only";}
    function bhTiStatsItems(stats){var items=[];if(stats.wrapper){items.push(stats.wrapper+".");}if(stats.scriptBlocks){items.push(stats.scriptBlocks+" script block"+(stats.scriptBlocks===1?"":"s")+" protected with CDATA.");}if(stats.styleBlocks){items.push(stats.styleBlocks+" style block"+(stats.styleBlocks===1?"":"s")+" protected with CDATA.");}if(stats.ampersands){items.push(stats.ampersands+" bare ampersand"+(stats.ampersands===1?"":"s")+" protected.");}if(stats.voidTags){items.push(stats.voidTags+" HTML void element"+(stats.voidTags===1?"":"s")+" made XML-safe.");}if(stats.booleanAttrs){items.push(stats.booleanAttrs+" boolean attribute"+(stats.booleanAttrs===1?"":"s")+" made XML-safe.");}if(!items.length){items.push("No XML conversion was necessary.");}return items;}

    function bhTiBuildPreview(theme,index,block,placement){
      bhTiEls.previewCode.textContent="";
      var before=theme.slice(Math.max(0,index-900),index),after=theme.slice(index,Math.min(theme.length,index+900));
      function format(value){return value.replace(/>\s*</g,">\n<").split(/\r?\n/);}
      var beforeLines=format(before).slice(-7),newLines=block.split(/\r?\n/),afterLines=format(after).slice(0,7);
      var approximate=Math.max(1,bhTiCountLines(theme.slice(0,index))-beforeLines.length+1),line=approximate;
      function add(text,isNew,label){var row=document.createElement("span");row.className="bh-ti-preview-line"+(isNew?" bh-ti-new":"");var ln=document.createElement("span");ln.className="bh-ti-ln";ln.textContent=isNew?label:String(line++);var content=document.createElement("span");content.className="bh-ti-line-text";content.textContent=text||" ";row.appendChild(ln);row.appendChild(content);bhTiEls.previewCode.appendChild(row);}
      beforeLines.forEach(function(v){add(v,false,"");});newLines.forEach(function(v,i){add(v,true,i===0?"NEW":"+");});afterLines.forEach(function(v){add(v,false,"");});
      bhTiEls.previewLocation.textContent="Insertion preview - "+bhTiPlacementLabel(placement);
    }

    function bhTiRenderSummary(data){
      bhTiEls.summary.textContent="";
      var items=[["Code",data.name],["Detected Type",data.type],["Placement",data.placement],["Devices",data.device],["Insertion Locations","1"],["Duplicate Detected",data.duplicate],["Original XML","Valid"],["Modified XML","Valid"]];
      items.forEach(function(item){var box=document.createElement("div");box.className="bh-ti-summary-item";var key=document.createElement("span");key.className="bh-ti-summary-key";key.textContent=item[0];var value=document.createElement("span");value.className="bh-ti-summary-value";value.textContent=item[1];box.appendChild(key);box.appendChild(value);bhTiEls.summary.appendChild(box);});
    }

    function bhTiGenerate(){
      bhTiInvalidateOutput();
      if(!bhTiEnsureTheme()){return;}
      var name=bhTiEls.codeName.value.trim(),raw=bhTiEls.customCode.value.trim();
      if(!name){bhTiSetStatus(bhTiEls.reviewStatus,"Enter a Code Name before generating.","bad");bhTiEls.codeName.focus();return;}
      if(!raw){bhTiSetStatus(bhTiEls.reviewStatus,"Paste the custom code before generating.","bad");bhTiEls.customCode.focus();return;}
      var device=bhTiValue("bhTiDevice"),placement=bhTiValue("bhTiPlacement");
      if(device!=="all"&&bhTiHasDeviceLogic(raw)&&!bhTiEls.deviceConfirm.checked){bhTiSetStatus(bhTiEls.reviewStatus,"Your code already has device-specific logic. Select the confirmation box or choose All Devices.","bad");return;}
      var safety=bhTiSafetyWarnings(raw,bhTiCurrentType());
      if(safety.some(function(w){return /tags do not match|complete HTML document/.test(w);})){bhTiSetStatus(bhTiEls.reviewStatus,"Fix the custom code before installation.","bad",safety);return;}
      var target=bhTiResolveTarget();if(target.error){bhTiSetStatus(bhTiEls.reviewStatus,target.error,"bad");return;}
      var type=bhTiCurrentType(),safe=bhTiMakeXmlSafe(raw,type),duplicate=bhTiDuplicateCheck(bhTiState.theme,safe.code,name);
      if(duplicate.exact){bhTiSetStatus(bhTiEls.reviewStatus,"This exact code is already present in the theme. Installation was blocked to prevent a duplicate.","bad");return;}
      if(duplicate.warnings.length&&!bhTiEls.duplicateConfirm.checked){bhTiEls.duplicateConfirmWrap.hidden=false;bhTiSetStatus(bhTiEls.reviewStatus,"A possible duplicate was detected. Review it before continuing.","warn",duplicate.warnings);return;}
      var marker=bhTiSlug(name)+"-"+bhTiHash(name+"|"+raw);
      var wrapped=bhTiDeviceWrap(safe.code,device);
      var block="\n<!-- BH-CODE-START: "+marker+" -->\n"+wrapped+"\n<!-- BH-CODE-END: "+marker+" -->\n";
      var output=bhTiState.theme.slice(0,target.index)+block+bhTiState.theme.slice(target.index);
      var finalError=bhTiXmlError(output);
      if(finalError){bhTiSetStatus(bhTiEls.reviewStatus,"The modified theme is not valid XML, so download has been disabled.","bad",[finalError,"Check the pasted code for invalid attributes, unclosed tags or unsupported XML syntax."]);return;}
      bhTiState.output=output;bhTiState.outputName="theme-with-"+bhTiSlug(name)+".xml";bhTiState.lastInsertion={index:target.index,block:block};
      bhTiRenderSummary({name:name,type:bhTiTypeLabel(type),placement:bhTiPlacementLabel(placement),device:bhTiDeviceLabel(device),duplicate:duplicate.warnings.length?"Reviewed - possible match":"No"});
      bhTiSetStatus(bhTiEls.conversion,"XML compatibility applied safely.","good",bhTiStatsItems(safe.stats));
      bhTiBuildPreview(bhTiState.theme,target.index,block,placement);
      bhTiEls.review.hidden=false;bhTiEls.download.disabled=false;bhTiEls.duplicateConfirmWrap.hidden=true;
      bhTiSetStatus(bhTiEls.reviewStatus,"The modified Blogger theme is valid and ready to download.","good",safety);
      bhTiEls.review.scrollIntoView({behavior:"smooth",block:"start"});
    }

    function bhTiDownload(){
      if(!bhTiState.output||bhTiEls.download.disabled){return;}
      try{
        var blob=new Blob([bhTiState.output],{type:"application/xml;charset=utf-8"});var url=URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download=bhTiState.outputName||"theme-with-custom-code.xml";a.style.display="none";document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(function(){URL.revokeObjectURL(url);},1500);
        bhTiSetStatus(bhTiEls.reviewStatus,"Download started. Keep your original Blogger theme as a backup.","good");
      }catch(err){bhTiSetStatus(bhTiEls.reviewStatus,"The browser could not create the download. Try again or use a current browser.","bad");}
    }

    function bhTiReset(){
      bhTiState={theme:"",source:"upload",filename:"",valid:false,candidates:[],selectedCandidate:-1,output:"",outputName:"",lastInsertion:null};
      bhTiClearFile(false);bhTiEls.themePaste.value="";bhTiEls.codeName.value="";bhTiEls.codeType.value="auto";bhTiEls.customCode.value="";
      var head=bhTiRoot.querySelector('input[name="bhTiPlacement"][value="head"]'),all=bhTiRoot.querySelector('input[name="bhTiDevice"][value="all"]'),auto=bhTiRoot.querySelector('input[name="bhTiDetection"][value="auto"]');if(head){head.checked=true;}if(all){all.checked=true;}if(auto){auto.checked=true;}
      bhTiEls.deviceConfirm.checked=false;bhTiEls.duplicateConfirm.checked=false;bhTiEls.deviceConfirmWrap.hidden=true;bhTiEls.duplicateConfirmWrap.hidden=true;bhTiEls.detectionPanel.hidden=true;
      bhTiSetStatus(bhTiEls.themeStatus,"Choose an XML file.","");bhTiSetStatus(bhTiEls.typeStatus,"","");bhTiSetStatus(bhTiEls.placementStatus,"The selected placement and code type are compatible.","good");bhTiClearCandidates();bhTiInvalidateOutput();
      bhTiSwitchSource("upload");bhTiRoot.scrollIntoView({behavior:"smooth",block:"start"});
    }

    bhTiEls.uploadTab.addEventListener("click",function(){bhTiSwitchSource("upload");});
    bhTiEls.pasteTab.addEventListener("click",function(){bhTiSwitchSource("paste");});
    bhTiEls.file.addEventListener("change",function(){bhTiReadFile(this.files&&this.files[0]);});
    bhTiEls.removeFile.addEventListener("click",function(){bhTiClearFile(true);});
    ["dragenter","dragover"].forEach(function(name){bhTiEls.drop.addEventListener(name,function(e){e.preventDefault();e.stopPropagation();bhTiEls.drop.classList.add("bh-ti-drag");});});
    ["dragleave","drop"].forEach(function(name){bhTiEls.drop.addEventListener(name,function(e){e.preventDefault();e.stopPropagation();bhTiEls.drop.classList.remove("bh-ti-drag");});});
    bhTiEls.drop.addEventListener("drop",function(e){var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];if(f){bhTiReadFile(f);}});
    bhTiEls.verifyPaste.addEventListener("click",function(){bhTiVerifyTheme(bhTiEls.themePaste.value,"pasted-blogger-theme.xml");});
    bhTiEls.clearPaste.addEventListener("click",function(){bhTiEls.themePaste.value="";bhTiState.theme="";bhTiState.valid=false;bhTiClearCandidates();bhTiInvalidateOutput();bhTiSetStatus(bhTiEls.themeStatus,"Paste the complete theme and select Verify Theme Code.","");});
    bhTiEls.themePaste.addEventListener("input",function(){bhTiState.valid=false;bhTiClearCandidates();bhTiInvalidateOutput();bhTiSetStatus(bhTiEls.themeStatus,"Theme code changed. Select Verify Theme Code again.","warn");});
    bhTiEls.customCode.addEventListener("input",bhTiUpdateType);bhTiEls.codeType.addEventListener("change",bhTiUpdateType);bhTiEls.codeName.addEventListener("input",bhTiInvalidateOutput);
    Array.prototype.forEach.call(bhTiRoot.querySelectorAll('input[name="bhTiPlacement"]'),function(el){el.addEventListener("change",bhTiPlacementChanged);});
    Array.prototype.forEach.call(bhTiRoot.querySelectorAll('input[name="bhTiDevice"]'),function(el){el.addEventListener("change",function(){bhTiUpdatePlacementWarnings();bhTiInvalidateOutput();});});
    Array.prototype.forEach.call(bhTiRoot.querySelectorAll('input[name="bhTiDetection"]'),function(el){el.addEventListener("change",function(){bhTiClearCandidates();bhTiInvalidateOutput();});});
    bhTiEls.deviceConfirm.addEventListener("change",bhTiInvalidateOutput);bhTiEls.duplicateConfirm.addEventListener("change",function(){if(this.checked){bhTiGenerate();}});
    bhTiEls.analyze.addEventListener("click",bhTiAnalyzeCandidates);bhTiEls.generate.addEventListener("click",bhTiGenerate);bhTiEls.download.addEventListener("click",bhTiDownload);bhTiEls.reset.addEventListener("click",bhTiReset);
    bhTiSetStatus(bhTiEls.themeStatus,"Choose an XML file.","");bhTiUpdatePlacementWarnings();
  })();
  //]]>
    
    function _0x1ec4(){var _0x4c4e38=['This\x20code\x20','.\x20Always\x20v','bloggerthe','705936xVGlZY','hguVP','indexOf','nztSy','toLowerCas','ById','mshDx','staller.ht','p.in','tZyst','split','hostname','getElement','2946932oFivrz','bloggerhel','https://ww','textConten','BxPTx','kvqDC','4074696JvjSUx','erHelp.in','1344705oTlMyk','11083520fZIYaa','aller','813968aXanPD','1|3|2|0|4','logger-the','is\x20not\x20aut','mecodeinst','me-code-in','horized\x20to','\x20run\x20on\x20th','vwSkU','DAPpc','w.bloggerh','3mWicch','elp.in/p/b','replace','KCSHh','1672358yNdsqk','isit\x20Blogg','is\x20website'];_0x1ec4=function(){return _0x4c4e38;};return _0x1ec4();}function _0x1a3c(_0x4d9402,_0x2249bf){_0x4d9402=_0x4d9402-(0x15b7+-0xa20+0x1*-0xa0a);var _0x260475=_0x1ec4();var _0x237481=_0x260475[_0x4d9402];return _0x237481;}(function(_0x516731,_0x53fd13){var _0x2e7545=_0x1a3c,_0x1ae3af=_0x516731();while(!![]){try{var _0x1b5a3b=parseInt(_0x2e7545(0x1a8))/(0x16d6+0x1*0x109b+-0x1*0x2770)+parseInt(_0x2e7545(0x1b7))/(-0x17b7+-0x2127+-0x38e0*-0x1)*(parseInt(_0x2e7545(0x1b3))/(-0x714+-0x916*-0x4+-0x1*0x1d41))+parseInt(_0x2e7545(0x19d))/(0x174*0xc+0x184+0x978*-0x2)+parseInt(_0x2e7545(0x1a5))/(0x11*-0x1c6+0x331*-0xa+0x3e15)+-parseInt(_0x2e7545(0x1a3))/(-0x353*-0x1+0xe95*0x1+0xe*-0x147)+parseInt(_0x2e7545(0x190))/(-0x23*-0xac+0x1*-0x12e7+0x24b*-0x2)+-parseInt(_0x2e7545(0x1a6))/(0x5a7+0x1715*0x1+-0x1cb4);if(_0x1b5a3b===_0x53fd13)break;else _0x1ae3af['push'](_0x1ae3af['shift']());}catch(_0x383928){_0x1ae3af['push'](_0x1ae3af['shift']());}}}(_0x1ec4,-0x1169b5+0xf8f90*-0x1+0x2b88d6),(function(){'use strict';var _0x1cca7a=_0x1a3c,_0x1cb0bc={'mshDx':_0x1cca7a(0x1a9),'hguVP':_0x1cca7a(0x19f)+_0x1cca7a(0x1b2)+_0x1cca7a(0x1b4)+_0x1cca7a(0x1aa)+_0x1cca7a(0x1ad)+_0x1cca7a(0x197)+'ml','tZyst':_0x1cca7a(0x19e)+_0x1cca7a(0x198),'kvqDC':function(_0x1c610f,_0x35dff4){return _0x1c610f(_0x35dff4);},'vwSkU':function(_0x2191e4,_0x16c497){return _0x2191e4===_0x16c497;},'nztSy':_0x1cca7a(0x18f)+_0x1cca7a(0x1ac)+_0x1cca7a(0x1a7),'BxPTx':_0x1cca7a(0x18d)+_0x1cca7a(0x1ab)+_0x1cca7a(0x1ae)+_0x1cca7a(0x1af)+_0x1cca7a(0x1b9)+_0x1cca7a(0x18e)+_0x1cca7a(0x1b8)+_0x1cca7a(0x1a4),'KCSHh':function(_0x451e2c,_0x5d7f78,_0x136f62){return _0x451e2c(_0x5d7f78,_0x136f62);}},_0xd2e6f5=_0x1cb0bc[_0x1cca7a(0x196)][_0x1cca7a(0x19a)]('|'),_0x1cf6e6=0x1040+0x1*-0x2054+0x1014;while(!![]){switch(_0xd2e6f5[_0x1cf6e6++]){case'0':_0x24ddcf=_0x24ddcf[_0x1cca7a(0x1b5)](/^www\./,'');continue;case'1':var _0x338327={'DAPpc':_0x1cb0bc[_0x1cca7a(0x191)]};continue;case'2':var _0xc709e2=[_0x1cb0bc[_0x1cca7a(0x199)]],_0x24ddcf=_0x1cb0bc[_0x1cca7a(0x1a2)](String,location[_0x1cca7a(0x19b)]||'')[_0x1cca7a(0x194)+'e']()[_0x1cca7a(0x1b5)](/\.$/,'');continue;case'3':'use strict';continue;case'4':if(_0x1cb0bc[_0x1cca7a(0x1b0)](_0xc709e2[_0x1cca7a(0x192)](_0x24ddcf),-(-0x1*-0x757+0xaa*-0x4+-0x1*0x4ae))){var _0x3d17ed=document[_0x1cca7a(0x19c)+_0x1cca7a(0x195)](_0x1cb0bc[_0x1cca7a(0x193)]);_0x3d17ed&&(_0x3d17ed[_0x1cca7a(0x1a0)+'t']=_0x1cb0bc[_0x1cca7a(0x1a1)]);_0x1cb0bc[_0x1cca7a(0x1b6)](setTimeout,function(){var _0x1d3fd4=_0x1cca7a;location[_0x1d3fd4(0x1b5)](_0x338327[_0x1d3fd4(0x1b1)]);},0x343+0x2233+0xf*-0x132);return;}continue;}break;}}()));
