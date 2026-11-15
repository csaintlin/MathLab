const gradeNames = ['一', '二', '三', '四', '五', '六'];
const gradeTabs = [...document.querySelectorAll('[data-grade]')];
const termButtons = [...document.querySelectorAll('[data-term]')];
const unitLists = [...document.querySelectorAll('[data-unit-grade]')];
const descriptions = {
  2: '轉時鐘、裝餅乾、比輕重、量水量，動手發現數學。',
  3: '量長度、轉開口、拼方格、倒水、切分數長條。',
  4: '量角度、分三角形、拼方格、畫圖表。',
  5: '從平面圖形、立體模型到分數，動手找出數學規律。',
  6: '探索分數、比例、圓的剪拼與滾動，還有兩台車的速率。'
};
let currentGrade = 5;
let currentTerm = 1;

function showUnits(grade, term) {
  currentGrade = grade;
  currentTerm = term;

  gradeTabs.forEach(tab => {
    const selected = Number(tab.dataset.grade) === grade;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  termButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(Number(button.dataset.term) === term));
  });

  let count = 0;
  unitLists.forEach(list => {
    const selected = Number(list.dataset.unitGrade) === grade && Number(list.dataset.unitTerm) === term;
    list.hidden = !selected;
    if (selected) count += [...list.children].filter(card => !card.hidden).length;
  });

  const gradeName = `${gradeNames[grade - 1]}年級`;
  const termName = term === 1 ? '上學期' : '下學期';
  document.getElementById('grade-panel').setAttribute('aria-labelledby', `grade-tab-${grade}`);
  document.getElementById('grade-title').textContent = `${gradeName}探索區`;
  document.getElementById('unit-count').textContent = `${count} 個單元`;
  document.getElementById('grade-description').textContent = count > 0 ? descriptions[grade] ?? '' : '';
  document.getElementById('empty-grade').hidden = count > 0;
  document.getElementById('empty-title').textContent = `${gradeName}${termName}目前還沒有探索單元`;
}

gradeTabs.forEach((tab, index) => {
  tab.onclick = () => showUnits(Number(tab.dataset.grade), currentTerm);
  tab.onkeydown = event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % gradeTabs.length;
    else if (event.key === 'ArrowLeft') next = (index + gradeTabs.length - 1) % gradeTabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = gradeTabs.length - 1;
    else return;
    event.preventDefault();
    showUnits(Number(gradeTabs[next].dataset.grade), currentTerm);
    gradeTabs[next].focus();
  };
});

termButtons.forEach(button => {
  button.onclick = () => showUnits(currentGrade, Number(button.dataset.term));
});

document.getElementById('back-to-fifth').onclick = () => {
  showUnits(5, 1);
  gradeTabs[4].focus();
};

function selectFromHash() {
  const match = location.hash.match(/^#grade-([1-6])$/);
  if (match) showUnits(Number(match[1]), 1);
}

window.addEventListener('hashchange', selectFromHash);
selectFromHash();
