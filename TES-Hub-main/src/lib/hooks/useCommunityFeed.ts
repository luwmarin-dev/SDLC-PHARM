import type Question from "@/types/question";
import type Story from "@/types/story";
import { useMemo } from "react";
import useQuestions from "./useQuestions";
import useStories from "./useStories";

export type CommunityPost = Story | Question;

export type FeedSort = "latest" | "popular" | "unanswered";

export const isQuestion = (post: CommunityPost): post is Question =>
  post.type === "question";

export const isStory = (post: CommunityPost): post is Story =>
  post.type === "story";

export const publishedAtOf = (post: CommunityPost) =>
  new Date(post.publishedAt ?? post.createdAt).getTime();

interface Options {
  kind?: "all" | "story" | "question";
  sort?: FeedSort;
  search?: string;
  tag?: string | null;
  oblast?: string | null;
  authorId?: string | null;
}

const useCommunityFeed = ({
  kind = "all",
  sort = "latest",
  search = "",
  tag = null,
  oblast = null,
  authorId = null,
}: Options = {}) => {
  const {
    published: stories,
    isLoading: storiesLoading,
    error: storiesError,
  } = useStories();
  const {
    published: questions,
    isLoading: questionsLoading,
    error: questionsError,
  } = useQuestions();

  const all = useMemo<CommunityPost[]>(
    () => [...(stories ?? []), ...(questions ?? [])],
    [stories, questions],
  );

  const posts = useMemo(() => {
    const query = search.toLocaleLowerCase().trim();

    const filtered = all.filter((post) => {
      if (kind !== "all" && post.type !== kind) return false;
      if (tag && !post.topicTags.includes(tag)) return false;
      if (oblast && post.region?.oblast !== oblast) return false;
      if (authorId && post.authorId !== authorId) return false;
      if (!query) return true;

      const haystack = [post.title, post.body, ...post.topicTags]
        .join(" ")
        .toLocaleLowerCase();
      return haystack.includes(query);
    });

    return [...filtered].sort((a, b) => {
      if (sort === "popular") {
        return (
          b.stats.likes - a.stats.likes || b.stats.views - a.stats.views
        );
      }
      if (sort === "unanswered") {
        const answersOf = (p: CommunityPost) =>
          isQuestion(p) ? p.answerCount : p.stats.comments;
        return answersOf(a) - answersOf(b) || publishedAtOf(b) - publishedAtOf(a);
      }
      return publishedAtOf(b) - publishedAtOf(a);
    });
  }, [all, kind, sort, search, tag, oblast, authorId]);

  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    all.forEach((post) =>
      post.topicTags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)),
    );
    return [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [all]);

  const regions = useMemo(() => {
    const counts = new Map<string, number>();
    all.forEach((post) => {
      const name = post.region?.oblast;
      if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([oblast, count]) => ({ oblast, count }))
      .sort((a, b) => b.count - a.count || a.oblast.localeCompare(b.oblast));
  }, [all]);

  return {
    posts,
    all,
    topics,
    regions,
    isLoading: storiesLoading || questionsLoading,
    error: storiesError ?? questionsError,
  };
};

export default useCommunityFeed;
