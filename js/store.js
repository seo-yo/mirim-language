// localStorage — 로그인이 없으니 전부 기기별
function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export const saved = {
  list: () => read('mirim:saved', []),
  has: (id) => saved.list().includes(id),
  toggle(id) {
    const ids = saved.list();
    const i = ids.indexOf(id);
    i >= 0 ? ids.splice(i, 1) : ids.unshift(id);
    write('mirim:saved', ids);
    return i < 0; // 저장됐으면 true
  },
};

export const recent = {
  list: () => read('mirim:recent', []),
  push(q) {
    write('mirim:recent', [q, ...recent.list().filter((x) => x !== q)].slice(0, 5));
  },
};

export const lastAdd = {
  get: () => read('mirim:lastAdd', 0),
  set: () => write('mirim:lastAdd', Date.now()),
};
