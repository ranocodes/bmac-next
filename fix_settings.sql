CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  logo_text TEXT,
  copyright TEXT,
  social_links JSONB,
  navigation JSONB
);
