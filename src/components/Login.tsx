import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Flame, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeProvider';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, fullName);
      } else {
        await signIn(email, password);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100svh] relative bg-background overflow-hidden">
      {/* Backdrop decorativo */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full bg-success/15 blur-3xl" />
      </div>

      {/* Toggle tema no canto */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 min-h-[100svh] flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-enter">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-warm-gradient shadow-lg mb-5">
              <Flame className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Companhia do Churrasco
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {isSignUp ? 'Crie sua conta para continuar' : 'Entre na sua conta para continuar'}
            </p>
          </div>

          <Card className="card-elevated border-border/60">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Nome completo
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Como você se chama"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={isSignUp}
                      className="h-11"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-11"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-warm-gradient text-white font-semibold shadow-md hover:shadow-lg transition-shadow group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isSignUp ? 'Criando conta...' : 'Entrando...'}
                    </>
                  ) : (
                    <>
                      {isSignUp ? 'Criar conta' : 'Entrar'}
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center pt-5 mt-5 border-t border-border/60">
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}{' '}
                  <button
                    type="button"
                    className="font-semibold text-primary hover:underline focus:outline-none focus-visible:underline"
                    onClick={() => setIsSignUp(!isSignUp)}
                  >
                    {isSignUp ? 'Fazer login' : 'Criar conta'}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          {isSignUp && (
            <p className="text-xs text-muted-foreground text-center mt-4 px-4 leading-relaxed">
              Após o cadastro, sua conta ficará aguardando aprovação do administrador
              antes de acessar o sistema.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
