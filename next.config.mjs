/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // A BORA é a assessoria oficial do SOMMA Club desde 26/10/2026 e quem atende
  // é sommaclub.com.br/assessoria (contato com os professores e rastreio de
  // origem no admin). A home daqui só encaminha: a query do link (UTMs, fbclid)
  // vai junto, e o `ref` marca que a pessoa veio deste endereço. Temporário
  // (307) de propósito: o permanente fica gravado no navegador e não se desfaz.
  async redirects() {
    return [
      {
        source: "/",
        destination: "https://sommaclub.com.br/assessoria?ref=assessoria.sommaclub.com.br",
        permanent: false,
      },
    ]
  },
}

export default nextConfig
