export default function handler(request, response) {
  response.setHeader('content-type', 'application/json; charset=utf-8')
  response.statusCode = 200
  response.end(JSON.stringify({ ok: true }))
}
