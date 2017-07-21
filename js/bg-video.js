function BgVideo(videoElement) {
  'use strict';

  var raf = window.requestAnimationFrame;
  var forcedStop = false;
  var nativeWidth;
  var nativeHeight;
  var vE = videoElement;
  var metaDataLoaded = false;
  var visibleClass = 'bg-video__video_visible';
  var videoOffsetX = 0;
  var videoOffsetY = 0;
  var videoParent = vE.parentElement;
  var playing = false;
  var scrollTimeout;

  function playVideo(forced) {
    if (!playing && (!forcedStop || forced === true)) {
      vE.play();
      playing = true;
      forcedStop = false;
    }
  }

  function pauseVideo(forced) {
    if (playing) {
      vE.pause();
      playing = false;
      forcedStop = forced || false;
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      pauseVideo();
    } else {
      playVideo();
    }
  }

  function checkVideoVisibility() {
    var scrollY = window.scrollY || window.pageYOffset;
    var scrollX = window.scrollX || window.pageXOffset;
    var windowWidth = videoParent.offsetWidth;
    var windowHeight = videoParent.offsetHeight;

    if ((scrollY + windowHeight) < videoOffsetY || scrollY > (videoOffsetY + windowHeight)) {
      pauseVideo();
    } else {
      playVideo();
    }
  }

  function getVideoOffset() {
    var tmp = videoParent.getBoundingClientRect();
    videoOffsetX = tmp.left;
    videoOffsetY = tmp.top;
    checkVideoVisibility();
  }

  function resizeVideo() {
    var height = window.innerHeight;
    var width = window.innerWidth;
    var newWidth = (height / nativeHeight) * nativeWidth;
    var newHeight = (width / nativeWidth) * nativeHeight;
    var translateX = 0;
    var translateY = 0;

    if ((height >= width && newWidth > width) || (width > height && newHeight < height)) {
      newHeight = height;
      translateX = ((newWidth - width) / 2) * -1;
    }
    if (width > height && newHeight > height) {
      newWidth = width;
      translateY = ((newHeight - height) / 2) * -1;
    }

    raf(function setVideoSize() {
      vE.style.width = newWidth + 'px';
      vE.style.height = newHeight + 'px';
      vE.style.transform = 'translate(' + translateX + 'px, ' + translateY + 'px)';
      vE.classList.add(visibleClass);
    });
    getVideoOffset();
  }

  function metaDataLoad() {
    metaDataLoaded = true;
    nativeWidth = vE.videoWidth;
    nativeHeight = vE.videoHeight;
    resizeVideo();
  }

  function cbScroll() {
    console.log('cbScroll');
    pauseVideo();
    window.clearTimeout(scrollTimeout);
    scrollTimeout = window.setTimeout(checkVideoVisibility, 1E2);
  }

  (function init() {
    if (vE.nodeName !== 'VIDEO') return;
    vE.addEventListener('loadedmetadata', metaDataLoad, false);
    document.addEventListener('visibilityChange', handleVisibilityChange, false);
    window.addEventListener('resize', resizeVideo, false);
    window.addEventListener('scroll', cbScroll, false);
    vE.style.transition = 'none';
    window.setTimeout(function () {
      if (!metaDataLoaded) {
        metaDataLoad();
      }
    }, 5E2);
  }());
}
