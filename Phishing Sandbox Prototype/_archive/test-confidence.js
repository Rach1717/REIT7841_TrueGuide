/* ============================================================
   TrueGuide 反诈小课堂 — 开课小测试 / 结课小测试（信心自评）
   test.html?phase=pre   学习前
   test.html?phase=post  学习后（题目完全相同）
   一屏一题，1–5 分大按钮，可以跳过、可以回上一题，不计时。
   ============================================================ */

(function () {
    'use strict';

    const phase = new URLSearchParams(location.search).get('phase') === 'post' ? 'post' : 'pre';
    initI18n('langSwitch');
    document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });

    if (!isPreSurveyDone()) { location.href = 'survey-pre.html'; return; }
    if (phase === 'post' && !isTestDone('pre')) { location.href = 'test.html?phase=pre'; return; }

    const root = document.getElementById('testRoot');
    const P = phase === 'pre' ? 'Pre' : 'Post';
    document.title = `${t('test' + P + 'Tag')} — TrueGuide`;

    /* ── 字号（和其他页面共用设置）── */
    const UI_KEY = 'fraudgame_ui';
    const FONT_STEPS = [.9, 1, 1.15, 1.3, 1.5];
    const ui = Object.assign({ font: 1, zoom: 1 }, readJson(UI_KEY, {}));
    const applyFont = () => { document.documentElement.style.setProperty('--ui-scale', ui.font); writeJson(UI_KEY, ui); };
    document.addEventListener('click', ev => {
        const b = ev.target.closest('[data-act]');
        if (!b) return;
        let i = FONT_STEPS.indexOf(ui.font); if (i < 0) i = 1;
        ui.font = FONT_STEPS[Math.max(0, Math.min(FONT_STEPS.length - 1, i + (b.dataset.act === 'font+' ? 1 : -1)))];
        applyFont();
    });
    applyFont();

    const answers = () => (getTest(phase) || { answers: {} }).answers;
    const firstUnanswered = () => CONF_ITEMS.findIndex(q => !(q.id in answers()));

    function intro() {
        const scale = [1, 2, 3, 4, 5].map(n => `<span><b>${n}</b> ${escHtml(t('conf' + n))}</span>`).join('');
        root.innerHTML = `<div class="test-panel">
            <div class="eyebrow">${t('test' + P + 'Tag')}</div>
            <h1>${t('test' + P + 'Title')}</h1>
            <p>${escHtml(t(phase === 'pre' ? 'testIntro' : 'testPostIntro'))}</p>
            <div class="test-legend scale-legend">${scale}</div>
            <button class="btn btn-primary" id="startBtn">${t('testStartBtn')}</button>
        </div>`;
        document.getElementById('startBtn').onclick = () => question(0);
    }

    function question(i) {
        if (i >= CONF_ITEMS.length) { finishTest(phase); done(); return; }
        const q = CONF_ITEMS[i];
        const current = answers()[q.id];
        const cue = q.cue ? `<span class="cue-chip cue-${q.cue}">${CUES[q.cue].icon} ${escHtml(cueText(q.cue).long)}</span>` : '';
        const btns = [1, 2, 3, 4, 5].map(n => `
            <button class="conf-btn${current === n ? ' picked' : ''}" data-v="${n}">
                <span class="conf-num">${n}</span><span class="conf-label">${escHtml(t('conf' + n))}</span>
            </button>`).join('');
        root.innerHTML = `
            <div class="test-progress">
                <span>${t('testProgress').replace('{n}', i + 1).replace('{total}', CONF_ITEMS.length)}</span>
                <div class="test-bar"><div style="width:${i / CONF_ITEMS.length * 100}%"></div></div>
            </div>
            <div class="test-panel conf-panel">
                ${cue}
                <div class="conf-q">${escHtml(t(q.qKey))}</div>
                <div class="conf-scale">${btns}</div>
                <div class="conf-foot">
                    ${i > 0 ? `<button class="link-btn" id="backBtn">${t('testBack')}</button>` : '<span></span>'}
                    <button class="link-btn${current === null ? ' picked' : ''}" id="skipBtn">${t('likertSkip')}</button>
                </div>
            </div>`;
        const go = v => {
            saveTestAnswer(phase, q.id, v);
            root.querySelectorAll('button').forEach(b => { b.disabled = true; });
            setTimeout(() => { question(i + 1); window.scrollTo({ top: 0 }); }, 250);
        };
        root.querySelectorAll('.conf-btn').forEach(b => b.onclick = () => { b.classList.add('picked'); go(Number(b.dataset.v)); });
        document.getElementById('skipBtn').onclick = () => go(null);
        const back = document.getElementById('backBtn');
        if (back) back.onclick = () => question(i - 1);
    }

    function done() {
        const href = phase === 'pre' ? 'home.html' : 'survey-post.html';
        root.innerHTML = `<div class="test-panel">
            <h1>${t('testDoneTitle')}</h1>
            <p>${escHtml(t(phase === 'pre' ? 'testPreDone' : 'testPostDone'))}</p>
            <a class="btn btn-primary" href="${href}">${t(phase === 'pre' ? 'testPreDoneBtn' : 'testPostDoneBtn')}</a>
        </div>`;
    }

    if (isTestDone(phase)) done();
    else if (Object.keys(answers()).length) question(Math.max(0, firstUnanswered()));   // 中途离开过，接着做
    else intro();
})();
