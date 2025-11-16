import React from 'react';

// ErrorBoundary removed for now — provide a transparent wrapper so imports remain valid.
export const ErrorBoundary: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return <>{children}</>;
};

export default ErrorBoundary;
