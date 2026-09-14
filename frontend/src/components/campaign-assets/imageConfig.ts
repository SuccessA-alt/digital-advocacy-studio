export type Template = 'gradient' | 'solid' | 'split' | 'frame' | 'dots'

export type TextPosition = 'top' | 'centre' | 'bottom'

export const formats = {
  square: {
    label: 'Square 1:1',
    width: 1080,
    height: 1080,
  },
  story: {
    label: 'Story 9:16',
    width: 1080,
    height: 1920,
  },
  x: {
    label: 'X 16:9',
    width: 1600,
    height: 900,
  },
  linkedin: {
    label: 'LinkedIn',
    width: 1200,
    height: 627,
  },
} as const

export const goalColours = [
  '#f8c8d2',
  '#f3dfb2',
  '#c8e2c3',
  '#f0bdc8',
  '#ffc9c3',
  '#bceaf5',
  '#ffedaa',
  '#e8bdce',
  '#ffd0b5',
  '#f5bdd8',
  '#ffdbad',
  '#e5d2ae',
  '#c4dbc9',
  '#bce0f3',
  '#d0e9bb',
  '#bfd5e6',
  '#c9d2e2',
]

export interface ImageSettings {
  format: keyof typeof formats
  template: Template
  colour: string
  headline: string
  supporting: string
  signoff: string
  position: TextPosition
  shade: number
  goalBar: boolean
  zoom: number
  rotation: number
  panX: number
  panY: number
}