import { Card, Button, Badge } from 'react-bootstrap';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(product, 1);
    toast.success(`${product.name} agregado al carrito!`, {
      icon: '🛒',
      duration: 2000,
    });
  };

  const getAvailabilityBadge = () => {
    switch (product.availability) {
      case 'STOCK':
        return (
          <Badge bg="success" className="mb-2">
            <i className="bi bi-check-circle me-1"></i>
            En Stock ({product.stock} disponibles)
          </Badge>
        );
      case 'MANUFACTURING':
        return (
          <Badge bg="warning" text="dark" className="mb-2">
            <i className="bi bi-clock me-1"></i>
            En Fabricación (Disponible:{' '}
            {new Date(product.estimatedDeliveryDate!).toLocaleDateString()})
          </Badge>
        );
      case 'MADE_TO_ORDER':
        return (
          <Badge bg="info" className="mb-2">
            <i className="bi bi-tools me-1"></i>
            Bajo Pedido
          </Badge>
        );
      case 'OUT_OF_STOCK':
        return (
          <Badge bg="danger" className="mb-2">
            <i className="bi bi-x-circle me-1"></i>
            Agotado
          </Badge>
        );
    }
  };

  const canAddToCart = product.availability !== 'OUT_OF_STOCK';

  return (
    <Card className="h-100 shadow-sm hover-shadow transition">
      <div className="position-relative overflow-hidden" style={{ height: '250px' }}>
        <Card.Img
          variant="top"
          src={product.image}
          alt={product.name}
          style={{
            height: '100%',
            objectFit: 'cover',
          }}
          className="hover-zoom transition"
        />
        <div className="position-absolute top-0 end-0 m-2">
          <Badge bg="dark" className="px-3 py-2">
            {product.category}
          </Badge>
        </div>
      </div>
      <Card.Body className="d-flex flex-column">
        <Card.Title className="fw-bold mb-2">{product.name}</Card.Title>
        <Card.Text className="text-muted small flex-grow-1">
          {product.description}
        </Card.Text>
        <div className="mb-2">{getAvailabilityBadge()}</div>
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <h4 className="text-primary mb-0 fw-bold">
            ${product.price.toFixed(2)}
          </h4>
          <Button
            variant={canAddToCart ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className="px-3"
          >
            {canAddToCart ? (
              <>
                <i className="bi bi-cart-plus me-1"></i>
                Agregar
              </>
            ) : (
              'No disponible'
            )}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};
