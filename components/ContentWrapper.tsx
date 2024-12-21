type ContentWrapperProps = {
  children: React.ReactNode;
  disableContainer?: boolean;
};

export default function ContentWrapper({ children, disableContainer = false }: ContentWrapperProps) {
  if (disableContainer) {
    return <div className="text-center">{children}</div>;
  }
  
  return <div className="container mx-auto px-4">{children}</div>;
} 