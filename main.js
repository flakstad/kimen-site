(function () {
  var nodes = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || nodes.length === 0) {
    for (var i = 0; i < nodes.length; i += 1) {
      nodes[i].classList.add('visible');
    }
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i += 1) {
      if (entries[i].isIntersecting) {
        entries[i].target.classList.add('visible');
        observer.unobserve(entries[i].target);
      }
    }
  }, {
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.1
  });

  for (var j = 0; j < nodes.length; j += 1) {
    observer.observe(nodes[j]);
  }
})();
