
'use client';

import { useEffect, useState } from 'react';
import { MapPin, Wifi } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface LocationInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
}

export function UserLocation() {
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch('https://ipinfo.io/json?token=cbaae632b6ec9f');
        if (!response.ok) {
          throw new Error('Failed to fetch location data.');
        }
        const data = await response.json();
        setLocationInfo({
          ip: data.ip,
          city: data.city,
          region: data.region,
          country: data.country,
        });
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching location:", err);
      }
    };

    fetchLocation();
  }, []);

  if (!locationInfo && !error) {
      return (
         <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
            </div>
         </div>
      )
  }

  if (error) {
    return null; // Don't show anything if there's an error
  }
  
  return (
    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mt-4 md:mt-0">
        {locationInfo && (
            <>
                <div className="flex items-center gap-2" title="IP Address">
                    <Wifi className="h-4 w-4" />
                    <span>{locationInfo.ip}</span>
                </div>
                <div className="flex items-center gap-2" title="Location">
                    <MapPin className="h-4 w-4" />
                    <span>{locationInfo.city}, {locationInfo.region}, {locationInfo.country}</span>
                </div>
            </>
        )}
    </div>
  );
}
