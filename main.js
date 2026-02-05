document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for the projects indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const projectsSection = document.getElementById('projects');

    if (scrollIndicator && projectsSection) {
        scrollIndicator.addEventListener('click', (e) => {
            if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || !window.location.pathname.includes('.html')) {
                e.preventDefault();
                projectsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Page Transitions
    const links = document.querySelectorAll('a');
    const body = document.body;

    links.forEach(link => {
        // Only apply to internal links that aren't anchors on the same page
        if (link.hostname === window.location.hostname &&
            !link.hash &&
            link.getAttribute('target') !== '_blank') {

            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.href;

                body.classList.add('is-transitioning');

                setTimeout(() => {
                    window.location.href = target;
                }, 500); // Matches transition-overlay CSS transition speed
            });
        }
    });

    // Fade out overlay on page load
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            body.classList.remove('is-transitioning');
        }
    });

    // Carousel Logic
    const carousels = document.querySelectorAll('.media-carousel');
    carousels.forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const slides = Array.from(track.children);
        const nextButton = carousel.querySelector('.carousel-btn.next');
        const prevButton = carousel.querySelector('.carousel-btn.prev');
        const indicatorsContainer = carousel.querySelector('.carousel-indicators');

        let currentIndex = 0;

        // Create indicators
        slides.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => goToSlide(index));
            indicatorsContainer.appendChild(indicator);
        });

        const indicators = Array.from(indicatorsContainer.children);

        const updateIndicators = (index) => {
            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === index);
            });
        };

        const goToSlide = (index) => {
            track.style.transform = `translateX(-${index * 100}%)`;
            currentIndex = index;
            updateIndicators(index);
        };

        nextButton.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % slides.length;
            goToSlide(currentIndex);
        });

        prevButton.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            goToSlide(currentIndex);
        });
    });
});
