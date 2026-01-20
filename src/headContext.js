import React, { createContext, useContext, useMemo } from 'react';

// Simple head model we can safely use with React 19 and SSR
export function createEmptyHead() {
  return {
    title: null,
    description: null,
    canonicalUrl: null,
    // Open Graph
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    ogType: null,
    ogSiteName: null,
    ogLocale: null,
    ogImageAlt: null,
    ogImageWidth: null,
    ogImageHeight: null,
    // Twitter
    twitterCard: null,
    twitterImage: null,
    twitterImageAlt: null,
    // Article-specific
    articlePublishedTime: null,
    articleModifiedTime: null,
    articleAuthor: null,
    articleSection: null,
  };
}

const HeadContext = createContext(null);

export function HeadProvider({ head, children }) {
  // We mutate the passed-in head object so the server renderer
  // can read it after render.
  const value = useMemo(
    () => ({
      head,
      setHead(updates) {
        if (!updates) return;
        Object.assign(head, updates);
      },
    }),
    [head],
  );

  return <HeadContext.Provider value={value}>{children}</HeadContext.Provider>;
}

export function useHead() {
  return useContext(HeadContext);
}


