import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Eye, 
  Download,
  Sparkles,
  Zap,
  RotateCcw
} from 'lucide-react';

// GSAP Component Examples for your Invoice Generator
export function GSAPAnimationExamples() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // GSAP Animations using useGSAP hook (React 18 compatible)
  useGSAP(() => {
    // Card entrance animation (similar to your FI/MM items sections)
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, 
        {
          opacity: 0,
          y: 30,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out"
        }
      );
    }

    // Staggered items animation (for your invoice items)
    if (itemsRef.current.length > 0) {
      gsap.fromTo(itemsRef.current,
        {
          opacity: 0,
          x: -20,
          scale: 0.9
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.7)",
          delay: 0.3
        }
      );
    }
  }, { scope: containerRef });

  // Button hover animation
  const handleButtonHover = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 1.05,
        duration: 0.2,
        ease: "power2.out"
      });
    }
  };

  const handleButtonLeave = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out"
      });
    }
  };

  // Add item animation
  const addItemAnimation = () => {
    const newItem = document.createElement('div');
    newItem.className = 'p-3 bg-purple-50 rounded-lg border border-purple-200';
    newItem.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
        <span class="text-sm">New Invoice Item ${itemsRef.current.length + 1}</span>
      </div>
    `;
    
    containerRef.current?.appendChild(newItem);
    
    gsap.fromTo(newItem,
      {
        opacity: 0,
        scale: 0,
        y: -20
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.5,
        ease: "back.out(2)"
      }
    );
  };

  return (
    <div ref={containerRef} className="space-y-6">
      <Card ref={cardRef} className="border-2 border-purple-300/60 shadow-lg shadow-purple-500/10">
        <CardHeader className="bg-gradient-to-r from-purple-50/30 to-purple-100/20 border-b border-purple-200/40">
          <CardTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            GSAP Animation Examples
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* Animated Items List */}
          <div className="space-y-3">
            {[1, 2, 3].map((item, index) => (
              <div
                key={item}
                ref={el => { if (el) itemsRef.current[index] = el; }}
                className="p-3 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Invoice Item {item}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Animated Button */}
          <Button
            ref={buttonRef}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
            onClick={addItemAnimation}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Invoice Item (GSAP)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Framer Motion Component Examples
export function FramerMotionExamples() {
  const [items, setItems] = useState([1, 2, 3]);
  const [isVisible, setIsVisible] = useState(true);
  const controls = useAnimation();

  // Card variants for complex animations
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50, 
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  // Item variants for staggered animations
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      x: -20,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "backOut"
      }
    }
  };

  // Button animations
  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const addItem = () => {
    setItems(prev => [...prev, prev.length + 1]);
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(item => item !== id));
  };

  const triggerWaveAnimation = async () => {
    await controls.start({
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
      transition: { duration: 0.6 }
    });
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Card className="border-2 border-purple-300/60 shadow-lg shadow-purple-500/10">
          <CardHeader className="bg-gradient-to-r from-purple-50/30 to-purple-100/20 border-b border-purple-200/40">
            <CardTitle className="flex items-center gap-3">
              <motion.div 
                className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Sparkles className="h-4 w-4 text-white" />
              </motion.div>
              Framer Motion Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* Animated Items with Exit Animations */}
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item}
                  layout
                  initial={{ opacity: 0, scale: 0, x: -100 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0, x: 100 }}
                  whileHover={{ scale: 1.02, backgroundColor: "#f3e8ff" }}
                  transition={{ 
                    layout: { duration: 0.3 },
                    default: { duration: 0.5, ease: "backOut" }
                  }}
                  className="p-3 bg-purple-50 rounded-lg border border-purple-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="w-2 h-2 bg-purple-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                      <span className="text-sm">Invoice Item {item}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeItem(item)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Control Buttons */}
            <div className="flex gap-3">
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={addItem}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </motion.button>
              
              <motion.button
                animate={controls}
                whileHover="hover"
                whileTap="tap"
                onClick={triggerWaveAnimation}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                variants={buttonVariants}
              >
                <RotateCcw className="h-4 w-4" />
                Wave
              </motion.button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* PDF Preview Animation Example */}
      <motion.div 
        variants={itemVariants}
        className="space-y-4"
      >
        <Card className="border-2 border-purple-300/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Eye className="h-5 w-5" />
              PDF Preview Animation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {isVisible && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="h-40 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg border-2 border-dashed border-purple-300 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1] 
                    }}
                    transition={{ 
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <FileText className="h-12 w-12 text-purple-600" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsVisible(!isVisible)}
              className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg"
            >
              Toggle Preview
            </motion.button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// Main Demo Component
export function AnimationExamples() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Animation Library Integration Examples
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Demonstration of GSAP and Framer Motion animations for your React TypeScript invoice generator project.
        </p>
      </div>

      <Tabs defaultValue="gsap" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gsap">GSAP Examples</TabsTrigger>
          <TabsTrigger value="framer">Framer Motion Examples</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gsap" className="mt-6">
          <GSAPAnimationExamples />
        </TabsContent>
        
        <TabsContent value="framer" className="mt-6">
          <FramerMotionExamples />
        </TabsContent>
      </Tabs>

      {/* Integration Guide */}
      <Card className="border-2 border-blue-300/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5" />
            Integration Guide for Your Project
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-purple-700">GSAP Integration</h3>
              <div className="space-y-2 text-sm">
                <Badge variant="outline" className="w-full justify-start">
                  npm install gsap @gsap/react
                </Badge>
                <p className="text-gray-600">
                  • Use useGSAP hook for React 18 compatibility<br/>
                  • Perfect for complex timelines<br/>
                  • Great performance for SVG animations<br/>
                  • Ideal for your PDF preview transitions
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-indigo-700">Framer Motion Integration</h3>
              <div className="space-y-2 text-sm">
                <Badge variant="outline" className="w-full justify-start">
                  npm install framer-motion
                </Badge>
                <p className="text-gray-600">
                  • Declarative API with React components<br/>
                  • Built-in layout animations<br/>
                  • Perfect for page transitions<br/>
                  • Ideal for your invoice item animations
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}