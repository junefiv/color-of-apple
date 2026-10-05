export function extendedTokenDetails(locale: "ko" | "en") {
  const ko = locale === "ko";
  const labels: Record<string, string> = {};
  const guides: Record<string, { role: string; uses: string }> = {};
  const states: Record<string, [string, string, string, string, string]> = {
    surfaceStrong: ["Strong Surface", "상태를 더 선명하게 강조하는 배경입니다.", "강조 알림, 상태 카드, 중요한 안내 영역", "A stronger background emphasizing this status.", "Emphasized alerts, status cards, important notices"],
    border: ["Border", "상태 영역의 경계를 구분하는 테두리입니다.", "알림 테두리, 상태 카드 윤곽, 입력 상태 경계", "An outline separating areas with this status.", "Alert borders, status card outlines, input state borders"],
    text: ["Text", "상태의 옅은 배경 위에서 읽히는 텍스트 색상입니다.", "알림 제목·본문, 상태 설명, 검증 메시지", "Readable text on subtle status backgrounds.", "Alert titles and body, status descriptions, validation messages"],
    icon: ["Icon", "상태를 전달하는 아이콘 색상입니다.", "알림 아이콘, 검증 표시, 상태 표시 아이콘", "An icon color communicating this status.", "Alert icons, validation indicators, status icons"],
    hover: ["Hover", "요소에 포인터가 올라갔을 때 사용하는 배경입니다.", "버튼·배지·클릭 가능한 항목의 마우스 오버", "The fill when a pointer is over this element.", "Hovered buttons, badges, clickable items"],
    pressed: ["Pressed", "요소를 누르고 있는 순간의 배경입니다.", "클릭·터치 중인 버튼, 눌린 액션 항목", "The fill while this element is pressed.", "Buttons during click or touch, pressed action items"],
    onHover: ["On Hover", "마우스 오버 배경 위에 올리는 텍스트·아이콘 색상입니다.", "Hover 상태 버튼의 레이블·아이콘", "Text and icons on the hover fill.", "Labels and icons of hovered buttons"],
    onPressed: ["On Pressed", "누름 상태 배경 위에 올리는 텍스트·아이콘 색상입니다.", "Pressed 상태 버튼의 레이블·아이콘", "Text and icons on the pressed fill.", "Labels and icons of pressed buttons"],
    selectedBorder: ["Selected Border", "선택된 항목의 경계를 강조하는 테두리입니다.", "선택된 필터·탭·옵션의 테두리", "An outline emphasizing a selected item.", "Selected filter, tab, and option borders"],
    selectedText: ["Selected Text", "선택 배경 위에 올리는 텍스트 색상입니다.", "선택된 필터·메뉴·옵션의 레이블", "Text on the selected background.", "Selected filter, menu, and option labels"],
    selectedIcon: ["Selected Icon", "선택 배경 위에 올리는 아이콘 색상입니다.", "선택된 메뉴 아이콘, 필터 체크 표시", "Icons on the selected background.", "Selected menu icons, filter checkmarks"],
    disabled: ["Disabled", "조작할 수 없는 요소의 비활성 배경입니다.", "비활성 버튼·액션·선택 항목", "The fill of an unavailable element.", "Disabled buttons, actions, selectable items"],
    disabledText: ["Disabled Text", "조작할 수 없는 요소의 텍스트·아이콘 색상입니다.", "비활성 버튼 레이블, 비활성 액션 아이콘", "Text and icons of an unavailable element.", "Disabled button labels, disabled action icons"],
  };
  const statuses = ["success", "warning", "danger", "info"];
  for (const role of ["primary", "secondary", "accent", ...statuses]) {
    const title = role[0].toUpperCase() + role.slice(1);
    const names = statuses.includes(role)
      ? ["surfaceStrong", "border", "text", "icon", "hover", "pressed", "onHover", "onPressed", "disabled", "disabledText"]
      : ["onHover", "onPressed", "selectedBorder", "selectedText", "selectedIcon", "disabled", "disabledText", ...(role === "accent" ? ["hover", "pressed"] : [])];
    for (const state of names) {
      const key = `${role}${state[0].toUpperCase()}${state.slice(1)}`;
      const [label, koRole, koUses, enRole, enUses] = states[state];
      labels[key] = `${title} ${label}`;
      guides[key] = { role: `${title}: ${ko ? koRole : enRole}`, uses: ko ? koUses : enUses };
    }
  }
  return { labels, guides };
}
