const loadComponent = (selector, path, errorMessage) => {
    const container = document.querySelector(selector);
    if (!container) return;

    fetch(path)
        .then((response) => {
            if (!response.ok) throw new Error(errorMessage);
            return response.text();
        })
        .then((content) => {
            container.innerHTML = content;
            if (selector === '#header-container') {
                initializeHeader(container);
            }
        })
        .catch((error) => console.error(error));
};

const initializeHeader = (container) => {
    const header = container.querySelector('.Header');
    const menuToggle = header.querySelector('.menu-toggle');
    const siteNav = header.querySelector('.site-nav');
    const historyMenu = header.querySelector('.history-menu');
    const historyToggle = header.querySelector('.history-toggle');

    menuToggle.addEventListener('click', () => {
        const isOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? 'Đóng menu' : 'Mở menu');
        siteNav.classList.toggle('is-open', isOpen);
    });

    historyToggle.addEventListener('click', () => {
        const isOpen = historyToggle.getAttribute('aria-expanded') !== 'true';
        historyToggle.setAttribute('aria-expanded', String(isOpen));
        historyMenu.classList.toggle('is-open', isOpen);
    });

    siteNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Mở menu');
            siteNav.classList.remove('is-open');
            historyToggle.setAttribute('aria-expanded', 'false');
            historyMenu.classList.remove('is-open');
        });
    });

    header.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Mở menu');
            siteNav.classList.remove('is-open');
            historyToggle.setAttribute('aria-expanded', 'false');
            historyMenu.classList.remove('is-open');
            menuToggle.focus();
        }
    });
};

const componentBase = new URL('../', document.currentScript.src);
loadComponent('#header-container', new URL('components/header.html', componentBase), 'Could not load the site header.');
loadComponent('#footer-container', new URL('components/footer.html', componentBase), 'Could not load the site footer.');

const slider = document.querySelector('.Cuisine-slider');

if (slider) {
    const track = slider.querySelector('.Cuisine-track');
    const images = Array.from(track.querySelectorAll('img:not([aria-hidden="true"])'));
    const previousButton = slider.querySelector('.Cuisine-prev');
    const nextButton = slider.querySelector('.Cuisine-next');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const slideCount = images.length;
    const cloneImage = (image) => {
        const clone = image.cloneNode();
        clone.alt = '';
        clone.setAttribute('aria-hidden', 'true');
        return clone;
    };

    track.insertBefore(cloneImage(images[slideCount - 1]), track.firstChild);

    let currentIndex = 1;
    let autoTimer;
    let transitionTimer;
    let isMoving = false;

    const updatePosition = () => {
        track.style.transform = `translateX(-${currentIndex * 100 / (slideCount + 2)}%)`;
    };

    const scheduleNext = () => {
        if (!reducedMotion) {
            autoTimer = window.setTimeout(() => move(1), 1000);
        }
    };

    const finishMove = () => {
        if (!isMoving) return;
        window.clearTimeout(transitionTimer);
        isMoving = false;

        if (currentIndex === 0 || currentIndex === slideCount + 1) {
            currentIndex = currentIndex === 0 ? slideCount : 1;
            track.classList.add('is-resetting');
            updatePosition();
            track.offsetWidth;
            track.classList.remove('is-resetting');
        }

        previousButton.disabled = false;
        nextButton.disabled = false;
        scheduleNext();
    };

    const move = (direction) => {
        if (isMoving) return;
        window.clearTimeout(autoTimer);
        currentIndex += direction;
        isMoving = true;
        previousButton.disabled = true;
        nextButton.disabled = true;
        updatePosition();

        if (reducedMotion) {
            finishMove();
        } else {
            transitionTimer = window.setTimeout(finishMove, 700);
        }
    };

    track.addEventListener('transitionend', (event) => {
        if (event.propertyName === 'transform') finishMove();
    });
    previousButton.addEventListener('click', () => move(-1));
    nextButton.addEventListener('click', () => move(1));
    updatePosition();
    scheduleNext();
}