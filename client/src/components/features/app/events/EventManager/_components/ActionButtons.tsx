'use client'

import React from 'react';
import {IconButton, Stack, Tooltip} from '@mui/material';
import Link from 'next/link';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import {useT} from '@/i18n/client';
import Event from '@/types/Event';

interface ActionButtonsProps {
  record: Event,
  onEdit: (event: Event) => void,
  onDelete: (event: Event) => void
}

export default function ActionButtons({record, onEdit, onDelete}: ActionButtonsProps) {
  const {t} = useT()

  return (
    <Stack direction="row" spacing={0.5} sx={{justifyContent: 'center'}}>
      <Tooltip title={t('view')}>
        <IconButton
          component={Link}
          href={`/app/events/${record.id}`}
          size="small"
          sx={{
            color: 'var(--st-text-sec)',
            '&:hover': {color: 'var(--st-primary)', backgroundColor: 'var(--st-primary-light)'},
          }}
        >
          <VisibilityOutlinedIcon fontSize="small"/>
        </IconButton>
      </Tooltip>

      <Tooltip title={t('edit')}>
        <IconButton
          size="small"
          onClick={() => onEdit(record)}
          sx={{
            color: 'var(--st-text-sec)',
            '&:hover': {color: 'var(--st-primary)', backgroundColor: 'var(--st-primary-light)'},
          }}
        >
          <EditOutlinedIcon fontSize="small"/>
        </IconButton>
      </Tooltip>

      <Tooltip title={t('send_photo')}>
        <IconButton
          component={Link}
          href={`/app/send-photo/${record.id}`}
          size="small"
          sx={{
            color: 'var(--st-text-sec)',
            '&:hover': {color: 'var(--st-primary)', backgroundColor: 'var(--st-primary-light)'},
          }}
        >
          <CloudUploadOutlinedIcon fontSize="small"/>
        </IconButton>
      </Tooltip>

      <Tooltip title={t('delete')}>
        <IconButton
          size="small"
          onClick={() => onDelete(record)}
          sx={{
            color: 'var(--st-text-sec)',
            '&:hover': {color: 'var(--st-error)', backgroundColor: 'rgba(239, 68, 68, 0.12)'},
          }}
        >
          <DeleteOutlineIcon fontSize="small"/>
        </IconButton>
      </Tooltip>
    </Stack>
  )
}