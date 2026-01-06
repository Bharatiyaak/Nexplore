// core/feed.ts
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorImage?: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  createdAt: Timestamp;
  hidden?: boolean;
}

type FeedCallback = (posts: FeedPost[]) => void;
type ErrorCallback = (error: Error) => void;

/**
 * Subscribe to the public feed.
 * - Enforces moderation
 * - Safe against errors
 * - UI never touches Firestore directly
 */
export function subscribeToFeed(
  onData: FeedCallback,
  onError?: ErrorCallback,
  maxPosts = 20
) {
  try {
    const q = query(
      collection(db, "posts"),
      where("hidden", "==", false),
      orderBy("createdAt", "desc"),
      limit(maxPosts)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const posts: FeedPost[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<FeedPost, "id">),
        }));

        onData(posts);
      },
      (error) => {
        console.error("[Feed] Snapshot error:", error);
        onData([]); // never break UI
        onError?.(error);
      }
    );
  } catch (err) {
    console.error("[Feed] Fatal error:", err);
    onData([]);
    return () => {};
  }
}
