function renderQuiz(container, questions, passPct, onFinish) {
  let current = 0;
  let answered = false;
  let correctCount = 0;
  const userAnswers = new Array(questions.length).fill(null);

  function letterFor(idx) {
    return ['A', 'B', 'C', 'D'][idx];
  }

  function renderQuestion() {
    answered = userAnswers[current] !== null;
    const q = questions[current];
    const entries = Object.entries(q.options);

    container.innerHTML = `
      <div class="quiz-progress">Question ${current + 1} of ${questions.length}</div>
      <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${(current / questions.length) * 100}%"></div></div>
      <div class="quiz-question" style="margin-top:18px;">${q.q}</div>
      <div class="quiz-options"></div>
      <div class="quiz-rationale-slot"></div>
      <div class="quiz-nav">
        <button class="btn btn-outline" id="quiz-prev" ${current === 0 ? 'disabled' : ''}>Back</button>
        <button class="btn btn-solid" id="quiz-next" ${answered ? '' : 'disabled'}>${current === questions.length - 1 ? 'See Results' : 'Next'}</button>
      </div>
    `;

    const optionsWrap = container.querySelector('.quiz-options');
    entries.forEach(([key, text]) => {
      const opt = document.createElement('div');
      opt.className = 'quiz-option';
      opt.dataset.key = key;
      opt.innerHTML = `<span class="opt-letter">${key}.</span><span>${text}</span>`;
      optionsWrap.appendChild(opt);
    });

    if (answered) {
      showAnswerState(userAnswers[current]);
    }

    optionsWrap.querySelectorAll('.quiz-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        if (userAnswers[current] !== null) return;
        const key = opt.dataset.key;
        userAnswers[current] = key;
        if (key === q.correct) correctCount++;
        showAnswerState(key);
        container.querySelector('#quiz-next').disabled = false;
      });
    });

    container.querySelector('#quiz-prev').addEventListener('click', () => {
      if (current > 0) {
        current--;
        renderQuestion();
      }
    });

    container.querySelector('#quiz-next').addEventListener('click', () => {
      if (current < questions.length - 1) {
        current++;
        renderQuestion();
      } else {
        showResults();
      }
    });
  }

  function showAnswerState(selectedKey) {
    const q = questions[current];
    const optionsWrap = container.querySelector('.quiz-options');
    optionsWrap.querySelectorAll('.quiz-option').forEach((opt) => {
      opt.style.cursor = 'default';
      if (opt.dataset.key === q.correct) {
        opt.classList.add('correct');
      } else if (opt.dataset.key === selectedKey) {
        opt.classList.add('incorrect');
      }
    });
    const rationaleSlot = container.querySelector('.quiz-rationale-slot');
    rationaleSlot.innerHTML = `<div class="quiz-rationale"><strong>Rationale:</strong> ${q.rationale}</div>`;
  }

  function showResults() {
    const scorePct = Math.round((correctCount / questions.length) * 100);
    const passed = scorePct >= passPct;
    container.innerHTML = `
      <div class="quiz-result ${passed ? '' : 'failed'}">
        <div class="score-circle">
          <div class="score-pct">${scorePct}%</div>
          <div class="score-label">${correctCount}/${questions.length} correct</div>
        </div>
        <h2>${passed ? 'Well done — you passed!' : 'Not quite there yet'}</h2>
        <p>${passed
          ? 'You have met the pass mark of ' + passPct + '% for this assessment.'
          : 'You need ' + passPct + '% to pass. Review the module content and try again.'}</p>
        <div id="quiz-result-actions" style="margin-top:24px; display:flex; gap:12px; justify-content:center; flex-wrap:wrap;"></div>
      </div>
    `;
    if (typeof onFinish === 'function') {
      onFinish(scorePct, passed, container.querySelector('#quiz-result-actions'));
    }
  }

  renderQuestion();
}
