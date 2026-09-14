// A presentation model only: this never accesses a vault or runs a command.
const page = document.body;
const bind = document.querySelector('[data-bind]');
const run = document.querySelector('[data-run]');
const reset = document.querySelector('[data-reset]');
const status = document.querySelector('[data-status]');
const processState = document.querySelector('[data-process]');
bind.addEventListener('click', () => {
  page.classList.add('bound');
  status.textContent = 'local binding available';
  bind.disabled = true;
  run.disabled = false;
});
run.addEventListener('click', () => {
  page.classList.add('running');
  processState.textContent = 'running · values passed to process';
  run.disabled = true;
});
reset.addEventListener('click', () => {
  page.classList.remove('bound', 'running');
  status.textContent = 'waiting for local binding';
  processState.textContent = 'not started';
  bind.disabled = false;
  run.disabled = true;
});
