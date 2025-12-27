export interface CustomInvitationType {
  id: string
  nameHe: string
  nameYi: string
  nameEn: string
}

export interface Invitation {
  id: string
  titleHe: string
  titleEn: string
  category: 'wedding' | 'barMitzvah' | 'batMitzvah' | 'birthday' | 'engagement' | 'thankYou'
  imageUrl: string
  hosts?: string
  eventDate?: string
}

export interface VideoBackground {
  id: string
  name: string
  url: string
  previewImage?: string
}
