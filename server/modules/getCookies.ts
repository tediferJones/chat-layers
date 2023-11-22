export default function getCookies(req: Request) {
  const cookies = req.headers.get('cookie');
  const cookiesObj: { [key: string]: string } = {}

  cookies?.split('; ').forEach((cookie: string) => {
    const tuple = cookie.split('=')
    cookiesObj[tuple[0]] = tuple[1]
  })

  return cookiesObj;
}
