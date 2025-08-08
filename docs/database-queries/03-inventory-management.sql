-- Inventory Management Queries
-- San Pedro Beach Resort Database

-- Get inventory items with categories
SELECT 
  ii.id,
  ii.name,
  ii.description,
  ii.current_stock,
  ii.restock_level,
  ii.unit_price,
  pc.name AS category_name,
  s.name AS supplier_name
FROM inventory_items ii
LEFT JOIN product_categories pc ON ii.category_id = pc.id
LEFT JOIN suppliers s ON ii.supplier_id = s.id
ORDER BY ii.current_stock ASC;

-- Get low stock items
SELECT 
  ii.name,
  ii.current_stock,
  ii.restock_level,
  ii.unit_price,
  pc.name AS category
FROM inventory_items ii
LEFT JOIN product_categories pc ON ii.category_id = pc.id
WHERE ii.current_stock <= ii.restock_level
ORDER BY ii.current_stock ASC;
