'use client'

import React, {useState} from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import dayjs from 'dayjs';
import {filesize} from 'filesize';

import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import StorageIcon from '@mui/icons-material/Storage';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SchoolIcon from '@mui/icons-material/School';
import CakeIcon from '@mui/icons-material/Cake';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';

import Event from '@/types/Event';
import {useT} from '@/i18n/client';

interface EventCardProps {
  event: Event;
  defaultDateFormat: string;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

/** Maps category slugs to icons + colour accents */
function getCategoryMeta(slug?: string) {
  switch (slug) {
    case 'casamento':
      return {icon: <FavoriteIcon fontSize="small"/>, color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.15)'};
    case 'formatura':
      return {icon: <SchoolIcon fontSize="small"/>, color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.15)'};
    case 'aniversario':
      return {icon: <CakeIcon fontSize="small"/>, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)'};
    default:
      return {icon: <CelebrationIcon fontSize="small"/>, color: '#0C66E4', bgColor: 'rgba(12, 102, 228, 0.15)'};
  }
}

export default function EventCard({event, defaultDateFormat, onEdit, onDelete}: EventCardProps) {
  const {t} = useT();
  const categoryMeta = getCategoryMeta(event.type?.category?.slug);

  const displayTitle = event.title
    ? `${event.type.name}: ${event.title}`
    : event.type.name;

  /* Three-dot menu state */
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '16px',
        backgroundColor: 'var(--st-bg-paper)',
        borderColor: 'var(--st-border)',
        transition: 'all 0.2s ease-in-out',
        overflow: 'visible',
        '&:hover': {
          borderColor: 'var(--st-primary)',
          boxShadow: 'var(--st-shadow-card)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <CardContent sx={{p: {xs: 2, sm: 2.5}, '&:last-child': {pb: {xs: 2, sm: 2.5}}}}>
        <Box sx={{display: 'flex', gap: 2}}>

          {/* ── Category Avatar ── */}
          <Avatar
            sx={{
              width: 48,
              height: 48,
              backgroundColor: categoryMeta.bgColor,
              color: categoryMeta.color,
              flexShrink: 0,
              display: {xs: 'none', sm: 'flex'},
            }}
          >
            {categoryMeta.icon}
          </Avatar>

          {/* ── Content ── */}
          <Box sx={{flex: 1, minWidth: 0}}>

            {/* Row 1: Title + Chips */}
            <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.75}}>
              {/* Mobile-only inline avatar */}
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: categoryMeta.bgColor,
                  color: categoryMeta.color,
                  flexShrink: 0,
                  display: {xs: 'flex', sm: 'none'},
                  '& .MuiSvgIcon-root': {fontSize: 16},
                }}
              >
                {categoryMeta.icon}
              </Avatar>

              <Box sx={{flex: 1, minWidth: 0}}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: 'var(--st-text)',
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: {xs: '0.9rem', sm: '1rem'},
                  }}
                >
                  {displayTitle}
                </Typography>

                {/* Chips row */}
                <Stack direction="row" spacing={0.75} sx={{mt: 0.5, flexWrap: 'wrap', rowGap: 0.5}}>
                  <Chip
                    label={event.type.category.name}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: categoryMeta.color,
                      backgroundColor: categoryMeta.bgColor,
                      borderRadius: '6px',
                    }}
                  />
                  {event.contract && (
                    <Chip
                      icon={<DescriptionOutlinedIcon sx={{fontSize: '14px !important', color: 'inherit'}}/>}
                      label={event.contract.code}
                      size="small"
                      variant="outlined"
                      sx={{
                        height: 22,
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        color: 'var(--st-text-sec)',
                        borderColor: 'var(--st-border)',
                        borderRadius: '6px',
                      }}
                    />
                  )}
                </Stack>
              </Box>
            </Box>

            {/* Row 2: Meta info (date · time · photos · size) */}
            <Stack
              direction="row"
              sx={{
                flexWrap: 'wrap',
                gap: {xs: 1, sm: 2},
                rowGap: 0.75,
                mt: 1,
              }}
            >
              <MetaItem icon={<EventIcon/>} text={dayjs(event.eventDate).format(defaultDateFormat)}/>
              {event.startTime && <MetaItem icon={<AccessTimeIcon/>} text={event.startTime}/>}
              <MetaItem icon={<PhotoLibraryIcon/>} text={`${event.totalImages}`}/>
              <MetaItem icon={<StorageIcon/>} text={filesize(event.totalSize) as string}/>
            </Stack>

            {/* Row 3: Action bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: 1.5,
                pt: 1.5,
                borderTop: '1px solid var(--st-divider)',
              }}
            >
              {/* Primary action: View Gallery */}
              <Button
                component={Link}
                href={`/app/events/${event.id}`}
                variant="contained"
                size="small"
                startIcon={<CollectionsOutlinedIcon sx={{fontSize: '16px !important'}}/>}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  px: 2,
                  py: 0.6,
                  backgroundColor: 'var(--st-primary)',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: 'var(--st-primary-hover)',
                    boxShadow: 'none',
                  },
                }}
              >
                {t('view')}
              </Button>

              {/* Secondary actions: Upload + More */}
              <Stack direction="row" spacing={0.5} sx={{alignItems: 'center'}}>
                <Tooltip title={t('send_photo')}>
                  <IconButton
                    component={Link}
                    href={`/app/send-photo/${event.id}`}
                    size="small"
                    sx={{
                      color: 'var(--st-text-sec)',
                      '&:hover': {color: 'var(--st-primary)', backgroundColor: 'var(--st-primary-light)'},
                    }}
                  >
                    <FileUploadOutlinedIcon fontSize="small"/>
                  </IconButton>
                </Tooltip>

                {/* Three-dot menu */}
                <IconButton
                  size="small"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{
                    color: 'var(--st-text-sec)',
                    '&:hover': {color: 'var(--st-text)', backgroundColor: 'var(--st-primary-light)'},
                  }}
                >
                  <MoreVertIcon fontSize="small"/>
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                  transformOrigin={{vertical: 'top', horizontal: 'right'}}
                  slotProps={{
                    paper: {
                      sx: {
                        backgroundColor: 'var(--st-bg-elevated)',
                        borderRadius: '12px',
                        border: '1px solid var(--st-border)',
                        boxShadow: 'var(--st-shadow-elevated)',
                        minWidth: 160,
                      },
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null);
                      onEdit(event);
                    }}
                    sx={{
                      color: 'var(--st-text)',
                      fontSize: '0.85rem',
                      py: 1,
                      '&:hover': {backgroundColor: 'var(--st-primary-light)'},
                    }}
                  >
                    <ListItemIcon>
                      <EditOutlinedIcon fontSize="small" sx={{color: 'var(--st-text-sec)'}}/>
                    </ListItemIcon>
                    <ListItemText>{t('edit')}</ListItemText>
                  </MenuItem>

                  <Divider sx={{borderColor: 'var(--st-divider)', my: '4px !important'}}/>

                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null);
                      onDelete(event);
                    }}
                    sx={{
                      color: 'var(--st-error)',
                      fontSize: '0.85rem',
                      py: 1,
                      '&:hover': {backgroundColor: 'rgba(239, 68, 68, 0.08)'},
                    }}
                  >
                    <ListItemIcon>
                      <DeleteOutlinedIcon fontSize="small" sx={{color: 'var(--st-error)'}}/>
                    </ListItemIcon>
                    <ListItemText>{t('delete')}</ListItemText>
                  </MenuItem>
                </Menu>
              </Stack>
            </Box>

          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

/* ── Small helper for the meta-info items ── */
function MetaItem({icon, text}: { icon: React.ReactElement; text: string }) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, '& .MuiSvgIcon-root': {fontSize: 15, color: 'var(--st-text-sec)'}}}>
      {icon}
      <Typography
        variant="caption"
        noWrap
        sx={{color: 'var(--st-text-sec)', fontSize: {xs: '0.7rem', sm: '0.75rem'}}}
      >
        {text}
      </Typography>
    </Box>
  );
}
