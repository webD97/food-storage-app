import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ArticleContext, ArticleContextType } from '../context/ArticleContext';
import { Article } from '../model/Article';
import { useState } from 'react';
import { ChakraProvider } from '@chakra-ui/react'
import theme from './theme';
import { Client as KettingClient } from 'ketting';
import { KettingProvider } from 'react-ketting';
import Layout from '../components/Layout';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  const [articles, setArticles] = useState<Record<string, Article>>({});

  const articleContext: ArticleContextType = {
    articles,
    setArticle: (article) => {
      setArticles(articles => ({ ...articles, [article.gtin]: article }))
    }
  };

  const client = new KettingClient('http://192.168.178.220/dev/food-storage-backend/');

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ChakraProvider theme={theme}>
        <ArticleContext.Provider value={articleContext}>
          <KettingProvider client={client}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </KettingProvider>
        </ArticleContext.Provider>
      </ChakraProvider>
    </>
  );
}

export default MyApp
