/* ============================================================
   案例三：AI换脸换声"儿子"视频通话诈骗
   Case 3: AI face/voice-swap "son" video call scam
   ============================================================ */

const CASE3_SCRIPT = {
    zh: [
        { type: 'info', text: '情景：你正在家里，手机突然弹出一个视频通话请求，来电显示是"儿子"，你接通了。' },

        { type: 'msg', from: 'them',
          text: '（画面有点卡顿、模糊，只能看清几秒钟的脸和挥手动作）"妈，我朋友生意周转，急需用10万块钱，今晚必须到账，你先帮我转到这个账户，我明天就还你，这边信号不好，我先挂了。"' },

        { type: 'choice',
          prompt: '你会怎么做？',
          options: [
            { text: '看到是儿子的脸、听到是儿子的声音，肯定没问题，赶紧转账', correct: false,
              feedback: '现在的AI换脸、换声技术，只需要几秒钟的素材就能伪造出逼真的视频和声音。画面模糊卡顿、通话时间很短，恰恰是骗子用来掩盖破绽的常见手法。' },
            { text: '要求继续视频多聊一会儿，问一些只有家人才知道的私人问题，同时用另一个电话联系儿子本人核实', correct: true,
              feedback: '非常好！骗子通常会找"信号不好""马上开会"等借口尽快挂断，避免长时间通话露馅。多问只有本人才知道的细节，并换一个独立的渠道核实，是识破AI换脸换声诈骗的关键方法。' },
          ] },

        { type: 'info', text: '你挂断视频后，拨打了儿子原来的手机号码。儿子接听后表示：根本没有这回事，也没有给你打过视频电话，手机也一直在自己身边。' },

        { type: 'choice',
          prompt: '过了一会，同一个号码又打来视频，画面中的"儿子"说"银行卡被冻结了，麻烦你帮我转到朋友账户救急"，你会？',
          options: [
            { text: '这次态度更急了，应该是真的出事了，先转再说', correct: false,
              feedback: '骗子发现第一次没得手，往往会编造新的理由继续尝试，语气越是急迫，越应该保持怀疑。已经核实过本人没有这回事，就不要因为对方换个说法就动摇。' },
            { text: '直接挂断，不转账，并保留通话记录准备举报', correct: true,
              feedback: '完全正确！已经通过独立渠道核实过是假冒的，之后无论对方用什么新理由继续联系，都应该直接挂断、拒绝转账，并保留证据以便举报。' },
          ] },

        { type: 'summary',
          title: '本课小结：AI换脸换声视频通话诈骗',
          points: [
            '视频、声音都可能被AI伪造，画面模糊卡顿、通话时间很短是常见的伪装手法。',
            '只要涉及大额转账，无论视频里的人看起来多像家人，都要通过另一个独立渠道二次核实。',
            '可以现场提问只有本人才知道的私人问题（比如小时候的事情、家里的暗号），来验证对方身份。',
            '对方越是催促"马上""立刻""不然就晚了"，越要冷静下来，先核实、再决定，不要被情绪牵着走。'
          ],
          nextHref: 'home.html',
          nextLabel: '完成全部课程 · 返回首页 →' }
    ],

    en: [
        { type: 'info', text: 'Scenario: You\'re at home when your phone suddenly shows an incoming video call. The caller ID says "Son," and you answer.' },

        { type: 'msg', from: 'them',
          text: '(The video is a little choppy and blurry — you only catch a few seconds of his face and a wave.) "Mom, a friend of mine needs cash for his business, we need $15,000 tonight. Can you transfer it to this account first, I\'ll pay you back tomorrow — the signal here is bad, I have to go."' },

        { type: 'choice',
          prompt: 'What would you do?',
          options: [
            { text: 'That\'s clearly his face and his voice, it must be fine — send the money right away', correct: false,
              feedback: 'Today\'s AI face- and voice-swap technology only needs a few seconds of sample video or audio to create a convincing fake. A blurry, choppy video and a very short call are exactly the kind of cover a scammer uses to hide the flaws.' },
            { text: 'Ask to keep video-chatting a bit longer, ask a private question only a family member would know, and call your son\'s real number on another phone to check', correct: true,
              feedback: 'Great choice! Scammers usually make an excuse like "bad signal" or "I have to run to a meeting" to hang up quickly before anything gives them away. Asking for private details only the real person would know, and verifying through a separate channel, is the key to catching an AI face/voice-swap scam.' },
          ] },

        { type: 'info', text: 'You hang up and call your son\'s real number. He answers and says none of this happened — he never made a video call to you, and his phone has been with him the whole time.' },

        { type: 'choice',
          prompt: 'A little later, the same number calls again by video. The "son" on screen says, "My bank card just got frozen, please send money to my friend\'s account to help me out." What do you do?',
          options: [
            { text: 'He sounds even more desperate this time, so it must be real — send the money', correct: false,
              feedback: 'When a scam doesn\'t work the first time, scammers often invent a new reason and try again — the more urgent they sound, the more suspicious you should be. You\'ve already confirmed it wasn\'t really him, so don\'t let a new story change your mind.' },
            { text: 'Hang up immediately, don\'t send any money, and keep the call log in case you need to report it', correct: true,
              feedback: 'Exactly right! Once you\'ve verified through an independent channel that it was fake, hang up and refuse to send money no matter what new excuse they come up with — and keep the evidence so you can report it.' },
          ] },

        { type: 'summary',
          title: 'Lesson recap: AI face/voice-swap video call scam',
          points: [
            'Both video and voice can be faked with AI. A blurry, choppy video and a very short call are common signs of this cover-up.',
            'For any large money transfer, no matter how much the person on screen looks or sounds like family, always verify a second time through a separate, independent channel.',
            'You can ask a private question on the spot that only the real person would know — a childhood memory or a family in-joke — to check their identity.',
            'The more someone pushes "right now," "immediately," or "it\'ll be too late," the more you should slow down, verify first, and not let the urgency make the decision for you.'
          ],
          nextHref: 'home.html',
          nextLabel: 'Finish the course · Back to home →' }
    ]
};
