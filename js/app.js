const TOTAL_MODULES = 10;
const PROGRESS_KEY = 'implantProgress';
const MODULE_PASS_PCT = 75;
const FINAL_PASS_PCT = 75;
const MODULE_QUIZ_SIZE = 15;
const FINAL_QUIZ_SIZE = 20;

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function isModuleComplete(num) {
  const progress = loadProgress();
  return !!(progress[num] && progress[num].passed);
}

function isModuleUnlocked(num) {
  if (num === 1) return true;
  return isModuleComplete(num - 1);
}

function recordModuleResult(num, scorePct, passed) {
  const progress = loadProgress();
  const existing = progress[num] || {};
  progress[num] = {
    passed: existing.passed || passed,
    bestScore: Math.max(existing.bestScore || 0, scorePct),
    attempts: (existing.attempts || 0) + 1
  };
  saveProgress(progress);
}

function allModulesComplete() {
  for (let i = 1; i <= TOTAL_MODULES; i++) {
    if (!isModuleComplete(i)) return false;
  }
  return true;
}

function isFinalUnlocked() {
  return allModulesComplete();
}

function isFinalComplete() {
  const progress = loadProgress();
  return !!(progress.final && progress.final.passed);
}

function recordFinalResult(scorePct, passed) {
  const progress = loadProgress();
  const existing = progress.final || {};
  progress.final = {
    passed: existing.passed || passed,
    bestScore: Math.max(existing.bestScore || 0, scorePct),
    attempts: (existing.attempts || 0) + 1
  };
  saveProgress(progress);
}

function completedModuleCount() {
  let count = 0;
  for (let i = 1; i <= TOTAL_MODULES; i++) {
    if (isModuleComplete(i)) count++;
  }
  return count;
}

function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandomQuestions(pool, count) {
  const shuffled = shuffleArray(pool);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function wireLockButton() {
  const btn = document.querySelector('.lock-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      if (typeof lockSite === 'function') lockSite();
    });
  }
}

document.addEventListener('DOMContentLoaded', wireLockButton);
