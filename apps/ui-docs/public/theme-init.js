// Blocking same-origin script: resolve the canvas before CSS or React paints.
;(function () {
  var saved
  try { saved = localStorage.getItem('n3wth-theme') } catch (_) {}
  var mode = saved === 'dark' || saved === 'light'
    ? saved
    : matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', mode)
  document.documentElement.setAttribute('data-astryx-theme', 'n3wth')
})()
