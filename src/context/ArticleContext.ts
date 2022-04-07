import React from "react";
import { Article } from "../model/Article";

export type ArticleContextType = {
    articles: Record<string, Article>,
    setArticle: (article: Article) => void
}

export const ArticleContext = React.createContext<ArticleContextType>({
    articles: {},
    setArticle: () => undefined
});
