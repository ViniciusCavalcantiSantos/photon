import {useCallback, useState} from "react";
import {Button, Empty, TablePaginationConfig} from "antd";
import {useDebounce} from "react-use";
import {useT} from "@/i18n/client";
import ErrorEmpty from "@/components/common/ErrorEmpty";

interface UseServerTableProps {
  initialPageSize?: number;
}

export function useServerTable<T>({initialPageSize = 15}: UseServerTableProps = {}) {
  const {t} = useT();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Filter state
  const [contractId, setContractId] = useState<number | ''>('');
  const [eventTypeId, setEventTypeId] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<string>('event_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useDebounce(
    () => {
      setDebouncedTerm(searchTerm);
      // Reset to first page whenever search changes
      if (searchTerm !== debouncedTerm) {
        setPage(1);
      }
    },
    300,
    [searchTerm]
  );

  const handleTableChange = useCallback((newPagination: TablePaginationConfig) => {
    setPage(newPagination.current || 1);
    setPageSize(newPagination.pageSize || initialPageSize);
  }, [initialPageSize]);

  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  }, []);

  const handleContractChange = useCallback((value: number | '') => {
    setContractId(value);
    setEventTypeId('');
    setPage(1);
  }, []);

  const handleEventTypeChange = useCallback((value: number | '') => {
    setEventTypeId(value);
    setPage(1);
  }, []);

  const handleSortByChange = useCallback((value: string) => {
    setSortBy(value);
    setPage(1);
  }, []);

  const handleSortOrderChange = useCallback((value: 'asc' | 'desc') => {
    setSortOrder(value);
    setPage(1);
  }, []);

  const searchProps = {
    placeholder: t("search"),
    value: searchTerm,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
  };

  const getTableProps = (
    {
      data,
      total,
      isLoading,
      isError,
      error,
      refetch,
      onAdd,
      addText,
      emptyText,
    }: {
      data?: T[];
      total?: number;
      isLoading: boolean;
      isError: boolean;
      error?: any;
      refetch: () => void;
      onAdd?: () => void;
      addText?: string;
      emptyText?: string;

    }) => ({
    dataSource: data,
    loading: isLoading,
    onChange: handleTableChange,
    pagination: {
      current: page,
      pageSize: pageSize,
      total: total || 0,
      showSizeChanger: true,
      pageSizeOptions: ["15", "30", "50", "100"],
      showTotal: (total: number, range: [number, number]) =>
        t("pagination", {start: range[0], end: range[1], total, count: total}),
    },
    locale: {
      emptyText: isError ? (
        <ErrorEmpty error={error} onRetry={refetch}/>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={emptyText || t("no_data_found")}
        >
          {onAdd && (
            <Button type="primary" onClick={onAdd}>
              {addText || t("add_new")}
            </Button>
          )}
        </Empty>
      ),
    },
  });

  return {
    queryParams: {
      searchTerm: debouncedTerm,
      page,
      pageSize,
      withContract: true,
      contractId,
      eventTypeId,
      sortBy,
      sortOrder,
    },
    pagination: {
      page,
      pageSize,
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
    },
    filters: {
      contractId,
      eventTypeId,
      sortBy,
      sortOrder,
      onContractChange: handleContractChange,
      onEventTypeChange: handleEventTypeChange,
      onSortByChange: handleSortByChange,
      onSortOrderChange: handleSortOrderChange,
    },
    searchProps,
    getTableProps,
  };
}