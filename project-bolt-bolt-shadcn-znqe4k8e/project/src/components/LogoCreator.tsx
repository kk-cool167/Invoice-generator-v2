import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Type, Square, Circle, Triangle, Minus, Trash2, Eye, EyeOff, Move, RotateCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { logoTemplates, FONTS } from '../lib/logoTemplates';
import type { Layer, TextElement, GraphicElement } from '../lib/types';
import { useLanguage } from '@/context/LanguageContext';

interface LogoCreatorProps {
  onSuccess: (logoUrl: string) => void;
  onCancel: () => void;
  className?: string;
}

const createLayerId = () => `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export function LogoCreator({ onSuccess, onCancel, className }: LogoCreatorProps) {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragStateRef = useRef<{
    isDragging: boolean;
    isRotating: boolean;
    startX: number;
    startY: number;
    elementStartX: number;
    elementStartY: number;
    startRotation: number;
    currentElement: Layer;
  } | null>(null);
  
  const [companyName, setCompanyName] = useState('Your Company');
  const [elements, setElements] = useState<Layer[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleTemplateSelect = (templateId: string) => {
    const template = logoTemplates.find(t => t.id === templateId);
    if (template) {
      const clonedElements = JSON.parse(JSON.stringify(template.elements));
      setElements(clonedElements);
      setBackgroundColor(template.backgroundColor);
      setSelectedTemplate(templateId);
    }
  };

  useEffect(() => {
    if (logoTemplates.length > 0) {
      const template = logoTemplates[0];
      setElements(JSON.parse(JSON.stringify(template.elements)));
      setBackgroundColor(template.backgroundColor);
      setSelectedTemplate(template.id);
    }
  }, []);

  const addTextElement = () => {
    const newElement: Layer = {
      id: createLayerId(),
      type: 'text',
      name: 'New Text',
      visible: true,
      locked: false,
      zIndex: elements.length + 1,
      element: {
        type: 'text',
        id: createLayerId(),
        content: 'New Text',
        x: 200,
        y: 150,
        fontSize: 32,
        fontFamily: 'Inter',
        color: '#000000',
        letterSpacing: 0,
        uppercase: false
      }
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const addShapeElement = (type: 'circle' | 'rectangle' | 'triangle' | 'line') => {
    const newElement: Layer = {
      id: createLayerId(),
      type: 'graphic',
      name: `New ${type}`,
      visible: true,
      locked: false,
      zIndex: elements.length + 1,
      element: {
        type,
        x: 200,
        y: 150,
        width: type === 'line' ? 100 : 50,
        height: type === 'line' ? 2 : 50,
        color: '#000000',
        opacity: 1,
        rotation: 0,
        strokeWidth: type === 'line' ? 2 : 0
      }
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const toggleVisibility = (id: string) => {
    setElements(prevElements =>
      prevElements.map(element =>
        element.id === id
          ? { ...element, visible: !element.visible }
          : element
      )
    );
  };

  const deleteElement = (id: string) => {
    setElements(prevElements => prevElements.filter(element => element.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const updateElement = (id: string, properties: Partial<TextElement | GraphicElement>) => {
    setElements(prevElements =>
      prevElements.map(element =>
        element.id === id
          ? {
              ...element,
              element: {
                ...element.element,
                ...properties
              } as TextElement | GraphicElement
            }
          : element
      )
    );
  };
  const updateRotation = (id: string, rotation: number) => {
    setElements(prevElements =>
      prevElements.map(element =>
        element.id === id
          ? {
              ...element,
              element: {
                ...element.element,
                rotation: rotation % 360
              }
            }
          : element
      )
    );
  };

  const updateGradientColors = (id: string, index: number, color: string) => {
    setElements(prevElements =>
      prevElements.map(element => {
        if (element.id === id && element.type === 'graphic') {
          const graphicElement = element.element as GraphicElement;
          if (graphicElement.gradient) {
            const newColors = [...graphicElement.gradient.colors];
            newColors[index] = color;
            return {
              ...element,
              element: {
                ...graphicElement,
                gradient: {
                  ...graphicElement.gradient,
                  colors: newColors
                }
              }
            };
          }
        }
        return element;
      })
    );
  };

  const getCanvasCoordinates = (e: MouseEvent | React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const getElementBounds = (element: Layer): { width: number; height: number } => {
    if (element.type === 'text') {
      const textEl = element.element as TextElement;
      const canvas = canvasRef.current;
      if (!canvas) return { width: 0, height: 0 };
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return { width: 0, height: 0 };

      ctx.font = `${textEl.fontSize}px ${textEl.fontFamily}`;
      const metrics = ctx.measureText(textEl.content.replace('{companyName}', companyName));
      return {
        width: metrics.width,
        height: textEl.fontSize || 32
      };
    } else {
      const graphicEl = element.element as GraphicElement;
      return {
        width: graphicEl.width || 50,
        height: graphicEl.height || 50
      };
    }
  };

  const getRotationHandlePosition = (element: Layer): { x: number; y: number } => {
    const bounds = getElementBounds(element);
    const handleDistance = Math.max(bounds.height / 2, 30);
    const rotation = (element.element as GraphicElement).rotation || 0;
    const radians = (rotation * Math.PI) / 180;
    
    return {
      x: element.element.x + Math.sin(radians) * handleDistance,
      y: element.element.y - Math.cos(radians) * handleDistance
    };
  };

  const isPointInElement = (x: number, y: number, element: Layer): boolean => {
    const el = element.element;
    const hitBox = 20;
    const rotation = (el as GraphicElement).rotation || 0;
    const radians = (rotation * Math.PI) / 180;
    
    // Transform point to element's coordinate system
    const dx = x - el.x;
    const dy = y - el.y;
    const rotatedX = dx * Math.cos(-radians) - dy * Math.sin(-radians);
    const rotatedY = dx * Math.sin(-radians) + dy * Math.cos(-radians);

    if (element.type === 'text') {
      const bounds = getElementBounds(element);
      return (
        rotatedX >= -bounds.width / 2 - hitBox &&
        rotatedX <= bounds.width / 2 + hitBox &&
        rotatedY >= -bounds.height / 2 - hitBox &&
        rotatedY <= bounds.height / 2 + hitBox
      );
    } else {
      const graphicEl = el as GraphicElement;
      const size = graphicEl.width || 50;

      if (graphicEl.type === 'circle') {
        const distance = Math.sqrt(rotatedX * rotatedX + rotatedY * rotatedY);
        return distance <= (size / 2 + hitBox);
      }

      return (
        rotatedX >= -size / 2 - hitBox &&
        rotatedX <= size / 2 + hitBox &&
        rotatedY >= -size / 2 - hitBox &&
        rotatedY <= size / 2 + hitBox
      );
    }
  };

  const isPointInRotationHandle = (x: number, y: number, element: Layer): boolean => {
    const handlePos = getRotationHandlePosition(element);
    const dx = x - handlePos.x;
    const dy = y - handlePos.y;
    return Math.sqrt(dx * dx + dy * dy) <= 10;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);

    const clickedElement = [...elements]
      .reverse()
      .find(element => element.visible && (isPointInElement(coords.x, coords.y, element) || isPointInRotationHandle(coords.x, coords.y, element)));

    if (clickedElement) {
      setSelectedElement(clickedElement.id);

      const isRotating = isPointInRotationHandle(coords.x, coords.y, clickedElement);
      
      dragStateRef.current = {
        isDragging: !isRotating,
        isRotating,
        startX: coords.x,
        startY: coords.y,
        elementStartX: clickedElement.element.x,
        elementStartY: clickedElement.element.y,
        startRotation: (clickedElement.element as GraphicElement).rotation || 0,
        currentElement: clickedElement
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const dragState = dragStateRef.current;
    if (!dragState?.currentElement) return;

    const coords = getCanvasCoordinates(e);
    
    if (dragState.isRotating) {
      const element = dragState.currentElement.element;
      const dx = coords.x - element.x;
      const dy = coords.y - element.y;
      const angle = Math.atan2(dx, -dy) * 180 / Math.PI;
      updateRotation(dragState.currentElement.id, angle);
    } else if (dragState.isDragging) {
      const dx = coords.x - dragState.startX;
      const dy = coords.y - dragState.startY;

      setElements(prevElements => 
        prevElements.map(element =>
          element.id === dragState.currentElement?.id
            ? {
                ...element,
                element: {
                  ...element.element,
                  x: dragState.elementStartX + dx,
                  y: dragState.elementStartY + dy
                }
              }
            : element
        )
      );
    }
  };

  const handleMouseUp = () => {
    dragStateRef.current = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const drawLogoContent = (ctx: CanvasRenderingContext2D, drawSelectionFrames: boolean = false) => {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    elements
      .filter(element => element.visible)
      .sort((a, b) => a.zIndex - b.zIndex)
      .forEach(layer => {
        ctx.save();
        
        if (layer.type === 'text') {
          const textElement = layer.element as TextElement;
          const content = textElement.content.replace('{companyName}', companyName);
          
          ctx.font = `${textElement.fontSize}px ${textElement.fontFamily}`;
          ctx.fillStyle = textElement.color || '#000000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          if (textElement.effects) {
            textElement.effects.forEach(effect => {
              if (effect.type === 'shadow') {
                ctx.shadowColor = effect.settings.shadowColor || '#000000';
                ctx.shadowBlur = effect.settings.shadowBlur || 0;
                ctx.shadowOffsetX = effect.settings.shadowOffsetX || 0;
                ctx.shadowOffsetY = effect.settings.shadowOffsetY || 0;
              }
            });
          }
          
          ctx.translate(textElement.x, textElement.y);
          
          if (textElement.rotation) {
            ctx.rotate((textElement.rotation * Math.PI) / 180);
          }
          
          ctx.fillText(
            textElement.uppercase ? content.toUpperCase() : content,
            0,
            0
          );
        } else {
          const graphicElement = layer.element as GraphicElement;
          
          ctx.translate(graphicElement.x, graphicElement.y);
          
          if (graphicElement.rotation) {
            ctx.rotate((graphicElement.rotation * Math.PI) / 180);
          }
          
          if (graphicElement.gradient) {
            const gradient = ctx.createLinearGradient(-50, -50, 50, 50);
            gradient.addColorStop(0, graphicElement.gradient.colors[0]);
            gradient.addColorStop(1, graphicElement.gradient.colors[1]);
            ctx.fillStyle = gradient;
            ctx.strokeStyle = gradient;
          } else {
            ctx.fillStyle = graphicElement.color || '#000000';
            ctx.strokeStyle = graphicElement.color || '#000000';
          }
          
          ctx.globalAlpha = graphicElement.opacity ?? 1;
          
          const size = graphicElement.width || 50;
          ctx.beginPath();
          
          switch (graphicElement.type) {
            case 'circle':
              ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
              break;
            case 'rectangle':
              ctx.rect(-size / 2, -size / 2, size, size);
              break;
            case 'triangle':
              ctx.moveTo(0, -size / 2);
              ctx.lineTo(size / 2, size / 2);
              ctx.lineTo(-size / 2, size / 2);
              ctx.closePath();
              break;
            case 'line':
              const width = graphicElement.width || 100;
              const height = graphicElement.height || 2;
              ctx.lineWidth = height;
              ctx.moveTo(-width / 2, 0);
              ctx.lineTo(width / 2, 0);
              break;
          }
          
          if (graphicElement.type === 'line') {
            ctx.stroke();
          } else {
            ctx.fill();
            if (graphicElement.strokeWidth) {
              ctx.lineWidth = graphicElement.strokeWidth;
              ctx.stroke();
            }
          }
        }
        
        ctx.restore();

        // Draw rotation handle for selected element
        if (drawSelectionFrames && selectedElement === layer.id) {
          ctx.save();
          const handlePos = getRotationHandlePosition(layer);
          
          // Draw handle line
          ctx.beginPath();
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 2;
          ctx.moveTo(layer.element.x, layer.element.y);
          ctx.lineTo(handlePos.x, handlePos.y);
          ctx.stroke();

          // Draw handle circle
          ctx.beginPath();
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 2;
          ctx.arc(handlePos.x, handlePos.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          ctx.restore();
        }
      });

    if (drawSelectionFrames && selectedElement) {
      const element = elements.find(e => e.id === selectedElement);
      if (element) {
        ctx.save();
        
        const bounds = getElementBounds(element);
        const rotation = (element.element as GraphicElement).rotation || 0;
        
        ctx.translate(element.element.x, element.element.y);
        ctx.rotate((rotation * Math.PI) / 180);
        
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        if (element.type === 'text') {
          ctx.strokeRect(
            -bounds.width / 2 - 5,
            -bounds.height / 2 - 5,
            bounds.width + 10,
            bounds.height + 10
          );
        } else {
          const graphicElement = element.element as GraphicElement;
          if (graphicElement.type === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, (bounds.width / 2) + 5, 0, Math.PI * 2);
            ctx.stroke();
          } else if (graphicElement.type === 'line') {
            ctx.strokeRect(
              -bounds.width / 2 - 5,
              -bounds.height / 2 - 5,
              bounds.width + 10,
              bounds.height + 10
            );
          } else {
            ctx.strokeRect(
              -bounds.width / 2 - 5,
              -bounds.height / 2 - 5,
              bounds.width + 10,
              bounds.height + 10
            );
          }
        }
        
        ctx.restore();
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawLogoContent(ctx, true);
  }, [elements, backgroundColor, companyName, selectedElement]);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const saveCanvas = document.createElement('canvas');
    saveCanvas.width = canvas.width;
    saveCanvas.height = canvas.height;
    const ctx = saveCanvas.getContext('2d');
    
    if (ctx) {
      drawLogoContent(ctx, false);
      onSuccess(saveCanvas.toDataURL('image/png'));
    }
  };

  const getSelectedElement = () => {
    if (!selectedElement) return null;
    return elements.find(e => e.id === selectedElement);
  };

  return (
    <div className={cn("grid grid-cols-[300px,1fr] gap-6", className)}>
      <div className="space-y-6 border-r pr-6">
        <div className="space-y-2">
          <Label>Template</Label>
          <Select
            value={selectedTemplate}
            onValueChange={handleTemplateSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('logo.selectTemplate')} />
            </SelectTrigger>
            <SelectContent>
              {logoTemplates.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Company Name</Label>
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder={t('logo.enterCompanyName')}
          />
        </div>

        <div className="space-y-2">
          <Label>Add Elements</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={addTextElement}
              className="flex-1"
            >
              <Type className="w-4 h-4 mr-2" />
              Text
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addShapeElement('rectangle')}
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addShapeElement('circle')}
            >
              <Circle className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addShapeElement('triangle')}
            >
              <Triangle className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addShapeElement('line')}
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Elements</Label>
          <ScrollArea className="h-[200px] border rounded-md p-2">
            {elements.map((element) => (
              <div
                key={element.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded cursor-pointer",
                  selectedElement === element.id && "bg-primary/10"
                )}
                onClick={() => setSelectedElement(element.id)}
              >
                {element.type === 'text' ? (
                  <Type className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span className="flex-1 text-sm truncate">{element.name}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisibility(element.id);
                  }}
                >
                  {element.visible ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteElement(element.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </ScrollArea>
        </div>

        {selectedElement && (
          <div className="space-y-4">
            <Label>Properties</Label>
            {getSelectedElement()?.type === 'text' ? (
              <>
                <div className="space-y-2">
                  <Label>Text</Label>
                  <Input
                    value={(getSelectedElement()?.element as TextElement)?.content || ''}
                    onChange={(e) => updateElement(selectedElement, { content: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Font</Label>
                  <Select
                    value={(getSelectedElement()?.element as TextElement)?.fontFamily || 'Inter'}
                    onValueChange={(value) => updateElement(selectedElement, { fontFamily: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('logo.selectFont')} />
                    </SelectTrigger>
                    <SelectContent>
                      {FONTS.map(font => (
                        <SelectItem key={font} value={font}>{font}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Slider
                    value={[(getSelectedElement()?.element as TextElement)?.fontSize || 32]}
                    onValueChange={([value]) => updateElement(selectedElement, { fontSize: value })}
                    min={8}
                    max={120}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={(getSelectedElement()?.element as TextElement)?.color || '#000000'}
                      onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                      className="w-20"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {(() => {
                  const element = getSelectedElement()?.element as GraphicElement;
                  const hasGradient = element?.gradient !== undefined;

                  return (
                    <>
                      <div className="space-y-2">
                        <Label>Fill Type</Label>
                        <Select
                          value={hasGradient ? 'gradient' : 'solid'}
                          onValueChange={(value) => {
                            if (value === 'gradient') {
                              updateElement(selectedElement, {
                                gradient: {
                                  colors: ['#000000', '#ffffff'],
                                  angle: 45
                                }
                              });
                            } else {
                              const { gradient, ...rest } = element;
                              updateElement(selectedElement, rest);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('logo.selectFillType')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="solid">Solid Color</SelectItem>
                            <SelectItem value="gradient">Gradient</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {hasGradient ? (
                        <div className="space-y-2">
                          <Label>Gradient Colors</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={element.gradient?.colors[0] || '#000000'}
                              onChange={(e) => updateGradientColors(selectedElement, 0, e.target.value)}
                              className="w-20"
                            />
                            <Input
                              type="color"
                              value={element.gradient?.colors[1] || '#ffffff'}
                              onChange={(e) => updateGradientColors(selectedElement, 1, e.target.value)}
                              className="w-20"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>Color</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={element?.color || '#000000'}
                              onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                              className="w-20"
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Size</Label>
                        <Slider
                          value={[element?.width || 50]}
                          onValueChange={([value]) => updateElement(selectedElement, { 
                            width: value,
                            height: element.type === 'line' ? element.height : value 
                          })}
                          min={10}
                          max={200}
                          step={1}
                        />
                      </div>

                      {element?.type === 'line' && (
                        <div className="space-y-2">
                          <Label>Line Thickness</Label>
                          <Slider
                            value={[element?.height || 2]}
                            onValueChange={([value]) => updateElement(selectedElement, { height: value })}
                            min={1}
                            max={20}
                            step={1}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Rotation</Label>
                        <div className="flex gap-2">
                          <Slider
                            value={[element?.rotation || 0]}
                            onValueChange={([value]) => updateRotation(selectedElement, value)}
                            min={0}
                            max={360}
                            step={1}
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateRotation(selectedElement, 0)}
                            className="shrink-0"
                          >
                            <RotateCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Opacity</Label>
                        <Slider
                          value={[element?.opacity || 1]}
                          onValueChange={([value]) => updateElement(selectedElement, { opacity: value })}
                          min={0}
                          max={1}
                          step={0.1}
                        />
                      </div>
                    </>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Preview</Label>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Logo
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Background</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-20"
              />
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center border rounded-lg p-4 bg-gray-50">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Move className="w-6 h-6 text-gray-400" />
          </div>
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            style={{
              width: `${400}px`,
              height: `${400}px`,
              cursor: dragStateRef.current?.isDragging ? 'grabbing' : 'grab'
            }}
            className="bg-white shadow-sm"
            onMouseDown={handleMouseDown}
          />
        </div>
      </div>
    </div>
  );
}