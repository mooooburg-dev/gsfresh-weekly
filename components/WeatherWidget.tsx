'use client';

import { useEffect, useState } from 'react';
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
  Loader2,
  MapPin,
} from 'lucide-react';

export default function WeatherWidget() {
  const [weather, setWeather] = useState<{
    temp: number;
    code: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Current Date Formatter
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일`;
  const dayStr = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];

  useEffect(() => {
    async function fetchWeather() {
      try {
        // Coordinates for Gochon-eup, Gimpo-si
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=37.6009&longitude=126.7731&current=temperature_2m,weather_code&timezone=Asia%2FTokyo'
        );
        const data = await res.json();

        if (data.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            code: data.current.weather_code,
          });
        }
      } catch (error) {
        console.error('Failed to fetch weather', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  const getWeatherIcon = (code: number) => {
    // WMO Weather interpretation codes
    if (code === 0 || code === 1)
      return <Sun size={18} className="text-orange-400" />;
    if (code === 2 || code === 3)
      return <Cloud size={18} className="text-gray-400" />;
    if (code >= 45 && code <= 48)
      return <CloudFog size={18} className="text-gray-400" />;
    if (code >= 51 && code <= 67)
      return <CloudRain size={18} className="text-blue-400" />;
    if (code >= 71 && code <= 77)
      return <CloudSnow size={18} className="text-sky-300" />;
    if (code >= 80 && code <= 82)
      return <CloudRain size={18} className="text-blue-500" />;
    if (code >= 95 && code <= 99)
      return <CloudLightning size={18} className="text-yellow-500" />;
    return <Sun size={18} className="text-orange-400" />;
  };

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400 font-medium mb-0.5">
        <MapPin size={10} className="text-gray-400" />
        김포시 고촌읍
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm font-bold text-gray-700">
          {dateStr} ({dayStr})
        </span>
        <div className="w-px h-2.5 bg-gray-300"></div>
        {loading ? (
          <Loader2 size={14} className="animate-spin text-gray-400" />
        ) : weather ? (
          <div className="flex items-center gap-1">
            {getWeatherIcon(weather.code)}
            <span className="text-xs sm:text-sm font-bold text-gray-800">
              {weather.temp}°
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">정보 없음</span>
        )}
      </div>
    </div>
  );
}
