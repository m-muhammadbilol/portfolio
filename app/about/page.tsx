import { AboutContent } from "@/components/public/about/AboutContent"
import { getAboutData } from "@/lib/public-data"

export const revalidate = 3600

export default async function AboutPage() {
  let content: Awaited<ReturnType<typeof getAboutData>> = {}
  try {
    content = await getAboutData()
  } catch {}
  return <AboutContent content={content} />
}
