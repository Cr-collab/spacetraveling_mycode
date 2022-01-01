import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Head from 'next/head';


import { FiCalendar } from 'react-icons/fi'
import { FiUser } from 'react-icons/fi'
import { AiOutlineClockCircle } from 'react-icons/ai'
import { RichText } from 'prismic-dom';


import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';


import Prismic from '@prismicio/client'
import { useRouter } from 'next/router';



interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      };
    };
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post} : PostProps) {

  const router = useRouter()



  if(router.isFallback) {
    return <h1> Carregando ... </h1>
  }

  return(
    <>
      <Head>
        <title> {post.data.title} | spacetraveling </title>
      </Head>
           <img className={styles.banner} src={String(post.data.banner.url)} alt="banner" />
      <main className={styles.container} >
         <article className={styles.post}>

                 <h1>  Criando um app CRA do zero</h1>
           <div className={styles.info}>
                 <time> <FiCalendar/> {post.first_publication_date}</time> 
                 <span> <FiUser/> {post.data.author} </span>
                 <span> <AiOutlineClockCircle/> 4 min </span>
           </div>
          <h1> {post.data.content.heading}</h1>
           <div 
            className={styles.postContent}
            dangerouslySetInnerHTML={{__html : post.data.content.body.text}}
           />
            

         </article>
      </main>
    </>
  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at("document.type", "posts")
  ]);

  const paths = posts.results.map((post) =>{
    return {
      params :{
        slug : post.uid
      }
    }
  })

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps = async ({params}) => {
  const {slug} = params
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts' ,String(slug), {});

  // console.log(JSON.stringify(response.data, null, 2));

   const post = {
    first_publication_date : format(
      new Date(response.first_publication_date),
      "dd MMMM yyyy",
      {
        locale: ptBR,
      }
    ) ,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: {
        heading: response.data.content[0].heading,
        body: {
          text: RichText.asHtml(response.data.content[0].bodt)
        }
      }
    }

  }

  console.log(post);
   

  return { 
    props : {
      post
  }
}}
