-- ==========================================
-- STUDIO E-COMMERCE SUPABASE DATABASE SCHEMA
-- ==========================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  shipping_address TEXT,
  first_login_completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to profiles"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Allow individual write access to profiles"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow individual update access to profiles"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- 2. Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}'::TEXT[], -- Holds 3 image URLs
  category TEXT NOT NULL,
  stock INTEGER DEFAULT 0 NOT NULL,
  min_stock INTEGER DEFAULT 5 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to products"
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Allow admin full access to products"
  ON public.products FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


-- 3. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view their own orders"
  ON public.orders FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow public to insert orders"
  ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin to update orders"
  ON public.orders FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


-- 4. Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders ON DELETE CASCADE,
  product_id UUID REFERENCES public.products ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  qty INTEGER NOT NULL
);

-- Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view their own order items"
  ON public.order_items FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id AND (
        orders.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Allow public to insert order items"
  ON public.order_items FOR INSERT WITH CHECK (true);


-- 5. Automate Profile Creation on Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, first_login_completed)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), 
    'customer', 
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 6. Setup Storage Buckets
-- Run these insert statements to register the public buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for Avatars bucket
CREATE POLICY "Public Read Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth Upload Avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Update Avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Storage Policies for Products bucket
CREATE POLICY "Public Read Products" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Admin All Products" ON storage.objects FOR ALL USING (
  bucket_id = 'products' AND EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
