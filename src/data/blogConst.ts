// Лёгкие константы блога, чтобы head() маршрутов не тянул весь src/data/blog.ts
// (170 КБ текста) в критичный бандл, который грузится на каждой странице.
export const POSTS_PER_PAGE = 12;

// Общее количество статей. Синхронизируется тестом src/data/__tests__/blogConst.test.ts
export const TOTAL_POSTS = 50;