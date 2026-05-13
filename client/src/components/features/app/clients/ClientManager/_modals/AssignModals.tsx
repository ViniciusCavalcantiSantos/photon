import { useT } from "@/i18n/client";
import { useNotification } from "@/contexts/NotificationContext";
import { useEffect, useState } from "react";
import { assignClient } from "@/lib/api/assignments/assignClient";
import { assignClientBulk } from "@/lib/api/assignments/assignClientBulk";
import { unassignClientBulk } from "@/lib/api/assignments/unassignClientBulk";
import { Box, Divider, Typography } from "@mui/material";
import EventSelector from "@/components/common/EventSelector";
import StyledDialog from "@/components/ui/StyledDialog";
import DialogCancelButton from "@/components/ui/DialogCancelButton";
import DialogPrimaryButton from "@/components/ui/DialogPrimaryButton";

interface AssignModalsProps {
  openModalAssign: boolean;
  handleClose: () => void;
  clientIds: number[];
  initialAssignments: number[];
  type: "single" | "bulk" | "unassign";
}

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
    <StyledDialog open={openModalAssign} onClose={handleClose} minWidth={480}>
      <Typography sx={{ color: "var(--st-text)", fontWeight: 700, px: 3, pt: 2.5, pb: 1 }}>
        {title}
      </Typography>
      <Divider sx={{ borderColor: "var(--st-divider)" }} />

      <Box sx={{ px: 3, pt: 2, pb: 1, minHeight: 80 }}>
        <EventSelector value={assignments} onChange={setAssignments} />
      </Box>

      <Divider sx={{ borderColor: "var(--st-divider)" }} />
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, px: 3, py: 2 }}>
        <DialogCancelButton onClick={handleClose} disabled={loading}>
          {t("cancel")}
        </DialogCancelButton>
        <DialogPrimaryButton
          color={isUnassign ? "warning" : "primary"}
          onClick={handleAssign}
          disabled={loading}
        >
          {okText}
        </DialogPrimaryButton>
      </Box>
    </StyledDialog>
  );
}
