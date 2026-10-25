"use client";

import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { useId, useRef, useState, type ChangeEvent, type CompositionEvent, type ReactNode, type Ref } from "react";
import { CAPTURES, CAPTURE_HINT, CAPTURE_LABEL, DEVICES, DEVICE_LABEL } from "@/lib/shots";
import type { Facet, Filters } from "./filters";
import { MAX_QUERY_LENGTH } from "./filters";
import type { BrowserMode, SectionMeta } from "./types";
import styles from "./filter-bar.module.css";

/** 選択肢ごとの数（"" は「すべて」） */
export type FacetCounts = Record<Facet, Record<string, number>>;

type Props = {
  mode: BrowserMode;
  filters: Filters;
  counts: FacetCounts;
  /** 領域の選択肢（mode が all のときだけ使う） */
  sections: SectionMeta[];
  /** 検索欄に表示する言葉（入力中の言葉を含む） */
  queryInput: string;
  activeFacets: number;
  hasFilter: boolean;
  /** 一覧に表示している数（スマートフォンで絞り込みを閉じるボタンに添える） */
  visibleCount: number;
  onQueryInput: (value: string, composing: boolean) => void;
  onQueryCommit: () => void;
  onQueryClear: () => void;
  onFacetChange: (facet: Facet, value: string) => void;
  onClearAll: () => void;
  barRef?: Ref<HTMLDivElement>;
};

type Option = { value: string; label: ReactNode; count: number; hint?: string };

/**
 * 絞り込みの帯。PC では画面の上部に固定し、すべての条件を並べます。
 * スマートフォンでは、検索欄と「絞り込み」ボタンだけの細い帯にし、ボタンを押すと条件の一覧が開きます。
 */
export function FilterBar({
  mode,
  filters,
  counts,
  sections,
  queryInput,
  activeFacets,
  hasFilter,
  visibleCount,
  onQueryInput,
  onQueryCommit,
  onQueryClear,
  onFacetChange,
  onClearAll,
  barRef,
}: Props) {
  const id = useId();
  const panelId = `${id}-panel`;
  const inputId = `${id}-q`;
  const [panelOpen, setPanelOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const deviceOptions: Option[] = [
    { value: "", label: "すべて", count: counts.device[""] ?? 0 },
    ...DEVICES.map((d) => ({ value: d, label: DEVICE_LABEL[d], count: counts.device[d] ?? 0 })),
  ];
  const captureOptions: Option[] = [
    { value: "", label: "すべて", count: counts.capture[""] ?? 0 },
    ...CAPTURES.map((c) => ({ value: c, label: CAPTURE_LABEL[c], count: counts.capture[c] ?? 0, hint: CAPTURE_HINT[c] })),
  ];
  const sectionOptions: Option[] = [
    { value: "", label: "すべて", count: counts.section[""] ?? 0 },
    ...sections.map((s) => ({
      value: s.id,
      label: (
        <>
          <span className={styles.optionNo} aria-hidden>
            {s.no}
          </span>
          {s.title}
        </>
      ),
      count: counts.section[s.id] ?? 0,
    })),
  ];

  const closePanel = () => {
    setPanelOpen(false);
    toggleRef.current?.focus();
  };

  return (
    <div className={styles.bar} ref={barRef}>
      <form
        className={`container ${styles.form}`}
        role="search"
        aria-label="画面の絞り込み"
        onSubmit={(e) => {
          e.preventDefault();
          onQueryCommit();
          // スマートフォン・タブレットでは、キーボードを閉じて結果を見やすくする
          if (window.matchMedia("(max-width: 1279px)").matches) inputRef.current?.blur();
        }}
      >
        <div className={styles.search}>
          <label htmlFor={inputId} className="visually-hidden">
            言葉で探す（ひらがな・カタカナのどちらでも探せます）
          </label>
          <Search aria-hidden className={styles.searchIcon} />
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            className={styles.input}
            value={queryInput}
            placeholder="言葉で探す"
            maxLength={MAX_QUERY_LENGTH}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const native = e.nativeEvent as InputEvent;
              onQueryInput(e.target.value, Boolean(native.isComposing));
            }}
            onCompositionEnd={(e: CompositionEvent<HTMLInputElement>) => onQueryInput(e.currentTarget.value, false)}
          />
          {queryInput !== "" && (
            <button
              type="button"
              className={styles.searchClear}
              aria-label="言葉を消す"
              onClick={() => {
                onQueryClear();
                inputRef.current?.focus();
              }}
            >
              <X aria-hidden />
            </button>
          )}
        </div>

        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-expanded={panelOpen}
          aria-controls={panelId}
          onClick={() => setPanelOpen((open) => !open)}
        >
          <SlidersHorizontal aria-hidden />
          絞り込み
          {activeFacets > 0 && (
            <span className={styles.badge}>
              {activeFacets}
              <span className="visually-hidden">件の条件を選んでいます</span>
            </span>
          )}
        </button>

        <div
          id={panelId}
          className={styles.panel}
          data-open={panelOpen}
          onKeyDown={(e) => {
            // スマートフォン・タブレットで開いた条件の一覧は、Esc でも閉じられる
            if (e.key === "Escape" && panelOpen) {
              e.preventDefault();
              closePanel();
            }
          }}
        >
          <ChoiceGroup
            legend="端末"
            name={`${id}-device`}
            options={deviceOptions}
            value={filters.device ?? ""}
            onChange={(v) => onFacetChange("device", v)}
          />
          <ChoiceGroup
            legend="範囲"
            name={`${id}-capture`}
            options={captureOptions}
            value={filters.capture ?? ""}
            onChange={(v) => onFacetChange("capture", v)}
          />
          {mode === "all" && (
            <ChoiceGroup
              legend="領域"
              name={`${id}-section`}
              options={sectionOptions}
              value={filters.section ?? ""}
              onChange={(v) => onFacetChange("section", v)}
              wide
            />
          )}
          <div className={styles.panelFooter}>
            {hasFilter && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={onClearAll}>
                <RotateCcw aria-hidden />
                条件をすべて解除
              </button>
            )}
            <button type="button" className={`btn btn-noir btn-sm ${styles.done}`} onClick={closePanel}>
              {visibleCount}枚を表示
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function ChoiceGroup({
  legend,
  name,
  options,
  value,
  onChange,
  wide = false,
}: {
  legend: string;
  name: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  wide?: boolean;
}) {
  return (
    <fieldset className={styles.group} data-wide={wide || undefined}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.value || "all"} className={styles.option} title={option.hint}>
            <input
              type="radio"
              className={styles.radio}
              name={name}
              value={option.value}
              checked={value === option.value}
              // いまの条件では1枚もない選択肢は選べないようにする（選んでいるものは、外せるようにそのまま）
              disabled={option.count === 0 && value !== option.value}
              onChange={() => onChange(option.value)}
            />
            <span className={styles.optionLabel}>{option.label}</span>
            <span className={styles.optionCount}>
              {option.count}
              <span className="visually-hidden">枚</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
