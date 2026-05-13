import React, { useState } from "react";
import { Box, Divider, MenuItem, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/client";
import StyledDialog from "@/components/ui/StyledDialog";
import StyledSelect from "@/components/ui/StyledSelect";
import FieldLabel from "@/components/ui/FieldLabel";
import DialogCancelButton from "@/components/ui/DialogCancelButton";
import DialogPrimaryButton from "@/components/ui/DialogPrimaryButton";

interface RegisterTypeModalProps {
  open: boolean;
  onCancel: () => void;
  onGenerateLink: () => void;
}

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
    <StyledDialog open={open} onClose={handleClose} minWidth={420}>
      <Typography sx={{ color: "var(--st-text)", fontWeight: 700, px: 3, pt: 2.5, pb: 1 }}>
        {t("choose_register_type")}
      </Typography>
      <Divider sx={{ borderColor: "var(--st-divider)" }} />

      <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <FieldLabel required>{t("register_type")}</FieldLabel>
        <StyledSelect
          fullWidth
          displayEmpty
          value={registerType}
          onChange={(e) => { setRegisterType(e.target.value as string); setError(false); }}
        >
          <MenuItem value="" disabled>
            <Typography sx={{ color: "var(--st-text-disabled)", fontSize: "0.875rem" }}>
              {t("select_a_register_type")}
            </Typography>
          </MenuItem>
          <MenuItem value="manual">{t("manual_registration")}</MenuItem>
          <MenuItem value="image_name">{t("by_image_name")}</MenuItem>
          <MenuItem value="link">{t("by_link")}</MenuItem>
        </StyledSelect>
        {error && (
          <Typography variant="caption" sx={{ color: "var(--st-error)", mt: 0.5, display: "block" }}>
            {t("select_a_register_type")}
          </Typography>
        )}
      </Box>

      <Divider sx={{ borderColor: "var(--st-divider)" }} />
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, px: 3, py: 2 }}>
        <DialogCancelButton onClick={handleClose}>
          {t("cancel")}
        </DialogCancelButton>
        <DialogPrimaryButton onClick={handleOk}>
          {t("go")}
        </DialogPrimaryButton>
      </Box>
    </StyledDialog>
  );
}