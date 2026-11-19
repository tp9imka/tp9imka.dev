(function () {
  var t = 'dark';
  try { if (localStorage.getItem('tp9imka-theme') === 'light') t = 'light'; } catch (e) {}
  document.documentElement.dataset.theme = t;
  document.documentElement.classList.add('js');
})();
