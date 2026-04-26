import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

function FlowingMenu({
  items = [],
  speed = 15,
  textColor = '#FFFFFF',
  bgColor = '#060010',
  marqueeBgColor = '#FFFFFF',
  marqueeTextColor = '#060010',
  borderColor = '#FFFFFF',
}) {
  return (
    <div className="h-full w-full overflow-hidden rounded-2xl" style={{ backgroundColor: bgColor }}>
      <nav className="m-0 flex h-full flex-col p-0">
        {items.map((item, idx) => (
          <MenuItem
            key={item.id || idx}
            {...item}
            speed={speed}
            textColor={textColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            borderColor={borderColor}
            isFirst={idx === 0}
          />
        ))}
      </nav>
    </div>
  )
}

function MenuItem({
  text,
  image,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
  isFirst,
  onClick,
}) {
  const itemRef = useRef(null)
  const marqueeRef = useRef(null)
  const marqueeInnerRef = useRef(null)
  const animationRef = useRef(null)
  const [repetitions, setRepetitions] = useState(4)

  const findClosestEdge = (mouseX, mouseY, width, height) => {
    const topEdgeDist = (mouseX - width / 2) ** 2 + mouseY ** 2
    const bottomEdgeDist = (mouseX - width / 2) ** 2 + (mouseY - height) ** 2
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom'
  }

  useEffect(() => {
    const calculateRepetitions = () => {
      const container = marqueeInnerRef.current
      if (!container) return
      const part = container.querySelector('.marquee-part')
      if (!part) return

      const contentWidth = part.offsetWidth
      const viewportWidth = window.innerWidth
      if (!contentWidth) return

      const needed = Math.ceil(viewportWidth / contentWidth) + 2
      setRepetitions(Math.max(4, needed))
    }

    calculateRepetitions()
    window.addEventListener('resize', calculateRepetitions)
    return () => window.removeEventListener('resize', calculateRepetitions)
  }, [text, image])

  useEffect(() => {
    const setupMarquee = () => {
      const container = marqueeInnerRef.current
      if (!container) return
      const part = container.querySelector('.marquee-part')
      if (!part) return

      const contentWidth = part.offsetWidth
      if (!contentWidth) return

      animationRef.current?.kill()
      animationRef.current = gsap.to(container, {
        x: -contentWidth,
        duration: speed,
        ease: 'none',
        repeat: -1,
      })
    }

    const timer = setTimeout(setupMarquee, 50)

    return () => {
      clearTimeout(timer)
      animationRef.current?.kill()
    }
  }, [text, image, repetitions, speed])

  const handleMouseEnter = (ev) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return

    const rect = itemRef.current.getBoundingClientRect()
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height)

    gsap
      .timeline({ defaults: { duration: 0.6, ease: 'expo.out' } })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0)
  }

  const handleMouseLeave = (ev) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return

    const rect = itemRef.current.getBoundingClientRect()
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height)

    gsap
      .timeline({ defaults: { duration: 0.6, ease: 'expo.out' } })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
  }

  return (
    <div
      className="relative flex-1 overflow-hidden text-center"
      ref={itemRef}
      style={{ borderTop: isFirst ? 'none' : `1px solid ${borderColor}` }}
    >
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative flex h-full w-full cursor-pointer items-center justify-center bg-transparent text-[2.4vh] font-semibold uppercase no-underline"
        style={{ color: textColor }}
      >
        {text}
      </button>

      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-full translate-y-[101%] overflow-hidden"
        ref={marqueeRef}
        style={{ backgroundColor: marqueeBgColor }}
      >
        <div className="flex h-full w-fit" ref={marqueeInnerRef}>
          {Array.from({ length: repetitions }).map((_, idx) => (
            <div className="marquee-part flex flex-shrink-0 items-center" key={idx} style={{ color: marqueeTextColor }}>
              <span className="whitespace-nowrap px-[1vw] text-[2.3vh] font-medium uppercase leading-[1]">
                {text}
              </span>
              <div
                className="mx-[1.2vw] my-[1.2em] h-[6vh] w-[120px] rounded-[999px] bg-cover bg-center"
                style={{ backgroundImage: `url(${image})` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FlowingMenu
