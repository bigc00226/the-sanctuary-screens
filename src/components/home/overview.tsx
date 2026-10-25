import { ArrowRight, Settings, Sparkles, UserRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { sectionHref, type SectionId } from "@/lib/shots";
import styles from "./overview.module.css";

type Role = {
  section: SectionId;
  en: string;
  title: string;
  icon: LucideIcon;
  text: string;
  items: string[];
  /** 領域のページへのリンクの文字（枚数を後ろに付けます） */
  link: string;
};

/** 3つの立場（内容は src/data/sections.ts・features.ts と、画面の説明に沿って書いています） */
const ROLES: Role[] = [
  {
    section: "member",
    en: "Members",
    title: "会員様",
    icon: UserRound,
    text: "入会のお申し込みのあとは、マイページから、ご予約とお支払い、セッションのお部屋への入室、ご感想の送信までを行えます。",
    items: ["入会のお申し込み", "ご予約とお支払い", "セッション", "ご感想"],
    link: "マイページの画面",
  },
  {
    section: "healer",
    en: "Healers",
    title: "ヒーラー",
    icon: Sparkles,
    text: "今日のセッションへの入室、空いた時間に受付を始める「今すぐヒーリング」、営業時間の設定、カルテの記入を行えます。",
    items: ["今日のセッション", "今すぐヒーリング", "スケジュール", "カルテ"],
    link: "ヒーラー画面",
  },
  {
    section: "admin",
    en: "Administrators",
    title: "管理者",
    icon: Settings,
    text: "入会審査、予約・会員・売上の確認、記事とメールの配信、メニューや料金の設定を、ひとつの管理画面で行えます。",
    items: ["入会審査", "予約", "会員", "売上", "記事とメール", "料金設定"],
    link: "管理画面",
  },
];

type Props = {
  /** 領域ごとの画面の数 */
  counts: Partial<Record<SectionId, number>>;
};

/** このシステムについて（3つの立場の画面） */
export function Overview({ counts }: Props) {
  return (
    <section className={styles.section} aria-labelledby="overview">
      <div className="container">
        <SectionHeading
          id="overview"
          eyebrow="Overview"
          title="このシステムについて"
          lead={
            <p>
              {"THE SANCTUARY は、完全会員制・オンライン専用のヒーリングサロンです。"}
              {"この Web システムには、サロンを利用する会員様、セッションを担当するヒーラー、サロンを運営する管理者の、3つの立場の画面があります。"}
            </p>
          }
        />

        <ul className={styles.roles}>
          {ROLES.map((role, i) => {
            const Icon = role.icon;
            const count = counts[role.section];
            return (
              <li key={role.section} className={styles.role}>
                <div className={styles.head}>
                  <span className={styles.icon} aria-hidden>
                    <Icon />
                  </span>
                  <span className={styles.no} aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className={styles.en}>{role.en}</p>
                <h3 className={styles.title}>{role.title}</h3>
                <p className={styles.text}>{role.text}</p>
                <ul className={styles.items} aria-label={`${role.title}の主な画面`}>
                  {role.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link href={sectionHref(role.section)} className={styles.more}>
                  <span>
                    {role.link}
                    {count !== undefined && <span className={styles.count}>（{count}枚）</span>}
                  </span>
                  <ArrowRight aria-hidden className={styles.arrow} />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
