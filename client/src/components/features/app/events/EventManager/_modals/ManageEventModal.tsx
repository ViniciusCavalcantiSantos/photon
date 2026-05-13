import React, { useEffect, useState } from 'react';
import {
  Box,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { MenuItem } from '@mui/material';

import { useT } from '@/i18n/client';
import { useNotification } from '@/contexts/NotificationContext';
import Event from '@/types/Event';
import { useUser } from '@/contexts/UserContext';
import { useCreateEvent } from '@/lib/queries/events/useCreateEvent';
import { useUpdateEvent } from '@/lib/queries/events/useUpdateEvent';
import { fetchEventTypes } from '@/lib/api/events/fetchEventTypes';
import { useContracts } from '@/lib/queries/contracts/useContracts';
import StyledDialog from '@/components/ui/StyledDialog';
import StyledTextField from '@/components/ui/StyledTextField';
import StyledSelect from '@/components/ui/StyledSelect';
import FieldLabel from '@/components/ui/FieldLabel';
import DialogCancelButton from '@/components/ui/DialogCancelButton';
import DialogPrimaryButton from '@/components/ui/DialogPrimaryButton';

/* ─────────────────────────────────────────── */

interface ManageEventModalProps {
  open: boolean;
  event?: Event;
  onCreate: (values: Event) => void;
  onEdit: (values: Event) => void;
  onCancel: () => void;
}

interface FormState {
  contract: number | '';
  event_type: number | '';
  title: string;
  event_date: string;
  event_start_time: string;
  description: string;
  auto_assign_clients: boolean;
}

interface FormErrors {
  contract?: string;
  event_type?: string;
  title?: string;
  event_date?: string;
}

const emptyForm: FormState = {
  contract: '',
  event_type: '',
  title: '',
  event_date: '',
  event_start_time: '',
  description: '',
  auto_assign_clients: false,
};

/**
 * Extends the base select styling with disabled-state appearance used
 * specifically for the event-type selector (which disables while loading).
 */
const disabledSelectSx = {
  '&.Mui-disabled': {
    backgroundColor: 'rgba(156, 163, 175, 0.08)',
    color: 'var(--st-text-sec)',
    cursor: 'not-allowed',
    '& fieldset': { borderColor: 'var(--st-border)', borderStyle: 'dashed' },
    '& .MuiSvgIcon-root': { color: 'var(--st-text-sec)' },
  },
  '& .MuiSelect-select.Mui-disabled': {
    WebkitTextFillColor: 'var(--st-text-sec)',
    color: 'var(--st-text-sec)',
  },
} as const;

const ManageEventModal: React.FC<ManageEventModalProps> = ({ open, event, onCreate, onEdit, onCancel }) => {
  const { t } = useT();
  const notification = useNotification();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const { defaultDateFormat } = useUser();

  const isEditMode = !!event;

  /* ── State ── */
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [eventTypes, setEventTypes] = useState<{ id: number; name: string }[]>([]);
  const [isLoadingEventTypes, setIsLoadingEventTypes] = useState(false);

  // TODO: implementar pesquisa de contratos
  const { data: contractsData } = useContracts(undefined, 1, 300);

  /* ── Populate on open ── */
  useEffect(() => {
    const populate = async () => {
      if (isEditMode && event) {
        setForm({
          contract: event.contractId,
          event_type: event.type.id,
          title: event.title ?? '',
          event_date: event.eventDate,
          event_start_time: event.startTime ?? '',
          description: event.description ?? '',
          auto_assign_clients: event.autoAssignClients,
        });
        await loadEventTypes(event.contractId);
      } else {
        handleClean();
      }
    };

    if (open) {
      populate();
    }
  }, [open, event, contractsData, isEditMode]);

  /* ── Helpers ── */
  const loadEventTypes = async (contractId: number) => {
    setEventTypes([]);
    setIsLoadingEventTypes(true);
    try {
      // TODO: Implementar o useEventTypes
      const res = await fetchEventTypes(contractId);
      setEventTypes(res.eventTypes);
    } finally {
      setIsLoadingEventTypes(false);
    }
  };

  const handleContractChange = async (contractId: number) => {
    setForm(prev => ({ ...prev, contract: contractId, event_type: '' }));
    await loadEventTypes(contractId);
  };

  const handleClean = () => {
    setForm(emptyForm);
    setErrors({});
    setEventTypes([]);
    setIsLoadingEventTypes(false);
  };

  const handleCancel = () => {
    handleClean();
    onCancel();
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.contract) errs.contract = t('select_contract') + '!';
    if (!form.event_type) errs.event_type = t('select_event');
    if (!form.title.trim()) errs.title = t('enter_title');
    if (!form.event_date) errs.event_date = t('enter_date');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOk = () => {
    if (!validate()) return;

    const values: Record<string, any> = {
      contract: form.contract,
      event_type: form.event_type,
      title: form.title,
      event_date: form.event_date,
      event_start_time: form.event_start_time || undefined,
      description: form.description || undefined,
      auto_assign_clients: form.auto_assign_clients,
    };

    if (isEditMode) {
      updateEvent.mutate({ id: event.id, values }, {
        onSuccess: (res) => {
          notification.success({ title: res.message });
          onEdit(res.event);
        },
      });
    } else {
      (createEvent as any).mutate(values, {
        onSuccess: (res: any) => {
          notification.success({ title: res.message });
          onCreate(res.event);
        },
      });
    }

    handleClean();
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  /* ── Render ── */
  return (
    <StyledDialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      paperSx={{
        borderRadius: '20px',
        boxShadow: 'var(--st-shadow-elevated)',
        overflow: 'hidden',
      }}
      backdropSx={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* ── Header ── */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          pt: 2.5,
          px: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--st-text)', fontSize: '1.15rem' }}>
          {isEditMode ? t('edit_event') : t('create_new_event')}
        </Typography>
        <IconButton
          onClick={handleCancel}
          size="small"
          sx={{
            color: 'var(--st-text-sec)',
            '&:hover': { backgroundColor: 'var(--st-primary-light)' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* ── Body ── */}
      <DialogContent sx={{ px: 3, pt: '12px !important', pb: 1 }}>
        <Grid container spacing={2}>

          {/* Contract */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel required>{t('contract')}</FieldLabel>
            <StyledSelect
              fullWidth
              value={form.contract}
              displayEmpty
              error={!!errors.contract}
              helperText={errors.contract}
              onChange={(e) => handleContractChange(e.target.value as number)}
            >
              <MenuItem value="" disabled>
                <Typography sx={{ color: 'var(--st-text-disabled)', fontSize: '0.85rem' }}>
                  {t('select_contract')}
                </Typography>
              </MenuItem>
              {contractsData?.contracts?.map(contract => (
                <MenuItem key={contract.id} value={contract.id}>
                  {contract.code} – {contract.title}
                </MenuItem>
              ))}
            </StyledSelect>
          </Grid>

          {/* Event Type */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel required>{t('event')}</FieldLabel>
            <StyledSelect
              fullWidth
              value={form.event_type}
              displayEmpty
              disabled={isLoadingEventTypes || eventTypes.length === 0}
              error={!!errors.event_type}
              helperText={
                errors.event_type ? errors.event_type
                : isLoadingEventTypes ? (
                  <FormHelperText component="span" sx={{ color: 'var(--st-text-sec)', m: 0 }}>
                    {t('loading_event_types')}
                  </FormHelperText>
                ) : eventTypes.length === 0 ? (
                  <FormHelperText component="span" sx={{ color: 'var(--st-text-sec)', m: 0 }}>
                    {form.contract ? t('no_event_types_available') : t('select_contract_first')}
                  </FormHelperText>
                ) : null
              }
              onChange={(e) => setField('event_type', e.target.value as number)}
              sx={disabledSelectSx}
            >
              <MenuItem value="" disabled>
                <Typography sx={{ color: 'var(--st-text-disabled)', fontSize: '0.85rem' }}>
                  {t('select_event')}
                </Typography>
              </MenuItem>
              {eventTypes.map(et => (
                <MenuItem key={et.id} value={et.id}>{et.name}</MenuItem>
              ))}
            </StyledSelect>
          </Grid>

          {/* Event Title */}
          <Grid size={12}>
            <FieldLabel required>{t('event_title')}</FieldLabel>
            <StyledTextField
              fullWidth
              size="small"
              placeholder={t('event_title_ex')}
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
            />
          </Grid>

          {/* Date */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel required>{t('event_date')}</FieldLabel>
            <StyledTextField
              fullWidth
              size="small"
              type="date"
              value={form.event_date}
              onChange={(e) => setField('event_date', e.target.value)}
              error={!!errors.event_date}
              helperText={errors.event_date}
            />
          </Grid>

          {/* Time */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel>{t('event_hour_optional')}</FieldLabel>
            <StyledTextField
              fullWidth
              size="small"
              type="time"
              value={form.event_start_time}
              onChange={(e) => setField('event_start_time', e.target.value)}
            />
          </Grid>

          {/* Description */}
          <Grid size={12}>
            <FieldLabel>{t('description_optional')}</FieldLabel>
            <StyledTextField
              fullWidth
              size="small"
              multiline
              minRows={3}
              placeholder={t('description')}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
            />
          </Grid>

          {/* Auto-assign checkbox */}
          <Grid size={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.auto_assign_clients}
                  onChange={(e) => setField('auto_assign_clients', e.target.checked)}
                  sx={{
                    color: 'var(--st-text-sec)',
                    '&.Mui-checked': { color: 'var(--st-primary)' },
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ color: 'var(--st-text)', fontSize: '0.85rem' }}>
                    {t('auto_assign_clients_to_event')}
                  </Typography>
                  <Tooltip title={t('auto_assign_clients_to_event_explanation')} arrow>
                    <InfoOutlinedIcon sx={{ fontSize: 16, color: 'var(--st-primary)', cursor: 'pointer' }} />
                  </Tooltip>
                </Box>
              }
              sx={{ ml: 0, mt: -0.5 }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      {/* ── Footer ── */}
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1.5 }}>
        <DialogCancelButton
          onClick={handleCancel}
          variant="outlined"
          sx={{
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '0.85rem',
            px: 3,
            borderColor: 'var(--st-border)',
            color: 'var(--st-text)',
            '&:hover': {
              borderColor: 'var(--st-primary)',
              backgroundColor: 'var(--st-primary-light)',
            },
          }}
        >
          {t('cancel')}
        </DialogCancelButton>
        <DialogPrimaryButton
          onClick={handleOk}
          disabled={createEvent.isPending || updateEvent.isPending}
          sx={{
            borderRadius: '12px',
            fontSize: '0.85rem',
            px: 3,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          }}
        >
          {isEditMode ? t('save_event') : t('create_new_event')}
        </DialogPrimaryButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default ManageEventModal;
