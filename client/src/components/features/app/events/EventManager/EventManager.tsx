"use client"

import React, {useEffect, useState} from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Fab,
  FormControl,
  InputAdornment,
  MenuItem,
  Pagination,
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
  borderRadius: '10px',
  backgroundColor: 'var(--st-bg-paper)',
  color: 'var(--st-text)',
  fontSize: '0.85rem',
  minWidth: 160,
  '& fieldset': {borderColor: 'var(--st-border)'},
  '&:hover fieldset': {borderColor: 'var(--st-primary)'},
  '&.Mui-focused fieldset': {borderColor: 'var(--st-primary)'},
  '& .MuiSvgIcon-root': {color: 'var(--st-text-sec)'},
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

      {/* ── Filter Bar ── */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          mb: 3,
          p: 1.5,
          borderRadius: '14px',
          backgroundColor: 'var(--st-bg-paper)',
          border: '1px solid var(--st-border)',
          alignItems: 'center',
        }}
      >
        <Tooltip title={t('filter_by_contract')} arrow>
          <FilterListIcon sx={{color: 'var(--st-text-sec)', fontSize: 20, ml: 0.5}}/>
        </Tooltip>

        {/* Contract filter */}
        <FormControl size="small">
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

        {/* Event type filter */}
        <FormControl size="small" disabled={eventTypes.length === 0}>
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

        <Box sx={{flex: 1}}/>

        {/* Sort controls */}
        <Tooltip title={t('sort_by')} arrow>
          <SwapVertIcon sx={{color: 'var(--st-text-sec)', fontSize: 20}}/>
        </Tooltip>

        <FormControl size="small">
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

        <FormControl size="small">
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
      </Box>

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
      {meta && meta.last_page > 1 && (
        <Box sx={{display: 'flex', justifyContent: 'center', mt: 4, mb: 2}}>
          <Pagination
            count={meta.last_page}
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

