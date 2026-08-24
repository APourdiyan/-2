import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDevice } from '../../hooks/useDevice';
import { MobileLayout } from './MobileLayout';
import { DesktopLayout } from './DesktopLayout';

export interface ResponsiveLayoutProps {
  children: React.ReactNode;
  onOpenChatBot?: () => void;
  onOpenSearch?: () => void;
  onCloseModals?: () => void;
}

/**
 * کامپوننت مادر سیستم طراحی دوگانه:
 * انتخاب هوشمندانه بین MobileLayout و DesktopLayout با انیمیشن ترنزیشن روان
 */
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  onOpenChatBot,
  onOpenSearch,
  onCloseModals
}) => {
  const { isDesktop } = useDevice();

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isDesktop ? (
        <motion.div
          key="desktop-mode"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          <DesktopLayout onOpenSearch={onOpenSearch} onCloseModals={onCloseModals}>
            {children}
          </DesktopLayout>
        </motion.div>
      ) : (
        <motion.div
          key="mobile-mode"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          <MobileLayout onOpenChatBot={onOpenChatBot} onOpenSearch={onOpenSearch}>
            {children}
          </MobileLayout>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResponsiveLayout;
