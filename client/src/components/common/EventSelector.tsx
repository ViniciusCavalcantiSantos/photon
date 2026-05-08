"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useT } from "@/i18n/client";
import Contract from "@/types/Contract";
import Event from "@/types/Event";
import { fetchContracts } from "@/lib/api/contracts/fetchContracts";
import { fetchEvents } from "@/lib/api/events/fetchEvents";
import MuiTreeSelect, { TreeNode } from "@/components/ui/MuiTreeSelect";

interface EventSelectorProps {
  value?: number[];
  onChange?: (value: number[]) => void;
}

function EventSelector({ value = [], onChange }: EventSelectorProps) {
  const { t } = useT();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [contractsRes, eventsRes] = await Promise.all([
          fetchContracts(1, 100),
          fetchEvents({ page: 1, pageSize: 100 }),
        ]);
        setContracts(contractsRes.contracts);
        setEvents(eventsRes.events);
      } catch {
        // silent — tree will show empty state
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const treeData = useMemo<TreeNode[]>(() => {
    return contracts.reduce<TreeNode[]>((acc, contract) => {
      const contractEvents = events.filter((e) => e.contractId === contract.id);
      if (contractEvents.length) {
        acc.push({
          title: `${contract.code} - ${contract.title}`,
          key: `contract-${contract.id}`,
          value: `contract-${contract.id}`,
          selectable: false,
          children: contractEvents.map((event) => ({
            title: `${event.type.name}: ${event.title}`,
            key: event.id,
            value: event.id,
          })),
        });
      }
      return acc;
    }, []);
  }, [contracts, events]);

  const handleChange = (selected: (string | number)[]) => {
    // only emit numeric leaf values (event IDs), not contract keys
    onChange?.(selected.filter((v): v is number => typeof v === "number"));
  };

  return (
    <MuiTreeSelect
      treeData={treeData}
      value={value}
      onChange={handleChange}
      placeholder={t("select_events")}
      loading={loading}
    />
  );
}

export default EventSelector;