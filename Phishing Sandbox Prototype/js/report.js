/* ============================================================
   反诈小课堂 — 学习前后对比报告
   ============================================================ */

function avgOf(answers, ids) {
    if (!answers) return null;
    const vals = ids.map(id => answers[id]).filter(v => v !== null && v !== undefined);
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function renderMeterRow(container, labelKey, value, isAfter) {
    const row = document.createElement('div');
    row.className = 'report-bar-row';

    const label = document.createElement('div');
    label.className = 'report-bar-label';
    label.textContent = t(labelKey);

    const track = document.createElement('div');
    track.className = 'report-bar-track';
    const fill = document.createElement('div');
    fill.className = 'report-bar-fill' + (isAfter ? ' after' : '');
    fill.style.width = value === null ? '0%' : (value / 5 * 100) + '%';
    track.appendChild(fill);

    const val = document.createElement('div');
    val.className = 'report-bar-value';
    val.textContent = value === null ? '—' : value.toFixed(1);

    row.appendChild(label);
    row.appendChild(track);
    row.appendChild(val);
    container.appendChild(row);
}

function renderConstruct(containerId, titleKey, descKey, before, after) {
    const container = document.getElementById(containerId);
    const wrap = document.createElement('div');
    wrap.className = 'report-construct';

    const title = document.createElement('div');
    title.className = 'report-construct-title';
    title.textContent = t(titleKey);

    const desc = document.createElement('div');
    desc.className = 'report-construct-desc';
    desc.textContent = t(descKey);

    wrap.appendChild(title);
    wrap.appendChild(desc);
    container.appendChild(wrap);

    renderMeterRow(wrap, 'reportBefore', before, false);
    renderMeterRow(wrap, 'reportAfter', after, true);
}

function renderReport() {
    const pre = getPreSurvey();
    const post = getPostSurvey();

    if (!pre || !post) {
        document.getElementById('reportContent').style.display = 'none';
        document.getElementById('reportEmpty').style.display = 'block';
        return;
    }

    const preA = pre.answers;
    const postA = post.answers;

    renderConstruct('constructsContainer', 'reportConstructVerify', 'reportConstructVerifyDesc',
        avgOf(preA, ['l1', 'l2']), avgOf(postA, ['l1', 'l2']));
    renderConstruct('constructsContainer', 'reportConstructPressure', 'reportConstructPressureDesc',
        avgOf(preA, ['l3', 'l4']), avgOf(postA, ['l3', 'l4']));
    renderConstruct('constructsContainer', 'reportConstructAnxiety', 'reportConstructAnxietyDesc',
        avgOf(preA, ['l5', 'l6']), avgOf(postA, ['l5', 'l6']));

    const lessonNameKeys = { case1: 'case1Title', case2: 'case2Title', case3: 'case3Title' };
    let totalCorrect = 0, totalAll = 0;
    const lessonScoresEl = document.getElementById('lessonScores');

    LESSON_IDS.forEach(id => {
        const r = getLessonResult(id);
        if (!r) return;
        totalCorrect += r.correct;
        totalAll += r.total;
        const row = document.createElement('div');
        row.className = 'report-lesson-row';
        const name = document.createElement('span');
        name.textContent = t(lessonNameKeys[id]);
        const score = document.createElement('span');
        score.className = 'report-lesson-score';
        score.textContent = `${r.correct} / ${r.total} ${t('reportLessonScoreLabel')}`;
        row.appendChild(name);
        row.appendChild(score);
        lessonScoresEl.appendChild(row);
    });

    document.getElementById('overallScore').textContent =
        `${t('reportOverallScore')}: ${totalCorrect} / ${totalAll}`;

    const p1 = postA.p1 || [];
    if (p1.length) {
        document.getElementById('confidentTypesWrap').style.display = 'block';
        document.getElementById('confidentTypesList').textContent = p1.map(k => t(k)).join(t('listSep'));
    }
}
