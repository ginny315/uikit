export const DEFAULT_PAGE_SIZES = [10, 20, 50] as const;
export const LOG_PAGE_SIZES = [20, 50, 100] as const;

export function buildPageSizeOptions(
  sizes: readonly number[],
  t: (key: string, opts?: Record<string, unknown>) => string,
) {
  return sizes.map((size) => ({
    value: String(size),
    label: t('common:pagination.pageSize', { size }),
  }));
}
