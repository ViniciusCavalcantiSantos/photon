import {useQuery} from "@tanstack/react-query";
import {fetchContracts} from "@/lib/api/contracts/fetchContracts";

export function useContracts(
  search: string = '',
  page: number = 1,
  pageSize: number = 15,
  enabled: boolean = true,
  withEvents: boolean = false,
) {
  return useQuery({
    queryKey: ["contracts", search, page, pageSize, withEvents],
    queryFn: () => fetchContracts(page, pageSize, search, withEvents),
    retry: 1,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    enabled,
  });
}
