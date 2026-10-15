/* ============================================================
   TrueGuide 反诈小课堂 — 最终报告
   论文 Section 3："At the end, the app shows how many choices were correct
   and gives a feedback report based on the pre- and post-session questionnaires."
     1. 练习成绩：第一次就选对了几次；识破骗局 / 认出真消息 / 上当 / 误判
     2. 四种信号：每种信号的识破率，标出最需要多练的一种
     3. 给你的建议：按错误类型生成
     4. 每条消息回顾
     5. 学习前后对比（入学前 / 结课调查）
     6. 再练一轮（间隔重复）、导出记录（研究用）
   ============================================================ */

const $ = id => document.getElementById(id);
const pct = (a, b) => (b ? Math.round(a / b * 100) : 0);

function avgOf(answers, ids) {
    if (!answers) return null;
    const vals = ids.map(id => answers[id]).filter(v => v !== null && v !== undefined);
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/* ── 0. 入学前 vs 结课调查：C1–C12 三个维度的变化（1–5 分）── */
const fmt1 = v => (v === null || v === undefined ? '—' : v.toFixed(1));

function pairRow(label, desc, before, after) {
    const bar = (v, cls) => `<div class="report-bar-track"><div class="report-bar-fill${cls}" style="width:${v === null ? 0 : v / 5 * 100}%"></div></div>`;
    return `<div class="pair-row">
        <div class="pair-label">${escHtml(label)}</div>
        <div class="pair-desc">${escHtml(desc)}</div>
        <div class="pair-line"><span class="pair-tag">${escHtml(t('reportPreTest'))}</span>${bar(before, '')}<span class="pair-val">${fmt1(before)}</span></div>
        <div class="pair-line"><span class="pair-tag">${escHtml(t('reportPostTest'))}</span>${bar(after, ' after')}<span class="pair-val">${fmt1(after)}</span></div>
    </div>`;
}

const CONSTRUCT_KEYS = {
    verify: ['reportConstructVerify', 'reportConstructVerifyDesc'],
    pressure: ['reportConstructPressure', 'reportConstructPressureDesc'],
    anxiety: ['reportConstructAnxiety', 'reportConstructAnxietyDesc'],
};

function renderProgress() {
    const pre = constructScores('pre');
    const post = constructScores('post');
    if (!pre || pre.verify === null) { $('progressCard').style.display = 'none'; return; }

    let hero;
    if (post && post.verify !== null) {
        // 用显示出来的一位小数相减，保证"3.9 → 4.5"和"提高了 0.6 分"对得上
        const r1 = v => Math.round(v * 10) / 10;
        const d = Math.round((r1(post.verify) - r1(pre.verify)) * 10) / 10;
        const gain = d > 0 ? t('reportGain').replace('{n}', d.toFixed(1))
            : d === 0 ? t('reportGainSame') : t('reportGainDown').replace('{n}', (-d).toFixed(1));
        hero = `<div class="score-hero"><div class="hero-num">${fmt1(pre.verify)}<span> → </span>${fmt1(post.verify)}</div>
            <div class="hero-label">${escHtml(gain)}</div></div>`;
    } else {
        hero = `<div class="score-hero"><div class="hero-num">${fmt1(pre.verify)}<span> / 5</span></div>
            <div class="hero-label">${escHtml(t('reportConstructVerify'))} · ${escHtml(t('reportPreTest'))}</div></div>
            <p class="report-muted">${escHtml(t('reportPostTestPending'))}</p>
            ${allLessonsDone() ? `<p><a class="btn btn-primary" href="survey-post.html">${t('sbSurveyBtn')}</a></p>` : ''}`;
    }
    $('progressBody').innerHTML = hero + Object.keys(CONSTRUCT_KEYS).map(k =>
        pairRow(t(CONSTRUCT_KEYS[k][0]), t(CONSTRUCT_KEYS[k][1]), pre[k], post ? post[k] : null)).join('');
}

/* ── 1. 成绩 ── */
function renderScore(s) {
    $('scoreHero').innerHTML = `
        <div class="hero-num">${s.correct}<span> / ${s.answered}</span></div>
        <div class="hero-label">${escHtml(t('reportHeroLabel'))}</div>`;

    const tiles = [
        { icon: '🛡️', label: t('reportTileCaught'), value: `${s.scam.caught} / ${s.scam.total}`, tone: 'good' },
        { icon: '💚', label: t('reportTileSafeOk'), value: `${s.safe.ok} / ${s.safe.total}`, tone: 'good' },
        { icon: '⚠️', label: t('reportTileMissed'), value: s.scam.missed, tone: s.scam.missed ? 'bad' : 'neutral', hint: t('reportTileMissedHint') },
        { icon: '🤔', label: t('reportTileFalseAlarm'), value: s.safe.falseAlarm, tone: s.safe.falseAlarm ? 'warn' : 'neutral', hint: t('reportTileFalseAlarmHint') },
    ];
    $('scoreTiles').innerHTML = tiles.map(x => `
        <div class="stat-tile ${x.tone}">
            <div class="stat-label">${x.icon} ${escHtml(x.label)}</div>
            <div class="stat-value">${x.value}</div>
            ${x.hint ? `<div class="stat-hint">${escHtml(x.hint)}</div>` : ''}
        </div>`).join('');

    // 多轮练习时，展示每轮正确率的变化
    if (s.round > 1) {
        const rows = [];
        for (let r = 1; r <= s.round; r++) {
            const rs = r === s.round ? s : computeStats(r);
            if (rs.answered) rows.push(`${t('reportRound').replace('{n}', r)} ${pct(rs.correct, rs.answered)}%`);
        }
        if (rows.length > 1) $('roundTrend').textContent = '📈 ' + rows.join('  →  ');
    }
}

/* ── 2. 四种信号 ── */
function weakestCue(s) {
    let worst = null;
    CUE_IDS.forEach(id => {
        const c = s.cues[id];
        if (!c.total || !c.missed) return;
        const rate = c.missed / c.total;
        if (!worst || rate > worst.rate || (rate === worst.rate && id === 'isolation')) worst = { id, rate };
    });
    return worst && worst.id;
}

function renderCues(s) {
    const weak = weakestCue(s);
    $('cueBars').innerHTML = CUE_IDS.map(id => {
        const c = s.cues[id], caught = c.total - c.missed, p = pct(caught, c.total);
        const name = cueText(id);
        return `<div class="cue-bar-row${id === weak ? ' weak' : ''}" title="${escHtml(name.long)}：${caught} / ${c.total}">
            <div class="cue-bar-label">
                <span class="cue-bar-name">${CUES[id].icon} ${escHtml(name.long)}</span>
                <span class="cue-bar-desc">${escHtml(name.desc)}</span>
            </div>
            <div class="report-bar-track"><div class="report-bar-fill" style="width:${c.total ? p : 0}%"></div></div>
            <div class="cue-bar-value">${c.total ? `${caught} / ${c.total}` : '—'}</div>
            ${id === weak ? `<div class="cue-weak-tag">⚠️ ${escHtml(t('reportWeakTag'))}</div>` : ''}
        </div>`;
    }).join('');
}

/* ── 3. 建议 ── */
function renderAdvice(s) {
    const tips = [];
    const weak = weakestCue(s);
    if (weak === 'isolation') tips.push(t('adviceIsolation'));
    else if (weak) tips.push(t('adviceWeak').replace('{cue}', cueText(weak).long).replace('{desc}', cueText(weak).desc));
    if (s.scam.missed) tips.push(t('adviceMissed'));
    if (s.safe.falseAlarm) tips.push(t('adviceFalseAlarm').replace('{n}', s.safe.falseAlarm));
    if (s.safe.risky) tips.push(t('adviceRisky'));
    if (s.answered && s.correct === s.answered) tips.push(t('adviceAllRight'));
    tips.push(t('adviceRule'));
    tips.push(t('adviceRepeat'));
    $('adviceList').innerHTML = tips.map(x => `<li>${escHtml(x)}</li>`).join('');
}

/* ── 4. 每条消息回顾 ── */
function renderItems(s) {
    $('itemList').innerHTML = s.items.map(({ c, e }) => {
        const L = caseText(c);
        const kindLabel = c.kind === 'scam' ? t('reportKindScam') : t('reportKindSafe');
        const status = e.correct ? '✅ ' + t('reportItemRight')
            : c.kind === 'scam' ? '⚠️ ' + t('reportItemWrong')
            : e.outcome === 'flag' ? '🤔 ' + t('reportItemFalseAlarm') : '⚠️ ' + t('reportItemRisky');
        return `<div class="item-row ${e.correct ? 'right' : 'wrong'}">
            <span class="contact-avatar">${L.avatar}</span>
            <span class="item-main">
                <span class="item-name">${escHtml(L.contact)} <span class="item-kind ${c.kind}">${escHtml(kindLabel)}</span></span>
                <span class="item-detail">${CHANNELS[c.channel].icon} ${escHtml(t('reportYouChose'))}${escHtml(t('outcome_' + e.outcome))}</span>
            </span>
            <span class="item-status">${status}</span>
        </div>`;
    }).join('');
}

/* ── 6. 再练一轮 / 导出 ── */
function exportData() {
    const data = {
        app: 'TrueGuide (Phishing Sandbox prototype)',
        exportedAt: new Date().toISOString(),
        lang: getLang(),
        currentRound: currentRound(),
        preSurvey: getPreSurvey(),
        postSurvey: getPostSurvey(),
        lessonResults: Object.fromEntries(LESSON_IDS.map(id => [id, readJson('fraudgame_' + id + '_result', null)])),
        choices: getChoiceLog(),
        participantId: (getPreSurvey() && getPreSurvey().answers.pid) || null,
        modesUsed: [...new Set(getChoiceLog().map(e => e.mode))],
        minutesByRound: Array.from({ length: currentRound() }, (_, i) => roundMinutes(i + 1)),
        constructs: { pre: constructScores('pre'), post: constructScores('post') },
        summaryByRound: Array.from({ length: currentRound() }, (_, i) => {
            const st = computeStats(i + 1);
            return { round: i + 1, answered: st.answered, correct: st.correct, scam: st.scam, safe: st.safe, cues: st.cues };
        }),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `trueguide-record-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ── 导出为数据表格式（Phishing_Sandbox_Data.xlsx）──
   一个 CSV 里放三块，表头与工作簿完全一致，可以整行复制粘贴：
     Participants  — 判断对错来自游戏内 12 个任务（每个任务只算第一次选择）：
                     Pre-test = 第 1 轮，Post-test = 第 2 轮，1-week = 第 3 轮；
                     漏判数和各类线索漏看次数取自 Post-test（第 2 轮），与数据表 Guide 一致
     Background    — 入学前调查 A–D、C1–C12 和三个维度均值
     Post survey   — 结课调查 C1–C12、三个维度均值和 E1–E4
   需要研究人员观察记录的列（Age、Gender、Device use、Needed help）留空。 */
const EN = k => (I18N.en[k] !== undefined ? I18N.en[k] : '');
const pick = v => (Array.isArray(v) ? v.map(EN).join('; ') : v ? EN(v) : '');
const num = v => (typeof v === 'number' && isFinite(v) ? Math.round(v * 10000) / 10000 : '');

function csvCell(v) {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function participantsRow() {
    const pre = getPreSurvey(), post = getPostSurvey();
    const A = (pre && pre.answers) || {}, E = (post && post.answers) || {};
    const st = r => (r <= currentRound() ? computeStats(r) : null);
    const r1 = st(1), r2 = st(2), r3 = st(3);
    const correct = s => (s && s.answered ? s.correct : '');
    const items = LESSON_IDS.length;                 // 每轮题数 = 12（6 骗局 + 6 安全）
    const pct = c => (c === '' ? '' : num(c / items));
    const pre_ = pct(correct(r1)), post_ = pct(correct(r2)), wk = pct(correct(r3));
    const modes = getChoiceLog().filter(e => e.round === 1).map(e => e.mode);
    const mode = modes.length ? (modes.filter(m => m === 'chat').length > modes.length / 2 ? 'Round 1 – Text' : 'Round 2 – Scenario') : '';
    const fn = r2 && r2.answered ? r2.scam.missed : '';
    const miss = k => (r2 && r2.answered ? r2.cues[k].missed : '');
    return {
        'ID': A.pid || '',
        'Round': mode,
        'Age group': A.a1 && A.a1 !== 'oPreferNot' ? EN(A.a1) : '',
        'Age': '', 'Gender': '', 'Device use (1–5)': '',
        'Scam exposure (Y/N)': A.b2 === 'oYes' ? 'Y' : A.b2 === 'oNo' ? 'N' : '',
        'Pre-test correct': correct(r1), 'Post-test correct': correct(r2), '1-week correct': correct(r3),
        'Pre %': pre_, 'Post %': post_, '1-week %': wk,
        'Gain (Post−Pre)': correct(r1) !== '' && correct(r2) !== '' ? num((correct(r2) - correct(r1)) / items) : '',
        'Retention (1wk−Post)': correct(r2) !== '' && correct(r3) !== '' ? num((correct(r3) - correct(r2)) / items) : '',
        'Post-test false negatives': fn,
        'False-negative rate': fn !== '' && r2.scam.total ? num(fn / r2.scam.total) : '',
        'Missed identity': miss('identity'), 'Missed pressure': miss('pressure'),
        'Missed isolation': miss('isolation'), 'Missed transfer': miss('transfer'),
        'Engagement (1–5)': num(E.e1), 'Enjoyment (1–5)': num(E.e2),
        'Ease of use (1–5)': num(E.e3), 'Navigation difficulty (1–5)': num(E.e4),
        'Needed help (Y/N)': '',
        'Time (min)': roundMinutes(1) ?? '',
        'Quote / notes': [E.o1, E.o2].filter(Boolean).join(' / '),
    };
}

function cBlock(ans) {
    const row = {};
    for (let i = 1; i <= 12; i++) row['C' + i] = num(ans['c' + i]);
    row['Verification mean (C1,3,4,5,8,9,11,12)'] = num(meanOf(ans, C_CONSTRUCTS.verify));
    row['Pressure/trust mean (C2,C7)'] = num(meanOf(ans, C_CONSTRUCTS.pressure));
    row['Anxiety/avoid mean (C6,C10)'] = num(meanOf(ans, C_CONSTRUCTS.anxiety));
    return row;
}

function backgroundRow() {
    const A = (getPreSurvey() || { answers: {} }).answers;
    return Object.assign({
        'ID': A.pid || '',
        'Age group': A.a1 && A.a1 !== 'oPreferNot' ? EN(A.a1) : '',
        'Devices (A2)': pick(A.a2), 'Email (A3)': pick(A.a3_email), 'SMS (A3)': pick(A.a3_sms),
        'Phone calls (A3)': pick(A.a3_phone), 'Other platforms': A.a3_other || '',
        'Contact w/ younger family (A4)': pick(A.a4), 'Ask for help (A5)': pick(A.a5),
        'Heard of grandparent scam (B1)': pick(A.b1), 'Received such msg (B2)': pick(A.b2),
        'Someone close experienced (B3)': pick(A.b3), 'B4 What happened': A.b4 || '',
        'Learned about scams from (B5)': pick(A.b5),
    }, cBlock(A), {
        'D1 Suspicious signs': A.d1 || '', 'D2 First action (school-fee msg)': A.d2 || '',
        'D3 Easier/harder to check': A.d3 || '', 'D4 What would help': A.d4 || '',
    });
}

function postSurveyRow() {
    const E = (getPostSurvey() || { answers: {} }).answers;
    return Object.assign({ 'ID': ((getPreSurvey() || { answers: {} }).answers.pid) || '' }, cBlock(E), {
        'Engagement (1–5)': num(E.e1), 'Enjoyment (1–5)': num(E.e2),
        'Ease of use (1–5)': num(E.e3), 'Navigation difficulty (1–5)': num(E.e4),
        'Open 1': E.o1 || '', 'Open 2': E.o2 || '',
    });
}

function exportCsv() {
    const block = (title, row) => [title, Object.keys(row).map(csvCell).join(','), Object.values(row).map(csvCell).join(',')].join('\r\n');
    const text = [
        block('Participants', participantsRow()),
        block('Background', backgroundRow()),
        block('Post survey', postSurveyRow()),
    ].join('\r\n\r\n');
    const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });    // BOM：Excel 打开中文不乱码
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const id = ((getPreSurvey() || { answers: {} }).answers.pid || 'participant').replace(/[^\w-]/g, '_');
    a.download = `trueguide-${id}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function renderReport() {
    const s = computeStats();
    if (!s.answered && !isPreSurveyDone()) {
        $('reportContent').style.display = 'none';
        $('reportEmpty').style.display = 'block';
        return;
    }
    renderProgress();
    if (s.answered) {
        renderScore(s);
        renderCues(s);
        renderItems(s);
    } else {
        $('practiceSection').style.display = 'none';
    }
    renderAdvice(s);

    $('againBtn').onclick = () => {
        if (!confirm(t('reportAgainConfirm'))) return;
        startNewRound();
        window.location.href = 'home.html';
    };
    $('exportBtn').onclick = exportData;
    $('exportCsvBtn').onclick = exportCsv;
}
