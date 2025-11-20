import { Container, Row, Col } from 'react-bootstrap';

export const Footer = () => {
  return (
    <footer className="bg-dark text-light mt-5 py-4">
      <Container>
        <Row>
          <Col md={4} className="mb-3">
            <h5 className="fw-bold">
              <i className="bi bi-shop me-2"></i>
              TechStore
            </h5>
            <p className="text-muted">
              Tu tienda de tecnología de confianza. Los mejores productos al
              mejor precio.
            </p>
          </Col>
          <Col md={4} className="mb-3">
            <h6 className="fw-bold">Enlaces</h6>
            <ul className="list-unstyled">
              <li>
                <a href="#" className="text-muted text-decoration-none">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="#" className="text-muted text-decoration-none">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="text-muted text-decoration-none">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-muted text-decoration-none">
                  Contacto
                </a>
              </li>
            </ul>
          </Col>
          <Col md={4} className="mb-3">
            <h6 className="fw-bold">Contacto</h6>
            <p className="text-muted mb-1">
              <i className="bi bi-envelope me-2"></i>
              info@techstore.com
            </p>
            <p className="text-muted mb-1">
              <i className="bi bi-telephone me-2"></i>
              +593 99 999 9999
            </p>
            <div className="mt-3">
              <a href="#" className="text-light me-3">
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a href="#" className="text-light me-3">
                <i className="bi bi-twitter fs-5"></i>
              </a>
              <a href="#" className="text-light me-3">
                <i className="bi bi-instagram fs-5"></i>
              </a>
            </div>
          </Col>
        </Row>
        <hr className="bg-secondary" />
        <Row>
          <Col className="text-center">
            <p className="text-muted mb-0">
              &copy; {new Date().getFullYear()} TechStore. Todos los derechos
              reservados.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};
