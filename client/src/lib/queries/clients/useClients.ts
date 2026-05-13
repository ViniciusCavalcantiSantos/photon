import {useQuery} from "@tanstack/react-query";
import {fetchClients, FetchClientsParams} from "@/lib/api/clients/fetchClients";

export function useClients(params: FetchClientsParams = {}) {
  const {
    searchTerm = '',
    page = 1,
    pageSize = 15,
    sortBy = 'created_at',
    sortOrder = 'desc',
    eventIds = [],
  } = params;

  return useQuery({
    queryKey: ["clients", searchTerm, page, pageSize, sortBy, sortOrder, eventIds],
    queryFn: () => fetchClients(params),
    retry: 1,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true
  });
}
