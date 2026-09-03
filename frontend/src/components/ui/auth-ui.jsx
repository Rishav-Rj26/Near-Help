"use client";

import * as React from "react";
import { useState, useId, useEffect } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";
import {
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  Shield,
  MapPin,
  Users,
  Zap,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Typewriter } from "./typewriter-text";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/* ------------------------------------------------------------------ */
/*  Primitives                                                         */
/* ------------------------------------------------------------------ */

const labelVariants = cva(
  "text-xs font-semibold uppercase tracking-wider text-slate-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e1a] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]",
        outline:
          "border border-slate-700/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white hover:border-slate-600/50",
        ghost:
          "text-slate-400 hover:text-white hover:bg-slate-800/50",
        link:
          "text-indigo-400 underline-offset-4 hover:underline hover:text-indigo-300",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-6",
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
        "flex h-11 w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3 text-sm text-white shadow-sm transition-all duration-300 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-slate-800/70 disabled:cursor-not-allowed disabled:opacity-50",
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
            className={cn("pe-11", className)}
            ref={ref}
            {...props}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 end-0 flex h-full w-11 items-center justify-center text-slate-500 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
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
/*  Animated wrapper                                                   */
/* ------------------------------------------------------------------ */

function FadeIn({ children, delay = 0, className = "" }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className={cn(
        "transition-all duration-700 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sign In / Sign Up Forms                                            */
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
      navigate("/map");
    } catch {
      // Error handled via context
    }
  };

  return (
    <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-5">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="signin-email">Email Address</Label>
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
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-400 animate-in fade-in slide-in-from-top-1 duration-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        <Button type="submit" className="mt-1 w-full" disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Sign In
              <Zap className="w-4 h-4" />
            </>
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
      navigate("/map");
    } catch {
      // Error handled via context
    }
  };

  return (
    <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-5">
      <div className="grid gap-4">
        <div className="grid gap-2">
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
          <Label htmlFor="signup-email">Email Address</Label>
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
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-400 animate-in fade-in slide-in-from-top-1 duration-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        <Button type="submit" className="mt-1 w-full" disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Create Account
              <Zap className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Container                                                          */
/* ------------------------------------------------------------------ */

function AuthFormContainer({ isSignIn, onToggle }) {
  return (
    <div className="w-full max-w-[400px] mx-auto">
      {/* Brand header */}
      <FadeIn delay={100}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 shadow-lg shadow-indigo-500/25 mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {isSignIn ? "Welcome Back" : "Join NearHelp"}
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            {isSignIn
              ? "Sign in to continue protecting your community"
              : "Create an account and become a first responder"}
          </p>
        </div>
      </FadeIn>

      {/* Glass card */}
      <FadeIn delay={250}>
        <div className="rounded-2xl border border-white/[0.06] bg-slate-900/60 backdrop-blur-xl p-7 shadow-2xl shadow-black/20">
          {/* Tab toggle */}
          <div className="flex bg-slate-800/60 rounded-xl p-1 mb-7">
            <button
              type="button"
              onClick={() => { if (!isSignIn) onToggle(); }}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 cursor-pointer",
                isSignIn
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { if (isSignIn) onToggle(); }}
              className={cn(
                "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 cursor-pointer",
                !isSignIn
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          {isSignIn ? <SignInForm /> : <SignUpForm />}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-900/60 px-3 text-slate-500 uppercase tracking-widest">
                Or
              </span>
            </div>
          </div>

          {/* Google button */}
          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={() => alert("Google sign-in coming soon!")}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>
        </div>
      </FadeIn>

      {/* Feature badges */}
      <FadeIn delay={400}>
        <div className="flex items-center justify-center gap-6 mt-7 text-slate-500 text-xs">
          <div className="flex items-center gap-1.5 transition-colors hover:text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <span>Live Map</span>
          </div>
          <div className="flex items-center gap-1.5 transition-colors hover:text-slate-300">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>SOS Broadcast</span>
          </div>
          <div className="flex items-center gap-1.5 transition-colors hover:text-slate-300">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Community</span>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main AuthUI                                                        */
/* ------------------------------------------------------------------ */

const defaultSignInContent = {
  image: {
    src: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=900&q=80",
    alt: "Emergency responders helping the community",
  },
  quote: {
    text: "Every second counts. Your community is counting on you.",
    author: "NearHelp",
  },
};

const defaultSignUpContent = {
  image: {
    src: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=900&q=80",
    alt: "People working together in community",
  },
  quote: {
    text: "Be the first to respond. Be someone's hero today.",
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
    <div className="w-full min-h-screen md:grid md:grid-cols-2" style={{ background: '#0a0e1a' }}>
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>

      {/* ---- LEFT: Form side ---- */}
      <div className="relative flex h-screen items-center justify-center p-6 md:h-auto md:p-8 overflow-hidden">
        {/* Animated background effects */}
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <div
          className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full opacity-[0.12] blur-[120px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full opacity-[0.08] blur-[100px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        <div className="relative z-10 w-full">
          <AuthFormContainer isSignIn={isSignIn} onToggle={toggleForm} />
        </div>
      </div>

      {/* ---- RIGHT: Hero image side ---- */}
      <div className="hidden md:block relative overflow-hidden">
        {/* Image with crossfade */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out scale-105"
          style={{ backgroundImage: `url(${currentContent.image.src})` }}
          key={currentContent.image.src}
        />

        {/* Overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e1a] via-[#0a0e1a]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-[#0a0e1a]/30" />
        <div className="absolute inset-0 bg-indigo-500/[0.04]" />

        {/* Top-right brand badge */}
        <div className="absolute top-6 right-6 z-10">
          <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="text-white text-xs font-bold tracking-wide">NearHelp</span>
          </div>
        </div>

        {/* Bottom quote */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-8">
          <div className="max-w-md">
            <blockquote className="space-y-3">
              <p className="text-xl font-medium text-white leading-relaxed">
                &ldquo;
                <Typewriter
                  key={currentContent.quote.text}
                  text={currentContent.quote.text}
                  speed={50}
                />
                &rdquo;
              </p>
              <cite className="block text-sm font-light text-slate-400 not-italic">
                — {currentContent.quote.author}
              </cite>
            </blockquote>

            {/* Stats row */}
            <div className="flex gap-6 mt-6 pt-6 border-t border-white/10">
              <div>
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-xs text-slate-400 mt-0.5">Always Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">&lt;30s</div>
                <div className="text-xs text-slate-400 mt-0.5">Response Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">5km</div>
                <div className="text-xs text-slate-400 mt-0.5">Alert Radius</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
