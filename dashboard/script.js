const refreshBtn = document.getElementById("refresh-btn");
const loadTimeEl = document.getElementById("load-time");
const usersBody = document.getElementById("users-body");
const weatherBody = document.getElementById("weather-body");
const dogsBody = document.getElementById("dogs-body");

function renderWidget(element, content) {
  element.textContent = "";
  element.innerHTML = content;
}

function renderError(element, message) {
  renderWidget(element, `<p style="color: #dc2626;">${message}</p>`);
}

async function loadDashboard() {
  const startTime = Date.now();

  renderWidget(usersBody, "Loading...");
  renderWidget(weatherBody, "Loading...");
  renderWidget(dogsBody, "Loading...");

  const results = await Promise.allSettled([
    fetch("https://jsonplaceholder.typicode.com/users").then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),
    fetch("https://api.open-meteo.com/v1/forecast?latitude=21.03&longitude=105.85&current_weather=true&timezone=Asia%2FBangkok").then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),
    fetch("https://dog.ceo/api/breeds/image/random/5").then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }),
  ]);

  if (results[0].status === "fulfilled") {
    const users = results[0].value;
    renderWidget(usersBody, `
      <ul>${users.slice(0, 5).map(user => `<li>${user.name} (${user.email})</li>`).join("")}</ul>
    `);
  } else {
    renderError(usersBody, results[0].reason.message);
  }

  if (results[1].status === "fulfilled") {
    const weather = results[1].value.current_weather;
    renderWidget(weatherBody, `
      <p>Nhiệt độ: ${weather.temperature}°C</p>
      <p>Tốc độ gió: ${weather.windspeed} km/h</p>
      <p>Thời gian: ${weather.time}</p>
    `);
  } else {
    renderError(weatherBody, results[1].reason.message);
  }

  if (results[2].status === "fulfilled") {
    const images = results[2].value.message;
    renderWidget(dogsBody, `
      <ul>${images.map(url => `<li><img src="${url}" alt="Dog" width="120" loading="lazy"></li>`).join("")}</ul>
    `);
  } else {
    renderError(dogsBody, results[2].reason.message);
  }

  const elapsed = Date.now() - startTime;
  loadTimeEl.textContent = `Data loaded in ${elapsed} ms`;
}

refreshBtn.addEventListener("click", loadDashboard);
loadDashboard();
