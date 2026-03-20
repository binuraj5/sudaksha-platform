import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 80,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f39c12',
          fontWeight: 'bold',
          fontFamily: 'system-ui',
        }}
      >
        S
      </div>
    ),
    {
      ...size,
    },
  )
}
