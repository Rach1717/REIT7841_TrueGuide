/* ============================================================
   TrueGuide 反诈小课堂 — 学习进度、选择记录与统计（localStorage）
   需要先加载 cases.js（LESSON_IDS 和统计都依赖案例库）
   ============================================================ */

const STORAGE_PRE = 'fraudgame_presurvey';
const STORAGE_POST = 'fraudgame_postsurvey';
const STORAGE_CHOICES = 'fraudgame_choices';
const STORAGE_ROUND = 'fraudgame_round';
const LESSON_IDS = typeof CASES !== 'undefined' ? CASES.map(c => c.id) : [];

function readJson(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v === null ? fallback : v; }
    catch (e) { return fallback; }
}
function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 存储不可用时忽略 */ }
}

function savePreSurvey(answers) { writeJson(STORAGE_PRE, { answers, completedAt: Date.now() }); }
function savePostSurvey(answers) { writeJson(STORAGE_POST, { answers, completedAt: Date.now() }); }
function getPreSurvey() { return readJson(STORAGE_PRE, null); }
function getPostSurvey() { return readJson(STORAGE_POST, null); }
function isPreSurveyDone() { return !!getPreSurvey(); }
function isPostSurveyDone() { return !!getPostSurvey(); }

/* ── 每个案例是否完成（本轮） ── */
function saveLessonResult(lessonId, data) {
    writeJson('fraudgame_' + lessonId + '_result', Object.assign({ round: currentRound(), completedAt: Date.now() }, data));
}
function getLessonResult(lessonId) {
    const r = readJson('fraudgame_' + lessonId + '_result', null);
    return r && r.round === currentRound() ? r : null;
}
function allLessonsDone() { return LESSON_IDS.length > 0 && LESSON_IDS.every(id => !!getLessonResult(id)); }
function anyLessonDone() { return LESSON_IDS.some(id => !!getLessonResult(id)); }
function doneCount(ids = LESSON_IDS) { return ids.filter(id => !!getLessonResult(id)).length; }

/* ── 练习轮次：论文发现一周后会遗忘一部分，鼓励间隔重复练习 ── */
function currentRound() { return Number(readJson(STORAGE_ROUND, 1)) || 1; }
function startNewRound() { writeJson(STORAGE_ROUND, currentRound() + 1); }

/* 每轮第一次打开任务、最后一次完成任务的时间，用来算数据表里的 Time (min) */
const STORAGE_ROUND_TIMES = 'fraudgame_round_times';
function noteRoundTime() {
    const all = readJson(STORAGE_ROUND_TIMES, {}), r = currentRound(), now = Date.now();
    const t = all[r] || { start: now, end: now };
    t.start = Math.min(t.start, now); t.end = Math.max(t.end, now);
    all[r] = t; writeJson(STORAGE_ROUND_TIMES, all);
}
function roundMinutes(r) {
    const t = readJson(STORAGE_ROUND_TIMES, {})[r];
    return t ? Math.round((t.end - t.start) / 60000) : null;
}

/* ── 选择记录：每次点选项都记一条（研究导出用） ──
   { caseId, kind, cues, outcome, correct, attempt, round, mode, replay, ts } */
function getChoiceLog() { return readJson(STORAGE_CHOICES, []); }
function recordChoice(entry) {
    const log = getChoiceLog();
    log.push(Object.assign({ round: currentRound(), ts: Date.now() }, entry));
    writeJson(STORAGE_CHOICES, log);
}

/* ── 统计：每个案例只算本轮第一次作答 ──
   骗局：选对 = 识破；选错 = 漏判（false negative）
   安全：选对 = 认出；选 flag = 误判（false alarm）；选 comply = 危险习惯 */
function computeStats(round = currentRound()) {
    const first = {};
    getChoiceLog().forEach(e => {
        if (e.round !== round || e.attempt !== 1 || e.replay) return;
        if (!first[e.caseId] && caseById(e.caseId)) first[e.caseId] = e;
    });
    const s = {
        round, answered: 0, correct: 0,
        scam: { total: 0, caught: 0, missed: 0 },
        safe: { total: 0, ok: 0, falseAlarm: 0, risky: 0 },
        cues: {}, items: [],
    };
    CUE_IDS.forEach(id => { s.cues[id] = { total: 0, missed: 0 }; });

    CASES.forEach(c => {
        const e = first[c.id];
        if (!e) return;
        s.answered++;
        if (e.correct) s.correct++;
        if (c.kind === 'scam') {
            s.scam.total++;
            e.correct ? s.scam.caught++ : s.scam.missed++;
            c.cues.forEach(cue => {
                s.cues[cue].total++;
                if (!e.correct) s.cues[cue].missed++;     // 漏判的骗局，算作其中每种信号都漏掉
            });
        } else {
            s.safe.total++;
            if (e.correct) s.safe.ok++;
            else if (e.outcome === 'flag') s.safe.falseAlarm++;
            else s.safe.risky++;
        }
        s.items.push({ c, e });
    });
    return s;
}

/* ── C1–C12 的三个维度（问卷 Researcher-only coding guide）──
   verify   核实意愿与能力    C1 C3 C4 C5 C8 C9 C11 C12   越高越好
   pressure 家人身份/紧迫感   C2 C7                        越低越好
   anxiety  数字诈骗担忧/回避 C6 C10                       越低越好（单独报告，不与信心合并） */
const C_CONSTRUCTS = {
    verify: ['c1', 'c3', 'c4', 'c5', 'c8', 'c9', 'c11', 'c12'],
    pressure: ['c2', 'c7'],
    anxiety: ['c6', 'c10'],
};
function cConstructOf(id) {
    return Object.keys(C_CONSTRUCTS).find(k => C_CONSTRUCTS[k].includes(id)) || null;
}
function meanOf(answers, ids) {
    if (!answers) return null;
    const vals = ids.map(id => answers[id]).filter(v => typeof v === 'number');
    return vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : null;
}
// phase: 'pre' | 'post'
function constructScores(phase) {
    const sv = phase === 'pre' ? getPreSurvey() : getPostSurvey();
    if (!sv) return null;
    const out = {};
    Object.keys(C_CONSTRUCTS).forEach(k => { out[k] = meanOf(sv.answers, C_CONSTRUCTS[k]); });
    return out;
}

/* ── 流程：入学前调查（含信心自评）→ 练习 → 结课调查（含同样的信心自评）→ 报告 ── */
function nextRequiredPage() {
    return isPreSurveyDone() ? null : 'survey-pre.html';
}
function nextFinalStep() {
    if (!isPostSurveyDone()) return { href: 'survey-post.html', key: 'sbSurveyBtn' };
    return { href: 'report.html', key: 'sbReportBtn' };
}
