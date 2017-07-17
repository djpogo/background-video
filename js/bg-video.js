function BgVideo(videoElement) {
  'use strict';

  var forcedStop = false;
  var nativeWidth;
  var nativeHeight;
  var vE = videoElement;
  var metaDataLoaded = false;
  var visibleClass = 'bg-video__video_visible';

  function playVideo(forced) {
    if (!forcedStop || forced === true) {
      vE.play();
      forcedStop = false;
    }
  }

  function pauseVideo(forced) {
    vE.pause();
    if (forced) {
      forcedStop = true;
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      pauseVideo();
    } else {
      playVideo();
    }
  }

  function resizeVideo() {
    var height = document.body.offsetHeight;
    var width = document.body.offsetWidth;
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

    window.requestAnimationFrame(function setVideoSize() {
      vE.classList.add(visibleClass);
      vE.style.width = newWidth + 'px';
      vE.style.height = newHeight + 'px';
      vE.style.transform = 'translate(' + translateX + 'px, ' + translateY + 'px)';
    });
  }

  function metaDataLoad() {
    metaDataLoaded = true;
    nativeWidth = vE.videoWidth;
    nativeHeight = vE.videoHeight;
    resizeVideo();
  }

  (function init() {
    if (vE.nodeName !== 'VIDEO') return;
    vE.addEventListener('loadedmetadata', metaDataLoad, false);
    document.addEventListener('visibilityChange', handleVisibilityChange, false);
    window.addEventListener('resize', resizeVideo, false);
    vE.style.transition = 'none';
    window.setTimeout(function () {
      if (!metaDataLoaded) {
        metaDataLoad();
      }
    }, 5E2);
  }());
}
