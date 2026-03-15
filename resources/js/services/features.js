export const isLiveEnabled = () => {
    return document.querySelector('meta[name="feature-live-sharing"]')?.content === 'true';
}

export const isFileUploadEnabled = () => {
    return document.querySelector('meta[name="feature-file-upload"]')?.content === 'true';
}
