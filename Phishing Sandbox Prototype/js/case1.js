/* ============================================================
   案例一：陌生号码短信冒充"孙子出车祸"
   Case 1: A stranger's text pretending to be your "grandson" in a car accident
   ============================================================ */

const CASE1_SCRIPT = {
    zh: [
        { type: 'info', text: '情景：今天上午，你收到一条来自陌生号码的短信。' },

        { type: 'msg', from: 'them',
          text: '奶奶，我是小宇，我手机摔坏了，这是同事的手机借我用一下。我刚才出车祸了，现在在医院，医生说要先交2万块钱押金才能安排手术，你能先帮我转一下吗？我这就把账号发给你。' },

        { type: 'choice',
          prompt: '你会怎么做？',
          options: [
            { text: '太吓人了，赶紧问要转到哪个账户，先转钱再说', correct: false,
              feedback: '这是诈骗最常用的手法——用"出事了""马上要手术"制造紧张情绪，让你来不及思考就转账。真遇到意外，医院一般会先救治，不会要求家属先转账才肯做手术。' },
            { text: '先挂断这条短信，拨打孙子原来的手机号码，或联系家里其他人核实情况', correct: true,
              feedback: '非常好！遇到"亲人出事"的消息，第一反应应该是通过原本熟悉的联系方式主动核实，而不是用短信里提供的新号码回拨，更不能直接转账。' },
            { text: '回复短信问一句"真的是你吗"', correct: false,
              feedback: '骗子既然敢在短信里冒充，当然也会在短信里继续回答"是的是我，别问了赶紧转"。文字聊天没办法验证身份，必须换一个你自己确认过的可靠渠道，比如拨打孙子原来的手机号码。' },
          ] },

        { type: 'info', text: '你拨打了孙子原来的手机号码，响了几声后，孙子接了电话，一切正常——手机没有摔坏，也没有出车祸。' },

        { type: 'choice',
          prompt: '对方又发来一条消息："阿姨/奶奶，账号是××银行 6222xxxx，麻烦快点，医生在催了！"这时你会？',
          options: [
            { text: '医生都催了，先转一部分应急', correct: false,
              feedback: '"再不转就来不及了"正是骗子故意制造的催促感，目的就是不让你有时间去核实。任何要求"立刻""马上"转账的消息都要先停下来，通过其他渠道核实清楚再说。' },
            { text: '不予理会，保留证据，并提醒家人防范同类短信', correct: true,
              feedback: '完全正确！确认对方不是自己的家人后，就不要再回应、更不要转账。可以截图保留证据，并提醒家里其他老人也注意防范。' },
          ] },

        { type: 'summary',
          title: '本课小结：短信冒充亲人诈骗',
          points: [
            '陌生号码 + "我出事了"，本身就是高度可疑的信号。',
            '骗子会用"急救""马上手术""再不转就晚了"等说法制造紧迫感，让你来不及思考。',
            '任何要求转账的消息，无论听起来多么紧急，都要先通过你自己保存的、原本熟悉的联系方式核实，不要用短信里提供的新号码。',
            '身份无法在短信里验证，务必换一个可靠渠道（打电话、当面确认）再做决定。'
          ],
          nextHref: 'identitycase2.html',
          nextLabel: '下一课：App聊天诈骗 →' }
    ],

    en: [
        { type: 'info', text: 'Scenario: This morning, you receive a text message from an unknown number.' },

        { type: 'msg', from: 'them',
          text: 'Grandma, it\'s Alex. My phone broke, I\'m borrowing a coworker\'s phone. I just had a car accident and I\'m at the hospital — the doctor says they need a $3,000 deposit before they can operate. Can you send it now? I\'ll text you the account details.' },

        { type: 'choice',
          prompt: 'What would you do?',
          options: [
            { text: 'This sounds scary — ask which account to send the money to and transfer it right away', correct: false,
              feedback: 'This is a classic scam tactic — using "I\'m hurt" and "surgery right now" to create panic so you transfer money before you can think it through. In a real emergency, hospitals treat patients first; they don\'t require family to pay a deposit before operating.' },
            { text: 'Hang up on the text, call your grandson\'s usual phone number, or check with another family member first', correct: true,
              feedback: 'Great choice! When you get a message that a family member is in trouble, your first move should be to confirm through a number or contact you already know and trust — never call back the new number in the text, and never send money first.' },
            { text: 'Reply to the text asking "is this really you?"', correct: false,
              feedback: 'If a scammer is already impersonating your grandson by text, they\'ll happily reply "yes it\'s me, please hurry." Text messages can\'t prove someone\'s identity — you need to switch to a channel you already trust, like calling the real phone number you have saved.' },
          ] },

        { type: 'info', text: 'You call your grandson\'s usual number. After a few rings he answers — everything is fine. His phone isn\'t broken and there was no accident.' },

        { type: 'choice',
          prompt: 'The unknown number texts again: "Auntie/Grandma, the account is XX Bank 6222xxxx, please hurry, the doctor is waiting!" What do you do?',
          options: [
            { text: 'The doctor is waiting — send part of the money just in case', correct: false,
              feedback: '"Hurry or it\'ll be too late" is exactly the kind of pressure scammers create on purpose, so you don\'t have time to check the story. Any message demanding you transfer money "right now" is a reason to stop and verify through another channel first.' },
            { text: 'Ignore it, keep the messages as evidence, and warn other family members about this kind of text', correct: true,
              feedback: 'Exactly right! Once you\'ve confirmed the sender isn\'t really your family member, stop responding and never send money. Take screenshots as evidence and let other older relatives know to watch out for the same trick.' },
          ] },

        { type: 'summary',
          title: 'Lesson recap: fake-relative text scam',
          points: [
            'An unknown number plus "I\'m in trouble" is already a big warning sign on its own.',
            'Scammers create urgency with phrases like "emergency," "surgery right now," or "it\'ll be too late" so you act before you think.',
            'No matter how urgent a money request sounds, always verify it through a contact method you already know and trust — not a new number given in the message.',
            'Identity can\'t be confirmed over text. Always switch to a reliable channel — a phone call or an in-person check — before deciding.'
          ],
          nextHref: 'identitycase2.html',
          nextLabel: 'Next: App chat scam →' }
    ]
};
