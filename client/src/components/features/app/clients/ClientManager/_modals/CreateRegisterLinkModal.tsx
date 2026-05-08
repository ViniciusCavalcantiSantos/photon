import { useT } from "@/i18n/client";
import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNotification } from "@/contexts/NotificationContext";
import { createLink } from "@/lib/api/links/createLink";
import EventSelector from "@/components/common/EventSelector";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

interface CreateRegisterLinkModalProps {
  open: boolean;
  handleClose: () => void;
}

/* ── shared sx tokens ── */
const dialogPaperSx = {
  backgroundColor: "var(--st-bg-paper)",
  backgroundImage: "none",
  border: "1px solid var(--st-border)",
  borderRadius: "16px",
  color: "var(--st-text)",
  minWidth: { xs: "calc(100vw - 32px)", sm: 520 },
  overflow: "visible",   /* allow absolute-positioned tree dropdown to float above */
} as const;

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "var(--st-bg-elevated)",
    color: "var(--st-text)",
    "& fieldset": { borderColor: "var(--st-border)" },
    "&:hover fieldset": { borderColor: "var(--st-primary)" },
    "&.Mui-focused fieldset": { borderColor: "var(--st-primary)" },
  },
  "& .MuiInputLabel-root": { color: "var(--st-text-sec)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "var(--st-primary)" },
  "& .MuiInputBase-input": { color: "var(--st-text)" },
  "& .MuiInputBase-input::placeholder": { color: "var(--st-text-disabled)", opacity: 1 },
} as const;

const labelSx = {
  color: "var(--st-text)",
  fontWeight: 600,
  fontSize: "0.85rem",
  mb: 0.75,
} as const;

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
      <Dialog
        open={open}
        onClose={close}
        slotProps={{
          paper: { sx: dialogPaperSx },
          backdrop: { sx: { backgroundColor: "var(--st-bg-mask)" } },
        }}
      >
        <DialogTitle sx={{ color: "var(--st-text)", fontWeight: 700, pb: 1 }}>
          {t("share_register_link")}
        </DialogTitle>
        <Divider sx={{ borderColor: "var(--st-divider)" }} />

        <DialogContent sx={{ pt: 2.5, overflow: "visible" }}>
          <Stack spacing={2} sx={{ overflow: "visible" }}>
            {/* Title */}
            <Box>
              <Typography sx={labelSx}>
                {t("title")} <span style={{ color: "var(--st-primary)" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder={t("enter_title")}
                value={form.title}
                onChange={(e) => { set("title")(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
                error={!!errors.title}
                helperText={errors.title}
                sx={inputSx}
              />
            </Box>

            {/* Max registers */}
            <Box>
              <Typography sx={labelSx}>
                {t("max_registers")} <span style={{ color: "var(--st-primary)" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                placeholder={t("enter_max_registers")}
                value={form.max_registers}
                onChange={(e) => { set("max_registers")(e.target.value); setErrors((p) => ({ ...p, max_registers: "" })); }}
                error={!!errors.max_registers}
                helperText={errors.max_registers}
                slotProps={{ htmlInput: { min: 1, max: 999 } }}
                sx={inputSx}
              />
            </Box>

            {/* Checkboxes */}
            <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.require_address}
                    onChange={(e) => set("require_address")(e.target.checked)}
                    sx={{ color: "var(--st-border)", "&.Mui-checked": { color: "var(--st-primary)" } }}
                  />
                }
                label={<Typography sx={{ fontSize: "0.875rem", color: "var(--st-text)" }}>{t("require_address")}</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.require_guardian_if_minor}
                    onChange={(e) => set("require_guardian_if_minor")(e.target.checked)}
                    sx={{ color: "var(--st-border)", "&.Mui-checked": { color: "var(--st-primary)" } }}
                  />
                }
                label={<Typography sx={{ fontSize: "0.875rem", color: "var(--st-text)" }}>{t("require_guardian_if_minor")}</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.auto_assign}
                    onChange={(e) => set("auto_assign")(e.target.checked)}
                    sx={{ color: "var(--st-border)", "&.Mui-checked": { color: "var(--st-primary)" } }}
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
        </DialogContent>

        <Divider sx={{ borderColor: "var(--st-divider)" }} />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={close}
            disabled={loading}
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
            disabled={loading}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              backgroundColor: "var(--st-primary)",
              "&:hover": { backgroundColor: "var(--st-primary-hover)" },
            }}
          >
            {loading ? `${t("generate")}…` : t("generate")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Copy link dialog ── */}
      <Dialog
        open={openGenerated}
        onClose={() => setOpenGenerated(false)}
        slotProps={{
          paper: { sx: dialogPaperSx },
          backdrop: { sx: { backgroundColor: "var(--st-bg-mask)" } },
        }}
      >
        <DialogTitle sx={{ color: "var(--st-text)", fontWeight: 700, pb: 1 }}>
          {t("copy_register_link")}
        </DialogTitle>
        <Divider sx={{ borderColor: "var(--st-divider)" }} />

        <DialogContent sx={{ pt: 2.5 }}>
          <Box>
            <Typography sx={labelSx}>{t("generated_link_label")}</Typography>
            <TextField
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
              sx={inputSx}
            />
          </Box>
        </DialogContent>

        <Divider sx={{ borderColor: "var(--st-divider)" }} />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="contained"
            onClick={() => setOpenGenerated(false)}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              backgroundColor: "var(--st-primary)",
              "&:hover": { backgroundColor: "var(--st-primary-hover)" },
            }}
          >
            {t("finish")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
