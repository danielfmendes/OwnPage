export const FILTER_SEPARATOR = ",";
export const defaultPageSize = 25;

export class Pagination {
  page: number;
  itemsPerPage: number;

  constructor(page: number = 0, itemsPerPage: number = defaultPageSize) {
    this.page = page;
    this.itemsPerPage = itemsPerPage;
  }

  /**
   * Erstellt eine Pagination-Instanz aus CallOptions
   */
  static fromCallOpts(callOpts: Record<string, string>): Pagination {
    const value = callOpts?.["pagination"];
    if (!value) return new Pagination();

    const params = value.split(FILTER_SEPARATOR);
    const paramMap = new Map(
        params
            .map((p) => p.split("="))
            .filter((pair): pair is [string, string] => pair.length === 2)
    );

    const page = parseInt(paramMap.get("page") ?? "0", 10);
    const size = parseInt(paramMap.get("size") ?? `${defaultPageSize}`, 10);

    return new Pagination(page, size);
  }

  /**
   * Erstellt eine Pagination-Instanz aus einer API Page Response
   */
  static fromApiPage(page: { page?: number; pageSize?: number }): Pagination {
    return new Pagination(page.page ?? 0, page.pageSize ?? defaultPageSize);
  }

  /**
   * Konvertiert Pagination in eine Query-String-Repräsentation
   */
  toQueryParams(): string {
    return `page=${this.page},size=${this.itemsPerPage}`;
  }

  /**
   * Aktualisiert aktuelle Instanz anhand einer API Page Response
   */
  restoreFromApiPage(page: { page?: number; pageSize?: number }): void {
    this.page = page.page ?? this.page;
    this.itemsPerPage = page.pageSize ?? this.itemsPerPage;
  }
}
