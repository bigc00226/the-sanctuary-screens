import { ArrowRight, FileDown } from "lucide-react";
import Link from "next/link";
import { Emblem } from "@/components/emblem";
import { formatBytes } from "@/lib/shots";
import styles from "./closing.module.css";

type Props = {
  total: number;
  highlights: number;
  pdf: { href: string; bytes: number; downloadName: string } | null;
  notes: readonly string[];
};

/** ページの最後の案内（すべての画面・主な画面・PDF） */
export function ClosingBand({ total, highlights, pdf, notes }: Props) {
  return (
    <section className={styles.section} aria-labelledby="closing">
      <div className="container">
        <div className={styles.panel}>
          <Emblem className={styles.emblem} />
          <p className={`eyebrow ${styles.eyebrow}`}>All Screens</p>
          <h2 id="closing" className={styles.title}>
            <span className={styles.phrase}>{total}枚の画面を、</span>
            <span className={styles.phrase}>PC とスマートフォンで</span>
            <span className={styles.phrase}>ご覧いただけます</span>
          </h2>
          <p className={styles.lead}>
            {"領域・端末・範囲で絞り込んだり、言葉で探したりできます。"}
            {"画像を押すと大きく表示し、前後の画面へも移動できます。"}
          </p>
          <div className={styles.actions}>
            <Link href="/screens" className="btn btn-gold btn-lg">
              すべての画面（{total}枚）
              <ArrowRight aria-hidden />
            </Link>
            <Link href="/tour" className="btn btn-outline btn-lg">
              主な画面（{highlights}枚）
            </Link>
          </div>
          {pdf && (
            <a href={pdf.href} download={pdf.downloadName} type="application/pdf" className={styles.pdf}>
              <FileDown aria-hidden className={styles.pdfIcon} />
              画面一覧の PDF をダウンロード（{formatBytes(pdf.bytes)}）
            </a>
          )}
          <ul className={styles.notes} aria-label="画面の撮影について">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
