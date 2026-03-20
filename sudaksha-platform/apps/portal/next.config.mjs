/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: [
        '@sudaksha/db-core',
        '@sudaksha/db-assessments',
        '@sudaksha/types',
        '@sudaksha/sso-auth',
        '@sudaksha/ui'
    ],
    devIndicators: false, // Hide the "N" development indicator
};
export default nextConfig;
