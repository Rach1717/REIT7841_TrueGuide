/* ============================================================
   反诈小课堂 — 共用对话引擎
   每个案例页面只需提供一个"剧本"数组(见 case1.js/case2.js/case3.js)，
   由本引擎负责逐条播放消息、展示选择题、给出反馈、显示总结。
   ============================================================ */

class ChatEngine {
    /**
     * @param {Array} script 剧本数组，元素类型：
     *   { type:'info', text }                         情景说明
     *   { type:'msg',  from:'them'|'me', text }        对话消息
     *   { type:'choice', prompt, options:[{text, correct, feedback}] } 选择题
     *   { type:'summary', title, points:[...], nextHref, nextLabel }   总结
     * @param {Object} ids 页面上各容器的元素 id
     */
    constructor(script, ids) {
        this.script = script;
        this.chatEl = document.getElementById(ids.chatAreaId);
        this.choiceEl = document.getElementById(ids.choiceAreaId);
        this.continueEl = document.getElementById(ids.continueBarId);
        this.summaryEl = document.getElementById(ids.summaryId);
        this.lessonId = ids.lessonId || null;
        // 嵌入沙盒场景时：总结页不跳转到下一课，而是回调 onFinish 返回场景
        this.onFinish = ids.onFinish || null;

        this.idx = 0;
        this.correctFirstTry = 0;
        this.totalChoices = script.filter(s => s.type === 'choice').length;
        this.triedWrongOnCurrent = false;
    }

    start() {
        this.renderStep();
    }

    renderStep() {
        this.continueEl.innerHTML = '';
        this.choiceEl.innerHTML = '';

        if (this.idx >= this.script.length) return;
        const step = this.script[this.idx];

        if (step.type === 'msg') {
            this.renderMsg(step);
            this.showContinue();
        } else if (step.type === 'info') {
            this.renderInfo(step);
            this.showContinue();
        } else if (step.type === 'choice') {
            this.triedWrongOnCurrent = false;
            this.renderChoice(step);
        } else if (step.type === 'summary') {
            this.renderSummary(step);
        }
    }

    // 只滚动聊天气泡容器内部，不移动整个页面
    scrollChatToBottom() {
        this.chatEl.scrollTop = this.chatEl.scrollHeight;
    }

    renderMsg(step) {
        const row = document.createElement('div');
        row.className = 'bubble-row ' + (step.from === 'me' ? 'me' : 'them');
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.textContent = step.text;
        row.appendChild(bubble);
        this.chatEl.appendChild(row);
        this.scrollChatToBottom();
    }

    renderInfo(step) {
        const div = document.createElement('div');
        div.className = 'bubble-info';
        div.textContent = step.text;
        this.chatEl.appendChild(div);
        this.scrollChatToBottom();
    }

    showContinue() {
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = t('nextBtn');
        btn.onclick = () => {
            this.idx++;
            this.renderStep();
        };
        this.continueEl.appendChild(btn);
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
        // 用户的选择作为一条消息展示出来
        const row = document.createElement('div');
        row.className = 'bubble-row me';
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.textContent = opt.text;
        row.appendChild(bubble);
        this.chatEl.appendChild(row);
        this.scrollChatToBottom();

        // 展示反馈，替换掉选项列表
        this.choiceEl.innerHTML = '';

        const panel = document.createElement('div');
        panel.className = 'feedback-panel ' + (opt.correct ? 'correct' : 'wrong');
        const title = document.createElement('div');
        title.className = 'feedback-title';
        title.textContent = opt.correct ? t('correctTitle') : t('wrongTitle');
        const body = document.createElement('div');
        body.textContent = opt.feedback;
        panel.appendChild(title);
        panel.appendChild(body);
        this.choiceEl.appendChild(panel);

        const actions = document.createElement('div');
        actions.className = 'feedback-actions';

        if (opt.correct) {
            if (!this.triedWrongOnCurrent) this.correctFirstTry++;
            const btn = document.createElement('button');
            btn.className = 'btn btn-primary';
            btn.textContent = t('continueBtn');
            btn.onclick = () => {
                this.idx++;
                this.renderStep();
            };
            actions.appendChild(btn);
        } else {
            this.triedWrongOnCurrent = true;
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline';
            btn.textContent = t('retryBtn');
            btn.onclick = () => {
                row.remove();
                this.choiceEl.innerHTML = '';
                this.renderChoice(step);
            };
            actions.appendChild(btn);
        }

        this.choiceEl.appendChild(actions);
    }

    renderSummary(step) {
        if (this.lessonId && typeof saveLessonResult === 'function') {
            saveLessonResult(this.lessonId, this.correctFirstTry, this.totalChoices);
        }

        const actionsHtml = this.onFinish
            ? `<button class="btn btn-primary" id="engineFinishBtn">${t('sbBackBtn')}</button>`
            : [
                `<a class="btn btn-outline" href="home.html">${t('homeBtn')}</a>`,
                step.nextHref ? `<a class="btn btn-primary" href="${step.nextHref}">${step.nextLabel}</a>` : ''
            ].join('');

        this.summaryEl.style.display = 'block';
        this.summaryEl.innerHTML = `
            <h2>${step.title}</h2>
            <div class="summary-score">${scoreText(this.correctFirstTry, this.totalChoices)}</div>
            <ul class="summary-list">
                ${step.points.map(p => `<li>${p}</li>`).join('')}
            </ul>
            <div class="summary-actions">${actionsHtml}</div>
        `;
        const finishBtn = this.summaryEl.querySelector('#engineFinishBtn');
        if (finishBtn) finishBtn.onclick = () => this.onFinish();
    }
}
