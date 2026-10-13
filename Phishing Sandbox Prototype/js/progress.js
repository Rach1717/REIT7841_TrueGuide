/* ============================================================
   反诈小课堂 — 学习进度与调查数据存取（localStorage）
   ============================================================ */

const STORAGE_PRE = 'fraudgame_presurvey';
const STORAGE_POST = 'fraudgame_postsurvey';
const LESSON_IDS = ['case1', 'case2', 'case3'];

function savePreSurvey(answers) {
    localStorage.setItem(STORAGE_PRE, JSON.stringify({ answers, completedAt: Date.now() }));
}

function savePostSurvey(answers) {
    localStorage.setItem(STORAGE_POST, JSON.stringify({ answers, completedAt: Date.now() }));
}

function getPreSurvey() {
    try { return JSON.parse(localStorage.getItem(STORAGE_PRE)); } catch (e) { return null; }
}

function getPostSurvey() {
    try { return JSON.parse(localStorage.getItem(STORAGE_POST)); } catch (e) { return null; }
}

function isPreSurveyDone() { return !!getPreSurvey(); }
function isPostSurveyDone() { return !!getPostSurvey(); }

function saveLessonResult(lessonId, correct, total) {
    localStorage.setItem('fraudgame_' + lessonId + '_result', JSON.stringify({ correct, total, completedAt: Date.now() }));
}

function getLessonResult(lessonId) {
    try { return JSON.parse(localStorage.getItem('fraudgame_' + lessonId + '_result')); } catch (e) { return null; }
}

function allLessonsDone() {
    return LESSON_IDS.every(id => !!getLessonResult(id));
}

function anyLessonDone() {
    return LESSON_IDS.some(id => !!getLessonResult(id));
}
