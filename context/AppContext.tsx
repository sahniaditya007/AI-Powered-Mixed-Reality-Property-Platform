import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PROPERTIES, Property, Issue } from '../data/properties';

interface AppContextType {
  properties: Property[];
  assignVendor: (propertyId: string, issueId: string, vendorName: string) => void;
  addIssue: (propertyId: string, issue: Issue) => void;
  getPropertyById: (id: string) => Property | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(PROPERTIES);

  const assignVendor = (propertyId: string, issueId: string, vendorName: string) => {
    setProperties(prev =>
      prev.map(p => {
        if (p.id !== propertyId) return p;
        const updatedIssues = p.issues.map(i =>
          i.id === issueId ? { ...i, vendorAssigned: true, vendorName } : i
        );
        const newActivity = {
          id: `a_${Date.now()}`,
          event: `Vendor "${vendorName}" assigned for ${updatedIssues.find(i => i.id === issueId)?.type}`,
          time: 'Just now',
          type: 'maintenance' as const,
        };
        return {
          ...p,
          issues: updatedIssues,
          activity: [newActivity, ...p.activity],
          status: updatedIssues.every(i => i.vendorAssigned) ? 'warning' : p.status,
        };
      })
    );
  };

  const addIssue = (propertyId: string, issue: Issue) => {
    setProperties(prev =>
      prev.map(p => {
        if (p.id !== propertyId) return p;
        const newActivity = {
          id: `a_${Date.now()}`,
          event: `AR scan: ${issue.type} detected in ${issue.location}`,
          time: 'Just now',
          type: 'issue' as const,
        };
        return {
          ...p,
          issues: [issue, ...p.issues],
          activity: [newActivity, ...p.activity],
          status: issue.severity === 'High' || issue.severity === 'Critical' ? 'alert' : 'warning',
        };
      })
    );
  };

  const getPropertyById = (id: string) => properties.find(p => p.id === id);

  return (
    <AppContext.Provider value={{ properties, assignVendor, addIssue, getPropertyById }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
