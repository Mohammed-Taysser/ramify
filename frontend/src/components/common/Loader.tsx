import { Flex, Spin } from 'antd';

function Loader() {
  return (
    <Flex style={{ minHeight: '250px' }} justify='center' align='center'>
      <Spin size='large' />
    </Flex>
  );
}

export default Loader;
