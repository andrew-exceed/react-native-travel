
const baseURL = 'http://api.openweathermap.org/data/2.5/weather';
const defaultUnits = 'metric';
const defaultLanguage = 'ru';
const id = 'ce73a7961a17188751f53f0b32c6f395'

export const getWeather = async (city, units = defaultUnits, language = defaultLanguage ) => {
    const response = await fetch(`${baseURL}?q=${city}&units=${units}&lang=${language}&appid=${id}`);
    const data = await response.json();
    return data;
}

export default getWeather;