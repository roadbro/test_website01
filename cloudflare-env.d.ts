declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    KMA_API_KEY?: string;
    DATA_GO_KR_SERVICE_KEY?: string;
    KPX_REALTIME_POLL_MINUTES?: string;
    APP_TIMEZONE?: string;
    MOCK_MODE?: string;
    KMA_LOCATION_LAT?: string;
    KMA_LOCATION_LON?: string;
  }
}
