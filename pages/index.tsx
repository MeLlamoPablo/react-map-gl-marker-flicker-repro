import type { NextPage } from "next";
import Map, { MapRef, Marker, ViewState } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Supercluster from "supercluster";
import { useMemo, useRef, useState } from "react";
import WebMercatorViewport from "@math.gl/web-mercator";

const TEAMS = [
  {
    name: "Real Madrid",
    crest:
      "https://ssl.gstatic.com/onebox/media/sports/logos/Th4fAVAZeCJWRcKoLW7koA_48x48.png",
    latitude: 40.45318,
    longitude: -3.68811,
  },
  {
    name: "Sevilla",
    crest:
      "https://ssl.gstatic.com/onebox/media/sports/logos/hCTs5EX3WjCMC5Jl3QE4Rw_48x48.png",
    latitude: 37.38414,
    longitude: -5.97058,
  },
  {
    name: "Barcelona",
    crest:
      "https://ssl.gstatic.com/onebox/media/sports/logos/paYnEE8hcrP96neHRNofhQ_48x48.png",
    latitude: 41.38102,
    longitude: 2.12263,
  },
  {
    name: "Atlético Madrid",
    crest:
      "https://ssl.gstatic.com/onebox/media/sports/logos/srAAE0bOnCppUrlbJpFiHQ_48x48.png",
    latitude: 40.4361,
    longitude: -3.5995,
  },
  {
    name: "Real Betis",
    crest:
      "https://ssl.gstatic.com/onebox/media/sports/logos/S0fDZjYYytbZaUt0f3cIhg_48x48.png",
    latitude: 37.35652,
    longitude: -5.9819,
  },
  {
    name: "Real Sociedad",
    crest:
      "https://ssl.gstatic.com/onebox/media/sports/logos/w8tb1aeBfVZIj9tZXf7eZg_48x48.png",
    latitude: 43.30156,
    longitude: -1.97366,
  },
  {
    name: "Villarreal",
    crest:
      "https://ssl.gstatic.com/onebox/media/sports/logos/WKH7Ak5cYD6Qm1EEqXzmVw_48x48.png",
    latitude: 39.94415,
    longitude: -0.10332,
  },
  {
    name: "Athletic Club",
    crest:
      "https://ssl.gstatic.com/onebox/media/sports/logos/OSL_5Zm6kYPP1J17Bo5uDA_48x48.png",
    latitude: 43.2642,
    longitude: -2.94969,
  },
  {
    name: "Valencia",
    crest:
      "https://ssl.gstatic.com/onebox/media/sports/logos/QPbjvDwI_0Wuu4tCS2O6uw_48x48.png",
    latitude: 39.47477,
    longitude: -0.35854,
  },
  {
    name: "Celta Vigo",
    crest:
      "https://ssl.gstatic.com/onebox/media/sports/logos/wpdhixHP_sloegfP0UlwAw_48x48.png",
    latitude: 42.2121,
    longitude: -8.73937,
  },
  {
    name: "Osasuna",
    crest:
      "https://ssl.gstatic.com/onebox/media/sports/logos/pk-hNCNpGM_JDoHHvLVF-Q_48x48.png",
    latitude: 42.79667,
    longitude: -1.63707,
  },
  {
    name: "Espanyol",
    crest:
      "https://ssl.gstatic.com/onebox/media/sports/logos/TKitIqelDyN6M-kYt4Uc0g_48x48.png",
    latitude: 41.34808,
    longitude: 2.0756,
  },
  {
    name: "Rayo Vallecano",
    crest:
      "https://ssl.gstatic.com/onebox/media/sports/logos/i5LifmxEVIl0sbvIysiyhw_48x48.png",
    latitude: 40.39182,
    longitude: -3.65867,
  },
  {
    name: "Elche",
    crest:
      "https://ssl.gstatic.com/onebox/media/sports/logos/uyyqqxLIYT_lQIXRyMI_RA_48x48.png",
    latitude: 38.2672,
    longitude: -0.66325,
  },
  {
    name: "Getafe",
    crest:
      "https://ssl.gstatic.com/onebox/media/sports/logos/1UDHZMdKZD15W5gus7dJyg_48x48.png",
    latitude: 40.32608,
    longitude: -3.71487,
  },
  {
    name: "Mallorca",
    crest:
      "https://ssl.gstatic.com/onebox/media/sports/logos/Ss21P4CUmigjrEtcoapjVg_48x48.png",
    latitude: 39.59013,
    longitude: 2.63,
  },
  {
    name: "Granada",
    crest:
      "https://ssl.gstatic.com/onebox/media/sports/logos/Fn_X2IO4-1ACuTemcHkDEw_48x48.png",
    latitude: 37.15292,
    longitude: -3.59577,
  },
  {
    name: "Cádiz",
    crest:
      "https://ssl.gstatic.com/onebox/media/sports/logos/H1vdTrUUqJBeUW1HfbW0nQ_48x48.png",
    latitude: 36.5027,
    longitude: -6.27308,
  },
  {
    name: "Alavés",
    crest:
      "https://ssl.gstatic.com/onebox/media/sports/logos/meAnutdPID67rfUecKaoFg_48x48.png",
    latitude: 42.8371,
    longitude: -2.6884,
  },
  {
    name: "Levante",
    crest:
      "https://ssl.gstatic.com/onebox/media/sports/logos/SQB-jlVosxVV1Ce79FhbOA_48x48.png",
    latitude: 39.49486,
    longitude: -0.36379,
  },
];

const index = new Supercluster({
  minPoints: 2,
  radius: 60,
  minZoom: 0,
});

index.load(
  TEAMS.map((team) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [team.longitude, team.latitude],
    },
    id: team.name,
    properties: team,
  }))
);

const Home: NextPage = () => {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState<
    ViewState & { width: number; height: number }
  >({
    latitude: 40.4167047,
    longitude: -3.7035825,
    zoom: 5,
    bearing: 0,
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    pitch: 0,
    width: 1000,
    height: 800,
  });

  const markers = useMemo(() => {
    const mercator = new WebMercatorViewport(viewState);
    const [[south, west], [north, east]] = mercator.getBounds();
    const clusters = index.getClusters(
      [south - 1, west - 1, north + 1, east + 1],
      Math.round(viewState.zoom)
    );

    return clusters.map((cluster) => {
      if (cluster.properties.cluster) {
        const [lon, lat] = cluster.geometry.coordinates;

        return (
          <Marker
            key={cluster.id}
            latitude={lat}
            longitude={lon}
            onClick={() => {
              mapRef.current?.flyTo({
                center: { lat: lat, lng: lon },
                zoom:
                  typeof cluster.id === "number"
                    ? index.getClusterExpansionZoom(cluster.id)
                    : viewState.zoom,
              });
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: "white",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid lightgray",
              }}
            >
              {cluster.properties.point_count}
            </div>
          </Marker>
        );
      }

      const team = cluster.properties as typeof TEAMS[number];

      return (
        <Marker
          key={team.name}
          latitude={team.latitude}
          longitude={team.longitude}
        >
          <img src={team.crest} alt={team.name} width={32} />
        </Marker>
      );
    });
  }, [viewState]);

  return (
    <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
      <Map
        viewState={viewState}
        onMove={({ viewState }) =>
          setViewState(({ width, height }) => ({
            ...viewState,
            width,
            height,
          }))
        }
        style={{ width: 1000, height: 800 }}
        mapStyle="mapbox://styles/danqing/ckone0do519nb18s89e6l2ggi"
        mapboxAccessToken="pk.eyJ1IjoiZGFucWluZyIsImEiOiJmNjJhNWJhZDQ3OTEzZTI1ODU5OTFlNWYzZDAwMzJhYSJ9.PzpMZ8rnzkBBs0oJgUmTZA"
        ref={mapRef}
      >
        {markers}
      </Map>
    </div>
  );
};

export default Home;
