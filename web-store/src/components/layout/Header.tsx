import { Link } from 'react-router-dom';
import { Navbar, Container, Nav, Badge } from 'react-bootstrap';
import { useCartStore } from '../../store/cartStore';

export const Header = () => {
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <i className="bi bi-shop me-2"></i>
          TechStore
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/">
              <i className="bi bi-house-door me-1"></i>
              Inicio
            </Nav.Link>
            <Nav.Link as={Link} to="/products">
              <i className="bi bi-grid me-1"></i>
              Productos
            </Nav.Link>
            <Nav.Link as={Link} to="/cart" className="position-relative">
              <i className="bi bi-cart3 me-1"></i>
              Carrito
              {itemCount > 0 && (
                <Badge
                  bg="danger"
                  pill
                  className="position-absolute top-0 start-100 translate-middle"
                  style={{ fontSize: '0.7rem' }}
                >
                  {itemCount}
                </Badge>
              )}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
