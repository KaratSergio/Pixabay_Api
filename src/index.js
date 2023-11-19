import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const gallerySelector = document.querySelector('.gallery');
let currentPage = 1;
let isLoading = false;
let initialLoad = true;
let total = 0;
const imagesPerPage = 40;
const gallery = new SimpleLightbox('.gallery a', { enableKeyboard: true });

let errorNotified = false;

document.querySelector('.search-form').addEventListener('submit', handleFormSubmit);
window.addEventListener('scroll', handleScroll);

async function handleScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight - 200 && !isLoading && !errorNotified) {
    try {
      isLoading = true;

      const { fetchedTotal, photos } = await fetchPhotos(document.querySelector('.search-form input').value.trim(), currentPage);
      const photoCardsHTML = await renderPhotos(photos);

      if (initialLoad) {
        clearGallery();
        appendToGallery(photoCardsHTML);
        initialLoad = false;
      } else {
        appendToGallery(photoCardsHTML);
      }

      gallery.refresh();

      total = fetchedTotal;

      if (total && currentPage * imagesPerPage >= total) {
        Notify.info('All images loaded.');
        errorNotified = true;
      }

      currentPage += 1;
    } catch (error) {
      console.error('Error loading more images:', error.message);
      Notify.failure("We're sorry, but there was an error loading more images.");
      errorNotified = true;
    } finally {
      isLoading = false;
    }
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const { elements: { searchQuery } } = e.target;
  const searchQueryValue = searchQuery.value.trim();

  if (searchQueryValue === '') {
    clearGallery();
    return Notify.failure('Please enter a search query.');
  }

  currentPage = 1;
  initialLoad = true;
  errorNotified = false;

  clearGallery();
  try {
    const { fetchedTotal, photos } = await fetchPhotos(searchQueryValue, currentPage);
    const photoCardsHTML = await renderPhotos(photos);

    appendToGallery(photoCardsHTML);
    gallery.refresh();

    total = fetchedTotal;

    Notify.success(`Found ${total} images.`);
  } catch (error) {
    console.error('Error handling form submit:', error.message);
    Notify.failure('Error handling form submit. Please try again.');
  }
}

async function fetchPhotos(query, currentPage) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '40643270-9522dad6da71c07e3e25300aa',
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: imagesPerPage,
      },
    });

    const { total: fetchedTotal, hits: photos } = response.data;

    if (fetchedTotal === 0) {
      throw new Error('No results found for your request.');
    }

    return { fetchedTotal, photos };
  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw new Error('Error fetching data. Please try again.');
  }
}

function renderPhotos(photos) {
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
















