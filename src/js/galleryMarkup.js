export function createPhotoCard(photo) {
return `<a href="${photo.largeImageURL}">
    <div class="photo-card">
        <img src="${photo.webformatURL}" alt="${photo.tags}" loading="lazy" class="img-item" />
        <div class="info">
        <p class="info-item"><b>Likes:</b>${photo.likes}</p>
        <p class="info-item"><b>Views:</b>${photo.views}</p>
        <p class="info-item"><b>Comments:</b>${photo.comments}</p>
        <p class="info-item"><b>Downloads:</b>${photo.downloads}</p>
        </div>
    </div>
    </a>`;
}

export function appendGallery(gallerySelector, photoCardsHTML) {
    gallerySelector.insertAdjacentHTML('beforeend', photoCardsHTML);
}

export function clearGallery(gallerySelector) {
    gallerySelector.innerHTML = '';
}
