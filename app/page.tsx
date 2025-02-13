"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { processImage } from "./actions"
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"

export default function ImageProcessor() {
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Show preview of original image
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)

      // Process image
      setLoading(true)
      try {
        const formData = new FormData()
        formData.append("image", file)

        const response = await processImage(formData)
        if (response.processedImage) {
          setResult(response.processedImage)
        }
      } catch (error) {
        console.error("Error processing image:", error)
      } finally {
        setLoading(false)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    multiple: false,
  })

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-black text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl w-full flex-grow flex flex-col">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <AnimatedShinyText shimmerWidth={300} className="text-5xl font-bold">
              Dark Doods
            </AnimatedShinyText>
          </h1>
          <p className="text-gray-400 text-lg">
            turn your doodle to dark mode. Note: it only works with the meh traits
          </p>
        </div>

        <div className="space-y-12 flex-grow">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 hover:border-white/50 hover:bg-white/5
              ${isDragActive ? "border-white bg-white/10" : "border-white/20"}`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-6 text-white/70" />
            <p className="text-gray-400 text-lg">
              {isDragActive ? "Drop the image here..." : "Drag & drop an image here, or click to select"}
            </p>
          </div>

          <div className="grid gap-12 sm:grid-cols-1 md:grid-cols-2">
            {preview && (
              <div className="space-y-3">
                <h2 className="font-medium text-center text-xl text-gray-200">Original</h2>
                <div className="aspect-square relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
                  <Image 
                    src={preview || "/placeholder.svg"} 
                    alt="Original" 
                    className="object-contain" 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-3">
                <h2 className="font-medium text-center text-xl text-gray-200">Processed</h2>
                <div className="aspect-square relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
                  <Image 
                    src={result || "/placeholder.svg"} 
                    alt="Processed" 
                    className="object-contain" 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <Button
                  onClick={() => {
                    const link = document.createElement("a")
                    link.href = result
                    link.download = "processed-image.png"
                    link.click()
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white border-0 py-6 text-lg rounded-xl transition-all duration-200"
                >
                  Download
                </Button>
              </div>
            )}
          </div>

          {loading && (
            <div className="text-center text-gray-400 text-lg animate-pulse">
              Processing image...
            </div>
          )}
        </div>
      </div>

      <footer className="w-full py-6 text-center border-t border-white/10">
        <p className="text-lg space-y-2">
          <AnimatedShinyText shimmerWidth={200} className="text-lg block">
            Make&nbsp;something...
          </AnimatedShinyText>
          <AnimatedShinyText shimmerWidth={200} className="text-lg block">
            made&nbsp;by&nbsp;
            <a 
              href="https://x.com/Must_be_Ash" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-200 transition-colors duration-200"
            >
              @must_be_ash
            </a>
            &nbsp;at&nbsp;
            <a 
              href="https://x.com/navigate_ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-200 transition-colors duration-200"
            >
              nvg8
            </a>
          </AnimatedShinyText>
        </p>
      </footer>
    </div>
  )
}

