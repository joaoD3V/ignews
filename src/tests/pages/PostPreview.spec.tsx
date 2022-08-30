import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/client'
import { useRouter } from 'next/router'
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]'
import { getPrismicClient } from '../../services/prismic'

const post =
  {
    slug: 'my-new-post',
    title: 'My New Post',
    content: '<p>Post excerpt</p>',
    updatedAt: '10 de abril',
  }


jest.mock('next-auth/client')
jest.mock('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
  }),
}))
jest.mock('../../services/prismic')

describe('Post Preview page', () => {
  it('renders correctly', () => {
    const useSessionMocked = jest.mocked(useSession)
    useSessionMocked.mockReturnValueOnce([null, false])

    render(<Post post={post} />);

    expect(screen.getByText('My New Post')).toBeInTheDocument();
    expect(screen.getByText('Post excerpt')).toBeInTheDocument();
    expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument();
});

  it('redirects user to full post when user is subscribed', async () => {
    const useSessionMocked = jest.mocked(useSession)
    useSessionMocked.mockReturnValueOnce([{
      activeSubscription: 'fake-active-subscription'
    }, false] as any)

    const useRouterMocked = jest.mocked(useRouter)
    const pushMock = jest.fn()
    useRouterMocked.mockReturnValueOnce({
      push: pushMock
    } as any)


    render(<Post post={post} />);
    expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post')
   
  })

  it('loads initial data', async () => {
    const getPrismicClientMocked = jest.mocked(getPrismicClient)
    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            {type: 'heading', text: 'My New Post'}
          ],
          content: [
            {type: 'paragraph', text: 'Post content'}
          ],
        },
        last_publication_date: '04-01-2021'
      })
    } as any)

    

    const response = await getStaticProps({params: { slug: 'my-new-post' }} as any)

    expect(response).toEqual(expect.objectContaining({ // Verifica se o objeto contem os dados que está sendo passado
     props: {
      post: {
        slug: 'my-new-post',
        title: 'My New Post',
        content: '<p>Post content</p>',
        updatedAt: '01 de abril de 2021',
      }
     }
    }))
  })
})