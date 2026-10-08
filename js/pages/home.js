import '../layout.js';
import { list } from '../api.js';
import { recent } from '../store.js';
import { esc, todayWord, byNewest } from '../util.js';
import { ICON, bindSave } from '../ui.js';

const todayEl = document.getElementById('today');
const latestEl = document.getElementById('latest');
const recentEl = document.getElementById('recent');

const rc = recent.list();
if (rc.length) {
  recentEl.innerHTML = '<span class="recent__label">최근 검색</span>'
    + rc.map((q) => `<a href="dictionary.html?q=${encodeURIComponent(q)}">${esc(q)}</a>`).join('');
} else {
  recentEl.hidden = true;
}

function renderToday(w) {
  if (!w) {
    todayEl.innerHTML = `
      <p class="card__label">오늘의 발견</p>
      <h2 class="today__word">아직 아무 말도 없어요.</h2>
      <p class="today__meta">첫 번째 미림어를 올려 주세요.</p>
      <div class="card__actions"><a class="btn btn--primary" href="add.html">첫 말 등록하기</a></div>`;
    return;
  }
  todayEl.innerHTML = `
    <p class="card__label">오늘의 발견</p>
    <div class="today__head">
      <h2 class="today__word">${esc(w.mirim)}</h2>
      <a class="icon-btn" href="word.html?id=${w.id}" aria-label="자세히 보기">${ICON.arrow}</a>
    </div>
    <p class="today__meta">한국어 → 미림어 · ${w.author ? `${esc(w.author)} 채집` : '친구의 실제 표현'}</p>
    <p class="today__korean">${esc(w.korean)}</p>
    ${w.example || w.note ? '<hr class="rule">' : ''}
    ${w.example ? `<p class="today__example">“${esc(w.example)}”</p>` : ''}
    ${w.note ? `<p class="today__note">${esc(w.note)}</p>` : ''}
    <div class="card__actions">
      <button class="btn btn--ghost" type="button" id="today-save"></button>
      <a class="link-more" href="word.html?id=${w.id}">표현 자세히 보기 →</a>
    </div>`;
  bindSave(todayEl.querySelector('#today-save'), w.id);
}

function renderLatest(words) {
  latestEl.innerHTML = `
    <h2 class="card__title">다시 만나고 싶은 단어</h2>
    <p class="card__sub">읽다 보면 그 친구 목소리가 들리는 것 같아요.</p>
    <ul class="mini-list">${words.length
      ? words.map((w) => `<li><a href="word.html?id=${w.id}"><span>${esc(w.mirim)}</span><span class="muted">${esc(w.korean)}</span></a></li>`).join('')
      : '<li class="muted">아직 비어 있어요.</li>'}</ul>
    <a class="card__foot" href="dictionary.html"><span class="muted">우리끼리 통하는 말 모음</span><strong>단어장 →</strong></a>`;
}

(async () => {
  try {
    const words = await list();
    renderToday(todayWord(words));
    renderLatest([...words].sort(byNewest).slice(0, 5));
  } catch (e) {
    todayEl.innerHTML = `<p class="card__label">오늘의 발견</p><p class="muted">${esc(e.message)}</p>`;
    renderLatest([]);
  }
})();
