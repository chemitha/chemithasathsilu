"use client";

import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string | ((t: number) => number);
  splitType?: 'chars' | 'words' | 'lines' | 'words, chars';
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  textAlign?: 'left' | 'right' | 'center' | 'justify' | 'initial' | 'inherit';
  onLetterAnimationComplete?: () => void;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  tag = 'p',
  textAlign = 'center',
  onLetterAnimationComplete
}) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const animationCompletedRef = useRef(false);
  const onCompleteRef = useRef(onLetterAnimationComplete);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    onCompleteRef.current = onLetterAnimationComplete;
  }, [onLetterAnimationComplete]);

  useEffect(() => {
    if (document.fonts) {
      document.fonts.ready.then(() => setFontsLoaded(true));
    } else {
      setFontsLoaded(true);
    }
  }, []);

  useGSAP(
    () => {
      if (!ref.current || !fontsLoaded) return;

      const el = ref.current as HTMLElement & {
        _rbsplitInstance?: GSAPSplitText;
      };
      if (el._rbsplitInstance) {
        el._rbsplitInstance.revert();
        el._rbsplitInstance = undefined;
      }

      // Identify closest custom scroll container if body isn't scrolling window directly
      const scrollContainer = el.closest('.overflow-y-scroll') || window;

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
      const sign =
        marginValue === 0
          ? ''
          : marginValue < 0
          ? `-=${Math.abs(marginValue)}${marginUnit}`
          : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;

      const assignTargets = (self: GSAPSplitText) => {
        let targets: HTMLElement[] = [];
        if (splitType.includes('chars')) {
          targets = self.chars as HTMLElement[];
        } else if (splitType.includes('words')) {
          targets = self.words as HTMLElement[];
        } else if (splitType.includes('lines')) {
          targets = self.lines as HTMLElement[];
        } else {
          targets = self.chars as HTMLElement[];
        }
        return targets;
      };

      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        reduceWhiteSpace: false,
        onSplit: (self: GSAPSplitText) => {
          setIsReady(true);
          const targets = assignTargets(self);
          return gsap.fromTo(
            targets,
            { ...from },
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              scrollTrigger: {
                trigger: el,
                scroller: scrollContainer, // Crucial for snapped container layouts
                start,
                once: true,
                fastScrollEnd: true,
                onEnter: () => {
                  if (!animationCompletedRef.current) {
                    animationCompletedRef.current = true;
                    if (onCompleteRef.current) {
                      onCompleteRef.current();
                    }
                  }
                }
              }
            }
          );
        }
      });

      el._rbsplitInstance = splitInstance;
      ScrollTrigger.refresh();

      return () => {
        ScrollTrigger.getAll().forEach(st => {
          if (st.trigger === el) st.kill();
        });
        if (el._rbsplitInstance) {
          el._rbsplitInstance.revert();
          el._rbsplitInstance = undefined;
        }
      };
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded
      ],
      scope: ref
    }
  );

  const style: React.CSSProperties = {
    textAlign: textAlign as any,
    wordWrap: 'break-word',
    willChange: 'transform, opacity'
  };

  // Keep element completely hidden prior to GSAP initialization to avoid raw text flash
  const visibilityClass = isReady ? 'opacity-100' : 'opacity-0';
  const classes = `split-parent overflow-hidden inline-block whitespace-normal transition-opacity duration-150 ${visibilityClass} ${className}`;
  const Tag = (tag || 'p') as React.ElementType;

  return (
    <Tag ref={ref} style={style} className={classes}>
      {text}
    </Tag>
  );
};

export default SplitText;