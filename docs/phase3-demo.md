# Phase 3 demo script (2.2.0): content and the question writer

Time: about 15 minutes. You need an admin account, a caregiver with a Grade 5 or 6 student and an approved device.

0. **Every Grade 5-6 strand now has content.** On the learning home, Grade 5 and Grade 6 show Number, Algebra, Data, Spatial Sense and Financial Literacy as available. Open the skill map and use "Practice this" on any node: it now practices just that expectation.
1. **New Number content.** Sign in as the student, pick Grade 6, topic B (Number), and Start practice. Questions now cover place value, rounding, integers, percents, ratios, decimals to thousandths and primes. Open "Show me how" on any of them for the matching lesson.
2. **Report a question.** Under any question press "Report this question" and choose a reason. You can report a question once; a grown-up reviews reports in Admin.
3. **Turn on the question writer (admin).** Add `ANTHROPIC_API_KEY` to `.env`, optionally set `AI_MONTHLY_CAP_USD` and the two price lines, and restart. Open Admin > Question writer.
4. **Write drafts.** Pick a skill and tier, ask for 5, and press "Write drafts". Each draft is re-computed by our own maths; drafts with a wrong answer, banned wording, a link or broken maths markup are dropped, and the summary says so.
5. **Review.** Read the English and French text and the computed answer, then Approve or Reject. Only approved items are served, about one question in four for that skill and tier.
6. **Reports and retiring.** Student reports appear under "Student reports". Two different students reporting the same AI item retires it automatically; you can also retire one yourself.
7. **Spend.** The panel shows spend against the monthly cap; "Usage this month" lists calls and estimated cost per day. When the next call could pass the cap, generation stops with a clear message.

What is not in this phase: Grade 5-6 strands C to F, other grades, rewards and themes (Phase 4), the PWA and offline practice (Phase 5).
