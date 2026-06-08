const API_URL = "https://api.open-meteo.com/v1/forecast?current_weather=true&timezone=Asia%2FBangkok";
const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const statusEl = document.getElementById("status");
const weatherCard = document.getElementById("weather-card");
const historySection = document.getElementById("history");
const historyList = document.getElementById("history-list");

const STORAGE_KEY = "weather_app_history";
let searchHistory = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

function showStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.style.color = isError ? "#dc2626" : "#111827";
}

function renderWeather(weather) {
  weatherCard.innerHTML = `
    <p><strong>Nhiệt độ:</strong> ${weather.temperature}°C</p>
    <p><strong>Tốc độ gió:</strong> ${weather.windspeed} km/h</p>
    <p><strong>Hướng gió:</strong> ${weather.winddirection}°</p>
    <p><strong>Thời gian:</strong> ${weather.time}</p>
  `;
  weatherCard.classList.remove("hidden");
}

function renderHistory() {
  if (searchHistory.length === 0) {
    historySection.classList.add("hidden");
    return;
  }

  historySection.classList.remove("hidden");
  historyList.innerHTML = searchHistory
    .map(city => `<li><button type="button" style="color: #2563eb;" data-city="${city}">${city}</button></li>`)
    .join("");
}

function saveHistory(city) {
  searchHistory = [city, ...searchHistory.filter(item => item !== city)].slice(0, 5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searchHistory));
  renderHistory();
}

async function searchCity(city) {
  showStatus("Đang tải...");
  weatherCard.classList.add("hidden");

  try {
    const response = await fetch(`${API_URL}&latitude=21.03&longitude=105.85`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    const weather = data.current_weather;
    renderWeather(weather);
    saveHistory(city);
    showStatus("Tải dữ liệu thành công.");
  } catch (error) {
    showStatus(`Lỗi: ${error.message}`, true);
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;
  searchCity(city);
});

historyList.addEventListener("click", event => {
  const city = event.target.dataset.city;
  if (city) {
    cityInput.value = city;
    searchCity(city);
  }
});

renderHistory();
