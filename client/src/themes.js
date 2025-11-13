// client/src/themes.js

// --- Base Styles ---
// We define base styles here to keep button/card definitions consistent.
const baseButton = "w-full md:w-auto text-lg font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed";
const baseCard = "bg-white rounded-lg shadow-md border border-gray-200";
const baseText = "text-gray-900";
const baseSecondaryText = "text-gray-700";
const baseInput = "bg-white border-gray-300 text-gray-900 focus:ring-blue-500";
const baseRadio = "bg-gray-100 border-gray-300 text-blue-600 focus:ring-blue-500";

// --- Theme Definitions ---
// This object holds all the style variations.
export const themes = {
  'Default': {
    name: 'Default',
    background: 'bg-[#f8f7f4] bg-[length:80px_80px] bg-[linear-gradient(transparent_78px,rgba(59,130,246,0.3)_80px),linear-gradient(90deg,transparent_78px,rgba(59,130,246,0.3)_80px)]',
    cardBg: baseCard,
    text: baseText,
    secondaryText: baseSecondaryText,
    input: baseInput,
    radio: baseRadio,
    button: `glow-btn text-xl disabled:opacity-50 disabled:cursor-not-allowed`, // Use existing glow-btn
    preview: 'bg-gradient-to-br from-blue-400 to-indigo-600',
    previewText: 'text-white'
  },
  'Charcoal': {
    name: 'Charcoal',
    background: 'bg-gray-900',
    cardBg: 'bg-gray-800 shadow-xl border border-gray-700',
    text: 'text-white',
    secondaryText: 'text-gray-300',
    input: 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500',
    radio: 'bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-400',
    button: `${baseButton} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400`,
    preview: 'bg-gray-800',
    previewText: 'text-gray-200'
  },
  'Bold': {
    name: 'Bold',
    background: 'bg-gray-100',
    cardBg: baseCard,
    text: baseText,
    secondaryText: baseSecondaryText,
    input: baseInput,
    radio: baseRadio,
    button: `${baseButton} bg-red-600 text-white hover:bg-red-700 focus:ring-red-400`,
    preview: 'bg-red-500',
    previewText: 'text-white'
  },
  'Navy Pop': {
    name: 'Navy Pop',
    background: 'bg-blue-900',
    cardBg: 'bg-blue-800 shadow-xl border border-blue-700',
    text: 'text-yellow-300',
    secondaryText: 'text-blue-200',
    input: 'bg-blue-700 border-blue-600 text-white focus:ring-yellow-400',
    radio: 'bg-blue-700 border-blue-600 text-yellow-400 focus:ring-yellow-300',
    button: `${baseButton} bg-yellow-400 text-blue-900 hover:bg-yellow-500 focus:ring-yellow-300`,
    preview: 'bg-blue-900',
    previewText: 'text-yellow-300'
  },
  'Forest Green': {
    name: 'Forest Green',
    background: 'bg-green-50',
    cardBg: baseCard,
    text: 'text-green-900',
    secondaryText: 'text-green-700',
    input: 'bg-white border-green-300 text-green-900 focus:ring-green-500',
    radio: 'bg-green-100 border-green-300 text-green-600 focus:ring-green-500',
    button: `${baseButton} bg-green-600 text-white hover:bg-green-700 focus:ring-green-400`,
    preview: 'bg-green-700',
    previewText: 'text-green-100'
  },
  'Sunset': {
    name: 'Sunset',
    background: 'bg-gradient-to-br from-orange-100 to-pink-100',
    cardBg: baseCard,
    text: 'text-pink-900',
    secondaryText: 'text-orange-800',
    input: 'bg-white border-pink-300 text-gray-900 focus:ring-pink-500',
    radio: 'bg-pink-100 border-pink-300 text-pink-600 focus:ring-pink-500',
    button: `${baseButton} bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:shadow-lg focus:ring-pink-400`,
    preview: 'bg-gradient-to-br from-orange-400 to-pink-500',
    previewText: 'text-white'
  },
  'Lavender': {
    name: 'Lavender',
    background: 'bg-purple-50',
    cardBg: baseCard,
    text: 'text-purple-900',
    secondaryText: 'text-purple-700',
    input: 'bg-white border-purple-300 text-gray-900 focus:ring-purple-500',
    radio: 'bg-purple-100 border-purple-300 text-purple-600 focus:ring-purple-500',
    button: `${baseButton} bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-400`,
    preview: 'bg-purple-200',
    previewText: 'text-purple-800'
  },
  'Minimal': {
    name: 'Minimal',
    background: 'bg-white',
    cardBg: 'bg-white rounded-lg shadow-none border border-gray-300',
    text: 'text-gray-800',
    secondaryText: 'text-gray-600',
    input: 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500',
    radio: 'bg-gray-100 border-gray-300 text-blue-600 focus:ring-blue-500',
    button: `${baseButton} bg-gray-800 text-white hover:bg-black focus:ring-gray-400`,
    preview: 'bg-white border-2 border-gray-300',
    previewText: 'text-gray-800'
  },
};

// Convert object to array for components that need to map
export const themesArray = Object.values(themes);