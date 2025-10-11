import { useEffect, useState } from "react"

export function useDeals(userId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return

    setLoading(true)
    fetch(`/api/bitrix/getDeals?userId=${userId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setErr(json.error)
        else setItems(json.result ?? json) // Bitrix suele venir en result
      })
      .catch((e) => setErr(String(e)))
      .finally(() => setLoading(false))
  }, [userId])

  return { items, err, loading }
}
