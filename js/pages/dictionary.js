import '../layout.js';
import { list } from '../api.js';
import { recent } from '../store.js';
import { qs, matches, chosung, CHO_LIST, byKorean, byNewest } from '../util.js';
import { wordRow } from '../ui.js';

const $ = (id) => document.getElementById(id);
const q = (qs('q') || '').trim();
let sort = 'ko';
let cho = '';
let words = [];

if (q) {
  recent.push(q);
  $('search-input').value = q;
  $('title').textContent = `‘${q}’ 검색 결과`;
  document.title = `${q} — 미림어 사전`;
}
$('empty-add').href = `add.html?mirim=${encodeURIComponent(q)}`;

function render() {
  let rows = q ? words.filter((w) => matches(w, q)) : words.slice();
  if (cho) rows = rows.filter((w) => chosung(w.mirim) === cho);
  rows.sort(sort === 'ko' ? byKorean : byNewest);
  $('count').textContent = `${rows.length}개의 말`;
  $('list').innerHTML = rows.map((w) => wordRow(w)).join('');
  $('empty').hidden = rows.length > 0;
}

$('index').innerHTML = ['', ...CHO_LIST]
  .map((c) => `<button type="button" data-cho="${c}"${c === cho ? ' class="is-on"' : ''}>${c || '전체'}</button>`)
  .join('');

function bindChips(el, key, onPick) {
  el.addEventListener('click', (e) => {
    const b = e.target.closest(`[data-${key}]`);
    if (!b) return;
    [...el.children].forEach((x) => x.classList.toggle('is-on', x === b));
    onPick(b.dataset[key]);
    render();
  });
}
bindChips($('index'), 'cho', (v) => { cho = v; });
bindChips($('sort'), 'sort', (v) => { sort = v; });

(async () => {
  try {
    words = await list();
    render();
  } catch (e) {
    $('count').textContent = e.message;
  }
})();
