import { HomeProfile } from "@/components/public/home/HomeProfile"
import { getHomeData } from "@/lib/public-data"

export default async function HomePage() {
  let content: Awaited<ReturnType<typeof getHomeData>>["content"] = {}
  let settings: Awaited<ReturnType<typeof getHomeData>>["settings"] = null
  let resume: Awaited<ReturnType<typeof getHomeData>>["resume"] = null
  try {
    const data = await getHomeData()
    content = data.content
    settings = data.settings
    resume = data.resume
  } catch {}
  return <HomeProfile content={content} settings={settings} resume={resume} />
}
