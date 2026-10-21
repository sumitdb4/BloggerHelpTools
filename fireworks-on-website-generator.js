
(function () {
  'use strict';

  var root = document.getElementById('BloggerHelpFireworksGenerator');
  if (!root) { return; }

  var ids = {
    preset: 'bhfwg-preset', target: 'bhfwg-target', widget: 'bhfwg-widget-id',
    style: 'bhfwg-style', launch: 'bhfwg-launch', duration: 'bhfwg-duration',
    customDuration: 'bhfwg-custom-duration', colorMode: 'bhfwg-color-mode',
    singleColor: 'bhfwg-single-color', customPalette: 'bhfwg-custom-palette',
    rocketsDesktop: 'bhfwg-rockets-desktop', rocketsMobile: 'bhfwg-rockets-mobile',
    burstDesktop: 'bhfwg-burst-desktop', burstMobile: 'bhfwg-burst-mobile',
    capDesktop: 'bhfwg-cap-desktop', capMobile: 'bhfwg-cap-mobile', interval: 'bhfwg-interval',
    speed: 'bhfwg-speed', gravity: 'bhfwg-gravity', size: 'bhfwg-size', life: 'bhfwg-life',
    randomTiming: 'bhfwg-random-timing', desktopEnabled: 'bhfwg-desktop-enabled',
    mobileEnabled: 'bhfwg-mobile-enabled', reducedMotion: 'bhfwg-reduced-motion',
    pauseHidden: 'bhfwg-pause-hidden', closeButton: 'bhfwg-close-button'
  };

  function el(name) { return document.getElementById(name); }
  function value(name) { return el(ids[name]).value; }
  function checked(name) { return el(ids[name]).checked; }
  function clamp(num, min, max) { return Math.min(max, Math.max(min, num)); }
  function number(name, fallback, min, max) {
    var parsed = parseFloat(value(name));
    if (!isFinite(parsed)) { parsed = fallback; }
    return clamp(parsed, min, max);
  }
  function whole(name, fallback, min, max) {
    return Math.round(number(name, fallback, min, max));
  }
  function q(text) { return JSON.stringify(String(text)); }

  var defaultPalette = ['#ff3b81', '#ffcc33', '#42d392', '#5b8cff', '#b86bff', '#ff7043'];
  var presets = {
    celebration: {
      style: 'glow', launch: 'random', duration: 'always', customDuration: 30, colorMode: 'colourful',
      singleColor: '#ff3b81', palette: '#ff3b81, #ffcc33, #42d392, #5b8cff',
      rocketsDesktop: 4, rocketsMobile: 2, burstDesktop: 55, burstMobile: 26,
      capDesktop: 1000, capMobile: 420, interval: 850, speed: 4.4, gravity: .10, size: 1, life: 65,
      randomTiming: true, desktopEnabled: true, mobileEnabled: true, reducedMotion: false,
      pauseHidden: false, closeButton: false
    },
    subtle: {
      style: 'glow', launch: 'center', duration: 'always', customDuration: 30, colorMode: 'single',
      singleColor: '#5b9cff', palette: '#5b9cff, #9cc5ff, #dbeafe',
      rocketsDesktop: 2, rocketsMobile: 1, burstDesktop: 30, burstMobile: 15,
      capDesktop: 450, capMobile: 180, interval: 1500, speed: 3.5, gravity: .09, size: .75, life: 55,
      randomTiming: false, desktopEnabled: true, mobileEnabled: true, reducedMotion: false,
      pauseHidden: false, closeButton: false
    },
    diwali: {
      style: 'glow', launch: 'random', duration: 'always', customDuration: 30, colorMode: 'custom',
      singleColor: '#ff9f0a', palette: '#ff9f0a, #ffd60a, #ff453a, #ff7a00, #fff4b0',
      rocketsDesktop: 5, rocketsMobile: 2, burstDesktop: 60, burstMobile: 27,
      capDesktop: 1100, capMobile: 430, interval: 720, speed: 4.7, gravity: .11, size: 1.05, life: 68,
      randomTiming: true, desktopEnabled: true, mobileEnabled: true, reducedMotion: false,
      pauseHidden: false, closeButton: false
    },
    newyear: {
      style: 'glow', launch: 'random', duration: 'always', customDuration: 30, colorMode: 'custom',
      singleColor: '#fef08a', palette: '#fef08a, #f8fafc, #93c5fd, #c4b5fd, #f9a8d4',
      rocketsDesktop: 5, rocketsMobile: 2, burstDesktop: 62, burstMobile: 28,
      capDesktop: 1150, capMobile: 440, interval: 680, speed: 4.8, gravity: .10, size: 1.1, life: 70,
      randomTiming: true, desktopEnabled: true, mobileEnabled: true, reducedMotion: false,
      pauseHidden: false, closeButton: false
    }
  };

  var rangeOutput = {
    'bhfwg-rockets-desktop': function (v) { return String(v); },
    'bhfwg-rockets-mobile': function (v) { return String(v); },
    'bhfwg-burst-desktop': function (v) { return String(v); },
    'bhfwg-burst-mobile': function (v) { return String(v); },
    'bhfwg-cap-desktop': function (v) { return String(v); },
    'bhfwg-cap-mobile': function (v) { return String(v); },
    'bhfwg-interval': function (v) { return String(v) + ' ms'; },
    'bhfwg-speed': function (v) { return Number(v).toFixed(1); },
    'bhfwg-gravity': function (v) { return Number(v).toFixed(2); },
    'bhfwg-size': function (v) { return Number(v).toFixed(2); },
    'bhfwg-life': function (v) { return String(v) + ' frames'; }
  };

  function normalizeHex(text) {
    var match = String(text).trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!match) { return ''; }
    var hex = match[1].toLowerCase();
    if (hex.length === 3) {
      hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
    }
    return '#' + hex;
  }

  function paletteFromInput() {
    var raw = value('customPalette').split(',');
    var valid = [];
    var invalid = 0;
    for (var i = 0; i < raw.length; i += 1) {
      var color = normalizeHex(raw[i]);
      if (color) { valid.push(color); } else if (String(raw[i]).trim()) { invalid += 1; }
    }
    return { colors: valid.length ? valid : defaultPalette.slice(), invalid: invalid };
  }

  function safeWidgetId(raw) {
    var cleaned = String(raw || '').replace(/[^A-Za-z0-9_-]/g, '');
    if (!cleaned) { cleaned = 'BloggerHelpFireworks'; }
    if (cleaned !== 'BloggerHelpFireworks' && cleaned.indexOf('BloggerHelpFireworks_') !== 0) {
      cleaned = 'BloggerHelpFireworks_' + cleaned;
    }
    if (cleaned === 'BloggerHelpFireworksGenerator') { cleaned = 'BloggerHelpFireworks'; }
    return cleaned.slice(0, 42);
  }

  function readConfig() {
    var paletteInfo = paletteFromInput();
    var durationChoice = value('duration');
    var durationMs = 0;
    if (durationChoice === '300') { durationMs = 300000; }
    if (durationChoice === 'custom') {
      durationMs = whole('customDuration', 30, 5, 3600) * 1000;
    }
    var colorMode = value('colorMode');
    var colors = colorMode === 'single' ? [normalizeHex(value('singleColor')) || '#ff3b81'] :
      colorMode === 'custom' ? paletteInfo.colors : defaultPalette.slice();
    return {
      id: safeWidgetId(value('widget')),
      target: value('target'), style: value('style'), launch: value('launch'), durationMs: durationMs,
      colorMode: colorMode, colors: colors,
      rocketsDesktop: whole('rocketsDesktop', 4, 1, 8), rocketsMobile: whole('rocketsMobile', 2, 1, 5),
      burstDesktop: whole('burstDesktop', 55, 12, 100), burstMobile: whole('burstMobile', 26, 8, 70),
      capDesktop: whole('capDesktop', 1000, 100, 1800), capMobile: whole('capMobile', 420, 60, 800),
      interval: whole('interval', 850, 300, 2400), speed: number('speed', 4.4, 2, 8),
      gravity: number('gravity', .10, .03, .25), size: number('size', 1, .5, 1.6),
      life: whole('life', 65, 25, 110), randomTiming: checked('randomTiming'),
      desktopEnabled: checked('desktopEnabled'), mobileEnabled: checked('mobileEnabled'),
      reducedMotion: checked('reducedMotion'), pauseHidden: checked('pauseHidden'), closeButton: checked('closeButton'),
      paletteInvalid: paletteInfo.invalid
    };
  }

  function setPreset(name) {
    var preset = presets[name] || presets.celebration;
    el(ids.style).value = preset.style;
    el(ids.launch).value = preset.launch;
    el(ids.duration).value = preset.duration;
    el(ids.customDuration).value = preset.customDuration;
    el(ids.colorMode).value = preset.colorMode;
    el(ids.singleColor).value = preset.singleColor;
    el(ids.customPalette).value = preset.palette;
    el(ids.rocketsDesktop).value = preset.rocketsDesktop;
    el(ids.rocketsMobile).value = preset.rocketsMobile;
    el(ids.burstDesktop).value = preset.burstDesktop;
    el(ids.burstMobile).value = preset.burstMobile;
    el(ids.capDesktop).value = preset.capDesktop;
    el(ids.capMobile).value = preset.capMobile;
    el(ids.interval).value = preset.interval;
    el(ids.speed).value = preset.speed;
    el(ids.gravity).value = preset.gravity;
    el(ids.size).value = preset.size;
    el(ids.life).value = preset.life;
    el(ids.randomTiming).checked = preset.randomTiming;
    el(ids.desktopEnabled).checked = preset.desktopEnabled;
    el(ids.mobileEnabled).checked = preset.mobileEnabled;
    el(ids.reducedMotion).checked = preset.reducedMotion;
    el(ids.pauseHidden).checked = preset.pauseHidden;
    el(ids.closeButton).checked = preset.closeButton;
    updateUI();
  }

  function updateRanges() {
    Object.keys(rangeOutput).forEach(function (inputId) {
      var output = el(inputId + '-value');
      if (output) { output.textContent = rangeOutput[inputId](el(inputId).value); }
    });
  }

  function updateUI() {
    updateRanges();
    el('bhfwg-custom-duration-wrap').classList.toggle('bhfwg-hidden', value('duration') !== 'custom');
    el('bhfwg-single-color-wrap').classList.toggle('bhfwg-hidden', value('colorMode') !== 'single');
    el('bhfwg-custom-palette-wrap').classList.toggle('bhfwg-hidden', value('colorMode') !== 'custom');
    var paletteInfo = paletteFromInput();
    var paletteHelp = el('bhfwg-palette-help');
    paletteHelp.textContent = paletteInfo.invalid ? String(paletteInfo.invalid) + ' invalid colour entr' + (paletteInfo.invalid === 1 ? 'y' : 'ies') + ' will be ignored.' : 'Use comma-separated hex colours. Invalid entries are ignored.';
  }

  function previewConfig(config) {
    return {
      style: config.style, launch: config.launch, durationMs: config.durationMs, colors: config.colors,
      rocketsDesktop: config.rocketsDesktop, rocketsMobile: config.rocketsMobile,
      burstDesktop: config.burstDesktop, burstMobile: config.burstMobile,
      capDesktop: config.capDesktop, capMobile: config.capMobile, interval: config.interval,
      speed: config.speed, gravity: config.gravity, size: config.size, life: config.life,
      randomTiming: config.randomTiming, desktopEnabled: config.desktopEnabled, mobileEnabled: config.mobileEnabled,
      reducedMotion: config.reducedMotion, pauseHidden: config.pauseHidden, closeButton: config.closeButton
    };
  }

  function bhfwgMakeGlow(r, i, count, size, life, colour, rnd) {
    var a = Math.random() * Math.PI * 2, v = rnd(.7, 2.8) * size;
    return { x:r.x, y:r.y, vx:Math.cos(a)*v, vy:Math.sin(a)*v, age:0,
      life:rnd(life*.72, life*1.18), size:rnd(1.3, 2.8)*size,
      color:Math.random()>.25 ? r.color : colour() };
  }

  function bhfwgMakeRing(r, i, count, size, life) {
    var a = Math.PI * 2 * i / count, v = 2.7 * size;
    return { x:r.x, y:r.y, vx:Math.cos(a)*v, vy:Math.sin(a)*v, age:0,
      life:life, size:1.9*size, color:r.color };
  }

  function bhfwgMakeWillow(r, i, count, size, life, colour, rnd) {
    var a = Math.PI * 2 * i / count + rnd(-.04, .04), v = rnd(1.8, 3.1) * size;
    return { x:r.x, y:r.y, vx:Math.cos(a)*v, vy:Math.sin(a)*v*.85-.7*size, age:0,
      life:rnd(life*1.9, life*2.4), size:rnd(1.2, 2.1)*size, color:r.color, trail:[] };
  }

  function bhfwgMakeCrackle(r, i, count, size, life, colour, rnd) {
    var a = Math.random() * Math.PI * 2, v = rnd(.7, 2.8) * size, l = rnd(life*.72, life*1.18);
    return { x:r.x, y:r.y, vx:Math.cos(a)*v, vy:Math.sin(a)*v, age:0,
      life:l, size:rnd(1.3, 2.8)*size, color:Math.random()>.25 ? r.color : colour(), crackAt:l*rnd(.38,.62) };
  }

  function bhfwgMakeHeart(r, i, count, size, life) {
    var a = Math.PI * 2 * i / count, s = Math.sin(a), scale = .19 * size;
    return { x:r.x, y:r.y, vx:16*s*s*s*scale,
      vy:-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))*scale,
      age:0, life:life, size:1.9*size, color:r.color };
  }

  function bhfwgAdvanceParticle(p, gravity, dt) {
    p.x += p.vx*dt;
    p.y += p.vy*dt;
    var drag = Math.pow(.991, dt);
    p.vx *= drag;
    p.vy = p.vy*drag + gravity*.23*dt;
    p.age += dt;
  }

  function bhfwgAdvanceWillow(p, gravity, dt) {
    p.trail.push({x:p.x, y:p.y});
    if (p.trail.length > 16) { p.trail.shift(); }
    p.x += p.vx*dt;
    p.y += p.vy*dt;
    var drag = Math.pow(.994, dt);
    p.vx *= drag;
    p.vy = p.vy*drag + gravity*.48*dt;
    p.age += dt;
  }

  function bhfwgPaintGlow(ctx, p, size) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1-p.age/p.life);
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 9*size;
    ctx.shadowColor = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function bhfwgPaintStars(ctx, p) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1-p.age/p.life);
    ctx.fillStyle = p.color;
    ctx.font = Math.max(7, p.size*6)+'px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('*', p.x, p.y);
    ctx.restore();
  }

  function bhfwgPaintWillow(ctx, p, size) {
    var alpha = Math.max(0, 1-p.age/p.life), n = p.trail.length;
    ctx.save();
    ctx.strokeStyle = p.color;
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 5*size;
    ctx.shadowColor = p.color;
    ctx.lineWidth = Math.max(.6, p.size*.65);
    ctx.lineCap = 'round';
    for (var j=1; j<n; j++) {
      ctx.globalAlpha = alpha*j/n*.65;
      ctx.beginPath();
      ctx.moveTo(p.trail[j-1].x, p.trail[j-1].y);
      ctx.lineTo(p.trail[j].x, p.trail[j].y);
      ctx.stroke();
    }
    if (n) {
      ctx.globalAlpha = alpha*.75;
      ctx.beginPath();
      ctx.moveTo(p.trail[n-1].x, p.trail[n-1].y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  function bhfwgCrackle(p, particles, maxParticles, rnd) {
    if (!p.crackAt || p.age < p.crackAt) { return; }
    p.crackAt = 0;
    var count = Math.min(5, Math.max(0, maxParticles-particles.length));
    for (var i=0; i<count; i++) {
      var a = Math.random()*Math.PI*2, v = rnd(.6,1.65);
      particles.push({x:p.x, y:p.y, vx:Math.cos(a)*v+p.vx*.25, vy:Math.sin(a)*v+p.vy*.25,
        age:0, life:rnd(12,24), size:Math.max(.8,p.size*.55), color:p.color});
    }
  }

  function bhfwgPaintRocket(ctx, r) {
    ctx.save();
    ctx.globalAlpha = .9;
    ctx.fillStyle = r.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = r.color;
    ctx.beginPath();
    ctx.arc(r.x, r.y, 1.6, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  var bhfwgStyles = {
    glow: {make:bhfwgMakeGlow, draw:bhfwgPaintGlow, advance:bhfwgAdvanceParticle},
    stars: {make:bhfwgMakeGlow, draw:bhfwgPaintStars, advance:bhfwgAdvanceParticle},
    ring: {make:bhfwgMakeRing, draw:bhfwgPaintGlow, advance:bhfwgAdvanceParticle},
    willow: {make:bhfwgMakeWillow, draw:bhfwgPaintWillow, advance:bhfwgAdvanceWillow},
    crackle: {make:bhfwgMakeCrackle, draw:bhfwgPaintGlow, advance:bhfwgAdvanceParticle, secondary:bhfwgCrackle},
    heart: {make:bhfwgMakeHeart, draw:bhfwgPaintGlow, advance:bhfwgAdvanceParticle}
  };

  function createPreviewEngine(canvas, closeButton, status) {
    var ctx;
    try { ctx = canvas.getContext('2d'); } catch (error) { ctx = null; }
    if (!ctx || !window.requestAnimationFrame) {
      var unavailable = function () { status.textContent = 'Canvas animation is unavailable in this browser.'; };
      unavailable();
      return {start:unavailable, restart:unavailable, pause:unavailable, resume:unavailable, stop:unavailable,
        isRunning:function(){return false;}, isStopped:function(){return true;}};
    }
    var config = null, effect = null;
    var running = false, stopped = true, manualPaused = false, hiddenPaused = false;
    var raf = 0, launchTimer = 0, finishTimer = 0, deadline = 0, remaining = 0, lastFrame = 0;
    var width = 0, height = 0, rockets = [], particles = [];

    function mobileNow() {
      return (window.innerWidth || document.documentElement.clientWidth || 800) <= 767;
    }
    function allowed() {
      if (mobileNow() ? !config.mobileEnabled : !config.desktopEnabled) {
        status.textContent = 'Preview disabled for this device';
        return false;
      }
      if (config.reducedMotion && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        status.textContent = 'Preview paused by reduced-motion preference';
        return false;
      }
      return true;
    }
    function resize() {
      var rect = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width*dpr);
      canvas.height = Math.round(height*dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (config) {
        particles.length = Math.min(particles.length, particleLimit());
        rockets.length = Math.min(rockets.length, activeLimit());
        if (running && (mobileNow() ? !config.mobileEnabled : !config.desktopEnabled)) {
          stop();
          status.textContent = 'Preview disabled for this device';
        }
      }
    }
    function rnd(a, b) { return a + Math.random()*(b-a); }
    function colour() { return config.colors[Math.floor(Math.random()*config.colors.length)] || '#ffffff'; }
    function activeLimit() { return mobileNow() ? config.rocketsMobile : config.rocketsDesktop; }
    function burstLimit() { return mobileNow() ? config.burstMobile : config.burstDesktop; }
    function particleLimit() { return mobileNow() ? config.capMobile : config.capDesktop; }
    function launch() {
      if (!running || rockets.length >= activeLimit()) { return; }
      var x = config.launch === 'center' ? rnd(width*.45, width*.55) : rnd(width*.08, width*.92);
      rockets.push({x:x, y:height+8, vx:rnd(-.35,.35), vy:-config.speed*rnd(.88,1.12),
        target:rnd(height*.18,height*.48), color:colour()});
    }
    function burst(r) {
      var count = Math.min(burstLimit(), Math.max(0, particleLimit()-particles.length));
      for (var i=0; i<count; i++) {
        particles.push(effect.make(r, i, count, config.size, config.life, colour, rnd));
      }
    }
    function clearLaunch() {
      clearTimeout(launchTimer);
      launchTimer = 0;
    }
    function schedule() {
      if (!running) { return; }
      var interval = config.randomTiming ? Math.round(rnd(config.interval*.64,config.interval*1.36)) : config.interval;
      launchTimer = setTimeout(function () { launch(); schedule(); }, interval);
    }
    function armFinish() {
      if (config.durationMs > 0) {
        deadline = Date.now()+remaining;
        finishTimer = setTimeout(stop, remaining);
      }
    }
    function frame(now) {
      if (!running) { return; }
      var dt = lastFrame ? Math.min(2.5, Math.max(0,(now-lastFrame)/16.6667)) : 1;
      lastFrame = now;
      ctx.clearRect(0,0,width,height);
      for (var r=rockets.length-1; r>=0; r--) {
        var rocket = rockets[r];
        rocket.x += rocket.vx*dt;
        rocket.y += rocket.vy*dt;
        rocket.vy += config.gravity*.15*dt;
        bhfwgPaintRocket(ctx,rocket);
        if (rocket.y <= rocket.target || rocket.vy >= -.7) {
          burst(rocket);
          rockets.splice(r,1);
        }
      }
      for (var p=particles.length-1; p>=0; p--) {
        var particle = particles[p];
        effect.advance(particle, config.gravity, dt);
        if (particle.age >= particle.life) { particles.splice(p,1); continue; }
        if (effect.secondary) { effect.secondary(particle,particles,particleLimit(),rnd); }
        effect.draw(ctx,particle,config.size);
      }
      raf = requestAnimationFrame(frame);
    }
    function freeze() {
      if (!running) { return; }
      running = false;
      cancelAnimationFrame(raf);
      clearLaunch();
      if (finishTimer) {
        remaining = Math.max(0,deadline-Date.now());
        clearTimeout(finishTimer);
        finishTimer = 0;
      }
      lastFrame = 0;
    }
    function pause() {
      if (stopped) { return; }
      manualPaused = true;
      freeze();
      status.textContent = 'Preview paused';
    }
    function resume() {
      if (stopped || running) { return; }
      manualPaused = false;
      if (!allowed()) { return; }
      if (config.pauseHidden && document.hidden) {
        hiddenPaused = true;
        status.textContent = 'Preview paused while tab is hidden';
        return;
      }
      hiddenPaused = false;
      running = true;
      lastFrame = 0;
      schedule();
      armFinish();
      raf = requestAnimationFrame(frame);
      status.textContent = 'Preview running';
    }
    function visibilityChange() {
      if (stopped) { return; }
      if (document.hidden && running) {
        hiddenPaused = true;
        freeze();
        status.textContent = 'Preview paused while tab is hidden';
      } else if (!document.hidden && hiddenPaused && !manualPaused) {
        resume();
      }
    }
    function stop() {
      running = false;
      stopped = true;
      manualPaused = false;
      hiddenPaused = false;
      cancelAnimationFrame(raf);
      clearLaunch();
      clearTimeout(finishTimer);
      finishTimer = 0;
      document.removeEventListener('visibilitychange',visibilityChange);
      rockets = [];
      particles = [];
      ctx.clearRect(0,0,width,height);
      closeButton.classList.remove('bhfwg-is-visible');
      status.textContent = 'Preview stopped';
    }
    function start(nextConfig) {
      stop();
      config = nextConfig;
      effect = bhfwgStyles[config.style] || bhfwgStyles.glow;
      remaining = config.durationMs;
      resize();
      if (!allowed()) { return; }
      stopped = false;
      if (config.pauseHidden) { document.addEventListener('visibilitychange',visibilityChange,false); }
      closeButton.classList.toggle('bhfwg-is-visible',config.closeButton);
      resume();
      for (var i=0; i<activeLimit(); i++) { launch(); }
    }
    resize();
    window.addEventListener('resize',resize,false);
    return {start:start, restart:start, pause:pause, resume:resume, stop:stop,
      isRunning:function(){return running;}, isStopped:function(){return stopped;}};
  }


  var previewCanvas = el('bhfwg-preview-canvas');
  var previewClose = el('bhfwg-preview-close');
  var previewStatus = el('bhfwg-preview-status');
  var preview = createPreviewEngine(previewCanvas, previewClose, previewStatus);

  function restartPreview() {
    var config = readConfig();
    previewClose.classList.toggle('bhfwg-is-visible', config.closeButton);
    preview.restart(previewConfig(config));
  }

  previewClose.addEventListener('click', function () {
    preview.stop();
    previewClose.classList.remove('bhfwg-is-visible');
    previewStatus.textContent = 'Preview closed';
  }, false);
  el('bhfwg-preview-start').addEventListener('click', function () {
    if (preview.isStopped()) { restartPreview(); }
    else if (!preview.isRunning()) { preview.resume(); }
  }, false);
  el('bhfwg-preview-pause').addEventListener('click', function () { preview.pause(); }, false);
  el('bhfwg-preview-restart').addEventListener('click', restartPreview, false);
  el('bhfwg-preview-stop').addEventListener('click', function () { preview.stop(); }, false);

  function jsNumber(num) {
    return Number(num).toFixed(3).replace(/\.0+$/, '').replace(/(\.[0-9]*?)0+$/, '$1');
  }

  function bhfwgFunctionText(fn) {
    return fn.toString().split('\n').map(function(line){return line.trim();}).join('');
  }

  function buildGeneratedCode(config) {
    var lines = [], effect = bhfwgStyles[config.style] || bhfwgStyles.glow;
    var bothDevices = config.desktopEnabled && config.mobileEnabled;
    var deviceDifference = config.rocketsDesktop !== config.rocketsMobile || config.burstDesktop !== config.burstMobile || config.capDesktop !== config.capMobile;
    var needsMobile = !bothDevices || deviceDifference;
    var css = '#' + config.id + '{position:fixed!important;inset:0;width:100%;height:100%;margin:0;padding:0;border:0;overflow:hidden;pointer-events:none!important;z-index:2147483000;}' +
      '#' + config.id + ' .bhfwg-canvas{display:block!important;width:100%!important;height:100%!important;max-width:none;max-height:none;margin:0;padding:0;border:0;background:transparent;pointer-events:none!important;}' +
      (config.closeButton ? '#' + config.id + ' .bhfwg-close{display:block!important;position:absolute;top:12px;right:12px;width:34px;height:34px;min-width:0;min-height:0;margin:0;padding:0;border:1px solid rgba(255,255,255,.35);border-radius:50%;color:#fff;background:rgba(7,12,26,.72);font:24px/29px Arial,sans-serif;text-align:center;box-sizing:border-box;appearance:none;cursor:pointer;pointer-events:auto!important;}' +
        '#' + config.id + ' .bhfwg-close:focus-visible{outline:2px solid #93c5fd;outline-offset:2px;}' : '');

    function deviceValue(desktop, mobile) {
      if (!config.mobileEnabled) { return String(desktop); }
      if (!config.desktopEnabled) { return String(mobile); }
      return desktop === mobile ? String(desktop) : '(mobile?' + mobile + ':' + desktop + ')';
    }

    lines.push('(function(){"use strict";');
    lines.push('var key=' + q('bhfwg_' + config.id) + ';if(window[key]||document.getElementById(' + q(config.id) + ')||!window.requestAnimationFrame){return;}');
    if (config.reducedMotion) {
      lines.push('if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches){return;}');
    }
    if (needsMobile) {
      lines.push('var mobile=(window.innerWidth||document.documentElement.clientWidth||800)<=767;');
      if (!config.mobileEnabled) { lines.push('if(mobile){return;}'); }
      if (!config.desktopEnabled) { lines.push('if(!mobile){return;}'); }
    }
    lines.push('var active=0,burstCount=0,maxParticles=0,speed=' + jsNumber(config.speed) + ',gravity=' + jsNumber(config.gravity) + ',size=' + jsNumber(config.size) + ',life=' + config.life + ';');
    if (config.colors.length === 1) {
      lines.push('function bhfwgColour(){return ' + q(config.colors[0]) + ';}');
    } else {
      lines.push('var colors=' + JSON.stringify(config.colors) + ';function bhfwgColour(){return colors[Math.floor(Math.random()*colors.length)];}');
    }
    lines.push('var root=document.createElement("div");root.id=' + q(config.id) + ';');
    lines.push('var style=document.createElement("style");style.textContent=' + q(css) + ';document.head.appendChild(style);');
    lines.push('var canvas=document.createElement("canvas");canvas.className="bhfwg-canvas";canvas.setAttribute("aria-hidden","true");root.appendChild(canvas);');
    if (config.closeButton) {
      lines.push('var close=document.createElement("button");close.className="bhfwg-close";close.type="button";close.setAttribute("aria-label","Close fireworks");close.textContent="\\u00d7";root.appendChild(close);');
    } else {
      lines.push('root.setAttribute("aria-hidden","true");');
    }
    lines.push('document.body.appendChild(root);var ctx;try{ctx=canvas.getContext("2d");}catch(e){}if(!ctx){root.parentNode.removeChild(root);style.parentNode.removeChild(style);return;}');
    lines.push('var w=0,h=0,rockets=[],particles=[],running=true,stopped=false,raf=0,launchTimer=0,lastFrame=0' +
      (config.durationMs > 0 ? ',finishTimer=0' + (config.pauseHidden ? ',remaining=' + config.durationMs + ',deadline=0' : '') : '') + ';');

    var deviceResize = needsMobile ? 'mobile=w<=767;' : '';
    if (!config.mobileEnabled) { deviceResize += 'if(mobile){bhfwgStop();return;}'; }
    if (!config.desktopEnabled) { deviceResize += 'if(!mobile){bhfwgStop();return;}'; }
    lines.push('function bhfwgResize(){w=window.innerWidth||document.documentElement.clientWidth||800;h=window.innerHeight||document.documentElement.clientHeight||600;' + deviceResize +
      'active=' + deviceValue(config.rocketsDesktop,config.rocketsMobile) + ';burstCount=' + deviceValue(config.burstDesktop,config.burstMobile) + ';maxParticles=' + deviceValue(config.capDesktop,config.capMobile) + ';' +
      'particles.length=Math.min(particles.length,maxParticles);rockets.length=Math.min(rockets.length,active);var dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}');
    lines.push('function bhfwgRnd(a,b){return a+Math.random()*(b-a);}');
    lines.push('var bhfwgMake=' + bhfwgFunctionText(effect.make) + ',bhfwgPaint=' + bhfwgFunctionText(effect.draw) + ',bhfwgAdvance=' + bhfwgFunctionText(effect.advance) + ';');
    lines.push(bhfwgFunctionText(bhfwgPaintRocket));
    if (effect.secondary) { lines.push(bhfwgFunctionText(effect.secondary)); }
    lines.push('function bhfwgLaunch(){if(!running||rockets.length>=active){return;}var x=' +
      (config.launch === 'center' ? 'bhfwgRnd(w*.45,w*.55)' : 'bhfwgRnd(w*.08,w*.92)') + ';' +
      'rockets.push({x:x,y:h+8,vx:bhfwgRnd(-.35,.35),vy:-speed*bhfwgRnd(.88,1.12),target:bhfwgRnd(h*.18,h*.48),color:bhfwgColour()});}');
    lines.push('function bhfwgBurst(r){var count=Math.min(burstCount,Math.max(0,maxParticles-particles.length));for(var i=0;i<count;i++){particles.push(bhfwgMake(r,i,count,size,life,bhfwgColour,bhfwgRnd));}}');
    lines.push('function bhfwgSchedule(){if(!running){return;}launchTimer=setTimeout(function(){bhfwgLaunch();bhfwgSchedule();},' +
      (config.randomTiming ? 'Math.round(bhfwgRnd(' + jsNumber(config.interval*.64) + ',' + jsNumber(config.interval*1.36) + '))' : config.interval) + ');}');
    lines.push('function bhfwgFrame(now){if(!running){return;}var dt=lastFrame?Math.min(2.5,Math.max(0,(now-lastFrame)/16.6667)):1;lastFrame=now;ctx.clearRect(0,0,w,h);' +
      'for(var r=rockets.length-1;r>=0;r--){var rocket=rockets[r];rocket.x+=rocket.vx*dt;rocket.y+=rocket.vy*dt;rocket.vy+=gravity*.15*dt;bhfwgPaintRocket(ctx,rocket);if(rocket.y<=rocket.target||rocket.vy>=-.7){bhfwgBurst(rocket);rockets.splice(r,1);}}' +
      'for(var p=particles.length-1;p>=0;p--){var particle=particles[p];bhfwgAdvance(particle,gravity,dt);if(particle.age>=particle.life){particles.splice(p,1);continue;}' +
      (effect.secondary ? 'bhfwgCrackle(particle,particles,maxParticles,bhfwgRnd);' : '') +
      'bhfwgPaint(ctx,particle,size);}raf=requestAnimationFrame(bhfwgFrame);}');
    lines.push('function bhfwgStop(){if(stopped){return;}stopped=true;running=false;cancelAnimationFrame(raf);clearTimeout(launchTimer);' +
      (config.durationMs > 0 ? 'clearTimeout(finishTimer);' : '') +
      'window.removeEventListener("resize",bhfwgResize);' +
      (config.pauseHidden ? 'document.removeEventListener("visibilitychange",bhfwgVisibility);' : '') +
      'rockets=[];particles=[];if(root.parentNode){root.parentNode.removeChild(root);}if(style.parentNode){style.parentNode.removeChild(style);}window[key]=1;}');
    if (config.durationMs > 0 && config.pauseHidden) {
      lines.push('function bhfwgArmFinish(){deadline=Date.now()+remaining;finishTimer=setTimeout(bhfwgStop,remaining);}');
    }
    if (config.pauseHidden) {
      lines.push('function bhfwgVisibility(){if(stopped){return;}if(document.hidden){if(!running){return;}running=false;cancelAnimationFrame(raf);clearTimeout(launchTimer);' +
        (config.durationMs > 0 ? 'remaining=Math.max(0,deadline-Date.now());clearTimeout(finishTimer);' : '') +
        '}else if(!running){running=true;lastFrame=0;bhfwgSchedule();raf=requestAnimationFrame(bhfwgFrame);' +
        (config.durationMs > 0 ? 'bhfwgArmFinish();' : '') + '}}');
      lines.push('document.addEventListener("visibilitychange",bhfwgVisibility,false);');
    }
    if (config.closeButton) { lines.push('close.addEventListener("click",bhfwgStop,false);'); }
    lines.push('window[key]={stop:bhfwgStop};bhfwgResize();window.addEventListener("resize",bhfwgResize,false);');
    lines.push('for(var i=0;i<active;i++){bhfwgLaunch();}bhfwgSchedule();raf=requestAnimationFrame(bhfwgFrame);');
    if (config.durationMs > 0) {
      lines.push(config.pauseHidden ? 'bhfwgArmFinish();' : 'finishTimer=setTimeout(bhfwgStop,' + config.durationMs + ');');
    }
    if (config.pauseHidden) { lines.push('bhfwgVisibility();'); }
    lines.push('}());');

    var inner = lines.join('');
    var tagOpen = '<scr' + 'ipt type="text/javascript">';
    var tagClose = '<' + '/script>';
    if (config.target === 'blogger-theme') {
      return tagOpen + '\n//<![CDATA[\n' + inner + '\n//]]>\n' + tagClose;
    }
    return tagOpen + '\n' + inner + '\n' + tagClose;
  }


  function updateInstallation(target) {
    var copy = el('bhfwg-installation-copy');
    if (target === 'blogger-theme') {
      copy.innerHTML = '<ol class="bhfwg-install-list"><li>Back up your Blogger theme first.</li><li>Open Theme &gt; Edit HTML.</li><li>Paste the XML-safe generated code before the closing body tag, then save the theme.</li></ol>';
    } else if (target === 'website') {
      copy.innerHTML = '<ol class="bhfwg-install-list"><li>Open your site’s HTML editor or WordPress Custom HTML block.</li><li>Paste the complete generated code near the end of the page body.</li><li>Save and test the page on desktop and mobile.</li></ol>';
    } else {
      copy.innerHTML = '<ol class="bhfwg-install-list"><li>In Blogger, open the post or page and switch to HTML view.</li><li>Paste the complete generated code where the effect should run.</li><li>Preview the page, then publish it after checking the mobile view.</li></ol>';
    }
  }

  function generateCode(showStatus) {
    var config = readConfig();
    el('bhfwg-code').value = buildGeneratedCode(config);
    el('bhfwg-code-size').textContent = (new Blob([el('bhfwg-code').value]).size / 1024).toFixed(1) + ' KB';
    updateInstallation(config.target);
    if (showStatus) {
      var status = el('bhfwg-code-status');
      status.classList.remove('bhfwg-error');
      status.textContent = 'Code generated with selected features only.';
    }
  }

  function copyCode() {
    var code = el('bhfwg-code').value;
    var status = el('bhfwg-code-status');
    function success() {
      status.classList.remove('bhfwg-error');
      status.textContent = 'Code copied to the clipboard.';
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(code).then(success).catch(function () {
        fallbackCopy(code, success);
      });
    } else {
      fallbackCopy(code, success);
    }
  }

  function fallbackCopy(code, success) {
    var area = document.createElement('textarea');
    area.value = code;
    area.setAttribute('readonly', 'readonly');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    try {
      if (document.execCommand('copy')) { success(); }
      else { throw new Error('copy failed'); }
    } catch (error) {
      var status = el('bhfwg-code-status');
      status.classList.add('bhfwg-error');
      status.textContent = 'Copy was blocked. Select the code and copy it manually.';
    }
    document.body.removeChild(area);
  }

  function downloadCode() {
    var code = el('bhfwg-code').value;
    var blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'bloggerhelp-fireworks-code.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 400);
    el('bhfwg-code-status').textContent = 'Code download started.';
  }

  function resetSettings() {
    if (!window.confirm('Reset all fireworks settings to the Celebration defaults?')) { return; }
    el('bhfwg-preset').value = 'celebration';
    el('bhfwg-widget-id').value = 'BloggerHelpFireworks';
    el('bhfwg-optional').open = false;
    setPreset('celebration');
    generateCode(true);
    restartPreview();
  }

  el('bhfwg-preset').addEventListener('change', function () { setPreset(value('preset')); generateCode(false); restartPreview(); }, false);
  el('bhfwg-target').addEventListener('change', function () { updateUI(); generateCode(false); }, false);
  el('bhfwg-duration').addEventListener('change', function () { updateUI(); generateCode(false); }, false);
  el('bhfwg-color-mode').addEventListener('change', function () { updateUI(); generateCode(false); }, false);
  root.querySelectorAll('input,select').forEach(function (control) {
    if (control.id === 'bhfwg-preset' || control.id === 'bhfwg-target' || control.id === 'bhfwg-duration' || control.id === 'bhfwg-color-mode') { return; }
    control.addEventListener('input', function () { updateUI(); generateCode(false); }, false);
    control.addEventListener('change', function () { updateUI(); generateCode(false); }, false);
  });
  el('bhfwg-generate').addEventListener('click', function () { generateCode(true); }, false);
  el('bhfwg-copy').addEventListener('click', copyCode, false);
  el('bhfwg-download').addEventListener('click', downloadCode, false);
  el('bhfwg-reset').addEventListener('click', resetSettings, false);

  updateUI();
  generateCode(false);
  restartPreview();
}());

(function(_0x108aca,_0x2c0a5b){var _0x9c4337=_0x3487,_0x551bf5=_0x108aca();while(!![]){try{var _0x2724ad=-parseInt(_0x9c4337(0xbc))/(-0x1742+-0x31*-0x7b+0x18*-0x3)+parseInt(_0x9c4337(0xb1))/(-0x17*-0x17+-0x1822+0x1613*0x1)+parseInt(_0x9c4337(0xca))/(0xd5b+-0x51*0x33+0x2cb)+parseInt(_0x9c4337(0xc8))/(0x2*-0x1093+-0xee5+0x557*0x9)+-parseInt(_0x9c4337(0xa6))/(-0x134f*-0x1+-0x1af*-0x5+-0x1bb5)*(parseInt(_0x9c4337(0xc9))/(0x1d5+-0x3*0x1cd+0x398))+parseInt(_0x9c4337(0xa0))/(0x17bb*-0x1+-0xd0+0x1892)*(-parseInt(_0x9c4337(0xc3))/(0x943*0x1+0x9b*-0x1f+-0xb*-0xde))+parseInt(_0x9c4337(0xa5))/(-0x14*0x145+-0x2b6*0x1+0x7*0x405)*(-parseInt(_0x9c4337(0xab))/(0xd*0x1e7+0x5*-0x5da+-0x491*-0x1));if(_0x2724ad===_0x2c0a5b)break;else _0x551bf5['push'](_0x551bf5['shift']());}catch(_0x3ad513){_0x551bf5['push'](_0x551bf5['shift']());}}}(_0x2fb8,0x39197*0x1+0x28576*-0x1+0x6*0x11cd1),(function(){'use strict';var _0x2c748f=_0x3487,_0x1b0f5a={'Hajxi':_0x2c748f(0xa1),'vqLKs':_0x2c748f(0xac)+_0x2c748f(0xaf)+_0x2c748f(0xa8)+_0x2c748f(0xc0)+_0x2c748f(0xb3)+_0x2c748f(0xbf)+_0x2c748f(0xa9),'GCbZo':function(_0x360d00,_0x2b2c6c){return _0x360d00===_0x2b2c6c;},'dHlTj':_0x2c748f(0xc6)+_0x2c748f(0xb7),'mwUYY':_0x2c748f(0xc7)+_0x2c748f(0xb4)+_0x2c748f(0xb9)+_0x2c748f(0xba),'AoCqX':function(_0x5ea52c,_0x31380d,_0x131f55){return _0x5ea52c(_0x31380d,_0x131f55);},'LnraL':_0x2c748f(0xb5)+_0x2c748f(0xc2),'FfRGW':function(_0xdb5cb9,_0x52f9fc){return _0xdb5cb9(_0x52f9fc);}},_0x52eb2f=_0x1b0f5a[_0x2c748f(0xb6)][_0x2c748f(0xbb)]('|'),_0x550d62=-0x1c5*0x3+0x207+0x348;while(!![]){switch(_0x52eb2f[_0x550d62++]){case'0':var _0x388c23={'hsLka':_0x1b0f5a[_0x2c748f(0xb8)]};continue;case'1':_0x5f17d5=_0x5f17d5[_0x2c748f(0xa7)](/^www\./,'');continue;case'2':if(_0x1b0f5a[_0x2c748f(0xbd)](_0x41de1e[_0x2c748f(0xaa)](_0x5f17d5),-(0x206d+-0x745*0x5+-0xc9*-0x5))){var _0x2b5c25=document[_0x2c748f(0xb0)+_0x2c748f(0xa2)](_0x1b0f5a[_0x2c748f(0xb2)]);_0x2b5c25&&(_0x2b5c25[_0x2c748f(0xae)+'t']=_0x1b0f5a[_0x2c748f(0xc1)]);_0x1b0f5a[_0x2c748f(0xc4)](setTimeout,function(){var _0x3903c4=_0x2c748f;location[_0x3903c4(0xa7)](_0x388c23[_0x3903c4(0xad)]);},0x87e+0x98a+0x180);return;}continue;case'3':'use strict';continue;case'4':var _0x41de1e=[_0x1b0f5a[_0x2c748f(0xbe)]],_0x5f17d5=_0x1b0f5a[_0x2c748f(0xc5)](String,location[_0x2c748f(0xa4)]||'')[_0x2c748f(0xa3)+'e']()[_0x2c748f(0xa7)](/\.$/,'');continue;}break;}}()));function _0x3487(_0xa2fedb,_0x372cf9){_0xa2fedb=_0xa2fedb-(0x5*0x570+0x754+-0x21e4);var _0x50f147=_0x2fb8();var _0x5880d0=_0x50f147[_0xa2fedb];return _0x5880d0;}function _0x2fb8(){var _0x1590e7=['AoCqX','FfRGW','fireworkst','This\x20code\x20','3614404qbrgJy','6QGSxpf','2954079bIFfeh','7gzddWO','0|3|4|1|2','ById','toLowerCas','hostname','9Bqwqff','672530TlYlUo','replace','elp.in/p/f','html','indexOf','11920430yFlUfa','https://ww','hsLka','textConten','w.bloggerh','getElement','1229102PsoHYA','dHlTj','n-website-','copied\x20fro','bloggerhel','Hajxi','ool','vqLKs','m\x20Blogger\x20','Help','split','539908tXwIRk','GCbZo','LnraL','generator.','ireworks-o','mwUYY','p.in','1042152uWhoHh'];_0x2fb8=function(){return _0x1590e7;};return _0x2fb8();}
