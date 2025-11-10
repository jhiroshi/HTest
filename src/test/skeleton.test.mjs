import { describe, it, expect, beforeEach, vi } from 'vitest'
import { showSkeleton, hideSkeleton } from '../js/skeleton.mjs'

// Mock DOM elements
const createMockElement = (tagName = 'div') => {
  const element = {
    tagName: tagName.toUpperCase(),
    className: '',
    innerHTML: '',
    children: [],
    style: {},
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    appendChild: vi.fn(child => element.children.push(child)),
    closest: vi.fn(),
    id: ''
  }
  return element
}

// Mock document
global.document = {
  createElement: vi.fn((tagName) => createMockElement(tagName)),
  getElementById: vi.fn()
}

describe('skeleton.mjs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('showSkeleton', () => {
    it('should create skeleton items and append to list', () => {
      showSkeleton(1)
      const createdElements = mockElements
      expect(createdElements.some(el => el.className === 'item')).toBe(true)
      expect(createdElements.some(el => el.className === 'skeleton sk-avatar')).toBe(true)
      expect(createdElements.some(el => el.className === 'content')).toBe(true)
      expect(createdElements.some(el => el.className === 'skeleton sk-title')).toBe(true)
      expect(createdElements.some(el => el.className === 'skeleton sk-sub')).toBe(true)
    })

    it('should handle null list element gracefully', () => {
      global.document.getElementById.mockReturnValue(null)

      expect(() => showSkeleton()).toThrow()
    })
  })

  describe('hideSkeleton', () => {
    it('should set aria-busy to false on closest card', () => {
      const mockCard = createMockElement()
      const mockList = createMockElement()
      mockList.closest.mockReturnValue(mockCard)
      global.document.getElementById.mockReturnValue(mockList)

      hideSkeleton()

      expect(global.document.getElementById).toHaveBeenCalledWith('tbody-items')
      expect(mockList.closest).toHaveBeenCalledWith('.card')
      expect(mockCard.setAttribute).toHaveBeenCalledWith('aria-busy', 'false')
    })

    it('should handle when no card is found', () => {
      const mockList = createMockElement()
      mockList.closest.mockReturnValue(null)
      global.document.getElementById.mockReturnValue(mockList)

      expect(() => hideSkeleton()).not.toThrow()
    })

    it('should handle when tbody-items is not found', () => {
      global.document.getElementById.mockReturnValue(null)

      expect(() => hideSkeleton()).toThrow()
    })
  })
})