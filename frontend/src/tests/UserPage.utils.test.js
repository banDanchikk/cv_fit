import { describe, test, expect } from 'vitest'

const getBmiLabel = (bmi) => {
    if (!bmi) return null
    if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6' }
    if (bmi < 25) return { label: 'Normal', color: '#22c55e' }
    if (bmi < 30) return { label: 'Overweight', color: '#f59e0b' }
    return { label: 'Obese', color: '#ef4444' }
}

const calculateBmi = (height, weight) => {
    if (!height || !weight) return null
    return (weight / ((height / 100) ** 2)).toFixed(1)
}

describe('getBmiLabel', () => {
    test('повертає null якщо bmi null', () => {
        expect(getBmiLabel(null)).toBeNull()
    })
    test('Underweight для bmi < 18.5', () => {
        expect(getBmiLabel(17).label).toBe('Underweight')
    })
    test('Normal для bmi 18.5-24.9', () => {
        expect(getBmiLabel(22).label).toBe('Normal')
    })
    test('Overweight для bmi 25-29.9', () => {
        expect(getBmiLabel(27).label).toBe('Overweight')
    })
    test('Obese для bmi >= 30', () => {
        expect(getBmiLabel(32).label).toBe('Obese')
    })
})

describe('calculateBmi', () => {
    test('повертає null якщо немає даних', () => {
        expect(calculateBmi(null, 70)).toBeNull()
        expect(calculateBmi(175, null)).toBeNull()
    })
    test('правильно рахує BMI', () => {
        expect(calculateBmi(175, 70)).toBe('22.9')
    })
    test('повертає рядок з одним десятковим', () => {
        const result = calculateBmi(180, 80)
        expect(result).toMatch(/^\d+\.\d$/)
    })
})