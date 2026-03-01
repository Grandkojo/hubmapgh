import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables
process.env.GEMINI_API_KEY = 'test-api-key'

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
    db: {},
    trackFilter: vi.fn(),
    trackAIQuery: vi.fn(),
    trackHubView: vi.fn(),
}))
