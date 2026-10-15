    /* ── 8. 冒充大学的"处分"邮件 ── */
    {
        id: 'school-email', device: 'computer', channel: 'email', kind: 'scam',
        cues: ['identity', 'pressure', 'transfer'],
        zh: {
            contact: '"XX大学学生处"', avatar: '🏫', preview: '关于您孙女王小雨的违纪处理通知',
            header: { from: '"XX大学学生处" <xsc-office@edu-notice.net>', subject: '关于您孙女王小雨的违纪处理通知' },
            steps: [
                { type: 'info', text: `你的电脑收到一封邮件，标题里有孙女小雨的名字。小雨正在外地读大学。` },
                { type: 'msg', from: 'them', text: `王小雨家属您好：您孙女在期中考试中被认定为作弊，按校规将给予开除学籍处分。经学院研究，如在本周五前缴纳"教育处理费"1.2万元，可改为警告处分，不影响毕业。请将费用汇入以下账户，并回复确认。逾期将正式上报教育部门。` },
                { type: 'choice', prompt: `你会怎么做？`, options: [
                    { outcome: 'verify', correct: true, text: `不回复。先打小雨存好的号码问问，或打学校官网上公布的电话核实`,
                      feedback: `完全正确！小雨说根本没有这回事，学校官网电话也确认没发过这封邮件。学校不会让家属交"处理费"来改处分。` },
                    { outcome: 'comply', correct: false, text: `怕影响孩子前途，赶紧把钱汇过去`,
                      feedback: `学校的处分不能花钱"改"，更不会让家属把钱汇到陌生账户。骗子正是利用你对孩子前途的担心。` },
                    { outcome: 'reply', correct: false, text: `回邮件问清楚具体情况和老师的电话`,
                      feedback: `回复这封邮件，联系上的还是骗子，他给的"老师电话"也是假的。要核实，就用你自己找到的号码。` },
                ] },
            ],
            cueNotes: {
                identity: `冒充"大学学生处"，知道孙女的名字，但发件地址不是学校的`,
                pressure: `"本周五前缴纳""逾期将正式上报"`,
                transfer: `要你汇1.2万"教育处理费"`,
            },
            recap: { title: `小结：冒充学校的"处分"邮件`, points: [
                `骗子常常知道孩子的名字和学校——说得出名字，不代表是真的。`,
                `学校的处分不能花钱改，学校也不会让祖辈把钱汇到陌生账户。`,
                `用自己存的号码问孩子本人，或打学校官网公布的电话。`,
            ] },
            source: `Espinoza (2024) [2]；Althobaiti 等 (2024) 关于冒充机构的跨渠道钓鱼 [7]`,
        },
        en: {
            contact: '“University Student Office”', avatar: '🏫', preview: 'Disciplinary notice about your granddaughter Lily',
            header: { from: '“University Student Office” <student-office@edu-notice.net>', subject: 'Disciplinary notice: your granddaughter Lily Wang' },
            steps: [
                { type: 'info', text: `An email arrives on your computer. The subject line mentions your granddaughter Lily, who is away at university.` },
                { type: 'msg', from: 'them', text: `Dear family of Lily Wang: your granddaughter has been found cheating in her mid-term exam and, under university rules, faces expulsion. The faculty has agreed that if an “education processing fee” of $2,000 is paid before Friday, this can be reduced to a warning that will not affect her degree. Please transfer the fee to the account below and reply to confirm. Late payment will be reported to the education authorities.` },
                { type: 'choice', prompt: `What would you do?`, options: [
                    { outcome: 'verify', correct: true, text: `Don’t reply. Call Lily on her saved number, or ring the university on the number from its official website`,
                      feedback: `Exactly right! Lily says nothing of the sort happened, and the university confirms it never sent this email. Universities don’t let families pay to change a penalty.` },
                    { outcome: 'comply', correct: false, text: `Worried about her future, transfer the money straight away`,
                      feedback: `University penalties can’t be “paid off”, and no university asks family to send money to a strange account. The scammer is using your worry about her future.` },
                    { outcome: 'reply', correct: false, text: `Reply asking for details and the teacher’s phone number`,
                      feedback: `Replying reaches the scammer again, and any “teacher’s number” they give is fake. To check, use a number you find yourself.` },
                ] },
            ],
            cueNotes: {
                identity: `Pretends to be the university and knows her name, but the address isn’t the university’s`,
                pressure: `“Paid before Friday”, “will be reported”`,
                transfer: `Asks you to transfer a $2,000 “fee”`,
            },
            recap: { title: `Recap: a fake university “penalty” email`, points: [
                `Scammers often know a grandchild’s name and school — knowing a name doesn’t make it real.`,
                `Penalties can’t be paid off, and universities never ask grandparents to send money to a strange account.`,
                `Ask your grandchild on their saved number, or call the number on the official website.`,
            ] },
            source: `Espinoza (2024) [2]; Althobaiti et al. (2024) on multi-channel phishing that impersonates organisations [7]`,
        },
    },

