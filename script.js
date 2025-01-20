// JavaScript for interactive elements
console.log('Welcome to Weizhe Li\'s personal website!');

// Analytics tracking
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : 'https://personal-website-analytics.vercel.app/api';

async function trackVisit() {
    try {
        const screenResolution = `${window.screen.width}x${window.screen.height}`;
        await fetch(`${API_URL}/track-visit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                isMobile: isMobileDevice(),
                screenResolution: screenResolution
            })
        });
    } catch (error) {
        console.error('Error tracking visit:', error);
    }
}

async function trackEvent(eventType, eventData = {}) {
    try {
        await fetch(`${API_URL}/track-event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                eventType,
                eventData
            })
        });
    } catch (error) {
        console.error('Error tracking event:', error);
    }
}

// Mobile device detection
function isMobileDevice() {
    return (window.innerWidth <= 768) || 
           (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

// Handle mobile-specific adjustments
function handleMobileAdjustments() {
    const isMobile = isMobileDevice();
    document.body.classList.toggle('is-mobile', isMobile);
    
    // Adjust project card interactions for mobile
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        if (isMobile) {
            // For mobile: show overlay on tap
            card.addEventListener('touchstart', function(e) {
                const overlay = this.querySelector('.project-overlay');
                overlay.style.opacity = '1';
                e.preventDefault();
            });
            
            // Hide overlay when touching outside
            document.addEventListener('touchstart', function(e) {
                if (!e.target.closest('.project-card')) {
                    document.querySelectorAll('.project-overlay').forEach(overlay => {
                        overlay.style.opacity = '0';
                    });
                }
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Track initial visit
    trackVisit();
    
    // Initialize mobile detection
    handleMobileAdjustments();
    
    // Re-check on resize
    window.addEventListener('resize', handleMobileAdjustments);
    
    // Portfolio Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const searchInput = document.getElementById('project-search');
    const loadMoreBtn = document.getElementById('load-more-btn');

    // Initialize visible projects count
    let visibleProjects = 6;
    const projectsIncrement = 3;

    // Track button clicks
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            visibleProjects = 6; // Reset visible projects count
            const filterValue = button.getAttribute('data-filter');
            trackEvent('filter_click', { filter: filterValue });
            filterProjects(filterValue, searchInput.value);
        });
    });

    // Track project clicks
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const projectTitle = card.querySelector('h3').textContent;
            trackEvent('project_click', { project: projectTitle });
        });
    });

    // Track search
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            visibleProjects = 6; // Reset visible projects count
            const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
            trackEvent('search', { query: searchInput.value });
            filterProjects(activeFilter, searchInput.value);
        }, 300);
    });

    // Track load more
    loadMoreBtn.addEventListener('click', () => {
        visibleProjects += projectsIncrement;
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        trackEvent('load_more_click');
        filterProjects(activeFilter, searchInput.value);
    });

    // Filter projects function
    function filterProjects(filterValue, searchTerm = '') {
        projectCards.forEach((card, index) => {
            const matchesFilter = filterValue === 'all' || card.getAttribute('data-category') === filterValue;
            const matchesSearch = card.textContent.toLowerCase().includes(searchTerm.toLowerCase());
            const withinVisibleLimit = index < visibleProjects;

            card.classList.remove('visible', 'hidden');
            
            if (matchesFilter && matchesSearch && withinVisibleLimit) {
                card.classList.add('visible');
                card.style.display = 'block';
            } else {
                card.classList.add('hidden');
                card.style.display = 'none';
            }
        });

        // Update load more button visibility
        const totalVisible = document.querySelectorAll('.project-card.visible').length;
        const totalMatching = Array.from(projectCards).filter(card => {
            const matchesFilter = filterValue === 'all' || card.getAttribute('data-category') === filterValue;
            const matchesSearch = card.textContent.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        }).length;

        loadMoreBtn.style.display = totalVisible < totalMatching ? 'block' : 'none';
    }

    // Initialize filtering
    filterProjects('all');
});

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add scroll-based animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.project-card, .skills-category').forEach(el => {
    observer.observe(el);
});
