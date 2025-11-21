import { Flex, Typography } from 'antd';
import unAuthorizedImage from '@/assets/images/background/401.svg';

function Unauthorized() {
  return (
    <Flex justify="center" align="center">
      <div className="my-16 text-center">
        <img src={unAuthorizedImage} alt="unAuthorized" height={300} className="mx-auto w-full" />

        <Typography.Title className="mt-6 !text-8xl !mb-4">403</Typography.Title>

        <Typography.Title level={3} className="!m-0 ">
          You are't authorized to access this page
        </Typography.Title>
      </div>
    </Flex>
  );
}

export default Unauthorized;
