/* ============================================================
   TrueGuide 反诈小课堂 — 信心自评题（并入入学前调查和结课调查）
   学习前、学习后各答一次，题目完全相同，每题 1–5 分：
     1 完全没信心 · 2 不太有信心 · 3 一般 · 4 比较有信心 · 5 非常有信心
   测的是"有多大信心识别冒充家人的骗局"，不是答对答错的能力测试；
   最终报告对比两次打分，看信心提升了多少。
   前 4 题对应四种骗术信号，后 4 题对应核实习惯、分辨真假、
   视频/语音冒充，以及能否放心用数字方式联系家人（论文中的信心/退缩问题）。
   （原来的 12 题"骗局 / 安全"判断测试保存在 _archive/tests-detection.js）
   ============================================================ */

const CONF_ITEMS = [
    { id: 'c1', qKey: 'confQ1', shortKey: 'confS1', cue: 'identity' },
    { id: 'c2', qKey: 'confQ2', shortKey: 'confS2', cue: 'pressure' },
    { id: 'c3', qKey: 'confQ3', shortKey: 'confS3', cue: 'isolation' },
    { id: 'c4', qKey: 'confQ4', shortKey: 'confS4', cue: 'transfer' },
    { id: 'c5', qKey: 'confQ5', shortKey: 'confS5' },
    { id: 'c6', qKey: 'confQ6', shortKey: 'confS6' },
    { id: 'c7', qKey: 'confQ7', shortKey: 'confS7' },
    { id: 'c8', qKey: 'confQ8', shortKey: 'confS8' },
];
