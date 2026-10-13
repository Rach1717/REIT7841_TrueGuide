/* ============================================================
   反诈小课堂 — 语言切换 (中文 / English)
   ============================================================ */

const I18N = {
    zh: {
        brand: '🛡️ 反诈小课堂',
        navBack: '← 返回首页',

        heroTitle: '生活中的诈骗，你能认出来吗？',
        heroDesc: '这是一间虚拟的家，里面的手机、电脑和平板会收到各种"意外消息"。在家里走一走、点一点，做出你的选择，看看能不能识破骗局——答错了也没关系，我们会告诉你为什么。',
        noticeBox: '提醒：这只是一个防骗教学演示，里面的短信、聊天和视频通话都是虚构的。真实生活中，凡是遇到要求转账、汇款、提供验证码的消息，请务必先通过电话等方式和家人核实，或联系当地警方 / 反诈骗机构咨询。',

        case1Tag: '第一课',
        case1Title: '短信里的"孙子"',
        case1Desc: '一条说"出车祸急需转账"的陌生短信，该怎么应对？',

        case2Tag: '第二课',
        case2Title: '聊天软件里的"客服"',
        case2Desc: '网购订单"异常"，对方要加微信办退款，能信吗？',

        case3Tag: '第三课',
        case3Title: '视频电话里的"儿子"',
        case3Desc: '画面卡顿的视频通话，那头真的是家人本人吗？',

        footer: '本课程仅用于防骗教育演示 · 遇到可疑情况请联系家人或当地警方 / 反诈骗机构',

        c1Eyebrow: '第一课 · 短信诈骗',
        c1PageTitle: '📱 短信里的"孙子"',
        c1PageDesc: '一条来自陌生号码、说"出车祸急需转账"的短信，跟着情景做出你的选择。',
        c1Topbar: '💬 短信 · 未知号码',

        c2Eyebrow: '第二课 · App聊天诈骗',
        c2PageTitle: '💬 聊天软件里的"客服"',
        c2PageDesc: '网购订单突然"异常"，对方要你加微信办退款，跟着情景做出你的选择。',
        c2Topbar: '💬 购物App消息 · "客服"',

        c3Eyebrow: '第三课 · AI换脸换声视频诈骗',
        c3PageTitle: '🎥 视频电话里的"儿子"',
        c3PageDesc: '画面卡顿模糊的视频通话，那头真的是家人本人吗？跟着情景做出你的选择。',
        c3CallName: '儿子',
        c3CallStatus: '视频通话中 · 00:14',
        c3CallVideo: '📶 信号不稳定，画面模糊卡顿',

        nextBtn: '下一步 →',
        continueBtn: '继续 →',
        retryBtn: '重新选择',
        defaultPrompt: '你会怎么做？',
        correctTitle: '✅ 判断正确',
        wrongTitle: '⚠️ 这样做有风险',
        homeBtn: '返回首页',
        scorePrefix: '你答对了',
        scoreSuffix: '处风险判断',

        /* ── 首页：调查流程状态 ── */
        homeLockedTitle: '开始学习前，先花几分钟做个小调查',
        homeLockedDesc: '这能帮助我们了解你目前的想法，学完之后再做一次同样的小调查，就能看到你的变化。',
        homeLockedBtn: '开始调查 →',
        homeStepPre: '第一步：入学前调查',
        homeStepPreDoneLabel: '✅ 已完成',
        homeProgressTitle: '学习进度',
        homeProgressDesc: '完成全部三课后，会提示你再做一次同样的小调查。',
        homePostPromptTitle: '🎉 三课都学完了！',
        homePostPromptDesc: '再花 2 分钟做一次同样的小调查，看看你的变化吧。',
        homePostPromptBtn: '开始结课调查 →',
        homeReportTitle: '📊 你的学习报告已生成',
        homeReportDesc: '看看学习前后，你的判断和信心发生了哪些变化。',
        homeReportBtn: '查看我的报告 →',
        homeLessonLocked: '请先完成入学前调查',
        homeDoneBadge: '已完成',

        /* ── 调查表通用 ── */
        surveyBackHome: '← 返回首页',
        surveyRequired: '（可跳过）',
        optSkip: '不想回答',
        likertSkip: '不想回答',
        likert1: '非常不同意',
        likert2: '不同意',
        likert3: '一般',
        likert4: '同意',
        likert5: '非常同意',
        surveySubmitBtn: '提交',
        surveySelectPrompt: '（可多选）',
        listSep: '、',

        /* ── 入学前调查 ── */
        preSurveyTag: '开始之前',
        preSurveyTitle: '入学前小调查',
        preSurveyDesc: '这不是考试，没有标准答案，任何题目都可以跳过。填完之后就能开始三节小课程。大约需要 3–5 分钟。',
        preSecA: 'A. 关于你',
        preSecB: 'B. 你现在的想法（1–5 分）',
        preSecBDesc: '请选出最符合你平时感受的选项。',

        pA1_q: 'A1. 你的年龄段是？',
        pA1_o1: '50–59 岁', pA1_o2: '60–69 岁', pA1_o3: '70–79 岁', pA1_o4: '80 岁以上',

        pA2_q: 'A2. 你平时会用到哪些设备？（可多选）',
        pA2_o1: '智能手机', pA2_o2: '平板电脑', pA2_o3: '电脑', pA2_o4: '都不怎么用',

        pA3_q: 'A3. 你是否经常和晚辈（子女、孙辈等）联系？',
        pA3_o1: '经常', pA3_o2: '不常', pA3_o3: '几乎没有',

        pA4_q: 'A4. 收到意外的消息或电话时，你通常会先找谁帮忙？（可多选）',
        pA4_o1: '家人', pA4_o2: '朋友', pA4_o3: '银行或客服', pA4_o4: '自己处理', pA4_o5: '其他',

        pA5_q: 'A5. 在今天之前，你听说过"冒充亲人求助"这类骗局吗？',
        pA5_o1: '听说过', pA5_o2: '没听说过', pA5_o3: '不确定',

        pA6_q: 'A6. 你自己是否收到过"家人出事急需转账"这样的消息或电话？',
        pA6_o1: '有过', pA6_o2: '没有过', pA6_o3: '不确定',

        pA7_q: 'A7. 你身边的家人或朋友，是否有人跟你说过他们遇到过类似骗局？',
        pA7_o1: '有', pA7_o2: '没有', pA7_o3: '不确定',

        preSurveySubmitBtn: '提交并开始学习 →',
        preSurveyDoneMsg: '谢谢！调查已保存，现在可以开始第一课了。',

        /* ── 六道共用量表题（前测/后测都会用到，措辞必须完全一致）── */
        lQ1: '遇到紧急的消息或电话时，我能先停下来想一想，再决定怎么做。',
        lQ2: '在转账或提供个人信息之前，如果是意外的请求，我会先联系信得过的人确认。',
        lQ3: '如果消息看起来像是家人发来的，我会一开始就比较相信它。',
        lQ4: '当消息让人感觉很紧急时，我很难停下来想想是不是还有别的可能。',
        lQ5: '使用邮件、短信或网上服务时，我会担心自己不小心出错。',
        lQ6: '因为担心被骗，我会避免使用一些数字化的沟通方式。',

        /* ── 结课调查 ── */
        postSurveyTag: '课程完成',
        postSurveyTitle: '结课小调查',
        postSurveyDesc: '和入学前是同样的 6 道题，方便看看学完三节课后你的想法有没有变化。大约需要 2 分钟。',
        postSecB: '你现在的想法（1–5 分）',
        postQ1_q: '学完之后，你觉得自己更能识别哪种类型的骗局？（可多选）',
        postQ1_o1: '假冒亲人的短信', postQ1_o2: 'App聊天里的"客服"', postQ1_o3: 'AI换脸换声的视频通话', postQ1_o4: '还是不太有信心',
        postSurveySubmitBtn: '提交并查看我的报告 →',

        /* ── 报告页 ── */
        reportTag: '我的学习报告',
        reportTitle: '学习前后对比报告',
        reportDesc: '下面是你完成三节课前后，同一份小调查的对比结果，仅供你自己参考。',
        reportNoData: '还没有完整的数据，请先完成入学前调查、三节课程和结课调查。',
        reportGoHome: '返回首页',
        reportConstructVerify: '遇事核实的意愿',
        reportConstructVerifyDesc: '分数越高，代表你越倾向于先停下来核实，而不是马上行动。',
        reportConstructPressure: '容易被"紧迫感"影响',
        reportConstructPressureDesc: '分数越高，代表紧急、看似熟人的消息越容易让你来不及多想。分数下降是好事。',
        reportConstructAnxiety: '对数字沟通的担忧',
        reportConstructAnxietyDesc: '分数越高，代表你对使用手机、网络服务感到越不安。',
        reportBefore: '学习前',
        reportAfter: '学习后',
        reportLessonScores: '三节课的判断成绩',
        reportLessonScoreLabel: '答对',
        reportOverallScore: '总体答对',
        reportConfidentTypes: '结课时你更有信心识别：',
        reportThanks: '感谢你完成本次学习和调查！',

        /* ── 沙盒：首页入口 ── */
        homeEnterBtn: '🏠 走进家里，开始探索',
        homeEnterDesc: '像玩游戏一样在家里走一走，点一点手机、电脑和平板。每一条"意外消息"，都要靠你来判断。',
        homeCheckTitle: '家里今天会发生的三件事',
        homeContinueBtn: '🏠 回到家里',
        homeModeLabel: '选择体验方式',
        homeModeSandbox: '🏠 沙盒探索',
        homeModeSandboxSub: '在家里走动，点物品触发情景',
        homeModeClassic: '💬 对话框模式',
        homeModeClassicSub: '一课一课，按顺序完成对话',
        homeModeNote: '两种模式的学习进度是共通的，可以随时切换。',
        homeClassicDesc: '经典模式：像看手机聊天一样，按顺序完成三节课，每一步都由你来做选择。',
        homeClassicStart: '💬 开始第一课',
        homeClassicNext: '💬 继续下一课',
        homeClassicReview: '💬 从第一课再看一遍',
        homeClassicListTitle: '三节课程（点击直接进入）',

        /* ── 沙盒：场景与界面 ── */
        sbTitle: '家中探索',
        sbQuestTitle: '今天要做的事',
        sbQuestPhone: '看看手机上的新消息',
        sbQuestLaptop: '看看电脑上的消息',
        sbQuestTablet: '接一下平板上的来电',
        sbTipsLabel: '💡 生活小贴士',
        sbHelp: '点击地面走动 · 方向键 / WASD 移动 · 空格键 或点击物品互动',
        sbActLook: '查看',
        sbActUse: '看看',
        sbKeySpace: '空格',
        sbObjPhone: '手机',
        sbObjLaptop: '电脑',
        sbObjTablet: '平板',
        sbObjTv: '电视',
        sbObjFridge: '冰箱',
        sbObjPhoto: '全家福',
        sbBackBtn: '回到家里 →',
        sbClose: '✕ 先离开',
        sbGotIt: '知道了',
        sbWelcomeTitle: '欢迎回家',
        sbWelcomeText: '这是一间虚拟的家。今天，手机、电脑和平板都可能收到"意外的消息"。用鼠标点地面走动（或用方向键），走近物品后点击它，看看会发生什么。家里的其他东西也可以看看，说不定有小贴士。',
        sbTipTvTitle: '📺 电视新闻',
        sbTipTvText: '新闻里正在播报："近期多地出现冒充亲人、冒充客服的诈骗。提醒老年朋友：凡是要转钱，先打电话给家人本人确认，再决定。"',
        sbTipFridgeTitle: '🧲 冰箱上的便签',
        sbTipFridgeText: '冰箱上贴着一张便签，写着儿女的真实电话号码。好习惯：把家人的号码写在显眼的地方。一旦收到"出事了"的消息，先按这个号码打过去，而不是回拨消息里给的新号码。',
        sbTipPhotoTitle: '🖼️ 全家福',
        sbTipPhotoText: '看着全家福，不妨和家人约定一个只有你们知道的"家庭暗号"。以后遇到可疑的视频或电话，先问暗号，答不上来就不要相信。',
        sbAllDoneTitle: '🎉 今天的三件事都处理好了！',
        sbAllDoneText: '你已经练习了短信、聊天软件和视频通话三种常见骗局。接下来可以继续在家里逛逛，或者去做结课调查，看看自己的变化。',
        sbAllDoneStay: '继续逛逛',
        sbAllDoneSurvey: '去做结课调查 →',
        sbSurveyBtn: '📝 去做结课调查',
        sbFontLabel: '字号',
        sbMapLabel: '地图',
        sbFontDown: '字体缩小',
        sbFontUp: '字体放大',
        sbMapDown: '地图缩小',
        sbMapUp: '地图放大',
        sbReportBtn: '📊 查看我的报告',
    },
    en: {
        brand: '🛡️ Scam Safety Class',
        navBack: '← Back to home',

        heroTitle: 'Can you spot the scam?',
        heroDesc: 'This is a made-up house where the phone, computer and tablet receive all kinds of "unexpected messages". Walk around, tap things, make your choices and see if you can spot the trick — getting it wrong is okay too, we\'ll explain why.',
        noticeBox: 'Note: this is only an educational demo. All the text messages, chats, and video calls here are made up. In real life, if a message asks you to transfer money or share a verification code, always confirm with your family by phone first, or contact your local police or anti-fraud/consumer protection agency.',

        case1Tag: 'Lesson 1',
        case1Title: 'A text from your "grandson"',
        case1Desc: 'A stranger\'s text says "I\'ve had a car accident, send money now" — what would you do?',

        case2Tag: 'Lesson 2',
        case2Title: '"Customer service" in a chat app',
        case2Desc: 'Your order shows an "issue" and they want you to add them for a refund — can you trust it?',

        case3Tag: 'Lesson 3',
        case3Title: 'Your "son" on a video call',
        case3Desc: 'The video is choppy and blurry — is that really your family member on the other end?',

        footer: 'This course is for anti-fraud education only · If something seems suspicious, contact family or your local police / anti-fraud agency',

        c1Eyebrow: 'Lesson 1 · Text message scam',
        c1PageTitle: '📱 A text from your "grandson"',
        c1PageDesc: 'A text from an unknown number claims there\'s been a car accident and money is needed urgently. Follow the scenario and make your choice.',
        c1Topbar: '💬 Text message · Unknown number',

        c2Eyebrow: 'Lesson 2 · App chat scam',
        c2PageTitle: '💬 "Customer service" in a chat app',
        c2PageDesc: 'Your online order suddenly shows an "issue" and someone asks you to add them for a refund. Follow the scenario and make your choice.',
        c2Topbar: '💬 Shopping app message · "Customer service"',

        c3Eyebrow: 'Lesson 3 · AI face/voice-swap video scam',
        c3PageTitle: '🎥 Your "son" on a video call',
        c3PageDesc: 'The video call is blurry and choppy — is that really your family member? Follow the scenario and make your choice.',
        c3CallName: 'Son',
        c3CallStatus: 'Video call in progress · 00:14',
        c3CallVideo: '📶 Weak signal — video is blurry and glitchy',

        nextBtn: 'Next →',
        continueBtn: 'Continue →',
        retryBtn: 'Choose again',
        defaultPrompt: 'What would you do?',
        correctTitle: '✅ Good call',
        wrongTitle: '⚠️ That\'s risky',
        homeBtn: 'Back to home',
        scorePrefix: 'You correctly spotted',
        scoreSuffix: 'risk points',

        /* ── Home page: survey flow states ── */
        homeLockedTitle: 'Before you start, please take a short survey',
        homeLockedDesc: 'This helps us understand how you feel right now. After the lessons, you\'ll take the same short survey again so you can see how things changed.',
        homeLockedBtn: 'Start the survey →',
        homeStepPre: 'Step 1: Before-you-start survey',
        homeStepPreDoneLabel: '✅ Done',
        homeProgressTitle: 'Your progress',
        homeProgressDesc: 'Once you finish all three lessons, we\'ll prompt you to take the same short survey again.',
        homePostPromptTitle: '🎉 You\'ve finished all three lessons!',
        homePostPromptDesc: 'Take the same 2-minute survey again to see how your answers have changed.',
        homePostPromptBtn: 'Start the follow-up survey →',
        homeReportTitle: '📊 Your report is ready',
        homeReportDesc: 'See how your judgment and confidence changed before and after the lessons.',
        homeReportBtn: 'View my report →',
        homeLessonLocked: 'Please complete the before-you-start survey first',
        homeDoneBadge: 'Done',

        /* ── Survey shared UI ── */
        surveyBackHome: '← Back to home',
        surveyRequired: '(optional)',
        optSkip: 'Prefer not to answer',
        likertSkip: 'Prefer not to answer',
        likert1: 'Strongly disagree',
        likert2: 'Disagree',
        likert3: 'Neutral',
        likert4: 'Agree',
        likert5: 'Strongly agree',
        surveySubmitBtn: 'Submit',
        surveySelectPrompt: '(select all that apply)',
        listSep: ', ',

        /* ── Pre-survey ── */
        preSurveyTag: 'Before you start',
        preSurveyTitle: 'Before-you-start survey',
        preSurveyDesc: 'This isn\'t a test — there are no right or wrong answers, and you can skip any question. Once you\'re done, you can start the three short lessons. Takes about 3–5 minutes.',
        preSecA: 'A. About you',
        preSecB: 'B. How you feel right now (1–5)',
        preSecBDesc: 'Choose the option that best matches how you usually feel.',

        pA1_q: 'A1. What is your age group?',
        pA1_o1: '50–59', pA1_o2: '60–69', pA1_o3: '70–79', pA1_o4: '80+',

        pA2_q: 'A2. Which devices do you use regularly? (select all that apply)',
        pA2_o1: 'Smartphone', pA2_o2: 'Tablet', pA2_o3: 'Computer', pA2_o4: 'None of these',

        pA3_q: 'A3. Do you regularly stay in touch with younger family members (children, grandchildren)?',
        pA3_o1: 'Often', pA3_o2: 'Not often', pA3_o3: 'Rarely or never',

        pA4_q: 'A4. When you get an unexpected message or call, who do you usually turn to first? (select all that apply)',
        pA4_o1: 'A family member', pA4_o2: 'A friend', pA4_o3: 'My bank or a service provider', pA4_o4: 'I handle it myself', pA4_o5: 'Other',

        pA5_q: 'A5. Before today, had you heard of a scam where someone pretends to be a family member in trouble?',
        pA5_o1: 'Yes, I had', pA5_o2: 'No, I hadn\'t', pA5_o3: 'Not sure',

        pA6_q: 'A6. Have you personally ever received a message or call claiming a family member was in trouble and needed urgent money?',
        pA6_o1: 'Yes', pA6_o2: 'No', pA6_o3: 'Not sure',

        pA7_q: 'A7. Has someone close to you (family or friend) ever told you they experienced a similar scam?',
        pA7_o1: 'Yes', pA7_o2: 'No', pA7_o3: 'Not sure',

        preSurveySubmitBtn: 'Submit and start learning →',
        preSurveyDoneMsg: 'Thank you! Your answers are saved — you can now start Lesson 1.',

        /* ── Shared 6-item scale (used in both pre and post surveys — wording must stay identical) ── */
        lQ1: 'When I get an urgent message or call, I can pause and think before deciding what to do.',
        lQ2: 'Before transferring money or sharing personal information after an unexpected request, I check with someone I trust first.',
        lQ3: 'If a message looks like it\'s from a family member, I tend to trust it right away.',
        lQ4: 'When a message feels urgent, I find it hard to slow down and consider other explanations.',
        lQ5: 'I worry about making a mistake when using email, text messages, or online services.',
        lQ6: 'I avoid some digital communication because I\'m worried about scams.',

        /* ── Post-survey ── */
        postSurveyTag: 'Course complete',
        postSurveyTitle: 'Follow-up survey',
        postSurveyDesc: 'These are the same 6 questions from before, so we can see how your answers changed after the three lessons. Takes about 2 minutes.',
        postSecB: 'How you feel right now (1–5)',
        postQ1_q: 'After the lessons, which type of scam do you feel more confident spotting? (select all that apply)',
        postQ1_o1: 'Fake-relative text messages', postQ1_o2: '"Customer service" in chat apps', postQ1_o3: 'AI face/voice-swap video calls', postQ1_o4: 'Still not very confident',
        postSurveySubmitBtn: 'Submit and view my report →',

        /* ── Report page ── */
        reportTag: 'My learning report',
        reportTitle: 'Before & after comparison report',
        reportDesc: 'Here\'s how your answers to the same short survey compare before and after the three lessons, just for your own reference.',
        reportNoData: 'Data isn\'t complete yet — please finish the before-you-start survey, all three lessons, and the follow-up survey.',
        reportGoHome: 'Back to home',
        reportConstructVerify: 'Willingness to verify first',
        reportConstructVerifyDesc: 'A higher score means you\'re more likely to pause and verify before acting.',
        reportConstructPressure: 'Susceptibility to urgency',
        reportConstructPressureDesc: 'A higher score means urgent, seemingly-familiar messages are more likely to rush you. A lower score after the lessons is a good sign.',
        reportConstructAnxiety: 'Worry about digital communication',
        reportConstructAnxietyDesc: 'A higher score means you feel more anxious using your phone or online services.',
        reportBefore: 'Before',
        reportAfter: 'After',
        reportLessonScores: 'Your lesson quiz results',
        reportLessonScoreLabel: 'correct',
        reportOverallScore: 'Overall correct',
        reportConfidentTypes: 'Scams you feel more confident spotting now:',
        reportThanks: 'Thank you for completing the lessons and the survey!',

        /* ── Sandbox: home entry ── */
        homeEnterBtn: '🏠 Step inside and explore',
        homeEnterDesc: 'Walk around the house like a game and tap the phone, computer and tablet. Every "unexpected message" is yours to judge.',
        homeCheckTitle: 'Three things that will happen at home today',
        homeContinueBtn: '🏠 Back to the house',
        homeModeLabel: 'Choose how to play',
        homeModeSandbox: '🏠 Explore the house',
        homeModeSandboxSub: 'Walk around and tap items to start a scene',
        homeModeClassic: '💬 Chat mode',
        homeModeClassicSub: 'Lesson by lesson, as a conversation',
        homeModeNote: 'Progress is shared between both modes, so you can switch any time.',
        homeClassicDesc: 'Classic mode: go through the three lessons in order, like reading chats on your phone. Every step is your choice.',
        homeClassicStart: '💬 Start Lesson 1',
        homeClassicNext: '💬 Continue to the next lesson',
        homeClassicReview: '💬 Go through again from Lesson 1',
        homeClassicListTitle: 'The three lessons (tap to open)',

        /* ── Sandbox: scene and UI ── */
        sbTitle: 'Home exploration',
        sbQuestTitle: 'Things to do today',
        sbQuestPhone: 'Check the new message on your phone',
        sbQuestLaptop: 'Check the message on your computer',
        sbQuestTablet: 'Answer the call on your tablet',
        sbTipsLabel: '💡 Everyday tips',
        sbHelp: 'Click the floor to walk · Arrow keys / WASD to move · Space or click an item to interact',
        sbActLook: 'Check',
        sbActUse: 'Look at',
        sbKeySpace: 'Space',
        sbObjPhone: 'Phone',
        sbObjLaptop: 'Computer',
        sbObjTablet: 'Tablet',
        sbObjTv: 'TV',
        sbObjFridge: 'Fridge',
        sbObjPhoto: 'Family photo',
        sbBackBtn: 'Back to the house →',
        sbClose: '✕ Leave for now',
        sbGotIt: 'Got it',
        sbWelcomeTitle: 'Welcome home',
        sbWelcomeText: 'This is a made-up house. Today your phone, computer and tablet may receive "unexpected messages". Click the floor to walk (or use the arrow keys), get close to an item, and click it to see what happens. You can look at other things around the house too — some have tips.',
        sbTipTvTitle: '📺 News on TV',
        sbTipTvText: 'The news says: "Scams pretending to be relatives or customer service are on the rise. Reminder: before sending any money, call your family member directly to confirm first."',
        sbTipFridgeTitle: '🧲 Note on the fridge',
        sbTipFridgeText: 'A note on the fridge lists your children\'s real phone numbers. Good habit: keep family numbers somewhere visible. If a message says "I\'m in trouble", call that number — not a new number given in the message.',
        sbTipPhotoTitle: '🖼️ Family photo',
        sbTipPhotoText: 'Looking at the family photo, why not agree on a "family code word" that only you know? If a video call or phone call seems suspicious, ask for the code word — if they can\'t answer, don\'t trust it.',
        sbAllDoneTitle: '🎉 All three things are handled!',
        sbAllDoneText: 'You practised the three common scams: text message, chat app and video call. You can keep looking around the house, or take the follow-up survey to see how your answers changed.',
        sbAllDoneStay: 'Keep exploring',
        sbAllDoneSurvey: 'Take the follow-up survey →',
        sbSurveyBtn: '📝 Take the follow-up survey',
        sbFontLabel: 'Text',
        sbMapLabel: 'Map',
        sbFontDown: 'Smaller text',
        sbFontUp: 'Larger text',
        sbMapDown: 'Zoom out',
        sbMapUp: 'Zoom in',
        sbReportBtn: '📊 View my report',
    }
};

const LANG_KEY = 'fraudgame_lang';

function getLang() {
    const saved = localStorage.getItem(LANG_KEY);
    return I18N[saved] ? saved : 'zh';
}

function setLang(lang) {
    if (!I18N[lang]) return;
    localStorage.setItem(LANG_KEY, lang);
    location.reload();
}

function t(key) {
    const dict = I18N[getLang()] || I18N.zh;
    return dict[key] !== undefined ? dict[key] : key;
}

function scoreText(correct, total) {
    return `${t('scorePrefix')} ${correct} / ${total} ${t('scoreSuffix')}`;
}

function applyI18n() {
    document.documentElement.lang = getLang() === 'en' ? 'en' : 'zh-CN';

    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        el.innerHTML = t(el.dataset.i18nHtml);
    });
}

function renderLangSwitcher(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const lang = getLang();
    el.innerHTML = `
        <button class="lang-btn${lang === 'zh' ? ' active' : ''}" onclick="setLang('zh')">中文</button>
        <button class="lang-btn${lang === 'en' ? ' active' : ''}" onclick="setLang('en')">EN</button>
    `;
}

function initI18n(langSwitchId) {
    applyI18n();
    if (langSwitchId) renderLangSwitcher(langSwitchId);
}
