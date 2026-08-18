// DEPRECATED: not used as of 2026-08-18
"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center p-0 md:p-6"
        >
          {/* Backdrop with Liquid Glass Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-secondary/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              mass: 0.8
            }}
            className="relative w-full max-w-4xl max-h-[95dvh] md:max-h-[90dvh] overflow-hidden bg-card rounded-t-[2.5rem] md:rounded-bento shadow-2xl flex flex-col z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1 bg-border/50 rounded-full mx-auto mt-4 mb-2 md:hidden" />

            {/* Close Button - Premium Tactile */}
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-6 md:top-6 md:right-6 z-50 w-10 h-10 flex items-center justify-center bg-card/80 backdrop-blur-md border border-border/50 rounded-full text-secondary shadow-sm hover:bg-card transition-colors"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </motion.button>

            <div className="overflow-y-auto custom-scrollbar flex-grow p-0">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
