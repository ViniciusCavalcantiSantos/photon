"use client"

import React, { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Fab,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Popover,
  Select,
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
import GroupIcon from "@mui/icons-material/Group";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import CloseIcon from "@mui/icons-material/Close";

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
import ClientCard from "@/components/features/app/clients/ClientManager/_components/ClientCard";

/* ── shared sx tokens ── */
const filterSelectSx = {
  borderRadius: '12px',
  backgroundColor: 'var(--st-bg-paper)',
  color: 'var(--st-text)',
  fontSize: '0.85rem',
  '& fieldset': { borderColor: 'var(--st-border)' },
  '&:hover fieldset': { borderColor: 'var(--st-primary)' },
  '&.Mui-focused fieldset': { borderColor: 'var(--st-primary)' },
  '& .MuiSvgIcon-root': { color: 'var(--st-text-sec)' },
} as const;

const filterMenuProps = {
  slotProps: {
    paper: {
      sx: {
        backgroundColor: 'var(--st-bg-elevated)',
        border: '1px solid var(--st-border)',
        borderRadius: '12px',
        '& .MuiMenuItem-root': {
          color: 'var(--st-text)',
          fontSize: '0.85rem',
          '&:hover': { backgroundColor: 'var(--st-primary-light)' },
          '&.Mui-selected': { backgroundColor: 'var(--st-primary-light)' },
        },
      },
    },
  },
};

/* ── Main component ── */
export default function ClientManager() {
  const { t } = useT();
  const [openModalRegister, setOpenModalRegister] = useState(false);
  const [openModalGenerateLink, setOpenModalGenerateLink] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);

  const { defaultDateFormat } = useUser();
  const { queryParams, searchProps, pagination, filters } = useServerTable<Client>({
    defaultSortBy: 'created_at',
    defaultSortOrder: 'desc',
  });

  const { data, isLoading, isError, error, refetch } = useClients({
    searchTerm: queryParams.searchTerm,
    page: queryParams.page,
    pageSize: queryParams.pageSize,
    sortBy: queryParams.sortBy,
    sortOrder: queryParams.sortOrder,
  });
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
  const isFilterMenuOpen = Boolean(filterAnchorEl);
  const hasCustomSort = filters.sortBy !== 'created_at' || filters.sortOrder !== 'desc';

  const handleToggleSelect = (id: number) => {
    if (!selectMode) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleToggleSelectMode = () => {
    setSelectMode((prev) => {
      if (prev) setSelectedIds([]);
      return !prev;
    });
  };

  const handleDelete = (client: Client) => removeClient.mutate(client.id);

  const handleUnassign = (client: Client) =>
    assignCtrl.actions.openUnassign([client.id]);

  const handleResetFilters = () => {
    filters.onSortByChange('created_at');
    filters.onSortOrderChange('desc');
  };

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
          sx={{
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
          }}
        />

        {/* Filter button */}
        <Tooltip title={t('filters')} arrow>
          <IconButton
            onClick={(e) => setFilterAnchorEl(e.currentTarget)}
            aria-label={t('filters')}
            aria-haspopup="true"
            aria-expanded={isFilterMenuOpen ? 'true' : undefined}
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              border: '1px solid var(--st-border)',
              backgroundColor: isFilterMenuOpen ? 'var(--st-primary-light)' : 'var(--st-bg-paper)',
              color: isFilterMenuOpen || hasCustomSort ? 'var(--st-primary)' : 'var(--st-text-sec)',
              '&:hover': {
                borderColor: 'var(--st-primary)',
                backgroundColor: 'var(--st-primary-light)',
              },
            }}
          >
            <Badge
              badgeContent={Number(hasCustomSort)}
              color="primary"
              invisible={!hasCustomSort}
              sx={{
                '& .MuiBadge-badge': {
                  minWidth: 16,
                  height: 16,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--st-primary)',
                },
              }}
            >
              <FilterListIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Select mode toggle */}
        <Button
          variant={selectMode ? "contained" : "outlined"}
          startIcon={<CheckBoxOutlinedIcon />}
          onClick={handleToggleSelectMode}
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            whiteSpace: "nowrap",
            backgroundColor: selectMode ? "var(--st-primary)" : "var(--st-bg-paper)",
            borderColor: selectMode ? "var(--st-primary)" : "var(--st-border)",
            color: selectMode ? "#fff" : "var(--st-text-sec)",
            "&:hover": {
              backgroundColor: selectMode ? "var(--st-primary-hover)" : "var(--st-primary-light)",
              borderColor: "var(--st-primary)",
              color: selectMode ? "#fff" : "var(--st-primary)",
            },
          }}
        >
          {selectMode ? t("exit_select_mode") : t("select_mode")}
        </Button>

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

      {/* ── Filter Popover ── */}
      <Popover
        open={isFilterMenuOpen}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: { xs: 'calc(100vw - 32px)', sm: 340 },
              borderRadius: '16px',
              backgroundColor: 'var(--st-bg-elevated)',
              border: '1px solid var(--st-border)',
              boxShadow: 'var(--st-shadow-elevated)',
              color: 'var(--st-text)',
              overflow: 'hidden',
            },
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, mb: 2 }}>
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
              <FilterListIcon fontSize="small" />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, color: 'var(--st-text)', lineHeight: 1.2 }}>
                {t('filters')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--st-text-sec)' }}>
                {hasCustomSort ? t('filters_active') : t('default_view')}
              </Typography>
            </Box>
            <Tooltip title={t('close')} arrow>
              <IconButton
                size="small"
                onClick={() => setFilterAnchorEl(null)}
                sx={{ color: 'var(--st-text-sec)', '&:hover': { backgroundColor: 'var(--st-primary-light)', color: 'var(--st-text)' } }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <Divider sx={{ mb: 2, borderColor: 'var(--st-divider)' }} />

          {/* Sort section */}
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1.5 }}>
            <SwapVertIcon sx={{ color: 'var(--st-text-sec)', fontSize: 20 }} />
            <Typography sx={{ color: 'var(--st-text)', fontWeight: 700, fontSize: '0.9rem' }}>
              {t('sort_by')}
            </Typography>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <FormControl size="small" fullWidth>
              <Select
                value={filters.sortBy}
                onChange={(e) => filters.onSortByChange(e.target.value)}
                sx={filterSelectSx}
                MenuProps={filterMenuProps}
              >
                <MenuItem value="created_at">{t('created_at')}</MenuItem>
                <MenuItem value="name">{t('name')}</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <Select
                value={filters.sortOrder}
                onChange={(e) => filters.onSortOrderChange(e.target.value as 'asc' | 'desc')}
                sx={filterSelectSx}
                MenuProps={filterMenuProps}
              >
                <MenuItem value="desc">{t('newest_first')}</MenuItem>
                <MenuItem value="asc">{t('oldest_first')}</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {hasCustomSort && (
            <Button
              fullWidth
              variant="text"
              onClick={handleResetFilters}
              sx={{
                mt: 2,
                borderRadius: '10px',
                textTransform: 'none',
                color: 'var(--st-text-sec)',
                fontWeight: 600,
                '&:hover': { backgroundColor: 'var(--st-primary-light)', color: 'var(--st-primary)' },
              }}
            >
              {t('reset_filters')}
            </Button>
          )}
        </Box>
      </Popover>

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
            onClick={() => { setSelectedIds([]); setSelectMode(false); }}
            sx={{ borderRadius: "8px", textTransform: "none", color: "var(--st-text-sec)" }}
          >
            {t("clear")}
          </Button>
        </Box>
      )}

      {/* ── Select mode hint ── */}
      {selectMode && !hasSelected && (
        <Box
          sx={{
            mb: 2,
            px: 2,
            py: 1,
            borderRadius: "10px",
            backgroundColor: "var(--st-primary-light)",
            border: "1px dashed var(--st-primary)",
          }}
        >
          <Typography sx={{ color: "var(--st-primary)", fontSize: "0.82rem", fontWeight: 600 }}>
            {t("select_mode_hint")}
          </Typography>
        </Box>
      )}

      {/* ── Client Cards ── */}
      {isLoading ? (
        <Stack spacing={2}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="rounded" height={140} sx={{ borderRadius: "16px", bgcolor: "var(--st-bg-elevated)" }} />
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
              isSelected={selectedIds.includes(client.id)}
              selectMode={selectMode}
              onToggleSelect={handleToggleSelect}
              onAssign={assignCtrl.actions.openSingle}
              onUnassign={handleUnassign}
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
