import { setContext } from 'svelte'
import { writable, get, readable } from 'svelte/store'

function themeHandler() {
  let root
  const colors = writable({
    primary: [ 0, 0, 0, 1 ], 
    secondary: [ .55, .63, .93, 1 ]
  })

  const themes = readable({
    blue: [ .55, .63, .93, 1 ], 
    yellow: [ 1, .85, .48, 1 ], 
    purple: [ .66, .56, .85, 1 ],
    green: [ .74, .78, .5, 1 ]
  })

  const theme = writable('blue')

	setContext('colors', colors)
	setContext('themes', themes)
	setContext('theme', theme)

  colors.subscribe(value => {
		updateCustomProperties(value)
  })

  theme.subscribe(value => {
    updateLocalStorage(value)
    const color = get(themes)[value] || get(themes).blue
    colors.update(({primary}) => { return { primary, secondary: color }})
  })

  function updateCustomProperties(obj) {
    if(!root) {
      return
    }

    Object.entries(obj).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}-raw`, value.map((n, i) => n * (i === 3 ? 1 : 255)).join(','))
    })
	}

  function updateLocalStorage(value) {
    if(!root) {
      return
    }

    localStorage.setItem('theme', value)
  }

  function setRoot(el) {
    root = el
    if(localStorage.getItem('theme')) {
      theme.set(localStorage.getItem('theme'))
    }
    updateCustomProperties(get(colors))
  }

  return { setRoot }
}

export default themeHandler
