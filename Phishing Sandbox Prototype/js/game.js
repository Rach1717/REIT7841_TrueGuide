/* ============================================================
   TrueGuide 反诈小课堂 — 共用对话引擎
   沙盒模式（sandbox.js）和对话框模式（chat.js）都用它播放一个案例：
     情景 → 消息 → "你会怎么做？"（三个选项）→ 反馈 + 指出四种骗术信号 → 小结
   训练过程中不显示分数和计时（论文 Section 3：分数会增加压力），
   每次选择都记录下来，最后在报告页统一展示。
   ============================================================ */

class ChatEngine {
    /**
     * @param {Object} caseObj  cases.js 里的一个案例
     * @param {Object} opts
     *   chatAreaId / choiceAreaId / continueBarId / summaryId  页面容器 id
     *   mode       'sandbox' | 'chat'，写进选择记录
     *   actions    (engine) => [{label, primary, onClick}]  小结下方的按钮
     */
    constructor(caseObj, opts) {
        this.c = caseObj;
        this.L = caseText(caseObj);
        this.steps = this.L.steps;
        this.chatEl = document.getElementById(opts.chatAreaId);
        this.choiceEl = document.getElementById(opts.choiceAreaId);
        this.continueEl = document.getElementById(opts.continueBarId);
        this.summaryEl = document.getElementById(opts.summaryId);
        this.mode = opts.mode || 'chat';
        this.actions = opts.actions || (() => []);

        // 本轮已经完成过的案例再玩一次：照常记录，但标记为 replay，不计入统计
        this.replay = !!getLessonResult(caseObj.id);
        this.idx = 0;
        this.attempt = 0;
        this.firstCorrect = null;
    }

    start() {
        this.startedAt = Date.now();
        noteRoundTime();
        this.renderStep();
    }

    renderStep() {
        this.continueEl.innerHTML = '';
        this.choiceEl.innerHTML = '';
        if (this.idx >= this.steps.length) { this.renderSummary(); return; }

        const step = this.steps[this.idx];
        if (step.type === 'msg') { this.renderBubble(step.from, step.text); this.showContinue(); }
        else if (step.type === 'info') { this.renderInfo(step.text); this.showContinue(); }
        else if (step.type === 'choice') this.renderChoice(step);
    }

    next() { this.idx++; this.renderStep(); }

    scrollChatToBottom() { this.chatEl.scrollTop = this.chatEl.scrollHeight; }

    renderBubble(from, text) {
        const row = document.createElement('div');
        row.className = 'bubble-row ' + (from === 'me' ? 'me' : 'them');
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.textContent = text;
        row.appendChild(bubble);
        this.chatEl.appendChild(row);
        this.scrollChatToBottom();
        return row;
    }

    renderInfo(text) {
        const div = document.createElement('div');
        div.className = 'bubble-info';
        div.textContent = text;
        this.chatEl.appendChild(div);
        this.scrollChatToBottom();
    }

    showContinue() {
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = t('nextBtn');
        btn.onclick = () => this.next();
        this.continueEl.appendChild(btn);
        btn.focus({ preventScroll: true });
    }

    renderChoice(step) {
        const prompt = document.createElement('div');
        prompt.className = 'choice-prompt';
        prompt.textContent = step.prompt || t('defaultPrompt');
        this.choiceEl.appendChild(prompt);

        const list = document.createElement('div');
        list.className = 'choice-list';
        step.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = opt.text;
            btn.onclick = () => this.selectOption(step, opt);
            list.appendChild(btn);
        });
        this.choiceEl.appendChild(list);
    }

    selectOption(step, opt) {
        this.attempt++;
        if (this.attempt === 1) this.firstCorrect = !!opt.correct;
        recordChoice({
            caseId: this.c.id, kind: this.c.kind, cues: this.c.cues.slice(),
            outcome: opt.outcome, correct: !!opt.correct, attempt: this.attempt,
            mode: this.mode, replay: this.replay,
        });

        const row = this.renderBubble('me', opt.text);
        this.choiceEl.innerHTML = '';

        const falseAlarm = this.c.kind === 'safe' && opt.outcome === 'flag';
        const panel = document.createElement('div');
        panel.className = 'feedback-panel ' + (opt.correct ? 'correct' : falseAlarm ? 'notice' : 'wrong');
        const title = document.createElement('div');
        title.className = 'feedback-title';
        title.textContent = opt.correct ? t('correctTitle') : falseAlarm ? t('falseAlarmTitle') : t('wrongTitle');
        const body = document.createElement('div');
        body.textContent = opt.feedback;
        panel.append(title, body);
        this.choiceEl.appendChild(panel);

        // 论文的学习循环：每次作答后都说明这条消息里出现了哪些信号
        this.choiceEl.insertAdjacentHTML('beforeend', cuePanelHtml(this.c));

        const actions = document.createElement('div');
        actions.className = 'feedback-actions';
        const btn = document.createElement('button');
        if (opt.correct) {
            btn.className = 'btn btn-primary';
            btn.textContent = t('continueBtn');
            btn.onclick = () => this.next();
        } else {
            btn.className = 'btn btn-outline';
            btn.textContent = t('retryBtn');
            btn.onclick = () => {
                row.remove();
                this.choiceEl.innerHTML = '';
                this.renderChoice(step);
            };
        }
        actions.appendChild(btn);
        this.choiceEl.appendChild(actions);
        this.scrollChatToBottom();
    }

    renderSummary() {
        noteRoundTime();
        if (!this.replay) {
            saveLessonResult(this.c.id, {
                firstTryCorrect: this.firstCorrect, attempts: this.attempt,
                mode: this.mode, startedAt: this.startedAt,
            });
        }
        const R = this.L.recap;
        this.summaryEl.style.display = 'block';
        this.summaryEl.innerHTML = `
            <h2>${escHtml(R.title)}</h2>
            <ul class="summary-list">${R.points.map(p => `<li>${escHtml(p)}</li>`).join('')}</ul>
            <div class="summary-source">📚 ${t('sourceLabel')}${escHtml(this.L.source)}</div>
            <div class="summary-actions"></div>`;
        const wrap = this.summaryEl.querySelector('.summary-actions');
        this.actions(this).forEach(a => {
            const b = document.createElement(a.href ? 'a' : 'button');
            b.className = 'btn ' + (a.primary ? 'btn-primary' : 'btn-outline');
            b.textContent = a.label;
            if (a.href) b.href = a.href; else b.onclick = a.onClick;
            wrap.appendChild(b);
        });
    }
}

/* 四种信号说明面板：骗局列出出现的信号和证据；安全消息说明为什么可以放心 */
function cuePanelHtml(c) {
    const L = caseText(c);
    if (c.kind === 'safe') {
        const none = CUE_IDS.map(id => `<span class="cue-chip off">${CUES[id].icon} ${escHtml(cueText(id).name)}</span>`).join('');
        return `<div class="cue-panel safe">
            <div class="cue-panel-title">${t('cueSafeTitle')}</div>
            <div class="cue-chips">${none}</div>
            <p>${escHtml(L.safeNote)}</p>
        </div>`;
    }
    const items = c.cues.map(id => `
        <li class="cue-item">
            <span class="cue-chip cue-${id}">${CUES[id].icon} ${escHtml(cueText(id).name)}</span>
            <span class="cue-evidence">${escHtml(L.cueNotes[id])}</span>
        </li>`).join('');
    const isolation = c.cues.includes('isolation')
        ? `<div class="cue-callout">${t('cueIsolationCallout')}</div>` : '';
    return `<div class="cue-panel scam">
        <div class="cue-panel-title">${t('cueScamTitle')}</div>
        <ul class="cue-list">${items}</ul>
        ${isolation}
        <div class="cue-safe-step">${t('cueSafeStep')}</div>
    </div>`;
}
