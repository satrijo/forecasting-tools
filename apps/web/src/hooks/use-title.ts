import { useEffect } from "react";

const DEFAULT_TITLE = "Stasiun Cuaca Pusat";

export function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} - ${DEFAULT_TITLE}` : DEFAULT_TITLE;
  }, [title]);
}
