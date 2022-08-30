import { render, screen } from '@testing-library/react'
import { Header } from '.'

jest.mock('next/router', () => {
  return {
    useRouter() {
      return {
        asPath: '/'
      }
    }
  }
})

jest.mock('next-auth/client', () => {
  return {
    useSession() {
      return [null, false]
    }
  }
})

// Sempre que nosso componente depender de algo externo, será necessário criar um mock

describe('Header component', () => {
  it('renders correctly', () => {
   render(
      <Header />
    )

    // screen.logTestingPlaygroundURL() -> Playground do Jest para teste
  
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Posts')).toBeInTheDocument()
  })
})
