"use client";

import { useId, useState } from "react";
import { useMatchuStore } from "@/lib/store";
import { CatalogBoard } from "../catalog-board";
import { LibraryCatalog } from "../library/library-catalog";
import { LIBRARY_ITEMS } from "../library/catalog";
import "@/styles/library-kit.css";

export function WebComponentsCatalog() {
  const [tab, setTab] = useState("default");
  const ko = useMatchuStore(state => state.locale) === "ko";
  const id = useId();
  const options = [["default", ko ? "기본" : "Default"], ["cushion", ko ? "쿠션" : "Cushion"], ["ink", ko ? "잉크" : "Ink"]];
  return <div className="ui-library-catalog">
    <div className="ui-library-tabs" role="tablist" aria-label={ko ? "UI 라이브러리" : "UI library"}>
      {options.map(([key, label], index) => <button key={key} type="button" id={`${id}-${key}`} role="tab" aria-selected={tab === key} aria-controls={`${id}-panel`} tabIndex={tab === key ? 0 : -1} onClick={() => setTab(key)} onKeyDown={event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault(); const next = event.key === "Home" ? 0 : event.key === "End" ? 2 : (index + (event.key === "ArrowRight" ? 1 : 2)) % 3;
        setTab(options[next][0]); document.getElementById(`${id}-${options[next][0]}`)?.focus();
      }}>{label}{key !== "default" && <span>{LIBRARY_ITEMS.length}</span>}</button>)}
    </div>
    <div className="ui-library-tab-panel" id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${tab}`}>
      {tab === "default" ? <CatalogBoard platform="web" /> : <LibraryCatalog key={tab} style={tab === "cushion" ? "cushion" : "ink"} />}
    </div>
  </div>;
}
