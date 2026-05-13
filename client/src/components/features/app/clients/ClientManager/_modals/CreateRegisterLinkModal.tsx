import { useT } from "@/i18n/client";
import { useState } from "react";
import {
  Box,
  Divider,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNotification } from "@/contexts/NotificationContext";
import { createLink } from "@/lib/api/links/createLink";
import EventSelector from "@/components/common/EventSelector";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import StyledDialog from "@/components/ui/StyledDialog";
import StyledTextField from "@/components/ui/StyledTextField";
import StyledCheckbox from "@/components/ui/StyledCheckbox";
import FieldLabel from "@/components/ui/FieldLabel";
import DialogCancelButton from "@/components/ui/DialogCancelButton";
import DialogPrimaryButton from "@/components/ui/DialogPrimaryButton";

interface CreateRegisterLinkModalProps {
  open: boolean;
  handleClose: () => void;
}

/* ── empty form state ── */
const emptyForm = {
  title: "",
  max_registers: "",
  require_address: false,
  require_guardian_if_minor: false,
  auto_assign: false,
};

export default function CreateRegisterLinkModal({ open, handleClose }: CreateRegisterLinkModalProps) {
  const { t } = useT();
  const notification = useNotification();

  const [loading, setLoading] = useState(false);
  const [openGenerated, setOpenGenerated] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [assignments, setAssignments] = useState<number[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = t("enter_title");
    const max = Number(form.max_registers);
    if (!form.max_registers || isNaN(max) || max < 1 || max > 999)
      e.max_registers = t("enter_max_registers");
    return e;
  };

  const handleOk = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    try {
      const res = await createLink({
        ...form,
        max_registers: Number(form.max_registers),
        assignments,
      });
      if (res.link_id) {
        const link = process.env.NEXT_PUBLIC_APP_URL + `/client/register/${res.link_id}`;
        close();
        setGeneratedLink(link);
        setOpenGenerated(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setForm(emptyForm);
    setErrors({});
    setAssignments([]);
    setLoading(false);
    handleClose();
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(generatedLink)
      .then(() => notification.success({ title: t("link_copied_to_clipboard") }))
      .catch(() => {});
  };

  const set = (field: keyof typeof emptyForm) => (val: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  return (
    <>
      {/* ── Generate link dialog ── */}
      <StyledDialog open={open} onClose={close} minWidth={520} paperSx={{ overflow: "visible" }}>
        <Typography sx={{ color: "var(--st-text)", fontWeight: 700, px: 3, pt: 2.5, pb: 1 }}>
          {t("share_register_link")}
        </Typography>
        <Divider sx={{ borderColor: "var(--st-divider)" }} />

        <Box sx={{ px: 3, pt: 2.5, pb: 1, overflow: "visible" }}>
          <Stack spacing={2} sx={{ overflow: "visible" }}>
            {/* Title */}
            <Box>
              <FieldLabel required>{t("title")}</FieldLabel>
              <StyledTextField
                fullWidth
                size="small"
                placeholder={t("enter_title")}
                value={form.title}
                onChange={(e) => { set("title")(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
                error={!!errors.title}
                helperText={errors.title}
              />
            </Box>

            {/* Max registers */}
            <Box>
              <FieldLabel required>{t("max_registers")}</FieldLabel>
              <StyledTextField
                fullWidth
                size="small"
                type="number"
                placeholder={t("enter_max_registers")}
                value={form.max_registers}
                onChange={(e) => { set("max_registers")(e.target.value); setErrors((p) => ({ ...p, max_registers: "" })); }}
                error={!!errors.max_registers}
                helperText={errors.max_registers}
                slotProps={{ htmlInput: { min: 1, max: 999 } }}
              />
            </Box>

            {/* Checkboxes */}
            <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.5 }}>
              <FormControlLabel
                control={
                  <StyledCheckbox
                    checked={form.require_address}
                    onChange={(e) => set("require_address")(e.target.checked)}
                  />
                }
                label={<Typography sx={{ fontSize: "0.875rem", color: "var(--st-text)" }}>{t("require_address")}</Typography>}
              />
              <FormControlLabel
                control={
                  <StyledCheckbox
                    checked={form.require_guardian_if_minor}
                    onChange={(e) => set("require_guardian_if_minor")(e.target.checked)}
                  />
                }
                label={<Typography sx={{ fontSize: "0.875rem", color: "var(--st-text)" }}>{t("require_guardian_if_minor")}</Typography>}
              />
              <FormControlLabel
                control={
                  <StyledCheckbox
                    checked={form.auto_assign}
                    onChange={(e) => set("auto_assign")(e.target.checked)}
                  />
                }
                label={<Typography sx={{ fontSize: "0.875rem", color: "var(--st-text)" }}>{t("auto_assign")}</Typography>}
              />
            </Stack>

            {/* Event selector (conditional) */}
            {form.auto_assign && (
              <>
                <Divider sx={{ borderColor: "var(--st-divider)" }}>
                  <Typography variant="caption" sx={{ color: "var(--st-text-sec)" }}>
                    {t("assign_client_to_event")}
                  </Typography>
                </Divider>
                <EventSelector value={assignments} onChange={(vals) => setAssignments(vals)} />
              </>
            )}
          </Stack>
        </Box>

        <Divider sx={{ borderColor: "var(--st-divider)" }} />
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, px: 3, py: 2 }}>
          <DialogCancelButton onClick={close} disabled={loading}>
            {t("cancel")}
          </DialogCancelButton>
          <DialogPrimaryButton onClick={handleOk} disabled={loading}>
            {loading ? `${t("generate")}…` : t("generate")}
          </DialogPrimaryButton>
        </Box>
      </StyledDialog>

      {/* ── Copy link dialog ── */}
      <StyledDialog open={openGenerated} onClose={() => setOpenGenerated(false)} minWidth={520}>
        <Typography sx={{ color: "var(--st-text)", fontWeight: 700, px: 3, pt: 2.5, pb: 1 }}>
          {t("copy_register_link")}
        </Typography>
        <Divider sx={{ borderColor: "var(--st-divider)" }} />

        <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <FieldLabel>{t("generated_link_label")}</FieldLabel>
          <StyledTextField
            fullWidth
            size="small"
            value={generatedLink}
            slotProps={{
              input: {
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={generatedLink ? t("copy_link") : t("generate_first")} arrow>
                      <IconButton
                        onClick={handleCopy}
                        disabled={!generatedLink}
                        edge="end"
                        sx={{
                          color: "var(--st-text-sec)",
                          "&:hover": { color: "var(--st-primary)", backgroundColor: "var(--st-primary-light)" },
                        }}
                      >
                        <ContentCopyIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Divider sx={{ borderColor: "var(--st-divider)" }} />
        <Box sx={{ display: "flex", justifyContent: "flex-end", px: 3, py: 2 }}>
          <DialogPrimaryButton onClick={() => setOpenGenerated(false)}>
            {t("finish")}
          </DialogPrimaryButton>
        </Box>
      </StyledDialog>
    </>
  );
}
