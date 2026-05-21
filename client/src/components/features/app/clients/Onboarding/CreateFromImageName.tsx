"use client";

import React, { useEffect, useState } from "react";
import { Box, Divider, FormControlLabel, Grid, Paper, Stack, Typography } from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import Link from "next/link";
import { useT } from "@/i18n/client";
import { useNotification } from "@/contexts/NotificationContext";
import Dropzone, { FileWithUploadData } from "@/components/ui/Dropzone";
import EventSelector from "@/components/common/EventSelector";
import { useCreateClient } from "@/lib/queries/clients/useCreateClient";
import { useRemoveClient } from "@/lib/queries/clients/useRemoveClient";
import PageHeader from "@/components/common/layout/PageHeader";
import StyledCheckbox from "@/components/ui/StyledCheckbox";
import DialogPrimaryButton from "@/components/ui/DialogPrimaryButton";

/* ── stat card ── */
interface StatCardProps {
  title: string;
  value: number;
  valueColor?: string;
}

function StatCard({ title, value, valueColor = "var(--st-text)" }: StatCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        height: "100%",
        p: 2.5,
        backgroundColor: "var(--st-bg-paper)",
        borderColor: "var(--st-border)",
        borderRadius: "16px",
      }}
    >
      <Typography sx={{ fontSize: "0.82rem", color: "var(--st-text-sec)", mb: 0.5 }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: "2rem", fontWeight: 700, color: valueColor, lineHeight: 1.2 }}>
        {value}
      </Typography>
    </Paper>
  );
}

/* ── main component ── */
export default function CreateFromImageName() {
  const { t } = useT();
  const notification = useNotification();

  const [autoAssign, setAutoAssign] = useState(false);
  const [files, setFiles] = useState<FileWithUploadData[]>([]);
  const [assignments, setAssignments] = useState<number[]>([]);
  const [stats, setStats] = useState({
    totalSelected: 0,
    totalSuccess: 0,
    totalError: 0,
    totalPending: 0,
  });

  const createClient = useCreateClient();
  const removeClient = useRemoveClient();

  /* keep stats in sync with files */
  useEffect(() => {
    const next = files.reduce(
      (acc, f) => {
        acc.totalSelected++;
        if (f.status === "success") acc.totalSuccess++;
        else if (f.status === "error") acc.totalError++;
        else acc.totalPending++;
        return acc;
      },
      { totalSelected: 0, totalSuccess: 0, totalError: 0, totalPending: 0 }
    );
    setStats(next);
  }, [files]);

  const updateFile = (fileId: string, patch: Partial<FileWithUploadData>) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== fileId) return f;
        Object.assign(f, patch);
        return f;
      })
    );
  };

  const handleUpload = async (file: FileWithUploadData) => {
    let fileName = file.name.replace(/\.[^/.]+$/, "");
    fileName = fileName
      .normalize("NFKC")
      .replace(/[^\p{L}\p{N}\p{M}\s'-]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!fileName) fileName = t("untitled");

    try {
      const res = await createClient.mutateAsync({
        values: { name: fileName, assignments },
        profile: file,
        onProgress: (progress) => {
          updateFile(file.id, { progress: Math.min(progress, 90) });
        },
      });
      updateFile(file.id, { clientId: res.client.id, status: "success", progress: 100 });
    } catch (err: unknown) {
      notification.warning({ title: (err as Error).message });
      updateFile(file.id, { status: "error" });
    }
  };

  const onFilesAdded = (newFiles: FileWithUploadData[]) => {
    setFiles((prev) => [...newFiles, ...prev]);
  };

  const onFilesRemoved = async (file: FileWithUploadData) => {
    if (!file.clientId) return;
    try {
      const res = await removeClient.mutateAsync(file.clientId);
      notification.success({ title: res.message });
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch (err: unknown) {
      notification.warning({ title: (err as Error).message });
    }
  };

  return (
    <>
      <PageHeader title={t("automatic_registration_by_photo")} />

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          backgroundColor: "var(--st-bg-paper)",
          borderColor: "var(--st-border)",
          borderRadius: "16px",
        }}
      >
        <Stack spacing={2.5}>
          {/* Auto-assign checkbox */}
          <Box>
            <FormControlLabel
              control={
                <StyledCheckbox
                  size="small"
                  checked={autoAssign}
                  onChange={(e) => setAutoAssign(e.target.checked)}
                />
              }
              label={
                <Typography sx={{ fontSize: "0.875rem", color: "var(--st-text)" }}>
                  {t("auto_assign")}
                </Typography>
              }
            />
          </Box>

          {/* Event selector (conditional) */}
          {autoAssign && (
            <>
              <Divider sx={{ borderColor: "var(--st-divider)" }}>
                <Typography variant="caption" sx={{ color: "var(--st-text-sec)" }}>
                  {t("assign_clients_to_events")}
                </Typography>
              </Divider>
              <EventSelector value={assignments} onChange={setAssignments} />
            </>
          )}

          {/* Dropzone */}
          <Dropzone
            onFilesAdded={onFilesAdded}
            onFilesRemoved={onFilesRemoved}
            files={files}
            onUploadFile={handleUpload}
            icon={<PersonAddAlt1Icon sx={{ fontSize: 48, color: "var(--st-primary)" }} />}
            title={t("click_or_drag_photo_to_create_client")}
            description={t("click_or_drag_photo_to_create_client_example")}
          />

          {/* Stats */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard title={t("total_photos")} value={stats.totalSelected} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title={t("photos_uploaded_successfully")}
                value={stats.totalSuccess}
                valueColor="var(--st-success)"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title={t("photos_pending_for_submission")}
                value={stats.totalPending}
                valueColor="var(--st-warning)"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                title={t("photos_with_error")}
                value={stats.totalError}
                valueColor="var(--st-error)"
              />
            </Grid>
          </Grid>

          {/* Footer */}
          <Divider sx={{ borderColor: "var(--st-divider)" }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Link href="/app/clients" passHref legacyBehavior>
              <DialogPrimaryButton component="a">
                {t("finish_and_exit")}
              </DialogPrimaryButton>
            </Link>
          </Box>
        </Stack>
      </Paper>
    </>
  );
}
