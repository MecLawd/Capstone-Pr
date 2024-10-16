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
  weatherCards = document.querySelector("#weather-cards");

let currentCity = "";
let currentUnit = "c";
let hourlyorWeek = "week";


// Function for clock time 

function updateClock(){

  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const timestring = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}` + " "+ meridiem;
  document.getElementById("clock").textContent = timestring;
}

updateClock();
setInterval(updateClock, 1000);


// function to get date and time

function getDateTime() {
  let now = new Date(),
    hour = now.getHours(),
    minute = now.getMinutes();

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  let dayString = days[now.getDay()];
  const meridiem = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${dayString}, ${hour}:${minute}` + " " + meridiem;
}

//Set date and time
date.innerText = getDateTime();
setInterval(() => {
  date.innerText = getDateTime();
}, 1000);


// function to convert celcius to fahrenheit
function celciusToFahrenheit(temp) {
  return ((temp * 9) / 5 + 32).toFixed(1);
}

fahrenheitBtn.addEventListener("click", () => {
  changeUnit("f");
});
celciusBtn.addEventListener("click", () => {
  changeUnit("c");
});



// function to get weather data

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
      if (unit === "c") {
        temp.innerText = today.temp;
      } else {
        temp.innerText = celciusToFahrenheit(today.temp);
      }

      currentLocation.innerText = data.resolvedAddress;
      condition.innerText = today.conditions;
      rain.innerText = "Perc - " + today.precip + "%";

      windSpeed.innerText = today.windspeed;

      mainIcon.src = getIcon(today.icon);
      changeBackground(today.icon);
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
    .catch((_err) => {
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
            
            
            currentCity = data.resolvedAddress;
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
            alert(err);
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

//function to update Forecast

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


// function to change weather icons
function getIcon(condition) {
  
  if (condition === "partly-cloudy-day") {
    return "https://cdn4.iconfinder.com/data/icons/the-weather-is-nice-today/64/weather_2-512.png";
  } else if (condition === "partly-cloudy-night") {
    return "https://cdn4.iconfinder.com/data/icons/the-weather-is-nice-today/64/weather_5-512.png";
  } else if (condition === "cloudy") {
    return "https://cdn4.iconfinder.com/data/icons/the-weather-is-nice-today/64/weather_1-256.png";
  }else if (condition === "rain") {
    return "https://cdn4.iconfinder.com/data/icons/the-weather-is-nice-today/64/weather_16-256.png";
  } else if (condition === "clear-day") {
    return "https://cdn4.iconfinder.com/data/icons/the-weather-is-nice-today/64/weather_3-512.png";
  } else if (condition === "clear-night") {
    return "https://cdn4.iconfinder.com/data/icons/the-weather-is-nice-today/64/weather_4-512.png";
  } else {
    return "https://i.ibb.co/rb4rrJL/26.png";
  }
}

// function to change background img depending on weather conditions


function changeBackground(condition) {
  const body = document.querySelector("body");
  let bg = "";
  if (condition === "partly-cloudy-day") {
    bg = "https://images.pexels.com/photos/1054221/pexels-photo-1054221.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
  } else if (condition === "cloudy") {
    bg = "https://photo-cdn2.icons8.com/iZ77ePI1ir6OsyW386i0Gw9LVnZ8utAJW2PVgaePudA/rs:fit:1906:1072/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5l/eHRlcm5hbC9hMmE0/Mi82MWU1OGJmZmEw/NDY0ZjczOWM3ODUw/N2E4MTQzMjM0OC5q/cGc.jpg";
  } else if (condition === "partly-cloudy-night") {
    bg = "https://img.stablecog.com/insecure/1920w/aHR0cHM6Ly9iLnN0YWJsZWNvZy5jb20vZTQ4NmNhYWQtZTAzMC00YzQzLTk3MWEtZjY4YjY3N2U3ZDliLmpwZWc.webp";
  } else if (condition === "rain") {
    bg = "https://images.unsplash.com/photo-1511634829096-045a111727eb?q=80&w=1934&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  } else if (condition === "clear-day") {
    bg = "https://photo-cdn2.icons8.com/yOB2QtpOyWNDJVYUG8P8lSqkaQYXCkApf5ggj1KCxoU/rs:fit:1606:1072/czM6Ly9pY29uczgu/bW9vc2UtcHJvZC5l/eHRlcm5hbC9hMmE0/Mi83NmQzZTFmMThi/ODU0MTliYmI0YWEy/MGQyNTM2ZTIyZS5q/cGc.jpg";
  } else if (condition === "clear-night") {
    bg = "https://wallpapers.com/images/hd/night-sky-background-cpxe9t4nl6x8qwiv.jpg";
  } else {
    bg = "https://papers.co/wallpaper/papers.co-nl31-night-lake-blue-sunset-nature-soft-purple-25-wallpaper.jpg";
  }
  body.style.backgroundImage = `linear-gradient(rgba(103, 52, 185, 0.288), rgba(17, 12, 12, 0.5)), url(${bg})`;
}


//get hours from hh:mm:ss Sunrise/set

function getHour(time) {
  let hour = time.split(":")[0];
  let min = time.split(":")[1]
  if (hour > 12) {
    hour = hour - 12;
    return `${hour}:${min} PM`;
  } else {
    return `${hour}:${min} AM`;
  }
}

// convert time to 12 hour format

function covertTimeTo12HourFormat(time) {
  let hour = time.split(":")[0];
  let minute = time.split(":")[1];
  let ampm = hour >= 12 ? "pm" : "am";
  hour = hour % 12;
  hour = hour ? hour : 12;
  hour = hour < 10 ? "0" + hour : hour;
  minute = minute < 10 ? "0" + minute : minute;
  let strTime = hour + ":" + minute + " " + ampm;
  return strTime;
}

// function to get day name from date for 7 forcats units

function getDayName(date) {
  let day = new Date(date);
  let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
  ];
  return days[day.getDay()];
}



// Get humidity and its status

function updateHumidityStatus(humidity) {
  if (humidity <= 30) {
    humidityStatus.innerText = "Low";
  } else if (humidity <= 60) {
    humidityStatus.innerText = "Moderate";
  } else {
    humidityStatus.innerText = "High";
  }
}


// function to get visibility status

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
  } else if (visibility <= 10.8) {
    visibilityStatus.innerText = "Clear Air";
  } else {
    visibilityStatus.innerText = "Very Clear Air";
  }
}

// function to get air quality status

function updateAirQualityStatus(airquality) {
  if (airquality <= 50) {
    airQualityStatus.innerText = "Good";
  } else if (airquality <= 100) {
    airQualityStatus.innerText = "Moderate";
  } else if (airquality <= 150) {
    airQualityStatus.innerText = "Unhealthy for Sensitive Groups";
  } else if (airquality <= 200) {
    airQualityStatus.innerText = "Unhealthy";
  } else if (airquality <= 250) {
    airQualityStatus.innerText = "Very Unhealthy";
  } else {
    airQualityStatus.innerText = "Hazardous";
  }
}

// function to handle search form

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let location = search.value;
  if (location) {
    currentCity = location;
    getWeatherData(location, currentUnit, hourlyorWeek);
  }
});


// function to change units

function changeUnit(unit) {
  if (currentUnit !== unit) {
    currentUnit = unit;
    tempUnit.forEach((elem) => {
      elem.innerText = `°${unit.toUpperCase()}`;
    });
    if (unit === "c") {
      celciusBtn.classList.add("active");
      fahrenheitBtn.classList.remove("active");
    } else {
      celciusBtn.classList.remove("active");
      fahrenheitBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}
hourlyBtn.addEventListener("click", () => {
  changeTimeSpan("hourly");
});
weekBtn.addEventListener("click", () => {
  changeTimeSpan("week");
});

// icon

function changeTimeSpan(unit) {
  if (hourlyorWeek !== unit) {
    hourlyorWeek = unit;
    if (unit === "hourly") {
      hourlyBtn.classList.add("active");
      weekBtn.classList.remove("active");
    } else {
      hourlyBtn.classList.remove("active");
      weekBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}
