import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ListGroup,
  Image,
  Form,
  Alert,
} from 'react-bootstrap';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

export const Cart = () => {
  const navigate = useNavigate();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getTax,
    getShipping,
    getTotal,
  } = useCartStore();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    removeItem(productId);
    toast.success(`${productName} eliminado del carrito`);
  };

  const handleClearCart = () => {
    if (window.confirm('¿Estás seguro de vaciar el carrito?')) {
      clearCart();
      toast.success('Carrito vaciado');
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <Container className="py-5">
        <Card className="text-center shadow-sm">
          <Card.Body className="py-5">
            <i className="bi bi-cart-x display-1 text-muted mb-3"></i>
            <h3 className="mb-3">Tu carrito está vacío</h3>
            <p className="text-muted mb-4">
              Agrega productos para comenzar tu compra
            </p>
            <Link to="/products">
              <Button variant="primary" size="lg">
                <i className="bi bi-shop me-2"></i>
                Ver Productos
              </Button>
            </Link>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold mb-0">
          <i className="bi bi-cart3 me-2"></i>
          Carrito de Compras
        </h1>
        <Button variant="outline-danger" onClick={handleClearCart}>
          <i className="bi bi-trash me-2"></i>
          Vaciar Carrito
        </Button>
      </div>

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                Productos ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h5>
            </Card.Header>
            <ListGroup variant="flush">
              {items.map(({ product, quantity }) => (
                <ListGroup.Item key={product.id} className="p-3">
                  <Row className="align-items-center">
                    <Col xs={3} md={2}>
                      <Image
                        src={product.image}
                        alt={product.name}
                        rounded
                        fluid
                        style={{
                          width: '100%',
                          height: '80px',
                          objectFit: 'cover',
                        }}
                      />
                    </Col>
                    <Col xs={9} md={4}>
                      <h6 className="mb-1 fw-bold">{product.name}</h6>
                      <p className="text-muted small mb-0">
                        {product.category}
                      </p>
                      <p className="text-primary fw-bold mb-0">
                        ${product.price.toFixed(2)}
                      </p>
                    </Col>
                    <Col xs={12} md={3} className="mt-3 mt-md-0">
                      <Form.Group className="d-flex align-items-center">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(product.id, quantity - 1)
                          }
                          disabled={quantity <= 1}
                        >
                          <i className="bi bi-dash"></i>
                        </Button>
                        <Form.Control
                          type="number"
                          value={quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              product.id,
                              parseInt(e.target.value) || 1
                            )
                          }
                          min="1"
                          max={product.stock || 99}
                          className="mx-2 text-center"
                          style={{ width: '70px' }}
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(product.id, quantity + 1)
                          }
                          disabled={
                            product.stock > 0 && quantity >= product.stock
                          }
                        >
                          <i className="bi bi-plus"></i>
                        </Button>
                      </Form.Group>
                    </Col>
                    <Col xs={9} md={2} className="mt-3 mt-md-0">
                      <p className="fw-bold mb-0 text-end">
                        ${(product.price * quantity).toFixed(2)}
                      </p>
                    </Col>
                    <Col xs={3} md={1} className="text-end mt-3 mt-md-0">
                      <Button
                        variant="link"
                        className="text-danger p-0"
                        onClick={() =>
                          handleRemoveItem(product.id, product.name)
                        }
                      >
                        <i className="bi bi-trash fs-5"></i>
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          <Link to="/products">
            <Button variant="outline-primary">
              <i className="bi bi-arrow-left me-2"></i>
              Continuar Comprando
            </Button>
          </Link>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Resumen del Pedido</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between px-0">
                  <span>Subtotal</span>
                  <span className="fw-bold">${getSubtotal().toFixed(2)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between px-0">
                  <span>IVA (12%)</span>
                  <span className="fw-bold">${getTax().toFixed(2)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between px-0">
                  <span>Envío</span>
                  <span className="fw-bold">${getShipping().toFixed(2)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between px-0 border-top-2">
                  <span className="h5 mb-0">Total</span>
                  <span className="h5 mb-0 text-primary fw-bold">
                    ${getTotal().toFixed(2)}
                  </span>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
            <Card.Footer className="bg-white">
              <Button
                variant="primary"
                size="lg"
                className="w-100"
                onClick={handleCheckout}
              >
                <i className="bi bi-credit-card me-2"></i>
                Proceder al Pago
              </Button>
              <Alert variant="info" className="mt-3 mb-0 small">
                <i className="bi bi-shield-check me-1"></i>
                Pago seguro y encriptado
              </Alert>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
