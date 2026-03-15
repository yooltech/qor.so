const getBaseUrl = () => {
    const metaBase = document.querySelector('meta[name="base-url"]')?.content;
    if (metaBase) return metaBase.replace(/\/$/, '');

    // Fallback: Detection from location
    const path = window.location.pathname;
    const subfolderMatch = path.match(/^\/([^/]+\/[^/]+)\//);
    if (subfolderMatch) {
        return `/${subfolderMatch[1]}`;
    }
    
    return '';
};

const baseUrl = getBaseUrl();
const routerBase = new URL(baseUrl || window.location.origin, window.location.origin).pathname;

const getFeature = (name) => {
    return document.querySelector(`meta[name="${name}"]`)?.content === 'true';
};

export const config = {
    baseUrl,
    routerBase,
    appVersion: document.querySelector('meta[name="app-version"]')?.content || 'v1.0.0',
    asset: (path) => {
        const cleanPath = path.replace(/^\//, '');
        return `${baseUrl}/${cleanPath}`;
    },
    features: {
        liveSharing: getFeature('feature-live-sharing'),
        fileUpload: getFeature('feature-file-upload'),
        aboutRoadmap: getFeature('about-show-roadmap'),
        aboutTeam: getFeature('about-show-team'),
        aboutTech: getFeature('about-show-tech'),
        aboutOpenSource: getFeature('about-show-open-source'),
    }
};

export default config;
