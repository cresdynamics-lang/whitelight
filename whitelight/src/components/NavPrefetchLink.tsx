import { Link, type LinkProps } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchCatalog } from "@/hooks/useCatalog";

type NavPrefetchLinkProps = LinkProps & React.RefAttributes<HTMLAnchorElement>;

/** Prefetch catalog + route chunk on hover for instant category navigation */
export function NavPrefetchLink({ onMouseEnter, onFocus, to, ...props }: NavPrefetchLinkProps) {
  const queryClient = useQueryClient();

  const prefetch = () => {
    void prefetchCatalog(queryClient);
  };

  return (
    <Link
      to={to}
      onMouseEnter={(e) => {
        prefetch();
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        prefetch();
        onFocus?.(e);
      }}
      {...props}
    />
  );
}
