import { supabase } from './supabase'

export type Deck = {
  id: string
  user_id: string
  name: string
  tag: string | null
  created_at: string
  cards_count?: number
}

export type Card = {
  id: string
  deck_id: string
  user_id: string
  card_code: string
  front_text: string
  back_text: string
  front_image_path: string | null
  back_image_path: string | null
  created_at: string
}

export type NewCardInput = {
  deck_id: string
  card_code?: string
  front_text: string
  back_text: string
  front_image_path?: string | null
  back_image_path?: string | null
}

export type ImportCard = {
  id: string
  question: string
  answer: string
}

export type ImportValidationError = {
  index: number
  item: ImportCard | null
  reason: string
}

export type ImportResult = {
  valid: ImportCard[]
  invalid: ImportValidationError[]
}

export async function getDecks(): Promise<Deck[]> {
  const { data, error } = await supabase
    .from('decks')
    .select('*, cards(count)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []).map((d: any) => ({
    ...d,
    cards_count: d.cards_count ?? 0,
  }))
}

export async function getDeck(id: string): Promise<Deck> {
  const { data, error } = await supabase
    .from('decks')
    .select('*, cards(count)')
    .eq('id', id)
    .single()

  if (error) throw error
  return {
    ...data,
    cards_count: data.cards_count ?? 0,
  }
}

export async function createDeck(name: string, tag: string | null): Promise<Deck> {
  const { data, error } = await supabase
    .from('decks')
    .insert({ name, tag })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateDeck(id: string, updates: { name?: string; tag?: string | null }): Promise<Deck> {
  const { data, error } = await supabase
    .from('decks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteDeck(id: string): Promise<void> {
  const { error } = await supabase.from('decks').delete().eq('id', id)
  if (error) throw error
}

export async function getCards(deckId: string): Promise<Card[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('deck_id', deckId)
    .order('card_code', { ascending: true })

  if (error) throw error
  return data || []
}

export type DeckStats = {
  total: number
  mastered: number
  dueToday: number
  accuracy: number
}

export async function getDeckStats(deckId: string): Promise<DeckStats> {
  const { data: cards, error } = await supabase
    .from('cards')
    .select('box, due_at, review_count')
    .eq('deck_id', deckId)

  if (error) throw error

  const list = cards || []
  const total = list.length
  const mastered = list.filter((c) => (c.box ?? 0) >= 4).length
  const now = new Date()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  const dueToday = list.filter((c) => {
    const due = c.due_at ? new Date(c.due_at) : null
    return due && due.getTime() <= todayEnd.getTime()
  }).length
  // taxa de acerto aproximada: cartões revisados (box > 0) sobre total
  const reviewed = list.reduce((sum, c) => sum + (c.box ?? 0 > 0 ? 1 : 0), 0)
  const accuracy = total > 0 ? Math.round((reviewed / total) * 100) : 0

  return { total, mastered, dueToday, accuracy }
}

export async function answerCard(
  cardId: string,
  correct: boolean,
  now: Date = new Date(),
): Promise<Card> {
  const { data: card, error: fetchError } = await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .single()

  if (fetchError) throw fetchError
  if (!card) throw new Error('Cartão não encontrado')

  const { scheduleNext } = await import('../lib/schedule')
  const result = scheduleNext({
    box: card.box ?? 0,
    correct,
    reviewCount: card.review_count ?? 0,
    now,
  })

  const { data: updated, error: updateError } = await supabase
    .from('cards')
    .update({
      box: result.box,
      due_at: result.dueAt,
      review_count: result.reviewCount,
      last_reviewed_at: result.lastReviewedAt,
    })
    .eq('id', cardId)
    .select()
    .single()

  if (updateError) throw updateError

  // grava no review_log
  const user = await getCurrentUser()
  if (user) {
    await supabase.from('review_log').insert({
      user_id: user.id,
      card_id: cardId,
      deck_id: card.deck_id,
      correct,
      reviewed_at: result.lastReviewedAt,
    })
  }

  return updated
}

export async function exportDeckCards(deckId: string): Promise<{ id: string; question: string; answer: string }[]> {
  const { data: cards, error } = await supabase
    .from('cards')
    .select('card_code, front_text, back_text')
    .eq('deck_id', deckId)
    .order('card_code', { ascending: true })

  if (error) throw error

  return (cards || []).map((c) => ({
    id: c.card_code,
    question: c.front_text,
    answer: c.back_text,
  }))
}

export async function createCard(input: NewCardInput): Promise<Card> {
  let cardCode = input.card_code
  if (!cardCode || cardCode.trim() === '') {
    const { data: existing } = await supabase
      .from('cards')
      .select('card_code')
      .eq('deck_id', input.deck_id)
      .order('card_code', { ascending: false })
      .limit(1)
    if (existing && existing.length > 0 && existing[0].card_code) {
      cardCode = (parseInt(existing[0].card_code, 10) + 1).toString()
    } else {
      cardCode = '1'
    }
  }

  const { data, error } = await supabase
    .from('cards')
    .insert({ ...input, card_code: cardCode })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCard(id: string, updates: Partial<NewCardInput>): Promise<Card> {
  const { data, error } = await supabase.from('cards').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteCard(id: string): Promise<void> {
  const { error } = await supabase.from('cards').delete().eq('id', id)
  if (error) throw error
}

export async function upsertCard(input: NewCardInput): Promise<Card> {
  const { data, error } = await supabase
    .from('cards')
    .upsert(input, { onConflict: 'deck_id, card_code' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getCurrentUser(): Promise<{ id: string } | null> {
  // @ts-ignore - supabase.auth.getUser exists at runtime but types may be outdated
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data?.user ? { id: data.user.id } : null
}

export async function uploadImage(file: File, userId: string, folder: 'front' | 'back'): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${userId}/${folder}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('card-images')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (uploadError) throw uploadError

  const { data: signedUrlData } = await supabase.storage
    .from('card-images')
    .createSignedUrl(path, 60 * 60 * 24 * 365)

  if (!signedUrlData?.signedUrl) throw new Error('Failed to create signed URL')
  return signedUrlData.signedUrl
}

export function getSignedImageUrl(path: string): Promise<string> {
  return supabase.storage.from('card-images').createSignedUrl(path, 60 * 60 * 24 * 365).then((r) => {
    if (!r.data?.signedUrl) throw new Error('Failed to create signed URL')
    return r.data.signedUrl
  })
}
