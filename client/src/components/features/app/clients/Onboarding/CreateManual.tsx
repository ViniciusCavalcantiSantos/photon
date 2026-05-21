"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Autocomplete,
  Box,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { useParams, useRouter } from "next/navigation";
import { useT } from "@/i18n/client";
import { useNotification } from "@/contexts/NotificationContext";
import { guardianTypes } from "@/types/Client";
import dayjs from "dayjs";
import { useUser } from "@/contexts/UserContext";
import EventSelector from "@/components/common/EventSelector";
import MuiInputPhone from "@/components/ui/MuiInputPhone";
import { useClient } from "@/lib/queries/clients/useClient";
import { useCountries } from "@/lib/queries/locations/useCountries";
import { useStates } from "@/lib/queries/locations/useStates";
import { useCities } from "@/lib/queries/locations/useCities";
import { useCreateClient } from "@/lib/queries/clients/useCreateClient";
import { useUpdateClient } from "@/lib/queries/clients/useUpdateClient";
import PageHeader from "@/components/common/layout/PageHeader";
import StyledTextField from "@/components/ui/StyledTextField";
import StyledSelect from "@/components/ui/StyledSelect";
import StyledCheckbox from "@/components/ui/StyledCheckbox";
import FieldLabel from "@/components/ui/FieldLabel";
import DialogCancelButton from "@/components/ui/DialogCancelButton";
import DialogPrimaryButton from "@/components/ui/DialogPrimaryButton";
import ImagePreview from "@/components/ui/ImagePreview";

/* ─── types ─────────────────────────────────────────────────────── */
interface FormState {
  name: string;
  code: string;
  birthdate: string;
  phone: string;
  inform_address: boolean;
  inform_guardian: boolean;
  keep_adding: boolean;
  auto_assign: boolean;
  postal_code: string;
  street: string;
  number: string;
  neighborhood: string;
  complement: string;
  country: string;
  state: string;
  city: string;
  guardian_name: string;
  guardian_type: string;
  guardian_email: string;
  guardian_phone: string;
}

const empty: FormState = {
  name: "", code: "", birthdate: "", phone: "",
  inform_address: false, inform_guardian: false, keep_adding: false, auto_assign: false,
  postal_code: "", street: "", number: "", neighborhood: "", complement: "",
  country: "", state: "", city: "",
  guardian_name: "", guardian_type: "", guardian_email: "", guardian_phone: "",
};

/* ─── searchable select sx (for Autocomplete) ───────────────────── */
const autocompletePaperSx = {
  backgroundColor: "var(--st-bg-elevated)",
  border: "1px solid var(--st-border)",
  borderRadius: "12px",
  "& .MuiAutocomplete-option": {
    color: "var(--st-text)",
    fontSize: "0.85rem",
    "&:hover, &.Mui-focused": { backgroundColor: "var(--st-primary-light)" },
  },
} as const;

/* ─── component ─────────────────────────────────────────────────── */
const CreateManual: React.FC = () => {
  const { t } = useT();
  const notification = useNotification();
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const isEditMode = clientId !== "new";
  const { defaultDateFormat } = useUser();

  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [assignments, setAssignments] = useState<number[]>([]);

  /* photo upload state */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [photoRequired, setPhotoRequired] = useState(false);

  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const { data: clientData, isLoading: isLoadingClient, isError: isClientError } =
    useClient(Number(clientId), isEditMode);

  const { data: countries, isLoading: isLoadingCountries } = useCountries();
  const { data: states, isLoading: isLoadingStates } = useStates(form.country);
  const { data: cities } = useCities(form.country, form.state);

  /* helpers */
  const set = useCallback(
    <K extends keyof FormState>(field: K) =>
      (val: FormState[K]) =>
        setForm((p) => ({ ...p, [field]: val })),
    []
  );
  const clearErr = (field: keyof FormState) =>
    setErrors((p) => ({ ...p, [field]: "" }));

  /* populate form in edit mode */
  useEffect(() => {
    if (isEditMode && clientData && !isLoadingClient) {
      setForm({
        name: clientData.name ?? "",
        code: clientData.code ?? "",
        birthdate: clientData.birthdate ?? "",
        phone: clientData.phone ?? "",
        inform_address: !!clientData.address,
        inform_guardian: !!clientData.guardian?.name,
        keep_adding: false,
        auto_assign: false,
        postal_code: clientData.address?.postalCode ?? "",
        street: clientData.address?.street ?? "",
        number: clientData.address?.number ?? "",
        neighborhood: clientData.address?.neighborhood ?? "",
        complement: clientData.address?.complement ?? "",
        country: clientData.address?.country ?? "",
        state: clientData.address?.state ?? "",
        city: clientData.address?.city ?? "",
        guardian_name: clientData.guardian?.name ?? "",
        guardian_type: clientData.guardian?.type ?? "",
        guardian_email: clientData.guardian?.email ?? "",
        guardian_phone: clientData.guardian?.phone ?? "",
      });
      if (clientData.profile?.web) setPhotoUrl(clientData.profile.web);
    } else if (!isEditMode) {
      setForm(empty);
    }
  }, [clientData, isEditMode, isLoadingClient]);

  useEffect(() => {
    if (isClientError) {
      notification.error({ title: t("client_not_found") });
      router.back();
    }
  }, [isClientError]);

  /* clear sub-fields when sections are toggled off */
  useEffect(() => {
    if (!form.inform_address)
      setForm((p) => ({
        ...p,
        postal_code: "", street: "", number: "", neighborhood: "",
        complement: "", country: "", state: "", city: "",
      }));
  }, [form.inform_address]);

  useEffect(() => {
    if (!form.inform_guardian)
      setForm((p) => ({
        ...p,
        guardian_name: "", guardian_type: "", guardian_email: "", guardian_phone: "",
      }));
  }, [form.inform_guardian]);

  /* validation */
  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = t("enter_name");
    if (form.inform_guardian) {
      if (!form.guardian_name.trim()) e.guardian_name = t("enter_guardian_name");
      if (!form.guardian_type) e.guardian_type = t("select_guardian_type");
      if (!form.guardian_email.trim()) e.guardian_email = t("enter_guardian_email");
      if (!form.guardian_phone.trim()) e.guardian_phone = t("enter_guardian_phone");
    }
    if (form.inform_address) {
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
    const hasPhoto = photoFile || (isEditMode && photoUrl);
    if (!hasPhoto) { setPhotoRequired(true); return; }

    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const values: Record<string, unknown> = {
      ...form,
      assignments,
      birthdate: form.birthdate
        ? dayjs(form.birthdate).format("YYYY-MM-DD")
        : undefined,
    };

    const file = photoFile ?? photoUrl;

    try {
      if (isEditMode) {
        const res = await updateClient.mutateAsync({ id: Number(clientId), values, profile: file });
        notification.success({ title: res.message });
      } else {
        const res = await createClient.mutateAsync({ values, profile: file });
        notification.success({ title: res.message });
        if (form.keep_adding) {
          setPhotoFile(null);
          setPhotoUrl("");
          setAssignments([]);
          setForm({ ...empty, inform_address: form.inform_address, inform_guardian: form.inform_guardian, keep_adding: true, auto_assign: form.auto_assign });
        } else {
          router.push("/app/clients");
        }
      }
    } catch (err: unknown) {
      notification.warning({ title: (err as Error).message });
    }
  };

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

  const removePhoto = () => { setPhotoFile(null); setPhotoUrl(""); };

  const isSubmitting = createClient.isPending || updateClient.isPending;
  const isPageLoading = isEditMode && isLoadingClient;

  /* country/state option shapes */
  type LocOption = { value: string; label: string };
  const countryOptions: LocOption[] = (countries ?? []) as LocOption[];
  const stateOptions: LocOption[] = (states ?? []) as LocOption[];
  const cityOptions: LocOption[] = (cities ?? []) as LocOption[];

  return (
    <>
      <PageHeader title={isEditMode ? t("edit_client") : t("create_new_client")} />

      <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 2, alignItems: "flex-start" }}>

        {/* ── Photo upload panel ── */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            backgroundColor: "var(--st-bg-paper)",
            borderColor: photoRequired ? "var(--st-error)" : "var(--st-border)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            flexShrink: 0,
          }}
        >
          <FieldLabel required>{t("client_photo")}</FieldLabel>

          {/* Upload zone */}
          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
              width: 180,
              height: 180,
              borderRadius: "12px",
              border: `2px dashed ${photoRequired ? "var(--st-error)" : "var(--st-border)"}`,
              backgroundColor: "var(--st-bg-elevated)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              overflow: "hidden",
              transition: "border-color 0.2s",
              "&:hover": { borderColor: "var(--st-primary)" },
            }}
          >
            {photoUrl ? (
              <ImagePreview
                src={photoUrl}
                alt={form.name || t("client_photo")}
                thumbnailSx={{ width: 180, height: 180 }}
                imageSx={{ objectFit: "cover" }}
              />
            ) : (
              <Stack sx={{ alignItems: "center", gap: 1 }}>
                <AddPhotoAlternateIcon sx={{ fontSize: 36, color: "var(--st-text-sec)" }} />
                <Typography sx={{ fontSize: "0.8rem", color: "var(--st-text-sec)" }}>
                  Upload
                </Typography>
              </Stack>
            )}
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />

          {photoUrl && (
            <DialogCancelButton onClick={removePhoto} sx={{ alignSelf: "flex-start", fontSize: "0.78rem", py: 0.5 }}>
              {t("remove")}
            </DialogCancelButton>
          )}

          {photoRequired && (
            <Typography sx={{ color: "var(--st-error)", fontSize: "0.78rem" }}>
              {t("select_a_photo")}
            </Typography>
          )}
        </Paper>

        {/* ── Main form card ── */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            backgroundColor: isPageLoading ? "var(--st-bg-paper)" : "var(--st-bg-paper)",
            borderColor: "var(--st-border)",
            borderRadius: "16px",
            width: "100%",
            opacity: isPageLoading ? 0.6 : 1,
            pointerEvents: isPageLoading ? "none" : "auto",
          }}
        >
          <Stack spacing={2.5}>
            {/* Row 1: name + code */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FieldLabel required>{t("name")}</FieldLabel>
                <StyledTextField
                  fullWidth size="small"
                  placeholder={t("name")}
                  value={form.name}
                  onChange={(e) => { set("name")(e.target.value); clearErr("name"); }}
                  error={!!errors.name} helperText={errors.name}
                  slotProps={{ htmlInput: { maxLength: 60 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FieldLabel>{t("code")}</FieldLabel>
                <StyledTextField
                  fullWidth size="small"
                  placeholder={t("code")}
                  value={form.code}
                  onChange={(e) => set("code")(e.target.value)}
                  slotProps={{ htmlInput: { maxLength: 20 } }}
                />
              </Grid>
            </Grid>

            {/* Row 2: birthdate + phone */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FieldLabel>{t("birthdate")}</FieldLabel>
                <StyledTextField
                  fullWidth size="small" type="date"
                  value={form.birthdate}
                  onChange={(e) => set("birthdate")(e.target.value)}
                  slotProps={{ htmlInput: { max: dayjs().format("YYYY-MM-DD") } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FieldLabel>{t("phone")}</FieldLabel>
                <MuiInputPhone
                  fullWidth size="small"
                  placeholder={t("phone")}
                  value={form.phone}
                  onChange={set("phone")}
                />
              </Grid>
            </Grid>

            {/* Checkboxes */}
            <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.5 }}>
              <FormControlLabel
                control={<StyledCheckbox size="small" checked={form.inform_address} onChange={(e) => set("inform_address")(e.target.checked)} />}
                label={<Typography sx={{ fontSize: "0.875rem", color: "var(--st-text)" }}>{t("inform_address")}</Typography>}
              />
              <FormControlLabel
                control={<StyledCheckbox size="small" checked={form.inform_guardian} onChange={(e) => set("inform_guardian")(e.target.checked)} />}
                label={<Typography sx={{ fontSize: "0.875rem", color: "var(--st-text)" }}>{t("inform_guardian")}</Typography>}
              />
              {!isEditMode && (
                <>
                  <FormControlLabel
                    control={<StyledCheckbox size="small" checked={form.keep_adding} onChange={(e) => set("keep_adding")(e.target.checked)} />}
                    label={<Typography sx={{ fontSize: "0.875rem", color: "var(--st-text)" }}>{t("keep_adding")}</Typography>}
                  />
                  <FormControlLabel
                    control={<StyledCheckbox size="small" checked={form.auto_assign} onChange={(e) => set("auto_assign")(e.target.checked)} />}
                    label={<Typography sx={{ fontSize: "0.875rem", color: "var(--st-text)" }}>{t("auto_assign")}</Typography>}
                  />
                </>
              )}
            </Stack>

            {/* Auto-assign event selector */}
            {form.auto_assign && (
              <>
                <Divider sx={{ borderColor: "var(--st-divider)" }}>
                  <Typography variant="caption" sx={{ color: "var(--st-text-sec)" }}>
                    {t("assign_client_to_event")}
                  </Typography>
                </Divider>
                <EventSelector value={assignments} onChange={setAssignments} />
              </>
            )}

            {/* Guardian section */}
            {form.inform_guardian && (
              <>
                <Divider sx={{ borderColor: "var(--st-divider)" }}>
                  <Typography variant="caption" sx={{ color: "var(--st-text-sec)" }}>
                    {t("guardian")}
                  </Typography>
                </Divider>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <FieldLabel required>{t("guardian_name")}</FieldLabel>
                    <StyledTextField
                      fullWidth size="small"
                      placeholder={t("enter_guardian_name")}
                      value={form.guardian_name}
                      onChange={(e) => { set("guardian_name")(e.target.value); clearErr("guardian_name"); }}
                      error={!!errors.guardian_name} helperText={errors.guardian_name}
                      slotProps={{ htmlInput: { maxLength: 60 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
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
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FieldLabel required>{t("guardian_email")}</FieldLabel>
                    <StyledTextField
                      fullWidth size="small" type="email"
                      placeholder={t("enter_guardian_email")}
                      value={form.guardian_email}
                      onChange={(e) => { set("guardian_email")(e.target.value); clearErr("guardian_email"); }}
                      error={!!errors.guardian_email} helperText={errors.guardian_email}
                      slotProps={{ htmlInput: { maxLength: 60 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FieldLabel required>{t("guardian_phone")}</FieldLabel>
                    <MuiInputPhone
                      fullWidth size="small"
                      placeholder={t("enter_guardian_phone")}
                      value={form.guardian_phone}
                      onChange={(v) => { set("guardian_phone")(v); clearErr("guardian_phone"); }}
                      error={!!errors.guardian_phone} helperText={errors.guardian_phone}
                    />
                  </Grid>
                </Grid>
              </>
            )}

            {/* Address section */}
            {form.inform_address && (
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
                      fullWidth size="small"
                      placeholder={t("postal_code")}
                      value={form.postal_code}
                      onChange={(e) => { set("postal_code")(e.target.value); clearErr("postal_code"); }}
                      error={!!errors.postal_code} helperText={errors.postal_code}
                      slotProps={{ htmlInput: { maxLength: 12 } }}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <FieldLabel required>{t("street")}</FieldLabel>
                    <StyledTextField
                      fullWidth size="small"
                      placeholder={t("street")}
                      value={form.street}
                      onChange={(e) => { set("street")(e.target.value); clearErr("street"); }}
                      error={!!errors.street} helperText={errors.street}
                      slotProps={{ htmlInput: { maxLength: 120 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FieldLabel required>{t("number")}</FieldLabel>
                    <StyledTextField
                      fullWidth size="small"
                      placeholder={t("number")}
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
                    fullWidth size="small"
                    placeholder={t("neighborhood")}
                    value={form.neighborhood}
                    onChange={(e) => { set("neighborhood")(e.target.value); clearErr("neighborhood"); }}
                    error={!!errors.neighborhood} helperText={errors.neighborhood}
                    slotProps={{ htmlInput: { maxLength: 40 } }}
                  />
                </Box>

                {/* Country / State / City */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FieldLabel required>{t("country")}</FieldLabel>
                    <Autocomplete
                      options={countryOptions}
                      getOptionLabel={(o) => o.label}
                      loading={isLoadingCountries}
                      value={countryOptions.find((o) => o.value === form.country) ?? null}
                      onChange={(_, v) => {
                        set("country")(v?.value ?? "");
                        set("state")("");
                        set("city")("");
                        clearErr("country");
                      }}
                      slotProps={{ paper: { sx: autocompletePaperSx } }}
                      renderInput={(params) => (
                        <StyledTextField
                          {...params}
                          size="small"
                          placeholder={t("select_country")}
                          error={!!errors.country}
                          helperText={errors.country}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
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
                      slotProps={{ paper: { sx: autocompletePaperSx } }}
                      renderInput={(params) => (
                        <StyledTextField
                          {...params}
                          size="small"
                          placeholder={t("select_state")}
                          error={!!errors.state}
                          helperText={errors.state}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FieldLabel required>{t("city")}</FieldLabel>
                    <Autocomplete
                      options={cityOptions}
                      getOptionLabel={(o) => o.label}
                      disabled={!form.state}
                      freeSolo
                      value={cityOptions.find((o) => o.value === form.city) ?? form.city ?? null}
                      onInputChange={(_, v) => { set("city")(v); clearErr("city"); }}
                      slotProps={{ paper: { sx: autocompletePaperSx } }}
                      renderInput={(params) => (
                        <StyledTextField
                          {...params}
                          size="small"
                          placeholder={t("enter_or_select")}
                          error={!!errors.city}
                          helperText={errors.city}
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Box>
                  <FieldLabel>{t("complement")}</FieldLabel>
                  <StyledTextField
                    fullWidth size="small"
                    placeholder={t("complement")}
                    value={form.complement}
                    onChange={(e) => set("complement")(e.target.value)}
                    slotProps={{ htmlInput: { maxLength: 120 } }}
                  />
                </Box>
              </>
            )}

            {/* Footer actions */}
            <Divider sx={{ borderColor: "var(--st-divider)" }} />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <DialogCancelButton onClick={() => router.back()} disabled={isSubmitting}>
                {t("cancel")}
              </DialogCancelButton>
              <DialogPrimaryButton onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? `${t("save_client")}…` : t("save_client")}
              </DialogPrimaryButton>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </>
  );
};

export default CreateManual;