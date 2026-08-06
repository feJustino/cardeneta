import { prisma } from "@/lib/prisma"
import { SettingsClient } from "./SettingsClient"
import { DEFAULT_CHARGE_MESSAGE, CHARGE_MESSAGE_KEY } from "@/lib/charge"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const setting = await prisma.setting.findUnique({
    where: { key: CHARGE_MESSAGE_KEY },
  })

  return (
    <SettingsClient
      initialMessage={setting?.value ?? DEFAULT_CHARGE_MESSAGE}
    />
  )
}
