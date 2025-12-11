export interface AWSStation {
  stationId: string;
  stationName: string;
  city: string;
  province: string;
  provinceCode: string;
  lat: string;
  lng: string;
  type: string;
  data?: Record<string, unknown>;
}

export interface AWSResponse {
  success: boolean;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  stations: AWSStation[];
}
