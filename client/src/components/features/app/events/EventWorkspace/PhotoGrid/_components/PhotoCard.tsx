'use client'

import React, {useState} from "react";
import {
  Badge,
  Box,
  Card,
  CardContent,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import InsertPhotoOutlinedIcon from "@mui/icons-material/InsertPhotoOutlined";
import dayjs from "dayjs";
import {filesize} from "filesize";

import {useT} from "@/i18n/client";
import {default as ImageType} from "@/types/Image";
import {useUser} from "@/contexts/UserContext";
import ImagePreview from "@/components/ui/ImagePreview";

interface PhotoCardProps {
  image: ImageType
  onDownload: (image: ImageType) => void
  onMetadata: (image: ImageType) => void
  onClients: (image: ImageType) => void
  onDelete: (image: ImageType) => void
}

export default function PhotoCard({image, onDownload, onMetadata, onClients, onDelete}: PhotoCardProps) {
  const {t} = useT()
  const {defaultDateFormat} = useUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const imageSrc = image.urls?.web ?? image.urls?.original ?? image.url;
  const imageName = image.original?.name ?? image.id;
  const imageSize = image.original?.size ?? image.size ?? 0;
  const clientsCount = image.clientsOnImageCount ?? 0;

  const closeMenu = () => setAnchorEl(null);

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderRadius: '16px',
        backgroundColor: 'var(--st-bg-paper)',
        borderColor: 'var(--st-border)',
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'var(--st-primary)',
          boxShadow: 'var(--st-shadow-card)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '4 / 3',
          backgroundColor: 'var(--st-bg-elevated)',
          borderBottom: '1px solid var(--st-divider)',
          overflow: 'hidden',
        }}
      >
        {imageSrc ? (
          <ImagePreview src={imageSrc} alt={imageName} title={imageName}/>
        ) : (
          <Box sx={{height: '100%', display: 'grid', placeItems: 'center', color: 'var(--st-text-sec)'}}>
            <InsertPhotoOutlinedIcon sx={{fontSize: 48}}/>
          </Box>
        )}
      </Box>

      <CardContent sx={{p: 2, '&:last-child': {pb: 2}}}>
        <Typography
          title={imageName}
          sx={{
            color: 'var(--st-text)',
            fontWeight: 700,
            lineHeight: 1.3,
            mb: 1.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {imageName}
        </Typography>

        <Stack direction="row" sx={{flexWrap: 'wrap', gap: 1.5, rowGap: 0.75}}>
          <MetaText label={t('size')} value={filesize(imageSize) as string}/>
          <MetaText label={t('upload_date')} value={dayjs(image.createdAt).format(defaultDateFormat)}/>
        </Stack>

        <Divider sx={{borderColor: 'var(--st-divider)', my: 1.5}}/>

        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Tooltip title={t('clients_in_image')} arrow>
            <IconButton
              onClick={() => onClients(image)}
              aria-label={t('clients_in_image')}
              size="small"
              sx={{
                color: 'var(--st-text-sec)',
                '&:hover': {color: 'var(--st-primary)', backgroundColor: 'var(--st-primary-light)'},
              }}
            >
              <Badge
                badgeContent={clientsCount}
                color="primary"
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
                <PeopleAltOutlinedIcon fontSize="small"/>
              </Badge>
            </IconButton>
          </Tooltip>

          <Stack direction="row" spacing={0.5}>
            <Tooltip title={t('download')} arrow>
              <IconButton
                onClick={() => onDownload(image)}
                aria-label={t('download')}
                size="small"
                sx={{
                  color: 'var(--st-text-sec)',
                  '&:hover': {color: 'var(--st-primary)', backgroundColor: 'var(--st-primary-light)'},
                }}
              >
                <DownloadOutlinedIcon fontSize="small"/>
              </IconButton>
            </Tooltip>

            <IconButton
              onClick={(event) => setAnchorEl(event.currentTarget)}
              aria-label={t('options')}
              size="small"
              sx={{
                color: 'var(--st-text-sec)',
                '&:hover': {color: 'var(--st-text)', backgroundColor: 'var(--st-primary-light)'},
              }}
            >
              <MoreVertIcon fontSize="small"/>
            </IconButton>
          </Stack>

          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={closeMenu}
            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            transformOrigin={{vertical: 'top', horizontal: 'right'}}
            slotProps={{
              paper: {
                sx: {
                  backgroundColor: 'var(--st-bg-elevated)',
                  borderRadius: '12px',
                  border: '1px solid var(--st-border)',
                  boxShadow: 'var(--st-shadow-elevated)',
                  minWidth: 180,
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                closeMenu();
                onMetadata(image);
              }}
              sx={{
                color: 'var(--st-text)',
                fontSize: '0.85rem',
                py: 1,
                '&:hover': {backgroundColor: 'var(--st-primary-light)'},
              }}
            >
              <ListItemIcon>
                <InfoOutlinedIcon fontSize="small" sx={{color: 'var(--st-text-sec)'}}/>
              </ListItemIcon>
              <ListItemText>{t('view_metadata')}</ListItemText>
            </MenuItem>

            <Divider sx={{borderColor: 'var(--st-divider)', my: '4px !important'}}/>

            <MenuItem
              onClick={() => {
                closeMenu();
                onDelete(image);
              }}
              sx={{
                color: 'var(--st-error)',
                fontSize: '0.85rem',
                py: 1,
                '&:hover': {backgroundColor: 'rgba(239, 68, 68, 0.08)'},
              }}
            >
              <ListItemIcon>
                <DeleteOutlineOutlinedIcon fontSize="small" sx={{color: 'var(--st-error)'}}/>
              </ListItemIcon>
              <ListItemText>{t('delete')}</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </CardContent>
    </Card>
  )
}

function MetaText({label, value}: { label: string; value: string }) {
  return (
    <Box sx={{minWidth: 0}}>
      <Typography variant="caption" sx={{display: 'block', color: 'var(--st-text-sec)', lineHeight: 1.1}}>
        {label}
      </Typography>
      <Typography noWrap sx={{color: 'var(--st-text)', fontSize: '0.82rem', fontWeight: 600}}>
        {value}
      </Typography>
    </Box>
  );
}
