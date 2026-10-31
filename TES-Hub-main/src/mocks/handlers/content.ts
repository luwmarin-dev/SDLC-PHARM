import { http, HttpResponse } from "msw";
import { endPoint } from "../../settings.json";
import stories from "../data/stories";
import questions from "../data/questions";
import courses from "../data/courses";
import articles from "../data/articles";
import type Article from "../../types/article";
import sessions from "../data/sessions";
import type Session from "../../types/session";
import type Course from "../../types/course";
import comments from "../data/comments";
import type Comment from "../../types/comment";
import type BaseContent from "../../types/base-content";

type ArticleInput = Pick<Article, "title" | "body" | "category"> &
  Partial<
    Pick<
      Article,
      | "slug"
      | "excerpt"
      | "topicTags"
      | "coverImage"
      | "status"
      | "authorId"
      | "language"
    >
  >;

const slugify = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const readTime = (body: string) => {
  const words = body.replace(/<[^>]*>/g, " ").trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

const bySlug =
  <T extends { slug: string }>(list: T[]) =>
  ({ params }: { params: { slug: string } }) => {
    const item = list.find((i) => i.slug === params.slug);
    if (!item) {
      return HttpResponse.json({ message: "Not found." }, { status: 404 });
    }
    return HttpResponse.json(item);
  };

const bumpCommentCount = (contentId: string, delta: number, isAnswer: boolean) => {
  const item = [...stories, ...questions].find((c) => c.id === contentId);
  if (!item) return;
  item.stats.comments = Math.max(0, item.stats.comments + delta);
  if (isAnswer && "answerCount" in item) {
    item.answerCount = Math.max(0, item.answerCount + delta);
  }
};

const engagement =
  <T extends { slug: string; stats: BaseContent["stats"] }>(list: T[]) =>
  ({
    params,
    request,
  }: {
    params: { slug: string; metric: string };
    request: Request;
  }) => {
    const { slug, metric } = params;
    if (metric !== "like" && metric !== "save") {
      return HttpResponse.json({ message: "Unknown action." }, { status: 404 });
    }

    const item = list.find((i) => i.slug === slug);
    if (!item) {
      return HttpResponse.json({ message: "Not found." }, { status: 404 });
    }

    const undo = new URL(request.url).searchParams.get("undo") === "true";
    const key = metric === "like" ? "likes" : "saves";
    item.stats[key] = Math.max(0, item.stats[key] + (undo ? -1 : 1));

    return HttpResponse.json(item);
  };

export const content_handlers = [
  http.get(`${endPoint}/stories`, () => HttpResponse.json(stories)),
  http.get<{ slug: string }>(`${endPoint}/stories/:slug`, bySlug(stories)),

  http.get(`${endPoint}/questions`, () => HttpResponse.json(questions)),
  http.get<{ slug: string }>(`${endPoint}/questions/:slug`, bySlug(questions)),

  http.get(`${endPoint}/courses`, () => HttpResponse.json(courses)),
  http.get<{ slug: string }>(`${endPoint}/courses/:slug`, bySlug(courses)),

  http.post(`${endPoint}/courses`, async ({ request }) => {
    const body = (await request.json()) as Partial<Course>;
    const now = new Date().toISOString();

    if (!body.title) {
      return HttpResponse.json(
        { message: "title is required." },
        { status: 400 },
      );
    }

    const slug = body.slug || slugify(body.title);
    if (courses.some((c) => c.slug === slug)) {
      return HttpResponse.json(
        { message: "A course with this slug already exists." },
        { status: 409 },
      );
    }

    const course: Course = {
      id: `course-${slug}-${Date.now()}`,
      type: "course",
      slug,
      title: body.title,
      authorId: body.authorId ?? "user-tes-admin-1",
      status: body.status ?? "draft",
      visibility: body.visibility ?? "hidden",
      language: body.language ?? "en",
      topicTags: body.topicTags ?? [],
      region: body.region,
      coverImage: body.coverImage,
      createdAt: now,
      updatedAt: now,
      publishedAt: body.status === "published" ? now : undefined,
      stats: { views: 0, likes: 0, comments: 0, saves: 0 },
      category: body.category ?? "Crop Production",
      shortDescription: body.shortDescription ?? "",
      longDescription: body.longDescription ?? "",
      level: body.level ?? "beginner",
      estimatedDurationHours: body.estimatedDurationHours ?? 0,
      sections: body.sections ?? [],
      enrollmentCount: 0,
      rating: 0,
      reviewCount: 0,
      pricing: body.pricing ?? {
        model: "free",
        currency: "KGS",
        hasDiscount: false,
        isRefundable: false,
      },
      certificateTemplate: body.certificateTemplate,
      completionThresholdPercent: body.completionThresholdPercent ?? 80,
      perks: body.perks ?? [],
      enrollmentLimit: body.enrollmentLimit,
      surface: "academy",
    };

    courses.push(course);
    return HttpResponse.json(course, { status: 201 });
  }),

  http.patch<{ slug: string }>(
    `${endPoint}/courses/:slug`,
    async ({ params, request }) => {
      const body = (await request.json()) as Partial<Course>;
      const course = courses.find((c) => c.slug === params.slug);
      if (!course) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }
      if (
        body.slug &&
        body.slug !== course.slug &&
        courses.some((c) => c.slug === body.slug)
      ) {
        return HttpResponse.json(
          { message: "A course with this slug already exists." },
          { status: 409 },
        );
      }

      Object.assign(course, body);
      course.updatedAt = new Date().toISOString();
      if (body.status === "published" && !course.publishedAt) {
        course.publishedAt = course.updatedAt;
      }
      return HttpResponse.json(course);
    },
  ),

  http.patch<{ slug: string }>(
    `${endPoint}/courses/:slug/status`,
    async ({ params, request }) => {
      const { status } = (await request.json()) as { status: string };
      const course = courses.find((c) => c.slug === params.slug);
      if (!course) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }
      course.status = status as Course["status"];
      if (status === "published") {
        course.publishedAt = new Date().toISOString();
      }
      course.updatedAt = new Date().toISOString();
      return HttpResponse.json(course);
    },
  ),

  http.delete<{ slug: string }>(`${endPoint}/courses/:slug`, ({ params }) => {
    const index = courses.findIndex((c) => c.slug === params.slug);
    if (index === -1) {
      return HttpResponse.json({ message: "Not found." }, { status: 404 });
    }
    const [removed] = courses.splice(index, 1);
    return HttpResponse.json(removed);
  }),

  http.get(`${endPoint}/articles`, () => HttpResponse.json(articles)),
  http.get<{ slug: string }>(`${endPoint}/articles/:slug`, bySlug(articles)),
  http.post(`${endPoint}/articles`, async ({ request }) => {
    const payload = (await request.json()) as ArticleInput;
    const now = new Date().toISOString();
    const slug = payload.slug || slugify(payload.title);

    if (articles.some((a) => a.slug === slug)) {
      return HttpResponse.json(
        { message: "An article with this slug already exists." },
        { status: 409 },
      );
    }

    const article: Article = {
      id: `article-${slug}`,
      type: "article",
      slug,
      title: payload.title,
      authorId: payload.authorId ?? "user-tes-author-1",
      status: payload.status ?? "draft",
      visibility: payload.status === "published" ? "public" : "private",
      language: payload.language ?? "en",
      topicTags: payload.topicTags ?? [],
      coverImage: payload.coverImage,
      createdAt: now,
      updatedAt: now,
      publishedAt: payload.status === "published" ? now : undefined,
      stats: { views: 0, likes: 0, comments: 0, saves: 0 },
      category: payload.category,
      body: payload.body,
      excerpt: payload.excerpt ?? "",
      readTimeMinutes: readTime(payload.body),
      pricing: {
        model: "free",
        currency: "KGS",
        hasDiscount: false,
        isRefundable: false,
      },
      surface: "academy",
      isVerifiedByTES: true,
    };

    articles.push(article);
    return HttpResponse.json(article, { status: 201 });
  }),
  http.put<{ slug: string }>(
    `${endPoint}/articles/:slug`,
    async ({ params, request }) => {
      const payload = (await request.json()) as ArticleInput;
      const article = articles.find((a) => a.slug === params.slug);
      if (!article) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }

      const now = new Date().toISOString();

      article.title = payload.title;
      article.body = payload.body;
      article.category = payload.category;
      article.readTimeMinutes = readTime(payload.body);
      article.updatedAt = now;

      if (payload.excerpt !== undefined) article.excerpt = payload.excerpt;
      if (payload.topicTags) article.topicTags = payload.topicTags;
      if (payload.coverImage) article.coverImage = payload.coverImage;

      if (payload.status && payload.status !== article.status) {
        article.status = payload.status;
        if (payload.status === "published") {
          article.publishedAt = now;
          article.visibility = "public";
        }
      }

      return HttpResponse.json(article);
    },
  ),
  http.patch<{ slug: string }>(
    `${endPoint}/articles/:slug/status`,
    async ({ params, request }) => {
      const { status } = (await request.json()) as { status: string };
      const article = articles.find((a) => a.slug === params.slug);
      if (!article) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }
      article.status = status as Article["status"];
      if (status === "published") {
        article.publishedAt = new Date().toISOString();
      }
      article.updatedAt = new Date().toISOString();
      return HttpResponse.json(article);
    },
  ),

  http.get(`${endPoint}/sessions`, () => HttpResponse.json(sessions)),
  http.get<{ slug: string }>(`${endPoint}/sessions/:slug`, bySlug(sessions)),

  http.post(`${endPoint}/sessions`, async ({ request }) => {
    const body = (await request.json()) as Partial<Session>;
    const now = new Date().toISOString();

    if (!body.title || !body.slug) {
      return HttpResponse.json(
        { message: "title and slug are required." },
        { status: 400 },
      );
    }
    if (sessions.some((s) => s.slug === body.slug)) {
      return HttpResponse.json(
        { message: "A session with this slug already exists." },
        { status: 409 },
      );
    }

    const session: Session = {
      id: `session-${body.slug}-${Date.now()}`,
      type: "session",
      slug: body.slug,
      title: body.title,
      authorId: body.authorId ?? "user-tes-admin-1",
      status: body.status ?? "draft",
      visibility: body.visibility ?? "private",
      language: body.language ?? "ru",
      topicTags: body.topicTags ?? [],
      region: body.region,
      coverImage: body.coverImage,
      createdAt: now,
      updatedAt: now,
      publishedAt: body.status === "published" ? now : undefined,
      stats: { views: 0, likes: 0, comments: 0, saves: 0 },
      description: body.description ?? "",
      format: body.format ?? "online",
      sessionType: body.sessionType ?? "webinar",
      location: body.location,
      venueAddress: body.venueAddress,
      meetingUrl: body.meetingUrl,
      startsAt: body.startsAt ?? now,
      endsAt: body.endsAt ?? now,
      registrationClosesAt: body.registrationClosesAt,
      hostId: body.hostId ?? body.authorId ?? "user-tes-admin-1",
      capacity: body.capacity ?? 0,
      registeredCount: 0,
      pricing: body.pricing ?? {
        model: "free",
        currency: "KGS",
        hasDiscount: false,
        isRefundable: false,
      },
      agenda: body.agenda ?? [],
      materials: body.materials ?? [],
      surface: "sessions",
    };

    sessions.push(session);
    return HttpResponse.json(session, { status: 201 });
  }),

  http.patch<{ slug: string }>(
    `${endPoint}/sessions/:slug`,
    async ({ params, request }) => {
      const body = (await request.json()) as Partial<Session>;
      const session = sessions.find((s) => s.slug === params.slug);
      if (!session) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }
      if (
        body.slug &&
        body.slug !== session.slug &&
        sessions.some((s) => s.slug === body.slug)
      ) {
        return HttpResponse.json(
          { message: "A session with this slug already exists." },
          { status: 409 },
        );
      }

      Object.assign(session, body);
      session.updatedAt = new Date().toISOString();
      if (body.status === "published" && !session.publishedAt) {
        session.publishedAt = session.updatedAt;
      }
      return HttpResponse.json(session);
    },
  ),

  http.patch<{ slug: string }>(
    `${endPoint}/sessions/:slug/status`,
    async ({ params, request }) => {
      const { status } = (await request.json()) as { status: string };
      const session = sessions.find((s) => s.slug === params.slug);
      if (!session) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }
      session.status = status as Session["status"];
      if (status === "published") {
        session.publishedAt = new Date().toISOString();
      }
      session.updatedAt = new Date().toISOString();
      return HttpResponse.json(session);
    },
  ),

  http.post<{ slug: string }>(
    `${endPoint}/sessions/:slug/cancel`,
    ({ params }) => {
      const session = sessions.find((s) => s.slug === params.slug);
      if (!session) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }
      session.isCanceled = true;
      session.updatedAt = new Date().toISOString();
      return HttpResponse.json(session);
    },
  ),

  http.post<{ slug: string }>(
    `${endPoint}/sessions/:slug/restore`,
    ({ params }) => {
      const session = sessions.find((s) => s.slug === params.slug);
      if (!session) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }
      session.isCanceled = false;
      session.updatedAt = new Date().toISOString();
      return HttpResponse.json(session);
    },
  ),

  http.delete<{ slug: string }>(`${endPoint}/sessions/:slug`, ({ params }) => {
    const index = sessions.findIndex((s) => s.slug === params.slug);
    if (index === -1) {
      return HttpResponse.json({ message: "Not found." }, { status: 404 });
    }
    const [removed] = sessions.splice(index, 1);
    return HttpResponse.json(removed);
  }),

  http.get(`${endPoint}/comments`, ({ request }) => {
    const contentId = new URL(request.url).searchParams.get("contentId");
    if (!contentId) {
      return HttpResponse.json(
        { message: "contentId is required." },
        { status: 400 },
      );
    }
    return HttpResponse.json(comments.filter((c) => c.contentId === contentId));
  }),

  http.post(`${endPoint}/comments`, async ({ request }) => {
    const payload = (await request.json()) as Partial<Comment>;

    if (!payload.contentId || !payload.body?.trim()) {
      return HttpResponse.json(
        { message: "contentId and body are required." },
        { status: 400 },
      );
    }

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      contentId: payload.contentId,
      parentId: payload.parentId,
      authorId: payload.authorId ?? "user-member-1",
      body: payload.body.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      isHidden: false,
    };

    comments.push(comment);
    bumpCommentCount(payload.contentId, 1, !payload.parentId);

    return HttpResponse.json(comment, { status: 201 });
  }),

  http.post<{ id: string }>(
    `${endPoint}/comments/:id/like`,
    ({ params }) => {
      const comment = comments.find((c) => c.id === params.id);
      if (!comment) {
        return HttpResponse.json({ message: "Not found." }, { status: 404 });
      }
      comment.likes += 1;
      return HttpResponse.json(comment);
    },
  ),

  http.post<{ slug: string; metric: string }>(
    `${endPoint}/stories/:slug/:metric`,
    engagement(stories),
  ),
  http.post<{ slug: string; metric: string }>(
    `${endPoint}/questions/:slug/:metric`,
    engagement(questions),
  ),
];
