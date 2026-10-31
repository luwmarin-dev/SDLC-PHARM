import { db } from './connection.ts'
import { users, userSettings } from './schema.ts'
import { hashPassword } from '../utils/passwords.ts'

const demoUsers = [
  {
    id: "user-member-1",
    email: "member@gmail.com",
    rawPassword: "tesmember",
    username: "nurlan_m",
    displayName: "Nurlan Toktosunov",
    avatar: "/img/avatars/member.png",
    role: "member",
    bio: "Home gardener, learning about drip irrigation.",
    oblast: "Osh",
    raion: "Kara-Suu",
    village: null,
    languages: ["ru", "en"],
    interests: ["Gardening", "Technology"],
    isEmailVerified: true,
  },
  {
    id: "user-admin-1",
    email: "tes_admin@gmail.com",
    rawPassword: "tesadmin",
    username: "tes_admin",
    displayName: "TES Administrator",
    avatar: "/img/avatars/admin.png",
    role: "admin",
    bio: "TES Knowledge Hub platform operations and moderator.",
    oblast: "Chui",
    raion: "Alamudun",
    village: "Bishkek",
    languages: ["ru", "ky", "en"],
    interests: ["Administration", "Agriculture"],
    isEmailVerified: true,
  },
  {
    id: "user-verified-farmer-1",
    email: "verified_farmer@gmail.com",
    rawPassword: "verifiedfarmer",
    username: "gulnara_farms",
    displayName: "Gulnara Isakova",
    avatar: "/img/avatars/verified_farmer.png",
    role: "verified_farmer",
    bio: "Certified organic apple grower in Issyk-Kul.",
    oblast: "Issyk-Kul",
    raion: "Tup",
    village: "Tup",
    languages: ["ky", "ru"],
    interests: ["Organic Farming", "Horticulture"],
    isEmailVerified: true,
  },
  {
    id: "user-expert-1",
    email: "spac_consultant@gmail.com",
    rawPassword: "spacconsultant",
    username: "spac_consultant",
    displayName: "SPAC Consultant",
    avatar: "/img/avatars/consultant.png",
    role: "expert",
    bio: "Soil Physics & Agricultural Chemistry specialist.",
    oblast: "Chui",
    raion: "Sokuluk",
    village: "Sokuluk",
    languages: ["ru", "en"],
    interests: ["Soil Health", "Consulting"],
    isEmailVerified: true,
  },
  {
    id: "user-author-1",
    email: "tes_author@gmail.com",
    rawPassword: "tesauthor",
    username: "tes_author",
    displayName: "Bakyt Mambetov",
    avatar: "/img/avatars/author.png",
    role: "author",
    bio: "Agronomy researcher and extension writer.",
    oblast: "Naryn",
    raion: "Kochkor",
    village: "Kochkor",
    languages: ["ky", "ru"],
    interests: ["Agronomy", "Writing"],
    isEmailVerified: true,
  },
  {
    id: "user-guest-1",
    email: "guest@gmail.com",
    rawPassword: "tesguest",
    username: "guest_demo",
    displayName: "Aigerim Bekova",
    avatar: "/img/avatars/guest.png",
    role: "guest",
    bio: "Just browsing TES Hub before creating an account.",
    oblast: "Chui",
    raion: null,
    village: null,
    languages: ["en"],
    interests: ["Gardening"],
    isEmailVerified: false,
  },
]

async function seed() {
  console.log('🌱 Seeding demo users into Neon PostgreSQL...')

  for (const item of demoUsers) {
    const hashedPassword = await hashPassword(item.rawPassword)
    const { rawPassword, ...userData } = item

    await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          username: userData.username,
          displayName: userData.displayName,
          avatar: userData.avatar,
          role: userData.role,
          bio: userData.bio,
          oblast: userData.oblast,
          raion: userData.raion,
          village: userData.village,
          languages: userData.languages,
          interests: userData.interests,
          isEmailVerified: userData.isEmailVerified,
          password: hashedPassword,
        },
      })

    // Also initialize default user settings
    await db
      .insert(userSettings)
      .values({
        userId: item.id,
        contentLanguages: ["ru", "ky"],
        emailReplies: true,
        emailSessions: true,
        emailCourses: false,
        emailNewsletter: false,
        publicProfile: true,
        showRegion: true,
        allowMessages: true,
      })
      .onConflictDoNothing()
  }

  console.log(`✅ Seeded ${demoUsers.length} demo users into Neon PostgreSQL!`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seeding users failed:', err)
  process.exit(1)
})
