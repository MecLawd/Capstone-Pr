const temp = document.getElementById("temp"),
  date = document.getElementById("date-time"),
  condition = document.getElementById("condition"),
  rain = document.getElementById("rain"),
  mainIcon = document.getElementById("icon"),
  currentLocation = document.getElementById("location"),
  windSpeed = document.querySelector(".wind-speed"),
  sunRise = document.querySelector(".sun-rise"),
  sunSet = document.querySelector(".sun-set"),
  humidity = document.querySelector(".humidity"),
  visibilty = document.querySelector(".visibilty"),
  humidityStatus = document.querySelector(".humidity-status"),
  airQuality = document.querySelector(".air-quality"),
  airQualityStatus = document.querySelector(".air-quality-status"),
  visibilityStatus = document.querySelector(".visibilty-status"),
  searchForm = document.querySelector("#search"),
  search = document.querySelector("#query"),
  celciusBtn = document.querySelector(".celcius"),
  fahrenheitBtn = document.querySelector(".fahrenheit"),
  tempUnit = document.querySelectorAll(".temp-unit"),
  hourlyBtn = document.querySelector(".hourly"),
  weekBtn = document.querySelector(".week"),
  weatherCards = document.querySelector("#weather-cards"),
  body = document.querySelector("body");

let currentCity = "";
let currentUnit = "c";
let hourlyorWeek = "week";

// Function for clock time
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const timestring = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}` + " " + meridiem;
  document.getElementById("clock").textContent = timestring;
}

updateClock();
setInterval(updateClock, 1000);

// Function to get date and time
function getDateTime() {
  let now = new Date(),
    hour = now.getHours(),
    minute = now.getMinutes();

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // 12 hours format
  let dayString = days[now.getDay()];
  const meridiem = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${dayString}, ${hour}:${minute}` + " " + meridiem;
}



// Set date and time
date.innerText = getDateTime();
setInterval(() => {
  date.innerText = getDateTime();
}, 1000);



// Function to convert Celsius to Fahrenheit
function celciusToFahrenheit(temp) {
  return ((temp * 9) / 5 + 32).toFixed(1);
}

fahrenheitBtn.addEventListener("click", () => {
  changeUnit("f");
});
celciusBtn.addEventListener("click", () => {
  changeUnit("c");
});



// Function to get weather data
function getWeatherData(city, unit, hourlyorWeek) {
  const apiKey = "9XGBWPMN23H5BVD8F2K8HZCK2";
  fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=${apiKey}&contentType=json`,
    {
      method: "GET",
      headers: {},
    }
  )
    .then((response) => response.json())
    .then((data) => {
      let today = data.currentConditions;

      currentLocation.innerText = data.resolvedAddress;

      if (unit === "c") {
        temp.innerText = today.temp;
      } else {
        temp.innerText = celciusToFahrenheit(today.temp);
      }

      mainIcon.src = getIcon(today.icon);
      changeBackground(today.icon);

      condition.innerText = today.conditions;
      rain.innerText = "Perc - " + today.precip + "%";

      windSpeed.innerText = today.windspeed;
      humidity.innerText = today.humidity + "%";
      updateHumidityStatus(today.humidity);
      visibilty.innerText = today.visibility;
      updateVisibiltyStatus(today.visibility);
      airQuality.innerText = today.winddir;
      updateAirQualityStatus(today.winddir);

      if (hourlyorWeek === "hourly") {
        updateForecast(data.days[0].hours, unit, "day");
      } else {
        updateForecast(data.days, unit, "week");
      }

      sunRise.innerText = covertTimeTo12HourFormat(today.sunrise);
      sunSet.innerText = covertTimeTo12HourFormat(today.sunset);
    })
    .catch((err) => {
      alert("City not found in our database");
    });
}



// Function to get weather data based on user's location
function getWeatherDataByLocation(unit, hourlyorWeek) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const apiKey = "9XGBWPMN23H5BVD8F2K8HZCK2";
        fetch(
          `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}?unitGroup=metric&key=${apiKey}&contentType=json`,
          {
            method: "GET",
            headers: {},
          }
        )
          .then((response) => response.json())
          .then((data) => {
            getCityNameFromCoordinates(lat, lon);

            let today = data.currentConditions;
            if (unit === "c") {
              temp.innerText = today.temp;
            } else {
              temp.innerText = celciusToFahrenheit(today.temp);
            }

            mainIcon.src = getIcon(today.icon);
            changeBackground(today.icon);

            condition.innerText = today.conditions;
            rain.innerText = "Perc - " + today.precip + "%";

            windSpeed.innerText = today.windspeed;
            humidity.innerText = today.humidity + "%";
            updateHumidityStatus(today.humidity);
            visibilty.innerText = today.visibility;
            updateVisibiltyStatus(today.visibility);
            airQuality.innerText = today.winddir;
            updateAirQualityStatus(today.winddir);

            if (hourlyorWeek === "hourly") {
              updateForecast(data.days[0].hours, unit, "day");
            } else {
              updateForecast(data.days, unit, "week");
            }

            sunRise.innerText = covertTimeTo12HourFormat(today.sunrise);
            sunSet.innerText = covertTimeTo12HourFormat(today.sunset);
          })
          .catch((err) => {
            alert("Unable to retrieve weather data for your location.");
          });
      },
      () => {
        alert("Unable to retrieve your location.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// Call this function when the page loads
getWeatherDataByLocation(currentUnit, hourlyorWeek);

// Get city name from coordinates using OpenCage API
function getCityNameFromCoordinates(lat, lon) {
  const apiKey = "0c1e47e2a7494268b2f4291b55dda719";
  fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Unable to get city name.");
      }
      return response.json();
    })
    .then((data) => {
      if (data.results.length > 0) {
        const city = data.results[0].components.region;
        currentLocation.innerText = city;
      }
    })
    .catch((error) => {
      alert(error.message);
    });
}

// function to update forecast
function updateForecast(data, unit, type) {
  weatherCards.innerHTML = "";
  let day = 0;
  let numCards = 0;
  if (type === "day") {
    numCards = 24;
  } else {
    numCards = 7;
  }
  for (let i = 0; i < numCards; i++) {
    let card = document.createElement("div");
    card.classList.add("card");
    let dayName = getHour(data[day].datetime);
    if (type === "week") {
      dayName = getDayName(data[day].datetime);
    }
    let dayTemp = data[day].temp;
    if (unit === "f") {
      dayTemp = celciusToFahrenheit(data[day].temp);
    }
    let iconCondition = data[day].icon;
    let iconSrc = getIcon(iconCondition);
    let tempUnit = "°C";
    if (unit === "f") {
      tempUnit = "°F";
    }
    card.innerHTML = `
      <h2 class="day-name">${dayName}</h2>
      <div class="card-icon">
        <img src="${iconSrc}" class="day-icon" alt="" />
      </div>
      <div class="day-temp">
        <h2 class="temp">${dayTemp}</h2>
        <span class="temp-unit">${tempUnit}</span>
      </div>
    `;
    weatherCards.appendChild(card);
    day++;
  }
}

// change weather icons and Background images based on icon property from API
function getIcon(condition) {
  if (condition === "partly-cloudy-day") {
    return "assets/cloudy.png";
  } else if (condition === "partly-cloudy-night") {
    return "assets/cloudy-night.png";
  } else if (condition === "rain") {
    return "assets/rain.png";
  } else if (condition === "clear-day") {
    return "assets/clear-day.png";
  } else if (condition === "clear-night") {
    return "assets/clear-night.png";
  } else if (condition === "snow") {
    return "assets/snow.png";
  } else if (condition === "wind") {
    return "assets/wind.png";
  } else {
    return "assets/cloudy.png";
  }
}

function changeBackground(condition) {
  const bg = document.querySelector(".weather-app");

  if (condition === "partly-cloudy-day") {
    bg.style.backgroundImage = "url('./assets/cloudy-bg.png')";
  } else if (condition === "partly-cloudy-night") {
    bg.style.backgroundImage = "url('./assets/cloudy-night-bg.png')";
  } else if (condition === "rain") {
    bg.style.backgroundImage = "url('./assets/rain-bg.png')";
  } else if (condition === "clear-day") {
    bg.style.backgroundImage = "url('./assets/clear-day-bg.png')";
  } else if (condition === "clear-night") {
    bg.style.backgroundImage = "url('./assets/clear-night-bg.png')";
  } else if (condition === "snow") {
    bg.style.backgroundImage = "url('./assets/snow-bg.png')";
  } else if (condition === "wind") {
    bg.style.backgroundImage = "url('./assets/wind-bg.png')";
  } else {
    bg.style.backgroundImage = "url('./assets/cloudy-bg.png')";
  }
}

// Function to convert time to 12-hour format
function covertTimeTo12HourFormat(time) {
  let hour = time.split(":")[0];
  let minute = time.split(":")[1];
  let meridiem = "AM";
  if (hour > 12) {
    meridiem = "PM";
    hour -= 12;
  }
  return `${hour}:${minute} ${meridiem}`;
}

// Function to get hours from forecast
function getHour(time) {
  let hour = time.split(":")[0];
  return `${hour}:00`;
}

// Function to get day name from forecast
function getDayName(date) {
  let day = new Date(date);
  let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[day.getDay()];
}

// Function to update Humidity status
function updateHumidityStatus(humidity) {
  if (humidity <= 30) {
    humidityStatus.innerText = "Low";
  } else if (humidity <= 60) {
    humidityStatus.innerText = "Moderate";
  } else {
    humidityStatus.innerText = "High";
  }
}

// Function to update visibility status
function updateVisibiltyStatus(visibility) {
  if (visibility <= 0.03) {
    visibilityStatus.innerText = "Dense Fog";
  } else if (visibility <= 0.16) {
    visibilityStatus.innerText = "Moderate Fog";
  } else if (visibility <= 0.35) {
    visibilityStatus.innerText = "Light Fog";
  } else if (visibility <= 1.13) {
    visibilityStatus.innerText = "Very Light Fog";
  } else if (visibility <= 2.16) {
    visibilityStatus.innerText = "Light Mist";
  } else if (visibility <= 5.4) {
    visibilityStatus.innerText = "Very Light Mist";
  } else {
    visibilityStatus.innerText = "Clear";
  }
}

// Function to update air quality status
function updateAirQualityStatus(airQuality) {
  if (airQuality <= 50) {
    airQualityStatus.innerText = "Good";
  } else if (airQuality <= 100) {
    airQualityStatus.innerText = "Moderate";
  } else if (airQuality <= 150) {
    airQualityStatus.innerText = "Unhealthy for Sensitive Groups";
  } else if (airQuality <= 200) {
    airQualityStatus.innerText = "Unhealthy";
  } else if (airQuality <= 250) {
    airQualityStatus.innerText = "Very Unhealthy";
  } else {
    airQualityStatus.innerText = "Hazardous";
  }
}

// Event listener to search weather for a specific city
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let location = search.value;
  if (location) {
    currentCity = location;
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
});

// Event listener to change weather data to weekly or hourly forecast
hourlyBtn.addEventListener("click", () => {
  changeTimeSpan("hourly");
});
weekBtn.addEventListener("click", () => {
  changeTimeSpan("week");
});

function changeTimeSpan(type) {
  if (type === "hourly") {
    hourlyorWeek = "hourly";
  } else {
    hourlyorWeek = "week";
  }
  if (currentCity) {
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  } else {
    getWeatherDataByLocation(currentUnit, hourlyorWeek);
  }
}

// Change unit function
function changeUnit(unit) {
  if (currentUnit !== unit) {
    currentUnit = unit;
    tempUnit.forEach((elem) => {
      elem.innerText = `°${unit.toUpperCase()}`;
    });
    if (currentCity) {
      getWeatherData(currentCity, currentUnit, hourlyorWeek);
    } else {
      getWeatherDataByLocation(currentUnit, hourlyorWeek);
    }
  }
}
