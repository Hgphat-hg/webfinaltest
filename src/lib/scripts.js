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
        })
        .catch((error) => console.error(error));
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