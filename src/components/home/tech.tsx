import { Emblem } from "@/components/emblem";
import { SectionHeading } from "@/components/section-heading";
import type { Tech } from "@/data/features";
import styles from "./tech.module.css";

/** 使用技術（黒の地に、名前と役割の2列の表） */
export function TechPanel({ items }: { items: Tech[] }) {
  return (
    <section className={styles.section} aria-labelledby="technology">
      <div className="container">
        <div className={styles.panel}>
          <Emblem className={styles.emblem} />
          <div className={styles.intro}>
            <SectionHeading
              id="technology"
              eyebrow="Technology"
              title="使用技術"
              tone="dark"
              lead={<p>この Web システムで使っている、主な技術とサービスです。</p>}
            />
          </div>
          <dl className={styles.list}>
            {items.map((item) => (
              <div key={item.name} className={styles.row}>
                <dt className={styles.name}>{item.name}</dt>
                <dd className={styles.role}>{item.role}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
