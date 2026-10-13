/* ============================================================
   反诈小课堂 — 沙盒场景：等距视角的"家"
   玩家在家里走动，靠近物品后互动：
     · 手机 / 电脑 / 平板 → 触发三个诈骗情景（复用 ChatEngine + case1/2/3 剧本）
     · 电视 / 冰箱 / 全家福 → 生活小贴士
   ============================================================ */

(function () {
    'use strict';

    // ?bg=1：作为首页的模糊背景（无界面、无输入，角色自己在家里踱步）
    const BG = new URLSearchParams(window.location.search).has('bg');
    if (BG) document.body.classList.add('sb-bg');
    if (!BG && !isPreSurveyDone()) {
        window.location.href = 'survey-pre.html';
        return;
    }
    initI18n('langSwitch');
    document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });

    /* ── 场景尺寸与投影 ── */
    const TW = 80, TH = 40;            // 一格地砖的屏幕宽高（2:1 等距）
    const COLS = 12, ROWS = 9;         // x 向右下、y 向左下
    const WALL_H = 150;
    const SCENE_W = (COLS + ROWS) * TW / 2 + 120;
    const SCENE_H = (COLS + ROWS) * TH / 2 + WALL_H + 140;
    const OX = ROWS * TW / 2 + 60;
    const OY = WALL_H + 70;

    const P = (gx, gy, gz = 0) => ({ x: OX + (gx - gy) * TW / 2, y: OY + (gx + gy) * TH / 2 - gz });

    function shade(hex, f) {
        const n = parseInt(hex.slice(1), 16);
        let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
        const target = f < 0 ? 0 : 255, a = Math.abs(f);
        r = Math.round(r + (target - r) * a);
        g = Math.round(g + (target - g) * a);
        b = Math.round(b + (target - b) * a);
        return `rgb(${r},${g},${b})`;
    }

    /* ── 绘图基础 ── */
    const canvas = document.getElementById('sbCanvas');
    const stage = document.getElementById('sbStage');
    const ctx = canvas.getContext('2d');
    const EDGE = 'rgba(40,30,20,.28)';
    let time = 0;

    function poly(pts, fill, stroke) {
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.closePath();
        if (fill) { ctx.fillStyle = fill; ctx.fill(); }
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
    }

    // 立方体：col 可以是 '#rrggbb'，也可以是 {t,l,r} 三个面的颜色
    function box(gx, gy, w, d, h, col, z0 = 0) {
        const c = typeof col === 'string'
            ? { t: shade(col, .1), l: shade(col, -.12), r: shade(col, -.26) } : col;
        const zt = z0 + h;
        poly([P(gx, gy + d, zt), P(gx + w, gy + d, zt), P(gx + w, gy + d, z0), P(gx, gy + d, z0)], c.l, EDGE);
        poly([P(gx + w, gy, zt), P(gx + w, gy + d, zt), P(gx + w, gy + d, z0), P(gx + w, gy, z0)], c.r, EDGE);
        poly([P(gx, gy, zt), P(gx + w, gy, zt), P(gx + w, gy + d, zt), P(gx, gy + d, zt)], c.t, EDGE);
    }
    const fx = (x, y0, y1, z0, z1, fill, stroke) =>
        poly([P(x, y0, z1), P(x, y1, z1), P(x, y1, z0), P(x, y0, z0)], fill, stroke);
    const fy = (y, x0, x1, z0, z1, fill, stroke) =>
        poly([P(x0, y, z1), P(x1, y, z1), P(x1, y, z0), P(x0, y, z0)], fill, stroke);
    const floorQuad = (x0, y0, x1, y1, fill, stroke) =>
        poly([P(x0, y0), P(x1, y0), P(x1, y1), P(x0, y1)], fill, stroke);
    function ball(gx, gy, gz, r, col) {
        const p = P(gx, gy, gz);
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
    }
    function legs(gx, gy, w, d, h, col, s = .1) {
        box(gx, gy, s, s, h, col);
        box(gx + w - s, gy, s, s, h, col);
        box(gx, gy + d - s, s, s, h, col);
        box(gx + w - s, gy + d - s, s, s, h, col);
    }
    function table(gx, gy, w, d, legH, col) {
        legs(gx + .06, gy + .06, w - .12, d - .12, legH, shade(col, -.25));
        box(gx, gy, w, d, 5, col, legH);
    }
    function chair(gx, gy, face, col) {
        legs(gx + .18, gy + .18, .64, .64, 18, '#6b5a48', .08);
        const back = {
            '+x': () => box(gx + .08, gy + .15, .12, .7, 34, col, 22),
            '-x': () => box(gx + .8, gy + .15, .12, .7, 34, col, 22),
            '+y': () => box(gx + .15, gy + .08, .7, .12, 34, col, 22),
            '-y': () => box(gx + .15, gy + .8, .7, .12, 34, col, 22),
        }[face];
        if (face === '+x' || face === '+y') back();
        box(gx + .12, gy + .12, .76, .76, 6, col, 18);
        if (face === '-x' || face === '-y') back();
    }

    /* ── 物品清单 ── */
    const pulse = () => .5 + .5 * Math.sin(time * 6);

    const OBJ = [
        { id: 'bookshelf', gx: 0, gy: 0, w: 1, d: 2, draw() {
            box(0, 0, 1, 2, 98, '#8a5a35');
            const cols = ['#c0563b', '#3b6ea5', '#e0b04a', '#5e8f5a', '#8a5aa5', '#d9d2c4'];
            [10, 40, 70].forEach((z, r) => {
                fx(1, .12, 1.88, z, z + 22, '#4a2f1c');
                for (let i = 0; i < 6; i++) {
                    const y0 = .16 + i * .27;
                    fx(1, y0, y0 + .2, z + 1, z + 15 + ((i + r) % 3) * 3, cols[(i * 2 + r) % cols.length]);
                }
            });
        } },
        { id: 'tv', gx: 0, gy: 3, w: 1, d: 2, h: 80, blocks: true,
          inter: { type: 'tip', tip: 'tv', icon: '📺', nameKey: 'sbObjTv' }, draw() {
            box(0, 3, 1, 2, 24, '#6b4a32');
            box(.35, 3.25, .22, 1.5, 48, '#1c1f26', 28);
            const flick = .55 + .1 * Math.sin(time * 3);
            fx(.57, 3.32, 4.68, 33, 70, `rgba(60,120,190,${flick + .3})`);
            fx(.57, 3.32, 4.68, 33, 42, '#c0392b');
            fx(.57, 3.7, 4.3, 52, 58, 'rgba(255,255,255,.75)');
            fx(.57, 3.7, 4.0, 46, 50, 'rgba(255,255,255,.5)');
            box(.42, 3.85, .12, .3, 6, '#333', 24);
        } },
        { id: 'plant1', gx: 0, gy: 6, w: 1, d: 1, draw() {
            box(.28, 6.28, .44, .44, 16, '#b5653a');
            [['#3f8f4f', 0, 0, 34, 15], ['#4fa35e', -.1, .08, 46, 13], ['#357a43', .1, -.08, 44, 12], ['#5cb56b', 0, 0, 56, 9]]
                .forEach(([c, dx, dy, z, r]) => ball(.5 + dx, 6.5 + dy, z, r, c));
        } },
        { id: 'armchair', gx: 1, gy: 7, w: 1, d: 1, draw() {
            box(1.05, 7.05, .9, .9, 20, '#c98f5a');
            box(1.0, 7.0, .3, 1, 44, '#b9804d');
            box(1.05, 7.0, .9, .18, 32, '#b9804d');
            box(1.05, 7.82, .9, .18, 32, '#b9804d');
        } },
        { id: 'lamp', gx: 4, gy: 0, w: 1, d: 1, draw() {
            box(4.42, .42, .16, .16, 6, '#444');
            box(4.47, .47, .06, .06, 84, '#666', 6);
            box(4.25, .25, .5, .5, 24, '#f6e6b4', 84);
        } },
        { id: 'coffee', gx: 2, gy: 4, w: 1, d: 1, h: 34, blocks: true,
          inter: { type: 'case', caseId: 'case1', icon: '📱', nameKey: 'sbObjPhone' }, draw() {
            table(2.02, 4.02, .96, .96, 14, '#a9784a');
            box(2.22, 4.32, .5, .12, 5, '#fff', 19);
            box(2.6, 4.6, .26, .26, 9, '#e8e3d9', 19);
            const lit = !getLessonResult('case1');
            box(2.3, 4.5, .36, .44, 3, '#1d2027', 19);
            floorQuadZ(2.33, 4.53, 2.63, 4.91, 22, lit ? `rgba(${120 + 100 * pulse()},${200 + 50 * pulse()},255,1)` : '#4a5060');
        } },
        { id: 'sofa', gx: 3, gy: 3, w: 1, d: 3, draw() {
            const c = '#4f74a0';
            box(3, 3, 1, .3, 36, c);
            box(3, 3.3, 1, 2.4, 22, c);
            [3.35, 4.05, 4.75].forEach((y, i) => box(3.05, y, .62, .62, 5, '#6a8fbf', 22));
            box(3.68, 3.3, .32, 2.4, 54, c);
            box(3, 5.7, 1, .3, 36, c);
        } },
        { id: 'desk', gx: 5, gy: 0, w: 3, d: 1, h: 62, blocks: true,
          inter: { type: 'case', caseId: 'case2', icon: '💻', nameKey: 'sbObjLaptop' }, draw() {
            table(5.02, .02, 2.96, .96, 24, '#c8a06c');
            box(7.1, .2, .5, .4, 10, '#b5563b', 29);
            box(6.9, .62, .12, .12, 8, '#e0e0e0', 29);
            box(5.3, .3, .5, .12, 6, '#555', 29);
            const lit = !getLessonResult('case2');
            box(5.95, .3, .9, .55, 2, '#cfd4dc', 29);
            box(5.95, .3, .9, .07, 32, '#2b2f3a', 31);
            fy(.37, 6.0, 6.85, 34, 60, lit ? '#5fb0e8' : '#8a93a3');
            fy(.37, 6.05, 6.3, 52, 58, '#fff');
            fy(.37, 6.05, 6.6, 46, 50, 'rgba(255,255,255,.7)');
            if (lit) fy(.37, 6.55, 6.8, 50, 58, `rgba(230,${60 + 60 * pulse()},60,1)`);
        } },
        { id: 'deskchair', gx: 6, gy: 1, w: 1, d: 1, draw() { chair(6, 1, '-y', '#6a8a6a'); } },
        { id: 'fridge', gx: 10, gy: 0, w: 1, d: 1, h: 104, blocks: true,
          inter: { type: 'tip', tip: 'fridge', icon: '🧲', nameKey: 'sbObjFridge' }, draw() {
            box(10, 0, 1, 1, 106, '#dfe6ea');
            fy(1, 10.03, 10.97, 64, 66, '#a6b0b6');
            fy(1, 10.8, 10.9, 74, 96, '#777');
            fy(1, 10.8, 10.9, 30, 54, '#777');
            fy(1, 10.15, 10.6, 68, 92, '#fff3a8', '#c9a92c');
            fy(1, 10.22, 10.52, 84, 86, '#c0392b');
            fy(1, 10.22, 10.5, 78, 80, '#555');
            fy(1, 10.22, 10.5, 72, 74, '#555');
        } },
        { id: 'counter', gx: 11, gy: 0, w: 1, d: 2, draw() {
            box(11, 0, 1, 2, 36, '#c9b79b');
            box(11, 0, 1, 2, 3, '#8a9096', 36);
            box(11.3, .5, .4, .4, 14, '#5d8fa8', 39);
            box(11.35, 1.2, .3, .3, 8, '#e05a3a', 39);
        } },
        { id: 'dining', gx: 7, gy: 4, w: 2, d: 2, h: 60, blocks: true,
          inter: { type: 'case', caseId: 'case3', icon: '🎥', nameKey: 'sbObjTablet' }, draw() {
            table(7.02, 4.02, 1.96, 1.96, 20, '#b98a5a');
            box(8.35, 5.25, .22, .22, 8, '#fff', 25);
            box(7.25, 5.3, .3, .3, 4, '#e8d9a8', 25);
            const lit = !getLessonResult('case3');
            box(7.55, 4.55, .8, .1, 34, '#2f3441', 25);
            fy(4.65, 7.6, 8.3, 28, 56, lit ? '#78b4f0' : '#8a93a3');
            if (lit) {
                ball(7.95, 4.65, 46, 6, '#f2c9a0');
                ball(7.95, 4.65, 33, 9, '#4a6fa5');
                ball(8.2, 4.65, 52, 3.5 + 1.5 * pulse(), '#e53e3e');
            }
        } },
        { id: 'chairL', gx: 6, gy: 4, w: 1, d: 1, draw() { chair(6, 4, '+x', '#a55a45'); } },
        { id: 'chairR', gx: 9, gy: 5, w: 1, d: 1, draw() { chair(9, 5, '-x', '#a55a45'); } },
        { id: 'plant2', gx: 10, gy: 7, w: 1, d: 1, draw() {
            box(10.25, 7.25, .5, .5, 18, '#8a6a4a');
            [['#3f8f4f', 0, 0, 40, 17], ['#4fa35e', -.12, .1, 54, 14], ['#357a43', .12, -.1, 52, 13], ['#5cb56b', 0, 0, 66, 10]]
                .forEach(([c, dx, dy, z, r]) => ball(10.5 + dx, 7.5 + dy, z, r, c));
        } },
    ];

    // 顶面上的小面片（手机屏幕）
    function floorQuadZ(x0, y0, x1, y1, z, fill) {
        poly([P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)], fill);
    }

    // 挂在墙上的全家福（可互动）
    const PHOTO = { id: 'photo', gx: 0, gy: 0, w: 1, d: 2, blocks: false, decal: true,
        inter: { type: 'tip', tip: 'photo', icon: '🖼️', nameKey: 'sbObjPhoto' },
        poly() { return [P(0, .35, 142), P(0, 1.65, 142), P(0, 1.65, 106), P(0, .35, 106)]; },
        bubbleAt: () => P(0, 1, 156) };

    const INTERACTIVE = OBJ.filter(o => o.inter).concat([PHOTO]);

    const hexHit = o => {
        const h = o.h || 0;
        return [P(o.gx, o.gy, h), P(o.gx + o.w, o.gy, h), P(o.gx + o.w, o.gy, 0),
                P(o.gx + o.w, o.gy + o.d, 0), P(o.gx, o.gy + o.d, 0), P(o.gx, o.gy + o.d, h)];
    };
    OBJ.forEach(o => { if (o.blocks === undefined) o.blocks = true; });

    /* ── 碰撞格与寻路 ── */
    const blocked = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    OBJ.forEach(o => {
        if (!o.blocks) return;
        for (let y = o.gy; y < o.gy + o.d; y++)
            for (let x = o.gx; x < o.gx + o.w; x++) blocked[y][x] = true;
    });
    const cellFree = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS && !blocked[y][x];
    const canStand = (x, y, r = .22) =>
        cellFree(Math.floor(x - r), Math.floor(y - r)) && cellFree(Math.floor(x + r), Math.floor(y - r)) &&
        cellFree(Math.floor(x - r), Math.floor(y + r)) && cellFree(Math.floor(x + r), Math.floor(y + r));

    function bfs(sx, sy) {
        const dist = Array.from({ length: ROWS }, () => Array(COLS).fill(-1));
        const prev = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
        const q = [[sx, sy]];
        dist[sy][sx] = 0;
        for (let i = 0; i < q.length; i++) {
            const [cx, cy] = q[i];
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (!dx && !dy) continue;
                    const nx = cx + dx, ny = cy + dy;
                    if (!cellFree(nx, ny) || dist[ny][nx] >= 0) continue;
                    if (dx && dy && (!cellFree(cx + dx, cy) || !cellFree(cx, cy + dy))) continue;
                    dist[ny][nx] = dist[cy][cx] + 1;
                    prev[ny][nx] = [cx, cy];
                    q.push([nx, ny]);
                }
            }
        }
        return { dist, prev };
    }

    // 从玩家当前位置走向 goals 里最近的一个格子；返回是否找到路
    function planTo(goals) {
        const sx = Math.min(COLS - 1, Math.max(0, Math.floor(player.x)));
        const sy = Math.min(ROWS - 1, Math.max(0, Math.floor(player.y)));
        const { dist, prev } = bfs(sx, sy);
        let best = null;
        goals.forEach(([gx, gy]) => {
            if (!cellFree(gx, gy) || dist[gy][gx] < 0) return;
            if (!best || dist[gy][gx] < dist[best[1]][best[0]]) best = [gx, gy];
        });
        if (!best) return false;
        const cells = [];
        let cur = best;
        while (cur && !(cur[0] === sx && cur[1] === sy)) {
            cells.unshift(cur);
            cur = prev[cur[1]][cur[0]];
        }
        path = cells.map(([x, y]) => ({ x: x + .5, y: y + .5 }));
        return true;
    }

    const rectDist = (px, py, o) => Math.hypot(
        Math.max(o.gx - px, 0, px - (o.gx + o.w)),
        Math.max(o.gy - py, 0, py - (o.gy + o.d)));
    const NEAR = .95;

    /* ── 玩家 ── */
    const player = { x: 5.5, y: 7.5, sx: 0, sy: 1, phase: 0, moving: false };
    let path = [], pending = null, hover = null, near = null;
    const keys = new Set();
    let modalOpen = false;

    function drawPlayer() {
        const p = P(player.x, player.y);
        const swing = player.moving ? Math.sin(player.phase) : 0;
        const bob = player.moving ? Math.abs(Math.cos(player.phase)) * 3 : 0;
        const front = player.sy >= 0;
        const dir = player.sx >= 0 ? 1 : -1;

        ctx.fillStyle = 'rgba(0,0,0,.22)';
        ctx.beginPath(); ctx.ellipse(p.x, p.y + 1, 15, 7, 0, 0, Math.PI * 2); ctx.fill();

        // 腿
        ctx.fillStyle = '#4a4f63';
        ctx.fillRect(p.x - 8, p.y - 15 - Math.max(0, swing) * 3, 6, 15 + Math.max(0, swing) * 3 - 0);
        ctx.fillRect(p.x + 2, p.y - 15 - Math.max(0, -swing) * 3, 6, 15 + Math.max(0, -swing) * 3 - 0);
        ctx.fillStyle = '#2b2b33';
        ctx.fillRect(p.x - 9, p.y - 3 + swing * -1, 8, 4);
        ctx.fillRect(p.x + 1, p.y - 3 + swing, 8, 4);

        const by = p.y - 16 - bob;
        // 身体（开衫）
        ctx.fillStyle = '#c0563b';
        roundRect(p.x - 12, by - 26, 24, 28, 7); ctx.fill();
        ctx.fillStyle = '#f0e4d0';
        if (front) ctx.fillRect(p.x - 3, by - 24, 6, 22);
        // 手臂
        ctx.fillStyle = '#a84630';
        ctx.fillRect(p.x - 15, by - 22 + swing * 2, 5, 18);
        ctx.fillRect(p.x + 10, by - 22 - swing * 2, 5, 18);
        // 拐杖
        ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(p.x + 13 * dir, by - 8); ctx.lineTo(p.x + 16 * dir, p.y); ctx.stroke();

        // 头
        const hy = by - 36;
        ctx.fillStyle = '#f2c9a0';
        ctx.beginPath(); ctx.arc(p.x, hy, 11, 0, Math.PI * 2); ctx.fill();
        // 银发
        ctx.fillStyle = '#e4e4ea';
        ctx.beginPath();
        if (front) ctx.arc(p.x, hy - 2, 11.5, Math.PI * 1.02, Math.PI * 1.98);
        else ctx.arc(p.x, hy, 11.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath(); ctx.arc(p.x - 1 * dir, hy - 12, 5, 0, Math.PI * 2); ctx.fill();
        if (front) {
            ctx.fillStyle = '#3a3a44';
            ctx.beginPath(); ctx.arc(p.x - 4 + dir * 1.5, hy + 1, 1.6, 0, 7); ctx.arc(p.x + 4 + dir * 1.5, hy + 1, 1.6, 0, 7); ctx.fill();
            ctx.strokeStyle = '#666'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(p.x - 4 + dir * 1.5, hy + 1, 3.6, 0, 7); ctx.arc(p.x + 4 + dir * 1.5, hy + 1, 3.6, 0, 7); ctx.stroke();
            ctx.strokeStyle = '#b06a5a'; ctx.beginPath(); ctx.arc(p.x + dir * 1.5, hy + 5, 3, .2, Math.PI - .2); ctx.stroke();
        }
    }

    function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    /* ── 场景绘制：地板 / 墙 / 排序物体 / 提示气泡 ── */
    function drawFloor() {
        // 地板边缘厚度
        poly([P(0, ROWS), P(COLS, ROWS), P(COLS, ROWS, -16), P(0, ROWS, -16)], '#b39d7f', EDGE);
        poly([P(COLS, 0), P(COLS, ROWS), P(COLS, ROWS, -16), P(COLS, 0, -16)], '#8f7c62', EDGE);
        for (let gx = 0; gx < COLS; gx++) {
            for (let gy = 0; gy < ROWS; gy++) {
                const odd = (gx + gy) % 2;
                const wood = gx < 5;
                floorQuad(gx, gy, gx + 1, gy + 1,
                    wood ? (odd ? '#dbbb8c' : '#d2b07e') : (odd ? '#ece9e2' : '#e1ded6'),
                    'rgba(0,0,0,.05)');
            }
        }
    }

    function drawWalls() {
        const wallTop = '#c9c2b4';
        box(0, -.25, COLS, .25, WALL_H, { t: wallTop, l: '#f1ebdf', r: '#d9d2c4' });
        box(-.25, -.25, .25, ROWS + .25, WALL_H, { t: wallTop, l: '#cfc8ba', r: '#e5decf' });
        // 踢脚线
        fy(0, 0, COLS, 0, 9, '#d3c9b8');
        fx(0, 0, ROWS, 0, 9, '#cfc4b1');

        // 窗（左墙）
        fx(0, 5.1, 7.5, 50, 130, '#8a7f6c');
        fx(0, 5.2, 7.4, 56, 124, '#bfe4f5');
        fx(0, 5.2, 7.4, 56, 90, 'rgba(255,255,255,.25)');
        fx(0, 6.27, 6.33, 56, 124, '#8a7f6c');
        fx(0, 5.2, 7.4, 89, 92, '#8a7f6c');
        fx(0, 4.85, 5.4, 48, 136, '#e7b0a4', EDGE);
        fx(0, 7.2, 7.75, 48, 136, '#e7b0a4', EDGE);
        // 门（右墙）
        fy(0, 8.1, 9.5, 0, 116, '#5b3b22');
        fy(0, 8.2, 9.4, 0, 108, '#8b5e3c');
        fy(0, 8.32, 9.28, 12, 96, '#7d5334');
        ball(9.2, 0, 54, 3.2, '#e8c15a');
        // 挂钟（右墙）
        ctx.save();
        const c = P(3.4, 0, 112);
        ctx.translate(c.x, c.y); ctx.transform(1, .5, 0, 1, 0, 0);
        ctx.fillStyle = '#fff'; ctx.strokeStyle = '#6b5a48'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -10); ctx.moveTo(0, 0); ctx.lineTo(7, 3); ctx.stroke();
        ctx.restore();
        // 风景画（右墙，书桌上方）
        fy(0, 5.3, 7.5, 74, 128, '#6b5a48');
        fy(0, 5.38, 7.42, 80, 122, '#a9d4ee');
        fy(0, 5.38, 7.42, 80, 96, '#78b06a');
        fy(0, 6.1, 6.9, 96, 104, '#8fc17f');

        // 全家福（左墙）
        const pp = PHOTO.poly();
        poly(pp, '#7a5a3a', EDGE);
        fx(0, .45, 1.55, 111, 137, '#f6efe0');
        [[.7, '#c0563b'], [1.0, '#3b6ea5'], [1.3, '#5e8f5a']].forEach(([y, col], i) => {
            ball(0, y, 128 - (i === 1 ? 0 : 3), 4.5, '#f2c9a0');
            ball(0, y, 119, 6, col);
        });
    }

    function drawRugsAndMats() {
        floorQuad(1, 3, 3, 6, '#b7c4e0', 'rgba(0,0,0,.12)');
        floorQuad(1.15, 3.15, 2.85, 5.85, '#a9b9dd');
        floorQuad(6, 3.5, 10, 6.5, '#e6c9c0', 'rgba(0,0,0,.1)');
        floorQuad(6.15, 3.65, 9.85, 6.35, '#dfbdb2');
        floorQuad(8.2, 0, 9.4, 1, '#7a6a55', 'rgba(0,0,0,.2)');
        // 窗边的阳光
        poly([P(.02, 5.2), P(.02, 7.4), P(2.4, 8.6), P(2.4, 6.4)], 'rgba(255,248,210,.28)');
    }

    function drawShadows() {
        OBJ.forEach(o => {
            if (!o.blocks) return;
            floorQuad(o.gx + .08, o.gy + .08, o.gx + o.w + .18, o.gy + o.d + .18, 'rgba(60,40,20,.13)');
        });
    }

    function sortItems(items) {
        const behind = (a, b) => a.gx + a.w <= b.gx + 1e-6 || a.gy + a.d <= b.gy + 1e-6;
        const order = items.map((_, i) => i).sort((i, j) =>
            (items[i].gx + items[i].w / 2 + items[i].gy + items[i].d / 2) -
            (items[j].gx + items[j].w / 2 + items[j].gy + items[j].d / 2));
        const state = Array(items.length).fill(0), out = [];
        const visit = i => {
            if (state[i]) return;
            state[i] = 1;
            order.forEach(j => {
                if (j !== i && behind(items[j], items[i]) && !behind(items[i], items[j])) visit(j);
            });
            out.push(items[i]);
        };
        order.forEach(visit);
        return out;
    }

    function outlineFor(o) {
        if (o.decal) { poly(o.poly(), null, null); return; }
        const pts = hexHit({ ...o, h: o.h || 60 });
        ctx.save();
        ctx.shadowColor = 'rgba(255,200,60,.9)'; ctx.shadowBlur = 14;
        ctx.strokeStyle = '#ffc83d'; ctx.lineWidth = 3;
        floorQuad(o.gx - .05, o.gy - .05, o.gx + o.w + .05, o.gy + o.d + .05, 'rgba(255,200,60,.28)');
        ctx.beginPath();
        [P(o.gx - .05, o.gy - .05), P(o.gx + o.w + .05, o.gy - .05), P(o.gx + o.w + .05, o.gy + o.d + .05), P(o.gx - .05, o.gy + o.d + .05)]
            .forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.closePath(); ctx.stroke();
        ctx.restore();
        void pts;
    }

    function bubbleFor(o) {
        const inter = o.inter;
        let icon = inter.icon, kind = 'idle';
        if (inter.type === 'case') {
            if (getLessonResult(inter.caseId)) { icon = '✅'; kind = 'done'; } else kind = 'alert';
        } else if (tipSeen(inter.tip)) {
            return;
        } else { icon = '💡'; kind = 'tip'; }
        const a = o.bubbleAt ? o.bubbleAt() : P(o.gx + o.w / 2, o.gy + o.d / 2, (o.h || 60) + 14);
        const bob = Math.sin(time * 3 + o.gx) * 4;
        const x = a.x, y = a.y - 24 + bob;
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
        ctx.fillStyle = kind === 'done' ? '#e9f7ef' : '#fff';
        ctx.strokeStyle = kind === 'alert' ? '#dc2626' : kind === 'done' ? '#16a34a' : '#c9a227';
        ctx.lineWidth = 3;
        roundRect(x - 19, y - 19, 38, 38, 12); ctx.fill();
        ctx.shadowColor = 'transparent'; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 6, y + 18); ctx.lineTo(x, y + 26); ctx.lineTo(x + 6, y + 18); ctx.fillStyle = ctx.strokeStyle; ctx.fill();
        ctx.font = '22px "Segoe UI Emoji","Apple Color Emoji",sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(icon, x, y + 1);
        if (kind === 'alert') {
            ctx.fillStyle = '#dc2626';
            ctx.beginPath(); ctx.arc(x + 17, y - 17, 8 + pulse() * 2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.fillText('!', x + 17, y - 16);
        }
        ctx.restore();
    }

    let view = { scale: 1, tx: 0, ty: 0 };

    function render() {
        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        updateView();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(dpr * view.scale, 0, 0, dpr * view.scale, dpr * view.tx, dpr * view.ty);

        drawFloor();
        drawWalls();
        drawRugsAndMats();
        drawShadows();

        const active = near || hover;
        if (active && !active.decal) outlineFor(active);

        const items = OBJ.slice();
        items.push({ gx: player.x - .2, gy: player.y - .2, w: .4, d: .4, draw: drawPlayer });
        sortItems(items).forEach(o => o.draw());

        if (active && active.decal) {
            ctx.save();
            ctx.shadowColor = 'rgba(255,200,60,.9)'; ctx.shadowBlur = 14;
            poly(active.poly(), 'rgba(255,200,60,.25)', '#ffc83d');
            ctx.lineWidth = 3; ctx.stroke();
            ctx.restore();
        }
        if (!BG) INTERACTIVE.forEach(bubbleFor);
    }

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(stage.clientWidth * dpr);
        canvas.height = Math.round(stage.clientHeight * dpr);
        updateView();
    }

    // 地图缩放：放大后镜头跟随玩家，缩小则居中
    function updateView() {
        const w = stage.clientWidth, h = stage.clientHeight;
        const base = BG ? Math.max(w / SCENE_W, h / SCENE_H) * 1.05 : Math.min(w / SCENE_W, h / SCENE_H);
        const scale = base * (BG ? 1 : ui.zoom);
        const fit = (size, sceneSize, focus) => {
            const span = sceneSize * scale;
            if (span <= size) return (size - span) / 2;
            return Math.min(0, Math.max(size - span, size / 2 - focus * scale));
        };
        const f = P(player.x, player.y, 30);
        view = { scale, tx: fit(w, SCENE_W, f.x), ty: fit(h, SCENE_H, f.y) + (span0(h, SCENE_H, scale) ? 10 * scale : 0) };
    }
    const span0 = (size, sceneSize, scale) => sceneSize * scale <= size;

    /* ── 界面设置：字号 / 地图大小（保存在本机） ── */
    const UI_KEY = 'fraudgame_ui';
    const FONT_STEPS = [.9, 1, 1.15, 1.3, 1.5];
    const ui = (() => {
        try { return Object.assign({ font: 1, zoom: 1 }, JSON.parse(localStorage.getItem(UI_KEY))); }
        catch (e) { return { font: 1, zoom: 1 }; }
    })();
    function applyUi() {
        document.documentElement.style.setProperty('--ui-scale', ui.font);
        try { localStorage.setItem(UI_KEY, JSON.stringify(ui)); } catch (e) { /* ignore */ }
        updateView();
    }
    function adjust(act) {
        if (act === 'font+' || act === 'font-') {
            let i = FONT_STEPS.indexOf(ui.font); if (i < 0) i = 1;
            ui.font = FONT_STEPS[Math.max(0, Math.min(FONT_STEPS.length - 1, i + (act === 'font+' ? 1 : -1)))];
        } else {
            ui.zoom = Math.max(.6, Math.min(2, +(ui.zoom + (act === 'zoom+' ? .2 : -.2)).toFixed(2)));
        }
        applyUi();
    }
    document.addEventListener('click', ev => {
        const b = ev.target.closest('[data-act]');
        if (b) adjust(b.dataset.act);
    });
    canvas.addEventListener('wheel', ev => {
        if (modalOpen || BG) return;
        ev.preventDefault();
        adjust(ev.deltaY < 0 ? 'zoom+' : 'zoom-');
    }, { passive: false });

    /* ── 输入：键盘 / 鼠标 / 触摸 ── */
    const KEYMAP = { ArrowUp: 'u', w: 'u', W: 'u', ArrowDown: 'd', s: 'd', S: 'd',
                     ArrowLeft: 'l', a: 'l', A: 'l', ArrowRight: 'r', d: 'r', D: 'r' };

    window.addEventListener('keydown', e => {
        if (modalOpen) {
            if (e.key === 'Escape') closeModal();
            return;
        }
        if (KEYMAP[e.key]) { keys.add(KEYMAP[e.key]); pending = null; path = []; e.preventDefault(); }
        else if ((e.key === ' ' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') && near) {
            e.preventDefault();
            activate(near);
        }
    });
    window.addEventListener('keyup', e => { if (KEYMAP[e.key]) keys.delete(KEYMAP[e.key]); });
    window.addEventListener('blur', () => keys.clear());

    function toScene(ev) {
        const r = canvas.getBoundingClientRect();
        return { x: (ev.clientX - r.left - view.tx) / view.scale, y: (ev.clientY - r.top - view.ty) / view.scale };
    }
    function toGrid(s) {
        const u = (s.x - OX) / (TW / 2), v = (s.y - OY) / (TH / 2);
        return { x: (u + v) / 2, y: (v - u) / 2 };
    }
    function inPoly(pt, poly) {
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const a = poly[i], b = poly[j];
            if ((a.y > pt.y) !== (b.y > pt.y) && pt.x < (b.x - a.x) * (pt.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
        }
        return inside;
    }
    function objectAt(s) {
        // 从最靠前（更靠近屏幕下方）的物品开始判断
        const list = INTERACTIVE.slice().sort((a, b) => (b.gx + b.gy + b.w + b.d) - (a.gx + a.gy + a.w + a.d));
        return list.find(o => inPoly(s, o.decal ? o.poly() : hexHit(o))) || null;
    }

    canvas.addEventListener('mousemove', ev => {
        if (modalOpen) return;
        hover = objectAt(toScene(ev));
        canvas.style.cursor = hover ? 'pointer' : 'default';
    });
    canvas.addEventListener('mouseleave', () => { hover = null; });

    canvas.addEventListener('click', ev => {
        if (modalOpen) return;
        const s = toScene(ev);
        const obj = objectAt(s);
        if (obj) {
            if (rectDist(player.x, player.y, obj) <= NEAR) { activate(obj); return; }
            const goals = [];
            for (let y = 0; y < ROWS; y++)
                for (let x = 0; x < COLS; x++)
                    if (cellFree(x, y) && rectDist(x + .5, y + .5, obj) <= NEAR) goals.push([x, y]);
            if (planTo(goals)) pending = obj; else pending = null;
            return;
        }
        pending = null;
        const g = toGrid(s);
        let gx = Math.floor(g.x), gy = Math.floor(g.y);
        if (!cellFree(gx, gy)) {
            const goals = [];
            for (let y = 0; y < ROWS; y++)
                for (let x = 0; x < COLS; x++) if (cellFree(x, y)) goals.push([x, y, Math.hypot(x + .5 - g.x, y + .5 - g.y)]);
            goals.sort((a, b) => a[2] - b[2]);
            if (!goals.length || goals[0][2] > 2.2) return;
            gx = goals[0][0]; gy = goals[0][1];
        }
        planTo([[gx, gy]]);
    });

    const promptBtn = document.getElementById('sbPrompt');
    promptBtn.addEventListener('click', () => { if (near) activate(near); });

    /* ── 每帧更新 ── */
    function update(dt) {
        let vx = 0, vy = 0;
        if (keys.has('u')) { vx -= 1; vy -= 1; }
        if (keys.has('d')) { vx += 1; vy += 1; }
        if (keys.has('l')) { vx -= 1; vy += 1; }
        if (keys.has('r')) { vx += 1; vy -= 1; }
        const speed = 3.3;
        player.moving = false;

        if (vx || vy) {
            const len = Math.hypot(vx, vy);
            const dx = vx / len * speed * dt, dy = vy / len * speed * dt;
            if (canStand(player.x + dx, player.y)) player.x += dx;
            if (canStand(player.x, player.y + dy)) player.y += dy;
            face(vx, vy);
        } else if (BG && !path.length) {
            wait -= dt;
            if (wait <= 0) {
                wait = 1 + Math.random() * 2.5;
                planTo([[Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS)]]);
            }
        } else if (path.length) {
            const t = path[0];
            const dx = t.x - player.x, dy = t.y - player.y, d = Math.hypot(dx, dy);
            const step = speed * dt;
            if (d <= step) { player.x = t.x; player.y = t.y; path.shift(); }
            else { player.x += dx / d * step; player.y += dy / d * step; }
            face(dx, dy);
        }
        if (player.moving) player.phase += dt * 11;

        if (!path.length && pending) {
            const o = pending; pending = null;
            if (rectDist(player.x, player.y, o) <= NEAR + .1) activate(o);
        }

        let best = null, bd = NEAR;
        INTERACTIVE.forEach(o => {
            const d = rectDist(player.x, player.y, o);
            if (d <= bd) { best = o; bd = d; }
        });
        if (best !== near) { near = best; refreshPrompt(); }
    }

    function face(vx, vy) {
        player.moving = true;
        player.sx = vx - vy;
        player.sy = vx + vy;
    }

    let last = 0, wait = 1;
    function frame(ts) {
        const dt = Math.min(.05, (ts - last) / 1000 || 0);
        last = ts; time = ts / 1000;
        if (!modalOpen) update(dt);
        render();
        requestAnimationFrame(frame);
    }

    /* ── 提示按钮 / 任务面板 ── */
    function refreshPrompt() {
        if (!near || modalOpen) { promptBtn.hidden = true; return; }
        const verb = near.inter.type === 'case' ? t('sbActLook') : t('sbActUse');
        promptBtn.innerHTML = `${near.inter.icon} ${verb}${getLang() === 'en' ? ' ' : ''}${t(near.inter.nameKey)}<kbd>${t('sbKeySpace')}</kbd>`;
        promptBtn.hidden = false;
    }

    const TIPS_KEY = 'fraudgame_sandbox_tips';
    const TIP_IDS = ['tv', 'fridge', 'photo'];
    const tipsSeen = () => { try { return JSON.parse(localStorage.getItem(TIPS_KEY)) || []; } catch (e) { return []; } };
    const tipSeen = id => tipsSeen().includes(id);
    function markTip(id) {
        const s = tipsSeen();
        if (!s.includes(id)) { s.push(id); try { localStorage.setItem(TIPS_KEY, JSON.stringify(s)); } catch (e) { /* ignore */ } }
    }

    const CASES = [
        { caseId: 'case1', icon: '📱', questKey: 'sbQuestPhone', titleKey: 'sbObjPhone', script: () => CASE1_SCRIPT,
          header: () => `<div class="phone-topbar">${t('c1Topbar')}</div>` },
        { caseId: 'case2', icon: '💻', questKey: 'sbQuestLaptop', titleKey: 'sbObjLaptop', script: () => CASE2_SCRIPT,
          header: () => `<div class="phone-topbar">${t('c2Topbar')}</div>` },
        { caseId: 'case3', icon: '🎥', questKey: 'sbQuestTablet', titleKey: 'sbObjTablet', script: () => CASE3_SCRIPT,
          header: () => `<div class="call-header"><div class="call-avatar">🧑</div>
              <div class="call-name">${t('c3CallName')}</div><div class="call-status">${t('c3CallStatus')}</div>
              <div class="call-video-box">${t('c3CallVideo')}</div></div>` },
    ];

    function refreshHud() {
        const quest = document.getElementById('sbQuest');
        const done = CASES.filter(c => getLessonResult(c.caseId)).length;
        let html = `<div class="sb-quest-title">${t('sbQuestTitle')} (${done}/${CASES.length})</div>`;
        CASES.forEach(c => {
            const d = !!getLessonResult(c.caseId);
            html += `<div class="sb-quest-item${d ? ' done' : ''}"><span>${d ? '✅' : c.icon}</span><span>${t(c.questKey)}</span></div>`;
        });
        html += `<div class="sb-quest-tips">${t('sbTipsLabel')} ${tipsSeen().filter(x => TIP_IDS.includes(x)).length}/${TIP_IDS.length}</div>`;
        if (allLessonsDone()) {
            html += isPostSurveyDone()
                ? `<a class="btn btn-primary" href="report.html">${t('sbReportBtn')}</a>`
                : `<a class="btn btn-primary" href="survey-post.html">${t('sbSurveyBtn')}</a>`;
        }
        quest.innerHTML = html;
        refreshPrompt();
    }

    /* ── 弹窗 ── */
    const overlay = document.getElementById('sbOverlay');
    const mTitle = document.getElementById('sbModalTitle');
    const mBody = document.getElementById('sbModalBody');
    document.getElementById('sbModalClose').addEventListener('click', () => closeModal());
    overlay.addEventListener('mousedown', ev => { if (ev.target === overlay) closeModal(); });

    // 弹窗内容增加时自动滚动：总结页滚到顶部，其余滚到底部
    new MutationObserver(() => {
        const sum = mBody.querySelector('#summaryPanel');
        if (sum && sum.style.display !== 'none') sum.scrollIntoView({ block: 'start' });
        else mBody.scrollTop = mBody.scrollHeight;
    }).observe(mBody, { childList: true, subtree: true });

    function openModal(title) {
        mTitle.textContent = title;
        mBody.innerHTML = '';
        overlay.hidden = false;
        modalOpen = true;
        keys.clear(); path = []; pending = null;
        promptBtn.hidden = true;
        return mBody;
    }
    function closeModal() {
        overlay.hidden = true;
        modalOpen = false;
        mBody.innerHTML = '';
        refreshHud();
    }

    function showDialog(title, text, buttons) {
        const body = openModal(title);
        body.innerHTML = `<div class="sb-dialog"><p></p><div class="sb-dialog-actions"></div></div>`;
        body.querySelector('p').textContent = text;
        const actions = body.querySelector('.sb-dialog-actions');
        buttons.forEach(b => {
            const el = document.createElement('button');
            el.className = 'btn ' + (b.primary ? 'btn-primary' : 'btn-outline');
            el.textContent = b.label;
            el.onclick = b.onClick;
            actions.appendChild(el);
        });
    }

    function activate(o) {
        const inter = o.inter;
        if (inter.type === 'case') playCase(CASES.find(c => c.caseId === inter.caseId));
        else showTip(inter.tip);
    }

    function showTip(id) {
        const cap = id.charAt(0).toUpperCase() + id.slice(1);
        markTip(id);
        showDialog(t('sbTip' + cap + 'Title'), t('sbTip' + cap + 'Text'),
            [{ label: t('sbGotIt'), primary: true, onClick: closeModal }]);
    }

    function playCase(cfg) {
        const already = !!getLessonResult(cfg.caseId);
        const wasAll = allLessonsDone();
        const body = openModal(`${cfg.icon} ${t(cfg.titleKey)}`);
        body.innerHTML = `${cfg.header()}
            <div class="chat-area" id="chatArea"></div>
            <div class="choice-area" id="choiceArea"></div>
            <div class="continue-bar" id="continueBar"></div>
            <div class="summary-panel" id="summaryPanel" style="display:none;"></div>`;
        const engine = new ChatEngine(cfg.script()[getLang()], {
            chatAreaId: 'chatArea', choiceAreaId: 'choiceArea',
            continueBarId: 'continueBar', summaryId: 'summaryPanel',
            lessonId: already ? null : cfg.caseId,      // 重玩不覆盖已有成绩
            onFinish: () => {
                closeModal();
                if (!wasAll && allLessonsDone()) {
                    showDialog(t('sbAllDoneTitle'), t('sbAllDoneText'), [
                        { label: t('sbAllDoneStay'), onClick: closeModal },
                        { label: t('sbAllDoneSurvey'), primary: true, onClick: () => { window.location.href = 'survey-post.html'; } },
                    ]);
                }
            }
        });
        engine.start();
    }

    /* ── 启动 ── */
    window.addEventListener('resize', resize);
    resize();
    applyUi();
    refreshHud();
    requestAnimationFrame(frame);

    try {
        if (!BG && !sessionStorage.getItem('fraudgame_sandbox_welcome') && !anyLessonDone()) {
            sessionStorage.setItem('fraudgame_sandbox_welcome', '1');
            showDialog(t('sbWelcomeTitle'), t('sbWelcomeText'), [{ label: t('sbGotIt'), primary: true, onClick: closeModal }]);
        }
    } catch (e) { /* sessionStorage 不可用时跳过欢迎语 */ }
})();
