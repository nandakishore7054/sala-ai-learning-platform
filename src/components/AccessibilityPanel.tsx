import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  X, 
  Volume2, 
  VolumeX, 
  Contrast, 
  Type, 
  Layout, 
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAccessibility, FontSize } from '../context/AccessibilityContext';

export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSettings } = useAccessibility();

  const togglePanel = () => setIsOpen(!isOpen);

  const fontSizes: { label: string; value: FontSize }[] = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' }
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={togglePanel}
        className="fixed bottom-6 right-6 z-[100] bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 hover:scale-110 transition-all active:scale-95"
        aria-label="Accessibility Settings"
      >
        <Settings className={`w-6 h-6 ${isOpen ? 'rotate-90' : 'rotate-0'} transition-transform duration-300`} />
      </button>

      {/* Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-[100] w-80 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Settings size={20} />
                <h2 className="font-bold">Accessibility</h2>
              </div>
              <button onClick={togglePanel} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Text to Speech */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${settings.textToSpeech ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    {settings.textToSpeech ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Text-to-Speech</p>
                    <p className="text-[10px] text-slate-500">Read content aloud</p>
                  </div>
                </div>
                <button
                  onClick={() => updateSettings({ textToSpeech: !settings.textToSpeech })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.textToSpeech ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.textToSpeech ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${settings.highContrast ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Contrast size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">High Contrast</p>
                    <p className="text-[10px] text-slate-500">Better visibility</p>
                  </div>
                </div>
                <button
                  onClick={() => updateSettings({ highContrast: !settings.highContrast })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.highContrast ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.highContrast ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Simple Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${settings.simpleNavigation ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Layout size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Simple Navigation</p>
                    <p className="text-[10px] text-slate-500">Reduce complexity</p>
                  </div>
                </div>
                <button
                  onClick={() => updateSettings({ simpleNavigation: !settings.simpleNavigation })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.simpleNavigation ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.simpleNavigation ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Font Size */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-400">
                    <Type size={18} />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Font Size</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {fontSizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => updateSettings({ fontSize: size.value })}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                        settings.fontSize === size.value 
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-600' 
                          : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-medium">Settings are saved automatically</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
