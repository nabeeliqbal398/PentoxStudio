import type { TextField } from 'payload'

const YOUTUBE_URL = /^https:\/\/((www|m)\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)\//

// Embeds are rendered through a fixed component, so only YouTube links are accepted.
export const youtubeUrlField = (name = 'videoUrl'): TextField => ({
  name,
  type: 'text',
  validate: (value: string | null | undefined) =>
    !value || YOUTUBE_URL.test(value) || 'Use a full https YouTube link (youtube.com or youtu.be).',
  admin: { description: 'Optional YouTube link.' },
})
