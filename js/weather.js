/* https://mixedanalytics.com/blog/list-actually-free-open-no-auth-needed-apis/ */
/* https://github.com/toddmotto/public-apis */
const url =
  "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true&relativehumidity_2m=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,surface_pressure";

let marker = null;
let map = null;
let chartTP, chartP;

const weathercode = {
  0: {
    en: "Clear sky",
    cz: "Jasno",
    icon: "sun",
  },
  1: {
    en: "Mainly clear",
    cz: "Polojasno",
    icon: "sun",
  },
  2: {
    en: "Partly cloudy",
    cz: "Oblačno",
    icon: "cloudy",
  },
  3: {
    en: "Overcast",
    cz: "Zataženo",
    icon: "clouds",
  },
  45: {
    en: "Fog",
    cz: "Mlhavo",
    icon: "foggy",
  },
  48: {
    en: "Depositing rime fog",
    cz: "Mlhavý opar",
    icon: "foggy",
  },
  51: {
    en: "Light drizzle",
    cz: "Lehké mrholení",
    icon: "rain",
  },
  53: {
    en: "Moderate drizzle",
    cz: "Mírné mrholení",
    icon: "rain",
  },
  55: {
    en: "Dense drizzle",
    cz: "Husté mrholení",
    icon: "rain",
  },
  56: {
    en: "Light freezing drizzle",
    cz: "Lehké mrznoucí mrholení",
    icon: "rain",
  },
  57: {
    en: "Moderate freezing drizzle",
    cz: "Mírné mrznoucí mrholení",
    icon: "rain",
  },
  61: {
    en: "Slight rain",
    cz: "Lehký déšť",
    icon: "rain",
  },
  62: {
    en: "Moderate rain",
    cz: "Mírný déšť",
    icon: "rain",
  },
  63: {
    en: "Heavy rain",
    cz: "Intenzivní déšť",
    icon: "rain",
  },
  66: {
    en: "Light freezing rain",
    cz: "Lehký mrznoucí déšť",
    icon: "rain",
  },
  67: {
    en: "Heavy freezing rain",
    cz: "Intenzivní mrznoucí déšť",
    icon: "rain",
  },
  71: {
    en: "Slight snow fall",
    cz: "Lehké sněžení",
    icon: "snow",
  },
  73: {
    en: "Moderate snow fall",
    cz: "Mírné sněžení",
    icon: "snow",
  },
  75: {
    en: "Heavy snow fall",
    cz: "Intenzivní sněžení",
    icon: "snow",
  },
  77: {
    en: "Snow grains",
    cz: "Sněhové vločky",
    icon: "snow",
  },
  80: {
    en: "Slight rain showers",
    cz: "Mírné dešťové přeháňky",
    icon: "rain",
  },
  81: {
    en: "Moderate rain showers",
    cz: "Dešťové přeháňky",
    icon: "rain",
  },
  82: {
    en: "Violent rain showers",
    cz: "Intenzivní dešťové přeháňky",
    icon: "rain",
  },
  85: {
    en: "Slight snow showers",
    cz: "Mírné sněhové přeháňky",
    icon: "snow",
  },
  86: {
    en: "Heavy snow showers",
    cz: "Intenzivní sněhové přeháňky",
    icon: "snow",
  },
  95: {
    en: "Slight or moderate thunderstorm",
    cz: "Slabší bouřky",
    icon: "storm",
  },
  96: {
    en: "Thunderstorm with slight hail",
    cz: "Silnější bouřky",
    icon: "storm",
  },
  99: {
    en: "Thunderstorm with heavy hail",
    cz: "Silné bouřky s kroupami",
    icon: "hailstone",
  },
};

function getWindDirection(wdir) {
  if ((wdir >= 0 && wdir < 23) || wdir >= 337) return "severní";
  if (wdir >= 23 && wdir < 68) return "severovýchodní";
  if (wdir >= 68 && wdir < 113) return "východní";
  if (wdir >= 113 && wdir < 158) return "jihovýchodní";
  if (wdir >= 158 && wdir < 203) return "jižní";
  if (wdir >= 203 && wdir < 248) return "jihozápadní";
  if (wdir >= 248 && wdir < 293) return "západní";
  return "severozápadní";
}

function getDate(date) {
  date = date.split("-");
  d = new Date(date[0], date[1] - 1, date[2]);
  return d;
}

function getCzechDay(date) {
  const dny = [
    "neděle",
    "pondělí",
    "úterý",
    "středa",
    "čtvrtek",
    "pátek",
    "sobota",
  ];
  return dny[date.getDay()];
}

function setLocalities(data) {
  localities.innerHTML = "";
  data.forEach((locality) => {
    const option = document.createElement("option");
    option.value = locality.display_name;
    option.text = locality.display_name;
    localities.add(option);
  });
}

function currentDayBlock(data) {
  let currentTime = data.time.split("T");
  let currentDate = getDate(currentTime[0]);
  let output = `
    <div class="row">
        <div class="col-3">
            <img src="./img/icons/${weathercode[data.weathercode].icon}.gif" 
                 alt="${weathercode[data.weathercode].cz}" 
                 class="img-fluid">
        </div> 
        <div class="col-3">
            <h3>${getCzechDay(currentDate).toUpperCase()}</h3>
            <h3>${currentDate.toLocaleDateString()}</h3>
            <h3>${currentTime[1]}</h3>
        </div>
        <div class="col-6">
            <p>${weathercode[data.weathercode].cz}<p>
            <p>Teplota: ${data.temperature} °C, vlhkost: ${data.temperature}, 
               rychlost větru: ${data.windspeed} km/hod</p>
        </div>
    </div>`;
  return output;
}

function nextDaysBlock(data) {
  let days = "";
  data.time.forEach((day, idx) => {
    let date = getDate(day);
    days += `
        <div class="col-md-3 p-2 bg-light">
        <p class="bg-info text-uppercase p-2 text-light">
        ${getCzechDay(date)} ${date.toLocaleDateString()}
        </p>
        <p><img src="./img/icons/${weathercode[data.weathercode[idx]].icon}.gif" 
        alt="${weathercode[data.weathercode[idx]].cz}" class="img-fluid"></p> 
        <p class="text-info">${weathercode[data.weathercode[idx]].cz}</p>
        <p><i class="fa-solid fa-temperature-low"></i> ${data.temperature_2m_min[idx]} °C 
        - <i class="fa-solid fa-temperature-high"></i> ${data.temperature_2m_max[idx]} °C</p>
        <p><i class="fa-solid fa-wind"></i> ${getWindDirection(data.winddirection_10m_dominant[idx])} 
        vítr o rychlosti maximálně ${data.windspeed_10m_max[idx]} km/hod</p>
        <p><i class="fa-solid fa-sun-plant-wilt"></i> Slunce vychází 
        v ${data.sunrise[idx].split("T")[1]} hod. a zapadá v ${data.sunset[idx].split("T")[1]} hod.</p>
        </div>`;
  });
  return `<div class="row">${days}</div>`;
}

async function createForecast(latitude, longitude) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relativehumidity_2m,surface_pressure,snowfall,rain,showers,precipitation&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,windspeed_10m_max,winddirection_10m_dominant&current_weather=true&timezone=auto`
    );
    const data = await response.json();
    return data;
  } catch {
    console.error(error);
    throw new Error("Chyba při získávání dat");
  }
}

async function getGPS(locality) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${locality}&format=json`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Chyba při získávání dat");
  }
}

async function getLocality(latitude, longitude) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.display_name;
  } catch (error) {
    console.error(error);
    throw new Error("Chyba při získávání dat");
  }
}

function createMap(latitude, longitude) {
  // Vytvoření mapy
  map = L.map("mapid").setView([latitude, longitude], 13);
  // Přidání dlaždic
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
  }).addTo(map);
  // Přidání značky na mapu
  marker = L.marker([latitude, longitude]).addTo(map);
}

function chartTemPress(hours, temperatures, pressures) {
  const ctx = document.getElementById("tempress").getContext("2d");
  chartTP = new Chart(ctx, {
    type: "line",
    data: {
      labels: hours,
      datasets: [
        {
          label: "Teploty",
          data: temperatures,
          yAxisID: "temperatures",
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
        {
          label: "Tlak",
          data: pressures,
          yAxisID: "pressures",
          fill: false,
          borderColor: "rgb(192, 75, 75)",
          tension: 0.1,
        },
      ],
    },
    options: {
      scales: {
        temperatures: {
          position: "left",
          suggestedMin: 0,
          suggestedMax: 30,
          title: {
            display: true,
            text: "Teploty",
          },
        },
        pressures: {
          position: "right",
          /* suggestedMin: 950,*/
          suggestedMax: 1050,
          title: {
            display: true,
            text: "Tlak",
          },
        },
        x: {
          grid: {
            lineWidth: function (context) {
              return context.index % 24 === 0 ? 3 : 1;
            },
            color: function (context) {
              return context.index % 24 === 0
                ? "rgba(100, 0, 0, 0.5)"
                : "rgba(0, 0, 0, 0.5)";
            },
          },
        },
      },
    },
  });
}

function chartPrecipitation(hours, rain, snow) {
  const ctx = document.getElementById("precipitation").getContext("2d");
  chartP = new Chart(ctx, {
    type: "bar",
    data: {
      labels: hours,
      datasets: [
        {
          label: "Déšť",
          data: rain,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Sníh",
          data: snow,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          ticks: {
            beginAtZero: true,
          },
          title: {
            display: true,
            labelString: "Srážkový úhrn (mm)",
          },
        },
        x: {
          title: {
            display: true,
            labelString: "Hodina",
          },
          grid: {
            lineWidth: function (context) {
              return context.index % 24 === 0 ? 3 : 1;
            },
            color: function (context) {
              return context.index % 24 === 0
                ? "rgba(100, 0, 0, 0.5)"
                : "rgba(0, 0, 0, 0.5)";
            },
          },
        },
      },
    },
  });
}

submit.addEventListener("click", async function () {
  try {
    const places = await getGPS(locality.value);
    console.log(places);
    setLocalities(places);
    const position = [places[0].lat, places[0].lon];
    const forecast = await createForecast(...position);
    console.log(forecast);
    currentDay.innerHTML = currentDayBlock(forecast.current_weather);
    nextDays.innerHTML = nextDaysBlock(forecast.daily);
    if (marker) {
      marker.setLatLng(position);
      map.panTo(position);
    } else {
      createMap(...position);
    }
    if (chartTP) chartTP.destroy();
    if (chartP) chartP.destroy();
    chartTemPress(
      forecast.hourly.time,
      forecast.hourly.temperature_2m,
      forecast.hourly.surface_pressure
    );
    chartPrecipitation(
      forecast.hourly.time,
      forecast.hourly.rain,
      forecast.hourly.snowfall
    );
  } catch (error) {
    console.error(error);
  }
});

localities.addEventListener("change", (event) => {
  locality.value = event.target.value;
});

home.addEventListener("click", async (event) => {
  try {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }        
  } catch (error) {
    
  }  

  async function showPosition(position) {
    locality.value = await getLocality(position.coords.latitude, position.coords.longitude);
  }
});
