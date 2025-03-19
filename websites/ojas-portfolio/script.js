document.addEventListener('DOMContentLoaded', () => {
    // Home section fade-in
    const home = document.querySelector('.hero');
    setTimeout(() => {
        home.style.opacity = 1;
    }, 500);

    // Animations on scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            if (sectionTop <= window.innerHeight - 100) {
                section.classList.add('visible');
            } else {
                section.classList.remove('visible');
            }
        });
    });
});
