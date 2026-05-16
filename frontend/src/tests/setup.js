import '@testing-library/jest-dom'
import { fireEvent } from '@testing-library/react'
global.fireEvent = fireEvent

global.fetch = vi.fn(() =>
    Promise.resolve({
        ok: false,
        json: () => Promise.resolve(null)
    })
)
