import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Emblem } from "@/components/ui/emblem";
import { getSections } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "ページが見つかりませんでした",
};

/**
 * ページが見つからないとき（存在しないアドレス・ない画面を開いたとき）。
 * 見た目は src/app/globals.css の「nf-」で始まる名前に書いています（理由は globals.css の説明を参照）。
 */
export default function NotFound() {
  const sections = getSections();
  return (
    <section className="nf-wrap" aria-labelledby="not-found-title">
      <Emblem className="nf-emblem" />
      <div className="container nf-inner">
        <p className="nf-code" aria-hidden>
          404
        </p>
        <p className="eyebrow">Page Not Found</p>
        <h1 id="not-found-title" className="nf-title">
          ページが見つかりませんでした
        </h1>
        <p className="nf-lead">
          お探しのページは、アドレスが変わったか、削除された可能性があります。
          <br />
          トップページ、または画面の一覧からお探しください。
        </p>
        <div className="nf-actions">
          <Link href="/" className="btn btn-gold btn-lg">
            トップへ
          </Link>
          <Link href="/screens" className="btn btn-outline btn-lg">
            すべての画面へ
          </Link>
        </div>

        <nav className="nf-sections" aria-labelledby="not-found-sections">
          <p id="not-found-sections" className="nf-sections-title">
            領域ごとに見る
          </p>
          <ul className="nf-list">
            {sections.map((section) => (
              <li key={section.id}>
                <Link href={`/screens/${section.id}`} className="nf-link">
                  <span className="nf-no">{section.no}</span>
                  <span className="nf-name">{section.title}</span>
                  <span className="nf-count">{section.counts.total}枚</span>
                  <ArrowRight aria-hidden className="nf-arrow" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
