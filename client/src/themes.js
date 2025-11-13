// client/src/themes.js

// --- Theme Definitions ---
// All classes are written out in full strings so Tailwind can find them.
export const themes = {
  // 1. From image_09d091.png
  'Light': {
    name: 'Light',
    background: 'bg-white',
    cardBg: "bg-white rounded-lg shadow-lg border border-gray-200",
    text: "text-gray-900",
    secondaryText: "text-gray-700",
    input: "bg-white border-gray-300 text-gray-900 focus:ring-blue-500",
    radio: "bg-gray-100 border-gray-300 text-blue-600 focus:ring-blue-500",
    button: "w-full md:w-auto text-lg font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400",
    preview: 'bg-blue-500',
    previewText: 'text-white'
  },
  // 2. From image_09d4c7.png
  'Dark': {
    name: 'Dark',
    background: 'bg-gray-900',
    cardBg: 'bg-gray-800 shadow-xl border border-gray-700',
    text: 'text-white',
    secondaryText: 'text-gray-300',
    input: 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500',
    radio: 'bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-400',
    button: "w-full md:w-auto text-lg font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400",
    preview: 'bg-gray-900',
    previewText: 'text-white'
  },
  // 3. From image_09d849.png
  'Eco-friendly': {
    name: 'Eco-friendly',
    background: 'bg-green-50',
    cardBg: "bg-white rounded-lg shadow-lg border border-green-300",
    text: 'text-green-900',
    secondaryText: 'text-green-700',
    input: 'bg-white border-green-300 text-green-900 focus:ring-green-500',
    radio: 'bg-green-100 border-green-300 text-green-600 focus:ring-green-500',
    button: "w-full md:w-auto text-lg font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed bg-green-700 text-white hover:bg-green-800 focus:ring-green-400",
    preview: 'bg-green-700',
    previewText: 'text-white'
  },
  // 4. From image_09d869.png
  'Quiet Sands': {
    name: 'Quiet Sands',
    background: 'bg-orange-50',
    cardBg: "bg-white rounded-lg shadow-lg border border-yellow-400",
    text: 'text-gray-900',
    secondaryText: 'text-gray-700',
    input: 'bg-white border-gray-300 text-gray-900 focus:ring-yellow-500',
    radio: 'bg-yellow-100 border-yellow-300 text-yellow-600 focus:ring-yellow-500',
    button: "w-full md:w-auto text-lg font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-yellow-300",
    preview: 'bg-yellow-500',
    previewText: 'text-black'
  },
  // 5. From image_09d88a.png
  'Bold': {
    name: 'Bold',
    background: 'bg-white',
    cardBg: 'bg-white rounded-lg shadow-lg border border-gray-400',
    text: 'text-gray-900',
    secondaryText: 'text-gray-700',
    input: 'bg-white border-gray-300 text-gray-900 focus:ring-gray-800',
    radio: 'bg-gray-100 border-gray-300 text-gray-900 focus:ring-gray-800',
    button: "w-full md:w-auto text-lg font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed bg-black text-white hover:bg-gray-800 focus:ring-gray-400",
    preview: 'bg-black',
    previewText: 'text-white'
  },
  // 6. From image_09d8c7.png
  'Navy Pop': {
    name: 'Navy Pop',
    background: 'bg-blue-950',
    cardBg: 'bg-blue-900 shadow-xl border border-blue-800',
    text: 'text-white',
    secondaryText: 'text-blue-300',
    input: 'bg-blue-800 border-blue-700 text-white focus:ring-yellow-500',
    radio: 'bg-blue-800 border-blue-700 text-yellow-500 focus:ring-yellow-400',
    button: "w-full md:w-auto text-lg font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed bg-yellow-500 text-blue-900 hover:bg-yellow-600 focus:ring-yellow-300",
    preview: 'bg-blue-900',
    previewText: 'text-yellow-500'
  },
  // 7. From image_09d8e8.png
  'Coral': {
    name: 'Coral',
    background: 'bg-gray-100',
    cardBg: "bg-white rounded-lg shadow-lg border border-gray-300",
    text: "text-gray-900",
    secondaryText: "text-gray-700",
    input: "bg-white border-gray-300 text-gray-900 focus:ring-red-500",
    radio: "bg-red-100 border-red-300 text-red-600 focus:ring-red-500",
    button: "w-full md:w-auto text-lg font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed bg-red-500 text-white hover:bg-red-600 focus:ring-red-300",
    preview: 'bg-red-500',
    previewText: 'text-white'
  },
  // 8. From image_09d906.png
  'Formal Gray': {
    name: 'Formal Gray',
    background: 'bg-gray-300',
    cardBg: 'bg-white rounded-lg shadow-lg border border-gray-400',
    text: 'text-gray-900',
    secondaryText: 'text-gray-700',
    input: 'bg-white border-gray-300 text-gray-900 focus:ring-gray-800',
    radio: 'bg-gray-100 border-gray-300 text-gray-900 focus:ring-gray-800',
    button: "w-full md:w-auto text-lg font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed bg-black text-white hover:bg-gray-800 focus:ring-gray-400",
    preview: 'bg-gray-300',
    previewText: 'text-black'
  },
  // 9. From image_09dbb0.png
  'Futuristic': {
    name: 'Futuristic',
    background: 'bg-black',
    cardBg: 'bg-gray-900 shadow-xl border border-gray-700',
    text: 'text-white',
    secondaryText: 'text-gray-300',
    input: 'bg-gray-800 border-gray-700 text-white focus:ring-pink-500',
    radio: 'bg-gray-800 border-gray-700 text-pink-500 focus:ring-pink-400',
    button: "w-full md:w-auto text-lg font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-400 to-pink-500 text-white hover:shadow-lg focus:ring-pink-400",
    preview: 'bg-gradient-to-r from-cyan-400 to-pink-500',
    previewText: 'text-white'
  },
  // 10. From image_09dc47.png
  'Cyber Dawn': {
    name: 'Cyber Dawn',
    background: 'bg-black',
    cardBg: 'bg-black shadow-xl border-2 border-yellow-400 rounded-lg shadow-yellow-400/20',
    text: 'text-yellow-400',
    secondaryText: 'text-yellow-600',
    input: 'bg-gray-900 border-yellow-700 text-white focus:ring-yellow-500',
    radio: 'bg-gray-900 border-yellow-700 text-yellow-500 focus:ring-yellow-400',
    button: "w-full md:w-auto text-lg font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed bg-yellow-400 text-black hover:bg-yellow-500 focus:ring-yellow-300 shadow-lg shadow-yellow-400/30",
    preview: 'bg-yellow-400',
    previewText: 'text-black'
  },
};

// Convert object to array for components that need to map
export const themesArray = Object.values(themes);