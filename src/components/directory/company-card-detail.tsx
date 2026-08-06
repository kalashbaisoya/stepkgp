import type { ShowcaseProfile } from "@/modules/directory/service";

/**
 * The extra detail a company card reveals while hovered or keyboard-focused.
 *
 * This lives inside the card itself rather than in a popover, so the card grows
 * into one taller box instead of spawning a second one. The grid-rows 0fr to 1fr
 * pair animates the reveal without hard-coding a pixel height, so a company with
 * four facts and one with two both open cleanly.
 */
export function CompanyCardDetail({ company }: { company: ShowcaseProfile }) {
  const facts = company.achievements.slice(0, 4);
  const founders = company.founders.slice(0, 3);
  const meta = [company.location, company.stage].filter(Boolean).join(" · ");
  if (facts.length === 0 && founders.length === 0 && !meta) return null;

  return (
    <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr]">
      <div className="overflow-hidden">
        <div className="mt-4 space-y-3 border-t border-border/70 pt-4">
          {facts.length > 0 && (
            <ul className="space-y-1.5">
              {facts.map((fact) => (
                <li key={fact} className="flex gap-2 text-[12.5px] leading-relaxed">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          )}

          {founders.length > 0 && (
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Founders: </span>
              {founders.map((f) => f.name).join(", ")}
            </p>
          )}

          {meta && <p className="text-[11px] text-muted-foreground">{meta}</p>}
        </div>
      </div>
    </div>
  );
}
