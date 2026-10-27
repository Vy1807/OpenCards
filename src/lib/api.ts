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
