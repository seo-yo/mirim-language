import '../layout.js';
import { list, get, add, update, PIN_MESSAGE } from '../api.js';
import { lastAdd } from '../store.js';
import { esc, qs, normalize } from '../util.js';

const $ = (id) => document.getElementById(id);
const editId = qs('id');
const form = $('form');
const f = form.elements;
const submitBtn = $('submit');

const values = () => ({
  mirim: f.mirim.value.trim(),
  korean: f.korean.value.trim(),
  example: f.example.value.trim(),
  note: f.note.value.trim(),
  author: f.author.value.trim(),
  pin: f.pin.value.trim(),
});

function preview() {
  const v = values();
  $('preview').innerHTML = `
    <p class="card__label">사전에는 이렇게 실려요</p>
    <h2 class="today__word">${esc(v.mirim) || '<span class="muted">미림어 표현</span>'}</h2>
    <p class="today__meta">한국어 → 미림어 · ${v.author ? `${esc(v.author)} 채집` : '익명 채집'}</p>
    <p class="today__korean">${esc(v.korean) || '<span class="muted">한국어 뜻</span>'}</p>
    ${v.example || v.note ? '<hr class="rule">' : ''}
    ${v.example ? `<p class="today__example">“${esc(v.example)}”</p>` : ''}
    ${v.note ? `<p class="today__note">${esc(v.note)}</p>` : ''}`;
}

function showError(msg) {
  $('error').textContent = msg;
  $('error').hidden = !msg;
  if (msg) $('error').scrollIntoView({ block: 'nearest' });
}

function validate(v) {
  if (f.website.value) return '등록할 수 없어요.'; // honeypot
  if (!v.mirim) return '미림어 표현을 적어 주세요.';
  if (!v.korean) return '한국어 뜻을 적어 주세요.';
  if (v.mirim.length > 40 || v.korean.length > 60 || v.example.length > 200 || v.note.length > 300 || v.author.length > 20) {
    return '너무 길어요. 조금만 줄여 주세요.';
  }
  if (!/^\d{4}$/.test(v.pin)) return '비밀번호는 숫자 4자리예요.';
  if (!editId && Date.now() - lastAdd.get() < 30000) return '조금만 천천히 올려 주세요. (30초 간격)';
  return '';
}

// 수정 모드
if (editId) {
  document.title = '말 고치기 — 미림어 사전';
  $('form-title').textContent = '말 고치기';
  $('pin-help').textContent = '등록할 때 정한 비밀번호';
  submitBtn.textContent = '고친 내용 저장';
  (async () => {
    let w = null;
    try { w = await get(editId); } catch {}
    if (!w) { showError('사라진 말이에요.'); submitBtn.disabled = true; return; }
    f.mirim.value = w.mirim;
    f.korean.value = w.korean;
    f.example.value = w.example || '';
    f.note.value = w.note || '';
    f.author.value = w.author || '';
    preview();
  })();
} else if (qs('mirim')) {
  f.mirim.value = qs('mirim');
}

form.addEventListener('input', preview);
preview();

// 같은 표제어 경고 (등록 모드만, 막진 않음)
f.mirim.addEventListener('change', async () => {
  if (editId) return;
  const n = normalize(f.mirim.value);
  let dup = null;
  try { dup = n && (await list()).find((w) => normalize(w.mirim) === n); } catch {}
  $('dup').hidden = !dup;
  if (dup) $('dup').innerHTML = `이미 있는 말이에요: <a href="word.html?id=${dup.id}">${esc(dup.mirim)} →</a> 그래도 올릴 수는 있어요.`;
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const v = values();
  const err = validate(v);
  if (err) return showError(err);
  showError('');
  submitBtn.disabled = true;
  try {
    if (editId) {
      const r = await update(editId, v.pin, v);
      if (r !== 'ok') throw new Error(PIN_MESSAGE[r] || r);
      location.href = `word.html?id=${editId}`;
    } else {
      const id = await add(v);
      lastAdd.set();
      location.href = `word.html?id=${id}`;
    }
  } catch (e2) {
    showError(e2.message);
    submitBtn.disabled = false;
  }
});
