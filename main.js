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
        if (link.hostname === window.location.hostname &&
            !link.hash &&
            link.getAttribute('target') !== '_blank') {

            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.href;
                body.classList.add('is-transitioning');
                setTimeout(() => {
                    window.location.href = target;
                }, 500);
            });
        }
    });

    // Fade out overlay on page load
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            body.classList.remove('is-transitioning');
        }
    });

    // Global Lightbox functionality for triggers
    document.querySelectorAll('.lightbox-trigger').forEach(trigger => {
        trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            const media = this.querySelector('img, video') || this;
            if (media && (media.tagName === 'IMG' || media.tagName === 'VIDEO')) {
                openLightbox(media);
            }
        });
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

        // Autoplay videos in carousel when they become visible
        const manageVideos = () => {
            slides.forEach((slide, index) => {
                const video = slide.querySelector('video');
                if (video) {
                    if (index === currentIndex) {
                        video.play().catch(err => console.log("Video play blocked:", err));
                    } else {
                        video.pause();
                        video.currentTime = 0;
                    }
                }
            });
        };

        const updateIndicators = (index) => {
            const indicators = Array.from(indicatorsContainer.children);
            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === index);
            });
        };

        const goToSlide = (index) => {
            track.style.transform = `translateX(-${index * 100}%)`;
            currentIndex = index;
            updateIndicators(index);
            manageVideos();
        };

        // Create indicators
        slides.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            if (index === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => goToSlide(index));
            indicatorsContainer.appendChild(indicator);
        });

        nextButton.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % slides.length;
            goToSlide(currentIndex);
        });

        prevButton.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            goToSlide(currentIndex);
        });

        // Carousel Slide Lightbox & Captions
        slides.forEach(slide => {
            const media = slide.querySelector('img, video');
            if (media) {
                // Generate caption
                const captionText = media.getAttribute('alt') || media.getAttribute('title');
                if (captionText) {
                    const caption = document.createElement('div');
                    caption.className = 'carousel-caption';
                    caption.textContent = captionText;
                    slide.appendChild(caption);
                }

                slide.addEventListener('click', (e) => {
                    openLightbox(media);
                });
            }
        });

        // Run initial carousel video check
        manageVideos();
    });
    // Universal Video Autoplay Handler (for non-carousel videos like on the homepage)
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;

            // Carousel videos are managed by their own logic
            if (video.closest('.media-carousel')) return;

            if (entry.isIntersecting) {
                // Force a load if it's stalled
                if (video.readyState === 0) video.load();
                video.play().catch(() => { });
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.1 }); // More sensitive trigger

    document.querySelectorAll('video').forEach(vid => {
        if (!vid.closest('.media-carousel')) {
            videoObserver.observe(vid);
        }
    });

    // Lightbox Implementation
    function openLightbox(mediaElement) {
        let lightbox = document.querySelector('.lightbox');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <div class="lightbox-close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </div>
                <div class="lightbox-content"></div>
            `;
            document.body.appendChild(lightbox);
            lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) closeLightbox();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeLightbox();
            });
        }

        const content = lightbox.querySelector('.lightbox-content');
        content.innerHTML = '';

        let clone;
        if (mediaElement.tagName === 'VIDEO') {
            clone = document.createElement('video');
            clone.controls = true;
            clone.autoplay = true;
            clone.muted = false;
            clone.loop = true;
            clone.style.display = 'block';

            // Using source tag for better browser compatibility
            const source = document.createElement('source');
            source.src = mediaElement.src;
            source.type = 'video/mp4';
            clone.appendChild(source);

            // Force load/play
            clone.load();
        } else {
            clone = mediaElement.cloneNode(true);
            clone.classList.remove('zoomed');

            // Zoom only for images
            clone.addEventListener('click', (e) => {
                e.stopPropagation();
                clone.classList.toggle('zoomed');
            });
        }

        clone.className = 'lightbox-media';
        content.appendChild(clone);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        const lightbox = document.querySelector('.lightbox');
        if (lightbox) {
            lightbox.classList.remove('active');
            const media = lightbox.querySelector('video');
            if (media) {
                media.pause();
                media.src = "";
            }
            document.body.style.overflow = '';
        }
    }

    // Config Viewer Logic
    const configTabs = document.querySelectorAll('.config-tab');
    const codeWrapper = document.querySelector('.code-wrapper');
    const codeBlock = document.querySelector('.code-block');
    const expandBtn = document.querySelector('.expand-button');
    const btnText = expandBtn?.querySelector('span');

    const highlightYAML = (text) => {
        // Escape HTML
        let escaped = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        return escaped
            .replace(/#.*$/gm, '<span class="yaml-com">$&</span>') // Comments
            .replace(/^(\s*[\w-]+:)/gm, '<span class="yaml-key">$&</span>') // Keys
            .replace(/:\s*(true|false|yes|no)\b/gi, ': <span class="yaml-bool">$1</span>') // Bools
            .replace(/:\s*(\d+)\b/g, ': <span class="yaml-num">$1</span>') // Numbers
            .replace(/:\s*(?!<span)([^<#\n]+)/g, ': <span class="yaml-val">$1</span>'); // Remaining values (Strings/Enums)
    };

    const loadConfig = async (url) => {
        try {
            const response = await fetch(url);
            const text = await response.text();
            codeBlock.innerHTML = highlightYAML(text);
            // Reset expansion state when switching tabs
            codeWrapper.classList.remove('expanded');
            if (btnText) btnText.textContent = 'Expand Configuration';
        } catch (err) {
            codeBlock.textContent = 'Error loading configuration: ' + err.message;
        }
    };

    configTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            configTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadConfig(tab.dataset.url);
        });
    });

    if (expandBtn && codeWrapper) {
        expandBtn.addEventListener('click', () => {
            const isExpanded = codeWrapper.classList.toggle('expanded');
            btnText.textContent = isExpanded ? 'Collapse Configuration' : 'Expand Configuration';
        });
    }

    // Load initial tab
    const activeTab = document.querySelector('.config-tab.active');
    if (activeTab) loadConfig(activeTab.dataset.url);
    // Voucher Scroll System
    const voucherContainer = document.querySelector('.vouchers-container');
    const voucherTrack = document.querySelector('.vouchers-track');

    if (voucherContainer && voucherTrack) {
        // Clone for seamless loop
        const vouchers = Array.from(voucherTrack.children);
        vouchers.forEach(voucher => {
            const clone = voucher.cloneNode(true);
            voucherTrack.appendChild(clone);
        });

        let isDown = false;
        let isPaused = false;
        const scrollSpeed = 0.3;
        let currentScroll = 0;

        // Auto-scroll loop
        const step = () => {
            if (!isPaused && !isDown) {
                currentScroll += scrollSpeed;

                const halfWidth = voucherTrack.scrollWidth / 2;
                if (currentScroll >= halfWidth) {
                    currentScroll -= halfWidth;
                } else if (currentScroll <= 0) {
                    currentScroll += halfWidth;
                }

                voucherContainer.scrollLeft = currentScroll;
            } else {
                // Sync currentScroll when user is manually swiping/scrolling
                currentScroll = voucherContainer.scrollLeft;
            }
            requestAnimationFrame(step);
        };
        requestAnimationFrame(step);

        // Hover & Touch Pause
        voucherContainer.addEventListener('mouseenter', () => isPaused = true);
        voucherContainer.addEventListener('mouseleave', () => isPaused = false);

        voucherContainer.addEventListener('touchstart', () => {
            isDown = true;
            isPaused = true;
        }, { passive: true });

        voucherContainer.addEventListener('touchend', () => {
            isDown = false;
            isPaused = false;
            currentScroll = voucherContainer.scrollLeft;

            // Re-sync loop
            const halfWidth = voucherTrack.scrollWidth / 2;
            if (currentScroll >= halfWidth) {
                currentScroll -= halfWidth;
                voucherContainer.scrollLeft = currentScroll;
            }
        });
    }

    // Voucher Modal System
    window.openVoucherModal = function (btn) {
        const card = btn.closest('.voucher-card');
        const textArea = card.querySelector('.voucher-text');
        const authorArea = card.querySelector('.voucher-author');
        const relationArea = card.querySelector('.voucher-relation');

        const text = textArea ? textArea.textContent : "";
        const author = authorArea ? authorArea.textContent : "";

        // Reconstruct the link if the card is an <a> tag
        let relationHTML = "";
        if (relationArea) {
            const projectSpan = relationArea.querySelector('.project-underline');
            const projectName = projectSpan ? projectSpan.textContent : "";
            const projectUrl = card.getAttribute('href');

            if (projectUrl && projectUrl !== "#") {
                relationHTML = `Corresponding to <a href="${projectUrl}" class="project-underline">${projectName}</a>`;
            } else {
                relationHTML = relationArea.innerHTML;
            }
        }

        let lightbox = document.querySelector('.lightbox');
        if (!lightbox) {
            // Re-use standard lightbox setup if not present
            openLightbox(document.createElement('div')); // Just to initialize it
            lightbox = document.querySelector('.lightbox');
        }

        const content = lightbox.querySelector('.lightbox-content');
        content.innerHTML = `
            <div class="voucher-modal-content">
                <p class="voucher-modal-text">${text}</p>
                <div class="voucher-modal-footer">
                    <div class="voucher-modal-author">${author}</div>
                    ${relationHTML ? `<div class="voucher-modal-relation">${relationHTML}</div>` : ''}
                </div>
            </div>
        `;

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
});
