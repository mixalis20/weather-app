const apiKey = "ab1bb8942c19a355d0744cbc078f6648"; // Βάλε το API key σου από OpenWeatherMap
const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const weatherResult = document.getElementById("weather-result");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeather(city);
  }
});

async function getWeather(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("City not found");
    }
    const data = await response.json();
    showWeather(data);
  } catch (error) {
    weatherResult.innerHTML = `<p style="color:red;">${error.message}</p>`;
  }
}

function showWeather(data) {
  const { name, main, weather } = data;
  weatherResult.innerHTML = `
    <h2>${name}</h2>
    <p>${weather[0].description}</p>
    <h3>${main.temp}°C</h3>
    <p>Feels like: ${main.feels_like}°C</p>
    <p>Humidity: ${main.humidity}%</p>
  `;
}
