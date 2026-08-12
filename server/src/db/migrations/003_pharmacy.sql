-- Migration 003: Online Pharmacy

-- Pharmacy medicine catalog
CREATE TABLE IF NOT EXISTS pharmacy_medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  price INTEGER NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url VARCHAR(500),
  description TEXT,
  requires_prescription BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pharmacy_medicines_pharmacy ON pharmacy_medicines(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_medicines_category ON pharmacy_medicines(category);
CREATE INDEX IF NOT EXISTS idx_pharmacy_medicines_name ON pharmacy_medicines(name);

-- Orders
CREATE TABLE IF NOT EXISTS pharmacy_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pharmacy_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount INTEGER NOT NULL DEFAULT 0,
  delivery_address TEXT,
  patient_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_patient ON pharmacy_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_orders_pharmacy ON pharmacy_orders(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON pharmacy_orders(status);

-- Order items
CREATE TABLE IF NOT EXISTS pharmacy_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES pharmacy_orders(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES pharmacy_medicines(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON pharmacy_order_items(order_id);
