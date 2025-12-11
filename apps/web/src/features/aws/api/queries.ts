import { queryOptions } from "@tanstack/react-query";
import { fetchAPI } from "@/lib/api";
import type { AWSResponse } from "../types";

interface AWSQueryParams {
  province?: string;
  city?: string;
  type?: string;
}

export const awsQueryOptions = (params?: AWSQueryParams) => {
  const searchParams = new URLSearchParams();
  if (params?.province) searchParams.append("province", params.province);
  if (params?.city) searchParams.append("city", params.city);
  if (params?.type) searchParams.append("type", params.type);

  const query = searchParams.toString();

  return queryOptions({
    queryKey: ["aws", params],
    queryFn: () => fetchAPI<AWSResponse>(`/aws${query ? `?${query}` : ""}`),
    staleTime: 1000 * 60 * 10, // 10 minutes (AWS update interval)
  });
};
