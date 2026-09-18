"use client";

import { useState } from "react";
import { StatusBadge } from "../shared";
import { Avatar, Progress } from "../widgets";
import {
  AppBar,
  AppOverlays,
  BottomNav,
  IntroHeader,
  IntroHero,
  IntroPhone,
  IntroViewport,
  Menu,
  WebOverlays,
  useTimedOverlay,
  type AppOverlay,
  type WebOverlay,
} from "./shared";

export function CommunityWeb() {
  const { overlay, setOverlay, show } = useTimedOverlay<WebOverlay>({ type: "none" });
  const [liked, setLiked] = useState(false);
  const [menu, setMenu] = useState(false);

  return (
    <IntroViewport>
      <div className="flex min-h-0 flex-1 flex-col">
        <IntroHeader
          brand="Circle"
          links={["피드", "토픽", "멤버"]}
          searchPlaceholder="게시물 검색"
          cta="글쓰기"
          onCta={() =>
            setOverlay({
              type: "modal",
              title: "게시할까요?",
              body: "작성한 글이 피드 상단에 올라갑니다.",
              confirm: "게시",
              onConfirm: () => show({ type: "toast", message: "게시물을 올렸습니다.", tone: "success" }, 1800),
            })
          }
          onNotify={() => show({ type: "toast", message: "윤서가 댓글을 남겼습니다.", tone: "info" }, 2000)}
          onHelp={() => setOverlay({ type: "tooltip", message: "멘션은 @로 시작합니다." })}
          onProfile={() => setOverlay({ type: "drawer", title: "알림", body: "팔로우 요청 2, 댓글 4, 멘션 1." })}
        />
        <div className="preview-scroll space-y-8 p-6">
          <IntroHero
            kicker="커뮤니티 소개"
            title="프로필, 반응, 미디어가 한 톤으로."
            body="좋아요, 댓글, 신고, 삭제가 실제 소셜 제스처처럼 열립니다."
            primary="첫 글 쓰기"
            onPrimary={() =>
              setOverlay({
                type: "modal",
                title: "초안을 게시할까요?",
                body: "공개 범위는 팔로워입니다.",
                confirm: "게시",
                onConfirm: () => show({ type: "toast", message: "게시물을 올렸습니다.", tone: "success" }, 1800),
              })
            }
          />
          <div className="pv-card space-y-3 p-4">
            <textarea className="pv-input min-h-20" placeholder="무슨 생각을 하고 있나요?" />
            <div className="flex flex-wrap items-center gap-2">
              <button className="pv-btn pv-btn-outline" type="button">
                이미지
              </button>
              <select className="pv-input w-32" defaultValue="followers">
                <option value="followers">팔로워</option>
                <option value="public">전체</option>
              </select>
            </div>
          </div>
          <article className="pv-card space-y-3 p-4">
            <div className="flex items-center gap-2">
              <Avatar initials="YS" />
              <div>
                <p className="text-sm font-medium">
                  윤서 <StatusBadge tone="info">인증</StatusBadge>
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">@yoon · 2시간</p>
              </div>
              <div className="relative ml-auto">
                <button type="button" onClick={() => setMenu((value) => !value)}>
                  ⋯
                </button>
                {menu ? (
                  <Menu
                    items={[
                      { label: "신고", onClick: () => show({ type: "toast", message: "신고가 접수되었습니다.", tone: "warning" }, 1800) },
                      {
                        label: "삭제",
                        danger: true,
                        onClick: () =>
                          setOverlay({
                            type: "modal",
                            title: "게시물을 삭제할까요?",
                            body: "댓글도 함께 사라집니다.",
                            confirm: "삭제",
                            danger: true,
                            onConfirm: () => show({ type: "toast", message: "게시물을 삭제했습니다.", tone: "danger" }, 1800),
                          }),
                      },
                    ]}
                    onClose={() => setMenu(false)}
                  />
                ) : null}
              </div>
            </div>
            <p className="text-sm">컬러 토큰을 정리하고 있어요. #design @minjun</p>
            <button type="button" className="h-32 w-full rounded-xl bg-[var(--color-secondary-subtle)]" onClick={() => setOverlay({ type: "modal", title: "이미지", body: "라이트박스로 원본을 봅니다.", confirm: "닫기" })} />
            <div className="flex gap-2">
              <button
                className="pv-btn pv-btn-ghost"
                type="button"
                onClick={() => {
                  setLiked(true);
                  show({ type: "toast", message: "좋아요를 눌렀습니다.", tone: "success" }, 1400);
                }}
              >
                {liked ? "♥ 24" : "♡ 23"}
              </button>
              <button className="pv-btn pv-btn-ghost" type="button" onClick={() => setOverlay({ type: "drawer", title: "댓글", body: "민준: 토큰 대비가 훨씬 좋아졌어요." })}>
                댓글
              </button>
              <button className="pv-btn pv-btn-ghost" type="button" onClick={() => show({ type: "toast", message: "링크를 복사했습니다.", tone: "info" }, 1400)}>
                공유
              </button>
            </div>
          </article>
        </div>
      </div>
      <WebOverlays overlay={overlay} onClose={() => setOverlay({ type: "none" })} />
    </IntroViewport>
  );
}

export function CommunityApp() {
  const { overlay, setOverlay, show } = useTimedOverlay<AppOverlay>({ type: "none" });
  const [liked, setLiked] = useState(false);

  return (
    <IntroPhone
      nav={
        <BottomNav
          items={["피드", "+", "알림", "나"]}
          active="피드"
          onItem={(item) => {
            if (item === "+") {
              setOverlay({
                type: "sheet",
                title: "새 게시물",
                body: (
                  <div className="space-y-3">
                    <textarea className="pv-input min-h-20" placeholder="지금 생각을 적어보세요." />
                    <Progress value={40} />
                    <button className="pv-btn pv-btn-primary w-full" type="button" onClick={() => show({ type: "toast", message: "업로드했습니다.", tone: "success" }, 1600)}>
                      올리기
                    </button>
                  </div>
                ),
              });
            }
            if (item === "알림") show({ type: "snackbar", message: "새 댓글이 2개 있어요." }, 1800);
          }}
        />
      }
      overlay={<AppOverlays overlay={overlay} onClose={() => setOverlay({ type: "none" })} />}
    >
      <AppBar title="Circle" subtitle="소셜 피드" onNotify={() => show({ type: "snackbar", message: "팔로우 요청이 도착했어요." }, 1800)} />
      <div className="space-y-4 px-5 py-4">
        <div className="flex gap-2 overflow-x-auto">
          {["YU", "MJ", "HR"].map((item) => (
            <div key={item} className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--color-secondary-default)] text-xs text-[var(--color-secondary-on)]">
              {item}
            </div>
          ))}
        </div>
        <div className="pv-card space-y-3 p-3">
          <p className="text-sm font-medium">민준 · 방금</p>
          <div className="h-28 rounded-xl bg-[var(--color-secondary-subtle)]" />
          <div className="flex gap-3 text-sm">
            <button
              type="button"
              onClick={() => {
                setLiked(true);
                show({ type: "toast", message: "좋아요", tone: "success" }, 1200);
              }}
            >
              {liked ? "♥" : "♡"}
            </button>
            <button type="button" onClick={() => setOverlay({ type: "sheet", title: "댓글", body: <p className="text-sm">윤서: 이 샷 좋아요.</p> })}>
              댓글
            </button>
          </div>
        </div>
      </div>
    </IntroPhone>
  );
}
