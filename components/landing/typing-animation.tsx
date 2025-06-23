'use client';

import { useEffect, useState } from 'react';

interface TypingAnimationProps {
  phrases: string[];
  className?: string;
  speed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
  pauseAfterDelete?: number;
}

export function TypingAnimation({ 
  phrases, 
  className = '', 
  speed = 180, 
  deleteSpeed = 90, 
  pauseDuration = 2500,
  pauseAfterDelete = 600,
}: TypingAnimationProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPauseAfterDelete, setIsPauseAfterDelete] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(pauseTimer);
    }

    if (isPauseAfterDelete) {
      const pauseDeleteTimer = setTimeout(() => {
        setIsPauseAfterDelete(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      }, pauseAfterDelete);
      return () => clearTimeout(pauseDeleteTimer);
    }

    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < currentPhrase.length) {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1));
        } else {
          setIsPaused(true);
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setIsPauseAfterDelete(true);
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timer);
  }, [
    currentText,
    isDeleting,
    isPaused,
    isPauseAfterDelete,
    currentPhraseIndex,
    phrases,
    speed,
    deleteSpeed,
    pauseDuration,
    pauseAfterDelete,
  ]);

  // Cursor only blinks when not paused
  const showCursor = !(isPaused || isPauseAfterDelete);

  return (
    <span className={className}>
      {currentText}
      <span className={showCursor ? "animate-pulse" : ""}>|</span>
    </span>
  );
}