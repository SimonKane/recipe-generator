import * as React from "react";
import { cn } from "@/lib/utils";

type SelectContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

export const Select = ({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}) => <SelectContext.Provider value={{ value, onValueChange }}>{children}</SelectContext.Provider>;

export const SelectTrigger = ({ children }: React.HTMLAttributes<HTMLDivElement>) => <>{children}</>;

export const SelectValue = (_props: { placeholder?: string }) => null;

export const SelectContent = ({ children }: { children: React.ReactNode }) => {
  const context = React.useContext(SelectContext);
  const items = React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((child) => child as React.ReactElement<{ value: string; children: React.ReactNode }>);

  return (
    <select
      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      value={context?.value}
      onChange={(event) => context?.onValueChange(event.target.value)}
    >
      {items.map((item) => (
        <option key={item.props.value} value={item.props.value}>
          {item.props.children}
        </option>
      ))}
    </select>
  );
};

export const SelectItem = (_props: { value: string; children: React.ReactNode }) => null;
