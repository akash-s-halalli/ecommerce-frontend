document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');

    if (hamburgerMenu && mobileNav) {
        hamburgerMenu.addEventListener('click', () => {
            // Toggle the 'active' class on the hamburger icon
            hamburgerMenu.classList.toggle('active');

            // Toggle the 'active' class on the mobile nav
            mobileNav.classList.toggle('active');

            // Update ARIA attribute for accessibility
            const isExpanded = hamburgerMenu.getAttribute('aria-expanded') === 'true';
            hamburgerMenu.setAttribute('aria-expanded', !isExpanded);

            // Optional: Prevent body scroll when mobile menu is open
            if (mobileNav.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Optional: Close mobile menu if a link is clicked
        const mobileNavLinks = mobileNav.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileNav.classList.contains('active')) {
                    hamburgerMenu.classList.remove('active');
                    mobileNav.classList.remove('active');
                    hamburgerMenu.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            });
        });

         // Optional: Close mobile menu if clicking outside of it
        document.addEventListener('click', (event) => {
            const isClickInsideNav = mobileNav.contains(event.target);
            const isClickOnHamburger = hamburgerMenu.contains(event.target);

            if (!isClickInsideNav && !isClickOnHamburger && mobileNav.classList.contains('active')) {
                 hamburgerMenu.classList.remove('active');
                 mobileNav.classList.remove('active');
                 hamburgerMenu.setAttribute('aria-expanded', 'false');
                 document.body.style.overflow = '';
            }
        });


    } else {
        console.error("Hamburger menu or mobile navigation element not found!");
    }
});