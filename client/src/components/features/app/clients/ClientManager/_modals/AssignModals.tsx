import { useT } from "@/i18n/client";
import { useNotification } from "@/contexts/NotificationContext";
import { useEffect, useState } from "react";
import { assignClient } from "@/lib/api/assignments/assignClient";
import { assignClientBulk } from "@/lib/api/assignments/assignClientBulk";
import { unassignClientBulk } from "@/lib/api/assignments/unassignClientBulk";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";
import EventSelector from "@/components/common/EventSelector";

interface AssignModalsProps {
  openModalAssign: boolean;
  handleClose: () => void;
  clientIds: number[];
  initialAssignments: number[];
  type: "single" | "bulk" | "unassign";
}

/* ── shared dialog paper sx ── */
const dialogPaperSx = {
  backgroundColor: "var(--st-bg-paper)",
  backgroundImage: "none",
  border: "1px solid var(--st-border)",
  borderRadius: "16px",
  color: "var(--st-text)",
  minWidth: { xs: "calc(100vw - 32px)", sm: 480 },
} as const;

export default function AssignModals({
  openModalAssign,
  handleClose,
  clientIds,
  type,
  initialAssignments = [],
}: AssignModalsProps) {
  const { t } = useT();
  const notification = useNotification();

  const [assignments, setAssignments] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAssignments(initialAssignments);
  }, [initialAssignments]);

  const handleAssign = async () => {
    if (!clientIds.length) return;
    setLoading(true);
    try {
      let res;
      if (type === "single") {
        res = await assignClient(clientIds[0], assignments);
      } else if (type === "bulk") {
        res = await assignClientBulk(clientIds, assignments);
      } else {
        res = await unassignClientBulk(clientIds, assignments);
      }
      notification.success({ title: res.message });
      handleClose();
    } catch (err: any) {
      notification.warning({ title: err.message });
    } finally {
      setLoading(false);
    }
  };

  const title =
    type === "single"
      ? t("assign_client_to_event")
      : type === "bulk"
        ? t("assign_clients_to_events")
        : t("unassign_clients");

  const okText = type === "unassign" ? t("unassign") : t("assign");
  const isUnassign = type === "unassign";

  return (
    <Dialog
      open={openModalAssign}
      onClose={handleClose}
      slotProps={{
        paper: { sx: dialogPaperSx },
        backdrop: { sx: { backgroundColor: "var(--st-bg-mask)" } },
      }}
    >
      <DialogTitle sx={{ color: "var(--st-text)", fontWeight: 700, pb: 1 }}>
        {title}
      </DialogTitle>
      <Divider sx={{ borderColor: "var(--st-divider)" }} />

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ minHeight: 80 }}>
          <EventSelector value={assignments} onChange={setAssignments} />
        </Box>
      </DialogContent>

      <Divider sx={{ borderColor: "var(--st-divider)" }} />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
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
          onClick={handleAssign}
          disabled={loading}
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            backgroundColor: isUnassign ? "var(--st-warning)" : "var(--st-primary)",
            "&:hover": {
              backgroundColor: isUnassign ? "#d97706" : "var(--st-primary-hover)",
            },
          }}
        >
          {okText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
