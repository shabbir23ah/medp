-- Migration 004: Ratings, Drug Interactions, Treatment Plans

-- Doctor reviews/ratings
CREATE TABLE IF NOT EXISTS doctor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (doctor_id, patient_id)
);
CREATE INDEX IF NOT EXISTS idx_reviews_doctor ON doctor_reviews(doctor_id);

-- Drug interaction database (simplified pairs)
CREATE TABLE IF NOT EXISTS drug_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_a VARCHAR(200) NOT NULL,
  drug_b VARCHAR(200) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
  description TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_interactions_drugs ON drug_interactions(drug_a, drug_b);

-- Treatment plans (patient journey)
CREATE TABLE IF NOT EXISTS treatment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  start_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_plans_patient ON treatment_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_plans_doctor ON treatment_plans(doctor_id);

-- Treatment plan milestones
CREATE TABLE IF NOT EXISTS plan_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES treatment_plans(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  target_date DATE,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_milestones_plan ON plan_milestones(plan_id);
