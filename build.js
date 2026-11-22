/* Сборка сайта без зависимостей: content/*.json + static/ → dist/
   Запуск: node build.js  (Netlify запускает его сам при каждом изменении в админке) */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const read = (name) => JSON.parse(fs.readFileSync(path.join(ROOT, 'content', name + '.json'), 'utf8'));

/* ---------- помощники ---------- */
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// **жирный** в текстах из админки превращается в <strong>
const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const tel = (s) => 'tel:' + String(s).replace(/[^\d+]/g, '');
const attrNum = (name, v) => (v ? ` ${name}="${esc(v)}"` : '');
const list = (a) => (Array.isArray(a) ? a : []);
const safeJson = (o) => JSON.stringify(o).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const kind = (t) => (t === 'shoulder' ? 'shoulder' : 'spine');

/* ---------- данные ---------- */
const g = read('general');
const hero = read('hero');
const lect = read('lecturer');
const clips = read('clips');
const sched = read('schedule');
const sem = read('seminars');
const aud = read('audience');
const reg = read('registration');
let layout = {};
try { layout = read('layout'); } catch (e) { layout = {}; }
const show = (k) => layout[k] !== false; /* блок показывается, пока в админке не выключен */
let theme = {};
try { theme = read('theme'); } catch (e) { theme = {}; }

/* ---------- цвета из админки (меняются только те, что отличаются от стандартных) ---------- */
const THEME_DEFAULT = { dark: '#0B1D31', dark_deep: '#07131F', paper: '#F4F7FA', blue: '#1F66B0', signal: '#E8653A' };
const hex = (v) => (/^#[0-9a-fA-F]{6}$/.test(String(v || '').trim()) ? String(v).trim() : '');
const tv = (k) => { const c = hex(theme[k]); return c && c.toLowerCase() !== THEME_DEFAULT[k].toLowerCase() ? c : ''; };
const themeVars = [];
if (tv('dark')) themeVars.push(`--navy:${tv('dark')}`, `--ink:${tv('dark')}`);
if (tv('dark_deep')) themeVars.push(`--navy-deep:${tv('dark_deep')}`);
if (tv('paper')) themeVars.push(`--paper:${tv('paper')}`);
if (tv('blue')) themeVars.push(`--blue:${tv('blue')}`, `--blue-tint:color-mix(in srgb,${tv('blue')} 12%,#fff)`);
if (tv('signal')) themeVars.push(`--signal:${tv('signal')}`, `--signal-ink:color-mix(in srgb,${tv('signal')} 75%,#000)`, `--signal-tint:color-mix(in srgb,${tv('signal')} 12%,#fff)`);
const themeStyle = themeVars.length ? `<style>:root{${themeVars.join(';')}}</style>` : '';

/* ---------- блоки страницы ---------- */
const header = `
<header class="top">
  <div class="wrap">
    <div class="brands">
${list(g.logos).map((l) => `      <img src="${esc(l.image)}" alt="${esc(l.alt)}"${attrNum('width', l.width)}${attrNum('height', l.height)}>`).join('\n')}
    </div>
    ${show('registration') ? `<a class="btn btn-copper btn-small" href="#register">${esc(g.header_button)}</a>` : ''}
  </div>
</header>`;

const p = hero.portrait || {};
const heroSec = `
<section class="hero">
  <div class="wrap">
    <div>
      <h1>${esc(hero.title)}</h1>
      <p class="lead">${rich(hero.lead)}</p>
      <div class="hero-actions">
        ${show('registration') ? `<a class="btn btn-copper" href="#register">${esc(hero.button_primary)}</a>` : ''}
        ${show('schedule') ? `<a class="btn btn-ghost" href="#program">${esc(hero.button_secondary)}</a>` : ''}
      </div>
      <dl class="facts">
${list(hero.facts).map((f) => `        <div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('\n')}
      </dl>
    </div>

    <figure class="portrait">
      <div class="portrait-card">
        <img src="${esc(p.image)}" alt="${esc(p.alt)}" width="1002" height="640">
        <figcaption>
          <b>${esc(p.name)}</b>
          <span>${esc(p.title)}</span>
          <small>${esc(p.affiliation)}</small>
          <p class="degrees-title">${esc(p.degrees_title)}</p>
          <ul class="degrees">
${list(p.degrees).map((d) => `            <li><b>${esc(d.degree)},</b> ${esc(d.institution)}</li>`).join('\n')}
          </ul>
        </figcaption>
      </div>
    </figure>
  </div>
</section>`;

const lecturerSec = `
<section class="sec sec-white" id="lecturer">
  <div class="wrap">
    <div class="lect-grid">
      <figure class="lect-photo">
        <img src="${esc(lect.photo)}" alt="${esc(lect.photo_alt)}" width="560" height="745" loading="lazy">
      </figure>
      <div class="trainer">
        <h2>${esc(lect.heading)}</h2>
        <p class="role">${esc(lect.role)}</p>
        <p class="uni">${esc(lect.university)}</p>
        <blockquote>${esc(lect.quote)}</blockquote>
      </div>
    </div>
    <div class="pillars">
${list(lect.pillars).map((x) => `      <article>
        <h3>${esc(x.title)}</h3>
        <p>${esc(x.text)}</p>
      </article>`).join('\n')}
    </div>
  </div>
</section>`;

const clipsSec = `
<section class="sec sec-dark" id="clips">
  <div class="wrap clips">
    <div>
      <h2>${esc(clips.heading)}</h2>
      <p class="sec-intro" style="margin-bottom:0">${esc(clips.intro)}</p>
      <ul class="clips-list">
${list(clips.items).map((x, i) => `        <li><i>${i + 1}</i><b>${esc(x.title)}</b><span>${esc(x.text)}</span></li>`).join('\n')}
      </ul>
    </div>
    <figure class="clip" id="clip">
      <span class="clip-badge">${esc(clips.badge)}</span>
      <video id="clipVideo" preload="metadata" playsinline loop controlslist="nodownload" poster="${esc(clips.poster)}" src="${esc(clips.video)}"></video>
      <button class="clip-play" id="clipPlay" type="button" aria-label="${esc(clips.play_label)}"><span class="ico"></span>${esc(clips.play_label)}</button>
    </figure>
  </div>
</section>`;

const scheduleSec = `
<section class="sec" id="program">
  <div class="wrap">
    <h2>${esc(sched.heading)}</h2>
    <p class="sec-intro">${esc(sched.intro)}</p>

    <div class="days" role="list">
      <div class="days-head">${esc(sched.group_1)}</div>
      <div class="days-head">${esc(sched.group_2)}</div>
${list(sched.days).map((d) => `      <div class="day ${kind(d.type)}" role="listitem"><b>${esc(d.number)}</b><span>${esc(d.weekday)}</span><em>${esc(d.time)}</em></div>`).join('\n')}
    </div>
  </div>
</section>`;

const programItem = (i) => i.highlight
  ? `          <li class="hot"><strong>${esc(i.text)}</strong>${i.details ? `<span>${esc(i.details)}</span>` : ''}</li>`
  : `          <li>${esc(i.text)}</li>`;

const seminarsSec = `
<section class="sec sec-white">
  <div class="wrap">
    <h2>${esc(sem.heading)}</h2>
    <p class="sec-intro">${esc(sem.intro)}</p>

    <div class="sem-grid">
${list(sem.items).map((s) => `      <article class="sem ${kind(s.type)}">
        <h3>${esc(s.title)}</h3>
        <p class="sem-meta">${esc(s.meta)}</p>
        <ul class="prog">
${list(s.program).map(programItem).join('\n')}
        </ul>
        <div class="sem-foot">
${list(s.prices).length ? `          <div class="prices">
${list(s.prices).map((x) => `            <div class="price"><b>${esc(x.amount)}</b><span>${esc(x.label)}</span></div>`).join('\n')}
          </div>` : ''}
          ${show('registration') ? `<button class="btn btn-primary" type="button" data-pick="${kind(s.type)}">${esc(s.button)}</button>` : ''}
        </div>
      </article>`).join('\n\n')}
    </div>

${show('offer') ? `    <div class="offer">
      <div>
        <h3>${esc(sem.offer.title)}</h3>
        <p>${esc(sem.offer.text)}</p>
${sem.offer.price ? `        <div class="offer-price"><b>${esc(sem.offer.price)}</b>${sem.offer.old_price ? `<s>${esc(sem.offer.old_price)}</s>` : ''}${sem.offer.badge ? `<span>${esc(sem.offer.badge)}</span>` : ''}</div>` : ''}
      </div>
      ${show('registration') ? `<button class="btn btn-copper" type="button" data-pick="both">${esc(sem.offer.button)}</button>` : ''}
    </div>` : ''}
  </div>
</section>`;

const audienceSec = `
<section class="sec">
  <div class="wrap">
    <h2>${esc(aud.heading)}</h2>
    <p class="sec-intro">${esc(aud.intro)}</p>
    <ul class="aud">
${list(aud.items).map((x) => `      <li>${esc(x)}</li>`).join('\n')}
    </ul>
  </div>
</section>`;

const L = reg.labels || {};
const plansList = list(reg.plans);
const hasChecked = plansList.some((x) => x.checked);
const registerSec = `
<section class="sec sec-dark" id="register">
  <div class="wrap reg">
    <div>
      <h2>${esc(reg.heading)}</h2>
      <p class="sec-intro" style="margin-bottom:0">${esc(reg.intro)}</p>
      <div class="contacts">
        <div class="contact"><span>${esc(reg.contact_name)}</span><a href="${esc(tel(reg.contact_phone))}">${esc(reg.contact_phone)}</a></div>
      </div>
    </div>

    <form class="form" id="form" novalidate>
      <fieldset class="field">
        <legend>${esc(reg.plan_legend)}</legend>
${plansList.map((x, i) => `        <label class="opt"><input type="radio" name="plan" value="${esc(x.key)}"${x.checked || (!hasChecked && i === 0) ? ' checked' : ''}><span><b>${esc(x.title)}</b><small>${esc(x.subtitle)}</small></span>${x.price_label ? `<span class="p">${esc(x.price_label)}</span>` : ''}</label>`).join('\n')}
      </fieldset>

      <div class="row2">
        <div class="field"><label for="name">${esc(L.name)}</label><input type="text" id="name" autocomplete="name" required></div>
        <div class="field"><label for="phone">${esc(L.phone)}</label><input type="tel" id="phone" autocomplete="tel" placeholder="${esc(L.phone_placeholder)}" required></div>
      </div>
      <div class="row2">
        <div class="field"><label for="email">${esc(L.email)} <small>${esc(L.email_hint)}</small></label><input type="email" id="email" autocomplete="email" inputmode="email" placeholder="name@gmail.com" required></div>
        <div class="field"><label for="prof">${esc(L.profession)}</label>
          <select id="prof">
            <option value="">${esc(L.profession_placeholder)}</option>
${list(reg.professions).map((x) => `            <option>${esc(x)}</option>`).join('\n')}
          </select>
        </div>
      </div>
      <div class="field"><label for="msg">${esc(L.message)} <small>${esc(L.message_hint)}</small></label><textarea id="msg"></textarea></div>

      <p class="err" id="err" role="alert">${esc(reg.error_text)}</p>

      <div class="send">
        <button class="btn btn-wa" type="button" id="send">${esc(reg.send_button)}</button>
      </div>
      <p class="status" id="status" role="status" aria-live="polite"></p>
      <div class="after" id="after" hidden>
        <a class="btn btn-wa" id="waLink" href="#" target="_blank" rel="noopener">${esc(reg.whatsapp_button)}</a>
      </div>
      <div class="cal" id="cal" hidden>
        <p>${rich(reg.calendar_text)}</p>
        <a class="btn btn-line" id="calLink" href="#" target="_blank" rel="noopener">${esc(reg.calendar_button)}</a>
      </div>
      <p class="note">${esc(reg.note)}</p>
    </form>
  </div>
</section>`;

const footer = `
<footer>
  <div class="wrap">
    <div>${esc(g.footer_text)}</div>
    <div>${list(g.footer_contacts).map((c) => `<a href="${esc(tel(c.phone))}">${esc(c.phone)}</a> (${esc(c.label)})`).join(' и ')}</div>
  </div>
</footer>`;

/* ---------- настройки для app.js ---------- */
const compact = (t) => String(t || '').replace(':', '') + '00';
const SITE = {
  pixelId: g.meta_pixel_id || '',
  sheetUrl: g.sheet_url || '',
  waNumber: String(g.whatsapp_number || '').replace(/\D/g, ''),
  waIntro: reg.whatsapp_intro,
  statusText: reg.status_text,
  savingText: reg.saving_text,
  saveErrorText: reg.save_error_text,
  calendar: {
    start: compact(reg.calendar_time_start),
    end: compact(reg.calendar_time_end),
    tz: reg.calendar_timezone,
    location: reg.calendar_location,
    details: reg.calendar_details,
  },
  plans: {},
};
plansList.forEach((x) => {
  SITE.plans[x.key] = {
    waText: x.whatsapp_text,
    sheetName: x.sheet_name,
    calTitle: x.calendar_title,
    calStart: String(x.calendar_start || '').replace(/-/g, ''),
    calDays: x.calendar_days || 1,
  };
});

const pixelNoscript = g.meta_pixel_id
  ? `<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${esc(g.meta_pixel_id)}&ev=PageView&noscript=1" alt=""></noscript>`
  : '';

/* ---------- итоговая страница ---------- */
const html = `<!DOCTYPE html>
<html lang="${esc(g.lang || 'ru')}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(g.title)}</title>
<meta name="description" content="${esc(g.description)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
${themeStyle}
</head>
<body>
${pixelNoscript}
${header}

<main>
${show('hero') ? heroSec : ''}
${show('lecturer') ? lecturerSec : ''}
${show('clips') ? clipsSec : ''}
${show('schedule') ? scheduleSec : ''}
${show('seminars') ? seminarsSec : ''}
${show('audience') ? audienceSec : ''}
${show('registration') ? registerSec : ''}
</main>
${footer}

<script>window.SITE=${safeJson(SITE)};</script>
<script src="/js/app.js" defer></script>
</body>
</html>
`;

/* ---------- запись в dist ---------- */
fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'static'), DIST, { recursive: true });
fs.writeFileSync(path.join(DIST, 'index.html'), html);
console.log('Готово: dist/index.html (' + Math.round(html.length / 1024) + ' КБ)');
