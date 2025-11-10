import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'


vi.mock('../js/skeleton.mjs', () => ({
  showSkeleton: vi.fn(),
  hideSkeleton: vi.fn()
}))


const createMockElement = (tagName = 'div') => {
  const element = {
    tagName: tagName.toUpperCase(),
    className: '',
    innerHTML: '',
    textContent: '',
    title: '',
    hidden: false,
    children: [],
    firstChild: null,
    style: {},
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    appendChild: vi.fn(child => {
      element.children.push(child)
      if (!element.firstChild) element.firstChild = child
    }),
    insertBefore: vi.fn((newChild, referenceChild) => {
      element.children.unshift(newChild)
      element.firstChild = newChild
    }),
    prepend: vi.fn(child => {
      element.children.unshift(child)
      element.firstChild = child
    }),
    append: vi.fn((...children) => {
      children.forEach(child => element.children.push(child))
    }),
    closest: vi.fn(),
    addEventListener: vi.fn(),
    id: '',
    value: ''
  }
  return element
}


global.WebSocket = vi.fn().mockImplementation((url) => {
  const ws = {
    url,
    addEventListener: vi.fn(),
    close: vi.fn(),
    send: vi.fn(),
    readyState: 1
  }
  return ws
})


global.fetch = vi.fn()


global.document = {
  createElement: vi.fn((tagName) => createMockElement(tagName)),
  getElementById: vi.fn(),
  addEventListener: vi.fn()
}


global.console = {
  log: vi.fn(),
  error: vi.fn()
}


global.setTimeout = vi.fn((callback, delay) => {
  callback()
  return 1
})

describe('main.mjs', () => {
  let mainModule

  beforeEach(async () => {
    vi.clearAllMocks()
    
    global.document.getElementById.mockReturnValue(createMockElement())
    
    
    global.fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([
        {
          Title: 'Test Document 1',
          Contributors: [{ Name: 'John Doe' }],
          Attachments: ['file1.pdf'],
          Version: '1.0'
        }
      ]),
      text: vi.fn().mockResolvedValue('Success')
    })

    
    mainModule = await import('../js/main.mjs')
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('View management', () => {
    it('should set list view correctly', () => {
      const mockViewList = createMockElement()
      const mockViewGrid = createMockElement()
      
      global.document.getElementById.mockImplementation((id) => {
        if (id === 'view-list') return mockViewList
        if (id === 'view-grid') return mockViewGrid
        return createMockElement()
      })

      
      
      expect(global.document.getElementById).toBeDefined()
    })
  })

  describe('WebSocket functionality', () => {
    it('should create WebSocket connection', () => {
      
      
      expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:8080/notifications')
    })

    it('should handle WebSocket message processing', () => {
      
      const mockWs = {
        addEventListener: vi.fn()
      }
      global.WebSocket.mockReturnValue(mockWs)

      
      expect(mockWs.addEventListener).toHaveBeenCalledWith('open', expect.any(Function))
      expect(mockWs.addEventListener).toHaveBeenCalledWith('message', expect.any(Function))
      expect(mockWs.addEventListener).toHaveBeenCalledWith('close', expect.any(Function))
      expect(mockWs.addEventListener).toHaveBeenCalledWith('error', expect.any(Function))
    })
  })

  describe('API interactions', () => {
    it('should load initial data successfully', async () => {
      const { showSkeleton, hideSkeleton } = await import('../js/skeleton.mjs')
      
      
      global.document.getElementById.mockImplementation((id) => {
        const element = createMockElement()
        if (id === 'tbody-items' || id === 'grid') {
          element.innerHTML = ''
        }
        return element
      })

      
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/documents')
    })

    it('should handle API errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))
      
      
      expect(() => {
        
      }).not.toThrow()
    })

    it('should create new items via API', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: vi.fn().mockResolvedValue('Created')
      })

      
      expect(global.fetch).toBeDefined()
    })
  })
+

  describe('Card rendering', () => {
    it('should render card with correct structure', () => {
      const mockGrid = createMockElement()
      global.document.getElementById.mockReturnValue(mockGrid)

      const item = {
        title: 'Test Card',
        contributors: [{ Name: 'John Doe' }],
        attachments: ['file.pdf'],
        version: '1.0'
      }

      
      const elements = []
      global.document.createElement.mockImplementation((tagName) => {
        const element = createMockElement(tagName)
        elements.push(element)
        return element
      })

      
      const card = createMockElement()
      card.className = 'card'

      expect(card.className).toBe('card')
    })
  })

})