'use client'

import React, { useState } from 'react';
import {
  Avatar,
  Box,
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

import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';

import Client from '@/types/Client';
import { useT } from '@/i18n/client';

interface ClientCardProps {
  client: Client;
  defaultDateFormat?: string;
  isSelected: boolean;
  selectMode: boolean;
  onToggleSelect: (id: number) => void;
  onAssign: (client: Client) => void;
  onUnassign: (client: Client) => void;
  onDelete: (client: Client) => void;
}

/** Derives a consistent accent color from the client's name */
function getClientAccent(name: string): { color: string; bgColor: string } {
  const palette: Array<{ color: string; bgColor: string }> = [
    { color: '#0C66E4', bgColor: 'rgba(12, 102, 228, 0.15)' },
    { color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.15)' },
    { color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.15)' },
    { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
    { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
    { color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.15)' },
    { color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.15)' },
    { color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.15)' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

export default function ClientCard({
  client,
  defaultDateFormat,
  isSelected,
  selectMode,
  onToggleSelect,
  onAssign,
  onUnassign,
  onDelete,
}: ClientCardProps) {
  const { t } = useT();
  const accent = getClientAccent(client.name);

  const initials = client.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  /* Three-dot menu state */
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleCardClick = () => {
    onToggleSelect(client.id);
  };

  return (
    <Card
      variant="outlined"
      onClick={handleCardClick}
      sx={{
        borderRadius: '16px',
        backgroundColor: isSelected ? 'var(--st-primary-light)' : 'var(--st-bg-paper)',
        borderColor: isSelected ? 'var(--st-primary)' : 'var(--st-border)',
        boxShadow: isSelected ? '0 0 0 2px var(--st-primary)' : 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        overflow: 'visible',
        '&:hover': {
          borderColor: 'var(--st-primary)',
          boxShadow: isSelected
            ? '0 0 0 2px var(--st-primary)'
            : 'var(--st-shadow-card)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
        <Box sx={{ display: 'flex', gap: 2 }}>

          {/* ── Avatar with select overlay ── */}
          <Box
            sx={{
              position: 'relative',
              flexShrink: 0,
              width: 52,
              height: 52,
              borderRadius: '50%',
              overflow: 'hidden',
            }}
          >
            {client.profile?.thumb ? (
              <Avatar
                src={client.profile.thumb}
                alt={client.name}
                sx={{ width: 52, height: 52 }}
              />
            ) : (
              <Avatar
                sx={{
                  width: 52,
                  height: 52,
                  backgroundColor: accent.bgColor,
                  color: accent.color,
                  fontWeight: 700,
                  fontSize: '1.1rem',
                }}
              >
                {initials}
              </Avatar>
            )}
            {/* Selection checkmark overlay — clipped by parent overflow:hidden */}
            {isSelected && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(12,102,228,0.75)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircleIcon sx={{ color: '#fff', fontSize: 26 }} />
              </Box>
            )}
          </Box>

          {/* ── Content ── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>

            {/* Row 1: Name + code chip */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: 'var(--st-text)',
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  }}
                >
                  {client.name}
                </Typography>
                {client.code && (
                  <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                    <BadgeIcon sx={{ fontSize: 13, color: 'var(--st-text-sec)' }} />
                    <Typography variant="caption" sx={{ color: 'var(--st-text-sec)' }}>
                      {client.code}
                    </Typography>
                  </Stack>
                )}
              </Box>

              {isSelected && (
                <Chip
                  label={t('selected')}
                  size="small"
                  sx={{
                    backgroundColor: 'var(--st-primary)',
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    height: 20,
                    flexShrink: 0,
                  }}
                />
              )}
            </Box>

            {/* Row 2: Meta info (birthdate · phone) */}
            <Stack
              direction="row"
              sx={{
                flexWrap: 'wrap',
                gap: { xs: 1, sm: 2 },
                rowGap: 0.75,
                mt: 0.75,
              }}
            >
              {client.birthdate && (
                <MetaItem
                  icon={<CalendarTodayIcon />}
                  text={dayjs(client.birthdate).format(defaultDateFormat)}
                />
              )}
              {client.phone && (
                <MetaItem icon={<PhoneIcon />} text={client.phone} />
              )}
              {!client.birthdate && !client.phone && (
                <MetaItem icon={<PersonIcon />} text={t('no_extra_info')} />
              )}
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
              onClick={(e) => e.stopPropagation()}
            >
              {/* Primary action: View */}
              <Link href={`/app/clients/manage/${client.id}`} style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 2,
                    py: 0.6,
                    borderRadius: '10px',
                    backgroundColor: 'var(--st-primary)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                    '&:hover': { backgroundColor: 'var(--st-primary-hover)' },
                  }}
                  component="span"
                >
                  <CollectionsOutlinedIcon sx={{ fontSize: '16px !important' }} />
                  {t('view')}
                </Box>
              </Link>

              {/* Three-dot menu */}
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <Tooltip title={t('more_options')} arrow>
                  <IconButton
                    size="small"
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{
                      color: 'var(--st-text-sec)',
                      '&:hover': { color: 'var(--st-text)', backgroundColor: 'var(--st-primary-light)' },
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Menu
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  slotProps={{
                    paper: {
                      sx: {
                        backgroundColor: 'var(--st-bg-elevated)',
                        borderRadius: '12px',
                        border: '1px solid var(--st-border)',
                        boxShadow: 'var(--st-shadow-elevated)',
                        minWidth: 170,
                      },
                    },
                  }}
                >
                  <MenuItem
                    component={Link}
                    href={`/app/clients/manage/${client.id}`}
                    onClick={() => setAnchorEl(null)}
                    sx={{
                      color: 'var(--st-text)',
                      fontSize: '0.85rem',
                      py: 1,
                      '&:hover': { backgroundColor: 'var(--st-primary-light)' },
                    }}
                  >
                    <ListItemIcon>
                      <EditOutlinedIcon fontSize="small" sx={{ color: 'var(--st-text-sec)' }} />
                    </ListItemIcon>
                    <ListItemText>{t('edit')}</ListItemText>
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null);
                      onAssign(client);
                    }}
                    sx={{
                      color: 'var(--st-text)',
                      fontSize: '0.85rem',
                      py: 1,
                      '&:hover': { backgroundColor: 'var(--st-primary-light)' },
                    }}
                  >
                    <ListItemIcon>
                      <LinkIcon fontSize="small" sx={{ color: 'var(--st-text-sec)' }} />
                    </ListItemIcon>
                    <ListItemText>{t('assign')}</ListItemText>
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null);
                      onUnassign(client);
                    }}
                    sx={{
                      color: 'var(--st-text)',
                      fontSize: '0.85rem',
                      py: 1,
                      '&:hover': { backgroundColor: 'var(--st-primary-light)' },
                    }}
                  >
                    <ListItemIcon>
                      <LinkOffIcon fontSize="small" sx={{ color: 'var(--st-text-sec)' }} />
                    </ListItemIcon>
                    <ListItemText>{t('unassign')}</ListItemText>
                  </MenuItem>

                  <Divider sx={{ borderColor: 'var(--st-divider)', my: '4px !important' }} />

                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null);
                      onDelete(client);
                    }}
                    sx={{
                      color: 'var(--st-error)',
                      fontSize: '0.85rem',
                      py: 1,
                      '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.08)' },
                    }}
                  >
                    <ListItemIcon>
                      <DeleteOutlinedIcon fontSize="small" sx={{ color: 'var(--st-error)' }} />
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

/* ── Small helper for meta-info items ── */
function MetaItem({ icon, text }: { icon: React.ReactElement; text: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        '& .MuiSvgIcon-root': { fontSize: 14, color: 'var(--st-text-sec)' },
      }}
    >
      {icon}
      <Typography
        variant="caption"
        noWrap
        sx={{ color: 'var(--st-text-sec)', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
      >
        {text}
      </Typography>
    </Box>
  );
}
