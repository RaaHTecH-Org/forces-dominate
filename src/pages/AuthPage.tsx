import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { Loader2, Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';

// Schema for password-based sign in
const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Schema for magic link sign in
const magicLinkSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Schema for sign up
const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignInFormValues = z.infer<typeof signInSchema>;
type MagicLinkFormValues = z.infer<typeof magicLinkSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [authMethod, setAuthMethod] = useState<'password' | 'magic'>('password');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { signIn, signUp, signInWithOtp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const magicLinkForm = useForm<MagicLinkFormValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: '',
    },
  });

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Show loading spinner while checking authentication
  if (isLoading && !user) {
    return <LoadingSpinner fullScreen text="Checking authentication..." />;
  }

  const onSignIn = async (values: SignInFormValues) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const { error } = await signIn(values.email, values.password);
      
      if (error) {
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Please check your email and click the confirmation link before signing in.";
        }
        
        setAuthError(errorMessage);
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMessage = "Please try again later.";
      setAuthError(errorMessage);
      toast({
        title: "An error occurred",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onMagicLinkSignIn = async (values: MagicLinkFormValues) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const { error } = await signInWithOtp(values.email);

      if (error) {
        setAuthError(error.message);
        toast({
          title: "Magic Link Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setMagicLinkSent(true);
        toast({
          title: "Magic Link Sent!",
          description: "Check your email for a secure sign-in link.",
        });
      }
    } catch (error) {
      const errorMessage = "Please try again later.";
      setAuthError(errorMessage);
      toast({
        title: "An error occurred",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSignUp = async (values: SignUpFormValues) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const { error } = await signUp(values.email, values.password, values.fullName);
      
      if (error) {
        let errorMessage = error.message;
        if (error.message.includes('already registered')) {
          errorMessage = "An account with this email already exists. Please sign in instead.";
          setActiveTab('signin');
          signInForm.setValue('email', values.email);
        }
        
        setAuthError(errorMessage);
        toast({
          title: "Sign Up Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to confirm your account before signing in.",
        });
        setActiveTab('signin');
        signInForm.setValue('email', values.email);
      }
    } catch (error) {
      const errorMessage = "Please try again later.";
      setAuthError(errorMessage);
      toast({
        title: "An error occurred",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetMagicLinkState = () => {
    setMagicLinkSent(false);
    setAuthError(null);
    magicLinkForm.reset();
  };

  const clearError = () => {
    setAuthError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">BF</span>
            </div>
            BlackForce
          </Link>
          <p className="text-muted-foreground mt-2">Access your premium experience</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="signin" 
                onClick={() => setAuthError(null)}
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                onClick={() => setAuthError(null)}
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Welcome Back
                  {authMethod === 'magic' && <Sparkles className="h-4 w-4 text-primary" />}
                </CardTitle>
                <CardDescription>
                  {authMethod === 'password' 
                    ? 'Sign in to your account to continue'
                    : 'Get a secure magic link sent to your email'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Error Message Display */}
                <ErrorMessage error={authError} onDismiss={clearError} />

                {/* Auth Method Toggle */}
                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                  <Button
                    type="button"
                    variant={authMethod === 'password' ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1 h-8"
                    onClick={() => {
                      setAuthMethod('password');
                      resetMagicLinkState();
                    }}
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    Password
                  </Button>
                  <Button
                    type="button"
                    variant={authMethod === 'magic' ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1 h-8"
                    onClick={() => {
                      setAuthMethod('magic');
                      setAuthError(null);
                      resetMagicLinkState();
                    }}
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Magic Link
                  </Button>
                </div>

                {authMethod === 'password' ? (
                  <Form {...signInForm}>
                    <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                      <FormField
                        control={signInForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="your@email.com"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signInForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  {...field}
                                  disabled={isLoading}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                  disabled={isLoading}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Lock className="mr-2 h-4 w-4" />
                        Sign In
                      </Button>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-4">
                    {!magicLinkSent ? (
                      <Form {...magicLinkForm}>
                        <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSignIn)} className="space-y-4">
                          <FormField
                            control={magicLinkForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    {...field}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Sparkles className="mr-2 h-4 w-4" />
                            Send Magic Link
                          </Button>
                        </form>
                      </Form>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                          <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
                          <h3 className="font-semibold text-sm">Magic Link Sent!</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Check your email for a secure sign-in link
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetMagicLinkState}
                          className="w-full"
                        >
                          Send Another Link
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </TabsContent>
            
            <TabsContent value="signup">
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Create a new account to get started</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Error Message Display */}
                <ErrorMessage error={authError} onDismiss={clearError} className="mb-4" />

                <Form {...signUpForm}>
                  <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                    <FormField
                      control={signUpForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Doe"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                                disabled={isLoading}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
          </Tabs>
          
          <CardFooter className="justify-center">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to Home
            </Link>
          </CardFooter>
        </Card>

        <div className="text-center mt-6">
          <Alert className="border-border/50">
            <AlertDescription className="text-sm text-muted-foreground">
              {authMethod === 'magic' 
                ? "Magic links provide secure, passwordless authentication. Check your email after requesting a link."
                : "For testing: Email confirmation is enabled. Check your email after signing up."
              }
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
