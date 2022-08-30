import { render, screen } from '@testing-library/react'
import Home, { getStaticProps } from '../../pages'
import { stripe } from '../../services/stripe';

jest.mock('next-auth/client', () => {
  return {
    useSession: () => [null, false]
  }
})

jest.mock('../../services/stripe');

describe('Home page', () => {
  it('renders correctly', () => {
    render(<Home product={{priceId: 'fake-price-id', amount: 'R$10,00'}}/>)

    expect(screen.getByText('for R$10,00 month')).toBeInTheDocument()
  })

  it('loads initial data', async () => {
    const retrieveStripePricesMocked = jest.mocked(stripe.prices.retrieve)

    retrieveStripePricesMocked.mockResolvedValueOnce({
      id: 'fake-price-id',
      unit_amount: 1000
    } as any) // Para não ter que preencher todos os dados, apenas o necessário

    
    const response = await getStaticProps({})

    expect(response).toEqual(expect.objectContaining({ // Verifica se o objeto contem os dados que está sendo passado
      props: {
        product: {
          priceId: 'fake-price-id',
          amount: '$10.00'
        }
      }
    }))
  })
})