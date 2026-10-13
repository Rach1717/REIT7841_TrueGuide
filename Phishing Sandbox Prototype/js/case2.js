/* ============================================================
   案例二：App聊天冒充"客服"退款诈骗
   Case 2: Fake "customer service" refund scam in an app chat
   ============================================================ */

const CASE2_SCRIPT = {
    zh: [
        { type: 'info', text: '情景：你前几天在购物App上买了东西，今天收到一条聊天消息。' },

        { type: 'msg', from: 'them',
          text: '【平台客服】您好，系统检测到您的订单存在异常，商品已下架，将为您办理退款，请添加下方"客服"微信办理，逾期未处理将影响您的账户信用分。' },

        { type: 'choice',
          prompt: '你会怎么做？',
          options: [
            { text: '赶紧添加对方，免得影响信用分', correct: false,
              feedback: '正规平台不会让你跑到微信、QQ等站外渠道去"私下办理"退款，更不会用"影响信用分"这种话来吓唬你。这是诈骗的典型话术。' },
            { text: '打开购物App自己的订单页面，查看是否真的有异常，或联系官方客服核实', correct: true,
              feedback: '完全正确！凡是涉及钱款的消息，都应该回到官方App或官方客服热线核实，不要相信别人主动发来的"客服"联系方式。' },
          ] },

        { type: 'info', text: '你打开购物App查看订单，一切正常，没有任何"异常下架"的提示，这条消息也不是平台官方发送的。' },

        { type: 'msg', from: 'them',
          text: '【"客服"】亲，这边帮您办理原路退款，需要先验证一下您的银行卡，麻烦点开下面的链接，填写卡号，并把手机收到的验证码告诉我核对一下～' },

        { type: 'choice',
          prompt: '对方发来链接，要求填写银行卡号并提供收到的验证码，你会？',
          options: [
            { text: '照做，反正只是"验证"一下', correct: false,
              feedback: '短信验证码是确认转账、支付的最后一道关卡，一旦告诉对方，钱可能马上就从你的卡里被转走！退款根本不需要你提供任何验证码。' },
            { text: '拒绝提供卡号和验证码，不点开陌生链接，并拉黑、举报该账号', correct: true,
              feedback: '判断正确！任何时候都不要把验证码告诉别人，也不要点击陌生人发来的链接。退款只会原路自动退回，不需要你填写任何信息。' },
          ] },

        { type: 'summary',
          title: '本课小结：App聊天"客服"退款诈骗',
          points: [
            '正规平台的退款、赔付，都会在App内部完成，不会要求你添加站外的私人联系方式。',
            '"信用分""账号异常"等说法，是为了让你紧张，从而听话照做，遇到这种话术要先冷静。',
            '收到的短信验证码，任何情况下都不要告诉别人，包括自称"客服""银行""公检法"的人。',
            '涉及钱款的消息，永远以App或官方客服热线里查到的信息为准，不轻信聊天里发来的链接和账号。'
          ],
          nextHref: 'identitycase3.html',
          nextLabel: '下一课：视频通话诈骗 →' }
    ],

    en: [
        { type: 'info', text: 'Scenario: You bought something on a shopping app a few days ago. Today you receive a chat message.' },

        { type: 'msg', from: 'them',
          text: '[Platform Customer Service] Hello, our system detected an issue with your order and the item has been delisted. We\'ll process your refund — please add the "customer service" contact below to handle it. Unresolved issues may affect your account credit score.' },

        { type: 'choice',
          prompt: 'What would you do?',
          options: [
            { text: 'Add them right away, so your credit score isn\'t affected', correct: false,
              feedback: 'A legitimate platform will never ask you to move to an outside app to "privately" handle a refund, and it certainly won\'t threaten your "credit score" to scare you into acting. This is a classic scam script.' },
            { text: 'Open the shopping app\'s own order page to check if there really is an issue, or contact official customer support to verify', correct: true,
              feedback: 'Exactly right! Any message involving money should be verified through the official app or official support hotline — don\'t trust a "customer service" contact that someone sends you directly.' },
          ] },

        { type: 'info', text: 'You open the shopping app and check your order — everything is normal, there\'s no "delisted" notice at all, and this message wasn\'t sent by the platform.' },

        { type: 'msg', from: 'them',
          text: '["Customer service"] Hi, we\'ll process your refund to the original payment method. First we need to verify your bank card — please open the link below, enter your card number, and tell us the verification code you receive so we can confirm it.' },

        { type: 'choice',
          prompt: 'They send a link and ask for your bank card number plus the verification code you receive. What do you do?',
          options: [
            { text: 'Go along with it — it\'s just a "verification"', correct: false,
              feedback: 'A verification code is the final checkpoint before a transfer or payment goes through. The moment you share it, money can be taken from your card immediately! A refund never requires you to provide any verification code.' },
            { text: 'Refuse to give the card number or code, don\'t click the unfamiliar link, and block/report the account', correct: true,
              feedback: 'Correct! Never share a verification code with anyone, and never click links from strangers. A refund is returned automatically to your original payment method — it never requires you to submit any information.' },
          ] },

        { type: 'summary',
          title: 'Lesson recap: fake "customer service" refund scam',
          points: [
            'Refunds and compensation from a real platform always happen inside the app — you\'ll never be asked to add an outside personal contact.',
            'Phrases like "credit score" or "account issue" are designed to make you anxious so you comply without thinking — stay calm when you hear them.',
            'Never share a verification code you receive by text with anyone, even someone claiming to be "customer service," a "bank," or "the police."',
            'For anything involving money, always trust only what you find in the official app or official support hotline — not links or accounts sent to you in chat.'
          ],
          nextHref: 'identitycase3.html',
          nextLabel: 'Next: Video call scam →' }
    ]
};
