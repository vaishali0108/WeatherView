# WeatherView

Responsive ReactJS Weather Dashboard integrating Open-Meteo API for real-time and historical weather insights.

## Project Overview
WeatherView is a responsive web application that detects the user's location via browser GPS and displays current weather and historical trends. Users can visualize hourly and long-term weather data using interactive charts.

## Features

### Page 1: Current Weather & Hourly Forecast
- Temperature: Minimum, Maximum, Current (Toggle between °C and °F)
- Atmospheric Conditions: Precipitation, Relative Humidity, UV Index
- Sun Cycle: Sunrise and Sunset times
- Wind & Air: Maximum Wind Speed, Precipitation Probability Max
- Air Quality Metrics: AQI, PM10, PM2.5, CO, CO2, NO2, SO2
- Hourly Charts: Temperature, Relative Humidity, Precipitation, Visibility, Wind Speed (10m), PM10 & PM2.5 combined

### Page 2: Historical Date Range (Max 2 Years)
- Temperature: Mean, Max, Min
- Sun Cycle: Sunrise and Sunset (IST)
- Precipitation: Total values for selected range
- Wind: Max Wind Speed, Dominant Wind Direction
- Air Quality: PM10 & PM2.5 trends
- Interactive Charts: Horizontal scrolling, zoom, mobile-friendly

## Tech Stack
- **Framework:** ReactJS
- **Charts & Visualizations:** Recharts
- **API:** [Open-Meteo API](https://open-meteo.com)
- **Styling:** CSS / Tailwind (optional)

## Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/<username>/WeatherView.git
cd WeatherView
npm install
npm run dev
