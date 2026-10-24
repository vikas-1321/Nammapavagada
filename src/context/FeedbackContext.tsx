import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FeedbackContextData } from '../types/feedback';

interface FeedbackContextType {
  isOpen: boolean;
  contextData: FeedbackContextData | null;
  openFeedback: (context?: FeedbackContextData) => void;
  closeFeedback: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [contextData, setContextData] = useState<FeedbackContextData | null>(null);

  const openFeedback = useCallback((context?: FeedbackContextData) => {
    setContextData(context || null);
    setIsOpen(true);
  }, []);

  const closeFeedback = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setContextData(null);
    }, 300);
  }, []);

  return (
    <FeedbackContext.Provider value={{ isOpen, contextData, openFeedback, closeFeedback }}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = (): FeedbackContextType => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};
