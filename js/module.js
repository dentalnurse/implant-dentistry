function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function buildSectionEl(section) {
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

  if (section.image) {
    const fig = document.createElement('figure');
    fig.className = 'section-media';
    const img = document.createElement('img');
    img.src = section.image.src;
    img.alt = section.image.alt || '';
    img.loading = 'lazy';
    img.onerror = () => { fig.hidden = true; };
    fig.appendChild(img);
    if (section.image.caption) {
      const cap = document.createElement('figcaption');
      cap.textContent = section.image.caption;
      fig.appendChild(cap);
    }
    wrap.appendChild(fig);
  }

  if (section.images) {
    const gallery = document.createElement('div');
    gallery.className = 'section-gallery';
    section.images.forEach((imgData) => {
      const fig = document.createElement('figure');
      fig.className = 'section-media';
      const img = document.createElement('img');
      img.src = imgData.src;
      img.alt = imgData.alt || '';
      img.loading = 'lazy';
      img.onerror = () => { fig.hidden = true; };
      fig.appendChild(img);
      if (imgData.caption) {
        const cap = document.createElement('figcaption');
        cap.textContent = imgData.caption;
        fig.appendChild(cap);
      }
      gallery.appendChild(fig);
    });
    wrap.appendChild(gallery);
  }

  if (section.video) {
    const fig = document.createElement('figure');
    fig.className = 'section-media section-video';
    const video = document.createElement('video');
    video.src = section.video.src;
    video.controls = true;
    video.preload = 'metadata';
    fig.appendChild(video);
    if (section.video.caption) {
      const cap = document.createElement('figcaption');
      cap.textContent = section.video.caption;
      fig.appendChild(cap);
    }
    wrap.appendChild(fig);
  }

  return wrap;
}

function renderModulePage() {
  const num = parseInt(getQueryParam('m'), 10);
  const moduleData = MODULE_CONTENT.find((m) => m.num === num);

  if (!moduleData || !isModuleUnlocked(num)) {
    document.getElementById('module-not-found').style.display = 'block';
    document.getElementById('module-content-view').style.display = 'none';
    return;
  }

  document.title = `Module ${num}: ${moduleData.title} - DNT Implant Dentistry`;
  document.getElementById('mc-breadcrumb-title').textContent = `Module ${num}`;
  document.getElementById('mc-badge').textContent = `Module ${num} of ${TOTAL_MODULES}`;
  document.getElementById('mc-title').textContent = moduleData.title;
  document.getElementById('mc-intro').textContent = moduleData.intro;

  // Build pages: objectives, each section, glossary
  // page 0 = objectives; pages 1..n = sections; page n+1 = glossary
  const totalPages = 1 + moduleData.sections.length + 1;
  let currentPage = 0;

  // Objectives content (page 0)
  const objectivesEl = document.getElementById('mc-objectives');
  moduleData.objectives.forEach((obj) => {
    const li = document.createElement('li');
    li.textContent = obj;
    objectivesEl.appendChild(li);
  });

  // Section elements
  const sectionsEl = document.getElementById('mc-sections');
  const sectionEls = moduleData.sections.map((section) => {
    const el = buildSectionEl(section);
    el.style.display = 'none';
    sectionsEl.appendChild(el);
    return el;
  });

  // Glossary content
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

  // Wrap objectives and glossary for show/hide
  const objectivesWrap = document.querySelector('.objectives-list');
  const glossaryWrap = document.getElementById('mc-glossary').closest('div') ||
    (() => {
      const w = document.createElement('div');
      glossaryEl.parentNode.insertBefore(w, glossaryEl);
      w.appendChild(glossaryEl);
      return w;
    })();
  const glossaryHeading = document.querySelector('#module-content-view h2[data-glossary]') ||
    (() => {
      const h = document.createElement('h2');
      h.textContent = 'Module Glossary';
      h.style.marginTop = '40px';
      h.setAttribute('data-glossary', '1');
      glossaryEl.parentNode.insertBefore(h, glossaryEl);
      return h;
    })();

  // Remove static glossary heading already in HTML
  const existingGlossaryH2 = document.querySelector('#module-content-view > h2');
  if (existingGlossaryH2) existingGlossaryH2.remove();

  // Progress bar + nav controls
  const progressBar = document.createElement('div');
  progressBar.className = 'step-progress';
  progressBar.innerHTML = `
    <div class="step-progress-track"><div class="step-progress-fill" id="step-fill"></div></div>
    <span class="step-label" id="step-label"></span>
  `;
  const contentView = document.getElementById('module-content-view');
  const badgeEl = document.getElementById('mc-badge');
  badgeEl.parentNode.insertBefore(progressBar, badgeEl.nextSibling);

  const navBar = document.createElement('div');
  navBar.className = 'step-nav';
  navBar.innerHTML = `
    <button class="btn btn-outline" id="step-prev">&#8592; Previous</button>
    <button class="btn btn-solid" id="step-next">Next &#8594;</button>
  `;
  contentView.appendChild(navBar);

  const quizWrap = document.getElementById('mc-start-quiz').parentElement;
  quizWrap.style.display = 'none';

  function showPage(p) {
    currentPage = p;
    const isObjectives = p === 0;
    const isGlossary = p === totalPages - 1;
    const sectionIndex = p - 1;

    objectivesWrap.style.display = isObjectives ? '' : 'none';
    sectionEls.forEach((el, i) => { el.style.display = (i === sectionIndex) ? '' : 'none'; });
    glossaryHeading.style.display = isGlossary ? '' : 'none';
    glossaryEl.style.display = isGlossary ? '' : 'none';

    const pct = Math.round((p / (totalPages - 1)) * 100);
    document.getElementById('step-fill').style.width = pct + '%';
    document.getElementById('step-label').textContent = `Step ${p + 1} of ${totalPages}`;

    document.getElementById('step-prev').style.visibility = p === 0 ? 'hidden' : 'visible';
    const nextBtn = document.getElementById('step-next');
    if (p === totalPages - 1) {
      nextBtn.textContent = 'Start Quiz';
      nextBtn.className = 'btn btn-solid';
    } else {
      nextBtn.textContent = 'Next →';
      nextBtn.className = 'btn btn-solid';
    }

    window.scrollTo(0, 0);
  }

  document.getElementById('step-prev').addEventListener('click', () => {
    if (currentPage > 0) showPage(currentPage - 1);
  });

  document.getElementById('step-next').addEventListener('click', () => {
    if (currentPage < totalPages - 1) {
      showPage(currentPage + 1);
    } else {
      startModuleQuiz(num, moduleData);
    }
  });

  showPage(0);
}

function startModuleQuiz(num, moduleData) {
  document.getElementById('module-content-view').style.display = 'none';
  document.getElementById('module-quiz-view').style.display = 'block';
  document.getElementById('mq-breadcrumb-title').textContent = `Module ${num}`;
  document.getElementById('mq-title').textContent = `${moduleData.title} - Quiz`;

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
