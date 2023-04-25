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

// chybějící kód


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
