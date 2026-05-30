import type { PageSeoContent } from "@/config/categorySeoContent";
import { cn } from "@/lib/utils";

interface SeoContentSectionsProps {
  content: PageSeoContent;
  className?: string;
}

/** Structured H2 + paragraphs for local SEO (Nairobi-focused) */
export function SeoContentSections({ content, className }: SeoContentSectionsProps) {
  return (
    <div className={cn("space-y-6 text-left", className)}>
      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
        {content.intro}
      </p>
      {content.sections.map((section) => (
        <div key={section.heading}>
          <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-2">
            {section.heading}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {section.body}
          </p>
        </div>
      ))}
      {content.footer && (
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed border-t border-border pt-6">
          {content.footer}
        </p>
      )}
    </div>
  );
}
