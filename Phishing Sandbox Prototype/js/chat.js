/* ============================================================
   TrueGuide 反诈小课堂 — 对话框模式（文字版）
   论文 Section 3：一个聊天界面，每个案例像一条新消息出现，
   TrueGuide 小助手也作为一个联系人，负责介绍四种信号和最后的去向。
   ============================================================ */

(function () {
    'use strict';

    const required = nextRequiredPage();
    if (required) { window.location.href = required; return; }
    initI18n('langSwitch');
    document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });

    const app = document.getElementById('chatApp');
    const listEl = document.getElementById('contactList');
    const titleEl = document.getElementById('paneTitle');
    const bodyEl = document.getElementById('paneBody');
    const GUIDE = 'guide';
    let current = null;

    /* ── 字号（和沙盒共用同一个设置）── */
    const UI_KEY = 'fraudgame_ui';
    const FONT_STEPS = [.9, 1, 1.15, 1.3, 1.5];
    const ui = Object.assign({ font: 1, zoom: 1 }, readJson(UI_KEY, {}));
    function applyFont() {
        document.documentElement.style.setProperty('--ui-scale', ui.font);
        writeJson(UI_KEY, ui);
    }
    document.addEventListener('click', ev => {
        const b = ev.target.closest('[data-act]');
        if (!b) return;
        let i = FONT_STEPS.indexOf(ui.font); if (i < 0) i = 1;
        i += b.dataset.act === 'font+' ? 1 : -1;
        ui.font = FONT_STEPS[Math.max(0, Math.min(FONT_STEPS.length - 1, i))];
        applyFont();
    });

    /* ── 联系人列表 ── */
    function renderList() {
        document.getElementById('chatProgress').textContent = `${doneCount()} / ${CASES.length}`;
        let html = `<button class="contact${current === GUIDE ? ' active' : ''}" data-id="${GUIDE}">
            <span class="contact-avatar guide">🛡️</span>
            <span class="contact-main"><span class="contact-name">${t('guideName')}</span>
            <span class="contact-preview">${escHtml(t('guidePreview'))}</span></span>
            <span class="contact-meta">📌</span></button>`;
        CASES.forEach(c => {
            const L = caseText(c), done = !!getLessonResult(c.id);
            html += `<button class="contact${current === c.id ? ' active' : ''}${done ? ' done' : ''}" data-id="${c.id}">
                <span class="contact-avatar">${L.avatar}</span>
                <span class="contact-main"><span class="contact-name">${escHtml(L.contact)}</span>
                <span class="contact-preview">${CHANNELS[c.channel].icon} ${escHtml(L.preview)}</span></span>
                <span class="contact-meta">${done ? '✅' : `<span class="unread-dot" aria-label="${t('chatUnread')}"></span>`}</span>
            </button>`;
        });
        listEl.innerHTML = html;
        listEl.querySelectorAll('.contact').forEach(b => b.addEventListener('click', () => open(b.dataset.id)));
    }

    function open(id) {
        current = id;
        app.classList.add('show-pane');
        if (id === GUIDE) openGuide(); else openCase(caseById(id));
        renderList();
        bodyEl.scrollTop = 0;
        try { history.replaceState(null, '', '#' + id); } catch (e) { /* ignore */ }
    }

    document.getElementById('chatBack').addEventListener('click', () => {
        app.classList.remove('show-pane');
        current = null;
        renderList();
    });

    /* ── TrueGuide 小助手 ── */
    function openGuide() {
        titleEl.textContent = t('guideName');
        const cues = CUE_IDS.map(id => `<li><span class="cue-chip cue-${id}">${CUES[id].icon} ${escHtml(cueText(id).name)}</span>
            <span class="cue-evidence">${escHtml(cueText(id).desc)}</span></li>`).join('');
        const all = allLessonsDone();
        let end = '';
        if (all) {
            end = `<div class="bubble-row them"><div class="bubble">${escHtml(t('guideAllDone'))}</div></div>
                <div class="guide-actions"><a class="btn btn-primary" href="${nextFinalStep().href}">${t(nextFinalStep().key)}</a></div>`;
        } else {
            const next = CASES.find(c => !getLessonResult(c.id));
            end = `<div class="bubble-row them"><div class="bubble">${escHtml(t('guideProgress').replace('{n}', doneCount()).replace('{total}', CASES.length))}</div></div>
                <div class="guide-actions"><button class="btn btn-primary" id="guideNext">${anyLessonDone() ? t('chatNextMsg') : t('chatFirstMsg')}</button></div>`;
            setTimeout(() => {
                const b = document.getElementById('guideNext');
                if (b) b.onclick = () => open(next.id);
            });
        }
        bodyEl.innerHTML = `<div class="chat-area guide-area">
            <div class="bubble-row them"><div class="bubble">${escHtml(t('guideHello'))}</div></div>
            <div class="bubble-row them"><div class="bubble">${escHtml(t('guideHow'))}</div></div>
            <div class="bubble-row them"><div class="bubble guide-cues">${escHtml(t('guideCuesIntro'))}<ul class="cue-list">${cues}</ul></div></div>
            <div class="bubble-row them"><div class="bubble">${escHtml(t('guideRule'))}</div></div>
            ${end}
        </div>`;
    }

    /* ── 一个案例 ── */
    function openCase(c) {
        const L = caseText(c);
        titleEl.textContent = `${L.avatar} ${L.contact}`;
        bodyEl.innerHTML = `${caseHeaderHtml(c)}
            <div class="chat-area" id="chatArea"></div>
            <div class="choice-area" id="choiceArea"></div>
            <div class="continue-bar" id="continueBar"></div>
            <div class="summary-panel" id="summaryPanel" style="display:none;"></div>`;
        const engine = new ChatEngine(c, {
            chatAreaId: 'chatArea', choiceAreaId: 'choiceArea',
            continueBarId: 'continueBar', summaryId: 'summaryPanel',
            mode: 'chat',
            actions: () => {
                renderList();
                const next = CASES.find(x => !getLessonResult(x.id));
                if (!next) return [{ label: t('chatBackToGuide'), primary: true, onClick: () => open(GUIDE) }];
                return [
                    { label: t('chatNextMsg'), primary: true, onClick: () => open(next.id) },
                    { label: t('chatBackToGuide'), onClick: () => open(GUIDE) },
                ];
            },
        });
        engine.start();
    }

    // 内容增加时：小结滚到小结顶部，其余滚到底部
    new MutationObserver(() => {
        const sum = bodyEl.querySelector('#summaryPanel');
        if (sum && sum.style.display !== 'none') sum.scrollIntoView({ block: 'start', behavior: 'smooth' });
        else if (current !== GUIDE) bodyEl.scrollTop = bodyEl.scrollHeight;
    }).observe(bodyEl, { childList: true, subtree: true });

    applyFont();
    const hash = location.hash.slice(1);
    open(hash && (hash === GUIDE || caseById(hash)) ? hash : GUIDE);
    // 手机宽度下默认先看列表
    if (!hash && window.innerWidth < 760) app.classList.remove('show-pane');
})();
