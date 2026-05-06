"use client"

import React, {useState} from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Fab,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";

import {useT} from "@/i18n/client";
import Event from "@/types/Event";
import ManageEventModal from "@/components/features/app/events/EventManager/_modals/ManageEventModal";
import {useUser} from "@/contexts/UserContext";
import {useEvents} from "@/lib/queries/events/useEvents";
import {useRemoveEvent} from "@/lib/queries/events/useRemoveEvent";
import PageHeader from "@/components/common/layout/PageHeader";
import {useServerTable} from "@/hooks/useServerTable";
import EventCard from "@/components/features/app/events/EventManager/_components/EventCard";

export default function EventManager() {
  const {t} = useT();
  const [open, setOpen] = useState(false);

  const {defaultDateFormat} = useUser();
  const {queryParams, searchProps} = useServerTable<Event>()

  const {
    data: data,
    isLoading,
    isError,
    error,
    refetch
  } = useEvents(queryParams.searchTerm, queryParams.page, queryParams.pageSize, true);
  const removeEvent = useRemoveEvent()

  const [editingEvent, setEditingEvent] = useState<Event>();
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setOpen(true)
  }

  const handleDeleteEvent = (event: Event) => {
    removeEvent.mutate(event.id)
  }

  const handleClose = () => {
    setEditingEvent(undefined)
    setOpen(false)
  }

  const events = data?.events ?? [];

  return (
    <>
      <PageHeader title={t('events')}/>

      {/* Search + Create Button */}
      <Box sx={{display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, gap: 2, mb: 3, alignItems: {sm: 'center'}}}>
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
              '& fieldset': {
                borderColor: 'var(--st-border)',
              },
              '&:hover fieldset': {
                borderColor: 'var(--st-primary)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'var(--st-primary)',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'var(--st-text-sec)',
              opacity: 1,
            },
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
            '&:hover': {
              backgroundColor: 'var(--st-primary-hover)',
            },
          }}
        >
          {t('add_new_event')}
        </Button>
      </Box>

      {/* Event Cards Grid */}
      {isLoading ? (
        <Stack spacing={2}>
          {[...Array(3)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={140}
              sx={{
                borderRadius: '16px',
                bgcolor: 'var(--st-bg-elevated)',
              }}
            />
          ))}
        </Stack>
      ) : isError ? (
        <Card
          variant="outlined"
          sx={{
            borderRadius: '16px',
            backgroundColor: 'var(--st-bg-paper)',
            borderColor: 'var(--st-border)',
            textAlign: 'center',
            py: 6,
          }}
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
                '&:hover': {
                  borderColor: 'var(--st-primary)',
                  backgroundColor: 'var(--st-primary-light)',
                },
              }}
            >
              {t('try_again')}
            </Button>
          </CardContent>
        </Card>
      ) : events.length === 0 ? (
        <Card
          variant="outlined"
          sx={{
            borderRadius: '16px',
            backgroundColor: 'var(--st-bg-paper)',
            borderColor: 'var(--st-border)',
            textAlign: 'center',
            py: 6,
          }}
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
                '&:hover': {
                  backgroundColor: 'var(--st-primary-hover)',
                },
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

      {/* Floating Action Button (mobile) */}
      <Fab
        color="primary"
        onClick={() => setOpen(true)}
        sx={{
          display: {xs: 'flex', sm: 'none'},
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: 'var(--st-primary)',
          '&:hover': {
            backgroundColor: 'var(--st-primary-hover)',
          },
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
