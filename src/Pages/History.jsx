import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Brush,
} from "recharts";

function HistoryPage2() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [isCelsius, setIsCelsius] = useState(true);

  // Zoom indices
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);

  const timeToMinutes = (time) => {
    if (!time) return null;
    const [h, m] = time.split(":");
    return parseInt(h) * 60 + parseInt(m);
  };

  const minutesToTime = (minutes) => {
    if (minutes === null) return "-";
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const fetchHistory = async () => {
    if (!startDate || !endDate) return alert("Select date range");
    const diff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    if (diff > 730) return alert("Max 2 years allowed");

    try {
      const weatherRes = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=28.6&longitude=77.2&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,windspeed_10m_max,winddirection_10m_dominant,sunrise,sunset&timezone=Asia/Kolkata`
      );
      const weatherData = await weatherRes.json();
      const daily = weatherData.daily;

      const airRes = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=28.6&longitude=77.2&start_date=${startDate}&end_date=${endDate}&hourly=pm10,pm2_5`
      );
      const airData = await airRes.json();

      const dailyAvg = {};
      if (airData.hourly?.time) {
        airData.hourly.time.forEach((t, i) => {
          const date = t.split("T")[0];
          if (!dailyAvg[date]) dailyAvg[date] = { pm10: [], pm25: [] };
          if (airData.hourly.pm10[i] !== null) dailyAvg[date].pm10.push(airData.hourly.pm10[i]);
          if (airData.hourly.pm2_5[i] !== null) dailyAvg[date].pm25.push(airData.hourly.pm2_5[i]);
        });
      }

      const getAvg = (arr) => (arr?.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

      const formatted = daily.time.map((date, i) => {
        const sunriseTime = daily.sunrise[i]?.split("T")[1];
        const sunsetTime = daily.sunset[i]?.split("T")[1];
        const avgData = dailyAvg[date] || {};

        const tempCMax = daily.temperature_2m_max[i];
        const tempCMin = daily.temperature_2m_min[i];
        const tempCMean = daily.temperature_2m_mean[i];

        return {
          date,
          tempCMax,
          tempCMin,
          tempCMean,
          tempFMax: tempCMax * 9 / 5 + 32,
          tempFMin: tempCMin * 9 / 5 + 32,
          tempFMean: tempCMean * 9 / 5 + 32,
          precipitation: daily.precipitation_sum[i],
          wind: daily.windspeed_10m_max[i],
          windDir: daily.winddirection_10m_dominant[i],
          sunrise: timeToMinutes(sunriseTime),
          sunset: timeToMinutes(sunsetTime),
          pm10: getAvg(avgData.pm10),
          pm25: getAvg(avgData.pm25),
        };
      });

      setData(formatted);
      setShow(true);
      setStartIndex(0);
      setEndIndex(formatted.length - 1);
    } catch (err) {
      console.error(err);
      alert("Error fetching data");
    }
  };

  const toggleTemp = () => setIsCelsius(!isCelsius);

  const zoomIn = () => {
    const range = endIndex - startIndex;
    if (range > 1) {
      setStartIndex(startIndex + Math.floor(range * 0.1));
      setEndIndex(endIndex - Math.floor(range * 0.1));
    }
  };

  const zoomOut = () => {
    setStartIndex(Math.max(0, startIndex - Math.floor((endIndex - startIndex) * 0.1)));
    setEndIndex(Math.min(data.length - 1, endIndex + Math.floor((endIndex - startIndex) * 0.1)));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans text-gray-800">
      <h2 className="text-3xl font-bold text-center mb-6">History</h2>

      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
        />
        <button
          onClick={fetchHistory}
          className="bg-blue-500 text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-600 transition"
        >
          See History
        </button>
        <button
          onClick={toggleTemp}
          className="bg-green-500 text-white px-5 py-2 rounded-md font-semibold hover:bg-green-600 transition"
        >
          Toggle °C / °F
        </button>
      </div>

      {show && data.length > 0 && (
        <>
          <div className="flex justify-center gap-3 mb-6">
            <button onClick={zoomIn} className="bg-yellow-400 text-gray-800 px-4 py-2 rounded-md hover:bg-yellow-500 transition">
              Zoom In
            </button>
            <button onClick={zoomOut} className="bg-yellow-400 text-gray-800 px-4 py-2 rounded-md hover:bg-yellow-500 transition">
              Zoom Out
            </button>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[700px] space-y-10">

              {/* Temperature */}
              <div className="bg-white rounded-xl p-5 shadow">
                <h3 className="text-xl font-semibold mb-4">Temperature (Max, Min, Mean)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.slice(startIndex, endIndex + 1)}>
                    <XAxis dataKey="date" interval={Math.ceil((endIndex - startIndex + 1)/10)} />
                    <YAxis />
                    <Tooltip />
                    <Line dataKey={isCelsius ? "tempCMax" : "tempFMax"} stroke="#ef4444" />
                    <Line dataKey={isCelsius ? "tempCMin" : "tempFMin"} stroke="#3b82f6" />
                    <Line dataKey={isCelsius ? "tempCMean" : "tempFMean"} stroke="#10b981" />
                    <Brush dataKey="date" height={30} stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Sunrise & Sunset */}
              <div className="bg-white rounded-xl p-5 shadow">
                <h3 className="text-xl font-semibold mb-4">Sunrise & Sunset</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.slice(startIndex, endIndex + 1)}>
                    <XAxis dataKey="date" interval={Math.ceil((endIndex - startIndex + 1)/10)} />
                    <YAxis domain={[0, 1440]} />
                    <Tooltip formatter={(val) => minutesToTime(val)} />
                    <Line dataKey="sunrise" stroke="#facc15" />
                    <Line dataKey="sunset" stroke="#8b5cf6" />
                    <Brush dataKey="date" height={30} stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Precipitation */}
              <div className="bg-white rounded-xl p-5 shadow">
                <h3 className="text-xl font-semibold mb-4">Precipitation</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.slice(startIndex, endIndex + 1)}>
                    <XAxis dataKey="date" interval={Math.ceil((endIndex - startIndex + 1)/10)} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="precipitation" fill="#3b82f6" />
                    <Brush dataKey="date" height={30} stroke="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Wind */}
              <div className="bg-white rounded-xl p-5 shadow">
                <h3 className="text-xl font-semibold mb-4">Wind (Speed & Direction)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.slice(startIndex, endIndex + 1)}>
                    <XAxis dataKey="date" interval={Math.ceil((endIndex - startIndex + 1)/10)} />
                    <YAxis />
                    <Tooltip formatter={(val, name) => name === "windDir" ? `${val}°` : `${val} m/s`} />
                    <Line dataKey="wind" stroke="#06b6d4" />
                    <Line dataKey="windDir" stroke="#a855f7" />
                    <Brush dataKey="date" height={30} stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Air Quality */}
              <div className="bg-white rounded-xl p-5 shadow">
                <h3 className="text-xl font-semibold mb-4">Air Quality (PM10 & PM2.5)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.slice(startIndex, endIndex + 1)}>
                    <XAxis dataKey="date" interval={Math.ceil((endIndex - startIndex + 1)/10)} />
                    <YAxis />
                    <Tooltip />
                    <Line dataKey="pm10" stroke="#6366f1" connectNulls />
                    <Line dataKey="pm25" stroke="#16a34a" connectNulls />
                    <Brush dataKey="date" height={30} stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default HistoryPage2;