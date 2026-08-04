export function slugifyAudioSegment(text: string): string {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug.length > 0 ? slug : 'audio';
}

export function suggestPrimaryAudioPath(headword: string): string {
  return `assets/audio/${slugifyAudioSegment(headword)}.mp3`;
}

export function suggestExampleAudioPath(headword: string, exampleIndex: number): string {
  return `assets/audio/examples/${slugifyAudioSegment(headword)}-${String(exampleIndex + 1)}.mp3`;
}

export function suggestLessonAudioPath(lessonCode: string): string {
  return `assets/audio/${slugifyAudioSegment(lessonCode)}.mp3`;
}
