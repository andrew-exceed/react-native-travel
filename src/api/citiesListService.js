const baseURL = 'http://autocomplete.travelpayouts.com/places2';
const defaultLanguage = 'ru';

export const getCities = async (string, language = defaultLanguage) => {
    const response = await fetch(`${baseURL}?term=${string}&locale=${language}&types[]=city`);
    const data = await response.json();
    return data;
}

export default getCities