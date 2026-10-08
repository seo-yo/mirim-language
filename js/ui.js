import { saved } from './store.js';
import { esc, formatDate } from './util.js';

export const ICON = {
  bookmark: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  arrow: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>',
};

// 저장 토글 버튼
export function bindSave(btn, id) {
  const paint = (on) => {
    btn.classList.toggle('is-on', on);
    btn.innerHTML = `${ICON.bookmark}<span>${on ? '저장됨' : '표현 저장'}</span>`;
  };
  paint(saved.has(id));
  btn.addEventListener('click', () => paint(saved.toggle(id)));
}

// 사전 목록 한 줄
export const wordRow = (w, extra = '') => `
  <li class="word-row">
    <a href="word.html?id=${w.id}">
      <span class="word-row__mirim">${esc(w.mirim)}</span>
      <span class="word-row__korean">${esc(w.korean)}</span>
      <span class="word-row__date">${formatDate(w.created_at)}</span>
    </a>${extra}
  </li>`;
