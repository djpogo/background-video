function BgVideo(videoElement) {
  'use strict';

  var raf = window.requestAnimationFrame;
  var forcedStop = false;
  var nativeWidth;
  var nativeHeight;
  var vE = videoElement;
  var visibleClass = 'bg-video__video--visible';
  var videoOffsetX = 0;
  var videoOffsetY = 0;
  var videoParent = vE.parentElement;
  var playing = false;
  var playOnScroll = false;
  var scrollTimeout;
  var iOS = parseFloat( // @see https://gist.github.com/Craga89/2829457
	    ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1])
	    .replace('undefined', '3_2').replace('_', '.').replace('_', '')
    ) || false;

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

  function outOfViewportVertical(scrollY, contentHeight, contentStartY) {
    return ((scrollY + contentHeight) < contentStartY || scrollY > (contentStartY + contentHeight));
  }

  function checkVideoVisibility() {
    var scrollY = window.scrollY || window.pageYOffset;
    var scrollX = window.scrollX || window.pageXOffset;
    var windowWidth = videoParent.offsetWidth;
    var windowHeight = videoParent.offsetHeight;

    if (outOfViewportVertical(scrollY, windowHeight, videoOffsetY)) {
      pauseVideo();
    } else {
      playVideo();
    }
  }

  function cbScroll() {
    if (!playOnScroll) {
      pauseVideo();
    }
    window.clearTimeout(scrollTimeout);
    scrollTimeout = window.setTimeout(checkVideoVisibility, 1E2);
  }

  function getVideoOffset() {
    var tmp = videoParent.getBoundingClientRect();
    videoOffsetX = (window.scrollX || window.pageXOffset) + tmp.left + tmp.offsetLeft;
    videoOffsetY = (window.scrollY || window.pageYOffset) + tmp.top + tmp.offsetTop;
    checkVideoVisibility();
  }

  function resizeVideo() {
    var height = videoParent.offsetHeight;
    var width = videoParent.offsetWidth;
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
      getVideoOffset();
      cbScroll();
    });
  }

  function durationChange() {
    nativeWidth = vE.videoWidth;
    nativeHeight = vE.videoHeight;
    resizeVideo();
  }

  function iosCheck() {
    // check if device is capable of background video 
    // and remove video element on not compatible os's
    if (iOS && iOS < 10.0) {
      vE.remove();
      return false;
    }
    return true;
  }

  (function init() {
    if (vE.nodeName !== 'VIDEO') return;
    if (iosCheck()) {
      playOnScroll = vE.dataset.playOnScroll !== undefined;
      vE.addEventListener('durationchange', durationChange, false);
      document.addEventListener('visibilityChange', handleVisibilityChange, false);
      window.addEventListener('resize', resizeVideo, false);
      window.addEventListener('scroll', cbScroll, true);
      vE.style.transition = 'none';
      durationChange();
    }
  }());
}
