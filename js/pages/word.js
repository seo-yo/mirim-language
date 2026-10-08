import '../layout.js';
import { get, remove, PIN_MESSAGE } from '../api.js';
import { esc, qs, formatDate } from '../util.js';
import { bindSave } from '../ui.js';

const el = document.getElementById('entry');
const id = qs('id');

function renderNotFound() {
  el.innerHTML = `
    <p class="eyebrow">Mirim Dictionary</p>
    <h1 class="entry__word">사라진 말이에요.</h1>
    <p class="muted">지워졌거나, 처음부터 없던 말일지도요.</p>
    <div class="entry__actions"><a class="btn btn--ghost" href="dictionary.html">사전으로 돌아가기</a></div>`;
}

function render(w) {
  document.title = `${w.mirim} — 미림어 사전`;
  el.innerHTML = `
    <p class="eyebrow">미림어 사전 · ${w.author ? `${esc(w.author)} 채집` : '익명 채집'} · ${formatDate(w.created_at)}</p>
    <h1 class="entry__word">${esc(w.mirim)}</h1>
    <p class="entry__korean"><small>한국어로는</small>${esc(w.korean)}</p>
    ${w.example ? `<blockquote class="entry__example">“${esc(w.example)}”</blockquote>` : ''}
    ${w.note ? `<p class="entry__note">${esc(w.note)}</p>` : ''}
    <div class="entry__actions">
      <button class="btn btn--ghost" type="button" id="save"></button>
      <button class="btn btn--ghost" type="button" id="copy">링크 복사</button>
      <span class="entry__manage">
        <a href="add.html?id=${w.id}">고치기</a>
        <button type="button" id="del">지우기</button>
      </span>
    </div>
    <form class="pin-form" id="del-form" hidden>
      <label>지우려면 등록할 때 정한 비밀번호 4자리를 입력해 주세요
        <input name="pin" inputmode="numeric" maxlength="4" pattern="\\d{4}" required autocomplete="off">
      </label>
      <button class="btn btn--primary btn--sm" type="submit">지우기</button>
      <button class="btn btn--ghost btn--sm" type="button" id="del-cancel">취소</button>
      <p class="form__error" id="del-error" hidden></p>
    </form>`;

  bindSave(el.querySelector('#save'), w.id);

  const copyBtn = el.querySelector('#copy');
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      copyBtn.textContent = '복사됨';
      setTimeout(() => { copyBtn.textContent = '링크 복사'; }, 1500);
    } catch {
      window.prompt('링크를 복사하세요', location.href);
    }
  });

  const form = el.querySelector('#del-form');
  const errEl = el.querySelector('#del-error');
  el.querySelector('#del').addEventListener('click', () => { form.hidden = false; form.pin.focus(); });
  el.querySelector('#del-cancel').addEventListener('click', () => { form.hidden = true; errEl.hidden = true; });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errEl.hidden = true;
    try {
      const r = await remove(w.id, form.pin.value);
      if (r !== 'ok') throw new Error(PIN_MESSAGE[r] || r);
      location.href = 'dictionary.html';
    } catch (e2) {
      errEl.textContent = e2.message;
      errEl.hidden = false;
    }
  });
}

(async () => {
  let w = null;
  try { w = id ? await get(id) : null; } catch {}
  w ? render(w) : renderNotFound();
})();
