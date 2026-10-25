import { ArrowUpRight, Download } from "lucide-react";
import Link from "next/link";
import type { SectionData } from "@/data/sections";
import { CAPTURE_HINT, CAPTURE_LABEL, DEVICE_LABEL, formatBytes, formatSize, sectionHref, type Device, type Shot } from "@/lib/shots";
import type { DetailLayout } from "./shot-viewer";
import styles from "./info-panel.module.css";

/** 撮影した画面の幅（CSS の px） */
const SCREEN_WIDTH: Record<Device, number> = { pc: 1440, sp: 390 };

type Props = {
  shot: Shot;
  section: Pick<SectionData, "id" | "no" | "title">;
  page: { no: string; title: string };
  /** 領域のページの中の、このページの位置（例：/screens/public#p-01） */
  pageHref: string;
  /** stacked（画像の下）では横に広く、split（画像の横）では縦に並べます */
  layout: DetailLayout;
};

/** 「この画面について」：領域・ページ・端末・撮影の範囲・アドレス・画像の大きさと、元の画像を開く・保存するボタン */
export function InfoPanel({ shot, section, page, pageHref, layout }: Props) {
  const resolution = shot.scale > 1 ? `画面の${shot.scale}倍の解像度` : "画面と同じ解像度";
  return (
    <section className={styles.panel} data-layout={layout} aria-labelledby="shot-about">
      <h2 id="shot-about" className={styles.title}>
        この画面について
      </h2>

      <dl className={styles.list}>
        <div className={styles.item}>
          <dt className={styles.term}>領域</dt>
          <dd className={styles.value}>
            <Link href={sectionHref(section.id)} className="link">
              <span className={styles.no}>{section.no}</span>
              {section.title}
            </Link>
          </dd>
        </div>
        <div className={styles.item}>
          <dt className={styles.term}>ページ</dt>
          <dd className={styles.value}>
            <Link href={pageHref} className="link">
              <span className={styles.no}>{page.no}</span>
              {page.title}
            </Link>
          </dd>
        </div>
        <div className={styles.item}>
          <dt className={styles.term}>端末</dt>
          <dd className={styles.value}>
            {DEVICE_LABEL[shot.device]}
            <span className={styles.nowrap}>（幅 {SCREEN_WIDTH[shot.device].toLocaleString("ja-JP")}px の画面）</span>
          </dd>
        </div>
        <div className={styles.item}>
          <dt className={styles.term}>撮影の範囲</dt>
          <dd className={styles.value}>
            {CAPTURE_LABEL[shot.capture]}
            <span className={styles.note}>{CAPTURE_HINT[shot.capture]}</span>
          </dd>
        </div>
        <div className={styles.item}>
          <dt className={styles.term}>画面のアドレス</dt>
          <dd className={styles.value}>
            <code className={styles.code}>{shot.path}</code>
          </dd>
        </div>
        <div className={styles.item}>
          <dt className={styles.term}>画像</dt>
          <dd className={styles.value}>
            <span className={styles.nowrap}>{formatSize(shot.width, shot.height)}</span>・
            <span className={styles.nowrap}>{formatBytes(shot.bytes)}</span>・<span className={styles.nowrap}>{resolution}</span>
          </dd>
        </div>
      </dl>

      <div className={styles.actions}>
        <a href={shot.src} target="_blank" rel="noopener" className={`btn btn-outline btn-sm ${styles.button}`}>
          元の画像を開く
          <ArrowUpRight aria-hidden />
          <span className="visually-hidden">（新しいタブで開きます）</span>
        </a>
        <a href={shot.src} download={`${shot.slug}.png`} className={`btn btn-ghost btn-sm ${styles.button}`}>
          <Download aria-hidden />
          画像を保存
        </a>
      </div>
    </section>
  );
}
