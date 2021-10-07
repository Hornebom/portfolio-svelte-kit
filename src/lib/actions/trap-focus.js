import * as focusTrap from 'focus-trap'

function trapFocus(node, { active, onEscape }) {
  const trap = focusTrap.createFocusTrap(node, {
    escapeDeactivates: () => {
      onEscape()
      return true
    }
  })
  setActiveState(active)

  function setActiveState(state) {
    if(state) {
      trap.activate()
    } else {
      trap.deactivate()
    }
  }

  return {
    update({ active }) {
      setActiveState(active)
    }
  }
}

export default trapFocus
