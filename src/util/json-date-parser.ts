const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.{0,1}\d*))(?:Z|(\+|-)([\d|:]*))?$/;
const reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;

export function jsonDateParser(_: string, value: any) {
  let parsedValue = value;
  if (typeof value === "string") {
    const iso = reISO.exec(value);
    if (iso) {
      parsedValue = new Date(value);
    } else {
      const msa = reMsAjax.exec(value);
      if (msa) {
        const b = msa[1].split(/[-+,.]/);
        parsedValue = new Date(b[0] ? +b[0] : 0 - +b[1]);
      }
    }
  }
  return parsedValue;
}
