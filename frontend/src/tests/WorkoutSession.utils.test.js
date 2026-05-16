import { describe, test, expect } from 'vitest'

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
}

const getDiff = (current, previous) => {
    if (!previous || previous === 0) return null
    const diff = ((current - previous) / previous * 100).toFixed(0)
    return Number(diff)
}

const getTotalSets = (exercise, extraSets) => {
    return exercise.sets + (extraSets[exercise.id] || 0)
}

const getUserColor = (username) => {
    const AVATAR_COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2', '#9333ea', '#dc2626']
    if (!username) return AVATAR_COLORS[0]
    return AVATAR_COLORS[username.charCodeAt(0) % AVATAR_COLORS.length]
}

describe('formatTime', () => {
    test('форматує секунди в хвилини', () => {
        expect(formatTime(90)).toBe('1:30')
    })
    test('форматує 0 секунд', () => {
        expect(formatTime(0)).toBe('0:00')
    })
    test('додає нулі до секунд', () => {
        expect(formatTime(65)).toBe('1:05')
    })
    test('форматує години', () => {
        expect(formatTime(3600)).toBe('60:00')
    })
})

describe('getDiff', () => {
    test('повертає null якщо previous 0', () => {
        expect(getDiff(100, 0)).toBeNull()
    })
    test('повертає null якщо previous null', () => {
        expect(getDiff(100, null)).toBeNull()
    })
    test('рахує позитивний приріст', () => {
        expect(getDiff(110, 100)).toBe(10)
    })
    test('рахує негативний приріст', () => {
        expect(getDiff(90, 100)).toBe(-10)
    })
    test('рахує 0 якщо однакові', () => {
        expect(getDiff(100, 100)).toBe(0)
    })
})

describe('getTotalSets', () => {
    test('повертає базові сети якщо немає додаткових', () => {
        expect(getTotalSets({ id: 1, sets: 3 }, {})).toBe(3)
    })
    test('додає екстра сети', () => {
        expect(getTotalSets({ id: 1, sets: 3 }, { 1: 2 })).toBe(5)
    })
    test('ігнорує екстра сети інших вправ', () => {
        expect(getTotalSets({ id: 1, sets: 3 }, { 2: 2 })).toBe(3)
    })
})

describe('getUserColor', () => {
    test('повертає дефолтний колір якщо username null', () => {
        expect(getUserColor(null)).toBe('#2563eb')
    })
    test('повертає колір для username', () => {
        const color = getUserColor('Danylo')
        expect(color).toBeTruthy()
        expect(color).toMatch(/^#[0-9a-f]{6}$/i)
    })
    test('однаковий username дає однаковий колір', () => {
        expect(getUserColor('test')).toBe(getUserColor('test'))
    })
})