"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Checkbox,
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
  /** Max height of the scrollable tree list */
  maxHeight?: number | string;
  /** Background of the trigger input. Pass 'transparent' when inside a custom-bg container. */
  inputBackground?: string;
}

/* ─── sx tokens ─── */
const checkboxSx = {
  p: 0.5,
  color: "var(--st-border)",
  "&.Mui-checked": { color: "var(--st-primary)" },
  "&.MuiCheckbox-indeterminate": { color: "var(--st-primary)" },
} as const;

function buildInputSx(bg: string) {
  return {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: bg,
      color: "var(--st-text)",
      fontSize: "0.875rem",
      /* Remove the legend notch line that MUI renders even without a label */
      "& fieldset": { borderColor: "var(--st-border)", top: 0 },
      "& fieldset legend": { display: "none" },
      "&:hover fieldset": { borderColor: "var(--st-primary)" },
      "&.Mui-focused fieldset": { borderColor: "var(--st-primary)" },
      /* Ensure vertical centering of content */
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

/* ─── Group row ─── */
function GroupRow({
  node, selected, onToggleGroup, expanded, onToggleExpand,
}: {
  node: TreeNode;
  selected: (string | number)[];
  onToggleGroup: (node: TreeNode) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const leafValues = useMemo(() => getAllLeafValues(node), [node]);
  const selectedCount = leafValues.filter((v) => selected.includes(v)).length;
  const isChecked = leafValues.length > 0 && selectedCount === leafValues.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < leafValues.length;

  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 0.25, pr: 1,
      borderRadius: "8px", "&:hover": { backgroundColor: "rgba(255,255,255,0.04)" },
    }}>
      <IconButton size="small" onClick={onToggleExpand}
        sx={{ color: "var(--st-text-sec)", p: 0.25, flexShrink: 0 }}>
        {expanded ? <ExpandMoreIcon sx={{ fontSize: 18 }} /> : <ChevronRightIcon sx={{ fontSize: 18 }} />}
      </IconButton>
      <Checkbox size="small" checked={isChecked} indeterminate={isIndeterminate}
        onChange={() => onToggleGroup(node)} sx={checkboxSx} />
      <Typography onClick={onToggleExpand} sx={{
        fontSize: "0.875rem", fontWeight: 600, color: "var(--st-text)",
        lineHeight: 1.4, py: 0.75, flex: 1, cursor: "pointer", userSelect: "none",
      }}>
        {node.title}
      </Typography>
    </Box>
  );
}

/* ─── Leaf row ─── */
function LeafRow({ node, checked, onToggle }: {
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
      <Checkbox size="small" checked={checked}
        onChange={() => onToggle(node.value)}
        onClick={(e) => e.stopPropagation()} sx={checkboxSx} />
      <Typography sx={{
        fontSize: "0.875rem", color: "var(--st-text)",
        lineHeight: 1.4, py: 0.75, flex: 1, userSelect: "none",
      }}>
        {node.title}
      </Typography>
    </Box>
  );
}

/* ─── Main component ─── */
export default function MuiTreeSelect({
  treeData, value, onChange, placeholder = "Select…", loading = false, maxHeight = 300,
  inputBackground = "var(--st-bg-elevated)",
}: MuiTreeSelectProps) {
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
      ? leafCount === 1 ? "1 event selected" : `${leafCount} events selected`
      : "";

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
    setSearch("");
  };

  const handleLeafToggle = useCallback((leafValue: string | number) => {
    onChange(value.includes(leafValue)
      ? value.filter((v) => v !== leafValue)
      : [...value, leafValue]);
  }, [value, onChange]);

  const handleGroupToggle = useCallback((node: TreeNode) => {
    const leafValues = getAllLeafValues(node);
    const allSelected = leafValues.every((v) => value.includes(v));
    onChange(allSelected
      ? value.filter((v) => !leafValues.includes(v))
      : [...value, ...leafValues.filter((v) => !value.includes(v))]);
  }, [value, onChange]);

  const toggleCollapse = (key: string | number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

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

  return (
    /* Single wrapper — input + dropdown both live here */
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
                  <Tooltip title="Clear" arrow>
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

      {/* ── Dropdown panel — positioned above or below based on available space ── */}
      {open && (
        <Box sx={{
          position: "absolute",
          ...(dropdownAbove
            ? { bottom: "100%", top: "auto", mb: 0.5 }
            : { top: "100%", bottom: "auto", mt: 0.5 }),
          left: 0,
          right: 0,
          zIndex: 1400,          /* above MUI Dialog (z-index 1300) */
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
                  {search ? "No results found" : "No events available"}
                </Typography>
              </Box>
            ) : (
              filtered.map((group) => {
                const isExpanded = !collapsed.has(group.key);
                return (
                  <Box key={group.key}>
                    <GroupRow
                      node={group}
                      selected={value}
                      onToggleGroup={handleGroupToggle}
                      expanded={isExpanded}
                      onToggleExpand={() => toggleCollapse(group.key)}
                    />
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
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
