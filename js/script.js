const apiKey = "ab1bb8942c19a355d0744cbc078f6648";
const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const weatherResult = document.getElementById("weather-result");
const themeBtn = document.getElementById("theme-toggle");

// Theme Toggle
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  themeBtn.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
});

// Search weather
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) getWeather(city);
});

// Fetch weather
async function getWeather(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();
    showWeather(data);
  } catch (error) {
    weatherResult.innerHTML = `<p style="color:red;">${error.message}</p>`;
  }
}

// Show weather
function showWeather(data) {
  const { name, main, weather } = data;

  // Map OpenWeather icons to weather-icons classes
  const iconClass = getWeatherIcon(weather[0].id);

  weatherResult.innerHTML = `
    <i class="weather-icon wi ${iconClass}"></i>
    <h2>${name}</h2>
    <p>${weather[0].description}</p>
    <h3>${main.temp}°C</h3>
    <p>Feels like: ${main.feels_like}°C</p>
    <p>Humidity: ${main.humidity}%</p>
  `;
}

// Map OpenWeather codes to Weather Icons
function getWeatherIcon(id) {
  if (id >= 200 && id < 300) return "wi-thunderstorm";
  if (id >= 300 && id < 500) return "wi-sprinkle";
  if (id >= 500 && id < 600) return "wi-rain";
  if (id >= 600 && id < 700) return "wi-snow";
  if (id >= 700 && id < 800) return "wi-fog";
  if (id === 800) return "wi-day-sunny";
  if (id > 800 && id < 900) return "wi-cloudy";
  return "wi-na";
}
// Geolocation
window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      getWeatherByCoords(latitude, longitude);
    });
  }
});

// Get weather by coords
async function getWeatherByCoords(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();
    showWeather(data);
    getForecast(lat, lon);
  } catch (err) {
    weatherResult.innerHTML = `<p style="color:red;">Cannot fetch weather</p>`;
  }
}

// 5-Day Forecast
async function getForecast(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    // Filter one forecast per day (12:00)
    const daily = data.list.filter(f => f.dt_txt.includes("12:00:00"));
    showForecast(daily);
  } catch (err) {
    document.getElementById("forecast").innerHTML = `<p style="color:red;">Cannot fetch forecast</p>`;
  }
}

// Display forecast
function showForecast(daily) {
  const forecastDiv = document.getElementById("forecast");
  forecastDiv.innerHTML = daily.map(day => {
    const date = new Date(day.dt_txt).toLocaleDateString("en-US", { weekday: "short" });
    const iconClass = getWeatherIcon(day.weather[0].id);
    return `
      <div class="forecast-card">
        <h4>${date}</h4>
        <i class="wi ${iconClass}"></i>
        <p>${day.main.temp}°C</p>
      </div>
    `;
  }).join("");
}
const favoritesList = document.getElementById("favorites-list");
const loader = document.getElementById("loader");

// Loader show/hide
function showLoader() { loader.style.display = "block"; }
function hideLoader() { loader.style.display = "none"; }

// Friendly Error
function showError(message) {
  weatherResult.innerHTML = `<p style="color:red;">${message}</p>`;
  forecast.innerHTML = "";
}

// Favorites (LocalStorage)
function addFavorite(city) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favorites.includes(city)) favorites.push(city);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

function renderFavorites() {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favoritesList.innerHTML = favorites.map(city => 
    `<button class="fav-btn">${city}</button>`).join("");
  document.querySelectorAll(".fav-btn").forEach(btn => {
    btn.addEventListener("click", () => getWeather(btn.textContent));
  });
}

// Update getWeather to include loader & error handling
async function getWeather(city) {
  try {
    showLoader();
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    hideLoader();
    if (!response.ok) return showError("City not found, try again!");
    const data = await response.json();
    showWeather(data);
    getForecast(data.coord.lat, data.coord.lon);
    addFavorite(city);
  } catch (err) {
    hideLoader();
    showError("Cannot fetch weather, try later.");
  }
}

// Initialize favorites on load
renderFavorites();
