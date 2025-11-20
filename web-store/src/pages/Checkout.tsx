import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ListGroup,
  Alert,
} from 'react-bootstrap';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';
import { Customer } from '../types';

export const Checkout = () => {
  const navigate = useNavigate();
  const {
    items,
    getSubtotal,
    getTax,
    getShipping,
    getTotal,
    clearCart,
  } = useCartStore();

  const [customer, setCustomer] = useState<Customer>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Ecuador',
    },
  });

  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setCustomer({
        ...customer,
        address: {
          ...customer.address,
          [addressField]: value,
        },
      });
    } else {
      setCustomer({
        ...customer,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.success('¡Pedido realizado exitosamente!', {
      icon: '🎉',
      duration: 4000,
    });

    // Clear cart and redirect
    clearCart();
    setIsProcessing(false);
    navigate('/');
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4 fw-bold">
        <i className="bi bi-credit-card me-2"></i>
        Finalizar Compra
      </h1>

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col lg={8}>
            {/* Customer Information */}
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-person me-2"></i>
                  Información Personal
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Nombre Completo *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={customer.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Juan Pérez"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={customer.email}
                        onChange={handleInputChange}
                        required
                        placeholder="juan@example.com"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Teléfono *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={customer.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="+593 99 999 9999"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Shipping Address */}
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-truck me-2"></i>
                  Dirección de Envío
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Group>
                      <Form.Label>Dirección *</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.street"
                        value={customer.address.street}
                        onChange={handleInputChange}
                        required
                        placeholder="Av. Principal 123"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Ciudad *</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.city"
                        value={customer.address.city}
                        onChange={handleInputChange}
                        required
                        placeholder="Quito"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Provincia *</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.state"
                        value={customer.address.state}
                        onChange={handleInputChange}
                        required
                        placeholder="Pichincha"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Código Postal *</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.postalCode"
                        value={customer.address.postalCode}
                        onChange={handleInputChange}
                        required
                        placeholder="170150"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>País *</Form.Label>
                      <Form.Control
                        type="text"
                        name="address.country"
                        value={customer.address.country}
                        onChange={handleInputChange}
                        required
                        disabled
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Payment Method */}
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-wallet2 me-2"></i>
                  Método de Pago
                </h5>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Check
                    type="radio"
                    id="credit_card"
                    name="paymentMethod"
                    label={
                      <>
                        <i className="bi bi-credit-card me-2"></i>
                        Tarjeta de Crédito/Débito
                      </>
                    }
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mb-2"
                  />
                  <Form.Check
                    type="radio"
                    id="transfer"
                    name="paymentMethod"
                    label={
                      <>
                        <i className="bi bi-bank me-2"></i>
                        Transferencia Bancaria
                      </>
                    }
                    value="transfer"
                    checked={paymentMethod === 'transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mb-2"
                  />
                  <Form.Check
                    type="radio"
                    id="cash"
                    name="paymentMethod"
                    label={
                      <>
                        <i className="bi bi-cash me-2"></i>
                        Pago Contra Entrega
                      </>
                    }
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            {/* Order Summary */}
            <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Resumen del Pedido</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <h6 className="mb-2">Productos ({items.length})</h6>
                  {items.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="d-flex justify-content-between text-muted small mb-1"
                    >
                      <span>
                        {product.name} x{quantity}
                      </span>
                      <span>${(product.price * quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <hr />
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
                  variant="success"
                  size="lg"
                  type="submit"
                  className="w-100"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Confirmar Pedido
                    </>
                  )}
                </Button>
                <Alert variant="success" className="mt-3 mb-0 small">
                  <i className="bi bi-shield-check me-1"></i>
                  Compra 100% segura
                </Alert>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};
