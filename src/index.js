import axios from 'axios';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Notiflix from 'notiflix';
import { Notify } from 'notiflix/build/notiflix-notify-aio';


const formEl = document.getElementById('search-form');
const galleryEl = document.querySelector('.gallery');

formEl.addEventListener('submit', async function (e){
    e.preventDefault();
    const query = e.target.elements.searchQuery.value.trim();

    if(query !== '') {
        try {
            const apiKey = '40643270-9522dad6da71c07e3e25300aa';
            const response = await axios.get('https://pixabay.com/api/',{
                params: {
                    key: apiKey,
                    q: query,
                    image_type: 'photo',
                    orientation: 'horizontal',
                    safesearch: true,
                },
            });

            const data = response.data;

            if (data.hits.length > 0) {
                clearGallery();
                displayImages(data.hits);
            } else {
                showErrorMessage('Sorry, there are no images matching your search query. Please try again.');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            showErrorMessage('Error! Please try again later.');
        }
    }
});

function displayImages(images) {
images.forEach(image => {
    const cardElement = createPhotoCard(image);
    galleryEl.appendChild(cardElement);
});
}

function createPhotoCard(image){
    const cardElement = document.createElement('div');
    cardElement.classList.add('photo-card');

    const imgElement = document.createElement('img');
    imgElement.src = image.webformatURL;
    imgElement.alt=image.tags;
    imgElement.loading='lazy';
    imgElement.setAttribute('data-large', image.largeImageURL);

    const infoElement = document.createElement('div');
    infoElement.classList.add('info');

    const infoItems = ['Likes', 'Views', 'Comments', 'Downloads'];

    infoItems.forEach(item => {
        const pItem = document.createElement('p');
        pItem.classList.add('info-item');
        pItem.innerHTML = `<b>${item}:</b> ${image[item.toLowerCase()] || 0}`;
        infoElement.appendChild(pItem);
    });

    cardElement.appendChild(imgElement);
    cardElement.appendChild(infoElement);

    return cardElement;
}

function clearGallery(){
    galleryEl.innerHTML = '';
}

function showErrorMessage(message) {
  Notiflix.Notify.failure(message);
}