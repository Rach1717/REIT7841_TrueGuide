/* ============================================================
   TrueGuide 反诈小课堂 — 开课测试 / 结课测试
   test.html?phase=pre   学习前：12 条消息（A 套）
   test.html?phase=post  学习后：12 条配对的消息（B 套）
   每条只判断"是骗局 / 可以放心"，不计时、不即时反馈，
   两次结果在最终报告里对比，看出进步了多少。
   ============================================================ */

(function () {
    'use strict';

    const phase = new URLSearchParams(location.search).get('phase') === 'post' ? 'post' : 'pre';
    initI18n('langSwitch');
    document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });

    if (!isPreSurveyDone()) { location.href = 'survey-pre.html'; return; }
    if (phase === 'post' && !isTestDone('pre')) { location.href = 'test.html?phase=pre'; return; }

    const root = document.getElementById('testRoot');
    const ids = TEST_SETS[phase];
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

    const answered = () => (getTest(phase) || { answers: {} }).answers;
    const nextIndex = () => ids.findIndex(id => !answered()[id]);

    function intro() {
        root.innerHTML = `<div class="test-panel">
            <div class="eyebrow">${t('test' + P + 'Tag')}</div>
            <h1>${t('test' + P + 'Title')}</h1>
            <p>${escHtml(t(phase === 'pre' ? 'testIntro' : 'testPostIntro'))}</p>
            <div class="test-legend">
                <div><b>${t('testScam')}</b> — ${escHtml(t('testScamSub'))}</div>
                <div><b>${t('testSafe')}</b> — ${escHtml(t('testSafeSub'))}</div>
            </div>
            <button class="btn btn-primary" id="startBtn">${t('testStartBtn')}</button>
        </div>`;
        document.getElementById('startBtn').onclick = question;
    }

    function question() {
        const i = nextIndex();
        if (i < 0) { finishTest(phase); done(); return; }
        const item = testItemById(ids[i]);
        const L = caseText(item);
        root.innerHTML = `
            <div class="test-progress">
                <span>${t('testProgress').replace('{n}', i + 1).replace('{total}', ids.length)}</span>
                <div class="test-bar"><div style="width:${i / ids.length * 100}%"></div></div>
            </div>
            <div class="phone-frame test-card">
                ${caseHeaderHtml(item)}
                <div class="chat-area">
                    <div class="bubble-info">${escHtml(L.context)}</div>
                    <div class="bubble-row them"><div class="bubble">${escHtml(L.text)}</div></div>
                </div>
            </div>
            <div class="test-q">${t('testQuestion')}</div>
            <div class="test-choices">
                <button class="test-btn scam" data-a="scam"><span>${t('testScam')}</span><small>${escHtml(t('testScamSub'))}</small></button>
                <button class="test-btn safe" data-a="safe"><span>${t('testSafe')}</span><small>${escHtml(t('testSafeSub'))}</small></button>
            </div>`;
        root.querySelectorAll('.test-btn').forEach(b => b.onclick = () => {
            root.querySelectorAll('.test-btn').forEach(x => { x.disabled = true; });
            b.classList.add('picked');
            saveTestAnswer(phase, item, b.dataset.a);
            setTimeout(() => { question(); window.scrollTo({ top: 0 }); }, 250);
        });
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
    else if (Object.keys(answered()).length) question();   // 中途离开过，接着做
    else intro();
})();
