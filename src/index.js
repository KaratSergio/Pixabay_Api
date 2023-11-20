import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { fetchPhotos } from './js/api';
import { createPhotoCard, appendGallery, clearGallery } from './js/galleryMarkup';
import { initializeScrollObserver } from './js/scrollLibrary';

const gallerySelector = document.querySelector('.gallery');
const gallery = new SimpleLightbox('.gallery a', { enableKeyboard: true });

const state = {
  currentPage: 1,
  isLoading: false,
  initialLoad: true,
  total: 0,
  imagesPerPage: 40,
  errorNotified: false,
};

document.querySelector('.search-form').addEventListener('submit', handleFormSubmit);

initializeScrollObserver(handleScroll);

async function handleScroll(entries) {
  if (entries[0].isIntersecting && !state.isLoading && !state.errorNotified) {
    try {
      state.isLoading = true;

      const searchQueryValue = document.querySelector('.search-form input').value.trim();
      if (!searchQueryValue) {
        state.isLoading = false;
        return;
      }

      const { fetchedTotal, photos } = await fetchPhotos(searchQueryValue, state.currentPage, state.imagesPerPage);
      const photoCardsHTML = await renderPhotos(photos);

      if (state.initialLoad) {
        clearGallery(gallerySelector);
        appendGallery(gallerySelector, photoCardsHTML);
        state.initialLoad = false;
      } else {
        appendGallery(gallerySelector, photoCardsHTML);
      }

      gallery.refresh();

      state.total = fetchedTotal;

      if (state.total && state.currentPage * state.imagesPerPage >= state.total) {
        Notify.info('All images loaded.');
        state.errorNotified = true;
      }

      state.currentPage += 1;
    } catch (error) {
      console.error('Error loading more images:', error.message);
      Notify.failure("We're sorry, but there was an error loading more images.");
      state.errorNotified = true;
    } finally {
      state.isLoading = false;
    }
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const { elements: { searchQuery } } = e.target;
  const searchQueryValue = searchQuery.value.trim();

  if (!searchQueryValue) {
    clearGallery(gallerySelector);
    return Notify.failure('Please enter a search query.');
  }

  state.currentPage = 1;
  state.initialLoad = true;
  state.errorNotified = false;

  clearGallery(gallerySelector);
  try {
    const { fetchedTotal, photos } = await fetchPhotos(searchQueryValue, state.currentPage, state.imagesPerPage);
    const photoCardsHTML = renderPhotos(photos);

    appendGallery(gallerySelector, photoCardsHTML);
    gallery.refresh();

    state.total = fetchedTotal;

    Notify.success(`Found ${state.total} images.`);
  } catch (error) {
    console.error('Error handling form submit:', error.message);
    Notify.failure('Error handling form submit. Please try again.');
  }
}

function renderPhotos(photos) {
  return photos.map(photo => createPhotoCard(photo)).join('');
}

