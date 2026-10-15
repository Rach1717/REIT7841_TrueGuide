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
    if (!BG && nextRequiredPage()) {
        window.location.href = nextRequiredPage();
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
        return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
    }

    /* ── 绘图基础 ── */
    const canvas = document.getElementById('sbCanvas');
    const stage = document.getElementById('sbStage');
    let ctx = canvas.getContext('2d');          // 画静态背景缓存时会临时切到离屏画布
    const EDGE = 'rgba(40,28,18,.28)';
    let time = 0;
    // 固定种子的伪随机：每次画出来的木纹、书本都一样
    const rnd = i => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
    const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

    function poly(pts, fill, stroke, lw = 1) {
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.closePath();
        if (fill) { ctx.fillStyle = fill; ctx.fill(); }
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
    }
    function line(a, b, color, lw = 1) {
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke();
    }

    // 竖直面：上亮下暗的渐变，模拟从上方来的环境光
    function faceFill(pts, col, k = .12) {
        const a = mid(pts[0], pts[1]), b = mid(pts[3], pts[2]);
        if (Math.abs(a.y - b.y) < 1) return col;
        const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        g.addColorStop(0, shade(col, k * .4));
        g.addColorStop(1, shade(col, -k));
        return g;
    }

    // 立方体：三个可见面 + 柔和外轮廓 + 顶面前沿高光
    function box(gx, gy, w, d, h, col, z0 = 0, o = {}) {
        const zt = z0 + h;
        const t = [P(gx, gy, zt), P(gx + w, gy, zt), P(gx + w, gy + d, zt), P(gx, gy + d, zt)];
        const l = [P(gx, gy + d, zt), P(gx + w, gy + d, zt), P(gx + w, gy + d, z0), P(gx, gy + d, z0)];
        const r = [P(gx + w, gy, zt), P(gx + w, gy + d, zt), P(gx + w, gy + d, z0), P(gx + w, gy, z0)];
        const L = shade(col, -.08), R = shade(col, -.24);
        poly(l, h > 3 ? faceFill(l, L) : L);
        poly(r, h > 3 ? faceFill(r, R) : R);
        poly(t, o.top || shade(col, .1));
        ctx.lineJoin = 'round';
        poly([t[0], t[1], r[3], r[2], l[3], t[3]], null, o.edge || EDGE, .8);
        if (h > 2) line(t[2], l[2], 'rgba(30,20,10,.12)', .6);
        ctx.beginPath(); ctx.moveTo(t[3].x, t[3].y); ctx.lineTo(t[2].x, t[2].y); ctx.lineTo(t[1].x, t[1].y);
        ctx.strokeStyle = 'rgba(255,255,255,.32)'; ctx.lineWidth = .8; ctx.stroke();
    }
    const quadX = (x, y0, y1, z0, z1) => [P(x, y0, z1), P(x, y1, z1), P(x, y1, z0), P(x, y0, z0)];
    const quadY = (y, x0, x1, z0, z1) => [P(x0, y, z1), P(x1, y, z1), P(x1, y, z0), P(x0, y, z0)];
    const fx = (x, y0, y1, z0, z1, fill, stroke) => poly(quadX(x, y0, y1, z0, z1), fill, stroke);
    const fy = (y, x0, x1, z0, z1, fill, stroke) => poly(quadY(y, x0, x1, z0, z1), fill, stroke);
    const floorQuad = (x0, y0, x1, y1, fill, stroke) =>
        poly([P(x0, y0), P(x1, y0), P(x1, y1), P(x0, y1)], fill, stroke);
    function floorQuadZ(x0, y0, x1, y1, z, fill, stroke) {
        poly([P(x0, y0, z), P(x1, y0, z), P(x1, y1, z), P(x0, y1, z)], fill, stroke);
    }
    function ball(gx, gy, gz, r, col) {
        const p = P(gx, gy, gz);
        const g = ctx.createRadialGradient(p.x - r * .35, p.y - r * .35, r * .1, p.x, p.y, r);
        g.addColorStop(0, shade(col, .25)); g.addColorStop(1, shade(col, -.15));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
    }

    /* 在竖直平面上作画：局部坐标 (s, v)，s = 沿墙方向的屏幕像素，v = 高度（向上为正）
       onPlaneX(x)：平面 x = 常数（左墙、电视屏幕）；onPlaneY(y)：平面 y = 常数（后墙、笔记本屏幕） */
    function onPlaneX(x, fn) { ctx.save(); ctx.transform(-1, .5, 0, -1, OX + x * TW / 2, OY + x * TH / 2); fn(); ctx.restore(); }
    function onPlaneY(y, fn) { ctx.save(); ctx.transform(1, .5, 0, -1, OX - y * TW / 2, OY + y * TH / 2); fn(); ctx.restore(); }

    // 地面上的圆：半径 1 格在屏幕上是 RX × RY 的椭圆
    const RX = TW / Math.SQRT2, RY = TH / Math.SQRT2;
    function disc(gx, gy, gz, r, fill, stroke) {
        const c = P(gx, gy, gz);
        ctx.beginPath(); ctx.ellipse(c.x, c.y, r * RX, r * RY, 0, 0, Math.PI * 2);
        if (fill) { ctx.fillStyle = fill; ctx.fill(); }
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = .8; ctx.stroke(); }
    }
    // 圆柱 / 圆台（花盆、杯子、灯罩）：r0 底半径，r1 顶半径
    function cyl(gx, gy, z0, h, r0, r1, col, topCol) {
        const b = P(gx, gy, z0), tp = P(gx, gy, z0 + h);
        const g = ctx.createLinearGradient(b.x - r0 * RX, 0, b.x + r0 * RX, 0);
        g.addColorStop(0, shade(col, .14)); g.addColorStop(.5, col); g.addColorStop(1, shade(col, -.3));
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, r0 * RX, r0 * RY, 0, 0, Math.PI);
        ctx.ellipse(tp.x, tp.y, r1 * RX, r1 * RY, 0, Math.PI, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = EDGE; ctx.lineWidth = .8; ctx.stroke();
        disc(gx, gy, z0 + h, r1, topCol || shade(col, .15), EDGE);
    }
    // 一片叶子（屏幕坐标）：从 (x, y) 出发，长 len，宽 wid，角度 ang
    function leaf(x, y, len, wid, ang, col, edge) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(len * .45, -wid, len, 0);
        ctx.quadraticCurveTo(len * .45, wid, 0, 0);
        ctx.fillStyle = col; ctx.fill();
        if (edge) { ctx.strokeStyle = edge; ctx.lineWidth = .9; ctx.stroke(); }
        ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = .6;
        ctx.beginPath(); ctx.moveTo(len * .08, 0); ctx.lineTo(len * .85, 0); ctx.stroke();
        ctx.restore();
    }
    // 一丛叶子：从 (gx, gy, z) 向上散开
    function foliage(gx, gy, z, n, size, colors, seed) {
        const base = P(gx, gy, z);
        const leaves = [];
        for (let i = 0; i < n; i++) {
            const off = (rnd(seed + i) - .5) * 2.7;
            leaves.push({ off, len: (20 + rnd(seed + i + 40) * 16) * size, wid: (6 + rnd(seed + i + 80) * 3) * size,
                          col: colors[i % colors.length], dx: (rnd(seed + i + 120) - .5) * 6 * size });
        }
        leaves.sort((a, b) => Math.abs(b.off) - Math.abs(a.off));    // 外圈先画，中间的盖在上面
        leaves.forEach(l => leaf(base.x + l.dx, base.y, l.len, l.wid, -Math.PI / 2 + l.off, l.col));
    }
    function pot(gx, gy, r, h, col) {
        cyl(gx, gy, 0, h - 3, r * .78, r * .95, col, '#5a3e2b');
        cyl(gx, gy, h - 3, 3, r, r * 1.02, shade(col, .06), '#4a3424');
    }

    function legs(gx, gy, w, d, h, col, s = .08) {
        box(gx, gy, s, s, h, col);
        box(gx + w - s, gy, s, s, h, col);
        box(gx, gy + d - s, s, s, h, col);
        box(gx + w - s, gy + d - s, s, s, h, col);
    }
    function woodTop(x0, y0, x1, y1, z, col) {
        const a = P(x0, y0, z), b = P(x1, y1, z);
        const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        g.addColorStop(0, shade(col, .16)); g.addColorStop(1, shade(col, .02));
        return g;
    }
    function table(gx, gy, w, d, legH, col) {
        legs(gx + .07, gy + .07, w - .14, d - .14, legH, shade(col, -.3), .07);
        box(gx, gy, w, d, 4, col, legH, { top: woodTop(gx, gy, gx + w, gy + d, legH + 4, col) });
    }
    // 餐椅：face = 坐的人面朝的方向
    function chair(gx, gy, face, wood, cushion) {
        legs(gx + .2, gy + .2, .6, .6, 17, wood, .07);
        const back = () => {
            const bx = { '+x': [gx + .18, gy + .2, .08, .6], '-x': [gx + .74, gy + .2, .08, .6],
                         '+y': [gx + .2, gy + .18, .6, .08], '-y': [gx + .2, gy + .74, .6, .08] }[face];
            const [x, y, w, d] = bx;
            if (w < d) { box(x, y, w, .08, 30, wood, 17); box(x, y + d - .08, w, .08, 30, wood, 17); }
            else { box(x, y, .08, d, 30, wood, 17); box(x + w - .08, y, .08, d, 30, wood, 17); }
            box(x, y, w, d, 6, wood, 41);
            box(x, y, w, d, 4, wood, 31);
        };
        if (face === '+x' || face === '+y') back();
        box(gx + .18, gy + .18, .64, .64, 4, wood, 17);
        box(gx + .22, gy + .22, .56, .56, 3, cushion, 21);
        if (face === '-x' || face === '-y') back();
    }

    /* ── 物品清单（位置、大小、碰撞和互动不变，只重画外观）── */
    const pulse = () => .5 + .5 * Math.sin(time * 6);
    const BOOKS = ['#b5533c', '#36618f', '#d6a640', '#4f7f55', '#7a4f8f', '#e3dccf', '#2f4858', '#c47a4f', '#8c2f39'];

    const OBJ = [
        { id: 'bookshelf', gx: 0, gy: 0, w: 1, d: 2, draw() {
            const wood = '#8a5a35';
            box(0, 0, 1, .08, 100, wood);
            box(0, .08, .1, 1.84, 100, '#5c3a20');
            [4, 36, 68].forEach((z, r) => {
                box(.1, .08, .9, 1.84, 4, wood, z);
                let y = .14;
                for (let i = 0; y + .17 < 1.9; i++) {
                    const k = r * 17 + i * 3;
                    if (rnd(k + 90) < .1 && y < 1.45) {          // 横放的一摞书
                        for (let s = 0; s < 3; s++) box(.32, y, .55, .32, 4, BOOKS[(k + s) % BOOKS.length], z + 4 + s * 4);
                        y += .38; continue;
                    }
                    const bw = .08 + rnd(k) * .07, bh = 17 + rnd(k + 50) * 9;
                    box(.3 + rnd(k + 7) * .08, y, .55, bw, bh, BOOKS[(k + i) % BOOKS.length], z + 4);
                    fx(.86 + rnd(k + 7) * .08 - .01, y + .01, y + bw - .01, z + bh * .7, z + bh * .78, 'rgba(255,240,200,.45)');
                    y += bw + .012;
                }
            });
            box(0, 0, 1, 2, 4, wood, 100);
            box(0, 1.92, 1, .08, 100, wood);
            cyl(.5, .45, 104, 11, .09, .12, '#e8e2d6');
            foliage(.5, .45, 115, 5, .55, ['#5c9a5a', '#4c8a4c', '#6aaa66'], 7);
        } },
        { id: 'tv', gx: 0, gy: 3, w: 1, d: 2, h: 80, blocks: true,
          inter: { type: 'tip', tip: 'tv', icon: '📺', nameKey: 'sbObjTv' }, draw() {
            legs(.12, 3.12, .76, 1.76, 4, '#2d241c', .06);
            box(.05, 3.05, .9, 1.9, 22, '#5d4330', 4, { top: woodTop(.05, 3.05, .95, 4.95, 26, '#5d4330') });
            fx(.95, 3.99, 4.01, 7, 24, 'rgba(0,0,0,.35)');
            fx(.951, 3.82, 3.92, 14, 16, '#c9a96a');
            fx(.951, 4.08, 4.18, 14, 16, '#c9a96a');
            box(.4, 3.84, .18, .32, 2, '#222', 26);
            box(.46, 3.97, .05, .06, 7, '#2a2a2a', 28);
            box(.42, 3.15, .07, 1.7, 46, '#14161b', 32);
            // 屏幕：新闻节目
            const scr = quadX(.495, 3.2, 4.8, 35, 76);
            const sg = ctx.createLinearGradient(scr[0].x, scr[0].y, scr[3].x, scr[3].y);
            sg.addColorStop(0, '#24598a'); sg.addColorStop(1, '#0e2a45');
            poly(scr, sg);
            onPlaneX(.495, () => {
                ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(132, 44, 56, 30);
                ctx.fillStyle = '#e8bf9b'; ctx.beginPath(); ctx.arc(150, 62, 5, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#2b3a55'; ctx.fillRect(142, 44, 16, 13);
                ctx.fillStyle = '#c0392b'; ctx.fillRect(128, 35, 64, 7);
                ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(132, 37, 30, 2.5); ctx.fillRect(166, 37, 20, 2.5);
                ctx.fillStyle = '#f1c40f'; ctx.fillRect(176, 66, 10, 6);
                ctx.fillStyle = `rgba(255,255,255,${.04 + .03 * Math.sin(time * 9)})`; ctx.fillRect(128, 35, 64, 41);
            });
            poly([P(.5, 3.4, 76), P(.5, 3.9, 76), P(.5, 3.4, 50)], 'rgba(255,255,255,.08)');
            box(.62, 3.5, .1, 1.0, 4, '#26282e', 26);
        } },
        { id: 'plant1', gx: 0, gy: 6, w: 1, d: 1, draw() {
            pot(.5, 6.5, .22, 20, '#b8643a');
            foliage(.5, 6.5, 19, 13, 1.05, ['#3f8a4e', '#4e9d5c', '#2f7341', '#62b06c'], 31);
        } },
        { id: 'armchair', gx: 1, gy: 7, w: 1, d: 1, draw() {
            const c = '#c08a5a', dk = '#a97445';
            legs(1.1, 7.1, .8, .8, 5, '#4a3424', .06);
            box(1.05, 7.05, .9, .9, 13, dk, 5);
            box(1.03, 7.03, .26, .94, 44, c, 0);
            fx(1.291, 7.3, 7.72, 22, 44, '#efe3cc');                     // 搭在靠背上的针织毯
            for (let i = 0; i < 4; i++) fx(1.292, 7.3, 7.72, 25 + i * 5, 26 + i * 5, 'rgba(180,120,90,.35)');
            box(1.05, 7.02, .9, .18, 25, dk, 5);
            box(1.28, 7.2, .66, .62, 7, '#d9a571', 18);
            box(1.05, 7.82, .9, .18, 25, dk, 5);
        } },
        { id: 'lamp', gx: 4, gy: 0, w: 1, d: 1, draw() {
            cyl(4.5, .5, 0, 3, .16, .16, '#3a3a3a');
            box(4.485, .485, .03, .03, 84, '#7a7a7a', 3);
            cyl(4.5, .5, 84, 22, .27, .18, '#f3e6c4', '#fff4d6');
            const c = P(4.5, .5, 92);
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const g = ctx.createRadialGradient(c.x, c.y, 4, c.x, c.y, 80);
            g.addColorStop(0, 'rgba(255,214,140,.38)'); g.addColorStop(1, 'rgba(255,214,140,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c.x, c.y, 80, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        } },
        { id: 'coffee', gx: 2, gy: 4, w: 1, d: 1, h: 34, blocks: true,
          inter: { type: 'device', device: 'phone', icon: '📱', nameKey: 'sbObjPhone' }, draw() {
            const wood = '#9c6b42';
            legs(2.08, 4.08, .84, .84, 14, '#5b3d26', .07);
            box(2.1, 4.1, .8, .8, 2, shade(wood, -.12), 4);
            box(2.2, 4.32, .42, .3, 3, '#d8cbb3', 6);
            box(2.02, 4.02, .96, .96, 4, wood, 14, { top: woodTop(2.02, 4.02, 2.98, 4.98, 18, wood) });
            box(2.16, 4.18, .4, .3, 1.5, '#f2efe8', 18);
            floorQuadZ(2.18, 4.2, 2.38, 4.46, 19.6, '#c0563b');
            cyl(2.8, 4.25, 18, 7, .06, .065, '#f4f1ea', '#5a3a22');
            for (let i = 0; i < 2; i++) {                               // 杯子上的热气
                const s = P(2.8 + i * .03, 4.25, 27), ph = time * 2 + i * 2;
                ctx.beginPath(); ctx.moveTo(s.x, s.y);
                ctx.bezierCurveTo(s.x + 4 * Math.sin(ph), s.y - 6, s.x - 4 * Math.sin(ph), s.y - 11, s.x + 2 * Math.sin(ph), s.y - 16);
                ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 1.4; ctx.stroke();
            }
            box(2.62, 4.62, .26, .08, 1.5, '#2b2b2b', 18);              // 遥控器
            const lit = unread('phone') > 0;
            box(2.3, 4.5, .36, .44, 2, '#1d2027', 18);
            floorQuadZ(2.33, 4.53, 2.63, 4.91, 20.2, lit ? `rgb(${120 + 100 * pulse()},${200 + 40 * pulse()},255)` : '#3b4150');
            if (lit) {
                const c = P(2.48, 4.72, 21);
                const g = ctx.createRadialGradient(c.x, c.y, 2, c.x, c.y, 30);
                g.addColorStop(0, `rgba(140,210,255,${.25 + .25 * pulse()})`); g.addColorStop(1, 'rgba(140,210,255,0)');
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c.x, c.y, 30, 0, Math.PI * 2); ctx.fill();
            }
        } },
        { id: 'sofa', gx: 3, gy: 3, w: 1, d: 3, draw() {
            const c = '#4e6e8e', cu = '#6688a8';
            legs(3.08, 3.08, .84, 2.84, 5, '#3a2a1e', .07);
            box(3, 3.04, 1, 2.92, 15, c, 5);
            box(3, 3, 1, .3, 33, c, 5);
            [3.3, 4.1, 4.9].forEach(y => box(3.06, y + .02, .6, .76, 8, cu, 20));
            [3.3, 4.1, 4.9].forEach(y => box(3.6, y + .04, .26, .72, 26, cu, 26));
            box(3.84, 3.3, .16, 2.4, 50, c, 5);
            floorQuadZ(3.84, 4.5, 4.0, 5.1, 55.2, '#e3c9a0');            // 搭在靠背上的毯子
            fx(4.001, 4.5, 5.1, 36, 55, '#dcbf94');
            for (let i = 0; i < 3; i++) fx(4.002, 4.5, 5.1, 40 + i * 5, 41 + i * 5, 'rgba(160,110,60,.35)');
            box(3, 5.7, 1, .3, 33, c, 5);
        } },
        { id: 'desk', gx: 5, gy: 0, w: 3, d: 1, h: 62, blocks: true,
          inter: { type: 'device', device: 'computer', icon: '💻', nameKey: 'sbObjLaptop' }, draw() {
            const wood = '#c49a68';
            legs(5.08, .08, 2.84, .84, 24, '#6b4a2f', .07);
            box(7.28, .08, .64, .84, 24, '#b58c5c');
            [8, 16].forEach(z => fy(.921, 7.3, 7.9, z, z + .7, 'rgba(0,0,0,.28)'));
            [4, 12, 20].forEach(z => fy(.922, 7.56, 7.64, z, z + 2, '#e2c27a'));
            box(5.02, .02, 2.96, .96, 4, wood, 24, { top: woodTop(5.02, .02, 7.98, .98, 28, wood) });
            // 台灯
            cyl(5.35, .3, 28, 2, .1, .1, '#2f3b46');
            const a = P(5.35, .3, 30), b = P(5.38, .32, 52), h = P(5.55, .42, 58);
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(h.x, h.y);
            ctx.strokeStyle = '#2f3b46'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.stroke();
            cyl(5.56, .43, 50, 7, .1, .05, '#2f3b46', '#3c4a57');
            disc(5.62, .55, 28.3, .22, 'rgba(255,232,160,.35)');
            box(5.3, .62, .4, .26, 4, '#7a4f8f', 28);
            box(5.32, .64, .36, .23, 4, '#d6a640', 32);
            floorQuadZ(6.95, .55, 7.3, .88, 28.4, '#fbfaf6', 'rgba(0,0,0,.1)');
            // 笔记本电脑
            const lit = unread('computer') > 0;
            box(5.95, .3, .9, .55, 2, '#c9ced6', 28);
            floorQuadZ(6.02, .45, 6.78, .75, 30.2, '#9aa1ab');
            box(5.95, .3, .9, .06, 32, '#2b2f3a', 30);
            const scr = quadY(.365, 6.0, 6.85, 33, 60);
            poly(scr, lit ? '#eef4fb' : '#8a93a3');
            if (lit) {
                onPlaneY(.365, () => {
                    ctx.fillStyle = '#3b7dd8'; ctx.fillRect(240, 55, 34, 5);              // 邮箱顶栏
                    for (let i = 0; i < 4; i++) {
                        ctx.fillStyle = i === 0 ? '#ffe7a3' : '#ffffff'; ctx.fillRect(242, 47 - i * 4, 30, 3);
                        ctx.fillStyle = 'rgba(40,50,70,.45)'; ctx.fillRect(244, 48 - i * 4, 14 - i * 2, 1);
                    }
                    ctx.fillStyle = `rgb(230,${60 + 60 * pulse()},60)`;
                    ctx.beginPath(); ctx.arc(268, 57, 2.6, 0, Math.PI * 2); ctx.fill();
                });
            }
            cyl(7.62, .3, 28, 8, .065, .07, '#d9534f', '#5a3a22');
            cyl(7.66, .72, 28, 8, .08, .1, '#e8e2d6', '#4a3424');
            foliage(7.66, .72, 36, 6, .45, ['#4f9a58', '#3f8a4e'], 61);
        } },
        { id: 'deskchair', gx: 6, gy: 1, w: 1, d: 1, draw() {
            const c = P(6.5, 1.5, 3);
            for (let k = 0; k < 5; k++) {                                   // 五星脚和轮子
                const ang = k / 5 * Math.PI * 2 + .3;
                const e = P(6.5 + Math.cos(ang) * .32, 1.5 + Math.sin(ang) * .32, 2);
                line(c, e, '#2a2d33', 3);
                ctx.fillStyle = '#16181c'; ctx.beginPath(); ctx.arc(e.x, e.y + 1.5, 2, 0, Math.PI * 2); ctx.fill();
            }
            box(6.47, 1.47, .06, .06, 14, '#8a9099', 4);
            box(6.2, 1.2, .6, .6, 6, '#3d5a6c', 18);
            box(6.24, 1.74, .52, .08, 30, '#3d5a6c', 26);
        } },
        { id: 'fridge', gx: 10, gy: 0, w: 1, d: 1, h: 104, blocks: true,
          inter: { type: 'tip', tip: 'fridge', icon: '🧲', nameKey: 'sbObjFridge' }, draw() {
            box(10.02, .02, .96, .96, 106, '#e1e7ec');
            fy(.981, 10.04, 10.96, 65.5, 67, '#aab4bc');
            fy(.982, 10.12, 10.2, 4, 104, 'rgba(255,255,255,.4)');
            box(10.82, .98, .04, .04, 22, '#9aa4ac', 72);
            box(10.82, .98, .04, .04, 20, '#9aa4ac', 36);
            fy(.983, 10.25, 10.65, 70, 94, '#fff3a8', '#c9a92c');               // 写着家人号码的便签
            fy(.984, 10.3, 10.56, 88, 89.5, '#c0392b');
            fy(.984, 10.3, 10.6, 82, 83, '#555');
            fy(.984, 10.3, 10.52, 77, 78, '#555');
            fy(.984, 10.3, 10.58, 73, 74, '#555');
            [['#e74c3c', 10.42], ['#3498db', 10.7], ['#f1c40f', 10.32]].forEach(([col, x], i) => {
                const m = P(x, .985, i === 2 ? 50 : 96);
                ctx.fillStyle = col; ctx.beginPath(); ctx.arc(m.x, m.y, 2.6, 0, Math.PI * 2); ctx.fill();
            });
            box(10.2, .2, .5, .5, 8, '#c9a26b', 106);
        } },
        { id: 'counter', gx: 11, gy: 0, w: 1, d: 2, draw() {
            const cab = '#8fa89a';
            box(11.02, 0, .96, 2, 32, cab, 2);
            fx(11.981, .99, 1.01, 5, 31, 'rgba(0,0,0,.25)');
            fx(11.982, .8, .9, 24, 26, '#dfe3e6'); fx(11.982, 1.1, 1.2, 24, 26, '#dfe3e6');
            box(11, 0, 1, 2, 3, '#ece7df', 34, { top: woodTop(11, 0, 12, 2, 37, '#e4ded4') });
            floorQuadZ(11.25, .95, 11.75, 1.55, 37.05, '#b8c0c6');
            floorQuadZ(11.3, 1.0, 11.7, 1.5, 37.1, '#8f989f');
            box(11.47, .84, .05, .05, 14, '#cfd5da', 37);
            box(11.47, .84, .05, .22, 3, '#cfd5da', 49);
            cyl(11.5, .35, 37, 12, .13, .1, '#e05a3a', '#c94c30');
            cyl(11.5, 1.75, 37, 4, .12, .16, '#f4efe6', '#e9e2d4');
            ball(11.45, 1.72, 45, 4.5, '#f39c12'); ball(11.56, 1.78, 45, 4.5, '#c0392b'); ball(11.5, 1.68, 49, 4, '#f4d03f');
            box(11.02, 0, .96, .5, 34, cab, 108);                               // 吊柜
            fy(.501, 11.49, 11.51, 110, 141, 'rgba(0,0,0,.25)');
            fy(.502, 11.4, 11.44, 112, 120, '#dfe3e6'); fy(.502, 11.56, 11.6, 112, 120, '#dfe3e6');
        } },
        { id: 'dining', gx: 7, gy: 4, w: 2, d: 2, h: 60, blocks: true,
          inter: { type: 'device', device: 'tablet', icon: '📲', nameKey: 'sbObjTablet' }, draw() {
            const wood = '#a8774c';
            table(7.02, 4.02, 1.96, 1.96, 22, wood);
            floorQuadZ(7.02, 4.8, 8.98, 5.25, 26.1, '#efe4cf');                  // 桌旗
            floorQuadZ(7.02, 4.84, 8.98, 4.87, 26.2, '#b5533c');
            floorQuadZ(7.02, 5.18, 8.98, 5.21, 26.2, '#b5533c');
            cyl(8.4, 5.55, 26, 4, .13, .17, '#f1ebe0', '#e8dfcf');
            ball(8.35, 5.52, 33, 4.5, '#c0392b'); ball(8.46, 5.58, 33, 4.5, '#f39c12'); ball(8.4, 5.5, 37, 4, '#7dbb4f');
            cyl(8.6, 4.5, 26, 13, .06, .08, '#7fa3b8');                          // 花瓶和花
            [['#e85d75', -.3, 16], ['#f6c945', .1, 18], ['#ffffff', .35, 14], ['#d36ba6', -.05, 20]].forEach(([col, dx, hgt], i) => {
                const s = P(8.6, 4.5, 39), f = { x: s.x + dx * 18, y: s.y - hgt };
                line(s, f, '#4f8a4e', 1.2);
                ctx.fillStyle = col; ctx.beginPath(); ctx.arc(f.x, f.y, 3.4, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = 'rgba(255,220,120,.9)'; ctx.beginPath(); ctx.arc(f.x, f.y, 1.1, 0, Math.PI * 2); ctx.fill();
                void i;
            });
            // 平板支架 + 视频来电
            const lit = unread('tablet') > 0;
            box(7.55, 4.55, .8, .1, 3, '#2f3441', 26);
            box(7.55, 4.58, .8, .06, 30, '#1e2229', 28);
            const scr = quadY(4.645, 7.6, 8.3, 31, 56);
            const g = ctx.createLinearGradient(scr[0].x, scr[0].y, scr[3].x, scr[3].y);
            g.addColorStop(0, lit ? '#8ec5f2' : '#8a93a3'); g.addColorStop(1, lit ? '#5d97cf' : '#737c8c');
            poly(scr, g);
            if (lit) {
                onPlaneY(4.645, () => {
                    const ox = 7.95 * TW / 2;
                    ctx.fillStyle = '#4a6fa5'; ctx.beginPath(); ctx.ellipse(ox, 34, 8, 5, 0, 0, Math.PI); ctx.fill();
                    ctx.fillStyle = '#e8bf9b'; ctx.beginPath(); ctx.arc(ox, 45, 5.2, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#5a4636'; ctx.beginPath(); ctx.arc(ox, 47.5, 5.4, 0, Math.PI); ctx.fill();
                    ctx.fillStyle = `rgba(229,62,62,${.6 + .4 * pulse()})`;
                    ctx.beginPath(); ctx.arc(ox + 10, 52, 2.8, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#e53e3e'; ctx.fillRect(ox - 4, 32, 8, 2.6);
                });
            }
        } },
        { id: 'chairL', gx: 6, gy: 4, w: 1, d: 1, draw() { chair(6, 4, '+x', '#7a5638', '#c9a27a'); } },
        { id: 'chairR', gx: 9, gy: 5, w: 1, d: 1, draw() { chair(9, 5, '-x', '#7a5638', '#c9a27a'); } },
        { id: 'plant2', gx: 10, gy: 7, w: 1, d: 1, draw() {
            pot(10.5, 7.5, .22, 22, '#e9e4da');
            const base = P(10.5, 7.5, 21);
            for (let i = 0; i < 9; i++) {                                       // 虎尾兰
                const off = (rnd(200 + i) - .5) * .7, len = 40 + rnd(220 + i) * 24;
                leaf(base.x + (i - 4) * 1.6, base.y, len, 4.5, -Math.PI / 2 + off,
                     i % 2 ? '#3f7a45' : '#356b3c', 'rgba(214,205,110,.9)');
            }
        } },
    ];

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

    /* ── 角色：中性打扮的长者（银灰短发、圆眼镜、针织开衫、长裤）── */
    const LOOK = { skin: '#e8bf9b', skinD: '#cfa07c', hair: '#d9dbe0', hairD: '#aeb3bd', top: '#5e8c84',
                   topD: '#47706a', shirt: '#eef1f4', pants: '#525a68', pantsD: '#414753', shoe: '#5a4636', frame: '#5d4e42' };

    function drawPlayer() {
        const C = LOOK;
        const p = P(player.x, player.y);
        const walk = player.moving ? Math.sin(player.phase) : 0;
        const bob = player.moving ? Math.abs(Math.cos(player.phase)) * 1 : 0;
        const front = player.sy >= 0;               // 面朝镜头
        const dir = player.sx >= 0 ? 1 : -1;        // 面朝屏幕右 / 左
        const x = p.x, ground = p.y;

        const sg = ctx.createRadialGradient(x, ground + 1, 2, x, ground + 1, 18);
        sg.addColorStop(0, 'rgba(40,28,18,.34)'); sg.addColorStop(1, 'rgba(40,28,18,0)');
        ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(x, ground + 1, 18, 8, 0, 0, Math.PI * 2); ctx.fill();

        // 腿和鞋：走路时左右交替抬起
        const lift = [Math.max(0, walk), Math.max(0, -walk)];
        [-1, 1].forEach((side, i) => {
            const lx = x + side * 4.2, l = lift[i] * 3.5;
            ctx.fillStyle = side === -dir ? C.pantsD : C.pants;
            roundRect(lx - 3.3, ground - 22 - l, 6.6, 20, 3); ctx.fill();
            ctx.fillStyle = C.shoe;
            ctx.beginPath(); ctx.ellipse(lx + dir * 1.3, ground - 2.2 - l, 4.8, 2.7, 0, 0, Math.PI * 2); ctx.fill();
        });

        const waist = ground - 20 - bob, sh = waist - 25;
        const arm = (side, near) => {
            // 以肩膀为轴前后摆动（不上下移动），两只手臂方向相反
            const ax = x + side * 10.6, ang = (side === dir ? -1 : 1) * walk * .32;
            ctx.save();
            ctx.translate(ax, sh + 3);
            ctx.rotate(ang);
            ctx.fillStyle = near ? C.top : C.topD;
            roundRect(-3.1, -2, 6.2, 21, 3.1); ctx.fill();
            ctx.fillStyle = C.skin;
            ctx.beginPath(); ctx.arc(0, 20, 2.9, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        };
        arm(-dir, false);

        // 躯干：针织开衫，左亮右暗
        const tg = ctx.createLinearGradient(x - 11, 0, x + 11, 0);
        tg.addColorStop(0, shade(C.top, .12)); tg.addColorStop(1, shade(C.top, -.16));
        ctx.beginPath();
        ctx.moveTo(x - 9.5, sh); ctx.quadraticCurveTo(x, sh - 3.5, x + 9.5, sh);
        ctx.lineTo(x + 11.2, waist + 1); ctx.quadraticCurveTo(x, waist + 4.5, x - 11.2, waist + 1);
        ctx.closePath();
        ctx.fillStyle = tg; ctx.fill();
        ctx.strokeStyle = 'rgba(25,40,40,.35)'; ctx.lineWidth = .8; ctx.stroke();
        if (front) {
            ctx.fillStyle = C.shirt;                                   // 衬衫 V 领
            ctx.beginPath(); ctx.moveTo(x - 4.6, sh - 1.5); ctx.lineTo(x + 4.6, sh - 1.5); ctx.lineTo(x, sh + 11); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.moveTo(x - 4.6, sh - 1.5); ctx.lineTo(x - .6, sh + 2); ctx.lineTo(x - 3.2, sh + 4); ctx.closePath(); ctx.fill();
            ctx.beginPath(); ctx.moveTo(x + 4.6, sh - 1.5); ctx.lineTo(x + .6, sh + 2); ctx.lineTo(x + 3.2, sh + 4); ctx.closePath(); ctx.fill();
            line({ x, y: sh + 11 }, { x, y: waist + 3 }, C.topD, 1.1);    // 门襟和纽扣
            ctx.fillStyle = '#efe7d6';
            [sh + 14, sh + 19, sh + 24].forEach(by => { ctx.beginPath(); ctx.arc(x + 1.6, by, 1.1, 0, Math.PI * 2); ctx.fill(); });
            line({ x: x - 8, y: waist - 6 }, { x: x - 3.5, y: waist - 6 }, C.topD, 1);   // 口袋
            line({ x: x + 3.5, y: waist - 6 }, { x: x + 8, y: waist - 6 }, C.topD, 1);
        } else {
            line({ x, y: sh + 1 }, { x, y: waist + 3 }, 'rgba(25,40,40,.25)', .8);
        }
        // 罗纹下摆
        ctx.strokeStyle = C.topD; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - 10.8, waist); ctx.quadraticCurveTo(x, waist + 3.6, x + 10.8, waist); ctx.stroke();
        arm(dir, true);

        // 脖子和头
        ctx.fillStyle = C.skinD; ctx.fillRect(x - 3, sh - 4, 6, 4);
        const hy = sh - 12;
        const hg = ctx.createRadialGradient(x - 3, hy - 3, 2, x, hy, 11);
        hg.addColorStop(0, shade(C.skin, .08)); hg.addColorStop(1, C.skinD);
        if (front) {
            ctx.fillStyle = C.skinD;
            ctx.beginPath(); ctx.arc(x - 10, hy + 1, 2.6, 0, Math.PI * 2); ctx.arc(x + 10, hy + 1, 2.6, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x, hy, 10.2, 0, Math.PI * 2); ctx.fill();

        // 头发：银灰色利落短发（不分男女）
        ctx.fillStyle = C.hair;
        if (front) {
            ctx.beginPath(); ctx.ellipse(x, hy - 2.5, 11, 8.6, 0, Math.PI, Math.PI * 2); ctx.fill();
            ctx.fillRect(x - 11, hy - 3, 3, 5); ctx.fillRect(x + 8, hy - 3, 3, 5);
            ctx.beginPath();                                             // 侧分刘海
            ctx.moveTo(x - 9 * dir, hy - 4);
            ctx.quadraticCurveTo(x - 1 * dir, hy - 8.5, x + 9 * dir, hy - 6);
            ctx.quadraticCurveTo(x + 2 * dir, hy - 3.5, x - 9 * dir, hy - 2);
            ctx.fill();
            ctx.strokeStyle = C.hairD; ctx.lineWidth = .8;
            ctx.beginPath(); ctx.moveTo(x - 4 * dir, hy - 10); ctx.quadraticCurveTo(x + 2 * dir, hy - 9, x + 7 * dir, hy - 6.5); ctx.stroke();
        } else {
            ctx.beginPath(); ctx.ellipse(x, hy - .5, 11, 10.8, 0, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = C.hairD; ctx.lineWidth = .8;
            ctx.beginPath(); ctx.moveTo(x - 7, hy + 6); ctx.quadraticCurveTo(x, hy + 9, x + 7, hy + 6); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(255,255,255,.55)';
        ctx.beginPath(); ctx.ellipse(x - 3, hy - 8, 4, 1.6, -.3, 0, Math.PI * 2); ctx.fill();

        if (front) {
            const f = dir * 1.4;
            ctx.strokeStyle = C.hairD; ctx.lineWidth = 1.2; ctx.lineCap = 'round';      // 眉毛
            ctx.beginPath(); ctx.moveTo(x - 6 + f, hy - 2.6); ctx.lineTo(x - 2.4 + f, hy - 3); ctx.moveTo(x + 2.4 + f, hy - 3); ctx.lineTo(x + 6 + f, hy - 2.6); ctx.stroke();
            ctx.fillStyle = '#3a3330';                                               // 眼睛
            ctx.beginPath(); ctx.arc(x - 4 + f, hy + .6, 1.25, 0, Math.PI * 2); ctx.arc(x + 4 + f, hy + .6, 1.25, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = C.frame; ctx.lineWidth = 1;                              // 圆框眼镜
            ctx.beginPath(); ctx.arc(x - 4 + f, hy + .6, 3.4, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.arc(x + 4 + f, hy + .6, 3.4, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x - .6 + f, hy + .2); ctx.lineTo(x + .6 + f, hy + .2);
            ctx.moveTo(x - 7.4 + f, hy); ctx.lineTo(x - 9.6, hy - .4); ctx.moveTo(x + 7.4 + f, hy); ctx.lineTo(x + 9.6, hy - .4); ctx.stroke();
            ctx.strokeStyle = C.skinD; ctx.lineWidth = 1;                              // 鼻子
            ctx.beginPath(); ctx.moveTo(x + f + .4, hy + 2.5); ctx.lineTo(x + f + 1.2, hy + 4.3); ctx.stroke();
            ctx.strokeStyle = '#9a5d4d'; ctx.lineWidth = 1.1;                          // 微笑
            ctx.beginPath(); ctx.arc(x + f, hy + 5, 2.6, .25, Math.PI - .25); ctx.stroke();
            ctx.fillStyle = 'rgba(214,130,110,.16)';
            ctx.beginPath(); ctx.arc(x - 6 + f, hy + 4.5, 2.2, 0, Math.PI * 2); ctx.arc(x + 6 + f, hy + 4.5, 2.2, 0, Math.PI * 2); ctx.fill();
        }
    }

    // 角色头顶的小箭头：标明"你在这里"，上下轻轻浮动（画在家具之后，不会被挡住）
    function drawPlayerMarker() {
        const p = P(player.x, player.y);
        const y = p.y - 84 + Math.sin(time * 3.2) * 3, x = p.x;
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 2;
        ctx.beginPath();
        ctx.moveTo(x - 11, y - 12); ctx.lineTo(x + 11, y - 12); ctx.lineTo(x, y + 3); ctx.closePath();
        ctx.fillStyle = '#ffc83d'; ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.lineJoin = 'round'; ctx.lineWidth = 2; ctx.strokeStyle = '#ffffff'; ctx.stroke();
        ctx.restore();
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

    /* ── 静态背景：地板 / 墙 / 门窗 / 地毯 / 阳光 / 阴影 —— 只在缩放变化时重画一次 ── */
    const WOOD_X = 5;                      // x < 5 是木地板（客厅），x ≥ 5 是瓷砖（餐厨）
    function drawFloor() {
        const eg = ctx.createLinearGradient(0, P(0, ROWS).y, 0, P(0, ROWS, -16).y);
        eg.addColorStop(0, '#a88f6e'); eg.addColorStop(1, '#7d6a52');
        poly([P(0, ROWS), P(COLS, ROWS), P(COLS, ROWS, -16), P(0, ROWS, -16)], eg, EDGE);
        poly([P(COLS, 0), P(COLS, ROWS), P(COLS, ROWS, -16), P(COLS, 0, -16)], '#86735a', EDGE);

        // 木地板：沿 x 方向的长条木板，错缝拼接，带木纹
        const WOODS = ['#d6b088', '#cfa77d', '#dcb78f', '#c99f74', '#d3ad83'];
        for (let j = 0; j < ROWS * 4; j++) {
            const y0 = j * .25, y1 = y0 + .25;
            let x = -rnd(j + 3) * 1.6;
            for (let k = 0; x < WOOD_X; k++) {
                const len = 1.3 + rnd(j * 7 + k) * .8, x0 = Math.max(0, x), x1 = Math.min(WOOD_X, x + len);
                if (x1 > x0) {
                    floorQuad(x0, y0, x1, y1, WOODS[Math.floor(rnd(j * 13 + k * 5) * WOODS.length)]);
                    for (let g = 0; g < 2; g++) {
                        const gy = y0 + .07 + g * .1 + rnd(j + k + g) * .03;
                        line(P(x0 + .05, gy), P(x1 - .05, gy + (rnd(j * k + g) - .5) * .04), 'rgba(120,80,45,.12)', .7);
                    }
                    line(P(x1, y0), P(x1, y1), 'rgba(90,60,30,.35)', .7);
                }
                x += len;
            }
            line(P(0, y1), P(WOOD_X, y1), 'rgba(90,60,30,.28)', .7);
        }
        // 瓷砖：每格一块，轻微色差 + 白色勾缝
        for (let gx = WOOD_X; gx < COLS; gx++) {
            for (let gy = 0; gy < ROWS; gy++) {
                const v = rnd(gx * 31 + gy * 17);
                floorQuad(gx, gy, gx + 1, gy + 1, v < .33 ? '#ebe7df' : v < .66 ? '#e5e1d8' : '#efebe4', '#cfc8bc');
            }
        }
        const gl = ctx.createLinearGradient(P(WOOD_X, 0).x, P(WOOD_X, 0).y, P(COLS, ROWS).x, P(COLS, ROWS).y);
        gl.addColorStop(0, 'rgba(255,255,255,.22)'); gl.addColorStop(.5, 'rgba(255,255,255,0)'); gl.addColorStop(1, 'rgba(0,0,0,.05)');
        floorQuad(WOOD_X, 0, COLS, ROWS, gl);
        floorQuad(WOOD_X - .03, 0, WOOD_X + .03, ROWS, '#b49a76');            // 过门石

        // 墙根的环境光遮蔽
        const ao = (a, b, pts) => {
            const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            g.addColorStop(0, 'rgba(50,35,20,.22)'); g.addColorStop(1, 'rgba(50,35,20,0)');
            poly(pts, g);
        };
        ao(P(6, 0), P(6, .45), [P(0, 0), P(COLS, 0), P(COLS, .45), P(0, .45)]);
        ao(P(0, 4), P(.45, 4), [P(0, 0), P(.45, 0), P(.45, ROWS), P(0, ROWS)]);
    }

    // 墙面基础色（带一点从窗户来的明暗变化）
    function wallFace(pts, c0, c1, a, b) {
        const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        g.addColorStop(0, c0); g.addColorStop(1, c1);
        poly(pts, g);
    }

    function drawWalls() {
        // 墙顶和端面
        poly([P(-.25, -.25, WALL_H), P(COLS, -.25, WALL_H), P(COLS, 0, WALL_H), P(0, 0, WALL_H), P(0, ROWS, WALL_H), P(-.25, ROWS, WALL_H)], '#cbc1b0', EDGE);
        fx(COLS, -.25, 0, 0, WALL_H, '#c4b8a3', EDGE);
        fy(ROWS, -.25, 0, 0, WALL_H, '#bcae97', EDGE);

        // 后墙（y = 0）和左墙（x = 0）
        wallFace(quadY(0, 0, COLS, 0, WALL_H), '#f4ecdf', '#e6dccb', P(0, 0, 80), P(COLS, 0, 80));
        wallFace(quadX(0, 0, ROWS, 0, WALL_H), '#e6dac7', '#ddd0bb', P(0, 0, 80), P(0, ROWS, 80));

        const decorate = (len, wainscot) => {
            // 上半部分：很淡的竖条纹墙纸
            ctx.fillStyle = 'rgba(150,115,70,.05)';
            for (let s = 4; s < len; s += 14) ctx.fillRect(s, 48, 6, WALL_H - 58);
            // 下半部分：护墙板 + 腰线
            ctx.fillStyle = wainscot; ctx.fillRect(0, 0, len, 44);
            ctx.strokeStyle = 'rgba(120,95,60,.18)'; ctx.lineWidth = 1;
            for (let s = 8; s + 32 <= len; s += 40) ctx.strokeRect(s, 12, 32, 26);
            ctx.fillStyle = '#f6f1e8'; ctx.fillRect(0, 44, len, 4);
            ctx.fillStyle = 'rgba(80,60,40,.12)'; ctx.fillRect(0, 42.5, len, 1.5);
            // 踢脚线和顶角线
            ctx.fillStyle = '#f7f2ea'; ctx.fillRect(0, 0, len, 10);
            ctx.fillStyle = 'rgba(80,60,40,.18)'; ctx.fillRect(0, 10, len, 1);
            ctx.fillStyle = '#f7f2ea'; ctx.fillRect(0, WALL_H - 8, len, 8);
            ctx.fillStyle = 'rgba(80,60,40,.12)'; ctx.fillRect(0, WALL_H - 9.5, len, 1.5);
            // 墙角阴影
            const g = ctx.createLinearGradient(0, 0, 26, 0);
            g.addColorStop(0, 'rgba(60,40,20,.14)'); g.addColorStop(1, 'rgba(60,40,20,0)');
            ctx.fillStyle = g; ctx.fillRect(0, 0, 26, WALL_H);
        };
        onPlaneY(0, () => decorate(COLS * TW / 2, '#e3d6c0'));
        onPlaneX(0, () => decorate(ROWS * TW / 2, '#d8cab2'));

        onPlaneX(0, drawWindow);
        onPlaneY(0, drawBackWallDecor);
        onPlaneX(0, drawFamilyPhoto);
        box(0, 5.05, .14, 2.5, 4, '#f4efe6', 48);                              // 窗台
        cyl(.07, 5.5, 52, 7, .05, .06, '#c8743c', '#4a3424');                  // 窗台上的小盆栽
        foliage(.07, 5.5, 59, 5, .38, ['#5ea862', '#4c9152'], 91);
    }

    // 左墙的窗（y 5.1–7.5 → s 204–300），窗外是蓝天、云和远处的树
    function drawWindow() {
        ctx.fillStyle = '#f6f1e8'; ctx.fillRect(198, 46, 108, 90);
        ctx.fillStyle = '#d6cbb9'; ctx.fillRect(203, 51, 98, 80);
        const sky = ctx.createLinearGradient(0, 128, 0, 56);
        sky.addColorStop(0, '#86c0ea'); sky.addColorStop(1, '#dff0fa');
        ctx.fillStyle = sky; ctx.fillRect(207, 55, 90, 72);
        ctx.fillStyle = 'rgba(255,255,255,.9)';
        [[226, 112, 9], [236, 114, 7], [270, 104, 8], [279, 107, 6]].forEach(([s, v, r]) => { ctx.beginPath(); ctx.arc(s, v, r, 0, Math.PI * 2); ctx.fill(); });
        ctx.fillStyle = '#9cc49a';
        ctx.beginPath(); ctx.moveTo(207, 55); ctx.quadraticCurveTo(240, 80, 270, 64); ctx.quadraticCurveTo(285, 58, 297, 66); ctx.lineTo(297, 55); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#6fa06f';
        [[214, 70, 8], [224, 74, 10], [282, 70, 9], [292, 66, 7]].forEach(([s, v, r]) => { ctx.beginPath(); ctx.arc(s, v, r, 0, Math.PI * 2); ctx.fill(); });
        ctx.fillStyle = 'rgba(255,255,255,.28)';
        ctx.beginPath(); ctx.moveTo(214, 127); ctx.lineTo(232, 127); ctx.lineTo(212, 80); ctx.lineTo(207, 80); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(262, 127); ctx.lineTo(270, 127); ctx.lineTo(252, 86); ctx.lineTo(246, 86); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#f6f1e8'; ctx.fillRect(250, 55, 4, 72); ctx.fillRect(207, 89, 90, 4);
        // 窗帘：竖向褶皱
        const curtain = (s0) => {
            for (let i = 0; i < 7; i++) {
                const g = ctx.createLinearGradient(s0 + i * 4, 0, s0 + i * 4 + 4, 0);
                g.addColorStop(0, '#c98f78'); g.addColorStop(.5, '#e3ad96'); g.addColorStop(1, '#b97d67');
                ctx.fillStyle = g; ctx.fillRect(s0 + i * 4, 38, 4, 102);
            }
            ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(s0, 38, 28, 3);
        };
        curtain(184); curtain(292);
        ctx.fillStyle = '#6b5a48'; ctx.fillRect(178, 140, 148, 3);
        ctx.beginPath(); ctx.arc(178, 141.5, 3.2, 0, Math.PI * 2); ctx.arc(326, 141.5, 3.2, 0, Math.PI * 2); ctx.fill();
    }

    // 后墙：门（x 8.1–9.5 → s 324–380）、风景画、开关和插座
    function drawBackWallDecor() {
        ctx.fillStyle = '#f6f1e8'; ctx.fillRect(320, 0, 64, 120);
        const dg = ctx.createLinearGradient(326, 0, 378, 0);
        dg.addColorStop(0, '#93653f'); dg.addColorStop(1, '#7a5233');
        ctx.fillStyle = dg; ctx.fillRect(326, 0, 52, 113);
        [[331, 62, 19, 44], [354, 62, 19, 44], [331, 10, 19, 46], [354, 10, 19, 46]].forEach(([s, v, w, h]) => {
            ctx.fillStyle = 'rgba(60,35,15,.22)'; ctx.fillRect(s, v, w, h);
            ctx.fillStyle = 'rgba(255,230,190,.18)'; ctx.fillRect(s + 1.5, v + 1.5, w - 3, h - 3);
            ctx.strokeStyle = 'rgba(40,20,10,.35)'; ctx.lineWidth = 1; ctx.strokeRect(s, v, w, h);
        });
        ctx.fillStyle = '#d9b44a'; ctx.beginPath(); ctx.arc(371, 56, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(370, 57, 1, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f9f7f3'; ctx.fillRect(309, 58, 7, 11);
        ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.strokeRect(309, 58, 7, 11);
        ctx.fillStyle = '#f9f7f3'; ctx.fillRect(203, 14, 8, 6); ctx.strokeRect(203, 14, 8, 6);

        // 风景画（x 5.3–7.5 → s 212–300）
        ctx.fillStyle = '#5e4632'; ctx.fillRect(212, 74, 88, 54);
        ctx.fillStyle = '#f4efe6'; ctx.fillRect(216, 78, 80, 46);
        const sky = ctx.createLinearGradient(0, 120, 0, 82);
        sky.addColorStop(0, '#f6c98c'); sky.addColorStop(1, '#a9d4ee');
        ctx.fillStyle = sky; ctx.fillRect(221, 82, 70, 38);
        ctx.fillStyle = '#fff1c4'; ctx.beginPath(); ctx.arc(270, 108, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#7fa67a'; ctx.beginPath(); ctx.moveTo(221, 82); ctx.lineTo(221, 100); ctx.quadraticCurveTo(245, 112, 262, 96); ctx.quadraticCurveTo(278, 86, 291, 98); ctx.lineTo(291, 82); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#5d8a5c'; ctx.beginPath(); ctx.moveTo(221, 82); ctx.lineTo(221, 92); ctx.quadraticCurveTo(250, 98, 291, 88); ctx.lineTo(291, 82); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(160,205,230,.8)'; ctx.fillRect(221, 82, 70, 4);
    }

    // 左墙上的全家福（与互动区域 PHOTO 对应：y .35–1.65 → s 14–66，z 106–142）
    function drawFamilyPhoto() {
        ctx.fillStyle = '#7a5a3a'; ctx.fillRect(14, 106, 52, 36);
        ctx.fillStyle = '#f6efe0'; ctx.fillRect(18, 110, 44, 28);
        const g = ctx.createLinearGradient(0, 134, 0, 112);
        g.addColorStop(0, '#bfe0f2'); g.addColorStop(1, '#e9f3e1');
        ctx.fillStyle = g; ctx.fillRect(21, 113, 38, 22);
        [[28, '#c0563b', '#d9dbe0'], [36, '#5e8c84', '#5a4636'], [44, '#3b6ea5', '#2f2a26'], [52, '#d6a640', '#d9dbe0']].forEach(([s, body, hair], i) => {
            const v = i === 1 || i === 2 ? 0 : -2;
            ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(s, 116 + v, 4.2, 4, 0, 0, Math.PI); ctx.fill();
            ctx.fillStyle = '#e8bf9b'; ctx.beginPath(); ctx.arc(s, 123 + v, 2.8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(s, 124.2 + v, 2.9, 0, Math.PI); ctx.fill();
        });
    }

    function drawRugsAndMats() {
        // 客厅地毯：深蓝边 + 米色底 + 菱形图案 + 流苏
        floorQuad(1, 3, 3, 6, '#3f5675', 'rgba(0,0,0,.15)');
        floorQuad(1.12, 3.12, 2.88, 5.88, '#e8dcc6');
        floorQuad(1.22, 3.22, 2.78, 5.78, null, 'rgba(63,86,117,.7)');
        poly([P(2, 3.7), P(2.55, 4.5), P(2, 5.3), P(1.45, 4.5)], '#c98f78', 'rgba(63,86,117,.6)');
        poly([P(2, 4.15), P(2.25, 4.5), P(2, 4.85), P(1.75, 4.5)], '#3f5675');
        for (let i = 0; i < 6; i++) {
            disc(1.4 + (i % 2) * 1.2, 3.5 + Math.floor(i / 2) * 1, 0, .05, '#c98f78');
        }
        for (let x = 1.05; x < 3; x += .08) {
            line(P(x, 3), P(x, 2.92), 'rgba(230,220,200,.9)', .7);
            line(P(x, 6), P(x, 6.08), 'rgba(230,220,200,.9)', .7);
        }
        // 餐区地毯：赤陶色条纹
        floorQuad(6, 3.5, 10, 6.5, '#b8735a', 'rgba(0,0,0,.12)');
        floorQuad(6.15, 3.65, 9.85, 6.35, '#d9a48d');
        for (let y = 3.9; y < 6.3; y += .45) floorQuad(6.15, y, 9.85, y + .08, 'rgba(184,115,90,.55)');
        // 门口地垫
        floorQuad(8.2, 0, 9.4, 1, '#a8875a', 'rgba(0,0,0,.2)');
        floorQuad(8.28, .08, 9.32, .92, null, 'rgba(70,50,30,.45)');
    }

    // 阳光从左墙的窗户斜照进来
    function drawSunlight() {
        const a = P(0, 6.3), b = P(2.8, 7.5);
        const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        g.addColorStop(0, 'rgba(255,238,196,.42)'); g.addColorStop(1, 'rgba(255,238,196,0)');
        poly([P(.05, 5.25), P(.05, 7.35), P(2.9, 8.6), P(2.9, 6.5)], g);
        line(P(.05, 6.3), P(2.9, 7.55), 'rgba(160,120,70,.12)', 2);           // 窗棂的影子
    }

    // 家具的柔和投影（光从左上方来）
    function drawShadows() {
        const blur = 'filter' in ctx;
        ctx.save();
        if (blur) ctx.filter = `blur(${Math.max(2, 5 * cacheScale)}px)`;
        OBJ.forEach(o => {
            floorQuad(o.gx + .1, o.gy + .14, o.gx + o.w + .16, o.gy + o.d + .22, 'rgba(50,35,20,.2)');
        });
        ctx.restore();
    }

    let cacheCanvas = null, cacheKey = '', cacheScale = 1;
    function staticLayer(k) {
        const key = k.toFixed(3);
        if (key === cacheKey && cacheCanvas) return cacheCanvas;
        const c = document.createElement('canvas');
        c.width = Math.ceil(SCENE_W * k); c.height = Math.ceil(SCENE_H * k);
        const prev = ctx;
        ctx = c.getContext('2d');
        ctx.setTransform(k, 0, 0, k, 0, 0);
        cacheScale = k;
        drawFloor();
        drawWalls();
        drawRugsAndMats();
        drawSunlight();
        drawShadows();
        ctx = prev;
        cacheCanvas = c; cacheKey = key;
        return c;
    }

    // 后墙上的挂钟：显示真实时间（每帧画）
    function drawClock() {
        onPlaneY(0, () => {
            const s = 136, v = 112, now = new Date();
            ctx.fillStyle = '#6b5a48'; ctx.beginPath(); ctx.arc(s, v, 16, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fffdf8'; ctx.beginPath(); ctx.arc(s, v, 13.5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#3a3330';
            for (let i = 0; i < 12; i++) {
                const a = i / 12 * Math.PI * 2, r0 = i % 3 ? 11 : 9.5;
                ctx.lineWidth = i % 3 ? .8 : 1.4;
                ctx.beginPath(); ctx.moveTo(s + Math.sin(a) * r0, v + Math.cos(a) * r0); ctx.lineTo(s + Math.sin(a) * 12.5, v + Math.cos(a) * 12.5); ctx.stroke();
            }
            const hand = (frac, len, w, col) => {
                const a = frac * Math.PI * 2;
                ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
                ctx.beginPath(); ctx.moveTo(s, v); ctx.lineTo(s + Math.sin(a) * len, v + Math.cos(a) * len); ctx.stroke();
            };
            hand(((now.getHours() % 12) + now.getMinutes() / 60) / 12, 6.5, 2, '#2b2622');
            hand((now.getMinutes() + now.getSeconds() / 60) / 60, 9.5, 1.4, '#2b2622');
            hand(now.getSeconds() / 60, 10.5, .7, '#c0392b');
            ctx.fillStyle = '#2b2622'; ctx.beginPath(); ctx.arc(s, v, 1.3, 0, Math.PI * 2); ctx.fill();
        });
    }

    // 电视屏幕映在地上的蓝光、窗户射进来的光柱（每帧画，光柱会落在人物身上）
    function drawTvGlow() {
        const c = P(1.3, 4, 0);
        const g = ctx.createRadialGradient(c.x, c.y, 4, c.x, c.y, 60);
        g.addColorStop(0, `rgba(120,170,255,${.1 + .03 * Math.sin(time * 9)})`); g.addColorStop(1, 'rgba(120,170,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(c.x, c.y, 60, 30, 0, 0, Math.PI * 2); ctx.fill();
    }
    function drawLightShafts() {
        poly([P(0, 5.25, 128), P(0, 7.35, 128), P(2.9, 8.6, 0), P(2.9, 6.5, 0)], 'rgba(255,240,205,.07)');
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
        const count = inter.type === 'device' ? unread(inter.device) : 0;
        if (inter.type === 'device') {
            if (!count) { icon = '✅'; kind = 'done'; } else kind = 'alert';
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
            ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.fillText(String(count), x + 17, y - 16);
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

        ctx.drawImage(staticLayer(Math.min(3, dpr * view.scale)), 0, 0, SCENE_W, SCENE_H);
        drawClock();
        drawTvGlow();

        const active = near || hover;
        if (active && !active.decal) outlineFor(active);

        const items = OBJ.slice();
        items.push({ gx: player.x - .2, gy: player.y - .2, w: .4, d: .4, draw: drawPlayer });
        sortItems(items).forEach(o => o.draw());
        drawLightShafts();
        if (!BG) drawPlayerMarker();

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
        if (obj) { walkTo(obj); return; }
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

    // 走到物品旁边，到了自动打开
    function walkTo(obj) {
        if (rectDist(player.x, player.y, obj) <= NEAR) { activate(obj); return; }
        const goals = [];
        for (let y = 0; y < ROWS; y++)
            for (let x = 0; x < COLS; x++)
                if (cellFree(x, y) && rectDist(x + .5, y + .5, obj) <= NEAR) goals.push([x, y]);
        if (planTo(goals)) pending = obj; else pending = null;
    }

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
        const verb = near.inter.type === 'device' ? t('sbActLook') : t('sbActUse');
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

    /* 每台设备上本轮还没看的消息数 */
    function unread(dev) { return casesOnDevice(dev).filter(c => !getLessonResult(c.id)).length; }
    const DEVICE_QUEST = { phone: 'sbQuestPhone', computer: 'sbQuestLaptop', tablet: 'sbQuestTablet' };

    function refreshHud() {
        const quest = document.getElementById('sbQuest');
        let html = `<div class="sb-quest-title">${t('sbQuestTitle')} (${doneCount()}/${CASES.length})</div>`;
        Object.keys(DEVICE_QUEST).forEach(dev => {
            const total = casesOnDevice(dev).length, left = unread(dev);
            html += `<div class="sb-quest-item${left ? '' : ' done'}"><span>${left ? DEVICES[dev].icon : '✅'}</span>
                <span>${t(DEVICE_QUEST[dev])}</span><span class="sb-quest-count">${total - left}/${total}</span></div>`;
        });
        html += `<div class="sb-quest-tips">${t('sbTipsLabel')} ${tipsSeen().filter(x => TIP_IDS.includes(x)).length}/${TIP_IDS.length}</div>`;
        if (allLessonsDone()) {
            const step = nextFinalStep();
            html += `<a class="btn btn-primary" href="${step.href}">${t(step.key)}</a>`;
        } else {
            // 论文发现年纪越大越难自己走动，所以提供"引导路线"：一键走到下一件事
            html += `<button class="btn btn-primary" id="sbGuideBtn">${t('sbGuideBtn')}</button>`;
        }
        quest.innerHTML = html;
        const g = document.getElementById('sbGuideBtn');
        if (g) g.onclick = goToNext;
        refreshPrompt();
    }

    function goToNext() {
        const next = CASES.find(c => !getLessonResult(c.id));
        if (!next) return;
        const obj = OBJ.find(o => o.inter && o.inter.device === next.device);
        nextCaseHint = next.id;
        walkTo(obj);
    }
    let nextCaseHint = null;

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
        if (inter.type === 'device') {
            // 用"带我去"走过来的，直接打开那条消息；自己点的，先看收件箱
            const hinted = nextCaseHint && caseById(nextCaseHint).device === inter.device ? caseById(nextCaseHint) : null;
            nextCaseHint = null;
            if (hinted) playCase(hinted); else openInbox(inter.device);
        } else showTip(inter.tip);
    }

    // 设备收件箱：大按钮列表，一行一条消息
    function openInbox(dev) {
        const body = openModal(`${DEVICES[dev].icon} ${DEVICES[dev][getLang()]}`);
        const rows = casesOnDevice(dev).map(c => {
            const L = caseText(c), done = !!getLessonResult(c.id);
            return `<button class="inbox-row${done ? ' done' : ''}" data-id="${c.id}">
                <span class="contact-avatar">${L.avatar}</span>
                <span class="inbox-main"><span class="inbox-name">${escHtml(L.contact)}</span>
                <span class="inbox-preview">${CHANNELS[c.channel].icon} ${escHtml(L.preview)}</span></span>
                <span class="inbox-meta">${done ? '✅' : `<span class="unread-dot"></span>`}</span></button>`;
        }).join('');
        body.innerHTML = `<div class="inbox"><p class="inbox-hint">${t('sbInboxHint')}</p>${rows}</div>`;
        body.querySelectorAll('.inbox-row').forEach(r => r.addEventListener('click', () => playCase(caseById(r.dataset.id))));
    }

    function showTip(id) {
        const cap = id.charAt(0).toUpperCase() + id.slice(1);
        markTip(id);
        showDialog(t('sbTip' + cap + 'Title'), t('sbTip' + cap + 'Text'),
            [{ label: t('sbGotIt'), primary: true, onClick: closeModal }]);
    }

    function playCase(c) {
        const wasAll = allLessonsDone();
        const L = caseText(c);
        const body = openModal(`${DEVICES[c.device].icon} ${DEVICES[c.device][getLang()]} · ${L.contact}`);
        body.innerHTML = `${caseHeaderHtml(c)}
            <div class="chat-area" id="chatArea"></div>
            <div class="choice-area" id="choiceArea"></div>
            <div class="continue-bar" id="continueBar"></div>
            <div class="summary-panel" id="summaryPanel" style="display:none;"></div>`;
        const finish = () => {
            closeModal();
            if (!wasAll && allLessonsDone()) {
                showDialog(t('sbAllDoneTitle'), t('sbAllDoneText'), [
                    { label: t('sbAllDoneStay'), onClick: closeModal },
                    { label: t(nextFinalStep().key), primary: true, onClick: () => { window.location.href = nextFinalStep().href; } },
                ]);
            }
        };
        const engine = new ChatEngine(c, {
            chatAreaId: 'chatArea', choiceAreaId: 'choiceArea',
            continueBarId: 'continueBar', summaryId: 'summaryPanel',
            mode: 'sandbox',
            actions: () => {
                const next = casesOnDevice(c.device).find(x => !getLessonResult(x.id));
                return next
                    ? [{ label: t('chatNextMsg'), primary: true, onClick: () => playCase(next) },
                       { label: t('sbBackBtn'), onClick: finish }]
                    : [{ label: t('sbBackBtn'), primary: true, onClick: finish }];
            },
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
