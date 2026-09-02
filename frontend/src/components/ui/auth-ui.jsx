"use client";

import * as React from "react";
import { useState, useId } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";
import { Eye, EyeOff, AlertTriangle, Loader2, Shield } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Typewriter } from "./typewriter-text";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/* ------------------------------------------------------------------ */
/*  Primitives (Label, Button, Input, PasswordInput)                  */
/* ------------------------------------------------------------------ */

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input dark:border-input/50 bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary-foreground/60 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-input dark:border-input/50 bg-background px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:bg-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

const PasswordInput = React.forwardRef(
  ({ className, label, ...props }, ref) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    return (
      <div className="grid w-full items-center gap-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input
            id={id}
            type={showPassword ? "text" : "password"}
            className={cn("pe-10", className)}
            ref={ref}
            {...props}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

/* ------------------------------------------------------------------ */
/*  Sign In / Sign Up Forms (wired to AuthContext)                     */
/* ------------------------------------------------------------------ */

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (event) => {
    event.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch {
      // Error handled via context
    }
  };

  return (
    <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign in to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to sign in
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="signin-email">Email</Label>
          <Input
            id="signin-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <PasswordInput
          name="password"
          label="Password"
          required
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        <Button type="submit" variant="outline" className="mt-2" disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Sign In"
          )}
        </Button>
      </div>
    </form>
  );
}

function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signup, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();
    try {
      await signup(name, email, password);
      navigate("/");
    } catch {
      // Error handled via context
    }
  };

  return (
    <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your details below to sign up
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-1">
          <Label htmlFor="signup-name">Full Name</Label>
          <Input
            id="signup-name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <PasswordInput
          name="password"
          label="Password"
          required
          autoComplete="new-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        <Button type="submit" variant="outline" className="mt-2" disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Sign Up"
          )}
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Container (toggle + Google button)                                 */
/* ------------------------------------------------------------------ */

function AuthFormContainer({ isSignIn, onToggle }) {
  return (
    <div className="mx-auto grid w-[350px] gap-2">
      {isSignIn ? <SignInForm /> : <SignUpForm />}
      <div className="text-center text-sm">
        {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
        <Button variant="link" className="pl-1 text-foreground" onClick={onToggle}>
          {isSignIn ? "Sign up" : "Sign in"}
        </Button>
      </div>
      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
        <span className="relative z-10 bg-background px-2 text-muted-foreground">
          Or continue with
        </span>
      </div>
      <Button
        variant="outline"
        type="button"
        onClick={() => alert("Google sign-in coming soon!")}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main AuthUI export                                                 */
/* ------------------------------------------------------------------ */

const defaultSignInContent = {
  image: {
    src: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&q=80",
    alt: "Emergency responders helping the community",
  },
  quote: {
    text: "Welcome Back! Your community needs you.",
    author: "NearHelp",
  },
};

const defaultSignUpContent = {
  image: {
    src: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80",
    alt: "People working together in community",
  },
  quote: {
    text: "Join the movement. Be someone's first responder.",
    author: "NearHelp",
  },
};

export function AuthUI({ signInContent = {}, signUpContent = {} }) {
  const [isSignIn, setIsSignIn] = useState(true);
  const toggleForm = () => setIsSignIn((prev) => !prev);

  const finalSignInContent = {
    image: { ...defaultSignInContent.image, ...signInContent.image },
    quote: { ...defaultSignInContent.quote, ...signInContent.quote },
  };
  const finalSignUpContent = {
    image: { ...defaultSignUpContent.image, ...signUpContent.image },
    quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
  };

  const currentContent = isSignIn ? finalSignInContent : finalSignUpContent;

  return (
    <div className="w-full min-h-screen md:grid md:grid-cols-2">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>
      <div className="flex h-screen items-center justify-center p-6 md:h-auto md:p-0 md:py-12">
        <AuthFormContainer isSignIn={isSignIn} onToggle={toggleForm} />
      </div>

      <div
        className="hidden md:block relative bg-cover bg-center transition-all duration-500 ease-in-out"
        style={{ backgroundImage: `url(${currentContent.image.src})` }}
        key={currentContent.image.src}
      >
        <div className="absolute inset-x-0 bottom-0 h-[100px] bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 flex h-full flex-col items-center justify-end p-2 pb-6">
          <blockquote className="space-y-2 text-center text-foreground">
            <p className="text-lg font-medium">
              &ldquo;
              <Typewriter
                key={currentContent.quote.text}
                text={currentContent.quote.text}
                speed={60}
              />
              &rdquo;
            </p>
            <cite className="block text-sm font-light text-muted-foreground not-italic">
              — {currentContent.quote.author}
            </cite>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
