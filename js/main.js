// Shared interactivity: FAQ accordion, corporate carousel, scroll-spy nav,
// YouTube click-to-load facades, hero video data-saver, validated form submission.
document.addEventListener('DOMContentLoaded', () => {
  // FAQ accordion (with aria-expanded)
  document.querySelectorAll('.faq-item .faq-q').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });


  // Scroll-spy for nav highlight
  const sections = [...document.querySelectorAll('[data-spy]')];
  const links = [...document.querySelectorAll('.main-nav a[data-spy-link]')];
  if (sections.length && links.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.toggle('active',
            l.getAttribute('href').endsWith('#' + e.target.id)));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => obs.observe(s));
  }

  // YouTube facades: load the real player only on click
  document.querySelectorAll('.yt-facade').forEach(btn => {
    btn.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + btn.dataset.yt + '?autoplay=1&rel=0';
      iframe.title = btn.dataset.title || 'Balloons Lane video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      btn.replaceWith(iframe);
    });
  });


  /* Inquiry forms: validated, then posted to FormSubmit inside a hidden iframe
     (no page navigation, no AJAX route). Success is detected when the iframe
     settles on the local /form-sent/ page or finishes loading; the form then
     clears and the message shows below the Send button. */
  (function () {
    var forms = document.querySelectorAll('form.inquiry-form');
    if (!forms.length) return;
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    forms.forEach(function (form) {
      var msg = form.querySelector('.form-msg');
      var btn = form.querySelector('button[type="submit"]');
      var sinkName = form.getAttribute('target');
      var sink = sinkName ? form.querySelector('iframe[name="' + sinkName + '"]') : null;
      var pending = false, pendingTimer = null, loadCount = 0, settleTimer = null;
      function showMsg(text, kind) {
        if (!msg) return;
        msg.textContent = text;
        msg.className = 'form-msg show ' + (kind || '');
      }
      function setSending(on) {
        if (!btn) return;
        btn.disabled = on;
        btn.textContent = on ? 'Sending...' : 'Send';
      }
      function finish(ok) {
        if (!pending) return;
        pending = false;
        if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; }
        if (settleTimer) { clearTimeout(settleTimer); settleTimer = null; }
        setSending(false);
        if (ok) {
          form.reset();
          showMsg('Thank you! Your inquiry has been submitted successfully. We will contact you soon.', 'success');
        } else {
          showMsg('Sorry, your message could not be sent. Please try again.', 'error');
        }
      }
      if (sink) {
        sink.addEventListener('load', function () {
          if (!pending) return;
          loadCount++;
          var done = false;
          try {
            var path = sink.contentWindow && sink.contentWindow.location && sink.contentWindow.location.pathname;
            if (path && path.indexOf('form-sent') !== -1) done = true;
          } catch (e) { /* cross-origin navigation in progress */ }
          if (done || loadCount >= 2) { finish(true); return; }
          if (!settleTimer) settleTimer = setTimeout(function () { finish(true); }, 2500);
        });
      }
      form.addEventListener('submit', function (e) {
        var honey = form.querySelector('[name="_honey"]');
        if (honey && honey.value) { e.preventDefault(); return; }
        var emailV = form.querySelector('[name="email"]');
        if (!emailV || !emailRe.test(emailV.value.trim())) {
          e.preventDefault(); showMsg('Please enter a valid email address.', 'error'); if (emailV) emailV.focus(); return;
        }
        var dateV = form.querySelector('[name="event_date"]');
        if (dateV && !dateV.value.trim()) {
          e.preventDefault(); showMsg('Please enter the event date.', 'error'); dateV.focus(); return;
        }
        var zipV = form.querySelector('[name="delivery_zip"]');
        if (zipV && !zipV.value.trim()) {
          e.preventDefault(); showMsg('Please enter the delivery zip code.', 'error'); zipV.focus(); return;
        }
        var msgV = form.querySelector('[name="message"]');
        if (msgV && !msgV.value.trim()) {
          e.preventDefault(); showMsg('Please enter a message.', 'error'); msgV.focus(); return;
        }
        var human = form.querySelector('[name="human_verified"]');
        if (human && !human.checked) {
          e.preventDefault(); showMsg('Please verify you are human before sending.', 'error'); human.focus(); return;
        }
        pending = true; loadCount = 0;
        setSending(true);
        pendingTimer = setTimeout(function () { finish(false); }, 30000);
        // native POST proceeds into the hidden iframe
      });
    });
  })();
});

/* Hero video: desktop only — on mobile the pane is hidden and the video is never downloaded */
(function () {
  var hv = document.getElementById('heroVideo');
  if (!hv) return;
  if (window.matchMedia('(max-width: 860px)').matches) { hv.remove(); return; }
  var so = hv.querySelector('source[data-src]');
  if (so) { so.src = so.getAttribute('data-src'); hv.load(); var pr = hv.play(); if (pr) pr.catch(function () {}); }
})();

/* Copyright year stays current automatically */
(function(){var y=document.getElementById('copy-year');if(y)y.textContent=new Date().getFullYear();})();

/* Mobile nav: hamburger toggle */
(function () {
  var btn = document.querySelector('.nav-toggle');
  var nav = document.getElementById('mainNav');
  if (!btn || !nav) return;
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    btn.textContent = open ? '✕' : '☰';
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = '☰';
    }
  });
})();
