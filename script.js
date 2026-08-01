const API_KEY = "d81b4533367af1aa2da4349d27f2a63c";
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather?";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast?";
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ICONS = {
  Clouds: "clouds.png", Rain: "rain.png", Drizzle: "drizzle.png", Mist: "mist.png",
  Haze: "haze.png", Snow: "snow.png", Clear: "clear.png", Thunderstorm: "rain.png",
};
const NIGHT_ICONS = {
  Clouds: "clouds_night.png", Rain: "rain_night.png", Drizzle: "rain_night.png", Mist: "mist_night.png",
  Haze: "mist_night.png", Snow: "snow_night.png", Clear: "clear_night.png", Thunderstorm: "rain_night.png", Fog: "mist_night.png"
};
const IMG_ERR = "this.onerror=null;this.src='clear.png'";

// UI Elements mapping
const pages = {
  start: document.querySelector(".mainBox1"),
  menu: document.querySelector(".mainBox2"),
  weather: document.querySelector(".mainBox3"),
  forecast: document.querySelector(".mainBox4"),
  about: document.querySelector(".mainBox6"),
  error: document.querySelector(".mainBox5"),
};
const allPages = Object.values(pages);

const ui = {
  search: document.getElementById("inputfield"),
  desc: document.getElementById("desc"),
  temp: document.getElementById("temp"),
  city: document.getElementById("city"),
  wind: document.getElementById("windSpeed"),
  humidity: document.getElementById("humidityper"),
  icon: document.getElementById("icon"),
  feels: document.getElementById("feelsLike"),
  pressure: document.getElementById("pressureVal"),
  clouds: document.getElementById("cloudCover"),
  visibility: document.getElementById("visibilityVal"),
  forecastList: document.getElementById("forecastList"),
  forecastCity: document.getElementById("forecastCity"),
  clock: document.getElementById("liveClock"),
  date: document.getElementById("currentDate"),
  seasonDash: document.getElementById("seasonText"),
  seasonWeather: document.getElementById("weatherSeason"),
  dashLocation: document.getElementById("dashLocation"),
  recentList: document.getElementById("recentList"),
  tempUnitBtn: document.getElementById("tempUnitBtn"),
  tempUnitBtnForecast: document.getElementById("tempUnitBtnForecast"),
};

// State variables
let currentCity = localStorage.getItem("lastCity") || "";
let useFahrenheit = localStorage.getItem("useFahrenheit") === "true";
let lastWeatherData = null;
let lastForecastList = null;

// Core functions
function showPage(page) {
  allPages.forEach(p => p.classList.add("inactive"));
  page.classList.remove("inactive");
}

function getIcon(weatherMain, iconCode) {
  const isNight = iconCode && iconCode.endsWith('n');
  if (isNight && NIGHT_ICONS[weatherMain]) {
    return NIGHT_ICONS[weatherMain];
  }
  return ICONS[weatherMain] || "clear.png";
}

// Recent Cities Storage
function getRecentCities() {
  try {
    return JSON.parse(localStorage.getItem("recentCities") || "[]");
  } catch {
    return [];
  }
}

function saveCity(cityName) {
  currentCity = cityName;
  localStorage.setItem("lastCity", cityName);
  
  let list = getRecentCities().filter(c => c.toLowerCase() !== cityName.toLowerCase());
  list.unshift(cityName);
  if (list.length > 6) list = list.slice(0, 6);
  localStorage.setItem("recentCities", JSON.stringify(list));
  
  renderRecentList();
  updateDashLocation();
}

function renderRecentList() {
  ui.recentList.innerHTML = "";
  getRecentCities().forEach(city => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "recentChip";
    btn.textContent = city;
    btn.onclick = () => {
      ui.search.value = city;
      searchWeather();
      showPage(pages.weather);
    };
    li.appendChild(btn);
    ui.recentList.appendChild(li);
  });
}

// Data formatters
function getSeasonLabel() {
  const month = new Date().getMonth() + 1; // 1 to 12
  if ([12, 1, 2].includes(month)) return "Winter ❄️";
  if (month >= 3 && month <= 5) return "Spring 🌸";
  if (month >= 6 && month <= 8) return "Summer ☀️";
  if (month >= 9 && month <= 11) return "Autumn 🍂";
  return "Unknown";
}

function updateClock() {
  const now = new Date();
  ui.clock.textContent = now.toLocaleTimeString();
  ui.date.textContent = now.toDateString();
  
  const season = getSeasonLabel();
  ui.seasonDash.textContent = season;
  ui.seasonWeather.textContent = season;
}

function updateDashLocation() {
  ui.dashLocation.textContent = currentCity || "Search a city to set";
}

function formatTemp(celsius) {
  return useFahrenheit 
    ? Math.round((celsius * 9) / 5 + 32) + "°F" 
    : Math.round(celsius) + "°C";
}

function formatWind(ms) {
  return useFahrenheit 
    ? Math.round(ms * 2.237) + " mph" 
    : Math.round(ms * 3.6) + " km/h";
}

function toggleUnits() {
  useFahrenheit = !useFahrenheit;
  localStorage.setItem("useFahrenheit", useFahrenheit);
  
  const label = useFahrenheit ? "Switch to °C" : "Switch to °F";
  ui.tempUnitBtn.textContent = label;
  ui.tempUnitBtnForecast.textContent = label;
  
  if (lastWeatherData) renderWeatherFromData(lastWeatherData);
  if (lastForecastList) showForecastList(lastForecastList);
}

// Theme logic
const THEMES = {
  clear: "theme-clear", clouds: "theme-clouds", rain: "theme-rain", 
  drizzle: "theme-drizzle", snow: "theme-snow", mist: "theme-mist", 
  fog: "theme-mist", haze: "theme-mist", thunderstorm: "theme-thunder"
};

function applyWeatherTheme(weatherMain, iconCode) {
  const main = (weatherMain || "").toLowerCase();
  let themeClass = THEMES[main] || "theme-default";
  
  if (iconCode && iconCode.endsWith('n')) {
    themeClass += "-night";
  }
  
  document.body.className = `app ${themeClass}`;
}

// API Calls
async function fetchApi(baseUrl, city) {
  const name = city.trim();
  if (!name) return null;
  const url = `${baseUrl}q=${encodeURIComponent(name)}&units=metric&appid=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok || data.cod === 404 || data.cod === 401) return null;
    return data;
  } catch {
    return null;
  }
}

async function searchWeather() {
  const data = await fetchApi(WEATHER_URL, ui.search.value);
  if (!data) return showPage(pages.error);
  
  saveCity(data.name);
  lastWeatherData = data;
  renderWeatherFromData(data);
  showPage(pages.weather); // Ensure we go to the weather page on a search
}

function renderWeatherFromData(data) {
  const w = data.weather[0];
  const m = data.main;
  const vis = data.visibility != null ? data.visibility / 1000 : null;

  ui.desc.textContent = w.description;
  ui.temp.textContent = formatTemp(m.temp);
  ui.city.textContent = data.name;
  ui.feels.textContent = formatTemp(m.feels_like);
  ui.humidity.textContent = m.humidity + "%";
  ui.wind.textContent = formatWind(data.wind.speed || 0);
  ui.pressure.textContent = (m.pressure || "—") + " hPa";
  ui.clouds.textContent = (data.clouds?.all ?? "—") + "%";
  ui.visibility.textContent = vis != null ? vis.toFixed(1) + " km" : "—";

  ui.icon.src = getIcon(w.main, w.icon);
  ui.icon.onerror = function() { this.src = "clear.png"; };
  
  applyWeatherTheme(w.main, w.icon);
}

// Forecast rendering
function buildHourlyRows(dayItems) {
  return dayItems.map(item => {
    const time = new Date(item.dt_txt.replace(" ", "T")).toLocaleTimeString([], { hour: "numeric", hour12: true });
    return `
      <div class="hourlyRow">
        <span class="hourlyTime">${time}</span>
        <span class="hourlyArrow">→</span>
        <span class="hourlyTemp">${formatTemp(item.main.temp)}</span>
        <img class="hourlyIcon" src="${getIcon(item.weather[0].main, item.weather[0].icon)}" alt="" onerror="${IMG_ERR}">
      </div>
    `;
  }).join("");
}

function showForecastList(list) {
  lastForecastList = list;
  const byDay = {};
  
  list.forEach(item => {
    const key = item.dt_txt.split(" ")[0];
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(item);
  });
  
  ui.forecastList.innerHTML = Object.keys(byDay).slice(0, 5).map(date => {
    const dayItems = byDay[date];
    const s = dayItems[0];
    const w = s.weather[0];
    const dayName = DAY_NAMES[new Date(s.dt_txt.replace(" ", "T")).getDay()];
    
    return `
      <div class="forecastCard">
        <div class="forecastRow">
          <span class="forecastDay">${dayName}</span>
          <img class="forecastIcon" src="${getIcon(w.main, w.icon)}" alt="${w.description}" onerror="${IMG_ERR}">
          <span class="forecastTemp">${formatTemp(s.main.temp)}</span>
          <span class="forecastDesc">${w.description}</span>
        </div>
        <div class="hourlyPanel">
          ${buildHourlyRows(dayItems)}
        </div>
      </div>
    `;
  }).join("");
}

async function openForecast() {
  if (!currentCity) {
    ui.forecastCity.textContent = "No city selected";
    ui.forecastList.innerHTML = "<p class='forecastMsg'>Search a city on Current Weather first.</p>";
    lastForecastList = null;
    return showPage(pages.forecast);
  }
  
  const data = await fetchApi(FORECAST_URL, currentCity);
  if (!data) return showPage(pages.error);
  
  saveCity(data.city.name);
  ui.forecastCity.textContent = currentCity;
  showForecastList(data.list);
  
  const firstW = data.list[0].weather[0].main;
  const firstIcon = data.list[0].weather[0].icon;
  applyWeatherTheme(
    lastWeatherData ? lastWeatherData.weather[0].main : firstW,
    lastWeatherData ? lastWeatherData.weather[0].icon : firstIcon
  );
  showPage(pages.forecast);
}

// Event Listeners setup
const setupNav = (id, page) => document.getElementById(id).addEventListener("click", () => showPage(page));

setupNav("navWeather", pages.weather);
setupNav("navAbout", pages.about);
setupNav("weatherBack", pages.menu);
setupNav("forecastBack", pages.menu);
setupNav("aboutBack", pages.menu);

document.querySelector(".start").addEventListener("click", () => showPage(pages.menu));
document.querySelector(".homeBtn").addEventListener("click", () => showPage(pages.menu));
document.getElementById("searchIcon").addEventListener("click", searchWeather);
document.getElementById("navForecast").addEventListener("click", openForecast);

ui.search.addEventListener("keypress", e => { if (e.key === "Enter") searchWeather(); });
ui.tempUnitBtn.addEventListener("click", toggleUnits);
ui.tempUnitBtnForecast.addEventListener("click", toggleUnits);

ui.forecastList.addEventListener("click", e => {
  const row = e.target.closest(".forecastRow");
  if (!row) return;
  const card = row.parentElement;
  const wasOpen = card.classList.contains("open");
  
  ui.forecastList.querySelectorAll(".forecastCard").forEach(c => c.classList.remove("open"));
  if (!wasOpen) card.classList.add("open");
});

// Initialization
if (currentCity) ui.search.value = currentCity;
useFahrenheit = !useFahrenheit; toggleUnits(); // Forces correct button labels on load
updateClock();
setInterval(updateClock, 1000);
renderRecentList();
updateDashLocation();
