"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"

export default function BatCat() {
  const blinkRef = useRef<null | NodeJS.Timeout>(null)
  const [isBlinking, setIsBlinking] = useState(false)
  const [positions, setPositions] = useState({
    head: {
      x: 90,
      y: 110,
    },
    leftEye: {
      x: 78,
      y: 112,
    },
    rightEye: {
      x: 104,
      y: 112,
    },
    leftEar: {
      x: 60,
    },
    rightEar: {
      x: 120,
    },
  })

  const handleMove = useCallback((clientX: number, clientY: number) => {
    const svgElement = document.getElementById("brand")
    if (!svgElement) return
    const rect = svgElement.getBoundingClientRect()
    const svgCenterX = rect.left + rect.width / 2
    const svgCenterY = rect.top + rect.height / 2
    const offsetX = clientX - svgCenterX
    const offsetY = clientY - svgCenterY

    // head
    const maxHeadOffset = 6
    const headDistance = Math.sqrt(offsetX * offsetX + offsetY * offsetY)
    const clampedHeadDistance = Math.min(headDistance, maxHeadOffset)
    const headAngle = Math.atan2(offsetY, offsetX)
    const headMoveX = clampedHeadDistance * Math.cos(headAngle)
    const headMoveY = clampedHeadDistance * Math.sin(headAngle)

    // eyes
    const maxEyesOffset = 20
    const eyesDistance = headDistance
    const eyesAngle = headAngle
    const clampedEyesDistance = Math.min(eyesDistance, maxEyesOffset)
    const eyeMoveX = clampedEyesDistance * Math.cos(eyesAngle)
    const eyeMoveY = clampedEyesDistance * Math.sin(eyesAngle)

    // ears
    const earMoveFactor = 0.5
    const earMoveX = headMoveX * earMoveFactor

    setPositions({
      head: {
        x: 90 + headMoveX,
        y: 110 + headMoveY,
      },
      leftEye: {
        x: 77.5 + eyeMoveX,
        y: 112 + eyeMoveY,
      },
      rightEye: {
        x: 103.5 + eyeMoveX,
        y: 112 + eyeMoveY,
      },
      leftEar: {
        x: 60 - earMoveX,
      },
      rightEar: {
        x: 120 - earMoveX,
      },
    })
  }, [])

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      handleMove(event.clientX, event.clientY)
    },
    [handleMove],
  )

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0]
        handleMove(touch.clientX, touch.clientY)
      }
    },
    [handleMove],
  )

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleTouchMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleTouchMove)
    }
  }, [handleMouseMove, handleTouchMove])

  // blink
  useEffect(() => {
    const scheduleBlink = () => {
      const nextBlinkInterval = Math.random() * 3000 + 2000
      blinkRef.current = setTimeout(() => {
        setIsBlinking(true)
        blinkRef.current = setTimeout(() => setIsBlinking(false), 200)
        scheduleBlink()
      }, nextBlinkInterval)
    }

    scheduleBlink()

    return () => {
      if (blinkRef.current) {
        clearTimeout(blinkRef.current)
      }
    }
  }, [])

  return (
    <svg id="brand" width="96" height="96" viewBox="0 0 180 180">
      <defs>
        <clipPath id="backgroundClip">
          <circle cx="90" cy="90" r="90" />
        </clipPath>
      </defs>
      <g clipPath="url(#backgroundClip)">
        <circle id="bg" cx="90" cy="90" r="90" className={cn("fill-zinc-900 dark:fill-zinc-100")} />
        <path
          id="left-ear"
          className={cn("fill-zinc-100 dark:fill-zinc-900")}
          d={`M${positions.leftEar.x} 34L${positions.leftEar.x} 34L127 180H17Z`}
        />
        <path
          id="right-ear"
          className={cn("fill-zinc-100 dark:fill-zinc-900")}
          d={`M${positions.rightEar.x} 34L${positions.rightEar.x} 34L53 180H163Z`}
        />
        <circle
          id="head"
          r="42"
          cx={positions.head.x}
          cy={positions.head.y}
          className={cn("fill-zinc-100 dark:fill-zinc-900")}
        />
        <ellipse
          rx="7"
          id="left-eye"
          cx={positions.leftEye.x}
          cy={positions.leftEye.y}
          ry={isBlinking ? "0" : "14"}
          className={cn("fill-zinc-900 dark:fill-zinc-100 transition-[ry] duration-150 ease-in-out")}
        />
        <ellipse
          id="right-eye"
          rx="7"
          cx={positions.rightEye.x}
          cy={positions.rightEye.y}
          ry={isBlinking ? "0" : "14"}
          className={cn("fill-zinc-900 dark:fill-zinc-100 transition-[ry] duration-150 ease-in-out")}
        />
      </g>
    </svg>
  )
}

