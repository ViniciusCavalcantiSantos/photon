"use client";

import React, { useMemo } from "react";
import { useT } from "@/i18n/client";
import { useContracts } from "@/lib/queries/contracts/useContracts";
import MuiTreeSelect, { TreeNode } from "@/components/ui/MuiTreeSelect";

interface EventSelectorProps {
  value?: number[];
  onChange?: (value: number[]) => void;
}

function EventSelector({ value = [], onChange }: EventSelectorProps) {
  const { t } = useT();
  const { data, isLoading } = useContracts('', 1, 1000, true, true);

  const treeData = useMemo<TreeNode[]>(() => {
    return (data?.contracts ?? [])
      .filter((c) => c.events?.length)
      .map((contract) => ({
        title: `${contract.code} - ${contract.title}`,
        key: `contract-${contract.id}`,
        value: `contract-${contract.id}`,
        selectable: false,
        children: (contract.events ?? []).map((event) => ({
          title: `${event.typeName}: ${event.title}`,
          key: event.id,
          value: event.id,
        })),
      }));
  }, [data]);

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
      loading={isLoading}
      labelSelected={(n) => t(n === 1 ? "events_selected_one" : "events_selected_other", { count: n })}
      labelNoResults={t("tree_select_no_results")}
      labelNoItems={t("tree_select_no_events")}
      labelClear={t("clear")}
    />
  );
}

export default EventSelector;