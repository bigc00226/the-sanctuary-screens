import { ArrowUpRight, FileDown } from "lucide-react";
import Link from "next/link";
import { site } from "@/data/site";
import { formatBytes } from "@/lib/shots";
import { Emblem, EmblemMark } from "./emblem";
import type { NavSection } from "./site-header";
import styles from "./site-footer.module.css";

/**
 * サイトの下部（すべてのページ共通）。
 * 下部のリンクは、表示されたときに先読み（prefetch）しません（9ページ分をまとめて読み込んでしまうため）。押したときに読み込みます。
 */
export function SiteFooter({
  sections,
  total,
  highlights,
  pdf,
}: {
  sections: NavSection[];
  total: number;
  highlights: number;
  pdf: { href: string; bytes: number; downloadName: string } | null;
}) {
  return (
    <footer className={styles.footer}>
      <Emblem className={styles.emblem} />
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo} aria-label="THE SANCTUARY 画面一覧 トップへ">
            <EmblemMark className={styles.mark} />
            <span className={styles.logoText}>
              <span className={styles.tagline}>{site.productTagline}</span>
              <span className={styles.product}>{site.product}</span>
              <span className={styles.subtitle}>{site.productSubtitle}</span>
            </span>
          </Link>
          <p className={styles.lead}>
            入会のお申し込みからご予約・事前決済、ビデオ通話のセッション、ヒーラー画面、管理画面まで。
            <br />
            Web システムの {total} 枚の画面を、PC とスマートフォンで収録しています。
          </p>
        </div>

        <nav className={styles.columns} aria-label="サイトの下部のメニュー">
          <div>
            <p className={styles.heading}>画面を見る</p>
            <ul className={styles.list}>
              <li>
                <Link href="/" className={styles.link} prefetch={false}>
                  トップ
                </Link>
              </li>
              <li>
                <Link href="/tour" className={styles.link} prefetch={false}>
                  主な画面（{highlights}枚）
                </Link>
              </li>
              <li>
                <Link href="/screens" className={styles.link} prefetch={false}>
                  すべての画面（{total}枚）
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className={styles.heading}>領域ごとに見る</p>
            <ul className={styles.list}>
              {sections.map((s) => (
                <li key={s.id}>
                  <Link href={`/screens/${s.id}`} className={styles.link} prefetch={false}>
                    <span className={styles.no}>{s.no}</span>
                    {s.title}（{s.count}枚）
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={styles.heading}>資料</p>
            <ul className={styles.list}>
              {pdf && (
                <li>
                  <a href={pdf.href} download={pdf.downloadName} className={styles.link}>
                    <FileDown aria-hidden className={styles.icon} />
                    画面一覧の PDF（{formatBytes(pdf.bytes)}）
                  </a>
                </li>
              )}
              <li>
                <a href={site.productUrl} className={styles.link} target="_blank" rel="noopener noreferrer">
                  本番のサイト（公開ページ）
                  <ArrowUpRight aria-hidden className={styles.icon} />
                  <span className="visually-hidden">（新しいタブで開きます）</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className={`container ${styles.bottom}`}>
        <ul className={styles.notes}>
          {site.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
          <li>画面の撮影：2026年10月</li>
        </ul>
      </div>
    </footer>
  );
}
