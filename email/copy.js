// AI-OCEAN 이메일 원고 (5일 미니 강의 + 주간 팁). 영어가 기본, 한국어 병행.
// 이 파일이 원고의 원본이다. 수정 후 `node email/build_content.js` 로 content.json 을 다시 만든다.
//
// 치환 변수: {{name}} 유형 이름, {{summary}} 한 줄 요약, {{insight}} 공감 리포트, {{tools}} 추천 AI 조합
// 블록 종류: p(문단) h(소제목) prompt(복사해서 쓰는 프롬프트) li(목록) blind(5개 성향별 맹점 목록)
// 주간 팁: 코드 5자리의 비트(O,C,E,A,N)별로 tips[<차원><비트>][라운드] 를 골라 쓴다. N 비트 1 = 정서 안정.
// 주차 w(1~10) → 차원 = DIMS[(w-1)%5], 라운드 = floor((w-1)/5)

module.exports = {
  en: {
    labels: {
      promptHead: 'Copy-paste prompt',
      actionHead: 'This week’s mini-action',
      weekOf: 'Tip {w} of {n}',
      dim: { O: 'Openness', C: 'Conscientiousness', E: 'Extraversion', A: 'Agreeableness', N: 'Emotional stability' },
      sign: '— AI-OCEAN',
      why: 'You are receiving this because you signed up on thepersonalityai.com after taking the AI-OCEAN test.',
      unsub: 'Unsubscribe',
      confirmSubject: 'Please confirm your AI-OCEAN guide',
      confirmBody: 'One click and your 5-day AI guide starts right away. If you did not request this, ignore this email and nothing will be sent.',
      confirmBtn: 'Yes, send me the guide',
      confirmedTitle: 'You’re in!',
      confirmedBody: 'Your first lesson is on its way to your inbox. Check spam or promotions if you do not see it in a few minutes.',
      unsubTitle: 'You’re unsubscribed',
      unsubBody: 'We will not email you again. You can always take the test again at thepersonalityai.com.',
      badLink: 'This link is invalid or has expired.',
    },
    course: [
      {
        subject: 'Welcome — your {{name}} AI starter guide',
        blocks: [
          { p: 'Welcome aboard. Your AI-OCEAN type is **{{name}}**.' },
          { p: '{{summary}}' },
          { p: '{{insight}}' },
          { h: 'Your starter AI stack' },
          { p: 'For your type we suggest: **{{tools}}**. Don’t install anything today — just try one.' },
          { h: 'Try this in 5 minutes' },
          { p: 'Open any AI assistant and paste the prompt below. It will interview you, then point to the three tasks where AI would save you the most time.' },
          { prompt: 'Act as my AI coach. My personality type is {{name}} ({{summary}}). Ask me 5 short questions about my work, one at a time. Then list the 3 tasks where AI would save me the most time, and give me the first prompt to try for each.' },
          { p: 'Tomorrow: how to make your AI work the way you do.' },
        ],
      },
      {
        subject: 'Day 2 — set up your AI to work the way you do',
        blocks: [
          { p: 'Most people re-explain themselves to their AI in every chat. Fix that once.' },
          { p: 'Custom instructions (called “Custom instructions”, “Personalization” or a “Project” depending on the tool) give the AI standing context. Use this prompt to write yours:' },
          { prompt: 'Write custom instructions (under 150 words) for an AI assistant I will use every day. About me: personality type {{name}} — {{summary}} My work: [your job in one line]. How I like answers: [short / step-by-step / with examples]. Also tell the assistant to push back on me where my type tends to go wrong.' },
          { p: 'Paste the result into your tool’s settings. It takes five minutes and improves every answer after it.' },
          { p: 'Tomorrow: turn one repeated task into a template.' },
        ],
      },
      {
        subject: 'Day 3 — turn one repeated task into a template',
        blocks: [
          { p: 'Pick one task you do every week: a report, an email, meeting prep, a summary. Not the hardest one — the most repetitive.' },
          { prompt: 'Interview me about a task I do every week: [name the task]. Ask one question at a time until you understand the inputs, the steps, and what a good result looks like. Then write (1) a reusable prompt template with [placeholders], and (2) a 4-item checklist I can use to check your output before I send it.' },
          { p: 'Save the template where you will find it (a note, a pinned chat, a Project). Next week, use it instead of starting from scratch. That is the whole habit.' },
          { p: 'Tomorrow: where your type tends to trip up with AI.' },
        ],
      },
      {
        subject: 'Day 4 — where your type trips up with AI',
        blocks: [
          { p: 'Every trait has a shadow side when you work with AI. Here is yours, trait by trait. Read your five lines and pick the one that stings.' },
          { blind: true },
          { p: 'The fix: ask the AI to cover that blind spot on purpose.' },
          { prompt: 'I tend to [paste the line that stung]. Whenever I give you a task, add a short “blind-spot check” at the end: one question or risk related to this habit that I should consider before I act.' },
          { p: 'Tomorrow: your weekly rhythm.' },
        ],
      },
      {
        subject: 'Day 5 — your 20-minute weekly AI routine',
        blocks: [
          { p: 'Habits beat tools. Here is a weekly routine that fits around a full-time job:' },
          { li: [
            'Sunday, 10 min: paste your week’s meetings and deadlines and ask for the 3 priorities and a first step for each.',
            'Midweek, 5 min: use your Day 3 template on one real task.',
            'Friday, 5 min: ask the AI “What did I do well this week, and what should I automate next?”',
          ] },
          { p: 'From next week you will get one short email a week with a tip written for your type, **{{name}}** — for 10 weeks. After that it stops.' },
          { p: 'Two quick things. First, reply to this email and tell me what you tried or where you got stuck — I read the replies. Second, I am gauging interest in comparing types across a team: if that would be useful to you, reply with the word “team”.' },
        ],
      },
    ],
    blind: {
      O1: 'High openness: you chase the new tool or idea and finish less. Ask the AI to help you choose and stop, not to add more options.',
      O0: 'Lower openness: you may keep prompting the way you always have. Ask the AI for one unfamiliar approach a week.',
      C1: 'High conscientiousness: you over-polish and over-plan. Ask the AI for the 80% version and send it.',
      C0: 'More flexible on structure: tasks drift. Ask the AI to turn your mess into a top-3 list every morning.',
      E1: 'High extraversion: you think by talking and may skip quiet verification. Read the AI’s answer once, alone, before you act.',
      E0: 'More reserved: you may keep AI answers to yourself. Share one AI-assisted draft with a colleague each week for a second view.',
      A1: 'High agreeableness: you accept the AI’s first answer politely. Ask it to argue the opposite side.',
      A0: 'Lower agreeableness: you accept or reject answers fast. Ask the AI to soften the tone and name what the other side needs.',
      N1: 'Calm under pressure: you may under-check. Ask the AI to list the assumptions you are treating as certain.',
      N0: 'More sensitive to risk: you may re-check forever. Give the AI a fixed 5-item checklist, and stop when it passes.',
    },
    tips: {
      O1: [
        { t: 'Use AI as a sparring partner for ideas, not a vending machine', b: 'High openness means ideas come easily — the bottleneck is choosing. Let the AI play the skeptical investor so you stop collecting and start deciding.', p: 'Here are 5 ideas I am considering: [list]. Act as a skeptical investor. Rank them by impact vs. effort, then tell me which 2 to kill and why.', a: 'Run this on one real decision and actually drop at least one idea.' },
        { t: 'Time-box your exploring', b: 'Curiosity can turn into endless tool-hopping. A fixed window keeps the discovery and removes the drift.', p: 'I have 45 minutes to explore [topic]. Give me a 3-step plan: 15 min to map the landscape, 15 min to test one approach, 15 min to decide. Hold me to it.', a: 'Pick one AI tool for 30 days and write down each time you want to switch.' },
      ],
      O0: [
        { t: 'Turn your proven methods into reusable templates', b: 'You trust what works. AI is excellent at repeating a method faster — you do not need to change how you work to benefit.', p: 'Here is how I currently do [task], step by step: [steps]. Turn it into a reusable template with placeholders, and list 3 places where AI could save time without changing the method.', a: 'Template one weekly task and time how long it takes the next two times.' },
        { t: 'Let AI challenge your default once a month', b: 'The method that always worked can quietly stop being the best one. Ask for alternatives with the risk attached, so trying one feels safe.', p: 'Here is my standard approach to [task]: [approach]. Give me 3 alternatives used in other fields or companies, with the risk of each, and one small low-risk way to test the best one.', a: 'Run one tiny experiment from the list.' },
      ],
      C1: [
        { t: 'Delegate the planning, keep the judgment', b: 'You plan well; the AI can draft the structure so you spend your time on decisions instead of formatting checklists.', p: 'Break [project] into milestones, tasks, owners, and a definition of done for each. Flag the 3 tasks most likely to slip and why.', a: 'Replace one plan you would normally build by hand, then edit — do not start from blank.' },
        { t: 'Adopt a “good enough” rule', b: 'High conscientiousness can turn into endless polishing. A clear bar tells you when to stop.', p: 'Review this draft against 3 criteria: clarity, accuracy, audience fit. Tell me whether it is 80% ready to send and list only the changes that matter — maximum 3.', a: 'Send one thing at 80% this week.' },
      ],
      C0: [
        { t: 'Use AI as external structure', b: 'Flexibility is a strength until small tasks pile up. Let the AI do the sorting so your energy goes to the work.', p: 'Here is my messy to-do list: [paste]. Group it by deadline and effort, pick the top 3 for today, and give each a 25-minute first step.', a: 'Do this each morning for 5 days.' },
        { t: 'Make AI your end-of-day check-in', b: 'A five-minute closing ritual keeps loose ends from carrying over without turning you into a planner.', p: 'Act as my end-of-day check-in. Ask me 3 questions: what I finished, what moved, and what to drop. Then draft tomorrow’s top 3.', a: 'Set a recurring 5-minute reminder at the end of your workday.' },
      ],
      E1: [
        { t: 'Think out loud with voice mode', b: 'You think best when you talk. Voice mode lets you do that and still end up with notes.', p: 'I am going to talk through [problem] for 3 minutes. Do not interrupt. Then summarize my main points, the gaps, and 3 questions I should answer.', a: 'Try it on a walk or commute.' },
        { t: 'Use AI to prepare for the conversations that energize you', b: 'The meeting is where you shine; a little preparation makes it sharper and shorter.', p: 'I am meeting [person] about [topic]. Give me their likely concerns, 3 questions to ask, and a two-sentence opening.', a: 'Prepare one meeting this way and compare how it went.' },
      ],
      E0: [
        { t: 'Prepare with AI so meetings cost less energy', b: 'You do your best thinking before the room fills. Preparing your points ahead makes speaking short and calm.', p: 'Here are the agenda and my notes: [paste]. Draft my 3 key points, 2 questions, and a one-line position so I can speak concisely.', a: 'Use it before your next meeting and send your points in writing first.' },
        { t: 'Draft the reach-out messages you keep postponing', b: 'Starting a message is the hard part. A draft in your own voice makes the first step small.', p: 'Draft a short, warm message to [person] to [goal]. Give me a 2-sentence and a 5-sentence version in my voice — here is a sample of my writing: [paste].', a: 'Send one message you have been putting off.' },
      ],
      A1: [
        { t: 'Deliver hard feedback kindly but clearly', b: 'Warmth is your strength; the risk is saying so gently that the point disappears. Compare a soft and a firm version before you choose.', p: 'I need to tell [person] that [issue]. Draft a message that is kind but unambiguous, with one concrete request and a deadline. Show a softer and a firmer version.', a: 'Send the version you would normally avoid.' },
        { t: 'Ask AI to argue against you', b: 'Agreeable people give away more than they realize. A strong opposing case shows what you have not priced.', p: 'Here is the position I am about to take: [position]. Argue the strongest opposing case as a tough negotiator. What am I giving up that I have not priced in?', a: 'Use it before your next negotiation or agreement.' },
      ],
      A0: [
        { t: 'Soften the edges before you send', b: 'Direct is efficient but can cost goodwill. Keep your point and let the AI check the tone.', p: 'Rewrite this message so it keeps my point and decisions but is less likely to read as harsh: [paste]. Show what you changed and why.', a: 'Compare the original and the revised version before you send.' },
        { t: 'Use AI to see the other side’s incentives', b: 'You are quick to a conclusion. Seeing the other person’s goals first often gets a faster yes.', p: 'Describe this situation from [person]’s point of view: their goals, fears, and what they would need to say yes. Then suggest the first sentence of my reply.', a: 'Try it on one disagreement this week.' },
      ],
      N1: [
        { t: 'Use your calm to run a pre-mortem', b: 'You stay level when others rush. Put that to work by imagining the failure first.', p: 'Assume [plan] failed six months from now. List the 7 most likely reasons, ranked by probability, with one early warning sign for each.', a: 'Run it on your next project and put the top warning sign in your calendar.' },
        { t: 'Watch out for under-checking', b: 'Staying calm can mean skipping the second look. A short assumptions audit costs five minutes.', p: 'Review [plan or numbers] and list the assumptions I am treating as certain. For each, what evidence would prove it wrong?', a: 'Test the riskiest assumption this week.' },
      ],
      N0: [
        { t: 'Turn worry into a checklist', b: 'Your attention to risk catches real problems. Sorting what you control from what you do not keeps it useful. (A work habit, not a mental-health tool.)', p: 'I am worried about [situation]. List what is in my control and what is not. For the controllable parts, give me the next small action.', a: 'Do the first small action today.' },
        { t: 'Set a verification routine with a stopping rule', b: 'Sensitivity to risk can make checking endless. A fixed list tells you when you are done.', p: 'Give me a 5-item checklist to verify [work] before I send or ship it, and a stopping rule: when all 5 pass, I stop.', a: 'Use the same checklist on three items and stop when it passes.' },
      ],
    },
  },

  ko: {
    labels: {
      promptHead: '복사해서 쓰는 프롬프트',
      actionHead: '이번 주 미션',
      weekOf: '주간 팁 {w}/{n}',
      dim: { O: '개방성', C: '성실성', E: '외향성', A: '친화성', N: '정서안정성' },
      sign: '— AI-OCEAN',
      why: 'AI-OCEAN 테스트 후 thepersonalityai.com에서 구독하셔서 받으시는 메일입니다.',
      unsub: '구독 취소',
      confirmSubject: 'AI-OCEAN 가이드 구독을 확인해 주세요',
      confirmBody: '아래 버튼을 한 번 누르면 5일 AI 가이드가 바로 시작됩니다. 신청하지 않으셨다면 이 메일을 무시하세요. 아무것도 발송되지 않습니다.',
      confirmBtn: '네, 가이드를 받겠습니다',
      confirmedTitle: '구독이 완료되었습니다',
      confirmedBody: '첫 번째 메일이 곧 도착합니다. 몇 분 안에 보이지 않으면 스팸함이나 프로모션함을 확인해 주세요.',
      unsubTitle: '구독이 취소되었습니다',
      unsubBody: '더 이상 메일을 보내지 않습니다. 언제든 thepersonalityai.com에서 테스트를 다시 해보실 수 있습니다.',
      badLink: '링크가 올바르지 않거나 만료되었습니다.',
    },
    course: [
      {
        subject: '환영합니다 — {{name}} 유형을 위한 AI 시작 가이드',
        blocks: [
          { p: '환영합니다. 회원님의 AI-OCEAN 유형은 **{{name}}**입니다.' },
          { p: '{{summary}}' },
          { p: '{{insight}}' },
          { h: '시작용 AI 조합' },
          { p: '이 유형에게는 **{{tools}}** 조합을 권합니다. 오늘은 설치하지 말고 하나만 써 보세요.' },
          { h: '5분 안에 해볼 것' },
          { p: '아무 AI 도우미나 열어서 아래 프롬프트를 붙여넣으세요. AI가 먼저 질문하고, AI로 시간을 가장 많이 아낄 수 있는 업무 3개를 짚어 줍니다.' },
          { prompt: '너는 나의 AI 코치야. 내 성향 유형은 {{name}}({{summary}})이야. 내 일에 대해 짧은 질문 5개를 한 번에 하나씩 물어봐. 그다음 AI로 시간을 가장 많이 아낄 수 있는 업무 3가지와, 각각 처음 써볼 프롬프트를 알려줘.' },
          { p: '내일은 AI가 나처럼 일하게 만드는 법입니다.' },
        ],
      },
      {
        subject: '2일차 — AI가 나처럼 일하게 설정하기',
        blocks: [
          { p: '대부분 대화를 시작할 때마다 AI에게 자기 소개를 다시 합니다. 한 번만 설정해 두세요.' },
          { p: '도구에 따라 “맞춤 설정”, “개인화”, “프로젝트”라고 부르는 기능에 기본 맥락을 넣어 두면 됩니다. 아래 프롬프트로 내용을 만드세요.' },
          { prompt: '매일 쓸 AI 도우미를 위한 맞춤 지침을 150단어 이내로 써 줘. 나에 대해: 성향 유형 {{name}} — {{summary}} 내 일: [한 줄로 직업]. 선호하는 답변 방식: [짧게 / 단계별로 / 예시와 함께]. 내 유형이 놓치기 쉬운 부분은 AI가 먼저 짚어 주도록 해 줘.' },
          { p: '결과를 도구의 설정에 붙여넣으세요. 5분이면 되고, 이후 모든 답변이 좋아집니다.' },
          { p: '내일은 반복 업무 하나를 템플릿으로 만듭니다.' },
        ],
      },
      {
        subject: '3일차 — 반복 업무 하나를 템플릿으로',
        blocks: [
          { p: '매주 하는 일 하나를 고르세요. 보고서, 이메일, 회의 준비, 요약 등입니다. 가장 어려운 일이 아니라 가장 반복적인 일을 고르세요.' },
          { prompt: '내가 매주 하는 업무 [업무 이름]에 대해 인터뷰해 줘. 입력 자료, 단계, 좋은 결과의 기준을 알 때까지 한 번에 질문 하나씩 해. 그다음 (1) [빈칸]이 있는 재사용 프롬프트 템플릿과 (2) 보내기 전에 결과를 점검할 4개 항목 체크리스트를 만들어 줘.' },
          { p: '템플릿은 찾기 쉬운 곳(메모, 고정한 채팅, 프로젝트)에 저장하세요. 다음 주에는 처음부터 쓰지 말고 이것을 쓰면 됩니다. 이게 습관의 전부입니다.' },
          { p: '내일은 내 유형이 AI에서 놓치기 쉬운 부분입니다.' },
        ],
      },
      {
        subject: '4일차 — 내 유형이 AI에서 놓치기 쉬운 것',
        blocks: [
          { p: '성향마다 AI를 쓸 때 그늘이 있습니다. 회원님 유형의 다섯 줄입니다. 읽고 가장 찔리는 한 줄을 고르세요.' },
          { blind: true },
          { p: '해결책은 AI에게 그 맹점을 일부러 짚어 달라고 시키는 것입니다.' },
          { prompt: '나는 [찔리는 줄 붙여넣기] 경향이 있어. 내가 일을 시킬 때마다 끝에 “맹점 점검”을 짧게 붙여 줘. 이 습관과 관련해 행동하기 전에 생각해 볼 질문이나 위험 한 가지면 돼.' },
          { p: '내일은 주간 루틴입니다.' },
        ],
      },
      {
        subject: '5일차 — 매주 20분 AI 루틴',
        blocks: [
          { p: '도구보다 습관이 이깁니다. 본업을 하면서도 가능한 주간 루틴입니다.' },
          { li: [
            '일요일 10분: 이번 주 회의와 마감을 붙여넣고 우선순위 3개와 각각의 첫 행동을 물어보세요.',
            '수요일 5분: 3일차 템플릿을 실제 업무 하나에 쓰세요.',
            '금요일 5분: AI에게 “이번 주에 내가 잘한 것과 다음에 자동화할 것은?”이라고 물어보세요.',
          ] },
          { p: '다음 주부터 10주 동안 매주 한 통씩, **{{name}}** 유형에 맞춘 짧은 팁을 보내드립니다. 그 후에는 발송이 멈춥니다.' },
          { p: '두 가지만 부탁드립니다. 첫째, 이 메일에 답장으로 해본 것이나 막힌 곳을 알려 주세요. 답장은 제가 읽습니다. 둘째, 팀원끼리 유형을 비교하는 기능의 수요를 살피고 있습니다. 필요하시면 “팀”이라고만 답장해 주세요.' },
        ],
      },
    ],
    blind: {
      O1: '개방성이 높음: 새 도구와 아이디어를 쫓다가 마무리가 줄어듭니다. AI에게 선택지를 늘려 달라 하지 말고 고르고 멈추도록 도와 달라고 하세요.',
      O0: '개방성이 낮은 편: 늘 쓰던 방식으로만 질문하기 쉽습니다. 주에 한 번 낯선 접근법을 AI에게 요청하세요.',
      C1: '성실성이 높음: 지나치게 다듬고 계획합니다. AI에게 80% 완성본을 달라고 하고 그대로 보내세요.',
      C0: '구조에 유연한 편: 할 일이 흩어지기 쉽습니다. 매일 아침 AI에게 할 일을 정리해 3개로 줄여 달라고 하세요.',
      E1: '외향성이 높음: 말하면서 생각해서 조용한 검증을 건너뛰기 쉽습니다. 행동하기 전에 AI의 답을 혼자 한 번 읽으세요.',
      E0: '내향적인 편: AI 결과를 혼자만 갖고 있기 쉽습니다. 매주 AI와 만든 초안 하나를 동료에게 보여 주세요.',
      A1: '친화성이 높음: AI의 첫 답을 정중히 받아들입니다. 반대편 입장에서 반박해 달라고 하세요.',
      A0: '친화성이 낮은 편: 답을 빠르게 받거나 버립니다. 어조를 부드럽게 하고 상대가 필요한 것을 짚어 달라고 하세요.',
      N1: '압박에서 침착함: 확인을 덜 하기 쉽습니다. 확실하다고 여기는 가정을 AI에게 나열시키세요.',
      N0: '위험에 민감한 편: 확인을 끝없이 반복하기 쉽습니다. 5개 항목 체크리스트를 정하고 통과하면 멈추세요.',
    },
    tips: {
      O1: [
        { t: 'AI는 자판기가 아니라 아이디어 스파링 파트너로', b: '개방성이 높으면 아이디어는 쉽게 나오고 병목은 선택입니다. AI에게 회의적인 투자자 역할을 맡겨 모으기를 멈추고 결정하세요.', p: '내가 고민 중인 아이디어 5개야: [목록]. 회의적인 투자자 역할로 영향 대비 노력으로 순위를 매기고, 버려야 할 2개와 이유를 알려줘.', a: '실제 결정 하나에 써 보고, 아이디어를 하나 이상 진짜로 버리세요.' },
        { t: '탐색에 시간 제한을 두세요', b: '호기심이 끝없는 도구 갈아타기가 되기도 합니다. 정해진 시간이 발견은 살리고 표류는 없앱니다.', p: '[주제]를 탐색할 시간이 45분 있어. 15분 지형 파악, 15분 한 가지 접근 시험, 15분 결정의 3단계 계획을 짜 주고 지키게 해 줘.', a: '30일 동안 AI 도구 하나만 쓰고, 갈아타고 싶어질 때마다 적어 보세요.' },
      ],
      O0: [
        { t: '검증된 방법을 재사용 템플릿으로', b: '효과가 있는 방식을 신뢰하는 유형입니다. AI는 방법을 더 빨리 반복하는 데 탁월해서 일하는 방식을 바꾸지 않아도 이득이 있습니다.', p: '내가 [업무]를 지금 하는 방식은 이래: [단계]. 이것을 [빈칸]이 있는 재사용 템플릿으로 만들고, 방식을 바꾸지 않고 AI로 시간을 아낄 곳 3곳을 알려줘.', a: '매주 하는 일 하나를 템플릿으로 만들고 다음 두 번 걸린 시간을 재 보세요.' },
        { t: '한 달에 한 번 AI가 내 기본값에 도전하게', b: '늘 통하던 방법이 어느새 최선이 아닐 수 있습니다. 위험을 함께 달라고 하면 시도가 안전하게 느껴집니다.', p: '[업무]에 대한 내 기본 접근은 이래: [접근]. 다른 분야나 회사에서 쓰는 대안 3개를 각각의 위험과 함께 알려주고, 가장 좋은 대안을 낮은 위험으로 시험하는 작은 방법 하나를 제안해 줘.', a: '목록에서 작은 실험 하나를 해 보세요.' },
      ],
      C1: [
        { t: '계획은 맡기고 판단은 내가', b: '계획을 잘 세우는 유형입니다. 틀은 AI가 초안을 잡고, 시간은 결정에 쓰세요.', p: '[프로젝트]를 마일스톤, 할 일, 담당자, 완료 기준으로 쪼개 줘. 밀릴 가능성이 가장 큰 3개와 이유를 표시해 줘.', a: '손으로 만들던 계획 하나를 대신 맡기고, 빈 문서가 아니라 초안을 고치세요.' },
        { t: '“충분히 좋음” 기준을 세우세요', b: '성실성이 높으면 끝없이 다듬을 수 있습니다. 기준이 있으면 멈출 때를 알게 됩니다.', p: '이 초안을 명확성, 정확성, 독자 적합성 3가지 기준으로 검토해 줘. 80% 완성이라 보내도 되는지 알려주고, 꼭 필요한 수정만 최대 3개 알려줘.', a: '이번 주에 하나를 80%에서 보내세요.' },
      ],
      C0: [
        { t: 'AI를 외부 구조로 쓰세요', b: '유연함은 작은 일이 쌓이기 전까지는 강점입니다. 분류는 AI에게 맡기고 에너지는 일에 쓰세요.', p: '내 어수선한 할 일 목록이야: [붙여넣기]. 마감과 노력 기준으로 묶고, 오늘의 상위 3개를 고른 뒤 각각 25분짜리 첫 단계를 알려줘.', a: '5일 동안 매일 아침 해 보세요.' },
        { t: 'AI를 하루 마감 점검 상대로', b: '5분짜리 마무리 의식이 계획형 인간이 되지 않고도 미완료가 이월되는 것을 막아 줍니다.', p: '내 하루 마감 점검 상대가 돼 줘. 3가지를 물어봐: 끝낸 것, 진전된 것, 버릴 것. 그리고 내일의 상위 3개 초안을 써 줘.', a: '퇴근 전 5분 반복 알림을 설정하세요.' },
      ],
      E1: [
        { t: '음성 모드로 소리 내어 생각하기', b: '말할 때 생각이 가장 잘 정리되는 유형입니다. 음성 모드로 말하고도 메모가 남습니다.', p: '[문제]에 대해 3분 동안 말해볼게. 끼어들지 마. 끝나면 내 요점, 빠진 부분, 내가 답해야 할 질문 3개를 정리해 줘.', a: '산책이나 출퇴근길에 해 보세요.' },
        { t: '에너지를 주는 대화를 AI로 준비하기', b: '회의는 당신이 빛나는 곳입니다. 조금만 준비하면 더 날카롭고 짧아집니다.', p: '[사람]과 [주제]로 만나. 상대의 예상 걱정, 내가 할 질문 3개, 두 문장 오프닝을 알려줘.', a: '회의 하나를 이렇게 준비하고 결과를 비교해 보세요.' },
      ],
      E0: [
        { t: 'AI로 준비하면 회의에 드는 에너지가 줄어듭니다', b: '사람이 모이기 전에 가장 잘 생각하는 유형입니다. 요점을 미리 정리하면 말이 짧고 차분해집니다.', p: '안건과 내 메모야: [붙여넣기]. 내 핵심 요점 3개, 질문 2개, 한 줄 입장을 써 줘서 간결하게 말할 수 있게 해 줘.', a: '다음 회의 전에 쓰고, 요점을 글로 먼저 보내 보세요.' },
        { t: '미루던 연락 메시지를 초안으로', b: '시작이 가장 어렵습니다. 내 말투의 초안이 있으면 첫걸음이 작아집니다.', p: '[사람]에게 [목표]를 위한 짧고 따뜻한 메시지를 써 줘. 내 말투로 2문장과 5문장 버전을 줘. 내 글 샘플: [붙여넣기]', a: '미뤄 둔 메시지 하나를 보내세요.' },
      ],
      A1: [
        { t: '어려운 피드백을 친절하고 분명하게', b: '따뜻함이 강점이지만 너무 부드러우면 요점이 사라집니다. 부드러운 버전과 단호한 버전을 비교해 고르세요.', p: '[사람]에게 [문제]를 말해야 해. 친절하지만 모호하지 않고, 구체적인 요청 하나와 기한이 있는 메시지를 써 줘. 더 부드러운 버전과 더 단호한 버전을 둘 다 보여 줘.', a: '평소 피하던 버전을 보내 보세요.' },
        { t: 'AI에게 나를 반박시키기', b: '친화적인 사람은 생각보다 많이 양보합니다. 강한 반대 논리가 내가 값을 매기지 않은 것을 보여 줍니다.', p: '내가 취하려는 입장이야: [입장]. 까다로운 협상가로서 가장 강한 반대 논리를 펼쳐 줘. 내가 값을 매기지 않고 포기하는 것이 뭐지?', a: '다음 협상이나 합의 전에 써 보세요.' },
      ],
      A0: [
        { t: '보내기 전에 모서리를 다듬기', b: '직설은 효율적이지만 호감을 잃을 수 있습니다. 요점은 지키고 어조는 AI에게 점검받으세요.', p: '이 메시지의 요점과 결정은 그대로 두고 덜 거칠게 읽히도록 다시 써 줘: [붙여넣기]. 무엇을 왜 바꿨는지 보여 줘.', a: '원문과 수정본을 비교한 뒤 보내세요.' },
        { t: '상대의 인센티브를 AI로 보기', b: '결론이 빠른 유형입니다. 상대의 목표를 먼저 보면 더 빨리 승낙을 얻는 경우가 많습니다.', p: '이 상황을 [사람]의 관점에서 설명해 줘: 목표, 두려움, 승낙하려면 필요한 것. 그리고 내 답장의 첫 문장을 제안해 줘.', a: '이번 주 의견 충돌 하나에 써 보세요.' },
      ],
      N1: [
        { t: '침착함을 사전 부검에 쓰세요', b: '남들이 서두를 때 평정을 유지하는 유형입니다. 실패를 먼저 상상하는 데 그 강점을 쓰세요.', p: '[계획]이 6개월 뒤 실패했다고 가정해 줘. 가능성이 높은 이유 7가지를 확률 순으로, 각각의 조기 경고 신호와 함께 알려줘.', a: '다음 프로젝트에 해 보고 가장 큰 경고 신호를 캘린더에 넣으세요.' },
        { t: '확인을 덜 하는 것을 조심하세요', b: '침착함은 두 번째 확인을 건너뛰는 것이 될 수 있습니다. 가정 점검은 5분이면 됩니다.', p: '[계획 또는 숫자]를 검토하고 내가 확실하다고 여기는 가정을 나열해 줘. 각각 무엇이 나타나면 틀린 걸로 볼 수 있어?', a: '가장 위험한 가정 하나를 이번 주에 검증하세요.' },
      ],
      N0: [
        { t: '걱정을 체크리스트로 바꾸세요', b: '위험에 대한 민감함은 실제 문제를 잡아냅니다. 내가 통제하는 것과 아닌 것을 나누면 유용하게 쓰입니다. (업무 습관 팁이며 정신건강 도구가 아닙니다.)', p: '[상황]이 걱정돼. 내가 통제할 수 있는 것과 없는 것을 나눠 줘. 통제 가능한 부분은 다음에 할 작은 행동을 알려줘.', a: '오늘 첫 작은 행동을 하세요.' },
        { t: '멈춤 규칙이 있는 검증 루틴', b: '위험에 민감하면 확인이 끝없어질 수 있습니다. 정해진 목록이 끝났음을 알려 줍니다.', p: '[작업]을 보내거나 배포하기 전에 확인할 5개 항목 체크리스트와 멈춤 규칙을 알려줘. 5개가 모두 통과하면 멈출 거야.', a: '같은 체크리스트를 세 건에 쓰고 통과하면 멈추세요.' },
      ],
    },
  },
};
