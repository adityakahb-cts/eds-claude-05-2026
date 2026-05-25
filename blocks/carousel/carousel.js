/**
 * Loads and decorates the carousel block.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const isAutoplay = block.classList.contains('autoplay');
  const noControls = block.classList.contains('no-controls');

  const rows = [...block.querySelectorAll(':scope > div')];
  const slides = rows.map((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    return { media: cells[0] || null, caption: cells[1] || null };
  });

  block.textContent = '';

  const announcer = document.createElement('div');
  announcer.className = 'carousel-announcer';
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  block.append(announcer);

  const track = document.createElement('div');
  track.className = 'carousel-track';

  slides.forEach((slideData, i) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `Slide ${i + 1} of ${slides.length}`);
    slide.setAttribute('role', 'group');

    if (slideData.media) {
      const mediaDiv = document.createElement('div');
      mediaDiv.className = 'carousel-media';
      mediaDiv.append(...slideData.media.childNodes);
      slide.append(mediaDiv);
    }

    if (slideData.caption) {
      const captionText = slideData.caption.textContent.trim();
      if (captionText) {
        const captionDiv = document.createElement('div');
        captionDiv.className = 'carousel-caption';
        captionDiv.textContent = captionText;
        slide.append(captionDiv);
      }
    }

    track.append(slide);
  });

  block.append(track);

  if (slides.length <= 1) return;

  const controls = document.createElement('div');
  controls.className = 'carousel-controls';

  let prevBtn = null;
  let nextBtn = null;

  if (!noControls) {
    prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-prev';
    prevBtn.setAttribute('aria-label', 'Previous slide');
    prevBtn.setAttribute('type', 'button');
    const prevIcon = document.createElement('span');
    prevIcon.setAttribute('aria-hidden', 'true');
    prevIcon.textContent = '‹';
    prevBtn.append(prevIcon);
    controls.append(prevBtn);
  }

  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'carousel-dots';
  dotsContainer.setAttribute('role', 'tablist');
  dotsContainer.setAttribute('aria-label', 'Slides');

  const dots = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('type', 'button');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    if (i === 0) dot.setAttribute('aria-selected', 'true');
    dotsContainer.append(dot);
    return dot;
  });

  controls.append(dotsContainer);

  if (!noControls) {
    nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-next';
    nextBtn.setAttribute('aria-label', 'Next slide');
    nextBtn.setAttribute('type', 'button');
    const nextIcon = document.createElement('span');
    nextIcon.setAttribute('aria-hidden', 'true');
    nextIcon.textContent = '›';
    nextBtn.append(nextIcon);
    controls.append(nextBtn);
  }

  block.append(controls);

  let current = 0;
  let autoplayTimer = null;

  function goTo(index) {
    const slideEls = [...track.querySelectorAll('.carousel-slide')];
    current = ((index % slides.length) + slides.length) % slides.length;

    track.style.transform = `translateX(-${current * 100}%)`;

    dots.forEach((dot, i) => {
      const active = i === current;
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });

    slideEls.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', i !== current ? 'true' : 'false');
    });

    announcer.textContent = `Slide ${current + 1} of ${slides.length}`;
  }

  function startAutoplay() {
    autoplayTimer = setInterval(() => goTo(current + 1), 5000);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  goTo(0);

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goTo(current - 1);
      if (isAutoplay) restartAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goTo(current + 1);
      if (isAutoplay) restartAutoplay();
    });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goTo(i);
      if (isAutoplay) restartAutoplay();
    });
  });

  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      goTo(current - 1);
      if (isAutoplay) restartAutoplay();
    }
    if (e.key === 'ArrowRight') {
      goTo(current + 1);
      if (isAutoplay) restartAutoplay();
    }
  });

  if (isAutoplay) {
    startAutoplay();
    block.addEventListener('mouseenter', stopAutoplay);
    block.addEventListener('mouseleave', startAutoplay);
    block.addEventListener('focusin', stopAutoplay);
    block.addEventListener('focusout', (e) => {
      if (!block.contains(e.relatedTarget)) startAutoplay();
    });
  }
}
