"use server"

import sharp from "sharp"

export async function processImage(formData: FormData) {
  try {
    const file = formData.get("image") as File
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Convert to black and white with gradient background
    const metadata = await sharp(buffer).metadata()
    const imageWidth = metadata.width || 800
    const imageHeight = metadata.height || 600
    
    const gradientBg = `
      <svg width="${metadata.width}" height="${metadata.height}">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#000000" />
            <stop offset="100%" style="stop-color:#555555" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
      </svg>
    `

    const bwImage = await sharp(buffer)
      .grayscale()
      .composite([
        {
          input: Buffer.from(gradientBg),
          blend: 'multiply'
        }
      ])
      .toBuffer()

    // Create SVG circles for the eyes with glow effect
    const circleSize = Math.round(imageWidth * 0.15)
    const circleSVG = `
      <svg width="${circleSize * 1.4}" height="${circleSize * 1.4}">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle
          cx="${circleSize * 0.7}"
          cy="${circleSize * 0.7}"
          r="${circleSize/2}"
          fill="white"
          filter="url(#glow)"
        />
      </svg>
    `

    // Simple straight line for mouth
    const mouthWidth = Math.round(imageWidth * 0.08)
    const mouthSVG = `
      <svg width="${mouthWidth * 1.2}" height="16" shape-rendering="crispEdges">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g transform="rotate(-4, ${mouthWidth/2}, 8)">
          <rect 
            x="0"
            y="3"
            width="${mouthWidth}"
            height="10"
            fill="white"
            filter="url(#glow)"
            shape-rendering="crispEdges"
          />
        </g>
      </svg>
    `

    // Create the overlays
    const leftEye = await sharp(Buffer.from(circleSVG)).toBuffer()
    const rightEye = await sharp(Buffer.from(circleSVG)).toBuffer()
    const mouth = await sharp(Buffer.from(mouthSVG)).toBuffer()

    // Calculate positions
    const leftEyeX = Math.round(imageWidth * 0.35)
    const rightEyeX = Math.round(imageWidth * 0.65)
    const eyesY = Math.round(imageHeight * 0.32)
    
    // Position mouth directly between eyes, but shifted right
    const mouthX = Math.round(leftEyeX + ((rightEyeX - leftEyeX) / 2) + (mouthWidth * 0.8))
    const mouthY = Math.round(eyesY + (circleSize * 0.80)) // Slightly higher

    // Composite the images with positioning
    const finalImage = await sharp(bwImage)
      .composite([
        {
          input: leftEye,
          blend: "screen",
          left: leftEyeX,
          top: eyesY,
        },
        {
          input: rightEye,
          blend: "screen",
          left: rightEyeX,
          top: eyesY,
        },
        {
          input: mouth,
          blend: "screen",
          left: mouthX,
          top: mouthY,
        }
      ])
      .toBuffer()

    // Convert to base64 for display
    const processedImage = `data:image/png;base64,${finalImage.toString("base64")}`

    return { processedImage }
  } catch (error) {
    console.error("Error processing image:", error)
    throw new Error("Failed to process image")
  }
}

