import { GetStaticProps } from 'next';
import Head from 'next/head';
import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import styles from './styles.module.scss';
import Link from 'next/link';
import { useSession } from 'next-auth/client';
import { useEffect, useState } from 'react';

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
}

type PostsProps = {
  posts: Post[];
}


export default function Posts({ posts }: PostsProps) {
  const [ session ] = useSession();
  const [canAccess, setCanAccess] = useState(false);
  
  useEffect(() => {
    if (session?.activeSubscription) {
      setCanAccess(true)
    }
  }, [session])

  return(
    <>
      <Head>
        <title>Posts | ig.news</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          { posts.map(post => (
            <Link href={canAccess ? `/posts/${post.slug}` : `/posts/preview/${post.slug}`}>
              <a key={post.slug}>
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query([
    Prismic.predicates.at('document.type', 'publication')
  ], {
    fetch: ['publication.title', 'publication.content'],
    pageSize: 100
  })

  const posts = response.results.map(post => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      excerpt: post.data.content.find((content: { type: string; }) => content.type === 'paragraph')?.text ?? '',
      updatedAt: new Date(post.last_publication_date!).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }
  })

  return {
    props: {
      posts
    },
    revalidate: 60 * 10 //10 min
  }
}