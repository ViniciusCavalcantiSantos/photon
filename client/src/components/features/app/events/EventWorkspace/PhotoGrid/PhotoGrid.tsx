'use client'

import {useParams, useRouter} from "next/navigation";
import React, {useEffect, useMemo, useState} from "react";
import {useNotification} from "@/contexts/NotificationContext";
import {useT} from "@/i18n/client";
import Fallback from "@/components/ui/Fallback";
import ImageType from "@/types/Image";
import {filesize} from "filesize";
import {MetadataModal} from "@/components/features/app/events/EventWorkspace/PhotoGrid/_modals/MetadataModal";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import {
  ClientsOnImageModal
} from "@/components/features/app/events/EventWorkspace/PhotoGrid/_modals/ClientsOnImageModal";
import {useEvent} from "@/lib/queries/events/useEvent";
import {useEventImages} from "@/lib/queries/events/useEventImages";
import {downloadImage} from "@/lib/api/images/downloadImage";
import {useRemoveImage} from "@/lib/queries/images/useRemoveImage";
import {useImageMetadata} from "@/lib/queries/images/useImageMetadata";
import {useImageClients} from "@/lib/queries/images/useImageClients";
import PhotoCard from "@/components/features/app/events/EventWorkspace/PhotoGrid/_components/PhotoCard";
import useFormattedMetadata
  from "@/components/features/app/events/EventWorkspace/PhotoGrid/_hooks/useFormattedMetadata";
import PageHeader from "@/components/common/layout/PageHeader";
import {useUser} from "@/contexts/UserContext";
import dayjs from "dayjs";

export default function PhotoGrid() {
  const {t} = useT()
  const {defaultDateFormat} = useUser();
  const notification = useNotification();
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.event_id);

  const [imageSelected, seImageSelected] = useState<ImageType | null>(null)

  const [metadataOpen, setMetadataOpen] = useState(false);
  const metadataQuery = useImageMetadata(imageSelected?.id, metadataOpen);

  const [clientsOpen, setClientsOpen] = useState(false);
  const {data: clients} = useImageClients(imageSelected?.id, clientsOpen);

  const {
    data: event,
    isLoading: loadingEvent,
    isError: eventError,
  } = useEvent(eventId, true);

  const {
    data: images,
    isLoading: loadingImages,
    isError: imagesError,
  } = useEventImages(eventId);

  const removeImage = useRemoveImage(eventId);

  const loading = loadingEvent || loadingImages;
  const isError = eventError || imagesError;

  useEffect(() => {
    if (isError) {
      notification.warning({title: t("unable_to_load_event")});
      router.push("/app/events");
    }
  }, [isError, notification, t, router]);

  const {metadata, isError: isMetadataError, error: metadataError} = useFormattedMetadata(
    metadataQuery.data,
    imageSelected,
    metadataOpen
  );

  useEffect(() => {
    if (isMetadataError) {
      notification.warning({title: metadataError?.message || t('unable_to_load_metadata')});
    }
  }, [isMetadataError, metadataError]);

  const imagesSize = useMemo(() => {
    return images?.reduce((acc, image) => acc + (image.original?.size ?? 0), 0) ?? 0
  }, [images])

  const handleDownloadImage = (image: ImageType) => {
    downloadImage(image.id)
  }

  const handleDeleteImage = (image: ImageType) => {
    try {
      removeImage.mutate(image.id, {
        onSuccess: (res) => {
          notification.success({title: res.message});
        }
      });
    } catch (err: any) {
      notification.warning({title: err?.message || t('unable_to_delete')});
    }
  }

  const handleOpenMetadata = (image: ImageType) => {
    seImageSelected(image);
    setMetadataOpen(true);
  }

  const handleOpenClients = (image: ImageType) => {
    seImageSelected(image);
    setClientsOpen(true);
  }

  if (loading || isError) return <Fallback/>

  const eventTitle = event?.title ? `${event?.type.name}: ${event.title}` : event?.type.name;

  return (
    <>
      <PageHeader title={t('event')}/>

      <Stack spacing={2.5}>
        <Card
          variant="outlined"
          sx={{
            borderRadius: '16px',
            backgroundColor: 'var(--st-bg-paper)',
            borderColor: 'var(--st-border)',
            boxShadow: 'var(--st-shadow-card)',
          }}
        >
          <CardContent sx={{p: {xs: 2, sm: 2.5}, '&:last-child': {pb: {xs: 2, sm: 2.5}}}}>
            <Box sx={{display: 'flex', flexDirection: {xs: 'column', md: 'row'}, gap: 2, alignItems: {md: 'center'}}}>
              <Box sx={{flex: 1, minWidth: 0}}>
                <Typography
                  variant="overline"
                  sx={{color: 'var(--st-text-sec)', fontWeight: 700, letterSpacing: 0, lineHeight: 1}}
                >
                  {t('event')}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    mt: 0.5,
                    color: 'var(--st-text)',
                    fontWeight: 800,
                    fontSize: {xs: '1rem', sm: '1.15rem'},
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: {sm: 'nowrap'},
                  }}
                >
                  {eventTitle}
                </Typography>
                {event?.contract && (
                  <Stack direction="row" spacing={0.75} sx={{mt: 1, flexWrap: 'wrap', rowGap: 0.75}}>
                    <Chip
                      icon={<DescriptionOutlinedIcon sx={{fontSize: '15px !important', color: 'inherit'}}/>}
                      label={`${event.contract.code} - ${event.contract.title}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        maxWidth: '100%',
                        borderRadius: '8px',
                        borderColor: 'var(--st-border)',
                        color: 'var(--st-text-sec)',
                        fontWeight: 600,
                        '& .MuiChip-label': {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        },
                      }}
                    />
                  </Stack>
                )}
              </Box>

              <Stack direction="row" sx={{gap: 1, flexWrap: 'wrap'}}>
                <SummaryChip icon={<PhotoLibraryOutlinedIcon/>} label={t('total_photos')} value={`${images?.length ?? 0}`}/>
                <SummaryChip icon={<StorageOutlinedIcon/>} label={t('size')} value={filesize(imagesSize ?? 0) as string}/>
                {event?.eventDate && (
                  <SummaryChip
                    icon={<EventOutlinedIcon/>}
                    label={t('event_date')}
                    value={dayjs(event.eventDate).format(defaultDateFormat)}
                  />
                )}
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {images?.length ? (
          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2}}>
            {images.map(image => (
              <PhotoCard
                key={image.id}
                image={image}
                onDownload={handleDownloadImage}
                onMetadata={handleOpenMetadata}
                onClients={handleOpenClients}
                onDelete={handleDeleteImage}
              />
            ))}
          </Box>
        ) : (
          <Card
            variant="outlined"
            sx={{
              borderRadius: '16px',
              backgroundColor: 'var(--st-bg-paper)',
              borderColor: 'var(--st-border)',
              textAlign: 'center',
              py: 7,
            }}
          >
            <CardContent>
              <AddPhotoAlternateOutlinedIcon sx={{fontSize: 56, color: 'var(--st-primary)', mb: 2}}/>
              <Typography sx={{color: 'var(--st-text)', fontWeight: 700, mb: 2}}>
                {t('no_photos_in_event_yet')}
              </Typography>
              <Button
                component={Link}
                href={`/app/send-photo/${event?.id}`}
                variant="contained"
                startIcon={<AddPhotoAlternateOutlinedIcon/>}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  backgroundColor: 'var(--st-primary)',
                  '&:hover': {backgroundColor: 'var(--st-primary-hover)'},
                }}
              >
                {t('add_photos')}
              </Button>
            </CardContent>
          </Card>
        )}

        <MetadataModal
          open={metadataOpen}
          onClose={() => setMetadataOpen(false)}
          metadata={metadata}
          loading={metadataQuery.isFetching}
        />

        <ClientsOnImageModal
          open={clientsOpen}
          onClose={() => setClientsOpen(false)}
          clients={clients ?? []}
          image={imageSelected}
        />
      </Stack>
    </>
  )
}

function SummaryChip({icon, label, value}: { icon: React.ReactElement; label: string; value: string }) {
  return (
    <Box
      sx={{
        minWidth: 132,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.5,
        py: 1,
        borderRadius: '12px',
        border: '1px solid var(--st-border)',
        backgroundColor: 'var(--st-bg-elevated)',
        '& .MuiSvgIcon-root': {fontSize: 19, color: 'var(--st-primary)'},
      }}
    >
      {icon}
      <Box sx={{minWidth: 0}}>
        <Typography variant="caption" sx={{display: 'block', color: 'var(--st-text-sec)', lineHeight: 1.1}}>
          {label}
        </Typography>
        <Typography noWrap sx={{color: 'var(--st-text)', fontWeight: 700, fontSize: '0.86rem'}}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}
