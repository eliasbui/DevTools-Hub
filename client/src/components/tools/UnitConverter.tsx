import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/common/CopyButton';
import { Calculator, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UnitCategory {
  name: string;
  units: { [key: string]: { name: string; factor: number } };
}

const unitCategories: { [key: string]: UnitCategory } = {
  length: {
    name: 'Length',
    units: {
      px: { name: 'Pixels', factor: 1 },
      rem: { name: 'REM', factor: 16 },
      em: { name: 'EM', factor: 16 },
      pt: { name: 'Points', factor: 0.75 },
      pc: { name: 'Picas', factor: 0.0625 },
      in: { name: 'Inches', factor: 0.010416667 },
      cm: { name: 'Centimeters', factor: 0.026458333 },
      mm: { name: 'Millimeters', factor: 0.264583333 },
      vw: { name: 'Viewport Width %', factor: 0.052083333 },
      vh: { name: 'Viewport Height %', factor: 0.092592593 },
    }
  },
  temperature: {
    name: 'Temperature',
    units: {
      celsius: { name: 'Celsius', factor: 1 },
      fahrenheit: { name: 'Fahrenheit', factor: 1.8 },
      kelvin: { name: 'Kelvin', factor: 1 },
    }
  },
  weight: {
    name: 'Weight',
    units: {
      kg: { name: 'Kilograms', factor: 1 },
      g: { name: 'Grams', factor: 1000 },
      mg: { name: 'Milligrams', factor: 1000000 },
      lb: { name: 'Pounds', factor: 2.20462 },
      oz: { name: 'Ounces', factor: 35.274 },
      ton: { name: 'Metric Tons', factor: 0.001 },
    }
  },
  volume: {
    name: 'Volume',
    units: {
      l: { name: 'Liters', factor: 1 },
      ml: { name: 'Milliliters', factor: 1000 },
      gal: { name: 'Gallons (US)', factor: 0.264172 },
      qt: { name: 'Quarts (US)', factor: 1.05669 },
      pt: { name: 'Pints (US)', factor: 2.11338 },
      cup: { name: 'Cups (US)', factor: 4.22675 },
      floz: { name: 'Fluid Ounces (US)', factor: 33.814 },
      tbsp: { name: 'Tablespoons', factor: 67.628 },
      tsp: { name: 'Teaspoons', factor: 202.884 },
    }
  },
  data: {
    name: 'Data Storage',
    units: {
      bit: { name: 'Bits', factor: 8388608 },
      byte: { name: 'Bytes', factor: 1048576 },
      kb: { name: 'Kilobytes', factor: 1024 },
      mb: { name: 'Megabytes', factor: 1 },
      gb: { name: 'Gigabytes', factor: 0.0009765625 },
      tb: { name: 'Terabytes', factor: 0.00000095367432 },
      pb: { name: 'Petabytes', factor: 0.00000000093132257 },
    }
  },
  time: {
    name: 'Time',
    units: {
      ms: { name: 'Milliseconds', factor: 86400000 },
      s: { name: 'Seconds', factor: 86400 },
      min: { name: 'Minutes', factor: 1440 },
      h: { name: 'Hours', factor: 24 },
      d: { name: 'Days', factor: 1 },
      wk: { name: 'Weeks', factor: 0.142857 },
      mo: { name: 'Months', factor: 0.0328767 },
      yr: { name: 'Years', factor: 0.00273973 },
    }
  },
  area: {
    name: 'Area',
    units: {
      sqm: { name: 'Square Meters', factor: 1 },
      sqft: { name: 'Square Feet', factor: 10.7639 },
      sqin: { name: 'Square Inches', factor: 1550 },
      sqkm: { name: 'Square Kilometers', factor: 0.000001 },
      sqmi: { name: 'Square Miles', factor: 0.00000038610216 },
      acre: { name: 'Acres', factor: 0.000247105 },
      hectare: { name: 'Hectares', factor: 0.0001 },
    }
  },
  speed: {
    name: 'Speed',
    units: {
      mps: { name: 'Meters/Second', factor: 1 },
      kmh: { name: 'Kilometers/Hour', factor: 3.6 },
      mph: { name: 'Miles/Hour', factor: 2.23694 },
      knot: { name: 'Knots', factor: 1.94384 },
      fps: { name: 'Feet/Second', factor: 3.28084 },
    }
  }
};

export function UnitConverter() {
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('px');
  const [toUnit, setToUnit] = useState('rem');
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    const units = Object.keys(unitCategories[newCategory].units);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
    setFromValue('');
    setToValue('');
  };

  const handleFromUnitChange = (unit: string) => {
    setFromUnit(unit);
    if (fromValue) {
      convertValue(fromValue, unit, toUnit);
    }
  };

  const handleToUnitChange = (unit: string) => {
    setToUnit(unit);
    if (fromValue) {
      convertValue(fromValue, fromUnit, unit);
    }
  };

  const handleFromValueChange = (value: string) => {
    setFromValue(value);
    if (value && !isNaN(parseFloat(value))) {
      convertValue(value, fromUnit, toUnit);
    } else {
      setToValue('');
    }
  };

  const convertValue = (value: string, from: string, to: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setToValue('');
      return;
    }

    let result: number;

    if (category === 'temperature') {
      // Special handling for temperature conversions
      if (from === 'celsius') {
        if (to === 'fahrenheit') result = (numValue * 9/5) + 32;
        else if (to === 'kelvin') result = numValue + 273.15;
        else result = numValue;
      } else if (from === 'fahrenheit') {
        if (to === 'celsius') result = (numValue - 32) * 5/9;
        else if (to === 'kelvin') result = ((numValue - 32) * 5/9) + 273.15;
        else result = numValue;
      } else if (from === 'kelvin') {
        if (to === 'celsius') result = numValue - 273.15;
        else if (to === 'fahrenheit') result = ((numValue - 273.15) * 9/5) + 32;
        else result = numValue;
      } else {
        result = numValue;
      }
    } else {
      // Standard conversion for other units
      const categoryData = unitCategories[category];
      const fromFactor = categoryData.units[from].factor;
      const toFactor = categoryData.units[to].factor;
      
      // Convert to base unit then to target unit
      result = (numValue / fromFactor) * toFactor;
    }

    // Format result to avoid floating point issues
    const decimals = result < 1 ? 6 : result < 10 ? 4 : result < 100 ? 3 : 2;
    setToValue(parseFloat(result.toFixed(decimals)).toString());
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromValue(toValue);
    setToValue(fromValue);
  };

  const currentCategory = unitCategories[category];
  const unitOptions = Object.entries(currentCategory.units);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Calculator className="w-5 h-5" />
            </motion.div>
            <span>Unit Converter</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(unitCategories).map(([key, cat]) => (
                  <SelectItem key={key} value={key}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conversion Interface */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
            {/* From Unit */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From</label>
                <Select value={fromUnit} onValueChange={handleFromUnitChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map(([key, unit]) => (
                      <SelectItem key={key} value={key}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="number"
                value={fromValue}
                onChange={(e) => handleFromValueChange(e.target.value)}
                placeholder="Enter value"
                className="font-mono smooth-transition focus:scale-105"
              />
            </div>

            {/* Swap Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={swapUnits}
              className="animate-pulse-hover mb-4"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </Button>

            {/* To Unit */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <Select value={toUnit} onValueChange={handleToUnitChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map(([key, unit]) => (
                      <SelectItem key={key} value={key}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <Input
                  type="text"
                  value={toValue}
                  readOnly
                  placeholder="Result"
                  className="font-mono bg-muted pr-10"
                />
                <AnimatePresence>
                  {toValue && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      <CopyButton text={toValue} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Quick Conversions */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Common Conversions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {category === 'length' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => { setFromUnit('px'); setToUnit('rem'); setFromValue('16'); }} className="animate-pulse-hover">16px → rem</Button>
                  <Button variant="outline" size="sm" onClick={() => { setFromUnit('rem'); setToUnit('px'); setFromValue('1'); }} className="animate-pulse-hover">1rem → px</Button>
                  <Button variant="outline" size="sm" onClick={() => { setFromUnit('px'); setToUnit('vw'); setFromValue('1920'); }} className="animate-pulse-hover">1920px → vw</Button>
                </>
              )}
              {category === 'temperature' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => { setFromUnit('celsius'); setToUnit('fahrenheit'); setFromValue('0'); }} className="animate-pulse-hover">0°C → °F</Button>
                  <Button variant="outline" size="sm" onClick={() => { setFromUnit('celsius'); setToUnit('fahrenheit'); setFromValue('100'); }} className="animate-pulse-hover">100°C → °F</Button>
                  <Button variant="outline" size="sm" onClick={() => { setFromUnit('fahrenheit'); setToUnit('celsius'); setFromValue('98.6'); }} className="animate-pulse-hover">98.6°F → °C</Button>
                </>
              )}
              {category === 'data' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => { setFromUnit('mb'); setToUnit('gb'); setFromValue('1024'); }} className="animate-pulse-hover">1024MB → GB</Button>
                  <Button variant="outline" size="sm" onClick={() => { setFromUnit('gb'); setToUnit('tb'); setFromValue('1'); }} className="animate-pulse-hover">1GB → TB</Button>
                  <Button variant="outline" size="sm" onClick={() => { setFromUnit('byte'); setToUnit('kb'); setFromValue('1024'); }} className="animate-pulse-hover">1024B → KB</Button>
                </>
              )}
            </div>
          </div>

          {/* Conversion Formula */}
          <AnimatePresence>
            {fromValue && toValue && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-muted rounded-lg"
              >
                <p className="text-sm font-mono">
                  {fromValue} {currentCategory.units[fromUnit].name} = {toValue} {currentCategory.units[toUnit].name}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}