import { useState, useCallback } from 'react';

export const usePortAllocation = (initialPorts: number[] = []) => {
  const [ports, setPorts] = useState<number[]>(initialPorts);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Parse a port range string (e.g., "25565-25570") into an array of numbers
  const parsePortRange = useCallback((range: string): number[] => {
    const ports: number[] = [];
    
    // Handle single port
    if (/^\d+$/.test(range)) {
      const port = parseInt(range, 10);
      if (port >= 1024 && port <= 65535) {
        return [port];
      } else {
        throw new Error('Port must be between 1024 and 65535');
      }
    }
    
    // Handle port range
    const [startStr, endStr] = range.split('-').map(s => s.trim());
    if (!startStr || !endStr) {
      throw new Error('Invalid port range format. Use "start-end" or a single port number.');
    }
    
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);
    
    if (isNaN(start) || isNaN(end)) {
      throw new Error('Port numbers must be valid integers');
    }
    
    if (start < 1024 || end > 65535) {
      throw new Error('Ports must be between 1024 and 65535');
    }
    
    if (start > end) {
      throw new Error('Start port must be less than or equal to end port');
    }
    
    // Generate all ports in the range
    for (let i = start; i <= end; i++) {
      ports.push(i);
    }
    
    return ports;
  }, []);

  const addPorts = useCallback((newPorts: string | number[]) => {
    try {
      setError(null);
      
      let portsToAdd: number[] = [];
      
      if (typeof newPorts === 'string') {
        // Handle comma-separated list or ranges
        const portStrings = newPorts.split(',').map(s => s.trim()).filter(Boolean);
        
        for (const portStr of portStrings) {
          if (portStr.includes('-')) {
            // Handle ranges
            const rangePorts = parsePortRange(portStr);
            portsToAdd = [...portsToAdd, ...rangePorts];
          } else {
            // Handle single port
            const port = parseInt(portStr, 10);
            if (isNaN(port)) {
              throw new Error(`Invalid port number: ${portStr}`);
            }
            portsToAdd.push(port);
          }
        }
      } else if (Array.isArray(newPorts)) {
        // Direct array of numbers
        portsToAdd = newPorts;
      }
      
      // Validate all ports
      const invalidPorts = portsToAdd.filter(port => 
        isNaN(port) || port < 1024 || port > 65535
      );
      
      if (invalidPorts.length > 0) {
        throw new Error(`Invalid port numbers: ${invalidPorts.join(', ')}. Ports must be between 1024 and 65535.`);
      }
      
      // Add new ports, removing duplicates
      setPorts(prev => {
        const portSet = new Set([...prev, ...portsToAdd]);
        return Array.from(portSet).sort((a, b) => a - b);
      });
      
      // Clear input
      setInputValue('');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid port input');
      return false;
    }
  }, [parsePortRange]);

  const removePort = useCallback((portToRemove: number) => {
    setPorts(prev => prev.filter(port => port !== portToRemove));
  }, []);

  const clearPorts = useCallback(() => {
    setPorts([]);
  }, []);

  return {
    ports,
    inputValue,
    setInputValue,
    error,
    addPorts,
    removePort,
    clearPorts,
  };
};

export default usePortAllocation;
