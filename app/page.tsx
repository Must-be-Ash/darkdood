"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { processImage } from "./actions"

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25"}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {isDragActive ? "Drop the image here..." : "Drag & drop an image here, or click to select"}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {preview && (
            <div className="space-y-2">
              <h2 className="font-medium">Original</h2>
              <div className="aspect-square relative rounded-lg overflow-hidden border">
                <img src={preview || "/placeholder.svg"} alt="Original" className="object-cover w-full h-full" />
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-2">
              <h2 className="font-medium">Processed</h2>
              <div className="aspect-square relative rounded-lg overflow-hidden border">
                <img src={result || "/placeholder.svg"} alt="Processed" className="object-cover w-full h-full" />
              </div>
              <Button
                onClick={() => {
                  const link = document.createElement("a")
                  link.href = result
                  link.download = "processed-image.png"
                  link.click()
                }}
                className="w-full"
              >
                Download
              </Button>
            </div>
          )}
        </div>

        {loading && <div className="text-center text-muted-foreground">Processing image...</div>}
      </div>
    </div>
  )
}

