class BaseUserOutputType {
    login: string
    email: string
}

class DetailedUserOutputType extends BaseUserOutputType {
    id: string
    createdAt: string
}

export class UserPaginationOutputType {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: DetailedUserOutputType[]
}