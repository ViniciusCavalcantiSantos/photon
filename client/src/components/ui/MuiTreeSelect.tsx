"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useT } from "@/i18n/client";
import {
  Box,
  CircularProgress,
  Collapse,
  IconButton,
  InputAdornment,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import StyledCheckbox from "@/components/ui/StyledCheckbox";

/* ─── types ─── */
export interface TreeNode {
  title: string;
  key: string | number;
  value: string | number;
  selectable?: boolean;
  children?: TreeNode[];
}

export interface MuiTreeSelectProps {
  treeData: TreeNode[];
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  placeholder?: string;
  loading?: boolean;
  maxHeight?: number | string;
  inputBackground?: string;
  labelSelected?: (count: number) => string;
  labelNoResults?: string;
  labelNoItems?: string;
  labelClear?: string;
}

/* ─── sx tokens ─── */
function buildInputSx(bg: string) {
  return {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: bg,
      color: "var(--st-text)",
      fontSize: "0.875rem",
      "& fieldset": { borderColor: "var(--st-border)", top: 0 },
      "& fieldset legend": { display: "none" },
      "&:hover fieldset": { borderColor: "var(--st-primary)" },
      "&.Mui-focused fieldset": { borderColor: "var(--st-primary)" },
      alignItems: "center",
    },
    "& .MuiInputBase-input": {
      color: "var(--st-text)",
      padding: "8.5px 14px",
      lineHeight: "normal",
    },
    "& .MuiInputBase-input::placeholder": { color: "var(--st-text-sec)", opacity: 1 },
  } as const;
}

/* ─── helpers ─── */
function getAllLeafValues(node: TreeNode): (string | number)[] {
  if (!node.children?.length) return [node.value];
  return node.children.flatMap(getAllLeafValues);
}

function nodeMatchesSearch(node: TreeNode, term: string): boolean {
  const lower = term.toLowerCase();
  if (node.title.toLowerCase().includes(lower)) return true;
  return node.children?.some((c) => nodeMatchesSearch(c, term)) ?? false;
}

/* ─── Group row — memoized, receives pre-computed booleans ─── */
const GroupRow = React.memo(function GroupRow({
  node,
  isChecked,
  isIndeterminate,
  onToggleGroup,
  expanded,
  onToggleExpand,
}: {
  node: TreeNode;
  isChecked: boolean;
  isIndeterminate: boolean;
  onToggleGroup: (node: TreeNode) => void;
  expanded: boolean;
  onToggleExpand: (key: string | number) => void;
}) {
  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 0.25, pr: 1,
      borderRadius: "8px", "&:hover": { backgroundColor: "rgba(255,255,255,0.04)" },
    }}>
      <IconButton size="small" onClick={() => onToggleExpand(node.key)}
        sx={{ color: "var(--st-text-sec)", p: 0.25, flexShrink: 0 }}>
        {expanded ? <ExpandMoreIcon sx={{ fontSize: 18 }} /> : <ChevronRightIcon sx={{ fontSize: 18 }} />}
      </IconButton>
      <StyledCheckbox size="small" checked={isChecked} indeterminate={isIndeterminate}
        onChange={() => onToggleGroup(node)} />
      <Typography onClick={() => onToggleExpand(node.key)} sx={{
        fontSize: "0.875rem", fontWeight: 600, color: "var(--st-text)",
        lineHeight: 1.4, py: 0.75, flex: 1, cursor: "pointer", userSelect: "none",
      }}>
        {node.title}
      </Typography>
    </Box>
  );
});

/* ─── Leaf row — memoized, only re-renders when its own checked state changes ─── */
const LeafRow = React.memo(function LeafRow({ node, checked, onToggle }: {
  node: TreeNode;
  checked: boolean;
  onToggle: (value: string | number) => void;
}) {
  return (
    <Box onClick={() => onToggle(node.value)} sx={{
      display: "flex", alignItems: "center", gap: 0.25, pl: 3.5, pr: 1,
      borderRadius: "8px", cursor: "pointer",
      "&:hover": { backgroundColor: "rgba(255,255,255,0.04)" },
    }}>
      <StyledCheckbox size="small" checked={checked}
        onChange={() => onToggle(node.value)}
        onClick={(e) => e.stopPropagation()} />
      <Typography sx={{
        fontSize: "0.875rem", color: "var(--st-text)",
        lineHeight: 1.4, py: 0.75, flex: 1, userSelect: "none",
      }}>
        {node.title}
      </Typography>
    </Box>
  );
});

/* ─── Main component ─── */
export default function MuiTreeSelect({
  treeData, value, onChange, placeholder = "Select…", loading = false, maxHeight = 300,
  inputBackground = "var(--st-bg-elevated)",
  labelSelected,
  labelNoResults,
  labelNoItems,
  labelClear,
}: MuiTreeSelectProps) {
  const { t } = useT();

  /* Keep a ref to latest value+onChange so callbacks can be truly stable */
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  useLayoutEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  });

  const resolvedLabelSelected = labelSelected ?? ((n: number) =>
    t(n === 1 ? "item_selected_one" : "item_selected_other", { count: n })
  );
  const resolvedLabelNoResults = labelNoResults ?? t("no_results_found");
  const resolvedLabelNoItems   = labelNoItems   ?? t("no_items_available");
  const resolvedLabelClear     = labelClear     ?? t("clear");

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [dropdownAbove, setDropdownAbove] = useState(false);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string | number>>(new Set());

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Flip dropdown above when near the bottom of the viewport */
  useEffect(() => {
    if (!open || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const dropdownHeight = typeof maxHeight === "number" ? maxHeight + 60 : 360;
    const spaceBelow = window.innerHeight - rect.bottom;
    setDropdownAbove(spaceBelow < dropdownHeight && rect.top > dropdownHeight);
  }, [open, maxHeight]);

  const leafCount = value.filter((v) => typeof v === "number").length;

  const inputValue = open
    ? search
    : leafCount > 0
      ? resolvedLabelSelected(leafCount)
      : "";

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
    setSearch("");
  };

  /* Stable callbacks — never recreated, read latest value via ref */
  const handleLeafToggle = useCallback((leafValue: string | number) => {
    const v = valueRef.current;
    onChangeRef.current(
      v.includes(leafValue) ? v.filter((x) => x !== leafValue) : [...v, leafValue]
    );
  }, []); // truly stable — deps are refs

  const handleGroupToggle = useCallback((node: TreeNode) => {
    const v = valueRef.current;
    const leafValues = getAllLeafValues(node);
    const allSelected = leafValues.every((lv) => v.includes(lv));
    onChangeRef.current(
      allSelected
        ? v.filter((x) => !leafValues.includes(x))
        : [...v, ...leafValues.filter((x) => !v.includes(x))]
    );
  }, []); // truly stable

  const toggleCollapse = useCallback((key: string | number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return treeData;
    return treeData
      .filter((node) => nodeMatchesSearch(node, search))
      .map((group) => ({
        ...group,
        children: group.children?.filter((c) =>
          c.title.toLowerCase().includes(search.toLowerCase())),
      }));
  }, [treeData, search]);

  /* Pre-compute group check state as stable booleans so GroupRow memo works */
  const groupCheckState = useMemo(() => {
    const map = new Map<string | number, { isChecked: boolean; isIndeterminate: boolean }>();
    for (const group of filtered) {
      const leafValues = getAllLeafValues(group);
      const selectedCount = leafValues.filter((v) => value.includes(v)).length;
      map.set(group.key, {
        isChecked: leafValues.length > 0 && selectedCount === leafValues.length,
        isIndeterminate: selectedCount > 0 && selectedCount < leafValues.length,
      });
    }
    return map;
  }, [filtered, value]);

  return (
    <Box ref={wrapperRef} sx={{ position: "relative" }}>

      {/* ── Input trigger ── */}
      <TextField
        fullWidth
        size="small"
        value={inputValue}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => { setSearch(""); setOpen(true); }}
        placeholder={placeholder}
        autoComplete="off"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                {loading ? (
                  <CircularProgress size={14} sx={{ color: "var(--st-text-sec)" }} />
                ) : leafCount > 0 && !open ? (
                  <Tooltip title={resolvedLabelClear} arrow>
                    <IconButton size="small" onClick={handleClear} edge="end"
                      sx={{ color: "var(--st-text-sec)", "&:hover": { color: "var(--st-text)" } }}>
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <SearchIcon sx={{ fontSize: 18, color: "var(--st-text-sec)" }} />
                )}
              </InputAdornment>
            ),
          },
        }}
        label={undefined}
        sx={buildInputSx(inputBackground)}
      />

      {/* ── Dropdown panel ── */}
      {open && (
        <Box sx={{
          position: "absolute",
          ...(dropdownAbove
            ? { bottom: "100%", top: "auto", mb: 0.5 }
            : { top: "100%", bottom: "auto", mt: 0.5 }),
          left: 0,
          right: 0,
          zIndex: 1400,
          borderRadius: "12px",
          backgroundColor: "var(--st-bg-elevated)",
          border: "1px solid var(--st-border)",
          boxShadow: "var(--st-shadow-elevated)",
          overflow: "hidden",
        }}>
          <Box sx={{ maxHeight, overflowY: "auto", p: 0.75 }}>
            {loading ? (
              [1, 2, 3].map((i) => (
                <Box key={i} sx={{ mb: 0.5 }}>
                  <Skeleton variant="rounded" height={32}
                    sx={{ bgcolor: "var(--st-bg-paper)", mb: 0.25 }} />
                  {[1, 2].map((j) => (
                    <Skeleton key={j} variant="rounded" height={28}
                      sx={{ bgcolor: "var(--st-bg-paper)", ml: 4, mb: 0.25 }} />
                  ))}
                </Box>
              ))
            ) : filtered.length === 0 ? (
              <Box sx={{ py: 3, textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: "var(--st-text-sec)" }}>
                  {search ? resolvedLabelNoResults : resolvedLabelNoItems}
                </Typography>
              </Box>
            ) : (
              filtered.map((group) => {
                const isExpanded = !collapsed.has(group.key);
                const { isChecked, isIndeterminate } = groupCheckState.get(group.key)!;
                return (
                  <Box key={group.key}>
                    <GroupRow
                      node={group}
                      isChecked={isChecked}
                      isIndeterminate={isIndeterminate}
                      onToggleGroup={handleGroupToggle}
                      expanded={isExpanded}
                      onToggleExpand={toggleCollapse}
                    />
                    <Collapse in={isExpanded} timeout={0}>
                      <Box>
                        {group.children?.map((child) => (
                          <LeafRow
                            key={child.key}
                            node={child}
                            checked={value.includes(child.value)}
                            onToggle={handleLeafToggle}
                          />
                        ))}
                      </Box>
                    </Collapse>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
