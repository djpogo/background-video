var x = document.querySelectorAll('[data-bg-video]');
var i;
var l;

for (i = 0, l = x.length; i < l; ++i) {
  new BgVideo(x[i]);
}
