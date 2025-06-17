export const defaultPageSize = 25;

export class Pagination {
  page: number;
  itemsPerPage: number;

  constructor(page: number = 1, itemsPerPage: number = defaultPageSize) {
    this.page = page;
    this.itemsPerPage = itemsPerPage;
  }

  static fromQueryParams(searchParams: URLSearchParams): Pagination {
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const size = parseInt(searchParams.get("pageSize") ?? `${defaultPageSize}`, 10);
    return new Pagination(page, size);
  }

  toQueryParams(): Record<string, string> {
    return {
      page: String(this.page),
      pageSize: String(this.itemsPerPage),
    };
  }
}
