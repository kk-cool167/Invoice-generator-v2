import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/context/LanguageContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Shield,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from "lucide-react";

// Import images
import LaptopImage from "@/assets/images/Other_03.png";

// Sichtbare Wellen Background mit passendem Gradient
const ModernBackground = () => (
  <div className="absolute inset-0">
    {/* Deutlich sichtbare Wellen - höhere Opacity */}
    <div 
      className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1707059464734-9a6b4028891f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)'
      }}
    />
    
    {/* Gradient Hintergrund passend zur Login Form */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-pink-50/60 to-blue-50/80" />
    
    {/* Overlay für bessere Lesbarkeit */}
    <div className="absolute inset-0 bg-white/40" />
  </div>
);


// Password strength indicator
const PasswordStrength = ({ password }: { password: string }) => {
  const getStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = getStrength();
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <motion.div 
      className="mt-2"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i < strength ? colors[strength - 1] : 'bg-gray-200'
            }`}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: i * 0.1 }}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600">
        Password strength: {strength > 0 ? labels[strength - 1] : 'Enter password'}
      </p>
    </motion.div>
  );
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Refs for animations
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Enhanced entrance animation with stagger
  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.from(cardRef.current, {
      opacity: 0,
      y: 50,
      scale: 0.9,
      duration: 1,
      ease: "power3.out"
    })
    .from(imageRef.current, {
      opacity: 0,
      x: 30,
      scale: 0.95,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.6")
    .from(".form-element", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out"
    }, "-=0.4");
  }, { scope: containerRef });

  // Enhanced shake animation with color feedback
  const shakeField = (fieldId: string) => {
    const field = document.getElementById(fieldId);
    if (field) {
      gsap.to(field, {
        x: [-8, 8, -8, 8, 0],
        duration: 0.5,
        ease: "power2.out"
      });
      
      // Add border color animation
      gsap.to(field, {
        borderColor: "#ef4444",
        duration: 0.3,
        yoyo: true,
        repeat: 1
      });
    }
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      shakeField("username");
      return;
    }
    if (!password) {
      shakeField("password");
      return;
    }

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (username === "admin" && password === "password") {
        const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        login(sessionToken);
        toast({
          title: t('login.success'),
          description: t('login.welcomeBack'),
        });
        navigate("/");
      } else {
        toast({
          title: t('login.failed'),
          description: t('login.invalidCredentials'),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('login.errorOccurred'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex min-h-screen w-full overflow-hidden text-gray-900"
    >
      {/* Modern background with image */}
      <ModernBackground />

      {/* Left side (Form) */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-6 lg:p-10 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <motion.h1 
              className="text-4xl font-bold mb-4 text-gray-900"
              whileHover={{ scale: 1.05 }}
            >
              {t('login.welcomeBack')}
            </motion.h1>
            
            <motion.div 
              className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 mx-auto rounded-full mb-6"
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ duration: 1.2, delay: 0.5 }}
            />
            
            <p className="text-gray-600 text-lg">
              {t('login.enterCredentials')}
            </p>
          </div>

          {/* Clean solid card */}
          <Card 
            ref={cardRef}
            className="border shadow-xl rounded-2xl bg-white border-gray-200"
          >
            <CardContent className="pt-8 px-8 pb-8">
              <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
                {t('login.title')}
              </h2>

              
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Enhanced Username Field */}
                <div className="form-element">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    {t('login.username')}
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-black z-10 transition-colors group-focus-within:text-purple-600" />
                    <Input
                      id="username"
                      type="text"
                      placeholder={t('login.usernamePlaceholder')}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full pl-12 h-12 border transition-all duration-300 rounded-xl bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-400/30"
                    />
                  </div>
                </div>

                {/* Enhanced Password Field */}
                <div className="form-element">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    {t('login.password')}
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-black z-10 transition-colors group-focus-within:text-purple-600" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t('login.passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-12 h-12 border transition-all duration-300 rounded-xl bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-400/30"
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors text-purple-700 hover:text-purple-800"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </motion.button>
                  </div>
                  
                  {/* Password strength indicator */}
                  <PasswordStrength password={password} />
                </div>

                {/* Enhanced Submit Button */}
                <div className="form-element">
                  <motion.button
                    type="submit"
                    disabled={isLoading || !username || !password}
                    className="w-full h-14 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-xl"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      background: isLoading ? 'linear-gradient(45deg, #8b5cf6, #ec4899, #3b82f6)' : undefined,
                      backgroundSize: isLoading ? '200% 200%' : undefined,
                      animation: isLoading ? 'gradientShift 2s ease-in-out infinite' : undefined
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-3"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          <span>{t('login.loggingIn')}</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="login"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-2"
                        >
                          <Shield className="h-5 w-5" />
                          <span>{t('login.loginButton')}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side (Large Image positioned near login) */}
      <div className="hidden lg:flex w-1/2 items-center justify-start pl-8 relative z-10">
        <motion.div
          className="w-full relative max-w-2xl"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <motion.img
            ref={imageRef}
            src={LaptopImage}
            alt={t('login.laptopImageAlt')}
            className="w-full h-auto drop-shadow-2xl select-none object-contain"
            whileHover={{
              filter: "brightness(1.1) saturate(1.1)",
              scale: 1.02,
            }}
            loading="lazy"
            decoding="async"
            draggable="false"
          />
        </motion.div>
      </div>

      {/* CSS for gradient animation */}
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}