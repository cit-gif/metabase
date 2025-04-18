import { useCallback, useState } from "react";

export const usePagination = (initialPage = 0) => {
  const [page, setPage] = useState(initialPage);

  const handleNextPage = useCallback(
    () => setPage((prev) => prev + 1),
    [setPage],
  );
  const handlePreviousPage = useCallback(
    () => setPage((prev) => prev - 1),
    [setPage],
  );

  const resetPage = useCallback(
    () => setPage(initialPage),
    [setPage, initialPage],
  );

  return {
    handleNextPage,
    handlePreviousPage,
    setPage,
    page,
    resetPage,
  };
};
