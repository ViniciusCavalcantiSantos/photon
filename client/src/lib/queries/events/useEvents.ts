import {useQuery} from "@tanstack/react-query";
import {fetchEvents, type FetchEventsParams} from "@/lib/api/events/fetchEvents";

export function useEvents(params: FetchEventsParams = {}) {
  const {
    searchTerm = '',
    page = 1,
    pageSize = 15,
    withContract = false,
    contractId,
    eventTypeId,
    sortBy = 'event_date',
    sortOrder = 'desc',
  } = params;

  return useQuery({
    queryKey: ["events", searchTerm, page, pageSize, contractId, eventTypeId, sortBy, sortOrder],
    queryFn: () => fetchEvents({
      page,
      pageSize,
      searchTerm,
      withContract,
      contractId,
      eventTypeId,
      sortBy,
      sortOrder,
    }),
    retry: 1,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });
}

