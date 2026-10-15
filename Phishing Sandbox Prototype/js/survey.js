/* ============================================================
   TrueGuide 反诈小课堂 — 调查表引擎（选择题 / 1–5 量表 / 简答题）
   ============================================================ */

/* 题目与研究用问卷一一对应（Phishing Sandbox Study — Background Survey），
   id 与数据表 Phishing_Sandbox_Data.xlsx 的列一致，方便导出后直接对照。 */
const FREQ = ['oF1', 'oF2', 'oF3', 'oF4', 'oF5'];

const SURVEY_RESEARCHER = [
    { id: 'pid', type: 'text', qKey: 'qPid', rows: 1 },
];

const SURVEY_A = [
    { id: 'a1', type: 'radio', qKey: 'qA1', options: ['oA1_1', 'oA1_2', 'oA1_3', 'oA1_4', 'oPreferNot'] },
    { id: 'a2', type: 'checkbox', qKey: 'qA2', options: ['oA2_1', 'oA2_2', 'oA2_3', 'oA2_4', 'oOther'] },
    { id: 'a3_email', type: 'radio', qKey: 'qA3_email', options: FREQ },
    { id: 'a3_sms', type: 'radio', qKey: 'qA3_sms', options: FREQ },
    { id: 'a3_phone', type: 'radio', qKey: 'qA3_phone', options: FREQ },
    { id: 'a3_other', type: 'text', qKey: 'qA3_other', rows: 1 },
    { id: 'a4', type: 'radio', qKey: 'qA4', options: ['oYes', 'oNo', 'oPreferNot'] },
    { id: 'a5', type: 'checkbox', qKey: 'qA5', options: ['oA5_1', 'oA5_2', 'oA5_3', 'oA5_4', 'oA5_5', 'oOther', 'oPreferNot'] },
];

const SURVEY_B = [
    { id: 'b1', type: 'radio', qKey: 'qB1', options: ['oYes', 'oNo', 'oNotSure'] },
    { id: 'b2', type: 'radio', qKey: 'qB2', options: ['oYes', 'oNo', 'oNotSure', 'oPreferNot'] },
    { id: 'b3', type: 'radio', qKey: 'qB3', options: ['oYes', 'oNo', 'oNotSure', 'oPreferNot'] },
    { id: 'b4', type: 'text', qKey: 'qB4' },
    { id: 'b5', type: 'checkbox', qKey: 'qB5', options: ['oB5_1', 'oB5_2', 'oB5_3', 'oB5_4', 'oB5_5', 'oB5_6', 'oOther'] },
];

/* C1–C12：入学前和结课各答一次，措辞完全一致；分组见 progress.js 的 C_CONSTRUCTS */
const SURVEY_C = Array.from({ length: 12 }, (_, i) => ({
    id: 'c' + (i + 1), qKey: 'cQ' + (i + 1), construct: cConstructOf('c' + (i + 1)),
}));

const SURVEY_D = [
    { id: 'd1', type: 'text', qKey: 'dQ1' },
    { id: 'd2', type: 'text', qKey: 'dQ2' },
    { id: 'd3', type: 'text', qKey: 'dQ3' },
    { id: 'd4', type: 'text', qKey: 'dQ4' },
];

/* 结课体验评分（数据表 Participants：Engagement / Enjoyment / Ease of use / Navigation difficulty）
   前三题 1 = 非常不同意 … 5 = 非常同意；移动难度 1 = 完全不难 … 5 = 非常难 */
const SURVEY_POST_EXPERIENCE = [
    { id: 'e1', qKey: 'eQ1', construct: 'engagement' },
    { id: 'e2', qKey: 'eQ2', construct: 'enjoyment' },
    { id: 'e3', qKey: 'eQ3', construct: 'ease' },
    { id: 'e4', qKey: 'eQ4', construct: 'navigation', scale: 'diff' },
];

const SURVEY_POST_OPEN = [
    { id: 'o1', type: 'text', qKey: 'oQ1' },
    { id: 'o2', type: 'text', qKey: 'oQ2' },
];

function renderTextQuestion(container, q) {
    const card = document.createElement('div');
    card.className = 'survey-q';
    card.dataset.id = q.id;
    card.dataset.type = 'text';
    const label = document.createElement('label');
    label.className = 'survey-q-text';
    label.textContent = t(q.qKey);
    const area = document.createElement('textarea');
    area.className = 'survey-textarea';
    area.rows = q.rows || 3;
    area.placeholder = t('surveyTextHint');
    label.htmlFor = area.id = 'q_' + q.id;
    card.append(label, area);
    container.appendChild(card);
}

function renderChoiceQuestion(container, q) {
    const card = document.createElement('div');
    card.className = 'survey-q';
    card.dataset.id = q.id;
    card.dataset.type = q.type;

    const label = document.createElement('div');
    label.className = 'survey-q-text';
    label.textContent = t(q.qKey);
    card.appendChild(label);

    // 题目原文里已经写了"可多选 / Select all that apply"时，不再重复提示
    if (q.type === 'checkbox' && !/可多选|select all/i.test(t(q.qKey))) {
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
        btn.innerHTML = `<span class="likert-num">${i}</span><span class="likert-label">${t((q.scale || 'likert') + i)}</span>`;
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
        if (q.type === 'text') {
            renderTextQuestion(container, q);
        } else if (q.type === 'likert' || q.construct) {
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
        } else if (type === 'text') {
            const v = card.querySelector('textarea').value.trim();
            answers[id] = v || null;
        } else if (type === 'likert') {
            const sel = card.querySelector('.likert-btn.selected');
            answers[id] = sel ? Number(sel.dataset.value) : null;
        }
    });
    return answers;
}
