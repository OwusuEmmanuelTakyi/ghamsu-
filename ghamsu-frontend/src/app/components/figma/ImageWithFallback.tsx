import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, onLoad, ...rest } = props

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle rounded-xl ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full opacity-50">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <div className={`relative overflow-hidden rounded-xl ${className ?? ''}`} style={style}>
      {/* Blurred Loading Placeholder */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-gray-200 animate-pulse backdrop-blur-xl"
          />
        )}
      </AnimatePresence>
      <motion.img
        initial={{ filter: 'blur(10px)', scale: 1.05 }}
        animate={{ filter: isLoaded ? 'blur(0px)' : 'blur(10px)', scale: isLoaded ? 1 : 1.05 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        {...rest}
        onLoad={(e) => {
          setIsLoaded(true)
          if (onLoad) onLoad(e)
        }}
        onError={handleError}
      />
    </div>
  )
}
