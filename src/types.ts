export interface CustomInvitationType {
  id: string
  nameHe: string
  nameYi: string
  nameEn: string
}

export interface DesignStyle {
  id: string
  name: string
  description: string
}

export interface AdminFont {
  id: string
  name: string
  url: string
  file?: string
}

export interface AdminBackground {
  id: string
  name: string
  preview: string
  file?: string
}

export interface AdminDimensions {
  width: number
  height: number
  unit: 'px' | 'cm'
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
