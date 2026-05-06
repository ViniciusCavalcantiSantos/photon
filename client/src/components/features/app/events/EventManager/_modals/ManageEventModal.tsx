import React, {useEffect, useState} from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import dayjs from 'dayjs';

import {useT} from '@/i18n/client';
import {useNotification} from '@/contexts/NotificationContext';
import Event from '@/types/Event';
import {useUser} from '@/contexts/UserContext';
import {useCreateEvent} from '@/lib/queries/events/useCreateEvent';
import {useUpdateEvent} from '@/lib/queries/events/useUpdateEvent';
import {fetchEventTypes} from '@/lib/api/events/fetchEventTypes';
import {useContracts} from '@/lib/queries/contracts/useContracts';

/* ── Shared sx tokens for the Stitch dark-friendly inputs ── */
const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: 'var(--st-bg-elevated)',
    color: 'var(--st-text)',
    '& fieldset': {borderColor: 'var(--st-border)'},
    '&:hover fieldset': {borderColor: 'var(--st-primary)'},
    '&.Mui-focused fieldset': {borderColor: 'var(--st-primary)'},
  },
  '& .MuiInputLabel-root': {color: 'var(--st-text-sec)'},
  '& .MuiInputLabel-root.Mui-focused': {color: 'var(--st-primary)'},
  '& .MuiInputBase-input': {color: 'var(--st-text)'},
  '& .MuiInputBase-input::placeholder': {color: 'var(--st-text-disabled)', opacity: 1},
  '& .MuiSvgIcon-root': {color: 'var(--st-text)'},
  '& .MuiInputAdornment-root .MuiSvgIcon-root': {color: 'var(--st-text-sec)'},
} as const;

const selectSx = {
  borderRadius: '12px',
  backgroundColor: 'var(--st-bg-elevated)',
  color: 'var(--st-text)',
  '& fieldset': {borderColor: 'var(--st-border)'},
  '&:hover fieldset': {borderColor: 'var(--st-primary)'},
  '&.Mui-focused fieldset': {borderColor: 'var(--st-primary)'},
  '& .MuiSvgIcon-root': {color: 'var(--st-text)'},
} as const;

const labelSx = {
  color: 'var(--st-text)',
  fontWeight: 600,
  fontSize: '0.85rem',
  mb: 0.75,
  '& .required-star': {
    color: 'var(--st-primary)',
    ml: 0.25,
  },
} as const;

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

const ManageEventModal: React.FC<ManageEventModalProps> = ({open, event, onCreate, onEdit, onCancel}) => {
  const {t} = useT();
  const notification = useNotification();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const {defaultDateFormat} = useUser();

  const isEditMode = !!event;

  /* ── State ── */
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [eventTypes, setEventTypes] = useState<{ id: number; name: string }[]>([]);

  // TODO: implementar pesquisa de contratos
  const {data: contractsData} = useContracts(undefined, 1, 300);

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
    // TODO: Implementar o useEventTypes
    const res = await fetchEventTypes(contractId);
    setEventTypes(res.eventTypes);
  };

  const handleContractChange = async (contractId: number) => {
    setForm(prev => ({...prev, contract: contractId, event_type: ''}));
    await loadEventTypes(contractId);
  };

  const handleClean = () => {
    setForm(emptyForm);
    setErrors({});
    setEventTypes([]);
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
      updateEvent.mutate({id: event.id, values}, {
        onSuccess: (res) => {
          notification.success({title: res.message});
          onEdit(res.event);
        },
      });
    } else {
      (createEvent as any).mutate(values, {
        onSuccess: (res: any) => {
          notification.success({title: res.message});
          onCreate(res.event);
        },
      });
    }

    handleClean();
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({...prev, [key]: value}));
    if (errors[key as keyof FormErrors]) {
      setErrors(prev => ({...prev, [key]: undefined}));
    }
  };

  /* ── Render ── */
  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            backgroundColor: 'var(--st-bg-paper)',
            border: '1px solid var(--st-border)',
            boxShadow: 'var(--st-shadow-elevated)',
            overflow: 'hidden',
          },
        },
        backdrop: {
          sx: {backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)'},
        },
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
        <Typography variant="h6" sx={{fontWeight: 700, color: 'var(--st-text)', fontSize: '1.15rem'}}>
          {isEditMode ? t('edit_event') : t('create_new_event')}
        </Typography>
        <IconButton
          onClick={handleCancel}
          size="small"
          sx={{
            color: 'var(--st-text-sec)',
            '&:hover': {backgroundColor: 'var(--st-primary-light)'},
          }}
        >
          <CloseIcon fontSize="small"/>
        </IconButton>
      </DialogTitle>

      {/* ── Body ── */}
      <DialogContent sx={{px: 3, pt: '12px !important', pb: 1}}>
        <Grid container spacing={2}>

          {/* Contract */}
          <Grid size={{xs: 12, sm: 6}}>
            <Typography sx={labelSx}>{t('contract')} <span className="required-star">*</span></Typography>
            <FormControl fullWidth size="small" error={!!errors.contract}>
              <Select
                value={form.contract}
                displayEmpty
                onChange={(e) => handleContractChange(e.target.value as number)}
                sx={selectSx}
                MenuProps={{
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
                }}
              >
                <MenuItem value="" disabled>
                  <Typography sx={{color: 'var(--st-text-disabled)', fontSize: '0.85rem'}}>
                    {t('select_contract')}
                  </Typography>
                </MenuItem>
                {contractsData?.contracts?.map(contract => (
                  <MenuItem key={contract.id} value={contract.id}>
                    {contract.code} – {contract.title}
                  </MenuItem>
                ))}
              </Select>
              {errors.contract && <FormHelperText>{errors.contract}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Event Type */}
          <Grid size={{xs: 12, sm: 6}}>
            <Typography sx={labelSx}>{t('event')} <span className="required-star">*</span></Typography>
            <FormControl fullWidth size="small" error={!!errors.event_type}>
              <Select
                value={form.event_type}
                displayEmpty
                disabled={eventTypes.length === 0}
                onChange={(e) => setField('event_type', e.target.value as number)}
                sx={selectSx}
                MenuProps={{
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
                }}
              >
                <MenuItem value="" disabled>
                  <Typography sx={{color: 'var(--st-text-disabled)', fontSize: '0.85rem'}}>
                    {t('select_event')}
                  </Typography>
                </MenuItem>
                {eventTypes.map(et => (
                  <MenuItem key={et.id} value={et.id}>{et.name}</MenuItem>
                ))}
              </Select>
              {errors.event_type && <FormHelperText>{errors.event_type}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Event Title */}
          <Grid size={12}>
            <Typography sx={labelSx}>{t('event_title')} <span className="required-star">*</span></Typography>
            <TextField
              fullWidth
              size="small"
              placeholder={t('event_title_ex')}
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              sx={inputSx}
            />
          </Grid>

          {/* Date */}
          <Grid size={{xs: 12, sm: 6}}>
            <Typography sx={labelSx}>{t('event_date')} <span className="required-star">*</span></Typography>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={form.event_date}
              onChange={(e) => setField('event_date', e.target.value)}
              error={!!errors.event_date}
              helperText={errors.event_date}
              sx={inputSx}
            />
          </Grid>

          {/* Time */}
          <Grid size={{xs: 12, sm: 6}}>
            <Typography sx={labelSx}>{t('event_hour_optional')}</Typography>
            <TextField
              fullWidth
              size="small"
              type="time"
              value={form.event_start_time}
              onChange={(e) => setField('event_start_time', e.target.value)}
              sx={inputSx}
            />
          </Grid>

          {/* Description */}
          <Grid size={12}>
            <Typography sx={labelSx}>{t('description_optional')}</Typography>
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={3}
              placeholder={t('description')}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              sx={inputSx}
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
                    '&.Mui-checked': {color: 'var(--st-primary)'},
                  }}
                />
              }
              label={
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                  <Typography sx={{color: 'var(--st-text)', fontSize: '0.85rem'}}>
                    {t('auto_assign_clients_to_event')}
                  </Typography>
                  <Tooltip title={t('auto_assign_clients_to_event_explanation')} arrow>
                    <InfoOutlinedIcon sx={{fontSize: 16, color: 'var(--st-primary)', cursor: 'pointer'}}/>
                  </Tooltip>
                </Box>
              }
              sx={{ml: 0, mt: -0.5}}
            />
          </Grid>
        </Grid>
      </DialogContent>

      {/* ── Footer ── */}
      <DialogActions sx={{px: 3, pb: 2.5, pt: 1.5, gap: 1.5}}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
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
        </Button>
        <Button
          onClick={handleOk}
          variant="contained"
          disabled={createEvent.isPending || updateEvent.isPending}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.85rem',
            px: 3,
            backgroundColor: 'var(--st-primary)',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'var(--st-primary-hover)',
              boxShadow: 'none',
            },
          }}
        >
          {isEditMode ? t('save_event') : t('create_new_event')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageEventModal;