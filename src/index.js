import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import './css/styles.css';

const formEl = document.getElementById('search-form');
const galleryEl = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more');
let currentPage = 1;
let totalHits = 0;

loadBtn.style.display = 'none';

formEl.addEventListener('submit', handleFormSubmit);
loadBtn.addEventListener('click', loadMoreImages);

function handleFormSubmit(e) {
  e.preventDefault();
  const query = e.target.elements.searchQuery.value.trim();

  if (query !== '') {
    searchImages(query);
    loadBtn.style.display = 'none';
  }
}

async function searchImages(query) {
  try {
    const apiKey = '40643270-9522dad6da71c07e3e25300aa';
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: apiKey,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: 40,
      },
    });

    const data = response.data;

    if (data.hits.length > 0) {
      clearGallery();
      displayImages(data.hits);

      totalHits = data.totalHits;

      loadBtn.style.display = 'block';

      if (totalHits <= currentPage * 40) {
        showResultMessage(
          "We're sorry, but you've reached the end of search results."
        );
      }
    } else {
      showErrorMessage(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    showErrorMessage('Error! Please try again later.');
  }
}

async function loadMoreImages() {
  currentPage += 1;
  const query = formEl.elements.searchQuery.value.trim();
  await searchImages(query);
}

function displayImages(images) {
  images.forEach(image => {
    const cardElement = createPhotoCard(image);
    galleryEl.appendChild(cardElement);
  });
}

function createPhotoCard(image) {
  const cardElement = document.createElement('div');
  cardElement.classList.add('photo-card');

  const imgElement = document.createElement('img');
  imgElement.src = image.webformatURL;
  imgElement.alt = image.tags;
  imgElement.loading = 'lazy';
  imgElement.setAttribute('data-large', image.largeImageURL);
  
  cardElement.appendChild(imgElement);
  
  const infoElement = document.createElement('div');
  infoElement.classList.add('info');

  const infoItems = ['Likes', 'Views', 'Comments', 'Downloads'];

  infoItems.forEach(item => {
    const pItem = document.createElement('p');
    pItem.classList.add('info-item');
    pItem.innerHTML = `<b>${item}:</b> ${image[item.toLowerCase()] || 0}`;
    infoElement.appendChild(pItem);
  });

  cardElement.appendChild(infoElement);

  return cardElement;
}

function clearGallery() {
  galleryEl.innerHTML = '';
}

function showErrorMessage(message) {
  Notiflix.Notify.failure(message);
}

function showResultMessage(message) {
  Notiflix.Notify.info(message);
}
