// Site-wide 4-digit PIN gate. Change COURSE_PIN to update the access code.
const COURSE_PIN = '2468';
const PIN_STORAGE_KEY = 'implantPinOk';

function isUnlocked() {
  return localStorage.getItem(PIN_STORAGE_KEY) === 'yes';
}

function unlockSite() {
  localStorage.setItem(PIN_STORAGE_KEY, 'yes');
  document.documentElement.classList.remove('pin-locked');
}

function lockSite() {
  localStorage.removeItem(PIN_STORAGE_KEY);
  window.location.href = 'index.html';
}

function initPinGate() {
  const gate = document.getElementById('pin-gate');
  if (!gate) return;

  if (isUnlocked()) return;

  const inputs = Array.from(gate.querySelectorAll('.pin-inputs input'));
  const errorEl = gate.querySelector('.pin-error');
  const inputsWrap = gate.querySelector('.pin-inputs');

  function currentValue() {
    return inputs.map((i) => i.value).join('');
  }

  function checkPin() {
    const value = currentValue();
    if (value.length < 4) return;
    if (value === COURSE_PIN) {
      errorEl.textContent = '';
      unlockSite();
    } else {
      errorEl.textContent = 'Incorrect code. Please try again.';
      inputsWrap.classList.remove('shake');
      requestAnimationFrame(() => inputsWrap.classList.add('shake'));
      inputs.forEach((i) => (i.value = ''));
      inputs[0].focus();
    }
  }

  inputs.forEach((input, idx) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^0-9]/g, '').slice(0, 1);
      if (input.value && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      }
      if (currentValue().length === inputs.length) {
        checkPin();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && idx > 0) {
        inputs[idx - 1].focus();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '');
      text.slice(0, inputs.length).split('').forEach((ch, i) => {
        if (inputs[i]) inputs[i].value = ch;
      });
      const next = Math.min(text.length, inputs.length - 1);
      inputs[next].focus();
      if (currentValue().length === inputs.length) {
        checkPin();
      }
    });
  });

  inputs[0].focus();
}

document.addEventListener('DOMContentLoaded', initPinGate);
