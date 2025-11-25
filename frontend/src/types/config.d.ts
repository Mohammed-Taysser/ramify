type PageKey =
  | 'login'
  | 'register'
  | 'discussions'
  | 'homepage'
  | 'unauthorized'
  | 'pageNotFound'
  | 'portfolio'
  | 'switchUser';

interface PageEntry {
  path: string;
  icon: IconType;
  label: string;
}

type SiteMap = {
  [key in PageKey]: PageEntry;
};
