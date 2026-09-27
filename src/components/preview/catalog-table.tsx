"use client";

import { ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import { useCopy } from "@/hooks/use-copy";

const AMOUNTS = [128, 84, 216, 56, 164];
const STATUSES = ["success", "info", "warning", "danger", "neutral"] as const;

export function SelectableTableShowcase() {
  const k = useCopy().preview.kit;
  const [selected, setSelected] = useState(1);
  const [checked, setChecked] = useState(() => new Set<number>([0]));
  const [sort, setSort] = useState<"name" | "amount">("name");
  const [descending, setDescending] = useState(false);

  const rows = useMemo(() => k.tableItems.map((name, index) => ({
    index,
    name,
    owner: k.tableOwners[index],
    amount: AMOUNTS[index],
    status: STATUSES[index],
  })).sort((a, b) => {
    const order = sort === "name" ? a.name.localeCompare(b.name) : a.amount - b.amount;
    return descending ? -order : order;
  }), [descending, k.tableItems, k.tableOwners, sort]);

  function changeSort(next: "name" | "amount") {
    if (sort === next) setDescending((value) => !value);
    else {
      setSort(next);
      setDescending(false);
    }
  }

  function toggleChecked(index: number) {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="kit-table-card">
      <div className="kit-table-toolbar">
        <span><strong>{k.tableTitle}</strong><small>{k.tableCaption}</small></span>
        <b>{checked.size} {k.tableSelected}</b>
      </div>
      <div className="kit-table-scroll">
        <table className="kit-data-table">
          <thead>
            <tr>
              <th aria-label={k.tableSelect} />
              <th><button type="button" onClick={() => changeSort("name")}>{k.tableName}<ArrowUpDown aria-hidden /></button></th>
              <th>{k.tableOwner}</th>
              <th>{k.tableStatus}</th>
              <th><button type="button" onClick={() => changeSort("amount")}>{k.tableAmount}<ArrowUpDown aria-hidden /></button></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const disabled = row.index === 4;
              return (
                <tr
                  key={row.index}
                  data-selected={selected === row.index || undefined}
                  data-disabled={disabled || undefined}
                  onClick={() => { if (!disabled) setSelected(row.index); }}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={checked.has(row.index)}
                      disabled={disabled}
                      aria-label={`${k.tableSelect} ${row.name}`}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => toggleChecked(row.index)}
                    />
                  </td>
                  <td><strong>{row.name}</strong></td>
                  <td>{row.owner}</td>
                  <td><span className="kit-table-status" data-tone={row.status}>{k.tableStatusLabels[row.index]}</span></td>
                  <td><b>{row.amount}</b></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
