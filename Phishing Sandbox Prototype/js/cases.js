/* ============================================================
   TrueGuide 反诈小课堂 — 案例库
   ------------------------------------------------------------
   设计依据（见论文 Section 3）：
   · 四种骗术信号（four-cue framework, Espinoza [2]; Shang et al. [3]）
       identity  身份：让对方看起来是熟人或权威
       pressure  催促：制造紧迫，不给你时间想
       isolation 保密：叫你别告诉别人、别去核实
       transfer  钱财：把话题引向转账、礼品卡、验证码或账户
   · 每个案例只有一个决定："你会怎么做？" + 三个选项
       outcome: 'comply'  照做（转钱 / 给信息）       — 骗局中的错误
                'reply'   在同一渠道里追问 / 回拨对方号码 — 骗局中的错误
                'verify'  用自己已知的渠道核实          — 正确
                'trust'   正常回复（安全消息）          — 正确
                'flag'    把安全消息当骗局 / 因害怕而退缩 — 误判（false alarm）
   · 既有骗局（scam），也有家人朋友的正常消息（safe），
     因为论文发现"把真消息当成骗局"同样常见，会导致因怕被骗而远离数字服务 [5][6]。
   · 共 12 个任务：6 个骗局 + 6 条安全消息，对应数据表里每轮 12 题（6 骗局 + 6 安全）。
   · 保密信号是最常被忽略的信号，所以 6 个骗局里有 5 个包含它。
   · 主题是祖父母诈骗：所有案例都围绕孙辈、子女和亲戚展开。
   ------------------------------------------------------------
   每个案例：
   { id, device:'phone'|'computer'|'tablet', channel:'sms'|'call'|'email'|'video',
     kind:'scam'|'safe', cues:[...],
     zh/en: { contact, avatar, preview, header?, steps:[...],
              cueNotes:{cue:证据} 或 safeNote, recap:{title, points}, source } }
   steps 只有 info / msg / choice 三种，choice 有且只有一个。
   ============================================================ */

const CUE_IDS = ['identity', 'pressure', 'isolation', 'transfer'];

const CUES = {
    identity: {
        icon: '🪪',
        zh: { name: '身份', long: '身份信号', desc: '让你以为对方是熟人或权威' },
        en: { name: 'Identity', long: 'Identity cue', desc: 'Makes the sender seem familiar or official' },
    },
    pressure: {
        icon: '⏰',
        zh: { name: '催促', long: '催促信号', desc: '制造紧急，不给你时间想' },
        en: { name: 'Pressure', long: 'Pressure cue', desc: 'Creates urgency so you act before you think' },
    },
    isolation: {
        icon: '🤫',
        zh: { name: '保密', long: '保密信号', desc: '叫你别告诉别人、别去核实' },
        en: { name: 'Isolation', long: 'Isolation cue', desc: 'Tells you to keep it secret or not check with others' },
    },
    transfer: {
        icon: '💸',
        zh: { name: '钱财', long: '钱财信号', desc: '把话题引向转账、礼品卡、验证码或账户' },
        en: { name: 'Transfer', long: 'Transfer cue', desc: 'Steers you towards money, gift cards, codes or account access' },
    },
};

const CHANNELS = {
    sms:   { icon: '💬', zh: '短信', en: 'Text message' },
    call:  { icon: '📞', zh: '电话', en: 'Phone call' },
    email: { icon: '✉️', zh: '邮件', en: 'Email' },
    video: { icon: '🎥', zh: '视频通话', en: 'Video call' },
};

const DEVICES = {
    phone:    { icon: '📱', zh: '手机', en: 'Phone' },
    computer: { icon: '💻', zh: '电脑', en: 'Computer' },
    tablet:   { icon: '📲', zh: '平板', en: 'Tablet' },
};

const CASES = [
    /* ── 1. 短信冒充孙辈（原第一课，补充保密信号）── */
    {
        id: 'gs-sms', device: 'phone', channel: 'sms', kind: 'scam',
        cues: ['identity', 'pressure', 'isolation', 'transfer'],
        zh: {
            contact: '未知号码 138****2071', avatar: '❓', preview: '奶奶，我是小宇，手机摔坏了……',
            steps: [
                { type: 'info', text: `上午十点，你的手机收到一条陌生号码的短信。` },
                { type: 'msg', from: 'them', text: `奶奶，我是小宇，手机摔坏了，借同事的手机发的。我刚出了车祸，人在医院，医生说要先交2万押金才能手术。你先帮我转一下好吗？千万别告诉我爸妈，他们知道了会急死的，等我出院了自己跟他们说。` },
                { type: 'choice', prompt: `你会怎么做？`, options: [
                    { outcome: 'comply', correct: false, text: `吓坏了，赶紧问他要转到哪个账户`,
                      feedback: `先别急。"出车祸""马上手术"是为了让你慌，来不及想。真正的医院会先救人，不会让家属先转账才做手术。` },
                    { outcome: 'verify', correct: true, text: `先不回复，用自己手机里存的号码打给小宇，或者打给他爸妈问问`,
                      feedback: `做得好！用你自己存的号码核实，是最可靠的办法。电话打过去，小宇好好的——这是一条冒充短信。` },
                    { outcome: 'reply', correct: false, text: `回短信问一句："真的是你吗？"`,
                      feedback: `骗子在短信里当然会回"是我是我，快点"。在对方找你的同一个渠道里，是问不出真假的，要换一个你自己确认过的渠道。` },
                ] },
            ],
            cueNotes: {
                identity: `自称"小宇"，却用陌生号码，还解释"手机摔坏了"`,
                pressure: `"刚出车祸""要先交押金才能手术"`,
                isolation: `"千万别告诉我爸妈"——不让你找人核实`,
                transfer: `"先交2万押金"，让你转账`,
            },
            recap: { title: `小结：短信冒充孙辈`, points: [
                `陌生号码 + "我出事了"，本身就要警惕。`,
                `"别告诉爸妈"不是孩子不好意思，而是骗子不想让你去核实。`,
                `任何要钱的消息，都用你自己存的号码打回去确认。`,
            ] },
            source: `Espinoza (2024) 祖父母诈骗案例研究 [2]；FBI 老年诈骗报告 (2024) [1]`,
        },
        en: {
            contact: 'Unknown number (555) 0142', avatar: '❓', preview: 'Grandma, it’s Alex. My phone broke…',
            steps: [
                { type: 'info', text: `At 10 a.m., a text arrives from a number you don’t know.` },
                { type: 'msg', from: 'them', text: `Grandma, it’s Alex. My phone broke so I’m using a coworker’s. I was in a car accident and I’m at the hospital — they need a $3,000 deposit before they can operate. Can you send it now? Please don’t tell Mom and Dad, they’ll freak out. I’ll tell them myself once I’m out.` },
                { type: 'choice', prompt: `What would you do?`, options: [
                    { outcome: 'comply', correct: false, text: `That’s terrifying — ask which account to send the money to`,
                      feedback: `Take a breath first. “Accident” and “surgery right now” are there to make you panic before you can think. Hospitals treat patients first; they don’t make family pay before operating.` },
                    { outcome: 'verify', correct: true, text: `Don’t reply. Call Alex on the number saved in your phone, or call his parents`,
                      feedback: `Well done! Calling a number you already have saved is the most reliable check. Alex picks up and he’s fine — the text was fake.` },
                    { outcome: 'reply', correct: false, text: `Text back: “Is this really you?”`,
                      feedback: `A scammer will simply reply “Yes it’s me, please hurry.” You can’t check who someone is on the same channel they contacted you on — switch to one you already trust.` },
                ] },
            ],
            cueNotes: {
                identity: `Says he’s “Alex” but writes from an unknown number, with a “broken phone” excuse`,
                pressure: `“Car accident”, “they need it before they can operate”`,
                isolation: `“Please don’t tell Mom and Dad” — stops you from checking`,
                transfer: `“$3,000 deposit” — asks you to send money`,
            },
            recap: { title: `Recap: a text from a fake grandchild`, points: [
                `An unknown number plus “I’m in trouble” is already a warning sign.`,
                `“Don’t tell your parents” is not embarrassment — it is the scammer stopping you from checking.`,
                `For any request for money, call back on a number you already have saved.`,
            ] },
            source: `Espinoza (2024) grandparent-scam case study [2]; FBI Elder Fraud Report (2024) [1]`,
        },
    },

    /* ── 2. 孙辈"新邮箱"：出国遇险要购物卡 ── */
    {
        id: 'stranded-email', device: 'computer', channel: 'email', kind: 'scam',
        cues: ['identity', 'pressure', 'isolation', 'transfer'],
        zh: {
            contact: '小宇（新邮箱）', avatar: '✉️', preview: '奶奶，急事，请帮帮我',
            header: { from: '小宇 <xiaoyu.travel2024@mail.com>', subject: '奶奶，急事，请帮帮我' },
            steps: [
                { type: 'info', text: `晚上，你的电脑收到一封邮件，发件人自称孙子小宇，但这个邮箱地址你从没见过。` },
                { type: 'msg', from: 'them', text: `奶奶，我是小宇，这是我的新邮箱。我和同学在泰国旅游，护照和钱包都被偷了，大使馆说要先交罚款才能补办证件。你能帮我买3000元的购物卡，把卡号和密码拍照发给我吗？千万别告诉我爸妈，他们本来就不同意我出国玩。今天必须办好，明天的机票就要过期了。` },
                { type: 'choice', prompt: `你会怎么做？`, options: [
                    { outcome: 'reply', correct: false, text: `回邮件问他："你小时候养的小狗叫什么名字？"`,
                      feedback: `问只有家人知道的问题是好办法，但答案可能被人从网上查到，对方也可能不回答、继续催你。在同一个邮箱里核实不保险，换一个你自己确认过的渠道最可靠。` },
                    { outcome: 'comply', correct: false, text: `赶紧去超市买购物卡，拍照发给他`,
                      feedback: `购物卡的卡号和密码一发出去，钱几分钟就会被花掉，追不回来。大使馆、罚款都不会让你用购物卡付钱。` },
                    { outcome: 'verify', correct: true, text: `不回邮件，先打小宇存在手机里的号码，打不通就问问他爸妈`,
                      feedback: `做得好！你打给小宇的妈妈，她说小宇正在学校上课，根本没出国。这封邮件是骗子冒充的。` },
                ] },
            ],
            cueNotes: {
                identity: `自称"小宇"，却用一个陌生的新邮箱`,
                pressure: `"今天必须办好""明天的机票就要过期了"`,
                isolation: `"千万别告诉我爸妈"`,
                transfer: `要你买购物卡，把卡号和密码发过去`,
            },
            recap: { title: `小结：冒充孙辈的"出国遇险"邮件`, points: [
                `"换了新邮箱、新号码" + "出事了要钱"，是冒充孙辈的典型开头。`,
                `让你用购物卡、礼品卡付钱的，都是骗局——正规机构不收购物卡。`,
                `"别告诉爸妈"的时候，恰恰最应该打给他爸妈。`,
            ] },
            source: `Espinoza (2024) 祖父母诈骗中的"在外遇险"情节 [2]；FBI (2024) 关于用礼品卡付款的警示 [1]`,
        },
        en: {
            contact: 'Alex (new email)', avatar: '✉️', preview: 'Grandma, it’s urgent, please help',
            header: { from: 'Alex <alex.travels2024@mail.com>', subject: 'Grandma, it’s urgent, please help' },
            steps: [
                { type: 'info', text: `In the evening an email arrives on your computer. The sender says he is your grandson Alex, but you have never seen this address.` },
                { type: 'msg', from: 'them', text: `Grandma, it’s Alex — this is my new email. I’m travelling in Thailand with friends and my passport and wallet were stolen. The embassy says I must pay a fine before they’ll issue new papers. Could you buy $500 of gift cards and send me photos of the card numbers and PINs? Please don’t tell Mom and Dad — they never wanted me to go. It has to be today; my flight tomorrow will expire.` },
                { type: 'choice', prompt: `What would you do?`, options: [
                    { outcome: 'reply', correct: false, text: `Email back: “What was the name of the puppy you had as a child?”`,
                      feedback: `Asking something only family would know is a good idea, but the answer may be found online, or they may dodge the question and keep pushing. Checking inside the same email thread isn’t safe — switch to a channel you already trust.` },
                    { outcome: 'comply', correct: false, text: `Hurry to the shop, buy the gift cards and send the photos`,
                      feedback: `Once gift card numbers and PINs are sent, the money is spent within minutes and can’t be recovered. Embassies and fines never accept gift cards.` },
                    { outcome: 'verify', correct: true, text: `Don’t reply. Call Alex on the number saved in your phone; if he doesn’t answer, call his parents`,
                      feedback: `Well done! Alex’s mum says he is in class at school and has not gone abroad at all. The email was from a scammer.` },
                ] },
            ],
            cueNotes: {
                identity: `Says he’s “Alex” but writes from a new, unfamiliar address`,
                pressure: `“It has to be today”, “my flight will expire”`,
                isolation: `“Please don’t tell Mom and Dad”`,
                transfer: `Asks for gift card numbers and PINs`,
            },
            recap: { title: `Recap: a fake grandchild “stranded abroad”`, points: [
                `“New email or number” plus “I’m in trouble, send money” is the classic opening of a grandparent scam.`,
                `Anyone asking you to pay with gift cards is a scammer — real organisations don’t take gift cards.`,
                `“Don’t tell Mom and Dad” is exactly when you should call Mom and Dad.`,
            ] },
            source: `Espinoza (2024) on the “stranded traveller” grandparent scam [2]; FBI (2024) warnings on gift-card payments [1]`,
        },
    },

    /* ── 3. 安全：孙女报平安 ── */
    {
        id: 'safe-grandkid-sms', device: 'phone', channel: 'sms', kind: 'safe', cues: [],
        zh: {
            contact: '孙女 小雨', avatar: '👧', preview: '奶奶，我到学校啦～',
            steps: [
                { type: 'info', text: `晚上八点，手机收到一条短信，发件人是你手机里存好的"孙女 小雨"。` },
                { type: 'msg', from: 'them', text: `奶奶，我到学校啦～路上很顺利。周六晚上我们视频哦，记得按时吃药，天冷多穿点！` },
                { type: 'choice', prompt: `你会怎么做？`, options: [
                    { outcome: 'flag', correct: false, text: `会不会是骗子？赶紧删掉，拉黑这个号码`,
                      feedback: `这次其实是真的孙女。谨慎是好事，但如果连家人的正常消息都不敢回，反而会和家人疏远。先看看有没有那四种信号再判断。` },
                    { outcome: 'trust', correct: true, text: `放心回复："好的，周六等你视频！"`,
                      feedback: `对！这条来自你存好的号码，说的事情和你们平时的安排一样，没有催你、没有让你保密，也没有要钱。可以放心回复。` },
                    { outcome: 'flag', correct: false, text: `以后短信一律不看不回，免得被骗`,
                      feedback: `因为怕被骗就不再用手机联系，会错过家人的关心和有用的信息。学会认出四种信号，就能放心地用。` },
                ] },
            ],
            safeNote: `来自你存好的联系人；内容和平时的安排一致；不催促、不保密、不要钱。`,
            recap: { title: `小结：认出真正的家人消息`, points: [
                `不是所有消息都是骗局。`,
                `来自存好的号码、没有那四种信号的消息，可以放心回复。`,
                `不必因为害怕被骗就不再用手机——会判断，才能用得安心。`,
            ] },
            source: `Button 等 (2025) 关于"怕被骗"的研究 [5]；Ge 等 (2025) 老年人数字排斥综述 [6]`,
        },
        en: {
            contact: 'Granddaughter Lily', avatar: '👧', preview: 'Grandma, I’m back at school!',
            steps: [
                { type: 'info', text: `At 8 p.m. a text arrives from “Granddaughter Lily”, a contact saved in your phone.` },
                { type: 'msg', from: 'them', text: `Grandma, I’m back at school! The trip was easy. Let’s video call on Saturday evening — remember to take your tablets, and wrap up warm!` },
                { type: 'choice', prompt: `What would you do?`, options: [
                    { outcome: 'flag', correct: false, text: `Could be a scammer — delete it and block the number`,
                      feedback: `This one really was your granddaughter. Being careful is good, but if you stop answering family, you lose touch with them. Check for the four cues before deciding.` },
                    { outcome: 'trust', correct: true, text: `Reply happily: “Lovely! Talk on Saturday.”`,
                      feedback: `Right! It comes from a number you saved, it matches your usual plans, and there is no rush, no secret and no money. Safe to reply.` },
                    { outcome: 'flag', correct: false, text: `Stop reading or answering texts altogether, just to be safe`,
                      feedback: `Giving up your phone out of fear means missing your family and useful news. Once you can spot the four cues, you can use it with confidence.` },
                ] },
            ],
            safeNote: `From a saved contact; matches your usual plans; no rush, no secret, no money.`,
            recap: { title: `Recap: recognising a real message from family`, points: [
                `Not every message is a scam.`,
                `A message from a saved number with none of the four cues is safe to answer.`,
                `You don’t have to give up your phone out of fear — knowing the signs lets you use it with confidence.`,
            ] },
            source: `Button et al. (2025) on fear of fraud [5]; Ge et al. (2025) on digital exclusion [6]`,
        },
    },

    /* ── 4. AI换脸换声视频（原第三课，补充保密信号）── */
    {
        id: 'ai-video', device: 'tablet', channel: 'video', kind: 'scam',
        cues: ['identity', 'pressure', 'isolation', 'transfer'],
        zh: {
            contact: '儿子', avatar: '🧑', preview: '视频来电',
            header: { name: '儿子', status: '视频通话中 · 00:14', note: '📶 信号不稳定，画面模糊卡顿' },
            steps: [
                { type: 'info', text: `下午，平板上弹出视频来电，显示是"儿子"。你接通了。` },
                { type: 'msg', from: 'them', text: `（画面很模糊，只看得清几秒钟的脸）"妈，我朋友生意周转急用10万，今晚必须到账。你先转到这个账户，我明天就还你。先别跟爸说，他会唠叨。这边信号不好，我先挂了！"` },
                { type: 'choice', prompt: `你会怎么做？`, options: [
                    { outcome: 'comply', correct: false, text: `看得到脸、听得到声音，肯定是儿子，赶紧转`,
                      feedback: `现在AI换脸换声，几秒钟的素材就能做出很像的视频。画面模糊、通话很短，恰恰是为了掩盖破绽。` },
                    { outcome: 'reply', correct: false, text: `继续视频，多问他几句`,
                      feedback: `多问几句是好的，但对方会说"信号不好"然后挂断，也可能事先查过你家的情况。只靠同一个通话判断不保险，要换一个渠道核实。` },
                    { outcome: 'verify', correct: true, text: `先挂断，用自己存的号码给儿子打电话核实`,
                      feedback: `非常好！你打给儿子，他说根本没打过视频，手机一直在身边——刚才的是AI伪造的。` },
                ] },
            ],
            cueNotes: {
                identity: `用了儿子的脸和声音，但画面模糊、看不清`,
                pressure: `"今晚必须到账""信号不好，我先挂了"`,
                isolation: `"先别跟爸说"`,
                transfer: `"转10万到这个账户"`,
            },
            recap: { title: `小结：AI换脸换声的视频来电`, points: [
                `视频和声音都可能是AI伪造的，"看到脸"不等于是本人。`,
                `"先别跟爸说"同样是保密信号。`,
                `涉及转账，一律挂断后用自己存的号码回拨核实。也可以和家人约定一个"家庭暗号"。`,
            ] },
            source: `美国联邦贸易委员会 FTC (2023) 关于AI克隆声音冒充家人求助的消费者警示；FBI (2024) [1]`,
        },
        en: {
            contact: 'Son', avatar: '🧑', preview: 'Incoming video call',
            header: { name: 'Son', status: 'Video call · 00:14', note: '📶 Weak signal — picture is blurry and freezing' },
            steps: [
                { type: 'info', text: `In the afternoon a video call pops up on your tablet. It says “Son”. You answer.` },
                { type: 'msg', from: 'them', text: `(The picture is very blurry — you only see his face for a few seconds.) “Mum, a friend’s business is in trouble and needs $15,000 tonight. Can you send it to this account? I’ll pay you back tomorrow. Don’t tell Dad yet, he’ll only lecture me. Signal’s bad, got to go!”` },
                { type: 'choice', prompt: `What would you do?`, options: [
                    { outcome: 'comply', correct: false, text: `It’s his face and his voice — it must be him. Send it now`,
                      feedback: `AI can now copy a face and voice from just a few seconds of video. A blurry picture and a very short call are exactly how the flaws get hidden.` },
                    { outcome: 'reply', correct: false, text: `Stay on the video call and ask him more questions`,
                      feedback: `Asking questions helps, but the caller can claim a “bad signal” and hang up, and may already know details about your family. Don’t rely on the same call — check through another channel.` },
                    { outcome: 'verify', correct: true, text: `Hang up, then call your son on the number saved in your phone`,
                      feedback: `Very good! Your son answers and says he never made a video call — his phone was with him all along. The call was an AI fake.` },
                ] },
            ],
            cueNotes: {
                identity: `Uses your son’s face and voice, but the picture is too blurry to check`,
                pressure: `“Needs it tonight”, “got to go”`,
                isolation: `“Don’t tell Dad yet”`,
                transfer: `“Send $15,000 to this account”`,
            },
            recap: { title: `Recap: an AI face- and voice-swap video call`, points: [
                `Video and voice can both be faked by AI — seeing a face is not proof.`,
                `“Don’t tell Dad” is an isolation cue too.`,
                `For any money request, hang up and call back on a saved number. You could also agree a family code word.`,
            ] },
            source: `US Federal Trade Commission (2023) consumer alert on AI voice-cloning family emergency scams; FBI (2024) [1]`,
        },
    },

    /* ── 5. 安全：儿子发来的出游安排邮件（提到钱，但没向你要钱）── */
    {
        id: 'safe-son-email', device: 'computer', channel: 'email', kind: 'safe', cues: [],
        zh: {
            contact: '儿子 小军', avatar: '👨', preview: '国庆去杭州的行程',
            header: { from: '儿子 小军 <xiaojun.li@mail.com>', subject: '国庆去杭州的行程' },
            steps: [
                { type: 'info', text: `你的电脑收到一封邮件，发件人是儿子平常用的邮箱。上周吃饭时，你们说好了国庆一起去杭州。` },
                { type: 'msg', from: 'them', text: `妈，这是国庆去杭州的行程：10月2日早上8点我开车来接您，高铁票我已经买好了，住的是西湖边的酒店。您只要带上身份证和常吃的药就行，别的都不用准备。有不清楚的周末电话里再说！` },
                { type: 'choice', prompt: `你会怎么做？`, options: [
                    { outcome: 'flag', correct: false, text: `邮件里提到车票、酒店，会不会是骗子？删掉`,
                      feedback: `这次是真的儿子。邮件提到了钱的事，但只是告诉你"已经买好了"，没有让你付钱、转账或保密，和你们说好的安排也对得上。` },
                    { outcome: 'trust', correct: true, text: `回复儿子："收到，到时候等你来接！"`,
                      feedback: `对！这是儿子平常的邮箱，内容和你们吃饭时说好的一样，没有催你、没有保密，也没有让你付钱。放心回复。` },
                    { outcome: 'comply', correct: false, text: `回邮件把自己的身份证号和银行卡号发过去，方便他订票`,
                      feedback: `儿子说票已经买好了，并没有要这些信息。身份证号、银行卡号，不管对方是谁，都不要主动通过邮件发送。` },
                ] },
            ],
            safeNote: `儿子平常用的邮箱；和你们说好的安排一致；只说"已经买好"，没有让你付钱；不催促、不保密。`,
            recap: { title: `小结：认出真正的家人邮件`, points: [
                `从熟悉的地址发来、和家人提前说好的事，通常可以放心。`,
                `提到钱不一定是骗局，关键看是不是在"要你付钱、转钱、给信息"。`,
                `就算是家人，也不用主动把身份证号、银行卡号发到邮件里。`,
            ] },
            source: `Button 等 (2025) 关于"怕被骗"的研究 [5]；Ge 等 (2025) 老年人数字排斥综述 [6]`,
        },
        en: {
            contact: 'Son Tom', avatar: '👨', preview: 'Holiday trip plan',
            header: { from: 'Tom <tom.li@mail.com>', subject: 'Holiday trip plan' },
            steps: [
                { type: 'info', text: `An email arrives from your son’s usual address. At dinner last week you agreed to go away together for the holiday.` },
                { type: 'msg', from: 'them', text: `Mum, here’s the plan: on the 2nd I’ll pick you up at 8 a.m. I’ve already bought the train tickets and booked a hotel by the lake. Just bring your ID and your usual medicine — nothing else to sort out. We can go over anything on the phone at the weekend!` },
                { type: 'choice', prompt: `What would you do?`, options: [
                    { outcome: 'flag', correct: false, text: `It mentions tickets and a hotel — could be a scam. Delete it`,
                      feedback: `This really was your son. The email mentions money, but only to say it’s already paid — nothing asks you to pay, transfer or keep a secret, and it matches what you agreed.` },
                    { outcome: 'trust', correct: true, text: `Reply: “Got it — see you on the 2nd!”`,
                      feedback: `Right! It’s your son’s usual address, it matches the plan you made at dinner, and there is no rush, no secret and nothing to pay. Safe to reply.` },
                    { outcome: 'comply', correct: false, text: `Email him your ID number and bank card number so he can book things`,
                      feedback: `He said everything is already booked and asked for none of this. Never volunteer ID or bank card numbers by email, whoever it is.` },
                ] },
            ],
            safeNote: `Your son’s usual address; matches what you agreed; says things are already paid; no rush, no secret.`,
            recap: { title: `Recap: recognising a genuine email from family`, points: [
                `An email from a familiar address about plans you already made is usually safe.`,
                `Mentioning money doesn’t make it a scam — the question is whether it asks you to pay, transfer or share details.`,
                `Even with family, don’t volunteer ID or bank details by email.`,
            ] },
            source: `Button et al. (2025) on fear of fraud [5]; Ge et al. (2025) on digital exclusion [6]`,
        },
    },

    /* ── 6. 冒充律师的"接力"电话（人员叠加 human layering）── */
    {
        id: 'lawyer-call', device: 'phone', channel: 'call', kind: 'scam',
        cues: ['identity', 'pressure', 'isolation', 'transfer'],
        zh: {
            contact: '未知来电', avatar: '📞', preview: '"您好，我是王律师……"',
            header: { name: '未知来电', status: '通话中 · 02:31' },
            steps: [
                { type: 'info', text: `下午三点，家里电话响了。对方自称是律师。` },
                { type: 'msg', from: 'them', text: `"您好，我是王律师，代理您孙子小宇的案子。他今天开车撞了人，现在被扣在派出所。对方同意私了，但今天之内要交5万保证金，不然就要立案，会留案底。法院有保密要求，这件事您千万不能告诉任何人，包括他父母，否则会影响判决。我们会派同事上门取现金。"` },
                { type: 'msg', from: 'them', text: `（电话那头传来一个年轻人的哭声）"奶奶，是我……求你帮帮我……"` },
                { type: 'choice', prompt: `你会怎么做？`, options: [
                    { outcome: 'reply', correct: false, text: `请"律师"把电话给孙子，再问他几个问题`,
                      feedback: `在骗子安排的电话里，"孙子"也是他们的人，问什么都能编。要核实，必须挂断后用你自己存的号码联系。` },
                    { outcome: 'verify', correct: true, text: `挂断电话，用自己存的号码打给孙子和他爸妈`,
                      feedback: `做得对！你打给小宇的妈妈，她说小宇正在上班，什么事都没有。真正的律师不会要你"保密"，更不会上门收现金。` },
                    { outcome: 'comply', correct: false, text: `听到孙子在哭，赶紧去银行取5万现金，等人上门`,
                      feedback: `哭声很容易伪造，甚至可以用AI做。"律师"+"孙子哭诉"一层层叠加，就是为了让你越来越慌、越来越不敢核实。` },
                ] },
            ],
            cueNotes: {
                identity: `自称"律师"，还安排"孙子"哭诉`,
                pressure: `"今天之内要交""不然就要立案"`,
                isolation: `"千万不能告诉任何人，包括他父母"`,
                transfer: `"5万保证金"，派人上门取现金`,
            },
            recap: { title: `小结：冒充律师的"接力"电话`, points: [
                `骗子会一层层加码：先是"孙子"，再是"律师""警察"，让你越来越慌。`,
                `真正的律师和法院不会要求你对家人保密。`,
                `上门取现金、买礼品卡、要你转账，都是钱财信号。`,
            ] },
            source: `Espinoza (2024) 提出的"人员叠加"（冒充律师接力施压）[2]；FBI (2024) [1]`,
        },
        en: {
            contact: 'Unknown caller', avatar: '📞', preview: '“Hello, this is Mr Wang, a lawyer…”',
            header: { name: 'Unknown caller', status: 'On call · 02:31' },
            steps: [
                { type: 'info', text: `At 3 p.m. the home phone rings. The caller says he is a lawyer.` },
                { type: 'msg', from: 'them', text: `“Hello, this is Mr Wang, the lawyer representing your grandson Alex. He hit someone with his car today and is being held at the police station. The other party will settle privately, but $8,000 bail must be paid today or charges will be filed and he’ll have a record. The court has a gag order — you must not tell anyone, not even his parents, or it will hurt his case. A colleague will come to your home to collect the cash.”` },
                { type: 'msg', from: 'them', text: `(A young man is crying in the background.) “Grandma, it’s me… please help me…”` },
                { type: 'choice', prompt: `What would you do?`, options: [
                    { outcome: 'reply', correct: false, text: `Ask the “lawyer” to put your grandson on and ask him a few questions`,
                      feedback: `On a call the scammer controls, the “grandson” is one of them too and can make up any answer. To check, hang up and use a number you already have saved.` },
                    { outcome: 'verify', correct: true, text: `Hang up and call your grandson and his parents on the numbers you have saved`,
                      feedback: `Right! Alex’s mum says he is at work and nothing has happened. A real lawyer would never tell you to keep it from the family or send someone to collect cash.` },
                    { outcome: 'comply', correct: false, text: `Hearing him cry, go to the bank, take out $8,000 in cash and wait for the courier`,
                      feedback: `Crying is easy to fake — even with AI. Adding a “lawyer” on top of a crying “grandson” is layering: each new voice makes you more frightened and less likely to check.` },
                ] },
            ],
            cueNotes: {
                identity: `Claims to be a lawyer and puts a “grandson” on the line`,
                pressure: `“Must be paid today”, “or charges will be filed”`,
                isolation: `“You must not tell anyone, not even his parents”`,
                transfer: `“$8,000 bail”, a courier coming to collect cash`,
            },
            recap: { title: `Recap: a “lawyer” layered on top of a grandchild`, points: [
                `Scammers add layer after layer — “grandchild”, then “lawyer” or “police” — to raise the pressure.`,
                `Real lawyers and courts never ask you to keep things from your family.`,
                `Cash collected at the door, gift cards or transfers are all transfer cues.`,
            ] },
            source: `Espinoza (2024) on “human layering” with fake lawyers [2]; FBI (2024) [1]`,
        },
    },

    /* ── 7. 安全：孙子打来电话聊家常 ── */
    {
        id: 'safe-grandson-call', device: 'phone', channel: 'call', kind: 'safe', cues: [],
        zh: {
            contact: '孙子 小宇', avatar: '👦', preview: '来电',
            header: { name: '孙子 小宇', status: '通话中 · 03:12' },
            steps: [
                { type: 'info', text: `晚饭后，手机响了，来电显示是你存好的"孙子 小宇"，声音和平时一样。` },
                { type: 'msg', from: 'them', text: `"奶奶！我刚考完期末，考得还不错！寒假我早点回来陪你。你上次说手机字太小，我回来帮你调大。你最近腿还疼吗？"` },
                { type: 'choice', prompt: `你会怎么做？`, options: [
                    { outcome: 'flag', correct: false, text: `听说AI能模仿声音，赶紧挂断，以后不接他电话`,
                      feedback: `这次是真的孙子。AI模仿声音确实存在，但判断要看信号：他没有要钱、没有让你保密，也没有催你做任何事。` },
                    { outcome: 'trust', correct: true, text: `高兴地和他聊，说说最近身体怎么样`,
                      feedback: `对！这是你存好的号码，声音熟悉，聊的都是家常，没有催你、没有保密，也没有要钱。放心聊。` },
                    { outcome: 'flag', correct: false, text: `以后陌生的、熟悉的电话都不接，最保险`,
                      feedback: `因为怕被骗就不接电话，会错过家人的关心。会认出四种信号，就能放心地接家人的电话。` },
                ] },
            ],
            safeNote: `来自你存好的号码；声音熟悉；聊家常；不催促、不保密、不要钱。`,
            recap: { title: `小结：放心接家人的电话`, points: [
                `家人从熟悉的号码打来、只是聊家常的电话，可以放心接。`,
                `AI会模仿声音，但没有"要钱、保密、催促"，就不用担心。`,
                `不必因为害怕被骗，就不接家人的电话。`,
            ] },
            source: `Shang 等 (2022) 关于孤独与老年人受骗的综述 [3]；Button 等 (2025) [5]`,
        },
        en: {
            contact: 'Grandson Alex', avatar: '👦', preview: 'Incoming call',
            header: { name: 'Grandson Alex', status: 'On call · 03:12' },
            steps: [
                { type: 'info', text: `After dinner your phone rings. It shows “Grandson Alex”, a number saved in your phone, and his voice sounds just as usual.` },
                { type: 'msg', from: 'them', text: `“Grandma! I just finished my exams and I think they went well! I’ll come home early for the holidays. You said the text on your phone is too small — I’ll make it bigger for you. Is your knee still hurting?”` },
                { type: 'choice', prompt: `What would you do?`, options: [
                    { outcome: 'flag', correct: false, text: `AI can copy voices — hang up and stop answering his calls`,
                      feedback: `This really was your grandson. AI voice copies do exist, but look at the cues: he didn’t ask for money or secrecy, or push you to do anything.` },
                    { outcome: 'trust', correct: true, text: `Chat happily and tell him how you’ve been`,
                      feedback: `Right! It’s a number you saved, the voice is familiar and it’s everyday chat — no rush, no secret, no money. Enjoy it.` },
                    { outcome: 'flag', correct: false, text: `Stop answering any calls at all — it’s safest`,
                      feedback: `Not answering out of fear means missing your family. Knowing the four cues lets you answer family calls with confidence.` },
                ] },
            ],
            safeNote: `From a saved number; familiar voice; everyday chat; no rush, no secret, no money.`,
            recap: { title: `Recap: answering family calls with confidence`, points: [
                `A call from a familiar number that is just everyday chat is safe to answer.`,
                `AI can copy voices, but with no money, secrecy or rush, there is nothing to worry about.`,
                `You don’t need to stop answering family calls out of fear.`,
            ] },
            source: `Shang et al. (2022) on loneliness and fraud among older adults [3]; Button et al. (2025) [5]`,
        },
    },

    /* ── 8. 安全：孙女发来毕业照片（带附件，但没有骗术信号）── */
    {
        id: 'safe-granddaughter-email', device: 'computer', channel: 'email', kind: 'safe', cues: [],
        zh: {
            contact: '孙女 小雨', avatar: '👧', preview: '奶奶，我的毕业照片来啦！',
            header: { from: '小雨 <wangxiaoyu2005@mail.com>', subject: '我的毕业典礼照片' },
            steps: [
                { type: 'info', text: `电脑收到一封邮件，来自孙女小雨平常用的邮箱。她上周告诉过你，毕业典礼的照片会发邮件给你。` },
                { type: 'msg', from: 'them', text: `奶奶，附件是我毕业典礼的照片！穿学士服的那张最好看～这周日下午我给你打视频，教你怎么把照片放大看。\n\n[ 附件：毕业照片 6 张 ]` },
                { type: 'choice', prompt: `你会怎么做？`, options: [
                    { outcome: 'flag', correct: false, text: `邮件里有附件，可能有病毒，赶紧删掉`,
                      feedback: `这次是真的孙女。陌生人发来的附件要小心，但这封来自熟悉的地址、是你们说好的事，也没有任何骗术信号。` },
                    { outcome: 'comply', correct: false, text: `回邮件把银行卡号和密码发过去，说要给她转毕业红包`,
                      feedback: `想给孙女红包是好意，但银行卡号和密码不要通过邮件发给任何人，等视频或见面时再说。` },
                    { outcome: 'trust', correct: true, text: `打开照片看看，回复："真好看，周日等你视频！"`,
                      feedback: `对！这是小雨平常的邮箱，内容和她上周说的一样，没有催你、没有保密，也没有要钱。放心看、放心回。` },
                ] },
            ],
            safeNote: `孙女平常用的邮箱；和她提前说好的事一致；不催促、不保密、不要钱。`,
            recap: { title: `小结：放心看家人的邮件`, points: [
                `熟悉的地址、提前说好的内容、没有四种骗术信号——这样的邮件可以放心看。`,
                `陌生人发来的附件和链接要小心，但不必害怕家人的邮件。`,
                `不管对方是谁，都不要把银行卡号和密码发到邮件里。`,
            ] },
            source: `Button 等 (2025) 关于"怕被骗"的研究 [5]；Ge 等 (2025) 老年人数字排斥综述 [6]`,
        },
        en: {
            contact: 'Granddaughter Lily', avatar: '👧', preview: 'Grandma, my graduation photos!',
            header: { from: 'Lily <lily.wang05@mail.com>', subject: 'My graduation photos' },
            steps: [
                { type: 'info', text: `An email arrives from your granddaughter Lily’s usual address. Last week she told you she would email you the graduation photos.` },
                { type: 'msg', from: 'them', text: `Grandma, my graduation photos are attached! The one in my gown is the best. I’ll video call you on Sunday afternoon and show you how to make them bigger.\n\n[ Attachment: 6 graduation photos ]` },
                { type: 'choice', prompt: `What would you do?`, options: [
                    { outcome: 'flag', correct: false, text: `It has an attachment — could be a virus. Delete it`,
                      feedback: `This really was your granddaughter. Be careful with attachments from strangers, but this came from a familiar address, matches what you agreed, and has none of the scam cues.` },
                    { outcome: 'comply', correct: false, text: `Reply with your bank card number and password so you can send her a graduation gift`,
                      feedback: `A gift is a kind thought, but never send card numbers or passwords by email to anyone — sort it out on the video call or in person.` },
                    { outcome: 'trust', correct: true, text: `Open the photos and reply: “Lovely! Talk on Sunday.”`,
                      feedback: `Right! It’s Lily’s usual address, it matches what she told you last week, and there’s no rush, no secret and no money. Safe to open and reply.` },
                ] },
            ],
            safeNote: `Her usual address; matches what she told you; no rush, no secret, no money.`,
            recap: { title: `Recap: enjoying emails from family`, points: [
                `A familiar address, plans you already made and none of the four cues — an email like this is safe to open.`,
                `Be careful with attachments and links from strangers, but you don’t need to fear emails from family.`,
                `Whoever it is, never send bank card numbers or passwords by email.`,
            ] },
            source: `Button et al. (2025) on fear of fraud [5]; Ge et al. (2025) on digital exclusion [6]`,
        },
    },

    /* ── 9. 安全：女儿的视频电话 ── */
    {
        id: 'safe-daughter-video', device: 'tablet', channel: 'video', kind: 'safe', cues: [],
        zh: {
            contact: '女儿 小芳', avatar: '👩', preview: '视频来电',
            header: { name: '女儿 小芳', status: '视频通话中 · 05:42', note: '📶 画面清晰流畅' },
            steps: [
                { type: 'info', text: `周四晚上，女儿像平常一样用她的账号打来视频。画面很清楚，你还看到外孙在旁边挥手。` },
                { type: 'msg', from: 'them', text: `"妈，这周六我们带孩子回来吃饭哈！你想要我带点什么？上次说的那个降压药还够吗？不够我顺路去药店买。"` },
                { type: 'choice', prompt: `你会怎么做？`, options: [
                    { outcome: 'flag', correct: false, text: `视频可能是AI换脸，赶紧挂断，拉黑她`,
                      feedback: `这次是真的女儿。AI伪造确实存在，但判断要看信号：她没让你转钱、没让你保密，画面也清楚自然。` },
                    { outcome: 'flag', correct: false, text: `以后所有视频通话都不接了`,
                      feedback: `和家人视频是很宝贵的联系方式。会认出四种信号，就不用因为害怕而放弃它。` },
                    { outcome: 'trust', correct: true, text: `高兴地聊天，告诉她想吃什么、药还剩多少`,
                      feedback: `对！这是女儿平常用的账号，画面清楚、聊的是你们的日常，没有催促、没有保密，也没有要钱。放心聊。` },
                ] },
            ],
            safeNote: `平常用的账号；画面清楚，能看到家里人；聊家常；不催促、不保密、不要钱。`,
            recap: { title: `小结：放心和家人视频`, points: [
                `和家人的正常视频，可以放心接、放心聊。`,
                `判断真假看信号：有没有冒充、催促、保密、要钱。`,
                `不要因为听说过AI诈骗，就放弃和家人视频。`,
            ] },
            source: `Shang 等 (2022) 关于孤独与老年人受骗的综述 [3]；Button 等 (2025) [5]`,
        },
        en: {
            contact: 'Daughter Sarah', avatar: '👩', preview: 'Incoming video call',
            header: { name: 'Daughter Sarah', status: 'Video call · 05:42', note: '📶 Clear, smooth picture' },
            steps: [
                { type: 'info', text: `On Thursday evening your daughter video calls from her usual account, as she often does. The picture is clear and your grandson waves from beside her.` },
                { type: 'msg', from: 'them', text: `“Mum, we’ll bring the kids over for dinner on Saturday! Anything you’d like me to bring? Do you still have enough of your blood pressure tablets? I can pick some up on the way.”` },
                { type: 'choice', prompt: `What would you do?`, options: [
                    { outcome: 'flag', correct: false, text: `It might be an AI fake — hang up and block her`,
                      feedback: `This really was your daughter. AI fakes do exist, but look at the cues: she didn’t ask for money or secrecy, and the picture was clear and natural.` },
                    { outcome: 'flag', correct: false, text: `Stop answering video calls altogether`,
                      feedback: `Video calls are a precious way to stay close to family. Knowing the four cues means you don’t have to give them up out of fear.` },
                    { outcome: 'trust', correct: true, text: `Chat happily — tell her what you’d like and how many tablets are left`,
                      feedback: `Right! It’s her usual account, the picture is clear and she’s talking about everyday things — no rush, no secret, no money. Enjoy the chat.` },
                ] },
            ],
            safeNote: `Her usual account; clear picture with family in view; everyday chat; no rush, no secret, no money.`,
            recap: { title: `Recap: enjoying a video call with family`, points: [
                `Ordinary video calls with family are safe to answer and enjoy.`,
                `Judge by the cues: is anyone pretending, rushing you, asking for secrecy or asking for money?`,
                `Don’t give up video calls with family just because you’ve heard of AI scams.`,
            ] },
            source: `Shang et al. (2022) on loneliness and fraud among older adults [3]; Button et al. (2025) [5]`,
        },
    },

    /* ── 10. 冒充医生的"急诊"电话 ── */
    {
        id: 'doctor-call', device: 'phone', channel: 'call', kind: 'scam',
        cues: ['identity', 'pressure', 'transfer'],
        zh: {
            contact: '未知来电', avatar: '🩺', preview: '"我是市一院急诊科的张医生……"',
            header: { name: '未知来电', status: '通话中 · 01:47' },
            steps: [
                { type: 'info', text: `上午，手机响了，是一个陌生号码。` },
                { type: 'msg', from: 'them', text: `"您好，是王小雨的奶奶吧？我是市一院急诊科的张医生。小雨骑车被车撞了，腿部大出血，现在必须马上手术。她的手机摔坏了，人在麻醉中不能接电话。手术押金3万，您先转到这个账户，我们马上安排，晚了腿可能就保不住了！"` },
                { type: 'choice', prompt: `你会怎么做？`, options: [
                    { outcome: 'reply', correct: false, text: `让医生把电话给小雨，或者问他要个回拨号码`,
                      feedback: `"在麻醉中不能接电话"就是为了不让你核实；他给的回拨号码也会打到骗子那里。要核实，用你自己存的或自己查到的号码。` },
                    { outcome: 'comply', correct: false, text: `救孩子要紧，马上转3万`,
                      feedback: `真正的医院会先抢救，不会因为家属没先转钱就不做手术，更不会给你一个个人账户。"晚了就保不住"是故意让你慌。` },
                    { outcome: 'verify', correct: true, text: `挂断，马上打小雨和她爸妈存的号码；需要的话自己查医院总机问问`,
                      feedback: `做得对！小雨的爸爸说小雨正在学校上课，一切都好。这是冒充医生的诈骗。` },
                ] },
            ],
            cueNotes: {
                identity: `自称"张医生"，还知道孙女的名字`,
                pressure: `"必须马上手术""晚了腿就保不住了"`,
                transfer: `"手术押金3万，先转到这个账户"`,
            },
            recap: { title: `小结：冒充医生的"急诊"电话`, points: [
                `骗子会提前打听孩子的名字，说得出名字不代表是真的。`,
                `医院会先救人，不会让家属先转账，也不会给你一个个人账户。`,
                `先挂断，打孩子和他爸妈存的号码——这几分钟不会耽误什么。`,
            ] },
            source: `Espinoza (2024) 祖父母诈骗中的"急救/医院"情节 [2]；Zhan 等 (2022) 中国老年人电话诈骗研究 [18]`,
        },
        en: {
            contact: 'Unknown caller', avatar: '🩺', preview: '“This is Dr Zhang from the emergency department…”',
            header: { name: 'Unknown caller', status: 'On call · 01:47' },
            steps: [
                { type: 'info', text: `In the morning your phone rings. It’s a number you don’t know.` },
                { type: 'msg', from: 'them', text: `“Hello, are you Lily Wang’s grandmother? This is Dr Zhang from the City Hospital emergency department. Lily was hit by a car while cycling and is bleeding badly from her leg — she needs surgery immediately. Her phone was smashed and she’s under anaesthetic, so she can’t talk. The surgery deposit is $5,000 — please transfer it to this account now so we can operate. Any later and we may not save her leg!”` },
                { type: 'choice', prompt: `What would you do?`, options: [
                    { outcome: 'reply', correct: false, text: `Ask the doctor to put Lily on, or give you a number to call back`,
                      feedback: `“She’s under anaesthetic” is there to stop you checking, and any call-back number he gives leads to the scammer. Check with a number you have saved or look up yourself.` },
                    { outcome: 'comply', correct: false, text: `Her health comes first — transfer the $5,000 now`,
                      feedback: `Real hospitals treat first; they never refuse surgery because family hasn’t paid, and never give you a personal account. “Any later and…” is there to make you panic.` },
                    { outcome: 'verify', correct: true, text: `Hang up and call Lily and her parents on their saved numbers; if needed, look up the hospital’s main number yourself`,
                      feedback: `Right! Lily’s dad says she is in class and perfectly fine. This was a fake doctor.` },
                ] },
            ],
            cueNotes: {
                identity: `Claims to be “Dr Zhang” and knows your granddaughter’s name`,
                pressure: `“Surgery immediately”, “we may not save her leg”`,
                transfer: `“$5,000 deposit — transfer it to this account”`,
            },
            recap: { title: `Recap: a fake “emergency doctor” call`, points: [
                `Scammers find out grandchildren’s names in advance — knowing a name proves nothing.`,
                `Hospitals treat first and never ask family to transfer money to an account before operating.`,
                `Hang up and call your grandchild and their parents on saved numbers — those few minutes won’t cost anything.`,
            ] },
            source: `Espinoza (2024) on the “emergency/hospital” grandparent scam [2]; Zhan et al. (2022) on telephone fraud against older adults in China [18]`,
        },
    },

    /* ── 11. 安全：儿子在超市打来视频（时间地点不寻常，但没有骗术信号）── */
    {
        id: 'safe-son-video', device: 'tablet', channel: 'video', kind: 'safe', cues: [],
        zh: {
            contact: '儿子 小军', avatar: '👨', preview: '视频来电',
            header: { name: '儿子 小军', status: '视频通话中 · 03:05', note: '📶 画面清晰流畅' },
            steps: [
                { type: 'info', text: `傍晚，儿子用他平常的账号打来视频。画面很清楚，他正在超市里。` },
                { type: 'msg', from: 'them', text: `"妈，我在超市呢，橘子挺新鲜的，要不要给您带一袋过来？晚上顺便帮您看看那个热水器。"` },
                { type: 'choice', prompt: `你会怎么做？`, options: [
                    { outcome: 'flag', correct: false, text: `儿子从来不在超市打视频，肯定是AI换脸，赶紧挂断`,
                      feedback: `这次是真的儿子。打视频的时间和地点不寻常，并不代表是骗局。判断要看信号：他没有要钱、没有让你保密，也没有催你。` },
                    { outcome: 'trust', correct: true, text: `高兴地说："带一袋吧，晚上等你来！"`,
                      feedback: `对！这是儿子平常的账号，画面清楚，聊的是家常，没有催促、没有保密，也没有要钱。放心聊。` },
                    { outcome: 'flag', correct: false, text: `先挂断，以后视频电话一律不接`,
                      feedback: `因为害怕就不接视频，会错过家人的关心。会认出四种信号，就能放心和家人视频。` },
                ] },
            ],
            safeNote: `平常用的账号；画面清楚；聊家常；不催促、不保密、不要钱。`,
            recap: { title: `小结：家人突然来视频也不用怕`, points: [
                `家人在不常见的时间、地点打来视频，不等于是骗局。`,
                `判断看四种信号：冒充、催促、保密、要钱。`,
                `没有这些信号，就放心地聊。`,
            ] },
            source: `Shang 等 (2022) 关于孤独与老年人受骗的综述 [3]；Button 等 (2025) [5]`,
        },
        en: {
            contact: 'Son Tom', avatar: '👨', preview: 'Incoming video call',
            header: { name: 'Son Tom', status: 'Video call · 03:05', note: '📶 Clear, smooth picture' },
            steps: [
                { type: 'info', text: `In the early evening your son video calls from his usual account. The picture is clear and he is in the supermarket.` },
                { type: 'msg', from: 'them', text: `“Mum, I’m at the supermarket and the oranges look lovely — shall I bring you a bag? I’ll have a look at your water heater tonight while I’m there.”` },
                { type: 'choice', prompt: `What would you do?`, options: [
                    { outcome: 'flag', correct: false, text: `He never video calls from the supermarket — it must be an AI fake. Hang up`,
                      feedback: `This really was your son. An unusual time or place doesn’t make a call a scam. Look at the cues: he didn’t ask for money or secrecy, or rush you.` },
                    { outcome: 'trust', correct: true, text: `Say happily: “Yes please — see you tonight!”`,
                      feedback: `Right! It’s his usual account, the picture is clear and it’s everyday chat — no rush, no secret, no money. Enjoy it.` },
                    { outcome: 'flag', correct: false, text: `Hang up and stop answering video calls altogether`,
                      feedback: `Not answering out of fear means missing your family. Knowing the four cues lets you enjoy video calls with family.` },
                ] },
            ],
            safeNote: `His usual account; clear picture; everyday chat; no rush, no secret, no money.`,
            recap: { title: `Recap: a surprise video call from family`, points: [
                `A call at an unusual time or place doesn’t make it a scam.`,
                `Judge by the four cues: pretending, rushing, secrecy, money.`,
                `With none of those cues, relax and chat.`,
            ] },
            source: `Shang et al. (2022) on loneliness and fraud among older adults [3]; Button et al. (2025) [5]`,
        },
    },

    /* ── 12. 慢慢靠近的"远方外甥"（不催促，但有保密）── */
    {
        id: 'nephew-email', device: 'computer', channel: 'email', kind: 'scam',
        cues: ['identity', 'isolation', 'transfer'],
        zh: {
            contact: '"外甥" 阿杰', avatar: '💌', preview: '姨妈，想请您帮个小忙',
            header: { from: '阿杰 <ajie.chen.overseas@mail.com>', subject: '姨妈，想请您帮个小忙' },
            steps: [
                { type: 'info', text: `两个月前，一个自称是你多年没联系的外甥"阿杰"的人给你发邮件，说在国外工作，通过家谱网站找到了你。之后他常常发来问候和照片，让你觉得很温暖。今天他又来信了。` },
                { type: 'msg', from: 'them', text: `"姨妈，这两个月和您聊天，就像找回了家。我下个月想回国看您！只是我在这边的工资账户被冻结了，要先交一笔2万元的解冻手续费才能取钱买机票。您方便的时候帮我垫一下就好，不着急。先别告诉表哥表姐，我想给大家一个惊喜。"` },
                { type: 'choice', prompt: `你会怎么做？`, options: [
                    { outcome: 'comply', correct: false, text: `他这么亲，又不着急，就先帮他垫上`,
                      feedback: `从没见过面的"亲戚"慢慢建立感情，再开口借钱，是很常见的骗局。"不着急"恰恰让你放下戒心。` },
                    { outcome: 'verify', correct: true, text: `先不转钱，把邮件给子女看看，再问问家里老人有没有这个外甥`,
                      feedback: `做得很好！女儿一查，家里根本没有叫"阿杰"的外甥，照片也是网上找的。真正的亲戚不会让你瞒着家人给他钱。` },
                    { outcome: 'reply', correct: false, text: `回信请他发几张小时候的全家福证明身份`,
                      feedback: `照片很容易从网上找来或伪造。只和对方本人沟通，没法证明他是谁，要和你身边的家人一起核实。` },
                ] },
            ],
            cueNotes: {
                identity: `自称多年没联系的"外甥"，用亲情拉近关系`,
                isolation: `"先别告诉表哥表姐"`,
                transfer: `"2万元解冻手续费，帮我垫一下"`,
            },
            recap: { title: `小结：慢慢靠近的"远方亲戚"`, points: [
                `不是所有骗局都很急：有的会先花几个月建立感情，再开口借钱。`,
                `"先别告诉别人，想给大家惊喜"同样是保密信号。`,
                `从没见过面的人借钱之前，先和身边的家人一起看看。`,
            ] },
            source: `Shang 等 (2022)：孤独和渴望亲情会增加老年人受骗风险 [3]；FBI (2024) 中的信任/感情类诈骗 [1]`,
        },
        en: {
            contact: '“Nephew” Jack', avatar: '💌', preview: 'Auntie, a small favour',
            header: { from: 'Jack <jack.chen.overseas@mail.com>', subject: 'Auntie, a small favour' },
            steps: [
                { type: 'info', text: `Two months ago someone calling himself Jack, a nephew you had lost touch with years ago, emailed you. He said he works overseas and found you through a family-tree website. Since then he has sent warm messages and photos, and it has felt lovely. Today he writes again.` },
                { type: 'msg', from: 'them', text: `“Auntie, chatting with you these two months has felt like finding my family again. I’d love to fly home to see you next month! The only thing is, my salary account here has been frozen and I need to pay a $3,000 release fee before I can take money out for the ticket. Could you cover it for me whenever it suits you — there’s no rush. Please don’t tell my cousins yet; I want it to be a surprise for everyone.”` },
                { type: 'choice', prompt: `What would you do?`, options: [
                    { outcome: 'comply', correct: false, text: `He’s so close to you and there’s no rush — lend him the money`,
                      feedback: `A “relative” you have never met who builds a bond over time and then asks for money is a very common scam. “No rush” is exactly what lowers your guard.` },
                    { outcome: 'verify', correct: true, text: `Don’t send anything yet. Show the email to your children and ask older relatives whether this nephew exists`,
                      feedback: `Well done! Your daughter checks: there is no nephew called Jack in the family, and the photos were taken from the internet. Real relatives never ask you to hide money from the family.` },
                    { outcome: 'reply', correct: false, text: `Write back asking for old family photos to prove who he is`,
                      feedback: `Photos are easy to find online or fake. Talking only to him can’t prove who he is — check together with the family around you.` },
                ] },
            ],
            cueNotes: {
                identity: `Claims to be a long-lost “nephew” and uses family feeling to get close`,
                isolation: `“Please don’t tell my cousins yet”`,
                transfer: `“Cover a $3,000 release fee for me”`,
            },
            recap: { title: `Recap: the “long-lost relative” who comes closer slowly`, points: [
                `Not every scam is in a hurry — some spend months building a bond before asking for money.`,
                `“Don’t tell anyone, it’s a surprise” is an isolation cue too.`,
                `Before lending to someone you have never met, look at it together with your family.`,
            ] },
            source: `Shang et al. (2022): loneliness and the wish for family raise older adults’ risk [3]; FBI (2024) on confidence/romance scams [1]`,
        },
    },

];

/* ── 帮助函数 ── */
function caseById(id) { return CASES.find(c => c.id === id) || null; }
function caseText(c) { return c[getLang()] || c.zh; }
function cueText(id) { return CUES[id][getLang()] || CUES[id].zh; }
function casesOnDevice(dev) { return CASES.filter(c => c.device === dev); }

function escHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

// 每个案例顶部的"界面"：短信条 / 邮件头 / 语音电话 / 视频通话
function caseHeaderHtml(c) {
    const L = caseText(c), lang = getLang();
    const ch = CHANNELS[c.channel];
    if (c.channel === 'email') {
        return `<div class="email-head">
            <div class="email-subject">${escHtml(L.header.subject)}</div>
            <div class="email-row"><span class="email-k">${t('emailFrom')}</span><span class="email-v">${escHtml(L.header.from)}</span></div>
            <div class="email-row"><span class="email-k">${t('emailTo')}</span><span class="email-v">${t('emailMe')}</span></div>
        </div>`;
    }
    if (c.channel === 'video' || c.channel === 'call') {
        return `<div class="call-header${c.channel === 'call' ? ' voice' : ''}">
            <div class="call-avatar">${L.avatar}</div>
            <div class="call-name">${escHtml(L.header.name)}</div>
            <div class="call-status">${ch.icon} ${escHtml(L.header.status)}</div>
            ${L.header.note ? `<div class="call-video-box">${escHtml(L.header.note)}</div>` : ''}
        </div>`;
    }
    return `<div class="phone-topbar">${ch.icon} ${ch[lang]} · ${escHtml(L.contact)}</div>`;
}
