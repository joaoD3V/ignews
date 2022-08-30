import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/client'
import Posts, { getStaticProps, Post } from '../../pages/posts'
import { getPrismicClient } from '../../services/prismic'

const posts = [
  {
    slug: 'my-new-post',
    title: 'My New Post',
    excerpt: 'My new post excerpt',
    updatedAt: '10 de abril',
  }
] as Post[]

jest.mock('next-auth/client')
jest.mock('../../services/prismic')

describe('Posts page', () => {
  it('renders correctly', () => {
    const useSessionMocked = jest.mocked(useSession)
    useSessionMocked.mockReturnValueOnce([null, false])

    render(<Posts posts={posts} />);

    expect(screen.getByText('My New Post')).toBeInTheDocument();
    expect(screen.getByText('My new post excerpt')).toBeInTheDocument();
  })

  it('loads initial data', async () => {
    const getPrismicClientMocked = jest.mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: 'my-new-post',
            data: {
              title: [
                {type: 'heading', text: 'My new post'}
              ],
              content: [
                {type: 'paragraph', text: 'Post excerpt'}
              ],
            },
            last_publication_date: '04-01-2021'
          }
        ]
      })
    } as any)
    
    const response = await getStaticProps({})

    expect(response).toEqual(expect.objectContaining({ // Verifica se o objeto contem os dados que está sendo passado
      props: {
        posts: [{
          slug: 'my-new-post',
          title: 'My new post',
          excerpt: 'Post excerpt',
          updatedAt: '01 de abril de 2021',
        }]
      }
    }))
  })
})