import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import {useT} from "@/i18n/client";

type MetaItem = { label: string; value: string };

type Props = {
  open: boolean;
  onClose: () => void;
  metadata: MetaItem[];
  loading: boolean
};

export function MetadataModal({open, onClose, metadata, loading}: Props) {
  const {t} = useT()

  return (
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
          <InfoOutlinedIcon fontSize="small"/>
        </Box>
        <Typography variant="h6" sx={{flex: 1, color: 'var(--st-text)', fontWeight: 700, fontSize: '1.05rem'}}>
          {t('metadata')}
        </Typography>
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
        {loading ? (
          <Box sx={{display: 'grid', gap: 0.75}}>
            {[...Array(8)].map((_, index) => (
              <Skeleton key={index} variant="rounded" height={48} sx={{borderRadius: '10px', bgcolor: 'var(--st-bg-elevated)'}}/>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              overflow: 'hidden',
              border: '1px solid var(--st-border)',
              borderRadius: '12px',
              backgroundColor: 'var(--st-bg-elevated)',
            }}
          >
            {metadata.map((meta, index) => (
              <Box
                key={`${meta.label}-${meta.value}`}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {xs: '1fr', sm: 'minmax(160px, 0.35fr) 1fr'},
                  gap: {xs: 0.25, sm: 2},
                  px: 2,
                  py: 1.5,
                  borderTop: index === 0 ? 0 : '1px solid var(--st-divider)',
                }}
              >
                <Typography sx={{color: 'var(--st-text-sec)', fontWeight: 700, fontSize: '0.82rem'}}>
                  {meta.label}
                </Typography>
                <Typography sx={{color: 'var(--st-text)', fontSize: '0.88rem', overflowWrap: 'anywhere'}}>
                  {meta.value}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{px: 3, pb: 2.5, pt: 0}}>
        <Button
          onClick={onClose}
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
  );
}
