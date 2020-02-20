export function getFontString(options: {
  fontWeight?: string;
  fontStyle?: string;
  fontSize?: number;
  fontFamily?: string;
}) {
  return Object.entries(options)
    .map(([option, value]) => {
      if (option === "fontSize") return `${value}px`;
      return value;
    })
    .join(" ");
}
