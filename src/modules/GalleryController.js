export default class GalleryController {
    constructor(containerSelector, data, onCardOpen, onCardClose) {
        this.container = document.querySelector(containerSelector);
        this.data = data;
        this.onCardOpen = onCardOpen;
        this.onCardClose = onCardClose;
        this.activePostcard = null;
        this.lastScrollY = 0;
    }

    render() {
        this.container.innerHTML = '';
        this.data.forEach((item, index) => {
            const card = this.createCardElement(item, index);
            this.container.appendChild(card);
        });
    }

    createCardElement(item, index) {
        const article = document.createElement('article');
        article.className = 'postcard';
        article.dataset.index = index;
        article.dataset.bgColor = item.bgColor;
        article.dataset.themeClass = item.themeClass;
        // Keep these for legacy or CSS usage if needed, though we use data directly now
        article.dataset.lat = item.lat;
        article.dataset.lng = item.lng;
        article.setAttribute('tabindex', '0');
        article.setAttribute('role', 'button');

        // Optimize Images: Use the w= parameter from Unsplash
        const thumbUrl = this.optimizeUrl(item.image, 600);
        const mediumUrl = this.optimizeUrl(item.image, 900);
        const fullUrl = this.optimizeUrl(item.image, 1200);

        // Generate srcset
        const srcset = `${thumbUrl} 600w, ${mediumUrl} 900w, ${fullUrl} 1200w`;
        const sizes = '(max-width: 600px) 90vw, (max-width: 900px) 50vw, 300px';

        // Create elements securely using DOM API to prevent XSS
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'postcard__image-wrapper';

        const img = document.createElement('img');
        img.src = thumbUrl;
        img.srcset = srcset;
        img.sizes = sizes;
        img.alt = item.alt;
        img.className = 'postcard__image';
        img.loading = 'lazy';
        img.width = 600;
        img.height = 800;

        // Image Error Handling
        img.onerror = () => {
            img.style.display = 'none';
            const errorDiv = document.createElement('div');
            errorDiv.className = 'image-error';
            errorDiv.textContent = 'Image not available';
            // Avoid inline styles
            errorDiv.classList.add('image-error-placeholder');
            imageWrapper.appendChild(errorDiv);
        };

        imageWrapper.appendChild(img);

        const overlay = document.createElement('div');
        overlay.className = 'postcard__overlay';

        const title = document.createElement('h3');
        title.className = 'postcard__title';
        title.textContent = item.title;

        const tagline = document.createElement('span');
        tagline.className = 'postcard__tagline';
        tagline.textContent = item.tagline;

        overlay.appendChild(title);
        overlay.appendChild(tagline);

        const focusContent = document.createElement('div');
        focusContent.className = 'focus-content';

        const focusTitle = document.createElement('h3');
        focusTitle.className = 'postcard__title';
        // Avoid inline style: style="margin-bottom: 1.5rem;"
        focusTitle.classList.add('focus-title-margin');
        focusTitle.textContent = item.title;

        const desc = document.createElement('p');
        desc.textContent = item.desc;

        focusContent.appendChild(focusTitle);
        focusContent.appendChild(desc);

        article.appendChild(imageWrapper);
        article.appendChild(overlay);
        article.appendChild(focusContent);

        const handleOpen = (e) => {
            if (article.classList.contains('is-active')) return;
            e.preventDefault();
            this.openPostcard(article);
        };

        article.addEventListener('click', handleOpen);
        article.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                handleOpen(e);
            }
        });

        return article;
    }

    optimizeUrl(url, width) {
        if (url.includes('unsplash.com')) {
            if (url.includes('?')) {
                if (url.match(/w=\d+/)) {
                    return url.replace(/w=\d+/, `w=${width}`);
                } else {
                    return `${url}&w=${width}`;
                }
            } else {
                return `${url}?w=${width}`;
            }
        }
        return url;
    }

    openPostcard(postcard) {
        if (this.activePostcard || postcard.classList.contains('is-opening')) return;

        this.lastScrollY = window.scrollY;
        this.activePostcard = postcard;

        if (this.onCardOpen) this.onCardOpen(postcard);

        const initialRect = postcard.getBoundingClientRect();
        postcard.classList.add('is-active', 'is-opening');
        const finalRect = postcard.getBoundingClientRect();

        const invertX = initialRect.left - finalRect.left;
        const invertY = initialRect.top - finalRect.top;
        const scaleX = initialRect.width / finalRect.width;
        const scaleY = initialRect.height / finalRect.height;

        postcard.style.transition = 'none';
        postcard.style.transform = `translate(${invertX}px, ${invertY}px) scale(${scaleX}, ${scaleY})`;
        postcard.style.transformOrigin = 'top left';

        // Update sizes for full screen view to prioritize high res
        const img = postcard.querySelector('img');
        if (img) {
            img.sizes = '100vw';
        }

        requestAnimationFrame(() => {
            postcard.style.transition = '';
            postcard.style.transform = '';
            postcard.style.transformOrigin = '';
        });

        postcard.addEventListener(
            'transitionend',
            () => {
                postcard.classList.remove('is-opening');
            },
            { once: true }
        );
    }

    closePostcard() {
        if (!this.activePostcard || this.activePostcard.classList.contains('is-closing')) return;

        const postcard = this.activePostcard;

        if (this.onCardClose) this.onCardClose(postcard);

        const startRect = postcard.getBoundingClientRect();

        postcard.classList.remove('is-active');
        postcard.classList.add('is-closing');

        // Reset sizes
        const img = postcard.querySelector('img');
        if (img) {
            img.sizes = '(max-width: 600px) 90vw, (max-width: 900px) 50vw, 300px';
        }

        const endRect = postcard.getBoundingClientRect();

        const invertX = startRect.left - endRect.left;
        const invertY = startRect.top - endRect.top;
        const scaleX = startRect.width / endRect.width;
        const scaleY = startRect.height / endRect.height;

        postcard.style.transform = `translate(${invertX}px, ${invertY}px) scale(${scaleX}, ${scaleY})`;
        postcard.style.transformOrigin = 'top left';

        postcard.offsetHeight;

        postcard.style.transition = 'transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1)';
        postcard.style.transform = '';

        postcard.addEventListener(
            'transitionend',
            () => {
                postcard.classList.remove('is-closing');
                postcard.style.transition = '';
                postcard.style.transformOrigin = '';
                this.activePostcard = null;
                window.scrollTo({ top: this.lastScrollY, behavior: 'instant' });
            },
            { once: true }
        );
    }

    closeImmediate() {
        if (!this.activePostcard) return;
        const postcard = this.activePostcard;
        postcard.classList.remove('is-active', 'is-closing', 'is-opening');
        postcard.style.transform = '';
        postcard.style.transition = '';
        this.activePostcard = null;
        window.scrollTo({ top: this.lastScrollY, behavior: 'instant' });
    }

    openCardByIndex(index) {
        const card = this.container.querySelector(`.postcard[data-index="${index}"]`);
        if (card) {
            this.openPostcard(card);
        }
    }
}
