function renderFinalPage() {
  if (!isFinalUnlocked()) {
    document.getElementById('final-locked').style.display = 'block';
    document.getElementById('final-intro-view').style.display = 'none';
    return;
  }

  document.getElementById('final-start-quiz').addEventListener('click', startFinalQuiz);
}

function startFinalQuiz() {
  document.getElementById('final-intro-view').style.display = 'none';
  document.getElementById('final-quiz-view').style.display = 'block';

  const questions = pickRandomQuestions(QUESTION_BANK.final, FINAL_QUIZ_SIZE);
  const container = document.getElementById('final-quiz-container');

  renderQuiz(container, questions, FINAL_PASS_PCT, (scorePct, passed, actionsEl) => {
    recordFinalResult(scorePct, passed);

    const retryBtn = document.createElement('button');
    retryBtn.className = 'btn btn-outline';
    retryBtn.textContent = 'Retake Assessment';
    retryBtn.addEventListener('click', startFinalQuiz);
    actionsEl.appendChild(retryBtn);

    const portalBtn = document.createElement('a');
    portalBtn.className = 'btn btn-solid';
    portalBtn.href = 'portal.html';
    portalBtn.textContent = 'Back to Portal';
    actionsEl.appendChild(portalBtn);
  });
}

document.addEventListener('DOMContentLoaded', renderFinalPage);
