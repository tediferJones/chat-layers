export default function easyFetch(
  path: string, 
  method: string, 
  body: { [key: string]: any } = {},
  skipJSON?: boolean,
): Promise<any> {
  method = method.toUpperCase();

  const methods: { methods: string[], fetch: Function }[] = [
    {
      methods: ['GET', 'HEAD', 'DELETE'],
      fetch: (path: string, body: { [key: string]: string }) => {
        return fetch(path + '?' + new URLSearchParams(body), { method })
      }
    }, {
      methods: ['POST', 'PUT'],
      fetch: (path: string, body: { [key: string]: string }) => {
        return fetch(path, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        })
      }
    }
  ]

  let result;
  for (let handler of methods) {
    if (handler.methods.includes(method)) {
      result = handler.fetch(path, body);
      break;
    }
  }

  if (!result) throw new Error(`Fetch method ${method} is not supported`);
  if (skipJSON) return result;
  return result.then((res: Response) => res.json());
}
