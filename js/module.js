function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function renderModulePage() {
  const num = parseInt(getQueryParam('m'), 10);
  const moduleData = MODULE_CONTENT.find((m) => m.num === num);

  if (!moduleData || !isModuleUnlocked(num)) {
    document.getElementById('module-not-found').style.display = 'block';
    document.getElementById('module-content-view').style.display = 'none';
    return;
  }

  document.title = `Module ${num}: ${moduleData.title} — DNT Implant Dentistry`;
  document.getElementById('mc-breadcrumb-title').textContent = `Module ${num}`;
  document.getElementById('mc-badge').textContent = `Module ${num} of ${TOTAL_MODULES}`;
  document.getElementById('mc-title').textContent = moduleData.title;
  document.getElementById('mc-intro').textContent = moduleData.intro;

  const objectivesEl = document.getElementById('mc-objectives');
  moduleData.objectives.forEach((obj) => {
    const li = document.createElement('li');
    li.textContent = obj;
    objectivesEl.appendChild(li);
  });

  const sectionsEl = document.getElementById('mc-sections');
  moduleData.sections.forEach((section) => {
    const wrap = document.createElement('div');
    wrap.className = 'content-section';

    const heading = document.createElement('h3');
    heading.textContent = section.heading;
    wrap.appendChild(heading);

    (section.paragraphs || []).forEach((p) => {
      const para = document.createElement('p');
      para.textContent = p;
      wrap.appendChild(para);
    });

    if (section.list && section.list.length) {
      const ul = document.createElement('ul');
      section.list.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
    }

    (section.closing || []).forEach((p) => {
      const para = document.createElement('p');
      para.textContent = p;
      wrap.appendChild(para);
    });

    sectionsEl.appendChild(wrap);
  });

  const glossaryEl = document.getElementById('mc-glossary');
  moduleData.glossary.forEach(([term, def]) => {
    const dt = document.createElement('dt');
    dt.textContent = term;
    const dd = document.createElement('dd');
    dd.textContent = def;
    const item = document.createElement('div');
    item.className = 'glossary-term';
    item.appendChild(dt);
    item.appendChild(dd);
    glossaryEl.appendChild(item);
  });

  document.getElementById('mc-start-quiz').addEventListener('click', () => {
    startModuleQuiz(num, moduleData);
  });
}

function startModuleQuiz(num, moduleData) {
  document.getElementById('module-content-view').style.display = 'none';
  document.getElementById('module-quiz-view').style.display = 'block';
  document.getElementById('mq-breadcrumb-title').textContent = `Module ${num}`;
  document.getElementById('mq-title').textContent = `${moduleData.title} — Quiz`;

  const pool = QUESTION_BANK.modules[String(num)].questions;
  const questions = pickRandomQuestions(pool, MODULE_QUIZ_SIZE);
  const container = document.getElementById('mq-quiz-container');

  renderQuiz(container, questions, MODULE_PASS_PCT, (scorePct, passed, actionsEl) => {
    recordModuleResult(num, scorePct, passed);

    const retryBtn = document.createElement('button');
    retryBtn.className = 'btn btn-outline';
    retryBtn.textContent = 'Retake Quiz';
    retryBtn.addEventListener('click', () => startModuleQuiz(num, moduleData));
    actionsEl.appendChild(retryBtn);

    const portalBtn = document.createElement('a');
    portalBtn.className = 'btn btn-solid';
    portalBtn.href = 'portal.html';
    portalBtn.textContent = passed ? 'Back to Portal' : 'Review Module Content';
    if (!passed) {
      portalBtn.href = `module.html?m=${num}`;
    }
    actionsEl.appendChild(portalBtn);

    if (passed && num < TOTAL_MODULES) {
      const nextBtn = document.createElement('a');
      nextBtn.className = 'btn btn-solid';
      nextBtn.href = `module.html?m=${num + 1}`;
      nextBtn.textContent = 'Next Module';
      actionsEl.appendChild(nextBtn);
    }
  });
}

document.addEventListener('DOMContentLoaded', renderModulePage);
