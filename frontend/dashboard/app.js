const optionsBtn = document.querySelector('.options-btn');
const modal = document.querySelector('.modal');
const closeBtn = modal.querySelector('.close-btn');

optionsBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
});

closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }
});