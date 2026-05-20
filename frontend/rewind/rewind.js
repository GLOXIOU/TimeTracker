document.addEventListener('DOMContentLoaded', () => {
    const launchBtn = document.getElementById('launch-rewind-btn');
    const setupView = document.getElementById('rewind-setup');
    const presentationView = document.getElementById('rewind-presentation');
    const closeBtn = document.getElementById('close-rewind-btn');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const customDatesGroup = document.getElementById('custom-dates-group');
    const presetSlider = document.getElementById('preset-slider');
    const slides = document.querySelectorAll('.rewind-slide');
    const progressFill = document.querySelector('.progress-fill');
    
    let currentSlide = 0;
    const slideDuration = 4500;
    let presentationInterval;
    let progressInterval;
    let startTime;
    let isPlaying = false;

    function updateSlider(btn) {
        if (!presetSlider || !btn) return;
        presetSlider.style.width = btn.offsetWidth + 'px';
        presetSlider.style.transform = `translateX(${btn.offsetLeft}px)`;
    }

    presetBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            presetBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            updateSlider(e.target);
            
            if (e.target.dataset.preset === 'custom') {
                customDatesGroup.classList.remove('hidden');
            } else {
                customDatesGroup.classList.add('hidden');
            }
        });
    });

    requestAnimationFrame(() => {
        const activeBtn = document.querySelector('.preset-btn.active');
        if (activeBtn) updateSlider(activeBtn);
    });

    launchBtn.addEventListener('click', startRewind);
    closeBtn.addEventListener('click', stopRewind);

    function startRewind() {
        setupView.style.display = 'none';
        presentationView.style.display = 'flex';
        
        requestAnimationFrame(() => {
            presentationView.classList.add('playing');
            showSlide(0);
        });
    }

    function stopRewind() {
        isPlaying = false;
        clearInterval(presentationInterval);
        clearInterval(progressInterval);
        presentationView.classList.remove('playing');
        
        setTimeout(() => {
            presentationView.style.display = 'none';
            setupView.style.display = 'block';
            resetSlides();
        }, 1000);
    }

    function showSlide(index) {
        clearInterval(presentationInterval);
        clearInterval(progressInterval);
        
        if (index >= slides.length) {
            index = slides.length - 1;
        } else if (index < slides.length - 1) {
            startTime = Date.now();
            isPlaying = true;
            
            progressInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const percent = Math.min((elapsed / slideDuration) * 100, 100);
                progressFill.style.width = `${percent}%`;
            }, 16);
            
            presentationInterval = setTimeout(() => {
                nextSlide();
            }, slideDuration);
        } else {
            isPlaying = false;
            progressFill.style.width = '100%';
        }

        slides.forEach((s, i) => {
            if (i < index) {
                s.className = 'rewind-slide exit';
            } else if (i === index) {
                s.className = 'rewind-slide active';
            } else {
                s.className = 'rewind-slide';
            }
        });
        
        currentSlide = index;
    }

    function nextSlide() {
        if (currentSlide < slides.length - 1) {
            showSlide(currentSlide + 1);
        }
    }

    function resetSlides() {
        currentSlide = 0;
        slides.forEach((s, i) => {
            s.className = 'rewind-slide';
        });
        progressFill.style.width = '0%';
    }

    presentationView.addEventListener('click', (e) => {
        if (!isPlaying || e.target === closeBtn) return;
        nextSlide();
    });
});