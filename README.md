# WeatherVerse ☁️

WeatherVerse is a responsive front-end weather dashboard that allows users to search for cities and view current weather conditions, detailed weather information, and a 5-day forecast.

The project was created as part of a front-end class evaluation using HTML, CSS, JavaScript, and the OpenWeatherMap API.

## Features

- Search weather by city name
- View current temperature and weather condition
- Display feels-like temperature
- Humidity information
- Wind speed
- Atmospheric pressure
- Cloud cover
- Visibility details
- 5-day weather forecast
- Expandable hourly forecast
- Celsius and Fahrenheit conversion
- Recent city search history
- Live clock and date
- Current season display
- Separate day and night weather icons
- Dynamic themes based on weather conditions
- Error page for invalid city searches
- Responsive design for mobile devices

## Technologies Used

- HTML5
- CSS3
- JavaScript
- OpenWeatherMap API
- Local Storage
- Google Fonts

## How It Works

The application sends a request to the OpenWeatherMap API using the city name entered by the user.

The returned weather data is then displayed on the current-weather page. The forecast section groups forecast records by date and displays up to five days of weather information.

Recent searches, the last selected city, and the selected temperature unit are saved using browser Local Storage.

## Weather Themes

WeatherVerse changes its appearance depending on the weather condition.

Supported themes include:

- Clear
- Clouds
- Rain
- Drizzle
- Snow
- Mist
- Haze
- Thunderstorm
- Day and night variations

## Project Structure

```text
WeatherVerse/
│
├── index.html
├── style.css
├── script.js
├── clear.png
├── clear_night.png
├── clouds.png
├── clouds_night.png
├── drizzle.png
├── haze.png
├── humidity.png
├── mist.png
├── mist_night.png
├── rain.png
├── rain_night.png
├── search.png
├── snow.png
├── snow_night.png
└── wind.png

## How to Run

1. Clone or download the repository.
2. Open the project folder in VS Code.
3. Open `index.html` in a browser.

You can also use the Live Server extension in VS Code.

## API Used

This project uses the OpenWeatherMap API for:

- Current weather data
- 5-day / 3-hour forecast data

## Author

**Raghav Bansal**

- GitHub: https://github.com/raghavbansal9518-cloud
- LinkedIn: https://www.linkedin.com/in/raghav-bansal-9a94593a7/