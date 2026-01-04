import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, doc, setDoc, Timestamp } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const mockUsers = [
  {
    username: "alex_creative",
    email: "alex@example.com",
    bio: "Digital artist and content creator",
    level: 4,
    xp: 1200,
    followers: ["user2", "user3"],
    following: ["user2"],
    profileImage: "",
    badges: ["FIRST_POST", "FIVE_POSTS", "FIFTY_FOLLOWERS"],
  },
  {
    username: "creative_jane",
    email: "jane@example.com",
    bio: "Filmmaker and storyteller",
    level: 3,
    xp: 650,
    followers: ["user1"],
    following: ["user1", "user3"],
    profileImage: "",
    badges: ["FIRST_POST", "FIVE_POSTS"],
  },
  {
    username: "tech_innovator",
    email: "tech@example.com",
    bio: "Tech enthusiast exploring new ideas",
    level: 2,
    xp: 320,
    followers: [],
    following: ["user1", "user2"],
    profileImage: "",
    badges: ["FIRST_POST"],
  },
]

const mockPosts = [
  {
    authorId: "user1",
    authorName: "alex_creative",
    content: "Just finished an amazing digital art project! Check it out and let me know what you think.",
    likes: 45,
    comments: 12,
    likedBy: ["user2", "user3"],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
  },
  {
    authorId: "user2",
    authorName: "creative_jane",
    content: "Started a new filmmaking project today. Excited to share the journey with everyone on Nexplore!",
    likes: 32,
    comments: 8,
    likedBy: ["user1"],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 60 * 1000)),
  },
  {
    authorId: "user1",
    authorName: "alex_creative",
    content: "The creative process never stops. Always learning and improving my craft.",
    likes: 28,
    comments: 6,
    likedBy: ["user2", "user3"],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)),
  },
]

const mockComments = [
  {
    postId: "post1",
    authorId: "user2",
    authorName: "creative_jane",
    content: "This is absolutely stunning! The details are incredible.",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 1 * 60 * 60 * 1000)),
  },
  {
    postId: "post1",
    authorId: "user3",
    authorName: "tech_innovator",
    content: "Love the color palette you used. Amazing work!",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 30 * 60 * 1000)),
  },
  {
    postId: "post2",
    authorId: "user1",
    authorName: "alex_creative",
    content: "Can't wait to see the final result! Your work is always top-notch.",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
  },
]

async function generateMockData() {
  console.log("Starting mock data generation...")

  try {
    // Create users
    for (let i = 0; i < mockUsers.length; i++) {
      const userId = `user${i + 1}`
      await setDoc(doc(db, "users", userId), {
        uid: userId,
        ...mockUsers[i],
        createdAt: Timestamp.now(),
      })
      console.log(`Created user: ${mockUsers[i].username}`)
    }

    // Create posts
    for (let i = 0; i < mockPosts.length; i++) {
      const postRef = await addDoc(collection(db, "posts"), mockPosts[i])
      console.log(`Created post: ${postRef.id}`)

      // Update mock comments with the actual post IDs
      if (i < mockComments.length) {
        mockComments[i].postId = postRef.id
      }
    }

    // Create comments
    for (const comment of mockComments) {
      if (comment.postId) {
        await addDoc(collection(db, "comments"), comment)
        console.log(`Created comment for post: ${comment.postId}`)
      }
    }

    console.log("Mock data generation completed successfully!")
  } catch (error) {
    console.error("Error generating mock data:", error)
  }
}

generateMockData()
