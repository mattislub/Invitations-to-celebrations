const CATEGORY_NORMALIZATION_MAP: Record<string, string> = {
  'bar mitzvah': 'barMitzvah',
  'bar-mitzvah': 'barMitzvah',
  'barmitzvah': 'barMitzvah',
  barMitzvah: 'barMitzvah',
  'bat mitzvah': 'batMitzvah',
  'bat-mitzvah': 'batMitzvah',
  'batmitzvah': 'batMitzvah',
  batMitzvah: 'batMitzvah',
  'thank you': 'thankYou',
  'thank-you': 'thankYou',
  thankyou: 'thankYou',
  thankYou: 'thankYou'
}

export const normalizeCategoryKey = (value?: string | null): string | undefined => {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined

  const lower = trimmed.toLowerCase()
  return CATEGORY_NORMALIZATION_MAP[trimmed] || CATEGORY_NORMALIZATION_MAP[lower] || trimmed
}
