import jwt, { JwtPayload } from 'jsonwebtoken';
import clerkClient from '@clerk/clerk-sdk-node';

// This is what we need to implement: https://clerk.com/docs/backend-requests/handling/manual-jwt
const clientUrl = 'http://localhost:3000';

// function validateJWTClaims(jwt: { exp: number, nbf: number, azp: string }) {
function validateJWTClaims(jwt: JwtPayload): boolean {
  const currentTime = Date.now()

  if (jwt.exp && currentTime > jwt.exp * 1000) return false
  if (jwt.nbf && currentTime < jwt.nbf * 1000) return false
  if (jwt.azp && clientUrl !== jwt.azp) return false

  return true
}


Bun.serve({
  // hostname: 'idktest.com',
  port: 8000,
  async fetch(req: Request) {
    const cookies: { [key: string]: string } = {};
    req.headers.get('cookie')?.split('; ').forEach((cookie: string) => {
      const splitCookie = cookie.split('=')
      cookies[splitCookie[0]] = splitCookie[1]
    })
    // console.log(cookies)
    const key = process.env.CLERK_PEM_PUBLIC_KEY
    // console.log(key)
    // console.log(req.headers.authorization)
    if (key) {
      const jwtResult = jwt.verify(cookies.__session, key)
      // console.log(jwt.verify('poopydoodoo', key))
      // console.log(jwtResult)
      // console.log(jwtResult.sub)
      const userId = jwtResult.sub?.toString();
      if (userId && typeof jwtResult !== 'string' && validateJWTClaims(jwtResult)) {
        // console.log(await clerkClient.users.getUser(userId))
        const user = await clerkClient.users.getUser(userId);
        console.log(user)
      }

      // How do we edit user.publicMetadata or user.privateMetadata
      // Determine max size of user metadata, try to post like a 10k character long string
      //    - Organization metadata must be less than 8kb

      // if (typeof(jwtResult) !== 'string') {
      //   console.log(validateJWTClaims(jwtResult))
      // }
    }
    // console.log(Date.now())
    
    console.log('Received Request')
    return new Response(JSON.stringify('Bun Response'), {
      headers: {
        // 'Content-Type': 'application/json',
        // 'Access-Control-Allow-Origin': '*',
        // 'Access-Control-Allow-Headers': 'Content-Type',
        // 'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Origin': clientUrl,
        'Access-Control-Allow-Credentials': 'true',
      }
    })
  }
})
