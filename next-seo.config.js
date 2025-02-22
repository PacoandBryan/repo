const SEO = {
  defaultTitle: 'DIKY - Handcrafted Mexican Artistry',
  titleTemplate: '%s | DIKY',
  description: 'Discover DIKY\'s unique collection of handcrafted Mexican products, including artisanal bags, desserts, and more. Each piece tells a story of tradition and craftsmanship.',
  canonical: 'https://diky.com',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://diky.com',
    siteName: 'DIKY',
    images: [
      {
        url: 'https://diky.com/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DIKY - Handcrafted Mexican Artistry',
      },
    ],
  },
  twitter: {
    handle: '@diky',
    site: '@diky',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      name: 'keywords',
      content: 'Mexican crafts, DIKY, artisanal products, handcrafted bags, traditional desserts, embroidery, Mexican artistry',
    },
  ],
};

export default SEO;
