import { doc, updateDoc, getDoc } from "firebase/firestore"
import { db } from "./firebase"

export const XP_REWARDS = {
  CREATE_POST: 50,
  GET_LIKE: 10,
  GET_COMMENT: 15,
  FOLLOW_CREATOR: 20,
  REACH_100_FOLLOWERS: 200,
  REACH_500_FOLLOWERS: 500,
  REACH_1000_FOLLOWERS: 1000,
  DAILY_LOGIN: 5,
}

export const BADGE_CONDITIONS = {
  FIRST_POST: { name: "First Steps", icon: "🎬", condition: "posts >= 1" },
  FIVE_POSTS: { name: "Content Creator", icon: "✨", condition: "posts >= 5" },
  TEN_POSTS: { name: "Serial Creator", icon: "🚀", condition: "posts >= 10" },
  HUNDRED_LIKES: { name: "Popular", icon: "🔥", condition: "likes >= 100" },
  FIFTY_FOLLOWERS: { name: "Rising Star", icon: "⭐", condition: "followers >= 50" },
  HUNDRED_FOLLOWERS: { name: "Influencer", icon: "👑", condition: "followers >= 100" },
  FIVE_HUNDRED_FOLLOWERS: { name: "Creator Elite", icon: "💎", condition: "followers >= 500" },
}

export const LEVELS = [
  { level: 1, minXp: 0, maxXp: 100, name: "Novice" },
  { level: 2, minXp: 100, maxXp: 250, name: "Apprentice" },
  { level: 3, minXp: 250, maxXp: 500, name: "Creator" },
  { level: 4, minXp: 500, maxXp: 1000, name: "Pro Creator" },
  { level: 5, minXp: 1000, maxXp: 2000, name: "Master" },
  { level: 6, minXp: 2000, maxXp: 5000, name: "Legend" },
  { level: 7, minXp: 5000, maxXp: 10000, name: "Nexplore Icon" },
]

export async function addXP(userId: string, amount: number) {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) return

    const currentXp = userDoc.data().xp || 0
    const currentLevel = userDoc.data().level || 1
    const newXp = currentXp + amount

    // Calculate new level
    let newLevel = 1
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (newXp >= LEVELS[i].minXp) {
        newLevel = LEVELS[i].level
        break
      }
    }

    await updateDoc(userRef, {
      xp: newXp,
      level: newLevel,
    })

    return { newXp, newLevel, leveledUp: newLevel > currentLevel }
  } catch (error) {
    console.error("Error adding XP:", error)
  }
}

export function calculateLevelProgress(xp: number) {
  const currentLevel = LEVELS.find((l) => xp >= l.minXp && xp < l.maxXp) || LEVELS[LEVELS.length - 1]
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1] || currentLevel

  const progress = ((xp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) * 100

  return {
    currentLevel: currentLevel.level,
    levelName: currentLevel.name,
    nextLevelXp: nextLevel.minXp,
    progress: Math.min(progress, 100),
    currentLevelMinXp: currentLevel.minXp,
  }
}

export function checkBadgeProgress(stats: any) {
  const earnedBadges: string[] = []

  Object.entries(BADGE_CONDITIONS).forEach(([key, badge]: any) => {
    const condition = badge.condition
    let isMet = false

    if (condition.includes("posts")) {
      const minPosts = Number.parseInt(condition.match(/\d+/)[0])
      isMet = stats.posts >= minPosts
    } else if (condition.includes("likes")) {
      const minLikes = Number.parseInt(condition.match(/\d+/)[0])
      isMet = stats.likes >= minLikes
    } else if (condition.includes("followers")) {
      const minFollowers = Number.parseInt(condition.match(/\d+/)[0])
      isMet = stats.followers >= minFollowers
    }

    if (isMet) {
      earnedBadges.push(key)
    }
  })

  return earnedBadges
}
