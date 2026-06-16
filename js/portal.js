function renderPortal() {
  const listEl = document.getElementById('module-list');
  const finalWrap = document.getElementById('final-card-wrap');
  const progressLabel = document.getElementById('overall-progress-label');
  const progressFill = document.getElementById('overall-progress-fill');

  const completeCount = completedModuleCount();
  progressLabel.textContent = `${completeCount} of ${TOTAL_MODULES} modules complete`;
  progressFill.style.width = `${(completeCount / TOTAL_MODULES) * 100}%`;

  listEl.innerHTML = '';
  MODULE_CONTENT.forEach((m) => {
    const unlocked = isModuleUnlocked(m.num);
    const complete = isModuleComplete(m.num);
    const progress = loadProgress();
    const best = progress[m.num] ? progress[m.num].bestScore : null;

    const card = document.createElement('div');
    card.className = `module-card ${unlocked ? 'unlocked' : 'locked'}`;

    let statusHtml;
    if (complete) {
      statusHtml = `<span class="status status-complete">Complete &middot; best score ${best}%</span>`;
    } else if (unlocked) {
      statusHtml = `<span class="status status-available">Available</span>`;
    } else {
      statusHtml = `<span class="status status-locked">Locked</span>`;
    }

    card.innerHTML = `
      <span class="module-number">${m.num}</span>
      <h3>${m.title}</h3>
      ${statusHtml}
    `;

    if (unlocked) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        window.location.href = `module.html?m=${m.num}`;
      });
    }

    listEl.appendChild(card);
  });

  const finalUnlocked = isFinalUnlocked();
  const finalComplete = isFinalComplete();
  const progress = loadProgress();
  const finalBest = progress.final ? progress.final.bestScore : null;

  const finalCard = document.createElement('div');
  finalCard.className = `module-card ${finalUnlocked ? 'unlocked' : 'locked'}`;
  finalCard.style.maxWidth = '360px';

  let finalStatusHtml;
  if (finalComplete) {
    finalStatusHtml = `<span class="status status-complete">Complete &middot; best score ${finalBest}%</span>`;
  } else if (finalUnlocked) {
    finalStatusHtml = `<span class="status status-available">Available</span>`;
  } else {
    finalStatusHtml = `<span class="status status-locked">Complete all 10 modules to unlock</span>`;
  }

  finalCard.innerHTML = `
    <span class="module-number">F</span>
    <h3>Final Assessment</h3>
    <p style="font-size:0.88rem; color:var(--text-muted); margin:0;">20 random questions drawn from a pool of 40, covering all ten modules. 75% required to pass.</p>
    ${finalStatusHtml}
  `;

  if (finalUnlocked) {
    finalCard.style.cursor = 'pointer';
    finalCard.addEventListener('click', () => {
      window.location.href = 'final.html';
    });
  }

  finalWrap.appendChild(finalCard);
}

document.addEventListener('DOMContentLoaded', renderPortal);
