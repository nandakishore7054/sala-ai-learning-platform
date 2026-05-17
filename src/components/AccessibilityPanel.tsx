import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings2,
  X,
  Volume2,
  VolumeX,
  Contrast,
  Type,
  LayoutDashboard,
  Sparkles,
  Check
} from 'lucide-react';

import { useAccessibility, FontSize } from '../context/AccessibilityContext';

export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);

  const { settings, updateSettings } = useAccessibility();

  const fontSizes: { label: string; value: FontSize }[] = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' }
  ];

  const Toggle = ({
    enabled,
    onClick
  }: {
    enabled: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
        enabled
          ? 'bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30'
          : 'bg-slate-300 dark:bg-slate-700'
      }`}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md ${
          enabled ? 'left-8' : 'left-1'
        }`}
      />
    </button>
  );

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] group"
      >
        <div className="absolute inset-0 rounded-full bg-indigo-500 blur-2xl opacity-70 group-hover:opacity-100 transition-opacity" />

        <div className="relative flex items-center justify-center w-16 h-16 rounded-full border border-white/10 bg-gradient-to-br from-indigo-600 via-violet-600 to-blue-500 shadow-2xl backdrop-blur-xl">
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.4 }}
          >
            {isOpen ? (
              <X className="w-7 h-7 text-white" />
            ) : (
              <Settings2 className="w-7 h-7 text-white" />
            )}
          </motion.div>
        </div>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-28 right-6 z-[9999] w-[360px] max-w-[90vw]"
          >
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/80 dark:bg-[#0F172A]/90 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
              
              {/* Header */}
              <div className="relative overflow-hidden px-6 py-5 bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent_40%)]" />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-white">
                        Accessibility
                      </h2>

                      <p className="text-xs text-indigo-100">
                        Personalized learning experience
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl hover:bg-white/10 transition"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                
                {/* Text To Speech */}
                <div className="group rounded-3xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <div
                        className={`p-3 rounded-2xl ${
                          settings.textToSpeech
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {settings.textToSpeech ? (
                          <Volume2 size={20} />
                        ) : (
                          <VolumeX size={20} />
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          Text To Speech
                        </h3>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Read lessons aloud automatically
                        </p>
                      </div>
                    </div>

                    <Toggle
                      enabled={settings.textToSpeech}
                      onClick={() =>
                        updateSettings({
                          textToSpeech: !settings.textToSpeech
                        })
                      }
                    />
                  </div>
                </div>

                {/* High Contrast */}
                <div className="group rounded-3xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <div
                        className={`p-3 rounded-2xl ${
                          settings.highContrast
                            ? 'bg-violet-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        <Contrast size={20} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          High Contrast
                        </h3>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Improve visibility and readability
                        </p>
                      </div>
                    </div>

                    <Toggle
                      enabled={settings.highContrast}
                      onClick={() =>
                        updateSettings({
                          highContrast: !settings.highContrast
                        })
                      }
                    />
                  </div>
                </div>

                {/* Simple Navigation */}
                <div className="group rounded-3xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <div
                        className={`p-3 rounded-2xl ${
                          settings.simpleNavigation
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        <LayoutDashboard size={20} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          Simple Navigation
                        </h3>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Reduce UI complexity
                        </p>
                      </div>
                    </div>

                    <Toggle
                      enabled={settings.simpleNavigation}
                      onClick={() =>
                        updateSettings({
                          simpleNavigation: !settings.simpleNavigation
                        })
                      }
                    />
                  </div>
                </div>

                {/* Font Size */}
                <div className="rounded-3xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <Type size={20} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-white">
                        Font Size
                      </h3>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Customize reading comfort
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {fontSizes.map((size) => (
                      <button
                        key={size.value}
                        onClick={() =>
                          updateSettings({
                            fontSize: size.value
                          })
                        }
                        className={`relative py-3 rounded-2xl font-semibold text-sm transition-all ${
                          settings.fontSize === size.value
                            ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-[1.03]'
                        }`}
                      >
                        {settings.fontSize === size.value && (
                          <Check className="absolute top-2 right-2 w-4 h-4" />
                        )}

                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-slate-200/60 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03]">
                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                  Accessibility preferences are saved automatically
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}