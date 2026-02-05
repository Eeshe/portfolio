document.addEventListener('DOMContentLoaded', () => {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const projectsSection = document.getElementById('projects');

    if (scrollIndicator && projectsSection) {
        scrollIndicator.addEventListener('click', (e) => {
            e.preventDefault();
            projectsSection.scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
});
