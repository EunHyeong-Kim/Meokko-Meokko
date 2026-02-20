declare namespace kakao.maps {
  function load(callback: () => void): void;

  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    setLevel(level: number): void;
    panTo(latlng: LatLng): void;
  }

  interface MapOptions {
    center: LatLng;
    level: number;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
  }

  interface MarkerOptions {
    position: LatLng;
    map?: Map;
  }

  class InfoWindow {
    constructor(options: InfoWindowOptions);
    open(map: Map, marker: Marker): void;
    close(): void;
  }

  interface InfoWindowOptions {
    content: string;
    removable?: boolean;
  }

  class Circle {
    constructor(options: CircleOptions);
    setMap(map: Map | null): void;
  }

  interface CircleOptions {
    center: LatLng;
    radius: number;
    strokeWeight: number;
    strokeColor: string;
    strokeOpacity: number;
    strokeStyle: string;
    fillColor: string;
    fillOpacity: number;
    map?: Map;
  }

  namespace event {
    function addListener(
      target: Marker | Map,
      type: string,
      callback: () => void
    ): void;
  }

  namespace services {
    enum Status {
      OK = "OK",
      ZERO_RESULT = "ZERO_RESULT",
      ERROR = "ERROR",
    }

    enum SortBy {
      ACCURACY = "accuracy",
      DISTANCE = "distance",
    }

    interface PlacesSearchOptions {
      location?: LatLng;
      radius?: number;
      size?: number;
      sort?: SortBy;
      category_group_code?: string;
    }

    interface PlacesSearchResult {
      id: string;
      place_name: string;
      category_name: string;
      address_name: string;
      road_address_name: string;
      phone: string;
      x: string;
      y: string;
      distance: string;
      place_url: string;
    }

    interface Pagination {
      totalCount: number;
      hasNextPage: boolean;
      nextPage(): void;
    }

    class Places {
      constructor();
      keywordSearch(
        keyword: string,
        callback: (
          result: PlacesSearchResult[],
          status: Status,
          pagination: Pagination
        ) => void,
        options?: PlacesSearchOptions
      ): void;
    }

    interface GeocoderResult {
      address_name: string;
      road_address_name?: string;
      x: string;
      y: string;
    }

    class Geocoder {
      constructor();
      addressSearch(
        address: string,
        callback: (result: GeocoderResult[], status: Status) => void
      ): void;
    }
  }
}
