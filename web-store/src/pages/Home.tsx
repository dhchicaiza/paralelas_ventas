import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <div className="bg-primary text-white py-5 mb-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-4 mb-md-0">
              <h1 className="display-4 fw-bold mb-3">
                Bienvenido a TechStore
              </h1>
              <p className="lead mb-4">
                Encuentra los mejores productos tecnológicos al mejor precio.
                Entrega rápida y garantía en todos nuestros productos.
              </p>
              <Link to="/products">
                <Button variant="light" size="lg" className="px-4">
                  <i className="bi bi-shop me-2"></i>
                  Ver Productos
                </Button>
              </Link>
            </Col>
            <Col md={6} className="text-center">
              <i className="bi bi-laptop display-1"></i>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="mb-5">
        <h2 className="text-center mb-5 fw-bold">¿Por qué elegirnos?</h2>
        <Row className="g-4">
          <Col md={4}>
            <Card className="text-center border-0 shadow-sm h-100">
              <Card.Body>
                <div className="mb-3">
                  <i className="bi bi-truck display-4 text-primary"></i>
                </div>
                <Card.Title className="fw-bold">Envío Rápido</Card.Title>
                <Card.Text className="text-muted">
                  Entrega en 24-48 horas en productos en stock. Seguimiento en
                  tiempo real.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center border-0 shadow-sm h-100">
              <Card.Body>
                <div className="mb-3">
                  <i className="bi bi-shield-check display-4 text-success"></i>
                </div>
                <Card.Title className="fw-bold">Compra Segura</Card.Title>
                <Card.Text className="text-muted">
                  Garantía en todos los productos. Métodos de pago seguros y
                  confiables.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center border-0 shadow-sm h-100">
              <Card.Body>
                <div className="mb-3">
                  <i className="bi bi-headset display-4 text-info"></i>
                </div>
                <Card.Title className="fw-bold">Soporte 24/7</Card.Title>
                <Card.Text className="text-muted">
                  Atención al cliente disponible siempre que lo necesites.
                  Estamos para ayudarte.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Categories Section */}
      <Container className="mb-5">
        <h2 className="text-center mb-5 fw-bold">Categorías Populares</h2>
        <Row className="g-3">
          <Col xs={6} md={3}>
            <Link
              to="/products?category=Electrónica"
              className="text-decoration-none"
            >
              <Card className="text-center hover-shadow transition">
                <Card.Body>
                  <i className="bi bi-laptop display-4 text-primary mb-2"></i>
                  <Card.Title className="h6 mb-0">Electrónica</Card.Title>
                </Card.Body>
              </Card>
            </Link>
          </Col>
          <Col xs={6} md={3}>
            <Link to="/products?category=Accesorios" className="text-decoration-none">
              <Card className="text-center hover-shadow transition">
                <Card.Body>
                  <i className="bi bi-mouse display-4 text-success mb-2"></i>
                  <Card.Title className="h6 mb-0">Accesorios</Card.Title>
                </Card.Body>
              </Card>
            </Link>
          </Col>
          <Col xs={6} md={3}>
            <Link to="/products?category=Audio" className="text-decoration-none">
              <Card className="text-center hover-shadow transition">
                <Card.Body>
                  <i className="bi bi-headphones display-4 text-info mb-2"></i>
                  <Card.Title className="h6 mb-0">Audio</Card.Title>
                </Card.Body>
              </Card>
            </Link>
          </Col>
          <Col xs={6} md={3}>
            <Link to="/products?category=Almacenamiento" className="text-decoration-none">
              <Card className="text-center hover-shadow transition">
                <Card.Body>
                  <i className="bi bi-hdd display-4 text-warning mb-2"></i>
                  <Card.Title className="h6 mb-0">Almacenamiento</Card.Title>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        </Row>
      </Container>

      {/* CTA Section */}
      <div className="bg-light py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <h3 className="fw-bold mb-2">¿Necesitas ayuda?</h3>
              <p className="text-muted mb-0">
                Nuestro equipo está listo para asesorarte en tu compra
              </p>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              <Button variant="primary" size="lg">
                <i className="bi bi-chat-dots me-2"></i>
                Contactar
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};
