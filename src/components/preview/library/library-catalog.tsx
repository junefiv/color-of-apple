"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useMatchuStore } from "@/lib/store";
import { LIBRARY_ITEMS, type LibraryStyle } from "./catalog";
import { LibraryDemo } from "./demos";
import "@/styles/library-kit.css";

export function LibraryCatalog({ style }: { style: LibraryStyle }) {
  const ko = useMatchuStore(state => state.locale) === "ko";
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const visible = LIBRARY_ITEMS.filter(([id, kr, en], i) => `${id} ${kr} ${en} ${id === "input" ? "비밀번호 검색창" : ""} ${i + 1}`.toLowerCase().includes(query));
  return <div className="library-kit" data-library={style}>
    <header className="lk-catalog-heading"><div><span className="lk-eyebrow">COLOR OF APPLE / UI KIT</span><h3>{style === "cushion" ? "Cushion" : "Ink"}<small>{ko ? `${LIBRARY_ITEMS.length}가지 컴포넌트` : `${LIBRARY_ITEMS.length} components`}</small></h3><p>{style === "cushion" ? (ko ? "눌리는 표면, 부드러운 복원. 지금의 색으로 직접 써보세요." : "Soft surfaces. Gentle rebound. Try them in your colors.") : (ko ? "누르고 쓰는 곳에 퍼지는 잉크. 지금의 색으로 직접 써보세요." : "Ink blooms where you press and type. Try it in your colors.")}</p></div>
      <label className="lk-catalog-search"><Search size={16} aria-hidden /><input type="search" aria-label={ko ? "컴포넌트 찾기" : "Find a component"} placeholder={ko ? "컴포넌트 찾기" : "Find a component"} value={search} onChange={event => setSearch(event.target.value)} /><span>{visible.length}/{LIBRARY_ITEMS.length}</span></label>
    </header>
    <div className="lk-catalog-grid">{visible.map(([id, kr, en]) => <article key={id} className="lk-example" data-component={id}>
      <header className="lk-example-heading"><span>{String(LIBRARY_ITEMS.findIndex(item => item[0] === id) + 1).padStart(2, "0")}</span><h4>{ko ? kr : en}</h4><small>{en}</small></header>
      <div className="lk-example-body"><LibraryDemo id={id} ko={ko} /></div>
    </article>)}</div>
    {visible.length === 0 && <p className="lk-empty" role="status">{ko ? "일치하는 컴포넌트가 없어요." : "No matching components."}</p>}
  </div>;
}
