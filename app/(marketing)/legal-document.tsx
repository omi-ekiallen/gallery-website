import { SITE } from '@/lib/site';

export interface LegalSection {
  heading: string;
  /** Paragraphs, bullet lists and sub-headed blocks, in order. */
  blocks: Array<string | { subheading?: string; list: string[] }>;
}

/**
 * Shared shell for the policy pages: a statement band, then numbered sections
 * in a hairline-ruled column.
 */
export default function LegalDocument({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string[];
  sections: LegalSection[];
}) {
  return (
    <div>
      <section className="border-b border-ink">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
          <p className="label-caps text-ink-soft">{SITE.companyName}</p>
          <h1 className="display-hero mt-6 max-w-3xl">{title}</h1>
          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-2">
            <p className="label-caps text-ink-soft">
              Effective {SITE.legalEffectiveDate}
            </p>
            <p className="label-caps text-ink-soft">
              Last updated {SITE.legalLastUpdated}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-[820px] mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">
          <div className="body-lg text-ink-soft space-y-4">
            {intro.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <div className="mt-16 space-y-14">
            {sections.map((section, i) => (
              <section key={section.heading} className="border-t border-rule pt-10">
                <p className="label-caps text-brass">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h2 className="headline-md mt-3">{section.heading}</h2>

                <div className="mt-5 space-y-5">
                  {section.blocks.map((block, bi) =>
                    typeof block === 'string' ? (
                      <p key={bi} className="body-md text-ink-soft">
                        {block}
                      </p>
                    ) : (
                      <div key={bi}>
                        {block.subheading && (
                          <p className="label-caps text-ink-soft mb-3">{block.subheading}</p>
                        )}
                        <ul className="space-y-2">
                          {block.list.map((item) => (
                            <li key={item} className="body-md text-ink-soft flex gap-3">
                              <span className="text-green">—</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
