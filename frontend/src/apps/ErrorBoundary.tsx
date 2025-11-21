import { Button, ConfigProvider, Flex, Result } from 'antd';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import errorBoundaryImage from '@/assets/images/background/error-boundary.svg';
import { LIGHT_ANT_THEME, SITEMAP } from './config';

const ErrorBoundary = () => {
  const error = useRouteError();
  console.error('Caught an error:', error);

  let errorTitle = 'Something went wrong';
  let errorMessage = 'An unexpected error occurred.';

  if (isRouteErrorResponse(error)) {
    errorTitle = `Error ${error.status}`;
    errorMessage = error.statusText || 'Page not found';
  } else if (error instanceof Error) {
    errorTitle = 'Application Error';
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return (
    <ConfigProvider theme={LIGHT_ANT_THEME}>
      <Result
        status='error'
        icon={<Flex justify='center' align='center'><img src={errorBoundaryImage} alt='error' className='h-[200px]' /></Flex>}
        title={errorTitle}
        subTitle={errorMessage}
        extra={[
          <Button
            key='home'
            onClick={() => (window.location.href = SITEMAP.homepage.path)}
          >
            Go to Home
          </Button>,

          <Button
            key='reload'
            type='primary'
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>,
        ]}
      />
    </ConfigProvider>
  );
};

export default ErrorBoundary;
