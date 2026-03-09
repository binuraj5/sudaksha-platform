/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: [
        '@sudaksha/db-core',
        '@sudaksha/db-assessments',
        '@sudaksha/types',
        '@sudaksha/sso-auth',
        '@sudaksha/ui'
    ],
    // pdfkit reads font .afm files from disk at runtime — must not be bundled
    serverExternalPackages: ['pdfkit'],
    async redirects() {
        return [
            { source: '/blogs', destination: '/blog', permanent: true },
            { source: '/blogs/:slug', destination: '/blog/:slug', permanent: true },
            { source: '/webinar', destination: '/webinars', permanent: true },
            { source: '/webinar/:slug', destination: '/webinars/:slug', permanent: true },
        ];
    },
};
export default nextConfig;
