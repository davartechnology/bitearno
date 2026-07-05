export const SHORTLINK_PROVIDERS = {
  fclc: {
    name: 'Fc.lc',
    apiKey: '978a10490636e8f8a45f082883ed6aa4bbaae843',
    baseUrl: 'https://fc.lc/api',
  },
  exeio: {
    name: 'Exe.io',
    apiKey: '6fc8e948ce854c792c7afb21b6e760ea0ee1fd66',
    baseUrl: 'https://exe.io/api',
  },
  shrinkme: {
    name: 'Shrinkme.io',
    apiKey: '18d5d20fc3282675c3a43b5c9e9ca5200accc308',
    baseUrl: 'https://shrinkme.io/api',
  },
  adfly: {
    name: 'Adfly',
    apiKey: 'ee269915fe5dcd2a7e380c293cb53c07f1ce9790',
    baseUrl: 'https://api.adf.ly/v1',
  },
}

export async function shortenUrl(
  originalUrl: string,
  provider: keyof typeof SHORTLINK_PROVIDERS
): Promise<string> {
  const p = SHORTLINK_PROVIDERS[provider]

  try {
    if (provider === 'fclc') {
      const res = await fetch(
        `${p.baseUrl}?api=${p.apiKey}&url=${encodeURIComponent(originalUrl)}&format=json`
      )
      const data = await res.json()
      return data.shortenedUrl || originalUrl
    }

    if (provider === 'exeio') {
      const res = await fetch(
        `${p.baseUrl}?api=${p.apiKey}&url=${encodeURIComponent(originalUrl)}&format=json`
      )
      const data = await res.json()
      return data.shortenedUrl || originalUrl
    }

    if (provider === 'shrinkme') {
      const res = await fetch(
        `${p.baseUrl}?api=${p.apiKey}&url=${encodeURIComponent(originalUrl)}&format=json`
      )
      const data = await res.json()
      return data.shortenedUrl || originalUrl
    }

    if (provider === 'adfly') {
      const res = await fetch(
        `${p.baseUrl}/shorten?_user_id=YOUR_ADFLY_USER_ID&_api_key=${p.apiKey}&url=${encodeURIComponent(originalUrl)}&domain=adf.ly&advert_type=int`
      )
      const data = await res.json()
      return data.data?.[0]?.short_url || originalUrl
    }

    return originalUrl
  } catch (error) {
    console.error(`Shortlink error (${provider}):`, error)
    return originalUrl
  }
}
