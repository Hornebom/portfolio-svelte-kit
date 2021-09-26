const seoMeta = `
  seoMeta {
    title
    description
    twitterCard
    image {
      responsiveImage(imgixParams: { w: 1200, h: 630, fit: crop, fm: jpg }) {
        src
        width
        height
      }
    }
  }
`

export default seoMeta
