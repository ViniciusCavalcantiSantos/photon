import React, {useState} from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import {useT} from "@/i18n/client";
import Client from "@/types/Client";
import ImageType from "@/types/Image";
import {useClientCrop} from "@/lib/queries/images/useClientCrop";

type Props = {
  open: boolean;
  onClose: () => void;
  clients: Client[];
  image: ImageType | null
};

export function ClientsOnImageModal({open, onClose, clients, image}: Props) {
  const {t} = useT()

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);

  const {data: cropData, isSuccess: cropSuccess} = useClientCrop(image?.id, selectedClient?.id, cropModalOpen);

  const handleOpenCrop = (client: Client) => {
    setSelectedClient(client);
    setCropModalOpen(true);
  };

  const handleCloseCrop = () => {
    setCropModalOpen(false);
  };

  const viewBoxWidth = image?.original?.width ?? 1000;
  const viewBoxHeight = image?.original?.height ?? 1000;
  const imageSrc = image?.urls?.web ?? image?.urls?.original ?? image?.url;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              borderRadius: '16px',
              backgroundColor: 'var(--st-bg-paper)',
              border: '1px solid var(--st-border)',
              boxShadow: 'var(--st-shadow-elevated)',
              color: 'var(--st-text)',
            },
          },
          backdrop: {
            sx: {backgroundColor: 'rgba(0, 0, 0, 0.65)'},
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            borderBottom: '1px solid var(--st-divider)',
          }}
        >
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
            <PeopleAltOutlinedIcon fontSize="small"/>
          </Box>
          <Box sx={{flex: 1, minWidth: 0}}>
            <Typography variant="h6" sx={{color: 'var(--st-text)', fontWeight: 700, fontSize: '1.05rem'}}>
              {t('clients_on_image')}
            </Typography>
            <Typography variant="caption" sx={{color: 'var(--st-text-sec)'}}>
              {clients.length} {t('clients')}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            aria-label={t('close')}
            size="small"
            sx={{
              color: 'var(--st-text-sec)',
              '&:hover': {backgroundColor: 'var(--st-primary-light)', color: 'var(--st-text)'},
            }}
          >
            <CloseIcon fontSize="small"/>
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{px: 3, py: 2.5}}>
          {clients.length > 0 ? (
            <List disablePadding sx={{display: 'grid', gap: 1}}>
              {clients.map((client) => (
                <ListItem
                  key={client.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleOpenCrop(client)}
                      aria-label={t('view')}
                      sx={{
                        color: 'var(--st-text-sec)',
                        '&:hover': {color: 'var(--st-primary)', backgroundColor: 'var(--st-primary-light)'},
                      }}
                    >
                      <VisibilityOutlinedIcon fontSize="small"/>
                    </IconButton>
                  }
                  sx={{
                    borderRadius: '12px',
                    border: '1px solid var(--st-border)',
                    backgroundColor: 'var(--st-bg-elevated)',
                    pr: 7,
                    transition: 'border-color 0.2s ease, background-color 0.2s ease',
                    '&:hover': {
                      borderColor: 'var(--st-primary)',
                      backgroundColor: 'var(--st-primary-light)',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={client.profile.thumb} alt={client.name} sx={{width: 40, height: 40}}/>
                  </ListItemAvatar>
                  <ListItemText
                    primary={client.name}
                    secondary={client.code}
                    slotProps={{
                      primary: {
                        sx: {
                          color: 'var(--st-text)',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        },
                      },
                      secondary: {
                        sx: {
                          color: 'var(--st-text-sec)',
                          fontSize: '0.78rem',
                        },
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{py: 6, textAlign: 'center'}}>
              <PeopleAltOutlinedIcon sx={{fontSize: 48, color: 'var(--st-text-sec)', mb: 1.5}}/>
              <Typography sx={{color: 'var(--st-text)', fontWeight: 700}}>
                {t('no_client_found')}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={cropModalOpen}
        onClose={handleCloseCrop}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              borderRadius: '16px',
              backgroundColor: 'var(--st-bg-paper)',
              border: '1px solid var(--st-border)',
              boxShadow: 'var(--st-shadow-elevated)',
              color: 'var(--st-text)',
            },
          },
          backdrop: {
            sx: {backgroundColor: 'rgba(0, 0, 0, 0.72)'},
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderBottom: '1px solid var(--st-divider)',
          }}
        >
          <Typography variant="h6" sx={{flex: 1, color: 'var(--st-text)', fontWeight: 700, fontSize: '1.05rem'}}>
            {selectedClient?.name}
          </Typography>
          <IconButton
            onClick={handleCloseCrop}
            aria-label={t('close')}
            size="small"
            sx={{
              color: 'var(--st-text-sec)',
              '&:hover': {backgroundColor: 'var(--st-primary-light)', color: 'var(--st-text)'},
            }}
          >
            <CloseIcon fontSize="small"/>
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{p: 2.5}}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 260,
              backgroundColor: 'var(--st-bg-elevated)',
              border: '1px solid var(--st-border)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            {imageSrc ? (
              <Box sx={{position: 'relative', display: 'inline-block', maxWidth: '100%'}}>
                <Box
                  component="img"
                  src={imageSrc}
                  alt={image?.original?.name ?? selectedClient?.name ?? ''}
                  sx={{
                    display: 'block',
                    maxWidth: '100%',
                    maxHeight: '65vh',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    userSelect: 'none',
                  }}
                />

                <Box
                  component="svg"
                  sx={{position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none'}}
                  viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                >
                  {cropSuccess && cropData && (
                    <rect
                      x={cropData.boxX}
                      y={cropData.boxY}
                      width={cropData.boxW}
                      height={cropData.boxH}
                      fill="none"
                      stroke="var(--st-success)"
                      strokeWidth={Math.max(viewBoxWidth * 0.004, 2)}
                      style={{filter: 'drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.9))'}}
                    />
                  )}
                </Box>
              </Box>
            ) : (
              <Typography sx={{color: 'var(--st-text-sec)', p: 5}}>
                {t('unable_to_get_image')}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{px: 3, pb: 2.5, pt: 0}}>
          <Button
            onClick={handleCloseCrop}
            variant="contained"
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              backgroundColor: 'var(--st-primary)',
              '&:hover': {backgroundColor: 'var(--st-primary-hover)'},
            }}
          >
            {t('close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
