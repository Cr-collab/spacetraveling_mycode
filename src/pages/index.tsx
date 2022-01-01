import { GetStaticProps } from 'next';
import Head from 'next/head'

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import Prismic from '@prismicio/client'

import { FiCalendar } from 'react-icons/fi'
import { FiUser } from 'react-icons/fi'

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useEffect, useState } from 'react';

import Link from 'next/link'

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination}: HomeProps){


  const  [posts , setPosts] = useState([])
  const  [next , setNext] = useState('')

  useEffect(()=>{
    setPosts([...postsPagination.results])
    setNext(postsPagination.next_page)
  },[])

 async function hanleGetPosts () {
   if(next){
    const postsResults = await fetch(`${postsPagination.next_page}`).then(response => response.json())
    console.log(postsResults)
    const newPost = postsResults.results.map((post) =>{
      return {
          slug: post.uid,
          first_publication_date: format(
            new Date(post.first_publication_date),
            "PPPP",
            {
              locale: ptBR,
            }
          ) ,
          data: {
            title: post.data.title,
            subtitle:  post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
            author: post.data.author
          }
        
      }
    })
     setNext(postsResults.next_page)
     setPosts([...posts, ...newPost])
   }
 }


   return(
     <>
        <Head>
           <title> Home | spacetraveling </title>
        </Head>

        <main className={styles.containerPosts}>
           <div className={styles.contentPosts}>
             
             {
               posts.map((post) =>{
                 return(

                  <Link href={`post/${post.slug}`}>

                    <a href="">
                      <strong> {post.data.title}</strong>
                      <p> {post.data.subtitle}</p> 
                      <p> <time> <FiCalendar/> {post.first_publication_date} </time> <span> <FiUser/> {post.data.author }</span></p>
                    </a>
                  </Link>

                 )
               })
             }



             { next ?  <button type="button" onClick={() => hanleGetPosts()}  className={styles.btnLoad}> carregar mais</button> : ""}
           </div>
        </main>
        
     </>
   )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
      Prismic.Predicates.at("document.type", "posts")
  ], {
    fetch: ['posts.title', 'posts.content', "posts.subtitle", "posts.author"],
    pageSize: 1
  });

  console.log();


  const posts = postsResponse.results.map((post) => {
    return {
      slug: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        "dd MMMM yyyy",
        {
          locale: ptBR,
        }
      ) ,
      data: {
        title: post.data.title,
        subtitle:  post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
        author: post.data.author
      }



      
    }
  })



   return {
     props: {
        postsPagination: {
          results: posts,
          next_page: postsResponse.next_page
        }
     }
   }
};
