export interface Page<T> {
  content: T[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}

export interface ProblemDetail {
  type: string
  title: string
  status: number
  detail: string
  instance: string
}

export interface PageParams {
  page?: number
  size?: number
  sort?: string
}
