// 헤더/푸터 주입 + 현재 페이지 nav 활성화 (body[data-page])
const NAV = [
  ['home', 'index.html', '오늘의 발견'],
  ['dictionary', 'dictionary.html', '전체 사전'],
  ['my', 'my.html', '내 단어장'],
];
const page = document.body.dataset.page;

document.body.insertAdjacentHTML('afterbegin', `
<header class="site-header">
  <div class="wrap site-header__in">
    <a class="logo" href="index.html">미림어 <small>/ 사전</small></a>
    <nav class="site-nav">${NAV.map(([k, href, label]) =>
      `<a href="${href}" class="nav-${k}${k === page ? ' is-active' : ''}">${label}</a>`).join('')}</nav>
    <div class="site-header__side">
      <span class="site-header__tag">분명 한국어였는데…</span>
      <a class="btn btn--ghost btn--sm" href="add.html"><span class="hide-mo">표현&nbsp;</span>등록</a>
    </div>
  </div>
</header>`);

document.body.insertAdjacentHTML('beforeend', `
<footer class="site-footer">
  <div class="wrap site-footer__in">
    <span>미림어 사전 · 이상한 말도 소중하게</span>
    <span>한국어 ↔ 미림어 · 친구의 말 수집 중</span>
  </div>
</footer>`);
