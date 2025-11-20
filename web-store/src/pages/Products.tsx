import { useState, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  ButtonGroup,
} from 'react-bootstrap';
import { ProductCard } from '../components/products/ProductCard';
import { mockProducts, categories } from '../data/mockProducts';

export const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>(
    'name'
  );

  const filteredProducts = useMemo(() => {
    let filtered = [...mockProducts];

    // Filter by category
    if (selectedCategory !== 'Todas') {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return filtered;
  }, [selectedCategory, searchTerm, sortBy]);

  return (
    <Container className="py-4">
      <h1 className="mb-4 fw-bold">
        <i className="bi bi-grid me-2"></i>
        Nuestros Productos
      </h1>

      {/* Filters Section */}
      <Row className="mb-4">
        <Col md={8} className="mb-3 mb-md-0">
          <Form.Control
            type="search"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="lg"
            className="shadow-sm"
          />
        </Col>
        <Col md={4}>
          <Form.Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            size="lg"
            className="shadow-sm"
          >
            <option value="name">Ordenar por Nombre</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Category Filters */}
      <div className="mb-4">
        <ButtonGroup className="flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              variant={
                selectedCategory === category ? 'primary' : 'outline-primary'
              }
              onClick={() => setSelectedCategory(category)}
              className="mb-2"
            >
              {category}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* Results Count */}
      <div className="mb-3">
        <p className="text-muted">
          Mostrando {filteredProducts.length} producto
          {filteredProducts.length !== 1 ? 's' : ''}
          {selectedCategory !== 'Todas' && ` en ${selectedCategory}`}
        </p>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {filteredProducts.map((product) => (
            <Col key={product.id}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-search display-1 text-muted mb-3"></i>
          <h4 className="text-muted">No se encontraron productos</h4>
          <p className="text-muted">
            Intenta con otros términos de búsqueda o categoría
          </p>
          <Button
            variant="primary"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('Todas');
            }}
          >
            Limpiar Filtros
          </Button>
        </div>
      )}
    </Container>
  );
};
