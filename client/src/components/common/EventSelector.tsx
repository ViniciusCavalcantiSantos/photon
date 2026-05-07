'use client'

import React, {useEffect, useMemo, useState} from 'react';
import {TreeSelect} from 'antd';
import {t} from "i18next";
import Contract from "@/types/Contract";
import Event from "@/types/Event";
import {fetchContracts} from "@/lib/api/contracts/fetchContracts";
import {fetchEvents} from "@/lib/api/events/fetchEvents";

interface EventSelectorProps {
  value?: number[];
  onChange?: (value: number[]) => void;
}

function EventSelector({value, onChange}: EventSelectorProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [contractsRes, eventsRes] = await Promise.all([
          fetchContracts(1, 100),
          fetchEvents({page: 1, pageSize: 100})
        ]);

        setContracts(contractsRes.contracts);
        setEvents(eventsRes.events);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const treeData = useMemo(() => {
    return contracts.reduce((acc, contract) => {
      const contractEvents = events.filter(event => event.contractId === contract.id);
      if (contractEvents.length) {
        acc.push({
          title: contract.code + ' - ' + contract.title,
          value: 'contract-' + contract.id,
          key: 'contract-' + contract.id,
          selectable: false,
          children: contractEvents.map(event => ({
            title: event.type.name + ': ' + event.title,
            value: event.id,
            key: event.id,
          })),
        });
      }
      return acc;
    }, [] as any[])
  }, [contracts, events]);

  return (
    <>
      <TreeSelect
        title={t('events')}
        style={{width: '100%'}}
        value={loading ? [] : value}
        onChange={onChange}
        treeData={treeData}
        treeCheckable={true}
        showCheckedStrategy={TreeSelect.SHOW_CHILD}
        placeholder={t('select_events')}
        treeDefaultExpandAll
        multiple
        loading={loading}
        allowClear
        showSearch={{
          filterTreeNode: (input, treeNode) => (
            (treeNode?.title as string)?.toLowerCase().includes(input.toLowerCase())
          )
        }}
      />
    </>
  );
}

export default EventSelector;