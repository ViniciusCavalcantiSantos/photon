"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Autocomplete,
  Box,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import { CountryCode } from "libphonenumber-js";

import { useT } from "@/i18n/client";
import { useNotification } from "@/contexts/NotificationContext";
import { guardianTypes } from "@/types/Client";
import { RegisterLinkType } from "@/types/RegisterLinkType";
import { useCountries } from "@/lib/queries/locations/useCountries";
import { useStates } from "@/lib/queries/locations/useStates";
import { useCities } from "@/lib/queries/locations/useCities";
import { createClientPublic } from "@/lib/api/clients/createClient";
import { fetchLink } from "@/lib/api/links/fetchLink";
import ImagePreview from "@/components/ui/ImagePreview";
import StyledTextField from "@/components/ui/StyledTextField";
import StyledSelect from "@/components/ui/StyledSelect";
import FieldLabel from "@/components/ui/FieldLabel";
import DialogCancelButton from "@/components/ui/DialogCancelButton";
import DialogPrimaryButton from "@/components/ui/DialogPrimaryButton";
import MuiInputPhone from "@/components/ui/MuiInputPhone";

/* ── shared autocomplete dropdown style ── */
const acPaperSx = {
  backgroundColor: "var(--st-bg-elevated)",
  border: "1px solid var(--st-border)",
  borderRadius: "12px",
  "& .MuiAutocomplete-option": {
    color: "var(--st-text)",
    fontSize: "0.85rem",
    "&:hover, &.Mui-focused": { backgroundColor: "var(--st-primary-light)" },
  },
} as const;

/* ── option type returned by location hooks ── */
type LocOption = { value: string; label: string };

/* ── form state ── */
interface FormState {
  name: string;
  birthdate: string;
  email: string;
  phone: string;
  guardian_name: string;
  guardian_type: string;
  guardian_email: string;
  guardian_phone: string;
  postal_code: string;
  street: string;
  number: string;
  neighborhood: string;
  complement: string;
  country: string;
  state: string;
  city: string;
}

const empty: FormState = {
  name: "", birthdate: "", email: "", phone: "",
  guardian_name: "", guardian_type: "", guardian_email: "", guardian_phone: "",
  postal_code: "", street: "", number: "", neighborhood: "", complement: "",
  country: "", state: "", city: "",
};

/* ════════════════════════════════════════════════════════════════
   ClientRegisterForm
   ════════════════════════════════════════════════════════════════ */
export default function ClientRegisterForm() {
  const { t } = useT();
  const notification = useNotification();
  const router = useRouter();
  const params = useParams();
  const linkId = params.linkId as string;

  const [linkInfo, setLinkInfo] = useState<RegisterLinkType | null>(null);
  const [loadingLink, setLoadingLink] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  /* photo */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoRequired, setPhotoRequired] = useState(false);

  /* guardian required when minor */
  const requireGuardian =
    !!linkInfo?.requireGuardianIfMinor &&
    !!form.birthdate &&
    dayjs().diff(dayjs(form.birthdate), "years") < 18;

  /* location */
  const { data: countries, isLoading: isLoadingCountries } = useCountries();
  const { data: states, isLoading: isLoadingStates } = useStates(form.country);
  const { data: cities } = useCities(form.country, form.state);

  const countryOptions = (countries ?? []) as LocOption[];
  const stateOptions = (states ?? []) as LocOption[];
  const cityOptions = (cities ?? []) as LocOption[];

  /* load link info */
  useEffect(() => {
    setLoadingLink(true);
    fetchLink(linkId)
      .then((res) => setLinkInfo(res.linkInfo))
      .catch(() => {
        notification.error({ title: t("link_not_found") });
        router.replace("/");
      })
      .finally(() => setLoadingLink(false));
  }, [linkId]);

  /* helpers */
  const set = <K extends keyof FormState>(field: K) =>
    (val: FormState[K]) => setForm((p) => ({ ...p, [field]: val }));
  const clearErr = (field: keyof FormState) =>
    setErrors((p) => ({ ...p, [field]: "" }));

  /* photo handlers */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notification.warning({ title: t("Invalid_file"), description: t("please_select_images_only") });
      return;
    }
    setPhotoFile(file);
    setPhotoUrl(URL.createObjectURL(file));
    setPhotoRequired(false);
    e.target.value = "";
  };

  /* validation */
  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = t("enter_name");
    if (!form.birthdate) e.birthdate = t("enter_birthdate");
    if (!form.email.trim()) e.email = t("enter_email");
    if (!form.phone.trim()) e.phone = t("enter_phone");
    if (requireGuardian) {
      if (!form.guardian_name.trim()) e.guardian_name = t("enter_guardian_name");
      if (!form.guardian_type) e.guardian_type = t("select_guardian_type");
      if (!form.guardian_email.trim()) e.guardian_email = t("enter_guardian_email");
      if (!form.guardian_phone.trim()) e.guardian_phone = t("enter_guardian_phone");
    }
    if (linkInfo?.requireAddress) {
      if (!form.postal_code.trim()) e.postal_code = t("enter_postal_code");
      if (!form.street.trim()) e.street = t("enter_street");
      if (!form.number.trim()) e.number = t("enter_number");
      if (!form.neighborhood.trim()) e.neighborhood = t("enter_neighborhood");
      if (!form.country) e.country = t("select_country");
      if (!form.state) e.state = t("select_state");
      if (!form.city.trim()) e.city = t("enter_city");
    }
    return e;
  };

  /* submit */
  const handleSubmit = async () => {
    if (!linkInfo) return;
    if (!photoFile) { setPhotoRequired(true); return; }
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoadingSubmit(true);
    const values = {
      ...form,
      birthdate: form.birthdate ? dayjs(form.birthdate).format("YYYY-MM-DD") : undefined,
    };

    await createClientPublic(linkInfo.id, values, photoFile)
      .then((res) => {
        notification.success({ title: res.message });
        setSubmitted(true);
      })
      .catch((err: Error) => notification.warning({ title: err.message }))
      .finally(() => setLoadingSubmit(false));
  };

  /* ── success screen ── */
  if (submitted) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          background: "radial-gradient(ellipse at 50% 0%, rgba(12,102,228,0.18) 0%, var(--st-bg) 70%)",
          p: 3,
        }}
      >
        <TaskAltIcon sx={{ fontSize: 72, color: "var(--st-success)" }} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: "var(--st-text)", textAlign: "center" }}>
          {t("registration_complete")}
        </Typography>
        <Typography sx={{ color: "var(--st-text-sec)", textAlign: "center", maxWidth: 400 }}>
          {linkInfo?.title}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        position: "relative",
        background: "radial-gradient(ellipse at 50% 0%, rgba(12,102,228,0.14) 0%, var(--st-bg) 65%)",
        pb: 8,
      }}
    >
      {/* ── corner brand badge ── */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: 16, md: 20 },
          left: { xs: 16, md: 24 },
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          zIndex: 10,
        }}
      >
        <CameraAltIcon sx={{ fontSize: 18, color: "var(--st-primary)" }} />
        <Typography
          sx={{
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: "var(--st-text-sec)",
          }}
        >
          Photon Cloud
        </Typography>
      </Box>

      {/* ── hero header ── */}
      <Box
        sx={{
          pt: { xs: 7, md: 9 },
          pb: { xs: 3, md: 5 },
          px: 3,
          textAlign: "center",
        }}
      >
        {/* mock company card */}
        <Box
          sx={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
            mb: 3,
          }}
        >
          {/* company avatar */}
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "20px",
              overflow: "hidden",
              border: "2px solid var(--st-border)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
              background: "linear-gradient(135deg, #1e3a5f 0%, #0c66e4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {/* TODO: replace with real company logo from linkInfo */}
            <Typography sx={{ fontSize: "1.6rem", fontWeight: 900, color: "#fff", lineHeight: 1 }}>
              F
            </Typography>
          </Box>

          {/* company name + event label */}
          <Box>
            <Typography
              sx={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "var(--st-primary)", mb: 0.25 }}
            >
              {/* TODO: replace with real company name from linkInfo */}
              Focus Studio Fotográfico
            </Typography>

            {loadingLink ? (
              <Skeleton variant="text" width={220} height={36} sx={{ mx: "auto", bgcolor: "var(--st-bg-elevated)" }} />
            ) : (
              <Typography
                component="h1"
                sx={{ fontSize: { xs: "1.35rem", md: "1.75rem" }, fontWeight: 800,
                  color: "var(--st-text)", letterSpacing: "-0.02em" }}
              >
                {linkInfo?.title}
              </Typography>
            )}
          </Box>
        </Box>

        <Typography sx={{ color: "var(--st-text-sec)", fontSize: "0.9rem", maxWidth: 400, mx: "auto" }}>
          {t("fill_in_the_form_below_to_complete_your_registration")}
        </Typography>

        {/* decorative line */}
        <Box sx={{ mt: 2.5, mx: "auto", width: 40, height: 3, borderRadius: 99,
          background: "linear-gradient(90deg, var(--st-primary), #3b82f6)" }} />
      </Box>

      {/* ── form container ── */}
      <Box sx={{ px: { xs: 2, sm: 4 }, maxWidth: 900, mx: "auto" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: 3,
            alignItems: "flex-start",
          }}
        >
          {/* ── photo upload panel ── */}
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              backgroundColor: "var(--st-bg-paper)",
              borderColor: photoRequired ? "var(--st-error)" : "var(--st-border)",
              borderRadius: "20px",
              flexShrink: 0,
              width: { xs: "100%", lg: 220 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Typography
              sx={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--st-text)", alignSelf: "flex-start" }}
            >
              <Box component="span" sx={{ color: "var(--st-primary)", mr: 0.4 }}>*</Box>
              {t("your_photo")}
            </Typography>

            {/* upload zone */}
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                width: "100%",
                aspectRatio: "1 / 1",
                maxWidth: 180,
                borderRadius: "16px",
                border: `2px dashed ${photoRequired ? "var(--st-error)" : "var(--st-border)"}`,
                backgroundColor: "var(--st-bg-elevated)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                overflow: "hidden",
                transition: "border-color 0.2s, box-shadow 0.2s",
                "&:hover": {
                  borderColor: "var(--st-primary)",
                  boxShadow: "0 0 0 3px var(--st-primary-light)",
                },
              }}
            >
              {photoUrl ? (
                <ImagePreview
                  src={photoUrl}
                  alt={form.name || t("your_photo")}
                  thumbnailSx={{ width: "100%", height: "100%" }}
                  imageSx={{ objectFit: "cover" }}
                />
              ) : (
                <Stack sx={{ alignItems: "center", gap: 1, pointerEvents: "none" }}>
                  <AddPhotoAlternateIcon sx={{ fontSize: 40, color: "var(--st-text-sec)" }} />
                  <Typography sx={{ fontSize: "0.78rem", color: "var(--st-text-sec)" }}>
                    Upload
                  </Typography>
                </Stack>
              )}
            </Box>

            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

            {photoUrl && (
              <DialogCancelButton
                onClick={() => { setPhotoFile(null); setPhotoUrl(""); }}
                sx={{ fontSize: "0.75rem", py: 0.4 }}
              >
                {t("remove")}
              </DialogCancelButton>
            )}

            {photoRequired && (
              <Typography sx={{ color: "var(--st-error)", fontSize: "0.78rem", textAlign: "center" }}>
                {t("select_a_photo")}
              </Typography>
            )}
          </Paper>

          {/* ── main form ── */}
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 3 },
              backgroundColor: "var(--st-bg-paper)",
              borderColor: "var(--st-border)",
              borderRadius: "20px",
              width: "100%",
              opacity: loadingLink ? 0.5 : 1,
              pointerEvents: loadingLink ? "none" : "auto",
              transition: "opacity 0.3s",
            }}
          >
            <Stack spacing={2.5}>

              {/* personal info */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel required>{t("name")}</FieldLabel>
                  <StyledTextField
                    fullWidth size="small" placeholder={t("name")}
                    value={form.name}
                    onChange={(e) => { set("name")(e.target.value); clearErr("name"); }}
                    error={!!errors.name} helperText={errors.name}
                    slotProps={{ htmlInput: { maxLength: 60 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel required>{t("birthdate")}</FieldLabel>
                  <StyledTextField
                    fullWidth size="small" type="date"
                    value={form.birthdate}
                    onChange={(e) => { set("birthdate")(e.target.value); clearErr("birthdate"); }}
                    error={!!errors.birthdate} helperText={errors.birthdate}
                    slotProps={{ htmlInput: { max: dayjs().format("YYYY-MM-DD") } }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel required>{t("email")}</FieldLabel>
                  <StyledTextField
                    fullWidth size="small" type="email" placeholder={t("email")}
                    value={form.email}
                    onChange={(e) => { set("email")(e.target.value); clearErr("email"); }}
                    error={!!errors.email} helperText={errors.email}
                    slotProps={{ htmlInput: { maxLength: 120 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel required>{t("phone")}</FieldLabel>
                  <MuiInputPhone
                    fullWidth size="small" placeholder={t("phone")}
                    value={form.phone}
                    onChange={(v) => { set("phone")(v); clearErr("phone"); }}
                    error={!!errors.phone} helperText={errors.phone}
                    defaultCountryCode={linkInfo?.defaultLanguage as CountryCode}
                  />
                </Grid>
              </Grid>

              {/* guardian section — shown when minor */}
              {requireGuardian && (
                <>
                  <Divider sx={{ borderColor: "var(--st-divider)" }}>
                    <Typography variant="caption" sx={{ color: "var(--st-text-sec)" }}>
                      {t("guardian")}
                    </Typography>
                  </Divider>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <FieldLabel required>{t("guardian_name")}</FieldLabel>
                      <StyledTextField
                        fullWidth size="small" placeholder={t("enter_guardian_name")}
                        value={form.guardian_name}
                        onChange={(e) => { set("guardian_name")(e.target.value); clearErr("guardian_name"); }}
                        error={!!errors.guardian_name} helperText={errors.guardian_name}
                        slotProps={{ htmlInput: { maxLength: 60 } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FieldLabel required>{t("guardian_type")}</FieldLabel>
                      <StyledSelect
                        fullWidth size="small" displayEmpty
                        value={form.guardian_type}
                        onChange={(e) => { set("guardian_type")(e.target.value as string); clearErr("guardian_type"); }}
                        error={!!errors.guardian_type} helperText={errors.guardian_type}
                      >
                        <MenuItem value="" disabled>{t("select_guardian_type")}</MenuItem>
                        {guardianTypes.map((g) => (
                          <MenuItem key={g} value={g}>{t(g)}</MenuItem>
                        ))}
                      </StyledSelect>
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel required>{t("guardian_email")}</FieldLabel>
                      <StyledTextField
                        fullWidth size="small" type="email" placeholder={t("enter_guardian_email")}
                        value={form.guardian_email}
                        onChange={(e) => { set("guardian_email")(e.target.value); clearErr("guardian_email"); }}
                        error={!!errors.guardian_email} helperText={errors.guardian_email}
                        slotProps={{ htmlInput: { maxLength: 60 } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel required>{t("guardian_phone")}</FieldLabel>
                      <MuiInputPhone
                        fullWidth size="small" placeholder={t("enter_guardian_phone")}
                        value={form.guardian_phone}
                        onChange={(v) => { set("guardian_phone")(v); clearErr("guardian_phone"); }}
                        error={!!errors.guardian_phone} helperText={errors.guardian_phone}
                      />
                    </Grid>
                  </Grid>
                </>
              )}

              {/* address section — conditional */}
              {!!linkInfo?.requireAddress && (
                <>
                  <Divider sx={{ borderColor: "var(--st-divider)" }}>
                    <Typography variant="caption" sx={{ color: "var(--st-text-sec)" }}>
                      {t("address")}
                    </Typography>
                  </Divider>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FieldLabel required>{t("postal_code")}</FieldLabel>
                      <StyledTextField
                        fullWidth size="small" placeholder={t("postal_code")}
                        value={form.postal_code}
                        onChange={(e) => { set("postal_code")(e.target.value); clearErr("postal_code"); }}
                        error={!!errors.postal_code} helperText={errors.postal_code}
                        slotProps={{ htmlInput: { maxLength: 12 } }}
                      />
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <FieldLabel required>{t("street")}</FieldLabel>
                      <StyledTextField
                        fullWidth size="small" placeholder={t("street")}
                        value={form.street}
                        onChange={(e) => { set("street")(e.target.value); clearErr("street"); }}
                        error={!!errors.street} helperText={errors.street}
                        slotProps={{ htmlInput: { maxLength: 120 } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FieldLabel required>{t("number")}</FieldLabel>
                      <StyledTextField
                        fullWidth size="small" placeholder={t("number")}
                        value={form.number}
                        onChange={(e) => { set("number")(e.target.value); clearErr("number"); }}
                        error={!!errors.number} helperText={errors.number}
                        slotProps={{ htmlInput: { maxLength: 10 } }}
                      />
                    </Grid>
                  </Grid>

                  <Box>
                    <FieldLabel required>{t("neighborhood")}</FieldLabel>
                    <StyledTextField
                      fullWidth size="small" placeholder={t("neighborhood")}
                      value={form.neighborhood}
                      onChange={(e) => { set("neighborhood")(e.target.value); clearErr("neighborhood"); }}
                      error={!!errors.neighborhood} helperText={errors.neighborhood}
                      slotProps={{ htmlInput: { maxLength: 40 } }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FieldLabel required>{t("country")}</FieldLabel>
                      <Autocomplete
                        options={countryOptions}
                        getOptionLabel={(o) => o.label}
                        loading={isLoadingCountries}
                        value={countryOptions.find((o) => o.value === form.country) ?? null}
                        onChange={(_, v) => {
                          set("country")(v?.value ?? "");
                          set("state")(""); set("city")("");
                          clearErr("country");
                        }}
                        slotProps={{ paper: { sx: acPaperSx } }}
                        renderInput={(p) => (
                          <StyledTextField {...p} size="small" placeholder={t("select_country")}
                            error={!!errors.country} helperText={errors.country} />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FieldLabel required>{t("state_province")}</FieldLabel>
                      <Autocomplete
                        options={stateOptions}
                        getOptionLabel={(o) => o.label}
                        loading={isLoadingStates}
                        disabled={!form.country || isLoadingStates}
                        value={stateOptions.find((o) => o.value === form.state) ?? null}
                        onChange={(_, v) => {
                          set("state")(v?.value ?? "");
                          set("city")("");
                          clearErr("state");
                        }}
                        slotProps={{ paper: { sx: acPaperSx } }}
                        renderInput={(p) => (
                          <StyledTextField {...p} size="small" placeholder={t("select_state")}
                            error={!!errors.state} helperText={errors.state} />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FieldLabel required>{t("city")}</FieldLabel>
                      <Autocomplete
                        options={cityOptions}
                        getOptionLabel={(o) => o.label}
                        freeSolo
                        disabled={!form.state}
                        value={cityOptions.find((o) => o.value === form.city) ?? form.city ?? null}
                        onInputChange={(_, v) => { set("city")(v); clearErr("city"); }}
                        slotProps={{ paper: { sx: acPaperSx } }}
                        renderInput={(p) => (
                          <StyledTextField {...p} size="small" placeholder={t("enter_or_select")}
                            error={!!errors.city} helperText={errors.city} />
                        )}
                      />
                    </Grid>
                  </Grid>

                  <Box>
                    <FieldLabel>{t("complement")}</FieldLabel>
                    <StyledTextField
                      fullWidth size="small" placeholder={t("complement")}
                      value={form.complement}
                      onChange={(e) => set("complement")(e.target.value)}
                      slotProps={{ htmlInput: { maxLength: 120 } }}
                    />
                  </Box>
                </>
              )}

              {/* footer */}
              <Divider sx={{ borderColor: "var(--st-divider)" }} />
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
                <DialogCancelButton onClick={() => router.back()} disabled={loadingSubmit}>
                  {t("cancel")}
                </DialogCancelButton>
                <DialogPrimaryButton
                  onClick={handleSubmit}
                  disabled={loadingSubmit || loadingLink}
                  sx={{ minWidth: 140 }}
                >
                  {loadingSubmit
                    ? <CircularProgress size={18} sx={{ color: "#fff" }} />
                    : t("save_client")}
                </DialogPrimaryButton>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
