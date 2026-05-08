"use client"

import React, { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Fab,
  IconButton,
  InputAdornment,
  Pagination,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import EditIcon from "@mui/icons-material/Edit";
import LinkIcon from "@mui/icons-material/Link";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BadgeIcon from "@mui/icons-material/Badge";
import Link from "next/link";
import dayjs from "dayjs";

import { useT } from "@/i18n/client";
import Client from "@/types/Client";
import { useUser } from "@/contexts/UserContext";
import { useClients } from "@/lib/queries/clients/useClients";
import { useRemoveClient } from "@/lib/queries/clients/useRemoveClient";
import PageHeader from "@/components/common/layout/PageHeader";
import AssignModals from "@/components/features/app/clients/ClientManager/_modals/AssignModals";
import CreateRegisterLinkModal from "@/components/features/app/clients/ClientManager/_modals/CreateRegisterLinkModal";
import { useServerTable } from "@/hooks/useServerTable";
import RegisterTypeModal from "@/components/features/app/clients/ClientManager/_modals/RegisterTypeModal";
import { useClientAssignments } from "@/lib/queries/assignments/useClientAssignments";
import { useAssignController } from "@/components/features/app/clients/ClientManager/_hooks/useAssignController";

/* ── shared sx tokens (same pattern as EventManager) ── */
const searchSx = {
  flex: 1,
  maxWidth: { sm: 360 },
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "var(--st-bg-paper)",
    color: "var(--st-text)",
    "& fieldset": { borderColor: "var(--st-border)" },
    "&:hover fieldset": { borderColor: "var(--st-primary)" },
    "&.Mui-focused fieldset": { borderColor: "var(--st-primary)" },
  },
  "& .MuiInputBase-input::placeholder": { color: "var(--st-text-sec)", opacity: 1 },
} as const;

/* ── Client Card ── */
function ClientCard({
  client,
  defaultDateFormat,
  selectedIds,
  onToggleSelect,
  onAssign,
  onDelete,
}: {
  client: Client;
  defaultDateFormat?: string;
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onAssign: (client: Client) => void;
  onDelete: (client: Client) => void;
}) {
  const { t } = useT();
  const isSelected = selectedIds.includes(client.id);

  const initials = client.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Card
      variant="outlined"
      onClick={() => onToggleSelect(client.id)}
      sx={{
        borderRadius: "16px",
        backgroundColor: isSelected ? "var(--st-primary-light)" : "var(--st-bg-paper)",
        borderColor: isSelected ? "var(--st-primary)" : "var(--st-border)",
        boxShadow: "var(--st-shadow-card)",
        cursor: "pointer",
        transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "var(--st-shadow-elevated)",
          borderColor: "var(--st-primary)",
        },
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack direction="row" sx={{ gap: 2, alignItems: "flex-start" }}>
          {/* Avatar */}
          {client.profile?.thumb ? (
            <Avatar
              src={client.profile.thumb}
              alt={client.name}
              sx={{ width: 48, height: 48, flexShrink: 0 }}
            />
          ) : (
            <Avatar
              sx={{
                width: 48,
                height: 48,
                flexShrink: 0,
                backgroundColor: "var(--st-primary-light)",
                color: "var(--st-primary)",
                fontWeight: 700,
              }}
            >
              {initials}
            </Avatar>
          )}

          {/* Main info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
              <Box>
                <Typography
                  sx={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--st-text)", lineHeight: 1.3 }}
                >
                  {client.name}
                </Typography>
                {client.code && (
                  <Stack direction="row" sx={{ alignItems: "center", gap: 0.5, mt: 0.25 }}>
                    <BadgeIcon sx={{ fontSize: 13, color: "var(--st-text-sec)" }} />
                    <Typography variant="caption" sx={{ color: "var(--st-text-sec)" }}>
                      {client.code}
                    </Typography>
                  </Stack>
                )}
              </Box>

              {isSelected && (
                <Chip
                  label={t("selected")}
                  size="small"
                  sx={{
                    backgroundColor: "var(--st-primary)",
                    color: "#fff",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    height: 20,
                  }}
                />
              )}
            </Stack>

            {/* Meta row */}
            <Stack direction="row" sx={{ gap: 2, mt: 1, flexWrap: "wrap" }}>
              {client.birthdate && (
                <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
                  <CalendarTodayIcon sx={{ fontSize: 13, color: "var(--st-text-sec)" }} />
                  <Typography variant="caption" sx={{ color: "var(--st-text-sec)" }}>
                    {dayjs(client.birthdate).format(defaultDateFormat)}
                  </Typography>
                </Stack>
              )}
              {client.phone && (
                <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
                  <PhoneIcon sx={{ fontSize: 13, color: "var(--st-text-sec)" }} />
                  <Typography variant="caption" sx={{ color: "var(--st-text-sec)" }}>
                    {client.phone}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>
        </Stack>

        {/* Action bar */}
        <Divider sx={{ my: 1.5, borderColor: "var(--st-divider)" }} />
        <Stack direction="row" sx={{ justifyContent: "flex-end", gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
          <Tooltip title={t("edit")} arrow>
            <Link href={`/app/clients/manage/${client.id}`}>
              <IconButton
                size="small"
                sx={{
                  color: "var(--st-text-sec)",
                  "&:hover": { color: "var(--st-primary)", backgroundColor: "var(--st-primary-light)" },
                }}
              >
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Link>
          </Tooltip>
          <Tooltip title={t("assign")} arrow>
            <IconButton
              size="small"
              onClick={() => onAssign(client)}
              sx={{
                color: "var(--st-text-sec)",
                "&:hover": { color: "var(--st-primary)", backgroundColor: "var(--st-primary-light)" },
              }}
            >
              <LinkIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("delete")} arrow>
            <IconButton
              size="small"
              onClick={() => onDelete(client)}
              sx={{
                color: "var(--st-text-sec)",
                "&:hover": { color: "var(--st-error)", backgroundColor: "rgba(239,68,68,0.1)" },
              }}
            >
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
}

/* ── Main component ── */
export default function ClientManager() {
  const { t } = useT();
  const [openModalRegister, setOpenModalRegister] = useState(false);
  const [openModalGenerateLink, setOpenModalGenerateLink] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { defaultDateFormat } = useUser();
  const { queryParams, searchProps, pagination } = useServerTable<Client>();

  const { data, isLoading, isError, error, refetch } = useClients(
    queryParams.searchTerm,
    queryParams.page,
    queryParams.pageSize,
  );
  const removeClient = useRemoveClient();

  const assignCtrl = useAssignController();
  const assignmentsQuery = useClientAssignments(
    assignCtrl.state.targetSingleId,
    assignCtrl.state.type === "single" && assignCtrl.state.isOpen,
  );

  const clients = data?.clients ?? [];
  const meta = data?.meta;
  const lastPage = meta?.last_page ?? 0;
  const hasSelected = selectedIds.length > 0;

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleDelete = (client: Client) => removeClient.mutate(client.id);

  return (
    <>
      <PageHeader title={t("clients")} />

      {/* ── Toolbar ── */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mb: 2, alignItems: { sm: "center" } }}>
        <TextField
          {...searchProps}
          placeholder={t("search_client")}
          size="small"
          variant="outlined"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "var(--st-text-sec)", fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={searchSx}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModalRegister(true)}
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1,
            backgroundColor: "var(--st-primary)",
            "&:hover": { backgroundColor: "var(--st-primary-hover)" },
          }}
        >
          {t("add_new_client")}
        </Button>
      </Box>

      {/* ── Bulk-selection action bar ── */}
      {hasSelected && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
            mb: 2,
            p: 1.5,
            borderRadius: "12px",
            backgroundColor: "var(--st-bg-paper)",
            border: "1px solid var(--st-primary)",
          }}
        >
          <Stack direction="row" sx={{ alignItems: "center", gap: 1, mr: "auto" }}>
            <GroupIcon sx={{ fontSize: 18, color: "var(--st-primary)" }} />
            <Typography sx={{ fontWeight: 600, color: "var(--st-text)", fontSize: "0.875rem" }}>
              {t("items_selected", { count: selectedIds.length })}
            </Typography>
          </Stack>
          <Button
            variant="contained"
            size="small"
            onClick={() => assignCtrl.actions.openBulk(selectedIds)}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              backgroundColor: "var(--st-primary)",
              "&:hover": { backgroundColor: "var(--st-primary-hover)" },
            }}
          >
            {t("assign")}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => assignCtrl.actions.openUnassign(selectedIds)}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              borderColor: "var(--st-warning)",
              color: "var(--st-warning)",
              "&:hover": { borderColor: "var(--st-warning)", backgroundColor: "rgba(245,158,11,0.08)" },
            }}
          >
            {t("unassign")}
          </Button>
          <Button
            variant="text"
            size="small"
            onClick={() => setSelectedIds([])}
            sx={{ borderRadius: "8px", textTransform: "none", color: "var(--st-text-sec)" }}
          >
            {t("clear")}
          </Button>
        </Box>
      )}

      {/* ── Client Cards ── */}
      {isLoading ? (
        <Stack spacing={2}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: "16px", bgcolor: "var(--st-bg-elevated)" }} />
          ))}
        </Stack>
      ) : isError ? (
        <Card
          variant="outlined"
          sx={{ borderRadius: "16px", backgroundColor: "var(--st-bg-paper)", borderColor: "var(--st-border)", textAlign: "center", py: 6 }}
        >
          <CardContent>
            <ErrorOutlineIcon sx={{ fontSize: 48, color: "var(--st-error)", mb: 2 }} />
            <Typography sx={{ color: "var(--st-text)", fontWeight: 600, mb: 1 }}>
              {t("something_went_wrong")}
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--st-text-sec)", mb: 2 }}>
              {error instanceof Error ? error.message : undefined}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => refetch()}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                borderColor: "var(--st-border)",
                color: "var(--st-text)",
                "&:hover": { borderColor: "var(--st-primary)", backgroundColor: "var(--st-primary-light)" },
              }}
            >
              {t("try_again")}
            </Button>
          </CardContent>
        </Card>
      ) : clients.length === 0 ? (
        <Card
          variant="outlined"
          sx={{ borderRadius: "16px", backgroundColor: "var(--st-bg-paper)", borderColor: "var(--st-border)", textAlign: "center", py: 6 }}
        >
          <CardContent>
            <SentimentDissatisfiedIcon sx={{ fontSize: 48, color: "var(--st-text-sec)", mb: 2 }} />
            <Typography sx={{ color: "var(--st-text)", fontWeight: 600, mb: 1 }}>
              {t("no_client_found")}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenModalRegister(true)}
              sx={{
                mt: 2,
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                backgroundColor: "var(--st-primary)",
                "&:hover": { backgroundColor: "var(--st-primary-hover)" },
              }}
            >
              {t("add_new_client")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              defaultDateFormat={defaultDateFormat}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onAssign={assignCtrl.actions.openSingle}
              onDelete={handleDelete}
            />
          ))}
        </Stack>
      )}

      {/* ── Pagination ── */}
      {lastPage > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
          <Pagination
            count={lastPage}
            page={pagination.page}
            onChange={pagination.onPageChange}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
            sx={{
              "& .MuiPaginationItem-root": {
                color: "var(--st-text)",
                borderColor: "var(--st-border)",
                borderRadius: "8px",
                "&.Mui-selected": {
                  backgroundColor: "var(--st-primary)",
                  color: "#fff",
                  "&:hover": { backgroundColor: "var(--st-primary-hover)" },
                },
                "&:hover": { backgroundColor: "var(--st-primary-light)" },
              },
            }}
          />
        </Box>
      )}

      {/* ── Floating Action Button (mobile) ── */}
      <Fab
        color="primary"
        aria-label={t("add_new_client")}
        onClick={() => setOpenModalRegister(true)}
        sx={{
          display: { xs: "flex", sm: "none" },
          position: "fixed",
          bottom: 24,
          right: 24,
          backgroundColor: "var(--st-primary)",
          "&:hover": { backgroundColor: "var(--st-primary-hover)" },
        }}
      >
        <AddIcon />
      </Fab>

      {/* ── Modals ── */}
      <CreateRegisterLinkModal open={openModalGenerateLink} handleClose={() => setOpenModalGenerateLink(false)} />

      <RegisterTypeModal
        open={openModalRegister}
        onCancel={() => setOpenModalRegister(false)}
        onGenerateLink={() => setOpenModalGenerateLink(true)}
      />

      <AssignModals
        openModalAssign={assignCtrl.state.isOpen}
        handleClose={assignCtrl.actions.close}
        clientIds={assignCtrl.state.clientIds}
        type={assignCtrl.state.type}
        initialAssignments={assignmentsQuery.data?.assignments ?? []}
      />
    </>
  );
}
