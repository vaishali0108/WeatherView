import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [daily, setDaily] = useState(null);
  const [air, setAir] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [isCelsius, setIsCelsius] = useState(true);

  // Get Location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      (err) => console.log(err)
    );
  }, []);

  // Fetch Weather & Air Quality
  useEffect(() => {
    if (!location) return;

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation,visibility,windspeed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max`
    )
      .then((res) => res.json())
      .then((data) => {
        setWeather(data.current_weather);
        setDaily(data.daily);

        const hourly = data.hourly;
        const formatted = hourly.time.slice(0, 24).map((t, i) => ({
          hour: i,
          temperature: hourly.temperature_2m[i],
          humidity: hourly.relative_humidity_2m[i],
          precipitation: hourly.precipitation[i],
          visibility: hourly.visibility[i],
          wind: hourly.windspeed_10m[i],
          uv: hourly.uv_index[i],
        }));
        setChartData(formatted);
      });

    fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.lat}&longitude=${location.lon}&hourly=pm10,pm2_5,carbon_monoxide,carbon_dioxide,nitrogen_dioxide,sulphur_dioxide`
    )
      .then((res) => res.json())
      .then((data) => {
        setAir(data.hourly);
        setChartData((prev) =>
          prev.map((item, i) => ({
            ...item,
            pm10: data.hourly.pm10[i],
            pm25: data.hourly.pm2_5[i],
          }))
        );
      });
  }, [location]);

  const convertTemp = (t) => (isCelsius ? t : (t * 9) / 5 + 32);

  const Chart = (title, key) => (
    <div className="bg-white p-6 rounded-xl shadow-lg mt-6 w-full max-w-3xl mx-auto">
      <h2 className="font-bold text-xl mb-4 text-gray-700">{title}</h2>
      <div className="overflow-x-auto">
        <div className="w-[800px]">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
              <YAxis />
              <Tooltip />
              <Line
                dataKey={key}
                dot={false}
                stroke="#3b82f6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const AirChart = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg mt-6 w-full max-w-3xl mx-auto">
      <h2 className="font-bold text-xl mb-4 text-gray-700">
        Air Quality (PM10 & PM2.5)
      </h2>
      <div className="overflow-x-auto">
        <div className="w-[800px]">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line dataKey="pm10" stroke="#f97316" />
              <Line dataKey="pm25" stroke="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const aqi = air?.pm2_5?.[0];

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen p-6 flex flex-col items-center">
     
    <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mb-4 drop-shadow-lg">
  Today's Weather
</h1>

      <button
        className="bg-blue-500 text-white px-5 py-2 rounded-full hover:bg-blue-600 transition"
        onClick={() => setIsCelsius(!isCelsius)}
      >
        Toggle °C / °F
      </button>

      {location ? (
        <p className="mt-2 text-gray-500">
          📍 Lat: {location.lat.toFixed(2)} | Lon: {location.lon.toFixed(2)}
        </p>
      ) : (
        <p className="mt-2 text-gray-500">Getting location...</p>
      )}

      {weather && daily && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 w-full max-w-4xl">
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
            🌡️<span className="font-semibold mt-1">{convertTemp(weather.temperature).toFixed(1)}</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
            📉<span className="font-semibold mt-1">{convertTemp(daily.temperature_2m_min[0]).toFixed(1)}</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
            📈<span className="font-semibold mt-1">{convertTemp(daily.temperature_2m_max[0]).toFixed(1)}</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
            💨<span className="font-semibold mt-1">{weather.windspeed}</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
            💧<span className="font-semibold mt-1">{chartData[0]?.humidity ?? "-"}</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
            🌧️<span className="font-semibold mt-1">{chartData[0]?.precipitation ?? "-"}</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
            ☀️<span className="font-semibold mt-1">{daily.uv_index_max[0]}</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
            🌅<span className="font-semibold mt-1">{daily.sunrise[0]?.slice(11, 16)}</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
            🌇<span className="font-semibold mt-1">{daily.sunset[0]?.slice(11, 16)}</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
            🌧️<span className="font-semibold mt-1">{daily.precipitation_probability_max[0]}%</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
            AQI<span className="font-semibold mt-1">{aqi ?? "-"}</span>
          </div>
        </div>
      )}

      {air && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 w-full max-w-4xl">
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">PM10<span className="font-semibold mt-1">{air.pm10[0]}</span></div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">PM2.5<span className="font-semibold mt-1">{air.pm2_5[0]}</span></div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">CO<span className="font-semibold mt-1">{air.carbon_monoxide[0]}</span></div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">CO2<span className="font-semibold mt-1">{air.carbon_dioxide[0]}</span></div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">NO2<span className="font-semibold mt-1">{air.nitrogen_dioxide[0]}</span></div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">SO2<span className="font-semibold mt-1">{air.sulphur_dioxide[0]}</span></div>
        </div>
      )}

      {chartData.length > 0 && (
        <>
          {Chart("Temperature", "temperature")}
          {Chart("Humidity", "humidity")}
          {Chart("Precipitation", "precipitation")}
          {Chart("Visibility", "visibility")}
          {Chart("Wind Speed", "wind")}
          {Chart("UV Index", "uv")}
          <AirChart />
        </>
      )}
    </div>
  );
}

export default App;