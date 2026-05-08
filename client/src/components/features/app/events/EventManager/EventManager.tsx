"use client"

import React, {useEffect, useState} from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Fab,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Popover,
  Select,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import CloseIcon from "@mui/icons-material/Close";

import {useT} from "@/i18n/client";
import Event from "@/types/Event";
import ManageEventModal from "@/components/features/app/events/EventManager/_modals/ManageEventModal";
import {useUser} from "@/contexts/UserContext";
import {useEvents} from "@/lib/queries/events/useEvents";
import {useRemoveEvent} from "@/lib/queries/events/useRemoveEvent";
import PageHeader from "@/components/common/layout/PageHeader";
import {useServerTable} from "@/hooks/useServerTable";
import EventCard from "@/components/features/app/events/EventManager/_components/EventCard";
import {useContracts} from "@/lib/queries/contracts/useContracts";
import {fetchEventTypes} from "@/lib/api/events/fetchEventTypes";

/* ── shared sx tokens ── */
const filterSelectSx = {
  borderRadius: '12px',
  backgroundColor: 'var(--st-bg-paper)',
  color: 'var(--st-text)',
  fontSize: '0.85rem',
  '& fieldset': {borderColor: 'var(--st-border)'},
  '&:hover fieldset': {borderColor: 'var(--st-primary)'},
  '&.Mui-focused fieldset': {borderColor: 'var(--st-primary)'},
  '& .MuiSvgIcon-root': {color: 'var(--st-text-sec)'},
  '&.Mui-disabled': {
    backgroundColor: 'rgba(156, 163, 175, 0.08)',
    color: 'var(--st-text-sec)',
    cursor: 'not-allowed',
    '& fieldset': {borderColor: 'var(--st-border)', borderStyle: 'dashed'},
    '& .MuiSvgIcon-root': {color: 'var(--st-text-sec)'},
  },
  '& .MuiSelect-select.Mui-disabled': {
    WebkitTextFillColor: 'var(--st-text-sec)',
    color: 'var(--st-text-sec)',
  },
} as const;

const filterMenuProps = {
  slotProps: {
    paper: {
      sx: {
        backgroundColor: 'var(--st-bg-elevated)',
        border: '1px solid var(--st-border)',
        borderRadius: '12px',
        '& .MuiMenuItem-root': {
          color: 'var(--st-text)',
          fontSize: '0.85rem',
          '&:hover': {backgroundColor: 'var(--st-primary-light)'},
          '&.Mui-selected': {backgroundColor: 'var(--st-primary-light)'},
        },
      },
    },
  },
};

export default function EventManager() {
  const {t} = useT();
  const [open, setOpen] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);

  const {defaultDateFormat} = useUser();
  const {queryParams, searchProps, pagination, filters} = useServerTable<Event>();

  /* ── Dynamic event types per selected contract ── */
  const [eventTypes, setEventTypes] = useState<{id: number; name: string}[]>([]);

  const {data: contractsData} = useContracts(undefined, 1, 300);

  useEffect(() => {
    if (filters.contractId) {
      fetchEventTypes(filters.contractId as number).then(res => setEventTypes(res.eventTypes));
    } else {
      setEventTypes([]);
      filters.onEventTypeChange('');
    }
  }, [filters.contractId]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useEvents(queryParams);

  const removeEvent = useRemoveEvent();
  const [editingEvent, setEditingEvent] = useState<Event>();

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setOpen(true);
  };

  const handleDeleteEvent = (event: Event) => {
    removeEvent.mutate(event.id);
  };

  const handleClose = () => {
    setEditingEvent(undefined);
    setOpen(false);
  };

  const events = data?.events ?? [];
  const meta = data?.meta;
  const lastPage = meta?.last_page ?? 0;
  const isFilterMenuOpen = Boolean(filterAnchorEl);
  const activeFilterCount = Number(Boolean(filters.contractId)) + Number(Boolean(filters.eventTypeId));
  const hasCustomSort = filters.sortBy !== 'event_date' || filters.sortOrder !== 'desc';

  const handleResetFilters = () => {
    filters.onContractChange('');
    filters.onEventTypeChange('');
    filters.onSortByChange('event_date');
    filters.onSortOrderChange('desc');
  };

  return (
    <>
      <PageHeader title={t('events')}/>

      {/* ── Toolbar: Search + Create ── */}
      <Box sx={{display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, gap: 2, mb: 2, alignItems: {sm: 'center'}}}>
        <TextField
          {...searchProps}
          placeholder={t('search_event')}
          size="small"
          variant="outlined"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{color: 'var(--st-text-sec)', fontSize: 20}}/>
                </InputAdornment>
              ),
            }
          }}
          sx={{
            flex: 1,
            maxWidth: {sm: 360},
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: 'var(--st-bg-paper)',
              color: 'var(--st-text)',
              '& fieldset': {borderColor: 'var(--st-border)'},
              '&:hover fieldset': {borderColor: 'var(--st-primary)'},
              '&.Mui-focused fieldset': {borderColor: 'var(--st-primary)'},
            },
            '& .MuiInputBase-input::placeholder': {color: 'var(--st-text-sec)', opacity: 1},
          }}
        />
        <Tooltip title={t('filters')} arrow>
          <IconButton
            onClick={(event) => setFilterAnchorEl(event.currentTarget)}
            aria-label={t('filters')}
            aria-haspopup="true"
            aria-expanded={isFilterMenuOpen ? 'true' : undefined}
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              border: '1px solid var(--st-border)',
              backgroundColor: isFilterMenuOpen ? 'var(--st-primary-light)' : 'var(--st-bg-paper)',
              color: isFilterMenuOpen || activeFilterCount > 0 || hasCustomSort ? 'var(--st-primary)' : 'var(--st-text-sec)',
              '&:hover': {
                borderColor: 'var(--st-primary)',
                backgroundColor: 'var(--st-primary-light)',
              },
            }}
          >
            <Badge
              badgeContent={activeFilterCount + Number(hasCustomSort)}
              color="primary"
              invisible={activeFilterCount === 0 && !hasCustomSort}
              sx={{
                '& .MuiBadge-badge': {
                  minWidth: 16,
                  height: 16,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--st-primary)',
                },
              }}
            >
              <FilterListIcon fontSize="small"/>
            </Badge>
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          startIcon={<AddIcon/>}
          onClick={() => setOpen(true)}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1,
            backgroundColor: 'var(--st-primary)',
            '&:hover': {backgroundColor: 'var(--st-primary-hover)'},
          }}
        >
          {t('add_new_event')}
        </Button>
      </Box>

      <Popover
        open={isFilterMenuOpen}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
        transformOrigin={{vertical: 'top', horizontal: 'right'}}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: {xs: 'calc(100vw - 32px)', sm: 380},
              borderRadius: '16px',
              backgroundColor: 'var(--st-bg-elevated)',
              border: '1px solid var(--st-border)',
              boxShadow: 'var(--st-shadow-elevated)',
              color: 'var(--st-text)',
              overflow: 'hidden',
            },
          },
        }}
      >
        <Box sx={{p: 2}}>
          <Stack direction="row" sx={{alignItems: 'center', gap: 1.25, mb: 2}}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                display: 'grid',
                placeItems: 'center',
                backgroundColor: 'var(--st-primary-light)',
                color: 'var(--st-primary)',
              }}
            >
              <FilterListIcon fontSize="small"/>
            </Box>
            <Box sx={{flex: 1, minWidth: 0}}>
              <Typography sx={{fontWeight: 700, color: 'var(--st-text)', lineHeight: 1.2}}>
                {t('filters')}
              </Typography>
              <Typography variant="caption" sx={{color: 'var(--st-text-sec)'}}>
                {activeFilterCount > 0 || hasCustomSort ? t('filters_active') : t('default_view')}
              </Typography>
            </Box>
            <Tooltip title={t('close')} arrow>
              <IconButton
                size="small"
                onClick={() => setFilterAnchorEl(null)}
                sx={{color: 'var(--st-text-sec)', '&:hover': {backgroundColor: 'var(--st-primary-light)', color: 'var(--st-text)'}}}
              >
                <CloseIcon fontSize="small"/>
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack spacing={1.5}>
            <Box>
              <Typography sx={{color: 'var(--st-text-sec)', fontWeight: 600, fontSize: '0.78rem', mb: 0.75}}>
                {t('contract')}
              </Typography>
              <FormControl size="small" fullWidth>
                <Select
                  value={filters.contractId}
                  displayEmpty
                  onChange={(e) => filters.onContractChange(e.target.value as number | '')}
                  sx={filterSelectSx}
                  MenuProps={filterMenuProps}
                >
                  <MenuItem value="">
                    <Typography sx={{color: 'var(--st-text-disabled)', fontSize: '0.85rem'}}>
                      {t('all_contracts')}
                    </Typography>
                  </MenuItem>
                  {contractsData?.contracts?.map(c => (
                    <MenuItem key={c.id} value={c.id}>{c.code} – {c.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Typography sx={{color: 'var(--st-text-sec)', fontWeight: 600, fontSize: '0.78rem', mb: 0.75}}>
                {t('event_category')}
              </Typography>
              <FormControl size="small" fullWidth disabled={eventTypes.length === 0}>
                <Select
                  value={filters.eventTypeId}
                  displayEmpty
                  onChange={(e) => filters.onEventTypeChange(e.target.value as number | '')}
                  sx={filterSelectSx}
                  MenuProps={filterMenuProps}
                >
                  <MenuItem value="">
                    <Typography sx={{color: 'var(--st-text-disabled)', fontSize: '0.85rem'}}>
                      {t('all_event_types')}
                    </Typography>
                  </MenuItem>
                  {eventTypes.map(et => (
                    <MenuItem key={et.id} value={et.id}>{et.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {eventTypes.length === 0 && (
                <Typography variant="caption" sx={{display: 'block', color: 'var(--st-text-sec)', mt: 0.75}}>
                  {filters.contractId ? t('no_event_types_available') : t('select_contract_first')}
                </Typography>
              )}
            </Box>
          </Stack>

          <Divider sx={{my: 2, borderColor: 'var(--st-divider)'}}/>

          <Stack direction="row" sx={{alignItems: 'center', gap: 1, mb: 1.5}}>
            <SwapVertIcon sx={{color: 'var(--st-text-sec)', fontSize: 20}}/>
            <Typography sx={{color: 'var(--st-text)', fontWeight: 700, fontSize: '0.9rem'}}>
              {t('sort_by')}
            </Typography>
          </Stack>

          <Stack direction={{xs: 'column', sm: 'row'}} spacing={1.5}>
            <FormControl size="small" fullWidth>
              <Select
                value={filters.sortBy}
                onChange={(e) => filters.onSortByChange(e.target.value)}
                sx={filterSelectSx}
                MenuProps={filterMenuProps}
              >
                <MenuItem value="event_date">{t('event_date')}</MenuItem>
                <MenuItem value="title">{t('event_title')}</MenuItem>
                <MenuItem value="created_at">{t('created_at')}</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <Select
                value={filters.sortOrder}
                onChange={(e) => filters.onSortOrderChange(e.target.value as 'asc' | 'desc')}
                sx={filterSelectSx}
                MenuProps={filterMenuProps}
              >
                <MenuItem value="desc">{t('newest_first')}</MenuItem>
                <MenuItem value="asc">{t('oldest_first')}</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {(activeFilterCount > 0 || hasCustomSort) && (
            <Button
              fullWidth
              variant="text"
              onClick={handleResetFilters}
              sx={{
                mt: 2,
                borderRadius: '10px',
                textTransform: 'none',
                color: 'var(--st-text-sec)',
                fontWeight: 600,
                '&:hover': {backgroundColor: 'var(--st-primary-light)', color: 'var(--st-primary)'},
              }}
            >
              {t('reset_filters')}
            </Button>
          )}
        </Box>
      </Popover>

      {/* ── Event Cards ── */}
      {isLoading ? (
        <Stack spacing={2}>
          {[...Array(3)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={140}
              sx={{borderRadius: '16px', bgcolor: 'var(--st-bg-elevated)'}}
            />
          ))}
        </Stack>
      ) : isError ? (
        <Card
          variant="outlined"
          sx={{borderRadius: '16px', backgroundColor: 'var(--st-bg-paper)', borderColor: 'var(--st-border)', textAlign: 'center', py: 6}}
        >
          <CardContent>
            <ErrorOutlineIcon sx={{fontSize: 48, color: 'var(--st-error)', mb: 2}}/>
            <Typography sx={{color: 'var(--st-text)', fontWeight: 600, mb: 1}}>
              {t('something_went_wrong')}
            </Typography>
            <Typography variant="body2" sx={{color: 'var(--st-text-sec)', mb: 2}}>
              {error instanceof Error ? error.message : undefined}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => refetch()}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                borderColor: 'var(--st-border)',
                color: 'var(--st-text)',
                '&:hover': {borderColor: 'var(--st-primary)', backgroundColor: 'var(--st-primary-light)'},
              }}
            >
              {t('try_again')}
            </Button>
          </CardContent>
        </Card>
      ) : events.length === 0 ? (
        <Card
          variant="outlined"
          sx={{borderRadius: '16px', backgroundColor: 'var(--st-bg-paper)', borderColor: 'var(--st-border)', textAlign: 'center', py: 6}}
        >
          <CardContent>
            <SentimentDissatisfiedIcon sx={{fontSize: 48, color: 'var(--st-text-sec)', mb: 2}}/>
            <Typography sx={{color: 'var(--st-text)', fontWeight: 600, mb: 1}}>
              {t('no_event_found')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon/>}
              onClick={() => setOpen(true)}
              sx={{
                mt: 2,
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                backgroundColor: 'var(--st-primary)',
                '&:hover': {backgroundColor: 'var(--st-primary-hover)'},
              }}
            >
              {t('add_new_event')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              defaultDateFormat={defaultDateFormat}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
            />
          ))}
        </Stack>
      )}

      {/* ── Pagination ── */}
      {lastPage > 1 && (
        <Box sx={{display: 'flex', justifyContent: 'center', mt: 4, mb: 2}}>
          <Pagination
            count={lastPage}
            page={pagination.page}
            onChange={pagination.onPageChange}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                color: 'var(--st-text)',
                borderColor: 'var(--st-border)',
                borderRadius: '8px',
                '&.Mui-selected': {
                  backgroundColor: 'var(--st-primary)',
                  color: '#fff',
                  '&:hover': {backgroundColor: 'var(--st-primary-hover)'},
                },
                '&:hover': {backgroundColor: 'var(--st-primary-light)'},
              },
            }}
          />
        </Box>
      )}

      {/* ── Floating Action Button (mobile) ── */}
      <Fab
        color="primary"
        onClick={() => setOpen(true)}
        sx={{
          display: {xs: 'flex', sm: 'none'},
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: 'var(--st-primary)',
          '&:hover': {backgroundColor: 'var(--st-primary-hover)'},
        }}
      >
        <AddIcon/>
      </Fab>

      <ManageEventModal
        open={open}
        event={editingEvent}
        onCreate={handleClose}
        onEdit={handleClose}
        onCancel={handleClose}
      />
    </>
  );
}
