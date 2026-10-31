
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet маркерлерінің белгішелерін түзету
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Картадан орын таңдау
function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
}

// Іздеу нәтижесіне картаны жылжыту
function MapFlyTo({ location }) {
  const map = useMap();

  useEffect(() => {
    if (!location) return;

    map.flyTo(
      [location.lat, location.lng],
      16,
      {
        animate: true,
        duration: 1.5,
      }
    );
  }, [location, map]);

  return null;
}

export default function CityMap({
  reports = [],
  onLocationSelect,
}) {
  const [selected, setSelected] = useState(null);

  const [searchAddress, setSearchAddress] =
    useState("");

  const [searching, setSearching] =
    useState(false);

  const [searchError, setSearchError] =
    useState("");

  const [foundAddress, setFoundAddress] =
    useState("");

  function handleSelect(location) {
    setSelected(location);

    onLocationSelect?.(location);
  }

  async function searchLocation(event) {
    event.preventDefault();

    const query = searchAddress.trim();

    if (!query) {
      setSearchError(
        "Мекенжайды немесе көше атауын енгізіңіз."
      );
      return;
    }

    setSearching(true);
    setSearchError("");
    setFoundAddress("");

    try {
      // OpenStreetMap Nominatim геокодтау сервисі
      const params = new URLSearchParams({
        q: `${query}, Алматы, Қазақстан`,
        format: "json",
        limit: "1",
        addressdetails: "1",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Мекенжай іздеу сервисі уақытша қолжетімсіз."
        );
      }

      const data = await response.json();

      if (!data.length) {
        setSearchError(
          "Мекенжай табылмады. Басқа атаумен іздеп көріңіз."
        );
        return;
      }

      const result = data[0];

      const location = {
        lat: Number(result.lat),
        lng: Number(result.lon),
      };

      handleSelect(location);

      setFoundAddress(result.display_name);
    } catch (error) {
      setSearchError(
        error.message ||
          "Іздеу кезінде қате пайда болды."
      );
    } finally {
      setSearching(false);
    }
  }

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
      }}
    >
      {/* Мекенжай іздеу */}
      <form
        onSubmit={searchLocation}
        style={{
          display: "flex",
          gap: 10,
          padding: 12,
          background: "#f5faf7",
          borderRadius: 14,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          value={searchAddress}
          onChange={(event) =>
            setSearchAddress(event.target.value)
          }
          placeholder="Мысалы: Абай даңғылы 10"
          aria-label="Мекенжайды іздеу"
          style={{
            flex: "1 1 200px",
            minWidth: 0,
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #d6e5db",
            outlineColor: "#287a50",
            fontSize: 14,
          }}
        />

        <button
          type="submit"
          disabled={searching}
          style={{
            padding: "12px 22px",
            borderRadius: 10,
            border: "none",
            background: "#20583b",
            color: "white",
            fontWeight: 600,
            cursor: searching
              ? "wait"
              : "pointer",
          }}
        >
          {searching
            ? "Ізделуде..."
            : "🔍 Іздеу"}
        </button>
      </form>

      {searchError && (
        <p
          role="alert"
          style={{
            color: "#b42318",
            fontSize: 13,
            margin: "0 0 12px",
          }}
        >
          {searchError}
        </p>
      )}

      {foundAddress && (
        <div
          style={{
            padding: "10px 14px",
            background: "#eaf7ee",
            color: "#20583b",
            borderRadius: 10,
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          📍 Табылған мекенжай: {foundAddress}
        </div>
      )}

      {/* Негізгі карта */}
      <div
        style={{
          width: "100%",
          height: "500px",
          borderRadius: "16px",
          overflow: "hidden",
          position: "relative",
          zIndex: 0,
        }}
      >
        <MapContainer
          center={[43.238949, 76.889709]}
          zoom={12}
          scrollWheelZoom={true}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler
            onSelect={handleSelect}
          />

          <MapFlyTo location={selected} />

          {/* Өтініштердің маркерлері */}
          {reports
            .filter(
              (report) =>
                report.lat != null &&
                report.lng != null &&
                Number.isFinite(
                  Number(report.lat)
                ) &&
                Number.isFinite(
                  Number(report.lng)
                )
            )
            .map((report) => (
              <Marker
                key={report.id}
                position={[
                  Number(report.lat),
                  Number(report.lng),
                ]}
              >
                <Popup>
                  <strong>
                    {report.title}
                  </strong>

                  <p>
                    {report.description}
                  </p>

                  <p>
                    Мәртебесі:{" "}
                    {report.status === "Completed"
                      ? "Шешілді"
                      : report.status === "In Progress"
                      ? "Орындалуда"
                      : "Қаралуда"}
                  </p>
                </Popup>
              </Marker>
            ))}

          {/* Таңдалған мекенжай */}
          {selected && (
            <Marker
              position={[
                selected.lat,
                selected.lng,
              ]}
            >
              <Popup>
                <strong>
                  Таңдалған орын
                </strong>

                <p>
                  {selected.lat.toFixed(5)},{" "}
                  {selected.lng.toFixed(5)}
                </p>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
