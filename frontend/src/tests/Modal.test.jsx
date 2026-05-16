import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '../components/Modal'
import { beforeEach } from 'vitest'

beforeEach(() => {
    const modalRoot = document.createElement('div')
    modalRoot.setAttribute('id', 'modal-root')
    document.body.appendChild(modalRoot)
})

afterEach(() => {
    const modalRoot = document.getElementById('modal-root')
    if (modalRoot) document.body.removeChild(modalRoot)
})

test('не рендериться коли isOpen false', () => {
    render(<Modal isOpen={false} onClose={() => {}} title="Test" />)
    expect(screen.queryByText('Test')).not.toBeInTheDocument()
})

test('рендериться коли isOpen true', () => {
    render(<Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
    </Modal>)
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
})

test('викликає onClose при кліку на кнопку закриття', () => {
    const onClose = vi.fn()
    render(<Modal isOpen={true} onClose={onClose} title="Test" />)
    fireEvent.click(screen.getByText('×'))
    expect(onClose).toHaveBeenCalledTimes(1)
})

test('викликає onClose при кліку на backdrop', () => {
    const onClose = vi.fn()
    render(<Modal isOpen={true} onClose={onClose} title="Test" />)
    fireEvent.click(document.querySelector('.modal-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(1)
})