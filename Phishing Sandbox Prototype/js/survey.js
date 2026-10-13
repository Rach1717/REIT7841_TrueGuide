/* ============================================================
   反诈小课堂 — 调查表引擎（背景选择题 + 1–5量表 共用）
   ============================================================ */

const SURVEY_PRE_BACKGROUND = [
    { id: 'a1', type: 'radio', qKey: 'pA1_q', options: ['pA1_o1', 'pA1_o2', 'pA1_o3', 'pA1_o4'] },
    { id: 'a2', type: 'checkbox', qKey: 'pA2_q', options: ['pA2_o1', 'pA2_o2', 'pA2_o3', 'pA2_o4'] },
    { id: 'a3', type: 'radio', qKey: 'pA3_q', options: ['pA3_o1', 'pA3_o2', 'pA3_o3'] },
    { id: 'a4', type: 'checkbox', qKey: 'pA4_q', options: ['pA4_o1', 'pA4_o2', 'pA4_o3', 'pA4_o4', 'pA4_o5'] },
    { id: 'a5', type: 'radio', qKey: 'pA5_q', options: ['pA5_o1', 'pA5_o2', 'pA5_o3'] },
    { id: 'a6', type: 'radio', qKey: 'pA6_q', options: ['pA6_o1', 'pA6_o2', 'pA6_o3'] },
    { id: 'a7', type: 'radio', qKey: 'pA7_q', options: ['pA7_o1', 'pA7_o2', 'pA7_o3'] },
];

/* 前测/后测共用同一份量表题，措辞完全一致，才能做前后对比 */
const SURVEY_LIKERT = [
    { id: 'l1', qKey: 'lQ1', construct: 'verify' },
    { id: 'l2', qKey: 'lQ2', construct: 'verify' },
    { id: 'l3', qKey: 'lQ3', construct: 'pressure' },
    { id: 'l4', qKey: 'lQ4', construct: 'pressure' },
    { id: 'l5', qKey: 'lQ5', construct: 'anxiety' },
    { id: 'l6', qKey: 'lQ6', construct: 'anxiety' },
];

const SURVEY_POST_EXTRA = [
    { id: 'p1', type: 'checkbox', qKey: 'postQ1_q', options: ['postQ1_o1', 'postQ1_o2', 'postQ1_o3', 'postQ1_o4'] },
];

function renderChoiceQuestion(container, q) {
    const card = document.createElement('div');
    card.className = 'survey-q';
    card.dataset.id = q.id;
    card.dataset.type = q.type;

    const label = document.createElement('div');
    label.className = 'survey-q-text';
    label.textContent = t(q.qKey);
    card.appendChild(label);

    if (q.type === 'checkbox') {
        const hint = document.createElement('div');
        hint.className = 'survey-q-hint';
        hint.textContent = t('surveySelectPrompt');
        card.appendChild(hint);
    }

    const opts = document.createElement('div');
    opts.className = 'survey-options';
    q.options.forEach(optKey => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'survey-opt-btn';
        btn.textContent = t(optKey);
        btn.dataset.value = optKey;
        btn.onclick = () => {
            if (q.type === 'radio') {
                opts.querySelectorAll('.survey-opt-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            } else {
                btn.classList.toggle('selected');
            }
        };
        opts.appendChild(btn);
    });
    card.appendChild(opts);
    container.appendChild(card);
}

function renderLikertQuestion(container, q) {
    const card = document.createElement('div');
    card.className = 'survey-q survey-q-likert';
    card.dataset.id = q.id;
    card.dataset.type = 'likert';
    card.dataset.construct = q.construct;

    const label = document.createElement('div');
    label.className = 'survey-q-text';
    label.textContent = t(q.qKey);
    card.appendChild(label);

    const scale = document.createElement('div');
    scale.className = 'likert-scale';

    const skipBtn = document.createElement('button');
    skipBtn.type = 'button';
    skipBtn.className = 'likert-skip-btn';
    skipBtn.textContent = t('likertSkip');

    for (let i = 1; i <= 5; i++) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'likert-btn';
        btn.dataset.value = String(i);
        btn.innerHTML = `<span class="likert-num">${i}</span><span class="likert-label">${t('likert' + i)}</span>`;
        btn.onclick = () => {
            scale.querySelectorAll('.likert-btn').forEach(b => b.classList.remove('selected'));
            skipBtn.classList.remove('selected');
            btn.classList.add('selected');
        };
        scale.appendChild(btn);
    }
    card.appendChild(scale);

    skipBtn.onclick = () => {
        scale.querySelectorAll('.likert-btn').forEach(b => b.classList.remove('selected'));
        skipBtn.classList.add('selected');
    };
    card.appendChild(skipBtn);

    container.appendChild(card);
}

function renderSurveySection(containerId, questions) {
    const container = document.getElementById(containerId);
    questions.forEach(q => {
        if (q.type === 'likert' || q.construct) {
            renderLikertQuestion(container, q);
        } else {
            renderChoiceQuestion(container, q);
        }
    });
}

function collectSurveyAnswers(containerEl) {
    const answers = {};
    containerEl.querySelectorAll('.survey-q').forEach(card => {
        const id = card.dataset.id;
        const type = card.dataset.type;
        if (type === 'radio') {
            const sel = card.querySelector('.survey-opt-btn.selected');
            answers[id] = sel ? sel.dataset.value : null;
        } else if (type === 'checkbox') {
            answers[id] = Array.from(card.querySelectorAll('.survey-opt-btn.selected')).map(b => b.dataset.value);
        } else if (type === 'likert') {
            const sel = card.querySelector('.likert-btn.selected');
            answers[id] = sel ? Number(sel.dataset.value) : null;
        }
    });
    return answers;
}
