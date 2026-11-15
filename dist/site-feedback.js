// Use the Google Forms prefilled URL with distinct placeholders in its four fields.
const formTemplate = 'https://docs.google.com/forms/d/e/1FAIpQLSdI5q1XejCi9o03bpEo0G6nrivKq0SVd1mmHqnwzkHMIoy32g/viewform?usp=pp_url&entry.1801361304=SCOPE_TOKEN&entry.921913319=PAGE_TOKEN&entry.2020196522=TYPE_TOKEN&entry.1569020841=BODY_TOKEN';

export function mountFeedback(template = formTemplate) {
  if (!template) return;
  const formUrl = new URL(template);
  if (formUrl.origin !== 'https://docs.google.com' ||
      !/^\/forms\/(?:u\/\d+\/)?d\/(?:e\/)?[^/]+\/viewform$/.test(formUrl.pathname)) return;
  const tokens = ['SCOPE_TOKEN', 'PAGE_TOKEN', 'TYPE_TOKEN', 'BODY_TOKEN'];
  if (!tokens.every(token => [...formUrl.searchParams.values()].includes(token))) return;

  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'site-feedback-launcher';
  launcher.textContent = '意見回饋';
  const dialog = document.createElement('dialog');
  dialog.className = 'site-feedback-dialog';
  dialog.setAttribute('aria-labelledby', 'site-feedback-title');
  dialog.innerHTML = `<h2 id="site-feedback-title">意見回饋</h2>
    <form>
      <label>回饋範圍<select name="scope"><option>目前單元</option><option>全站</option></select></label>
      <p class="site-feedback-source"></p>
      <label>問題類型<select name="type"><option>題目或答案有誤</option><option>文字看不懂</option><option>操作或畫面有問題</option><option>功能建議</option></select></label>
      <label>回饋內容<textarea name="body" required rows="3" maxlength="500" placeholder="在哪一步遇到問題？你原本預期會發生什麼？"></textarea></label>
      <label class="site-feedback-question" hidden>附上題目<select name="question"></select></label>
      <p>請省略姓名、聯絡方式等個人資料。開啟表單後，還需要按一次「提交」。</p>
      <div class="site-feedback-actions"><button type="button" data-close>取消</button><button type="submit">開啟表單 ↗</button></div>
    </form>`;
  document.body.append(launcher, dialog);
  const form = dialog.querySelector('form');
  const {scope, type, body, question} = form.elements;
  const source = document.title.split('｜')[0];
  const onHome = /\/(?:index\.html)?$/.test(location.pathname);
  let questions = [];
  launcher.onclick = () => {
    scope.value = onHome ? '全站' : '目前單元';
    scope.options[0].disabled = onHome;
    dialog.querySelector('.site-feedback-source').textContent = `來源頁面：${source}`;
    questions = [...document.querySelectorAll('#questions .question-prompt')]
      .map(node => node.textContent.trim());
    question.replaceChildren(new Option('不附上題目', ''), ...questions.map((_, index) =>
      new Option(`第 ${index + 1} 題`, String(index))));
    question.closest('label').hidden = questions.length === 0;
    dialog.showModal();
  };
  dialog.querySelector('[data-close]').onclick = () => dialog.close();
  form.onsubmit = event => {
    event.preventDefault();
    if (!body.value.trim()) {
      body.focus();
      return;
    }
    const detail = question.value === '' ? '' : `\n\n第 ${Number(question.value) + 1} 題：${questions[Number(question.value)]}`;
    const target = new URL(formUrl);
    const values = [scope.value, `${source}（${location.origin}${location.pathname}）`, type.value, body.value.trim() + detail];
    for (const [name, value] of formUrl.searchParams) {
      const index = tokens.indexOf(value);
      if (index >= 0) target.searchParams.set(name, values[index]);
    }
    window.open(target.href, '_blank', 'noopener,noreferrer');
    dialog.close();
  };
}
