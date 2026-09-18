/* ---------------------------------------------------------------
   전국지점
   HTML은 빌드할 때 이미 다 그려져 있습니다. 여기서는 보이고 숨기는
   일만 합니다. 그래야 자바스크립트가 꺼져 있어도 지점이 보입니다.
   --------------------------------------------------------------- */
(function () {
  var resultsEl = document.getElementById('ctResults');
  var totalEl = document.getElementById('ctTotal');
  var chipsEl = document.getElementById('ctChips');
  var searchEl = document.getElementById('ctSearch');
  if (!resultsEl) return;

  var state = { sido: 'all', q: '' };

  function apply() {
    var shown = 0;

    resultsEl.querySelectorAll('.ct-sido').forEach(function (sec) {
      var okSido = state.sido === 'all' || sec.getAttribute('data-sido') === state.sido;
      var q = state.q.trim();
      var secCount = 0;

      // 구 제목과 카드가 한 그리드에 순서대로 들어 있습니다.
      var pending = null, pendingCount = 0;
      var kids = sec.querySelector('.ct-grid').children;

      function closeGroup() {
        if (pending) pending.hidden = (pendingCount === 0);
      }

      for (var i = 0; i < kids.length; i++) {
        var el = kids[i];
        if (el.classList.contains('ct-gu-head')) {
          closeGroup();
          pending = el;
          pendingCount = 0;
          continue;
        }
        var hit = okSido && (!q || (el.getAttribute('data-q') || '').indexOf(q) > -1);
        el.hidden = !hit;
        if (hit) { pendingCount++; secCount++; }
      }
      closeGroup();

      sec.hidden = (secCount === 0);
      sec.querySelector('.ct-sido-head span').textContent = secCount + '개';
      shown += secCount;
    });

    totalEl.innerHTML = shown
      ? '총 <b>' + shown + '개</b> 지점'
      : '검색 결과가 없습니다. 지역명이나 학교 이름으로 다시 찾아보세요.';
  }

  chipsEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.chip');
    if (!btn) return;
    this.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
    btn.setAttribute('aria-pressed', 'true');
    state.sido = btn.getAttribute('data-s');
    apply();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  var typing;
  searchEl.addEventListener('input', function () {
    clearTimeout(typing);
    var v = this.value;
    typing = setTimeout(function () { state.q = v; apply(); }, 200);
  });

  /* ---------------------------------------------------------------
     지도 모달 — 카카오 키가 있으면 카카오맵, 없으면 구글 지도
     --------------------------------------------------------------- */
  var modal = document.getElementById('ctModal');
  var mName = document.getElementById('ctModalName');
  var mAddr = document.getElementById('ctModalAddr');
  var mMap = document.getElementById('ctModalMap');
  var mSchool = document.getElementById('ctModalSchools');
  var kakaoReady = false, kMap = null, kMarker = null, kGeo = null;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  function openMap(c) {
    mName.textContent = c.name;
    mAddr.textContent = c.address;
    mSchool.innerHTML = c.schools ? '<b>인근 학교</b>' + esc(c.schools) : '';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    if (kakaoReady) {
      if (!kMap) {
        kMap = new kakao.maps.Map(mMap, { center: new kakao.maps.LatLng(37.56, 126.97), level: 3 });
        kMarker = new kakao.maps.Marker({ map: kMap });
        kGeo = new kakao.maps.services.Geocoder();
      }
      kMap.relayout();
      kGeo.addressSearch(c.address, function (res, status) {
        if (status !== kakao.maps.services.Status.OK) return;
        var pos = new kakao.maps.LatLng(res[0].y, res[0].x);
        kMap.setCenter(pos);
        kMarker.setPosition(pos);
      });
    } else {
      mMap.innerHTML = '<iframe title="' + esc(c.name) + ' 위치" loading="lazy" allowfullscreen ' +
        'src="https://www.google.com/maps?q=' + encodeURIComponent(c.address) + '&hl=ko&z=17&output=embed"></iframe>';
    }
  }

  function closeMap() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  resultsEl.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-map]');
    if (!btn) return;
    openMap(CENTERS[parseInt(btn.getAttribute('data-map'), 10)]);
  });
  document.getElementById('ctClose').addEventListener('click', closeMap);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeMap(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeMap();
  });

  if (KAKAO_KEY) {
    var sdk = document.createElement('script');
    sdk.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=' + KAKAO_KEY + '&libraries=services&autoload=false';
    sdk.onload = function () { kakao.maps.load(function () { kakaoReady = true; }); };
    document.head.appendChild(sdk);
  }
})();
