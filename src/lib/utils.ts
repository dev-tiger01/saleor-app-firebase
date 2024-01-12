export const toStringOrEmpty = (value: unknown) => {
    if (typeof value === "string") return value;
    return "";
  };