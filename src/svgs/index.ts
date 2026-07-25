import Svg0 from './github.svg'
import Svg1 from './resume-filled.svg'
import Svg2 from './resume-outline.svg'

export type SvgComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>

export const svgItems: { key: string; Component: SvgComponent }[] = [
  { key: './github.svg', Component: Svg0 },
  { key: './resume-filled.svg', Component: Svg1 },
  { key: './resume-outline.svg', Component: Svg2 },
]
