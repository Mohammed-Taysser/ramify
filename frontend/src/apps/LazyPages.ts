import { lazy } from 'react';

const PAGES = {
  login: lazy(() => import('@/pages/Login.page')),
  pageNotFound: lazy(() => import('@/pages/PageNotFound.page')),
  unauthorized: lazy(() => import('@/pages/Unauthorized.page')),
  homepage: lazy(() => import('@/pages/Home.page')),
  register: lazy(() => import('@/pages/Register.page')),
  discussionDetail: lazy(() => import('@/pages/DiscussionDetail.page')),
  portfolio: lazy(() => import('@/pages/Portfolio.page')),
  switchUser: lazy(() => import('@/pages/SwitchUser.page')),
};

export default PAGES;
