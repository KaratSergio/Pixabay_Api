import axios from 'axios';

const API_KEY = '40643270-9522dad6da71c07e3e25300aa';
const BASE_URL = 'https://pixabay.com/api/';

export async function fetchPhotos(query, currentPage, imagesPerPage) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
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
