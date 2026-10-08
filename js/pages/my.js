import '../layout.js';
import { getMany } from '../api.js';
import { saved } from '../store.js';
import { wordRow } from '../ui.js';

const listEl = document.getElementById('list');
const emptyEl = document.getElementById('empty');
const countEl = document.getElementById('count');

function paintCount() {
  const n = listEl.children.length;
  countEl.textContent = n ? `${n}개의 말` : '';
  emptyEl.hidden = n > 0;
}

(async () => {
  const ids = saved.list();
  if (!ids.length) return paintCount();
  try {
    const words = await getMany(ids);
    listEl.innerHTML = words.map((w) =>
      wordRow(w, `<button type="button" class="word-row__remove" data-remove="${w.id}">저장 해제</button>`)).join('');
  } catch (e) {
    countEl.textContent = e.message;
    return;
  }
  paintCount();
  listEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-remove]');
    if (!b) return;
    saved.toggle(b.dataset.remove);
    b.closest('li').remove();
    paintCount();
  });
})();
