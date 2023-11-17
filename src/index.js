import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const gallerySelector = document.querySelector('.gallery');
const btnLoadMore = document.querySelector('.load-more');
let pageNumber = 1;

const gallery = new SimpleLightbox('.gallery a', { enableKeyboard: true });

btnLoadMore.style.display = 'none';

document.querySelector('.search-form').addEventListener('submit', handleFormSubmit);
btnLoadMore.addEventListener('click', loadMoreImages);

function toggleLoadMoreButton(isVisible) {
  btnLoadMore.style.display = isVisible ? 'block' : 'none';
}

function updatePageNumber(increment = 1) {
  pageNumber += increment;
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const { elements: { searchQuery } } = e.target;
  const searchQueryValue = searchQuery.value.trim();

  if (searchQueryValue === '') {
    clearGallery();
    toggleLoadMoreButton(false);
    return Notify.failure('Sorry, there are no images matching your search query. Please try again.');
  }

  updatePageNumber(-pageNumber + 1);
  clearGallery();
  try {
    const { total, photos } = await fetchPhotos(searchQueryValue);
    const photoCardsHTML = await renderPhotos(photos);

    appendToGallery(photoCardsHTML);
    toggleLoadMoreButton(true);
    gallery.refresh();

    Notify.success(`Found ${total} images.`);
  } catch (error) {
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
  }
}

async function loadMoreImages() {
  updatePageNumber();
  try {
    const { total, photos } = await fetchPhotos(document.querySelector('.search-form input').value.trim());
    const photoCardsHTML = await renderPhotos(photos);

    appendToGallery(photoCardsHTML);
    toggleLoadMoreButton(true);
    gallery.refresh();

    const { per_page: imagesPerPage } = photos;
    if (pageNumber * imagesPerPage >= total) {
      toggleLoadMoreButton(false);
    }
  } catch (error) {
    Notify.failure("We're sorry, but you've reached the end of search results.");
  }
}

async function fetchPhotos(query) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '40643270-9522dad6da71c07e3e25300aa',
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: pageNumber,
        per_page: '40',
      },
    });

    const { total, hits: photos } = response.data;

    if (total === 0) {
      throw new Error('There are no results for your request.');
    }

    return { total, photos };
  } catch (error) {
    throw new Error('Error fetching data');
  }
}

async function renderPhotos(photos) {
  return photos
    .map(photo =>
      `<a href="${photo.largeImageURL}">
        <div class="photo-card">
          <img src="${photo.webformatURL}" alt="${photo.tags}" loading="lazy" class="img-item" />
          <div class="info">
            <p class="info-item"><b>Likes:</b>${photo.likes}</p>
            <p class="info-item"><b>Views:</b>${photo.views}</p>
            <p class="info-item"><b>Comments:</b>${photo.comments}</p>
            <p class="info-item"><b>Downloads:</b>${photo.downloads}</p>
          </div>
        </div>
      </a>`
    )
    .join('');
}

function appendToGallery(photoCardsHTML) {
  gallerySelector.insertAdjacentHTML('beforeend', photoCardsHTML);
}

function clearGallery() {
  gallerySelector.innerHTML = '';
}

