import { GetStaticPaths, GetStaticProps } from "next"
import { getSession, useSession } from "next-auth/client"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { RichText } from "prismic-dom"
import { useEffect } from "react"
import { getPrismicClient } from "../../../services/prismic"

import styles from '../post.module.scss'

type PostPreviewProps = {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  }
}

export default function PostPreview({ post }: PostPreviewProps) {
  const [session] = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.activeSubscription) {
      router.push(`/posts/${post.slug}`)
    }
  }, [session])

  return(
    <>
      <Head>
        <title>{post.title} | ig.news</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>

          <div className={`${styles.postContent} ${styles.previewContent}`} dangerouslySetInnerHTML={{ __html: post.content }} />

          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/">
              <a>Subscribe now 🤗</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [], // Quando é passado um array vazio, a geração da página estática fica a cargo do primeiro acesso
    fallback: 'blocking' 
    // [Fallback]
    // Se a página ainda não foi gerado de forma estática:
    // true -> carrega pela lado do cliente (no browser) -> Causa layout shift e não é bom pra SEO
    // false -> retorna o 404 *
    // blocking -> parecido com o true, mas carrega pelo lado do server (Next) *
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('publication', String(slug), {});

  const post = {
    slug,
    title: response ? RichText.asText(response.data.title) : '',
    content: response ? RichText.asHtml(response.data.content.splice(0, 3)) : '',
    updatedAt: new Date(String(response?.last_publication_date)).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  };

  return {
    props: {
      post
    },
    revalidate: 60 * 30, //30 minutos
  }
}