'use client';
// import { useAuth } from '@clerk/nextjs';

export default function Home() {
  // console.log(useAuth())

  function handler() {
    // fetch('http://localhost:8000').then(data => console.log(data))

    fetch('http://localhost:8000', {
      credentials: 'include',
    })
    console.log('made fetch request')
  }

  return (
    <div>
      <h1>Hello</h1>
      <button onClick={handler}>Cookie</button>
    </div>
  )
}
