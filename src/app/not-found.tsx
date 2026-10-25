import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Emblem } from "@/components/emblem";
import { getSections } from "@/lib/catalog";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "ページが見つかりませんでした",
};

/** ページが見つからないとき（存在しないアドレス・ない画面を開いたとき） */
export default function NotFound() {
  const sections = getSections();
  return (
    <section className={styles.wrap} aria-labelledby="not-found-title">
      <Emblem className={styles.emblem} />
      <div className={`container ${styles.inner}`}>
        <p className={styles.code} aria-hidden>
          404
        </p>
        <p className="eyebrow">Page Not Found</p>
        <h1 id="not-found-title" className={styles.title}>
          ページが見つかりませんでした
        </h1>
        <p className={styles.lead}>
          お探しのページは、アドレスが変わったか、削除された可能性があります。
          <br />
          トップページ、または画面の一覧からお探しください。
        </p>
        <div className={styles.actions}>
          <Link href="/" className="btn btn-gold btn-lg">
            トップへ
          </Link>
          <Link href="/screens" className="btn btn-outline btn-lg">
            すべての画面へ
          </Link>
        </div>

        <nav className={styles.sections} aria-labelledby="not-found-sections">
          <p id="not-found-sections" className={styles.sectionsTitle}>
            領域ごとに見る
          </p>
          <ul className={styles.list}>
            {sections.map((section) => (
              <li key={section.id}>
                <Link href={`/screens/${section.id}`} className={styles.link}>
                  <span className={styles.no}>{section.no}</span>
                  <span className={styles.name}>{section.title}</span>
                  <span className={styles.count}>{section.counts.total}枚</span>
                  <ArrowRight aria-hidden className={styles.arrow} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
