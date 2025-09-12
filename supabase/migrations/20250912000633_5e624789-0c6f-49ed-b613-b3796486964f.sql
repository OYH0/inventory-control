-- Fix security issue: Restrict profile access so users can only view their own data
-- Remove duplicate and overly permissive policies, then create secure ones

-- First, drop all existing policies on profiles table
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create secure, non-duplicate policies
-- Users can only view their own profile
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Admins can view all profiles (only when explicitly admin)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (is_admin());

-- Users can insert their own profile during registration
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can update their own profile only
CREATE POLICY "Users can update own profile only" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (is_admin());