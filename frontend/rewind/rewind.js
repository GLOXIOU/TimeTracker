document.addEventListener('DOMContentLoaded', () => {
    const launchBtn = document.getElementById('launch-rewind-btn');
    const setupView = document.getElementById('rewind-setup');
    const presentationView = document.getElementById('rewind-presentation');
    const startPresentationBtn = document.getElementById('start-presentation-btn');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const customDatesGroup = document.getElementById('custom-dates-group');
    const presetSlider = document.getElementById('preset-slider');
    const slides = document.querySelectorAll('.rewind-slide');
    const progressContainer = document.getElementById('rewind-progress-container');
    
    let currentSlide = 0;
    const slideDuration = 6500;
    let presentationInterval;
    let progressInterval;
    let startTime;
    let isPlaying = false;
    let progressFills = [];

    function initProgressBars() {
        progressContainer.innerHTML = '';
        progressFills = [];
        
        for (let i = 1; i < slides.length; i++) {
            const bar = document.createElement('div');
            bar.className = 'story-progress-bar';
            bar.dataset.index = i;
            
            const fill = document.createElement('div');
            fill.className = 'story-progress-fill';
            
            bar.appendChild(fill);
            progressContainer.appendChild(bar);
            progressFills.push(fill);

            bar.addEventListener('click', (e) => {
                e.stopPropagation();
                // Allow navigation from progress bars even if isPlaying is false (like on final slide)
                if (isPlaying || currentSlide === slides.length - 1) {
                    showSlide(parseInt(bar.dataset.index));
                }
            });
        }
    }

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

    initProgressBars();

    launchBtn.addEventListener('click', startRewindSequence);
    startPresentationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startAutoSlides();
    });

    function startRewindSequence() {
        // Collect period logic for display before hiding setup
        const activePreset = document.querySelector('.preset-btn.active');
        let periodText = 'Ma Période';
        if (activePreset) {
            const presetVal = activePreset.dataset.preset;
            if (presetVal === 'week') periodText = 'Cette Semaine';
            if (presetVal === 'month') periodText = 'Ce Mois';
            if (presetVal === 'year') periodText = 'Cette Année';
            if (presetVal === 'custom') {
                const startDate = document.getElementById('start-date').value;
                const endDate = document.getElementById('end-date').value;
                if (startDate && endDate) {
                   periodText = `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
                }
            }
        }
        
        document.querySelectorAll('.period-display').forEach(el => el.textContent = periodText);

        setupView.style.display = 'none';
        presentationView.style.display = 'flex';
        
        currentSlide = 0;
        slides.forEach((s, i) => {
            s.className = i === 0 ? 'rewind-slide active' : 'rewind-slide';
        });
        
        progressContainer.classList.remove('visible');
        isPlaying = false;
        
        requestAnimationFrame(() => {
            presentationView.classList.add('playing');
        });
    }

    function startAutoSlides() {
        isPlaying = true;
        progressContainer.classList.add('visible');
        showSlide(1);
    }

    function stopRewind() {
        isPlaying = false;
        clearInterval(presentationInterval);
        clearInterval(progressInterval);
        presentationView.classList.remove('playing');
        progressContainer.classList.remove('visible');
        
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
        }

        progressFills.forEach((fill, i) => {
            if (i < index - 1) fill.style.width = '100%';
            else if (i > index - 1) fill.style.width = '0%';
        });
        
        if (index > 0 && index < slides.length - 1) {
            startTime = Date.now();
            isPlaying = true;
            
            const activeFill = progressFills[index - 1];
            activeFill.style.width = '0%';
            
            progressInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const percent = Math.min((elapsed / slideDuration) * 100, 100);
                activeFill.style.width = `${percent}%`;
            }, 16);
            
            presentationInterval = setTimeout(() => {
                nextSlide();
            }, slideDuration);
        } else if (index === slides.length - 1) {
            isPlaying = false;
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
        
        presentationView.dataset.theme = index;
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
        progressFills.forEach(fill => fill.style.width = '0%');
    }

    presentationView.addEventListener('click', (e) => {
        // Now also checking if it's playing OR if on final slide not clicking an action button/bar
        if ((!isPlaying && currentSlide !== slides.length - 1) || e.target.closest('.rewind-action-btn') || e.target.closest('.story-progress-bar')) return;
        nextSlide();
    });

    const exportBtn = document.getElementById('export-img-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                const element = document.getElementById('exportable-summary');
                // Temporary remove animations class to avoid canvas glitching
                const oldTransform = element.style.transform;
                element.style.transform = 'none';
                
                const canvas = await html2canvas(element, {
                    backgroundColor: null,
                    scale: 2
                });
                
                element.style.transform = oldTransform;
                
                const link = document.createElement('a');
                link.download = 'MonRewind.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (err) {
                console.error("Export failed", err);
            }
        });
    }
});