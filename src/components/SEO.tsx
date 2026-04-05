import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    openGraph?: {
        title?: string;
        description?: string;
        images?: Array<{ url: string; alt?: string }>;
    };
}

const SEO = ({ title, description, canonical, openGraph }: SEOProps) => {
    const siteTitle = 'Diky';

    return (
        <Helmet>
            <title>{title} | {siteTitle}</title>
            <meta name="description" content={description} />
            {canonical && <link rel="canonical" href={canonical} />}

            {/* Open Graph */}
            <meta property="og:title" content={openGraph?.title || title} />
            <meta property="og:description" content={openGraph?.description || description} />
            {openGraph?.images?.map((image, index) => (
                <meta key={index} property="og:image" content={image.url} />
            ))}
        </Helmet>
    );
};

export default SEO;
