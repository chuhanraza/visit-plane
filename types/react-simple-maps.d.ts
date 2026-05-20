declare module 'react-simple-maps' {
  import * as React from 'react'

  export interface ComposableMapProps {
    projectionConfig?: Record<string, unknown>
    width?: number
    height?: number
    style?: React.CSSProperties
    children?: React.ReactNode
  }
  export const ComposableMap: React.FC<ComposableMapProps>

  export interface ZoomableGroupProps {
    zoom?: number
    center?: [number, number]
    onMoveEnd?: (pos: { coordinates: [number, number]; zoom: number }) => void
    children?: React.ReactNode
    [key: string]: unknown
  }
  export const ZoomableGroup: React.FC<ZoomableGroupProps>

  export interface GeographiesProps {
    geography: string | object
    children: (props: { geographies: Geography[] }) => React.ReactNode
  }
  export const Geographies: React.FC<GeographiesProps>

  export interface Geography {
    rsmKey: string
    id: string | number
    properties: Record<string, unknown>
    [key: string]: unknown
  }

  export interface GeographyProps {
    geography: Geography
    fill?: string
    stroke?: string
    strokeWidth?: number
    style?: {
      default?: React.CSSProperties
      hover?: React.CSSProperties
      pressed?: React.CSSProperties
    }
    onMouseEnter?: (evt: React.MouseEvent<SVGPathElement>) => void
    onMouseMove?: (evt: React.MouseEvent<SVGPathElement>) => void
    onMouseLeave?: (evt: React.MouseEvent<SVGPathElement>) => void
    onClick?: (evt: React.MouseEvent<SVGPathElement>) => void
    [key: string]: unknown
  }
  export const Geography: React.FC<GeographyProps>
}
