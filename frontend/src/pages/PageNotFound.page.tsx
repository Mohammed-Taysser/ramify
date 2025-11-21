import { SITEMAP } from '@/apps/config';
import { Button, Col, Image, Row, Typography } from 'antd';
import { Link } from 'react-router-dom';
import image404 from '@/assets/images/background/404.svg';

function PageNotFound() {
  return (
    <Row className="min-h-[80vh]" align="middle" justify="center">
      <Col xs={22} md={18}>
        <Row gutter={{ xs: 0, md: 20 }} align="middle">
          <Col xs={24} className="my-16 text-center">
            <Image preview={false} src={image404} width={300} />

            <Typography.Title level={4}>The page you are looking for is not found</Typography.Title>

            <Link to={SITEMAP.homepage.path}>
              <Button type="primary">Go Home</Button>
            </Link>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}

export default PageNotFound;
