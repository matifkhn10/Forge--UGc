// ═══════════════════════════════════════
//  VideoAd Forge — Full Engine
// ═══════════════════════════════════════

// ─── App State ───
const state = {
    platform: 'tiktok', adStyle: 'hook', tone: 'casual',
    duration: '30', videoStyle: 'neon', format: 'portrait',
    generated: null
};

// ─── Chip Groups ───
function setupChips(id, key) {
    const g = document.getElementById(id);
    if (!g) return;
    g.querySelectorAll('.chip').forEach(c => {
        c.addEventListener('click', () => {
            g.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
            c.classList.add('active');
            state[key] = c.dataset.value;
            if (key === 'videoStyle' || key === 'format') refreshCanvasSize();
        });
    });
}
setupChips('platformGroup', 'platform');
setupChips('styleGroup',    'adStyle');
setupChips('toneGroup',     'tone');
setupChips('durationGroup', 'duration');
setupChips('videoStyleGroup','videoStyle');
setupChips('formatGroup',   'format');

// ─── Tabs ───
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
        btn.classList.add('active');
        document.getElementById('tab' + cap(btn.dataset.tab)).classList.remove('hidden');
    });
});
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ─── Generate ───
document.getElementById('generateBtn').addEventListener('click', doGenerate);
document.getElementById('regenerateBtn').addEventListener('click', doGenerate);
document.getElementById('copyAllBtn').addEventListener('click', () => copyText(buildPlain()));
document.getElementById('downloadScriptBtn').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([buildPlain()], { type: 'text/plain' }));
    a.download = `VideoAd_Script_${Date.now()}.txt`;
    a.click();
});
document.querySelectorAll('.copy-btn').forEach(b =>
    b.addEventListener('click', () => {
        const el = document.getElementById(b.dataset.target);
        if (el) copyText(el.innerText);
    })
);

// ═══════════════════════════════════════
//  CONTENT LIBRARIES
// ═══════════════════════════════════════
const HOOKS = {
    hook: {
        casual:['POV: you finally found the product that changes everything 👀',
                'Wait — I almost scrolled past this too. Don\'t.',
                'Okay I need to talk about {{P}} because WOW.',
                'Can we talk about how {{P}} has completely changed my routine?'],
        hype: ['🚨 STOP SCROLLING. {{P}} just dropped and it\'s INSANE.',
               '⚡ Nobody is talking about THIS and I don\'t understand why.',
               '🔥 If you\'re {{A}}, you NEED to see this RIGHT now.',
               '{{P}} just broke the internet and for good reason.'],
        emotional:['I didn\'t think {{P}} would change my life. I was wrong.',
                   'I almost didn\'t try {{P}}. That would\'ve been my biggest mistake.',
                   'This is the product I wish existed years ago.'],
        educational:['Here\'s why every {{A}} needs {{P}}:',
                     'I tested {{P}} for 30 days. Here\'s exactly what happened:',
                     'The honest truth about {{P}} that no one is saying:'],
    },
    problem: {
        casual:['If {{PP}} is ruining your day, this is for you.',
                'I was so tired of {{PP}} until I found {{P}}.'],
        hype:  ['{{PP}} HAD ME DOWN BAD. Then {{P}} entered the chat. 💀',
                'SICK of {{PP}}?! I found the solution — {{P}}.'],
        emotional:['I\'m so glad I don\'t have to deal with {{PP}} anymore.'],
        educational:['{{PP}} is more common than you think — here\'s the fix:'],
    },
    results: {
        casual:['30-day {{P}} results. Didn\'t expect this at all.',
                'Before {{P}} vs after: here\'s the truth.'],
        hype:  ['THE RESULTS FROM {{P}} ARE UNREAL. I\'m in shock. 🤯'],
        emotional:['I cried seeing my {{P}} results. I finally feel like myself.'],
        educational:['Here\'s the measurable data from 30 days of {{P}}:'],
    },
    hype: {
        casual:['{{P}} dropped and I SPRINTED to get it.'],
        hype:  ['WAIT. {{P}} just released and it GOES HARD. 🔥🔥',
                'THE HYPE IS REAL. {{P}} JUST CHANGED THE GAME. PERIOD.'],
        emotional:['I\'ve never been so excited to recommend something.'],
        educational:['Why {{P}} is the most anticipated release this year:'],
    },
    review: {
        casual:['Real talk — {{P}} is actually worth it. Honest review.',
                'I\'ve had {{P}} for 3 months. Here\'s what nobody tells you.'],
        hype:  ['{{P}} is not playing around. This is the review you NEED.'],
        emotional:['After struggling with {{PP}}, {{P}} was the answer I needed.'],
        educational:['I analysed {{P}} vs the competition. Here\'s what the data says:'],
    },
};

const VO = {
    casual: {
        hook:  d => `Okay so I NEED to tell you about ${d.p} because honestly? It changed everything for me.`,
        body:  d => [
            `As a ${d.a}, I deal with ${d.pp || 'this problem'} constantly.`,
            `I tried everything. Nothing worked. Until I found ${d.p}.`,
            `Here's what blew my mind: ${d.b[0] || 'it actually works'}.`,
            `But that's not even the best part — ${d.b[1] || 'it\'s super easy to use'}.`,
            `And honestly? ${d.b[2] || 'I can\'t imagine going back'}.`,
        ],
        cta:   d => `If you're a ${d.a}, you NEED this. Link in bio — and trust me, you'll thank me later. ${d.o ? d.o + '.' : ''}`,
    },
    hype: {
        hook:  d => `YO. Stop what you're doing RIGHT NOW. ${d.p} just dropped and I am NOT okay.`,
        body:  d => [
            `Listen, I've been a ${d.a} for years. I know what's good.`,
            `THIS IS GOOD. Like, insanely, stupidly good.`,
            `${d.b[0] || 'Feature one hits different'}. WHAT?!`,
            `And then — ${d.b[1] || 'feature two makes it even better'}. I literally screamed.`,
            `${d.b[2] ? d.b[2] + '?? Are you KIDDING me?!' : 'There\'s more?? Are you KIDDING me?!'}`,
        ],
        cta:   d => `CLICK. THE. LINK. RIGHT. NOW. ${d.o ? d.o + '.' : ''} You will NOT regret it. Let's GOOO 🔥`,
    },
    emotional: {
        hook:  d => `I don't usually share stuff like this, but ${d.p} genuinely made a difference and I had to tell you.`,
        body:  d => [
            `For a long time, ${d.pp || 'this issue'} really got to me. It affected everything.`,
            `I tried other solutions. Nothing felt right.`,
            `Then someone recommended ${d.p} and I almost didn't try it.`,
            `But I'm so glad I did. ${d.b[0] || 'The difference was immediate'}.`,
            `It's the little things. ${d.b[1] || 'It just works'}.`,
        ],
        cta:   d => `If you're dealing with ${d.pp || 'this'} too, I genuinely hope you try ${d.p}. Link in bio. You deserve to feel this good ❤️`,
    },
    educational: {
        hook:  d => `I'm going to break down exactly why ${d.p} is the best solution for ${d.a} — based on real results.`,
        body:  d => [
            `The problem: ${d.pp || 'the common issue'} affects most ${d.a} but gets overlooked.`,
            `${d.p} solves this by focusing on three key areas.`,
            `Number one: ${d.b[0] || 'core benefit one'}.`,
            `Number two: ${d.b[1] || 'core benefit two'}.`,
            `And three — this one surprised me: ${d.b[2] || 'core benefit three'}.`,
        ],
        cta:   d => `The data doesn't lie. ${d.p} is the smart choice. ${d.o ? d.o + '. ' : ''}Link in bio for full details.`,
    },
};

const CTA_MAP = {
    tiktok:  d => `👆 Link in bio — ${d.o || 'grab yours now'} before it sells out!`,
    reels:   d => `🔗 Link in bio! ${d.o ? d.o + ' — ' : ''}Shop ${d.p} now. Save this post ⬆️`,
    shorts:  d => `⬇️ Description link for ${d.p}! ${d.o || 'Limited stock'} — grab it while you can.`,
    youtube: d => `Click the link below to get ${d.p} now. ${d.o ? d.o + '. ' : ''}Don't miss out!`,
};

const BROLL = {
    tech:['Close-up of device screen lighting up','Hands interacting with product at desk','Split-screen before/after using product','Product rotating on clean surface','User reacting positively to results','Lifestyle shot: product in real-world setting'],
    beauty:['Skin texture close-up before/after','Product bottle in soft natural light','Slow-motion application on skin','Mirror selfie reaction shot','Flat lay of product with aesthetic props'],
    fitness:['Workout montage clips synced to beat','Progress comparison shots side by side','Product in gym bag setting','Close-up of supplement being prepared','Post-workout satisfied expression'],
    food:['Slow-motion food pour or sizzle shot','Close-up of texture and steam rising','Reaction face on first bite','Finished dish vs unmade comparison','Product in bright clean kitchen'],
    fashion:['Outfit flat lay with aesthetic lighting','360° view walk in outfit','Fabric texture detail close-up','Different styling ways montage','Mirror try-on with genuine reaction'],
    home:['Room before vs after product','Satisfying unboxing/assembly','Product in daily routine use','Overhead shelfie shot','Family reacting positively'],
    pet:['Pet first reaction (priceless!)','Slow-mo pet playing with product','Owner and pet enjoying together','Pet happy face close-up'],
    finance:['App dashboard screen recording','Person\'s relieved face looking at phone','Chart/graph showing growth','Typing on laptop with app open'],
    education:['Student engaged and focused','Course progress bar screen','Notebook with highlights','Lightbulb moment reaction face'],
    travel:['Stunning destination B-roll','Packing montage with product','Arrival reaction shot','Product used at landmark'],
};

const MUSIC = {
    casual:     { mood:'Chill & Relatable', genre:'Lo-fi hip hop / soft indie', tempo:'80–100 BPM', sfx:'Light pings, soft transitions' },
    hype:       { mood:'High Energy', genre:'Trap / EDM / Phonk', tempo:'130–160 BPM', sfx:'Whooshes, bass drops' },
    emotional:  { mood:'Warm & Touching', genre:'Soft piano / cinematic indie', tempo:'60–80 BPM', sfx:'Minimal — let audio breathe' },
    educational:{ mood:'Clean & Professional', genre:'Corporate upbeat / minimal electronic', tempo:'100–120 BPM', sfx:'Click sounds, light transitions' },
};

const HASHTAGS = {
    tech:['#techreview','#gadgets','#techfyp','#newtech','#innovation'],
    beauty:['#skincare','#beautytips','#glowup','#skintok','#selfcare'],
    fitness:['#fitness','#gymtok','#workout','#fitnessmotivation','#gains'],
    food:['#foodtok','#foodreview','#yummy','#foodie','#cooking'],
    fashion:['#fashion','#ootd','#style','#outfitinspo','#styletok'],
    home:['#homeinspo','#homedecor','#homehacks','#lifestyle'],
    pet:['#petlife','#dogtok','#cattok','#petsoftiktok'],
    finance:['#financetok','#moneytips','#investing','#sidehustle'],
    education:['#learntok','#studytok','#skills','#selfimprovement'],
    travel:['#traveltok','#wanderlust','#travellife','#explore'],
};
const PLAT_TAGS = {
    tiktok:['#fyp','#foryou','#viral'],
    reels:['#reels','#explore','#reelsviral'],
    shorts:['#shorts','#youtubeshorts'],
    youtube:['#youtube','#review'],
};

// ═══════════════════════════════════════
//  MAIN GENERATOR
// ═══════════════════════════════════════
function doGenerate() {
    const p  = document.getElementById('productName').value.trim();
    const a  = document.getElementById('audience').value.trim();
    if (!p) { shake(document.getElementById('productName')); return; }
    if (!a) { shake(document.getElementById('audience')); return; }

    const rawB = document.getElementById('benefits').value.trim();
    const b = rawB.split('\n').map(x => x.replace(/^[•\-\*]\s*/,'').trim()).filter(Boolean);
    const o  = document.getElementById('offer').value.trim();
    const pp = document.getElementById('painPoint').value.trim();
    const cat = document.getElementById('productCategory').value;
    const data = { p, a, b, o, pp, cat };

    const btn = document.getElementById('generateBtn');
    btn.classList.add('loading');
    btn.innerHTML = '<span class="btn-icon">⏳</span> Generating…';

    setTimeout(() => {
        state.generated = buildContent(data);
        renderScript(state.generated);
        renderAssets(state.generated);
        showOutputUI();
        if (videoGen) videoGen.loadData(state.generated);
        btn.classList.remove('loading');
        btn.innerHTML = '<span class="btn-icon">⚡</span> Generate Script + Video Ad';
    }, 800);
}

function buildContent(data) {
    const { p, a, b, o, pp, cat } = data;
    const { platform, adStyle, tone, duration } = state;

    const pool = (HOOKS[adStyle]?.[tone] || HOOKS.hook.casual)
        .map(h => h.replace(/\{\{P\}\}/g,p).replace(/\{\{A\}\}/g,a).replace(/\{\{PP\}\}/g,pp||'this problem'));
    const hook = pick(pool);

    const voSrc = VO[tone] || VO.casual;
    const voHook = voSrc.hook(data);
    const voBody = voSrc.body(data);
    const voCTA  = voSrc.cta(data);
    const cta    = (CTA_MAP[platform] || CTA_MAP.tiktok)(data);

    const scenes = buildScenes(parseInt(duration)||30, { p, a, b, pp, o, hook, cta });
    const broll  = shuffle([...( BROLL[cat] || BROLL.tech )]).slice(0,5);
    const music  = MUSIC[tone] || MUSIC.casual;
    const tags   = shuffle([...( HASHTAGS[cat] || HASHTAGS.tech )]).concat(PLAT_TAGS[platform]||[]);
    const caption = buildCaption(data, tone);

    return { p, a, b, o, pp, cat, hook, voHook, voBody, voCTA, cta, scenes, broll, music, tags, caption, platform, adStyle, tone, duration };
}

function buildScenes(dur, d) {
    if (dur <= 15) return [
        { time:'0–3s',  action:'HOOK — Pattern interrupt', visual:`Close-up face-cam OR shocking result. Text: "${d.hook.slice(0,40)}…"` },
        { time:'3–10s', action:'PRODUCT DEMO', visual:`Quick cuts: product in use, key features. Fast-paced with trending audio.` },
        { time:'10–15s',action:'CTA', visual:`Point to camera. Text: "${d.cta.slice(0,50)}". Link sticker.` },
    ];
    if (dur <= 30) return [
        { time:'0–3s',  action:'HOOK — Grab attention', visual:`Pattern interrupt. Text: "${d.hook.slice(0,40)}…"` },
        { time:'3–8s',  action:'PROBLEM — Pain point', visual:`Show the problem visually. Relatable scenario for ${d.a}.` },
        { time:'8–18s', action:'PRODUCT DEMO — Solution', visual:`Product in action. 3–4 cuts showing key benefits. On-screen text labels.` },
        { time:'18–25s',action:'RESULTS / PROOF', visual:`Show result or transformation. Before → After or testimonial clip.` },
        { time:'25–30s',action:'CTA — Drive action', visual:`Direct to camera + urgency. Text overlay + link sticker.` },
    ];
    return [
        { time:'0–3s',  action:'HOOK — Viral-worthy opener', visual:`Shocking hook or bold statement.` },
        { time:'3–12s', action:'STORY INTRO — Personal connection', visual:`"Let me tell you my story…" — emotional connection with ${d.a}.` },
        { time:'12–22s',action:'PROBLEM DEEP DIVE', visual:`Sell the frustration of ${d.pp || 'the problem'}. Make viewers feel it.` },
        { time:'22–35s',action:'PRODUCT REVEAL + DEMO', visual:`First reveal of ${d.p}. Step-by-step demo of top 4 features.` },
        { time:'35–50s',action:'RESULTS & SOCIAL PROOF', visual:`Before/after results. Numbers, stats, testimonials.` },
        { time:'50–55s',action:'OBJECTION HANDLING', visual:`Address 1–2 objections confidently.` },
        { time:'55–60s',action:'POWER CTA', visual:`"Click the link RIGHT NOW." ${d.o || ''}` },
    ];
}

function buildCaption(d, tone) {
    const intro = {
        casual:    `okay so ${d.p} just became my new obsession 😭✨`,
        hype:      `${d.p} IS NOT A JOKE. I am fully obsessed 🔥🔥`,
        emotional: `I didn't expect ${d.p} to mean this much to me.`,
        educational:`Honest breakdown of ${d.p} for ${d.a} — no fluff.`,
    };
    const bText = d.b.slice(0,3).map(x => `✅ ${x}`).join('\n') || `✅ ${d.p} just works.`;
    return `${intro[tone]||intro.casual}\n\n${bText}${d.o?'\n\n🏷️ '+d.o:''}\n\n🔗 Link in bio`;
}

// ─── Render Script ───
function renderScript(c) {
    document.getElementById('outputMeta').innerHTML =
        [platLabel(c.platform), styleLabel(c.adStyle), toneLabel(c.tone), c.duration+'s']
        .map(t => `<span class="meta-tag">${t}</span>`).join('');

    document.getElementById('hookContent').innerHTML = `
        <div style="font-size:1.05rem;font-weight:700;color:#fff;border-left:3px solid var(--accent);padding-left:1rem;margin-bottom:.7rem;">${c.hook}</div>
        <div style="color:var(--muted);font-size:.82rem;">💡 Deliver this within the FIRST 3 seconds — no intro, no greeting.</div>`;

    document.getElementById('scenesContent').innerHTML = c.scenes.map(s => `
        <div class="scene-item">
            <div class="scene-time">${s.time}</div>
            <div class="scene-content">
                <div class="scene-action">${s.action}</div>
                <div class="scene-visual">${s.visual}</div>
            </div>
        </div>`).join('');

    document.getElementById('voiceoverContent').innerHTML =
        [c.voHook, ...c.voBody, c.voCTA].map(l => `<div class="vo-line">${l}</div>`).join('');

    document.getElementById('ctaContent').innerHTML = `
        <div style="font-size:1rem;font-weight:600;color:#fff;margin-bottom:.5rem;">${c.cta}</div>
        <div style="color:var(--muted);font-size:.82rem;">💡 Point directly at camera. Add link sticker or screen overlay.</div>`;
}

function renderAssets(c) {
    document.getElementById('brollContent').innerHTML = c.broll.map((item,i)=>`
        <div class="broll-item"><div class="broll-num">${i+1}</div><div>${item}</div></div>`).join('');

    document.getElementById('musicContent').innerHTML = `
        <div class="music-grid">
            <div class="music-item"><div class="music-label">Mood</div><div class="music-value">${c.music.mood}</div></div>
            <div class="music-item"><div class="music-label">Genre</div><div class="music-value">${c.music.genre}</div></div>
            <div class="music-item"><div class="music-label">Tempo</div><div class="music-value">${c.music.tempo}</div></div>
            <div class="music-item"><div class="music-label">SFX</div><div class="music-value">${c.music.sfx}</div></div>
        </div>`;

    document.getElementById('hashtagContent').innerHTML = c.tags
        .map(t=>`<span class="hashtag-tag" onclick="copyText('${t}')">${t}</span>`).join('');

    document.getElementById('captionContent').innerHTML =
        `<div style="white-space:pre-line;font-size:.92rem;color:#d1d5db;">${c.caption}</div>`;
}

function showOutputUI() {
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('outputTabs').classList.remove('hidden');
    // Show Video tab first
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t=>t.classList.add('hidden'));
    document.querySelector('[data-tab="video"]').classList.add('active');
    document.getElementById('tabVideo').classList.remove('hidden');
}

function buildPlain() {
    const c = state.generated;
    if (!c) return '';
    const sections = [
        ['🪝 HOOK', c.hook],
        ['🎬 SCENES', c.scenes.map(s=>`[${s.time}] ${s.action}\n  ${s.visual}`).join('\n\n')],
        ['🎙️ VOICEOVER', [c.voHook,...c.voBody,c.voCTA].join('\n\n')],
        ['📣 CTA', c.cta],
        ['📷 B-ROLL', c.broll.map((b,i)=>`${i+1}. ${b}`).join('\n')],
        ['🎵 MUSIC', `Mood: ${c.music.mood} | Genre: ${c.music.genre} | Tempo: ${c.music.tempo}`],
        ['#️⃣ HASHTAGS', c.tags.join(' ')],
        ['✍️ CAPTION', c.caption],
    ];
    return `VideoAd Forge — Generated Script\n${'='.repeat(40)}\n\n`
        + sections.map(([n,v])=>`${n}\n${'-'.repeat(30)}\n${v}`).join('\n\n');
}

// ═══════════════════════════════════════
//  VIDEO GENERATOR CLASS
// ═══════════════════════════════════════
class VideoAdGenerator {
    constructor() {
        this.canvas  = document.getElementById('adCanvas');
        this.ctx     = this.canvas.getContext('2d');
        this.data    = null;
        this.frame   = 0;
        this.fps     = 30;
        this.animId  = null;
        this.recorder= null;
        this.chunks  = [];
        this.isRunning = false;
        this.particles = [];
        this.videoBlob = null;
        this.setSize();
    }

    setSize() {
        const fmt = state.format;
        if (fmt === 'portrait')  { this.W = 540;  this.H = 960;  }
        else if (fmt==='square') { this.W = 720;  this.H = 720;  }
        else                     { this.W = 960;  this.H = 540;  }
        this.canvas.width  = this.W;
        this.canvas.height = this.H;
        // Scale canvas display
        const maxW = document.getElementById('canvasContainer').clientWidth || 400;
        const scale = Math.min(1, maxW / this.W);
        this.canvas.style.width  = (this.W * scale) + 'px';
        this.canvas.style.height = (this.H * scale) + 'px';
    }

    loadData(d) { this.data = d; this.setSize(); }

    // ─── Themes ───
    get theme() {
        const themes = {
            neon:  { bg1:'#020212', bg2:'#0d0830', accent:'#00f0ff', accent2:'#7c3aed', text:'#ffffff', sub:'#a5f3fc' },
            fire:  { bg1:'#0a0000', bg2:'#1a0500', accent:'#ff4500', accent2:'#ff8c00', text:'#ffffff', sub:'#fcd34d' },
            ocean: { bg1:'#000d1a', bg2:'#001833', accent:'#00b4d8', accent2:'#0077b6', text:'#ffffff', sub:'#90e0ef' },
            gold:  { bg1:'#0a0800', bg2:'#1a1200', accent:'#f59e0b', accent2:'#d97706', text:'#ffffff', sub:'#fde68a' },
            clean: { bg1:'#f8fafc', bg2:'#e2e8f0', accent:'#6366f1', accent2:'#4f46e5', text:'#0f172a', sub:'#475569' },
        };
        return themes[state.videoStyle] || themes.neon;
    }

    // ─── Particles ───
    initParticles() {
        this.particles = Array.from({ length: 60 }, () => ({
            x: Math.random() * this.W,
            y: Math.random() * this.H,
            r: Math.random() * 2.5 + 0.5,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -(Math.random() * 0.6 + 0.1),
            a: Math.random() * 0.5 + 0.1,
        }));
    }

    drawParticles() {
        const t = this.theme;
        this.particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.y < -5) { p.y = this.H + 5; p.x = Math.random() * this.W; }
            if (p.x < -5 || p.x > this.W + 5) p.x = Math.random() * this.W;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            this.ctx.fillStyle = t.accent + Math.round(p.a * 255).toString(16).padStart(2,'0');
            this.ctx.fill();
        });
    }

    // ─── Background ───
    drawBG(progress) {
        const { ctx, W, H } = this;
        const t = this.theme;
        const grad = ctx.createLinearGradient(0, 0, W * 0.5, H);
        grad.addColorStop(0, t.bg1);
        grad.addColorStop(1, t.bg2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
        // Glow blobs
        const g1 = ctx.createRadialGradient(W*0.8, H*0.2, 0, W*0.8, H*0.2, W*0.5);
        g1.addColorStop(0, t.accent + '22'); g1.addColorStop(1, 'transparent');
        ctx.fillStyle = g1; ctx.fillRect(0,0,W,H);
        const g2 = ctx.createRadialGradient(W*0.1, H*0.8, 0, W*0.1, H*0.8, W*0.4);
        g2.addColorStop(0, t.accent2 + '22'); g2.addColorStop(1, 'transparent');
        ctx.fillStyle = g2; ctx.fillRect(0,0,W,H);
        this.drawParticles();
    }

    // ─── Text Helpers ───
    wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = []; let line = '';
        words.forEach(w => {
            const test = line ? line + ' ' + w : w;
            if (this.ctx.measureText(test).width > maxWidth && line) {
                lines.push(line); line = w;
            } else { line = test; }
        });
        if (line) lines.push(line);
        return lines;
    }

    drawCenteredText(text, x, y, maxWidth, color, size, weight='700', alpha=1, shadow=true) {
        const { ctx } = this;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `${weight} ${size}px Outfit, sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (shadow) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
        }
        const lines = this.wrapText(text, maxWidth);
        const lh = size * 1.25;
        const totalH = lines.length * lh;
        lines.forEach((l, i) => ctx.fillText(l, x, y - totalH/2 + i * lh + lh/2));
        ctx.restore();
        return lines.length * lh;
    }

    drawBadge(text, x, y, color) {
        const { ctx } = this;
        ctx.save();
        ctx.font = '600 22px Outfit, sans-serif';
        const w = ctx.measureText(text).width + 40;
        const h = 44;
        ctx.beginPath();
        ctx.roundRect(x - w/2, y - h/2, w, h, 22);
        ctx.fillStyle = color + '33';
        ctx.fill();
        ctx.strokeStyle = color + '88';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    drawProgressBar() {
        const { ctx, W, H } = this;
        const dur = (parseInt(state.duration)||30) * this.fps;
        const pct = Math.min(this.frame / dur, 1);
        const bh = 4, y = H - bh;
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(0, y, W, bh);
        const grad = ctx.createLinearGradient(0,0,W,0);
        grad.addColorStop(0, this.theme.accent);
        grad.addColorStop(1, this.theme.accent2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, y, W * pct, bh);
    }

    easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    easeIn(t)  { return Math.pow(t, 2); }

    // ─── Scenes ───
    getScene() {
        const dur = (parseInt(state.duration)||30) * this.fps;
        const f   = this.frame;
        const pct = f / dur;
        if (pct < 0.12)  return { id:'hook',     p: pct / 0.12 };
        if (pct < 0.30)  return { id:'problem',  p: (pct-0.12)/0.18 };
        if (pct < 0.70)  return { id:'benefits', p: (pct-0.30)/0.40 };
        if (pct < 0.88)  return { id:'proof',    p: (pct-0.70)/0.18 };
        return                  { id:'cta',      p: (pct-0.88)/0.12  };
    }

    renderFrame() {
        const { ctx, W, H, data } = this;
        if (!data) return;
        const scene = this.getScene();
        const t     = this.theme;

        this.drawBG(scene.p);

        const cx = W / 2, cy = H / 2;

        switch (scene.id) {
            case 'hook': {
                const alpha = scene.p < 0.15 ? this.easeOut(scene.p/0.15) : 1;
                const slideY = scene.p < 0.15 ? (1-this.easeOut(scene.p/0.15))*60 : 0;
                // Hook label
                this.drawBadge('🪝 HOOK', cx, cy - 220 + slideY, t.accent);
                // Hook text
                ctx.font = `800 ${W*0.065}px Outfit, sans-serif`;
                this.drawCenteredText(data.hook, cx, cy + slideY, W*0.82, t.text, W*0.065, '800', alpha);
                // Sub
                this.drawCenteredText('Watch till the end 👇', cx, cy + 170 + slideY, W*0.7, t.sub, W*0.038, '500', alpha*0.8, false);
                // Glow line
                ctx.save();
                ctx.globalAlpha = alpha * 0.6;
                const gl = ctx.createLinearGradient(W*0.1, 0, W*0.9, 0);
                gl.addColorStop(0,'transparent'); gl.addColorStop(0.5, t.accent); gl.addColorStop(1,'transparent');
                ctx.strokeStyle = gl; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(W*0.1, cy+120+slideY); ctx.lineTo(W*0.9, cy+120+slideY); ctx.stroke();
                ctx.restore();
                break;
            }
            case 'problem': {
                const alpha = scene.p < 0.2 ? this.easeOut(scene.p/0.2) : 1;
                this.drawBadge('😤 THE PROBLEM', cx, cy - 240, t.accent2);
                this.drawCenteredText(data.pp || 'The problem most people face…', cx, cy, W*0.78, t.text, W*0.058, '700', alpha);
                // Voiceover line 1
                const vl = data.voBody[0] || '';
                this.drawCenteredText(vl, cx, cy + 180, W*0.75, t.sub, W*0.035, '400', alpha*0.85, false);
                break;
            }
            case 'benefits': {
                const bens = data.b.length ? data.b : ['Premium quality','Easy to use','Guaranteed results'];
                const numB = Math.min(bens.length, 4);
                const bIdx = Math.floor(scene.p * numB);
                const bProgress = (scene.p * numB) - bIdx;
                const alpha = bProgress < 0.25 ? this.easeOut(bProgress/0.25) : 1;
                const slideX = bProgress < 0.25 ? (1-this.easeOut(bProgress/0.25))*80 : 0;

                this.drawBadge('✅ BENEFITS', cx, cy - 260, t.accent);
                this.drawCenteredText(data.p, cx, cy - 180, W*0.8, t.accent, W*0.07, '900', 1 - slideX*0.01);

                // Render all benefits, highlight current
                bens.slice(0, numB).forEach((ben, i) => {
                    const isActive = i === bIdx;
                    const past     = i < bIdx;
                    const by = cy - 80 + i * (W * 0.065);
                    const a  = past ? 0.5 : (isActive ? alpha : 0.15);
                    const sz = isActive ? W*0.052 : W*0.042;
                    const tx = cx + (isActive ? -slideX : 0);
                    ctx.save();
                    ctx.globalAlpha = a;
                    ctx.font = `${isActive?'700':'400'} ${sz}px Outfit, sans-serif`;
                    ctx.fillStyle = isActive ? t.text : t.sub;
                    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    if (isActive) { ctx.shadowColor = t.accent; ctx.shadowBlur = 15; }
                    ctx.fillText((past?'✅ ':'▶ ') + ben, tx, by);
                    ctx.restore();
                });
                break;
            }
            case 'proof': {
                const alpha = scene.p < 0.2 ? this.easeOut(scene.p/0.2) : 1;
                this.drawBadge('🏆 RESULTS', cx, cy - 240, t.accent);
                // Count-up numbers
                const val = Math.round(scene.p * 10000);
                this.drawCenteredText(val.toLocaleString() + '+ customers', cx, cy - 60, W*0.8, t.accent, W*0.075, '900', alpha);
                this.drawCenteredText('can\'t be wrong', cx, cy + 50, W*0.75, t.text, W*0.05, '600', alpha);
                // Stars
                ctx.save(); ctx.globalAlpha = alpha;
                ctx.font = `${W*0.06}px sans-serif`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('⭐⭐⭐⭐⭐', cx, cy + 140);
                ctx.restore();
                this.drawCenteredText(data.p, cx, cy + 210, W*0.8, t.sub, W*0.038, '500', alpha*0.7, false);
                break;
            }
            case 'cta': {
                const pulse = 1 + Math.sin(this.frame * 0.15) * 0.03;
                const alpha = scene.p < 0.2 ? this.easeOut(scene.p/0.2) : 1;
                // Glow circle
                ctx.save();
                ctx.globalAlpha = 0.15 * alpha;
                const gc = ctx.createRadialGradient(cx,cy,0,cx,cy,W*0.4);
                gc.addColorStop(0,t.accent); gc.addColorStop(1,'transparent');
                ctx.fillStyle = gc; ctx.fillRect(0,0,W,H);
                ctx.restore();

                this.drawCenteredText('🔥 LIMITED OFFER', cx, cy - 230, W*0.7, t.accent, W*0.038, '700', alpha*0.9);
                ctx.save(); ctx.scale(pulse,pulse); ctx.translate(cx*(1-pulse), cy*(1-pulse));
                this.drawCenteredText(data.p, cx, cy - 120, W*0.82, t.accent, W*0.072, '900', alpha);
                ctx.restore();
                if (data.o) this.drawCenteredText(data.o, cx, cy, W*0.78, t.sub, W*0.05, '700', alpha);
                this.drawCenteredText(data.cta, cx, cy + (data.o?110:60), W*0.78, t.text, W*0.04, '500', alpha*0.9, false);
                // CTA Button
                ctx.save();
                ctx.globalAlpha = alpha;
                const bw=W*0.65, bh2=W*0.12, bx=cx-bw/2, by=cy+200;
                const bg2 = ctx.createLinearGradient(bx,0,bx+bw,0);
                bg2.addColorStop(0,t.accent); bg2.addColorStop(1,t.accent2);
                ctx.beginPath(); ctx.roundRect(bx,by,bw,bh2,bh2/2);
                ctx.fillStyle=bg2; ctx.fill();
                ctx.shadowColor=t.accent; ctx.shadowBlur=30;
                ctx.font=`700 ${W*0.042}px Outfit, sans-serif`;
                ctx.fillStyle='#000'; ctx.textAlign='center'; ctx.textBaseline='middle';
                ctx.fillText('👆 TAP LINK IN BIO', cx, by+bh2/2);
                ctx.restore();
                break;
            }
        }

        // Watermark
        ctx.save(); ctx.globalAlpha=0.35;
        ctx.font=`500 ${W*0.025}px Outfit, sans-serif`;
        ctx.fillStyle=this.theme.text; ctx.textAlign='right'; ctx.textBaseline='top';
        ctx.fillText('VideoAd Forge', W-14, 14);
        ctx.restore();

        this.drawProgressBar();
        this.frame++;
    }

    stop() {
        if (this.animId) { cancelAnimationFrame(this.animId); this.animId=null; }
        if (this.recorder && this.recorder.state==='recording') this.recorder.stop();
        this.isRunning = false;
    }

    preview() {
        if (!this.data) return;
        this.stop();
        this.frame = 0;
        this.initParticles();
        this.isRunning = true;
        const dur = (parseInt(state.duration)||30) * this.fps;
        const loop = () => {
            if (!this.isRunning) return;
            this.renderFrame();
            if (this.frame < dur) this.animId = requestAnimationFrame(loop);
            else this.isRunning = false;
        };
        loop();
    }

    record() {
        if (!this.data) return;
        this.stop();
        this.frame = 0;
        this.chunks = [];
        this.videoBlob = null;
        this.initParticles();
        this.isRunning = true;

        const dur    = (parseInt(state.duration)||30) * this.fps;
        const stream = this.canvas.captureStream(this.fps);
        const mime   = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
                        ? 'video/webm;codecs=vp9' : 'video/webm';

        this.recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8000000 });
        this.recorder.ondataavailable = e => { if (e.data.size>0) this.chunks.push(e.data); };
        this.recorder.onstop = () => {
            this.videoBlob = new Blob(this.chunks, { type: 'video/webm' });
            onRecordDone(this.videoBlob);
        };
        this.recorder.start(100);

        const loop = () => {
            if (!this.isRunning) return;
            this.renderFrame();
            const pct = this.frame / dur;
            updateRecProgress(pct, this.frame);
            if (this.frame < dur) { this.animId = requestAnimationFrame(loop); }
            else { this.recorder.stop(); this.isRunning = false; }
        };
        loop();
    }
}

// ─── Video Controls ───
const videoGen = new VideoAdGenerator();

function refreshCanvasSize() { videoGen.setSize(); }

document.getElementById('previewBtn').addEventListener('click', () => {
    if (!state.generated) { alert('Generate your ad script first!'); return; }
    videoGen.preview();
    document.getElementById('stopBtn').classList.remove('hidden');
    document.getElementById('previewBtn').classList.add('hidden');
    setTimeout(() => {
        document.getElementById('stopBtn').classList.add('hidden');
        document.getElementById('previewBtn').classList.remove('hidden');
    }, (parseInt(state.duration)||30)*1000 + 500);
});

document.getElementById('stopBtn').addEventListener('click', () => {
    videoGen.stop();
    document.getElementById('stopBtn').classList.add('hidden');
    document.getElementById('previewBtn').classList.remove('hidden');
});

document.getElementById('recordBtn').addEventListener('click', () => {
    if (!state.generated) { alert('Generate your ad script first!'); return; }
    const btn = document.getElementById('recordBtn');
    btn.classList.add('recording');
    btn.textContent = '⏺ Recording…';
    document.getElementById('canvasOverlay').classList.remove('hidden');
    document.getElementById('downloadReady').classList.add('hidden');
    document.getElementById('downloadReady').classList.add('hidden');
    videoGen.record();
});

function updateRecProgress(pct, frame) {
    document.getElementById('recBar').style.width = (pct*100)+'%';
    const cur  = Math.round(frame / 30);
    const total= parseInt(state.duration)||30;
    document.getElementById('recTime').textContent = `${cur}s / ${total}s`;
}

function onRecordDone(blob) {
    document.getElementById('canvasOverlay').classList.add('hidden');
    const btn = document.getElementById('recordBtn');
    btn.classList.remove('recording');
    btn.textContent = '⏺ Record & Download Video';
    document.getElementById('downloadReady').classList.remove('hidden');
    const url = URL.createObjectURL(blob);
    document.getElementById('dlBtn').onclick = () => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `VideoAd_${state.generated?.p||'Ad'}_${state.duration}s_${Date.now()}.webm`;
        a.click();
    };
}

// ─── Helpers ───
function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function shuffle(arr) { return arr.sort(()=>Math.random()-0.5); }
function shake(el) {
    el.style.borderColor='#f87171'; el.focus();
    setTimeout(()=>el.style.borderColor='',1500);
}
function copyText(text) {
    navigator.clipboard.writeText(text).catch(()=>{
        const t=document.createElement('textarea');
        t.value=text; document.body.appendChild(t); t.select();
        document.execCommand('copy'); document.body.removeChild(t);
    });
    const toast=document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'),2200);
}
function platLabel(p) { return {tiktok:'TikTok',reels:'Reels',shorts:'YT Shorts',youtube:'YouTube Ad'}[p]||p; }
function styleLabel(s) { return {hook:'🪝 Hook',review:'💬 Review',problem:'😤 Problem→Sol',results:'✨ Results',hype:'📣 Hype'}[s]||s; }
function toneLabel(t)  { return {casual:'😎 Casual',hype:'⚡ Hype',emotional:'🥺 Emotional',educational:'🧠 Educational'}[t]||t; }
