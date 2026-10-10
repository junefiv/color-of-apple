"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useMatchuStore } from "@/lib/store";
import { LIBRARY_ITEMS, type LibraryStyle } from "./catalog";
import { ComponentPlayground } from "./playground";
import "@/styles/library-kit.css";

export function LibraryCatalog({ style }: { style: LibraryStyle }) {
  const ko = useMatchuStore(state => state.locale) === "ko";
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const visible = LIBRARY_ITEMS.filter(([id, kr, en], i) => `${id} ${kr} ${en} ${id === "input" ? "숫자 인증번호 number otp" : ""} ${i + 1}`.toLowerCase().includes(query));
  return <div className="library-kit" data-library={style}>
    <header className="lk-catalog-heading"><div><span className="lk-eyebrow">COLOR OF APPLE / UI KIT</span><h3>{style === "cushion" ? "Cushion" : "Ink"}<small>{ko ? `${LIBRARY_ITEMS.length}가지 컴포넌트` : `${LIBRARY_ITEMS.length} components`}</small></h3><p>{style === "cushion" ? (ko ? "설정을 바꾸고, 눌러보고, 나만의 컴포넌트를 만드세요." : "Adjust the controls. Try the interaction. Make it yours.") : (ko ? "설정을 바꾸고, 눌러보고, 나만의 컴포넌트를 만드세요." : "Adjust the controls. Try the interaction. Make it yours.")}</p></div>
      <label className="lk-catalog-search"><Search size={16} aria-hidden /><input type="search" aria-label={ko ? "컴포넌트 찾기" : "Find a component"} placeholder={ko ? "컴포넌트 찾기" : "Find a component"} value={search} onChange={event => setSearch(event.target.value)} /><span>{visible.length}/{LIBRARY_ITEMS.length}</span></label>
    </header>
    <div className="lk-catalog-grid">{LIBRARY_ITEMS.map(([id, kr, en]) => <article hidden={!visible.some(item => item[0] === id)} key={id} className="lk-example" data-component={id}>
      <header className="lk-example-heading"><span>{String(LIBRARY_ITEMS.findIndex(item => item[0] === id) + 1).padStart(2, "0")}</span><h4>{ko ? kr : en}</h4><small>{en}</small></header>
      <ComponentPlayground id={id} ko={ko} />
    </article>)}</div>
    {visible.length === 0 && <p className="lk-empty" role="status">{ko ? "일치하는 컴포넌트가 없어요." : "No matching components."}</p>}
  </div>;
}
