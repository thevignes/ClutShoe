let mainImageZoom = document.getElementById('mainImageZoom');
let isZoomed = false;

// Toggle zoom on click
mainImageZoom.addEventListener('click', () => {
    if (!isZoomed) {
        mainImageZoom.classList.add('active');
        isZoomed = true;
    } else {
        mainImageZoom.classList.remove('active');
        isZoomed = false;
    }
});

// Update the background position on mousemove
mainImageZoom.addEventListener('mousemove', (event) => {
    if (isZoomed) {
        let pointer = {
            x: (event.offsetX * 100) / mainImageZoom.offsetWidth,
            y: (event.offsetY * 100) / mainImageZoom.offsetHeight
        };
        mainImageZoom.style.backgroundPosition = `${pointer.x}% ${pointer.y}%`;
    }
});

// Thumbnail click to change the main image
const thumbnails = document.querySelectorAll('.thumbnail');
thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener('click', function() {
        let imgUrl = this.getAttribute('data-image-url');
        mainImageZoom.style.backgroundImage = `url(${imgUrl})`;
    });
});
