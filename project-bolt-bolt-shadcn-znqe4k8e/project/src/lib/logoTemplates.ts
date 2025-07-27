import { type GraphicElement, type TextElement, type TextEffect, type Layer, type LogoTemplate } from './types';

const createLayerId = () => `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const modernTemplates: LogoTemplate[] = [
  {
    id: 'modern-1',
    name: 'Gradient Wave',
    category: 'modern',
    tags: ['modern', 'gradient', 'wave'],
    backgroundColor: '#000000',
    description: 'A modern design with flowing gradient waves',
    author: 'System',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elements: [
      {
        id: createLayerId(),
        type: 'graphic',
        name: 'Wave 1',
        visible: true,
        locked: false,
        zIndex: 1,
        element: {
          type: 'circle',
          x: 180,
          y: 150,
          radius: 80,
          gradient: {
            colors: ['#FF0080', '#7928CA'],
            angle: 45
          },
          opacity: 0.8
        }
      },
      {
        id: createLayerId(),
        type: 'graphic',
        name: 'Wave 2',
        visible: true,
        locked: false,
        zIndex: 2,
        element: {
          type: 'circle',
          x: 220,
          y: 150,
          radius: 80,
          gradient: {
            colors: ['#7928CA', '#FF0080'],
            angle: -45
          },
          opacity: 0.8
        }
      },
      {
        id: createLayerId(),
        type: 'text',
        name: 'Company Name',
        visible: true,
        locked: false,
        zIndex: 3,
        element: {
          type: 'text',
          id: createLayerId(),
          content: '{companyName}',
          x: 200,
          y: 150,
          fontSize: 42,
          fontFamily: 'Montserrat',
          color: '#FFFFFF',
          letterSpacing: 2,
          uppercase: true,
          effects: [
            {
              type: 'shadow',
              settings: {
                shadowColor: 'rgba(0,0,0,0.3)',
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowOffsetY: 4
              }
            }
          ]
        }
      }
    ]
  },
  {
    id: 'modern-2',
    name: 'Neon Glow',
    category: 'modern',
    tags: ['modern', 'neon', 'glow'],
    backgroundColor: '#0F172A',
    description: 'A modern neon-style design with glowing elements',
    author: 'System',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elements: [
      {
        id: createLayerId(),
        type: 'graphic',
        name: 'Glow Ring',
        visible: true,
        locked: false,
        zIndex: 1,
        element: {
          type: 'circle',
          x: 200,
          y: 150,
          radius: 70,
          gradient: {
            colors: ['#00F5A0', '#00D9F5'],
            angle: 45
          },
          opacity: 0.5
        }
      },
      {
        id: createLayerId(),
        type: 'text',
        name: 'Company Name',
        visible: true,
        locked: false,
        zIndex: 2,
        element: {
          type: 'text',
          id: createLayerId(),
          content: '{companyName}',
          x: 200,
          y: 150,
          fontSize: 48,
          fontFamily: 'Raleway',
          color: '#FFFFFF',
          letterSpacing: 4,
          uppercase: true,
          effects: [
            {
              type: 'shadow',
              settings: {
                shadowColor: '#00F5A0',
                shadowBlur: 20,
                shadowOffsetX: 0,
                shadowOffsetY: 0
              }
            }
          ]
        }
      }
    ]
  },
  {
    id: 'modern-3',
    name: 'Geometric Minimal',
    category: 'modern',
    tags: ['modern', 'geometric', 'minimal'],
    backgroundColor: '#FFFFFF',
    description: 'A clean geometric design with minimal elements',
    author: 'System',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elements: [
      {
        id: createLayerId(),
        type: 'graphic',
        name: 'Triangle',
        visible: true,
        locked: false,
        zIndex: 1,
        element: {
          type: 'triangle',
          x: 200,
          y: 130,
          width: 60,
          height: 60,
          gradient: {
            colors: ['#2563EB', '#3B82F6'],
            angle: 45
          },
          rotation: 180
        }
      },
      {
        id: createLayerId(),
        type: 'graphic',
        name: 'Square',
        visible: true,
        locked: false,
        zIndex: 2,
        element: {
          type: 'rectangle',
          x: 200,
          y: 150,
          width: 40,
          height: 40,
          color: '#1E40AF',
          rotation: 45
        }
      },
      {
        id: createLayerId(),
        type: 'text',
        name: 'Company Name',
        visible: true,
        locked: false,
        zIndex: 3,
        element: {
          type: 'text',
          id: createLayerId(),
          content: '{companyName}',
          x: 200,
          y: 220,
          fontSize: 24,
          fontFamily: 'Poppins',
          color: '#1E40AF',
          letterSpacing: 4,
          uppercase: true
        }
      }
    ]
  },
  {
    id: 'modern-4',
    name: 'Dynamic Layers',
    category: 'modern',
    tags: ['modern', 'layered', 'dynamic'],
    backgroundColor: '#0F172A',
    description: 'A modern design with overlapping dynamic layers',
    author: 'System',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elements: [
      {
        id: createLayerId(),
        type: 'graphic',
        name: 'Layer 1',
        visible: true,
        locked: false,
        zIndex: 1,
        element: {
          type: 'rectangle',
          x: 180,
          y: 150,
          width: 120,
          height: 120,
          gradient: {
            colors: ['#3B82F6', '#2563EB'],
            angle: 45
          },
          rotation: 15,
          opacity: 0.8
        }
      },
      {
        id: createLayerId(),
        type: 'graphic',
        name: 'Layer 2',
        visible: true,
        locked: false,
        zIndex: 2,
        element: {
          type: 'rectangle',
          x: 220,
          y: 150,
          width: 120,
          height: 120,
          gradient: {
            colors: ['#8B5CF6', '#6366F1'],
            angle: -45
          },
          rotation: -15,
          opacity: 0.6
        }
      },
      {
        id: createLayerId(),
        type: 'text',
        name: 'Company Name',
        visible: true,
        locked: false,
        zIndex: 3,
        element: {
          type: 'text',
          id: createLayerId(),
          content: '{companyName}',
          x: 200,
          y: 150,
          fontSize: 36,
          fontFamily: 'Space Grotesk',
          color: '#FFFFFF',
          letterSpacing: 2,
          uppercase: true,
          effects: [
            {
              type: 'shadow',
              settings: {
                shadowColor: 'rgba(59, 130, 246, 0.5)',
                shadowBlur: 15,
                shadowOffsetX: 0,
                shadowOffsetY: 0
              }
            }
          ]
        }
      }
    ]
  }
];

const minimalTemplates: LogoTemplate[] = [
  {
    id: 'minimal-1',
    name: 'Clean Lines',
    category: 'minimal',
    tags: ['minimal', 'clean', 'lines'],
    backgroundColor: '#FFFFFF',
    description: 'A minimal design with clean lines',
    author: 'System',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elements: [
      {
        id: createLayerId(),
        type: 'graphic',
        name: 'Horizontal Line',
        visible: true,
        locked: false,
        zIndex: 1,
        element: {
          type: 'line',
          x: 150,
          y: 150,
          width: 100,
          height: 2,
          color: '#1F2937',
          strokeWidth: 2
        }
      },
      {
        id: createLayerId(),
        type: 'graphic',
        name: 'Vertical Line',
        visible: true,
        locked: false,
        zIndex: 2,
        element: {
          type: 'line',
          x: 200,
          y: 100,
          width: 2,
          height: 100,
          color: '#1F2937',
          strokeWidth: 2
        }
      },
      {
        id: createLayerId(),
        type: 'text',
        name: 'Company Name',
        visible: true,
        locked: false,
        zIndex: 3,
        element: {
          type: 'text',
          id: createLayerId(),
          content: '{companyName}',
          x: 200,
          y: 180,
          fontSize: 24,
          fontFamily: 'Montserrat',
          color: '#1F2937',
          letterSpacing: 4,
          uppercase: true
        }
      }
    ]
  }
];

const techTemplates: LogoTemplate[] = [
  {
    id: 'tech-1',
    name: 'Circuit Board',
    category: 'tech',
    tags: ['tech', 'circuit', 'modern'],
    backgroundColor: '#000000',
    description: 'A tech-inspired circuit board design',
    author: 'System',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elements: [
      {
        id: createLayerId(),
        type: 'graphic',
        name: 'Circuit Line 1',
        visible: true,
        locked: false,
        zIndex: 1,
        element: {
          type: 'line',
          x: 150,
          y: 150,
          width: 100,
          height: 2,
          color: '#00FF00',
          strokeWidth: 2,
          strokeDashArray: [5, 5],
          opacity: 0.6
        }
      },
      {
        id: createLayerId(),
        type: 'graphic',
        name: 'Circuit Node',
        visible: true,
        locked: false,
        zIndex: 2,
        element: {
          type: 'circle',
          x: 200,
          y: 150,
          radius: 8,
          color: '#00FF00',
          opacity: 0.8
        }
      },
      {
        id: createLayerId(),
        type: 'text',
        name: 'Company Name',
        visible: true,
        locked: false,
        zIndex: 3,
        element: {
          type: 'text',
          id: createLayerId(),
          content: '{companyName}',
          x: 200,
          y: 200,
          fontSize: 28,
          fontFamily: 'Space Grotesk',
          color: '#00FF00',
          letterSpacing: 2,
          uppercase: true,
          effects: [
            {
              type: 'glow',
              settings: {
                glowColor: '#00FF00',
                glowRadius: 10,
                glowIntensity: 0.5
              }
            }
          ]
        }
      }
    ]
  }
];

const boldTemplates: LogoTemplate[] = [
  {
    id: 'bold-1',
    name: 'Strong Shapes',
    category: 'bold',
    tags: ['bold', 'geometric', 'strong'],
    backgroundColor: '#FFFFFF',
    description: 'A bold design with strong geometric shapes',
    author: 'System',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elements: [
      {
        id: createLayerId(),
        type: 'graphic',
        name: 'Bold Triangle',
        visible: true,
        locked: false,
        zIndex: 1,
        element: {
          type: 'triangle',
          x: 200,
          y: 150,
          width: 100,
          height: 100,
          color: '#000000',
          rotation: 0
        }
      },
      {
        id: createLayerId(),
        type: 'text',
        name: 'Company Name',
        visible: true,
        locked: false,
        zIndex: 2,
        element: {
          type: 'text',
          id: createLayerId(),
          content: '{companyName}',
          x: 200,
          y: 250,
          fontSize: 42,
          fontFamily: 'Montserrat',
          color: '#000000',
          letterSpacing: 2,
          uppercase: true,
          effects: [
            {
              type: 'outline',
              settings: {
                outlineColor: '#000000',
                outlineWidth: 2
              }
            }
          ]
        }
      }
    ]
  }
];

const creativeTemplates: LogoTemplate[] = [
  {
    id: 'creative-1',
    name: 'Abstract Flow',
    category: 'creative',
    tags: ['creative', 'abstract', 'flow'],
    backgroundColor: '#FFFFFF',
    description: 'An abstract design with flowing shapes',
    author: 'System',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elements: [
      {
        id: createLayerId(),
        type: 'graphic',
        name: 'Flow Shape 1',
        visible: true,
        locked: false,
        zIndex: 1,
        element: {
          type: 'circle',
          x: 170,
          y: 150,
          radius: 50,
          gradient: {
            colors: ['#F43F5E', '#EC4899'],
            angle: 45
          },
          opacity: 0.9
        }
      },
      {
        id: createLayerId(),
        type: 'graphic',
        name: 'Flow Shape 2',
        visible: true,
        locked: false,
        zIndex: 2,
        element: {
          type: 'circle',
          x: 230,
          y: 150,
          radius: 50,
          gradient: {
            colors: ['#8B5CF6', '#6366F1'],
            angle: 45
          },
          opacity: 0.9
        }
      },
      {
        id: createLayerId(),
        type: 'text',
        name: 'Company Name',
        visible: true,
        locked: false,
        zIndex: 3,
        element: {
          type: 'text',
          id: createLayerId(),
          content: '{companyName}',
          x: 200,
          y: 250,
          fontSize: 32,
          fontFamily: 'Playfair Display',
          color: '#1F2937',
          letterSpacing: 2,
          uppercase: true
        }
      }
    ]
  },
  {
    id: 'creative-2',
    name: 'Elegant Script',
    category: 'creative',
    tags: ['creative', 'elegant', 'script'],
    backgroundColor: '#FFFFFF',
    description: 'An elegant design with script typography',
    author: 'System',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elements: [
      {
        id: createLayerId(),
        type: 'text',
        name: 'Company Name',
        visible: true,
        locked: false,
        zIndex: 1,
        element: {
          type: 'text',
          id: createLayerId(),
          content: '{companyName}',
          x: 200,
          y: 150,
          fontSize: 64,
          fontFamily: 'Dancing Script',
          color: '#1F2937',
          letterSpacing: 0,
          uppercase: false
        }
      },
      {
        id: createLayerId(),
        type: 'text',
        name: 'Tagline',
        visible: true,
        locked: false,
        zIndex: 2,
        element: {
          type: 'text',
          id: createLayerId(),
          content: 'ESTABLISHED 2024',
          x: 200,
          y: 220,
          fontSize: 14,
          fontFamily: 'Montserrat',
          color: '#6B7280',
          letterSpacing: 4,
          uppercase: true
        }
      }
    ]
  },
  {
    id: 'creative-3',
    name: 'Tech Stack',
    category: 'creative',
    tags: ['creative', 'tech', 'modern'],
    backgroundColor: '#000000',
    description: 'A modern tech-inspired design',
    author: 'System',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elements: [
      {
        id: createLayerId(),
        type: 'graphic',
        name: 'Tech Shape 1',
        visible: true,
        locked: false,
        zIndex: 1,
        element: {
          type: 'rectangle',
          x: 180,
          y: 150,
          width: 80,
          height: 80,
          gradient: {
            colors: ['#3B82F6', '#2563EB'],
            angle: 45
          },
          rotation: 45,
          opacity: 0.8
        }
      },
      {
        id: createLayerId(),
        type: 'graphic',
        name: 'Tech Shape 2',
        visible: true,
        locked: false,
        zIndex: 2,
        element: {
          type: 'rectangle',
          x: 220,
          y: 150,
          width: 80,
          height: 80,
          gradient: {
            colors: ['#8B5CF6', '#6366F1'],
            angle: -45
          },
          rotation: 45,
          opacity: 0.6
        }
      },
      {
        id: createLayerId(),
        type: 'text',
        name: 'Company Name',
        visible: true,
        locked: false,
        zIndex: 3,
        element: {
          type: 'text',
          id: createLayerId(),
          content: '{companyName}',
          x: 200,
          y: 150,
          fontSize: 36,
          fontFamily: 'Space Grotesk',
          color: '#FFFFFF',
          letterSpacing: 2,
          uppercase: true,
          effects: [
            {
              type: 'shadow',
              settings: {
                shadowColor: 'rgba(59, 130, 246, 0.5)',
                shadowBlur: 15,
                shadowOffsetX: 0,
                shadowOffsetY: 0
              }
            }
          ]
        }
      }
    ]
  },
  {
    id: 'creative-4',
    name: 'Organic Shapes',
    category: 'creative',
    tags: ['creative', 'organic', 'natural'],
    backgroundColor: '#F8FAFC',
    description: 'A natural design with organic shapes',
    author: 'System',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elements: [
      {
        id: createLayerId(),
        type: 'graphic',
        name: 'Organic Shape 1',
        visible: true,
        locked: false,
        zIndex: 1,
        element: {
          type: 'circle',
          x: 170,
          y: 150,
          radius: 60,
          gradient: {
            colors: ['#059669', '#10B981'],
            angle: 45
          },
          opacity: 0.85
        }
      },
      {
        id: createLayerId(),
        type: 'graphic',
        name: 'Organic Shape 2',
        visible: true,
        locked: false,
        zIndex: 2,
        element: {
          type: 'circle',
          x: 230,
          y: 150,
          radius: 45,
          gradient: {
            colors: ['#047857', '#059669'],
            angle: -45
          },
          opacity: 0.75
        }
      },
      {
        id: createLayerId(),
        type: 'text',
        name: 'Company Name',
        visible: true,
        locked: false,
        zIndex: 3,
        element: {
          type: 'text',
          id: createLayerId(),
          content: '{companyName}',
          x: 200,
          y: 150,
          fontSize: 38,
          fontFamily: 'Montserrat',
          color: '#064E3B',
          letterSpacing: 1,
          uppercase: true,
          effects: [
            {
              type: 'shadow',
              settings: {
                shadowColor: 'rgba(6, 78, 59, 0.15)',
                shadowBlur: 8,
                shadowOffsetX: 0,
                shadowOffsetY: 2
              }
            }
          ]
        }
      }
    ]
  },
  {
    id: 'creative-5',
    name: 'Vintage Badge',
    category: 'creative',
    tags: ['creative', 'vintage', 'badge'],
    backgroundColor: '#FFFFFF',
    description: 'A vintage-style badge design',
    author: 'System',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    elements: [
      {
        id: createLayerId(),
        type: 'graphic',
        name: 'Outer Circle',
        visible: true,
        locked: false,
        zIndex: 1,
        element: {
          type: 'circle',
          x: 200,
          y: 150,
          radius: 90,
          color: '#1F2937',
          opacity: 1
        }
      },
      {
        id: createLayerId(),
        type: 'graphic',
        name: 'Inner Circle',
        visible: true,
        locked: false,
        zIndex: 2,
        element: {
          type: 'circle',
          x: 200,
          y: 150,
          radius: 85,
          color: '#FFFFFF',
          opacity: 1
        }
      },
      {
        id: createLayerId(),
        type: 'text',
        name: 'Company Name',
        visible: true,
        locked: false,
        zIndex: 3,
        element: {
          type: 'text',
          id: createLayerId(),
          content: '{companyName}',
          x: 200,
          y: 150,
          fontSize: 32,
          fontFamily: 'Playfair Display',
          color: '#1F2937',
          letterSpacing: 2,
          uppercase: true
        }
      },
      {
        id: createLayerId(),
        type: 'text',
        name: 'Established',
        visible: true,
        locked: false,
        zIndex: 4,
        element: {
          type: 'text',
          id: createLayerId(),
          content: 'EST. 2024',
          x: 200,
          y: 190,
          fontSize: 14,
          fontFamily: 'Montserrat',
          color: '#4B5563',
          letterSpacing: 3,
          uppercase: true
        }
      }
    ]
  }
];

// Combine all templates
export const logoTemplates = [
  ...modernTemplates,
  ...minimalTemplates,
  ...techTemplates,
  ...boldTemplates,
  ...creativeTemplates
];

// Available fonts
export const FONTS = [
  'Inter',
  'Montserrat',
  'Raleway',
  'Poppins',
  'Playfair Display',
  'Dancing Script',
  'Space Grotesk',
  'Arial',
  'Times New Roman',
  'Georgia',
  'Helvetica',
  'Verdana'
];