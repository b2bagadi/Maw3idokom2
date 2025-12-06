import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import React, { useEffect, useMemo } from 'react';


// Import Leaflet CSS - Critical for proper rendering
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom Icon for Selected Business
const selectedIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface Business {
    id: number;
    name: string;
    slug: string;
    latitude: number | null;
    longitude: number | null;
    logo: string | null;
    address: string | null;
    averageRating: number;
    reviewCount: number;
    businessType?: string;
}

interface BusinessMapProps {
    businesses: Business[];
    selectedBusinessSlug?: string;
    onBusinessSelect?: (slug: string) => void;
    userLocation?: { lat: number; lng: number } | null;
}

// Helper to calculate centroid
function getCentroid(businesses: Business[]): [number, number] | null {
    if (businesses.length === 0) return null;
    const total = businesses.reduce((acc, b) => ({
        lat: acc.lat + (b.latitude || 0),
        lng: acc.lng + (b.longitude || 0)
    }), { lat: 0, lng: 0 });
    return [total.lat / businesses.length, total.lng / businesses.length];
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        // Fix for rendering issues when container size changes
        map.invalidateSize();

        // Use flyTo for smooth animation
        map.flyTo(center, 14, {
            duration: 1.5,
            easeLinearity: 0.25
        });
    }, [center, map]);
    return null;
}

// Memoized Marker Component to prevent re-renders
const BusinessMarker = React.memo(({ business, isSelected, onClick }: { business: Business, isSelected: boolean, onClick: (slug: string) => void }) => {
    // Only render if coordinates exist (double check)
    if (!business.latitude || !business.longitude) return null;

    return (
        <Marker
            position={[business.latitude, business.longitude]}
            icon={isSelected ? selectedIcon : defaultIcon}
            eventHandlers={{
                click: () => onClick(business.slug),
                mouseover: (e) => e.target.openPopup(),
            }}
        >
            <Popup className="business-popup">
                <div className="w-64 p-1">
                    <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden border">
                            {business.logo ? (
                                <img src={business.logo} alt={business.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-100 text-xs font-bold text-gray-400">
                                    {business.name.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{business.name}</h3>
                            <p className="text-xs text-muted-foreground truncate">{business.businessType || 'Service'}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-medium">{business.averageRating?.toFixed(1) || 'New'}</span>
                                <span className="text-xs text-muted-foreground">({business.reviewCount || 0})</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                        <Button
                            size="sm"
                            variant="default"
                            className="w-full text-xs h-8"
                            onClick={() => {
                                const locale = window.location.pathname.split('/')[1] || 'en';
                                const token = localStorage.getItem('client_token');
                                const bookingPath = `/${locale}/book/${business.slug}`;
                                if (token) {
                                    window.location.href = bookingPath;
                                } else {
                                    window.location.href = `/${locale}/client/login?callbackUrl=${encodeURIComponent(bookingPath)}`;
                                }
                            }}
                        >
                            Book
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-8 h-8 p-0 flex-shrink-0"
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`, '_blank')}
                        >
                            <Navigation className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
});

BusinessMarker.displayName = 'BusinessMarker';

export default function BusinessMap({ businesses, selectedBusinessSlug, onBusinessSelect, userLocation }: BusinessMapProps) {
    const t = useTranslations('explore');

    // Filter valid businesses
    const validBusinesses = useMemo(() =>
        businesses.filter(b => b.latitude && b.longitude),
        [businesses]);

    const selectedBusiness = useMemo(() =>
        validBusinesses.find(b => b.slug === selectedBusinessSlug),
        [validBusinesses, selectedBusinessSlug]);

    // Calculate Center Logic
    const center: [number, number] = useMemo(() => {
        if (selectedBusiness?.latitude && selectedBusiness?.longitude) {
            return [selectedBusiness.latitude, selectedBusiness.longitude];
        }

        // If we have search results (and not too many to be meaningless), center on them
        const centroid = getCentroid(validBusinesses);
        if (centroid && validBusinesses.length > 0) {
            return centroid;
        }

        if (userLocation) {
            return [userLocation.lat, userLocation.lng];
        }

        return [33.5731, -7.5898]; // Default Casablanca
    }, [selectedBusiness, validBusinesses, userLocation]);

    // Limit displayed markers for performance (Aggressive limit: 20)
    // This significantly reduces DOM nodes and improves performance on all devices.
    const displayedBusinesses = useMemo(() => validBusinesses.slice(0, 20), [validBusinesses]);

    if (validBusinesses.length === 0) {
        return (
            <div className="flex items-center justify-center h-full bg-muted/20 rounded-lg border-2 border-dashed">
                <div className="text-center p-6 text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t('mapNoLocation')}</p>
                </div>
            </div>
        );
    }

    return (
        <MapContainer
            center={center}
            zoom={13}
            preferCanvas={true} // High performance mode
            style={{ height: '100%', width: '100%', borderRadius: '0.75rem', zIndex: 0 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapUpdater center={center} />

            {displayedBusinesses.map((business) => (
                <BusinessMarker
                    key={business.id}
                    business={business}
                    isSelected={business.slug === selectedBusinessSlug}
                    onClick={onBusinessSelect || (() => { })}
                />
            ))}
        </MapContainer>
    );
}
