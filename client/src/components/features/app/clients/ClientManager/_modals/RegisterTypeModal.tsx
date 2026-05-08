import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/client";

interface RegisterTypeModalProps {
  open: boolean;
  onCancel: () => void;
  onGenerateLink: () => void;
}

const dialogPaperSx = {
  backgroundColor: "var(--st-bg-paper)",
  backgroundImage: "none",
  border: "1px solid var(--st-border)",
  borderRadius: "16px",
  color: "var(--st-text)",
  minWidth: { xs: "calc(100vw - 32px)", sm: 420 },
} as const;

const selectSx = {
  borderRadius: "12px",
  backgroundColor: "var(--st-bg-elevated)",
  color: "var(--st-text)",
  "& fieldset": { borderColor: "var(--st-border)" },
  "&:hover fieldset": { borderColor: "var(--st-primary)" },
  "&.Mui-focused fieldset": { borderColor: "var(--st-primary)" },
  "& .MuiSvgIcon-root": { color: "var(--st-text)" },
} as const;

const menuPropsSx = {
  slotProps: {
    paper: {
      sx: {
        backgroundColor: "var(--st-bg-elevated)",
        border: "1px solid var(--st-border)",
        borderRadius: "12px",
        "& .MuiMenuItem-root": {
          color: "var(--st-text)",
          "&:hover": { backgroundColor: "var(--st-primary-light)" },
          "&.Mui-selected": { backgroundColor: "var(--st-primary-light)" },
        },
      },
    },
  },
};

export default function RegisterTypeModal({ open, onCancel, onGenerateLink }: RegisterTypeModalProps) {
  const { t } = useT();
  const router = useRouter();
  const [registerType, setRegisterType] = useState("");
  const [error, setError] = useState(false);

  const handleOk = () => {
    if (!registerType) {
      setError(true);
      return;
    }
    setError(false);
    if (registerType === "manual") {
      router.push("/app/clients/manage/new");
    } else if (registerType === "image_name") {
      router.push("/app/clients/create/by-image-name");
    } else {
      onCancel();
      onGenerateLink();
    }
  };

  const handleClose = () => {
    setRegisterType("");
    setError(false);
    onCancel();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: { sx: dialogPaperSx },
        backdrop: { sx: { backgroundColor: "var(--st-bg-mask)" } },
      }}
    >
      <DialogTitle sx={{ color: "var(--st-text)", fontWeight: 700, pb: 1 }}>
        {t("choose_register_type")}
      </DialogTitle>
      <Divider sx={{ borderColor: "var(--st-divider)" }} />

      <DialogContent sx={{ pt: 2.5 }}>
        <Box>
          <Typography sx={{ color: "var(--st-text)", fontWeight: 600, fontSize: "0.85rem", mb: 0.75 }}>
            {t("register_type")}
            <span style={{ color: "var(--st-primary)", marginLeft: 2 }}>*</span>
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              displayEmpty
              value={registerType}
              onChange={(e) => { setRegisterType(e.target.value); setError(false); }}
              sx={selectSx}
              MenuProps={menuPropsSx}
            >
              <MenuItem value="" disabled>
                <Typography sx={{ color: "var(--st-text-disabled)", fontSize: "0.875rem" }}>
                  {t("select_a_register_type")}
                </Typography>
              </MenuItem>
              <MenuItem value="manual">{t("manual_registration")}</MenuItem>
              <MenuItem value="image_name">{t("by_image_name")}</MenuItem>
              <MenuItem value="link">{t("by_link")}</MenuItem>
            </Select>
          </FormControl>
          {error && (
            <Typography variant="caption" sx={{ color: "var(--st-error)", mt: 0.5, display: "block" }}>
              {t("select_a_register_type")}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <Divider sx={{ borderColor: "var(--st-divider)" }} />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            color: "var(--st-text-sec)",
            "&:hover": { backgroundColor: "var(--st-bg-elevated)" },
          }}
        >
          {t("cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleOk}
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            backgroundColor: "var(--st-primary)",
            "&:hover": { backgroundColor: "var(--st-primary-hover)" },
          }}
        >
          {t("go")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}