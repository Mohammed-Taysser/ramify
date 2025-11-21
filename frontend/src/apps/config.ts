import { Home, LogIn, MessageSquare, SearchX, ShieldAlert, UserPlus } from 'lucide-react';
import packageInfo from '../../package.json';
import FAVICON from '@/assets/images/icons/favicon.png';
import ENV from '@/utils/env.utils';
import { theme, type ThemeConfig } from 'antd';

// Environment Variables
const { API_ENDPOINT, SERVER_URL } = ENV;

const COMPANY_NAME = 'Discussion Trees';

const companySlug = COMPANY_NAME.toLowerCase().replaceAll(' ', '-');

const LOCAL_STORAGE_KEYS = {
  refreshToken: `${companySlug}-${packageInfo.version}-refresh-token`,
  accessToken: `${companySlug}-${packageInfo.version}-access-token`,
  user: `${companySlug}-${packageInfo.version}-user`,
  theme: `${companySlug}-${packageInfo.version}-theme`,
};

// Theme
const MAIN_FONT = `DINNextLTArabic, sans-serif`;
const MAIN_COLOR = '#08b52e';
const DEFAULT_THEME = 'dark';

const LIGHT_ANT_THEME: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: MAIN_COLOR,
    colorLink: MAIN_COLOR,
    fontFamily: MAIN_FONT,
  },
  components: {
    Typography: {
      fontFamily: MAIN_FONT,
    },
    Table: {
      headerColor: '#546e7a',
      colorText: '#546e7a',
    },
  },
};

const DARK_ANT_THEME: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: MAIN_COLOR,
    colorLink: MAIN_COLOR,
    fontFamily: MAIN_FONT,
  },
  components: {
    Typography: {
      fontFamily: MAIN_FONT,
    },
  },
};

// Routes
const ROUTE_CREATE_SLUG = 'create';
const ROUTE_DETAILS_SLUG = 'info';



const SITEMAP: SiteMap = {
  homepage: {
    path: '/',
    icon: Home,
    label: 'homepage',
  },
  register: {
    path: '/register',
    icon: UserPlus,
    label: 'register',
  },
  login: {
    path: '/login',
    icon: LogIn,
    label: 'login',
  },
  discussions: {
    path: '/discussions',
    icon: MessageSquare,
    label: 'discussions',
  },
  unauthorized: {
    path: '/unauthorized',
    icon: ShieldAlert,
    label: 'unauthorized',
  },
  pageNotFound: {
    path: '/404',
    icon: SearchX,
    label: 'page-not-found',
  },
};



const MIN_PASSWORD_LENGTH = 6;

const TABLE_PAGE_SIZE_OPTIONS: number[] = [25, 50, 100];
const TABLE_PAGE_SIZE_BIGGER_OPTIONS: number[] = [1000, 2000, 3000, 5000];
const TABLE_PAGE_BIGGER_SIZE: number = 1000;
const TABLE_PAGE_SIZE: number = 25;



export {
  API_ENDPOINT,
  COMPANY_NAME,
  FAVICON,
  LOCAL_STORAGE_KEYS,
  MAIN_COLOR,
  MAIN_FONT, MIN_PASSWORD_LENGTH,
  SERVER_URL,
  SITEMAP,
  TABLE_PAGE_BIGGER_SIZE,
  TABLE_PAGE_SIZE,
  TABLE_PAGE_SIZE_BIGGER_OPTIONS,
  TABLE_PAGE_SIZE_OPTIONS,
  DEFAULT_THEME,
  DARK_ANT_THEME,
  LIGHT_ANT_THEME,
  ROUTE_CREATE_SLUG,
  ROUTE_DETAILS_SLUG
};

