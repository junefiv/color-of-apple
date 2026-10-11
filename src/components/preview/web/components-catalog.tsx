"use client";

import { LibraryCatalog } from "../library/library-catalog";
import "@/styles/library-kit.css";

export function WebComponentsCatalog() {
  return <div className="ui-library-catalog">
    <div className="ui-library-tab-panel">
      <LibraryCatalog />
    </div>
  </div>;
}
