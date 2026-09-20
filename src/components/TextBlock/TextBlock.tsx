import "./text-block.css";

export type TextBlockVariant = "XL" | "L" | "M" | "S";

export interface TextBlockProps {
  variant?: TextBlockVariant;
  /** The heading. Figma's own default, "Header", is placeholder example text, not real copy — always pass real content. */
  title: string;
  /** The supporting line beneath the heading. Only rendered when showCaption is true. */
  caption?: string;
  showCaption?: boolean;
}

export function TextBlock({ variant = "XL", title, caption, showCaption = true }: TextBlockProps) {
  return (
    <div className={`text-block text-block--${variant.toLowerCase()}`}>
      <p className="text-block__title">{title}</p>
      {showCaption && caption ? <p className="text-block__caption">{caption}</p> : null}
    </div>
  );
}
