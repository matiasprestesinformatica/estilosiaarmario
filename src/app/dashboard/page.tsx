
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Thermometer, Package, Users, CalendarCheck } from 'lucide-react';
import { getWardrobeStatistics, type WardrobeStats } from '@/app/actions/dashboardActions';
import Image from 'next/image';
import { AlertCircle } from 'lucide-react';

// Weather API details
const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const MONTEVIDEO_LAT = -34.90328;
const MONTEVIDEO_LON = -56.18816;

interface WeatherInfo {
  temp: number;
  description: string;
  iconUrl: string;
  city?: string;
}

interface ForecastInfo extends WeatherInfo {
  date: string;
  minTemp: number;
  maxTemp: number;
}

async function getWeatherData(): Promise<{ current: WeatherInfo | null; forecast: ForecastInfo | null; error?: string }> {
  if (!OPENWEATHERMAP_API_KEY) {
    const errorMessage = "OpenWeatherMap API key is missing. Weather widget will not work.";
    console.warn(errorMessage);
    return { current: null, forecast: null, error: errorMessage };
  }

  try {
    // Fetch current weather
    const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${MONTEVIDEO_LAT}&lon=${MONTEVIDEO_LON}&appid=${OPENWEATHERMAP_API_KEY}&units=metric&lang=es`);
    if (!currentRes.ok) {
        const errorData = await currentRes.json().catch(() => ({ message: currentRes.statusText }));
        throw new Error(`Failed to fetch current weather: ${currentRes.status} ${errorData.message || currentRes.statusText}`);
    }
    const currentData = await currentRes.json();

    // Fetch 5-day forecast
    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${MONTEVIDEO_LAT}&lon=${MONTEVIDEO_LON}&appid=${OPENWEATHERMAP_API_KEY}&units=metric&lang=es`);
     if (!forecastRes.ok) {
        const errorData = await forecastRes.json().catch(() => ({ message: forecastRes.statusText }));
        throw new Error(`Failed to fetch forecast: ${forecastRes.status} ${errorData.message || forecastRes.statusText}`);
    }
    const forecastData = await forecastRes.json();

    const current: WeatherInfo = {
      temp: Math.round(currentData.main.temp),
      description: currentData.weather[0].description,
      iconUrl: `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`,
      city: currentData.name,
    };

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDateString = tomorrow.toISOString().split('T')[0];

    let tomorrowMinTemp = Infinity;
    let tomorrowMaxTemp = -Infinity;
    let tomorrowDescription = "No disponible";
    let tomorrowIcon = "https://openweathermap.org/img/wn/01d@2x.png";
    let representativeEntryFound = false;

    const tomorrowEntries = forecastData.list.filter((item: any) => item.dt_txt.startsWith(tomorrowDateString));

    if (tomorrowEntries.length > 0) {
        for (const item of tomorrowEntries) {
            tomorrowMinTemp = Math.min(tomorrowMinTemp, item.main.temp_min);
            tomorrowMaxTemp = Math.max(tomorrowMaxTemp, item.main.temp_max);
            if (item.dt_txt.includes("12:00:00") || item.dt_txt.includes("15:00:00")) {
                 tomorrowDescription = item.weather[0].description;
                 tomorrowIcon = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
                 representativeEntryFound = true;
            }
        }
        if (!representativeEntryFound) { // Fallback if no midday entry
            tomorrowDescription = tomorrowEntries[0].weather[0].description;
            tomorrowIcon = `https://openweathermap.org/img/wn/${tomorrowEntries[0].weather[0].icon}@2x.png`;
        }
    }

    const forecast: ForecastInfo | null = tomorrowEntries.length > 0 ? {
      date: "Mañana",
      minTemp: Math.round(tomorrowMinTemp),
      maxTemp: Math.round(tomorrowMaxTemp),
      description: tomorrowDescription,
      iconUrl: tomorrowIcon,
      temp: 0, // Not used directly for forecast card like current
    } : null;

    return { current, forecast };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error fetching weather data.";
    console.error("Error fetching weather data:", errorMessage);
    return { current: null, forecast: null, error: errorMessage };
  }
}


export default async function DashboardPage() {
  let wardrobeStats: WardrobeStats | null = null;
  let wardrobeStatsError: string | null = null;
  try {
    wardrobeStats = await getWardrobeStatistics();
  } catch (err) {
    wardrobeStatsError = err instanceof Error ? err.message : "No se pudieron cargar las estadísticas.";
    console.error("Failed to get wardrobe stats:", wardrobeStatsError);
  }

  const { current: weatherCurrent, forecast: weatherForecast, error: weatherError } = await getWeatherData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 md:px-8 py-8">
        <h1 className="text-3xl font-headline mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center font-headline">
                <Thermometer className="mr-2 h-5 w-5 text-primary" />
                Clima en {weatherCurrent?.city || "Montevideo"}
              </CardTitle>
              <CardDescription>Temperatura actual y pronóstico para mañana.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {weatherError && !weatherCurrent && !weatherForecast && (
                <div className="flex items-center text-destructive">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  <p>Error al cargar datos del clima: {weatherError.includes("API key") ? "Verifica la API key." : "Intenta más tarde."}</p>
                </div>
              )}
              {weatherCurrent ? (
                <div>
                  <h3 className="text-md font-semibold">Ahora</h3>
                  <div className="flex items-center mt-1">
                    <Image src={weatherCurrent.iconUrl} alt={weatherCurrent.description} width={50} height={50} className="bg-primary/10 rounded-full" data-ai-hint="weather icon" />
                    <p className="text-3xl font-bold ml-3">{weatherCurrent.temp}°C</p>
                  </div>
                  <p className="text-sm text-muted-foreground capitalize ml-1">{weatherCurrent.description}</p>
                </div>
              ) : !weatherError && (
                <p className="text-sm text-muted-foreground">Clima actual no disponible.</p>
              )}
              {weatherForecast ? (
                <div className="pt-3 mt-3 border-t">
                  <h3 className="text-md font-semibold">{weatherForecast.date}</h3>
                   <div className="flex items-center mt-1">
                    <Image src={weatherForecast.iconUrl} alt={weatherForecast.description} width={40} height={40} className="bg-primary/10 rounded-full" data-ai-hint="weather icon" />
                    <p className="text-lg font-bold ml-3">{weatherForecast.minTemp}°C / {weatherForecast.maxTemp}°C</p>
                  </div>
                  <p className="text-sm text-muted-foreground capitalize ml-1">{weatherForecast.description}</p>
                </div>
              ) : !weatherError && (
                 <div className="pt-3 mt-3 border-t">
                    <p className="text-sm text-muted-foreground">Pronóstico para mañana no disponible.</p>
                 </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center font-headline">
                <Package className="mr-2 h-5 w-5 text-primary" />
                Estadísticas del Armario
              </CardTitle>
              <CardDescription>Un resumen de tu colección y planificación.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {wardrobeStatsError && (
                 <div className="sm:col-span-3 flex items-center text-destructive">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  <p>Error al cargar estadísticas: {wardrobeStatsError}</p>
                </div>
              )}
              {wardrobeStats ? (
                <>
                  <div className="p-4 bg-secondary/30 rounded-lg text-center shadow">
                    <Package className="h-7 w-7 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{wardrobeStats.totalClothingItems}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Prendas</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg text-center shadow">
                    <Users className="h-7 w-7 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{wardrobeStats.totalOutfits}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Atuendos</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg text-center shadow">
                    <CalendarCheck className="h-7 w-7 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{wardrobeStats.totalPlannedDays}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Días Planificados</p>
                  </div>
                </>
              ) : !wardrobeStatsError && (
                <p className="sm:col-span-3 text-sm text-muted-foreground">Cargando estadísticas...</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

    