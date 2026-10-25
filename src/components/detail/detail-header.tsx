import { Link2 } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Emblem } from "@/components/emblem";
import { CAPTURE_LABEL, DEVICE_LABEL, sectionHref, type Shot } from "@/lib/shots";
import type { SectionData } from "@/data/sections";
import { VariantTabs } from "./variant-tabs";
import styles from "./detail-header.module.css";

type Props = {
  shot: Shot;
  section: Pick<SectionData, "id" | "no" | "title" | "en">;
  pageTitle: string;
  /** 領域のページの中の、このページの位置（例：/screens/public#p-01） */
  pageHref: string;
  /** 同じ画面を別の端末・範囲で撮ったもの（この画面を含む） */
  variants: Shot[];
  /** ページの上へ戻るリンクの行き先 */
  id?: string;
};

/** 画面の詳しいページの最初の帯（現在の位置・見出し・端末と範囲・アドレス・ほかの撮影への切り替え） */
export function DetailHeader({ shot, section, pageTitle, pageHref, variants, id }: Props) {
  return (
    <header id={id} className={styles.band}>
      <Emblem className={styles.emblem} />
      <div className={`container ${styles.inner}`}>
        <div className={styles.crumbs}>
          <Breadcrumbs
            items={[
              { label: "トップ", href: "/" },
              { label: "すべての画面", href: "/screens" },
              { label: section.title, href: sectionHref(section.id) },
              { label: pageTitle, href: pageHref },
              { label: shot.caption },
            ]}
          />
        </div>

        <div className={styles.heading}>
          <p className={`eyebrow ${styles.eyebrow}`}>
            {section.no} · {section.en}
          </p>
          <h1 id="shot-title" className={styles.title}>
            {shot.caption}
          </h1>
        </div>

        <div className={styles.meta}>
          <p className={styles.context}>
            {section.title}・{pageTitle}
          </p>
          <p className={styles.tags}>
            <span className="tag">{DEVICE_LABEL[shot.device]}</span>
            <span className="tag tag-solid">{CAPTURE_LABEL[shot.capture]}</span>
          </p>
          <p className={styles.path}>
            <Link2 aria-hidden className={styles.pathIcon} />
            <span className="visually-hidden">画面のアドレス：</span>
            <code className={styles.pathCode}>{shot.path}</code>
          </p>
        </div>

        {variants.length > 1 && (
          <div className={styles.variants}>
            <VariantTabs current={shot} variants={variants} />
          </div>
        )}
      </div>
    </header>
  );
}
